import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEmail } from './email.service.js';
import { sendWhatsApp } from './whatsapp.service.js';
import { upsertApplication, getApplicationById } from '../db/repositories/application.repository.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATUS  = { PENDING: 0, SENT: 1, FAILED: 2 };
const CHANNEL = { EMAIL: 1, WHATSAPP: 2, BOTH: 3 };

export const processOne = async (userId, app) => {
  const applicationId = app.applicationId || uuidv4();
  const normalizedApp = {
    ...app,
    jobId: app.jobId || app.JobId || app.jobID || app.jobid || app.id,
    channel: app.channel ?? app.Channel ?? app.channelId,
    contactEmail: app.contactEmail || app.ContactEmail || app.contactemail || '',
    contactPhone: app.contactPhone || app.ContactPhone || app.contactphone || '',
    emailSubject: app.emailSubject || app.EmailSubject || app.emailsubject || '',
    emailBody: app.emailBody || app.EmailBody || app.emailbody || '',
    whatsAppMsg: app.whatsAppMsg || app.WhatsAppMsg || app.whatsappMsg || app.whatsappmsg || '',
    resumePath: app.resumePath || app.ResumePath || app.resume_path || null,
    retryCount: app.retryCount ?? app.RetryCount ?? app.retrycount ?? 0,
  };

  if (!normalizedApp.jobId) {
    logger.error('jobId is missing', { app });
    return;
  }

  const resumeLink  = normalizedApp.resumePath
    ? `http://localhost:5000${normalizedApp.resumePath}`
    : 'Resume not uploaded';

  const whatsAppMsg = (normalizedApp.whatsAppMsg || '').replace(/\{\{resumeLink\}\}/g, resumeLink);
  const emailBody   = (normalizedApp.emailBody   || '').replace(/\{\{resumeLink\}\}/g, resumeLink);

  const absoluteResumePath = normalizedApp.resumePath
    ? path.join(__dirname, '../../uploads', path.basename(normalizedApp.resumePath))
    : null;

  await upsertApplication({
    applicationId, jobId: normalizedApp.jobId, userId,
    channel: normalizedApp.channel, status: STATUS.PENDING,
    contactEmail: normalizedApp.contactEmail,
    contactPhone: normalizedApp.contactPhone,
    emailSubject: normalizedApp.emailSubject, emailBody, whatsAppMsg,
    retryCount: normalizedApp.retryCount,
  });

  try {
    if (normalizedApp.channel === CHANNEL.EMAIL || normalizedApp.channel === CHANNEL.BOTH) {
      if (!normalizedApp.contactEmail) {
        throw new Error('Missing contactEmail for email application');
      }

      await sendEmail({
        to: normalizedApp.contactEmail,
        subject: normalizedApp.emailSubject,
        html: emailBody,
        resumePath: absoluteResumePath,
      });
      await sleep(2000);
    }

    if (normalizedApp.channel === CHANNEL.WHATSAPP || normalizedApp.channel === CHANNEL.BOTH) {
      if (!normalizedApp.contactPhone) {
        throw new Error('Missing contactPhone for WhatsApp application');
      }

      await sendWhatsApp({ to: normalizedApp.contactPhone, message: whatsAppMsg });
      await sleep(1000);
    }

    await upsertApplication({
      applicationId, jobId: normalizedApp.jobId, userId,
      channel: normalizedApp.channel, status: STATUS.SENT,
      contactEmail: normalizedApp.contactEmail,
      contactPhone: normalizedApp.contactPhone,
      emailSubject: normalizedApp.emailSubject, emailBody, whatsAppMsg,
      sentAt: new Date(),
      retryCount: normalizedApp.retryCount,
    });
    logger.info(`Application sent`, { applicationId });

  } catch (err) {
    await upsertApplication({
      applicationId, jobId: normalizedApp.jobId, userId,
      channel: normalizedApp.channel, status: STATUS.FAILED,
      contactEmail: normalizedApp.contactEmail,
      contactPhone: normalizedApp.contactPhone,
      emailSubject: normalizedApp.emailSubject, emailBody, whatsAppMsg,
      errorMsg: err.message,
      retryCount: normalizedApp.retryCount,
    });
    logger.error(`Application failed`, { applicationId, error: err.message });
  }
};

export const enqueueBulk = async (userId, applications) => {
  setImmediate(async () => {
    for (const app of applications) {
      try {
        await processOne(userId, app);
      } catch (err) {
        logger.error('processOne failed', { error: err.message });
      }
    }
  });
  return applications.length;
};

export const retryOne = async (applicationId, userId) => {
  if (!applicationId) {
    logger.error('Retry requested with missing applicationId');
    return;
  }

  const app = await getApplicationById(applicationId, userId);
  if (!app) {
    logger.error('Application not found for retry', { applicationId });
    return;
  }

  logger.info(`Retrying`, { applicationId });

  setImmediate(async () => {
    try {
      await processOne(userId, {
        applicationId,
        jobId:        app.jobid || app.JobId || app.jobId || app.id,
        channel:      app.channel ?? app.Channel,
        contactEmail: app.contactemail || app.ContactEmail || app.contactEmail || '',
        contactPhone: app.contactphone || app.ContactPhone || app.contactPhone || '',
        emailSubject: app.emailsubject || app.EmailSubject || app.emailSubject || '',
        emailBody:    app.emailbody || app.EmailBody || app.emailBody || '',
        whatsAppMsg:  app.whatsappmsg || app.WhatsAppMsg || app.whatsAppMsg || '',
        resumePath:   null,
        retryCount:   (app.retrycount ?? app.RetryCount ?? app.retryCount ?? 0) + 1,
      });
    } catch (err) {
      logger.error('Retry failed', { applicationId, error: err.message });
    }
  });
};