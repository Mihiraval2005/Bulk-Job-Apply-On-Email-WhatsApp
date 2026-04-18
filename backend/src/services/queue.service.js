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

  if (!app.jobId) {
    logger.error('jobId is missing', { app });
    return;
  }

  const resumeLink  = app.resumePath
    ? `http://localhost:5000${app.resumePath}`
    : 'Resume not uploaded';

  const whatsAppMsg = (app.whatsAppMsg || '').replace(/\{\{resumeLink\}\}/g, resumeLink);
  const emailBody   = (app.emailBody   || '').replace(/\{\{resumeLink\}\}/g, resumeLink);

  const absoluteResumePath = app.resumePath
    ? path.join(__dirname, '../../uploads', path.basename(app.resumePath))
    : null;

  await upsertApplication({
    applicationId, jobId: app.jobId, userId,
    channel: app.channel, status: STATUS.PENDING,
    emailSubject: app.emailSubject, emailBody, whatsAppMsg,
  });

  try {
    if (app.channel === CHANNEL.EMAIL || app.channel === CHANNEL.BOTH) {
      await sendEmail({
        to: app.contactEmail,
        subject: app.emailSubject,
        html: emailBody,
        resumePath: absoluteResumePath,
      });
      await sleep(2000);
    }

    if (app.channel === CHANNEL.WHATSAPP || app.channel === CHANNEL.BOTH) {
      await sendWhatsApp({ to: app.contactPhone, message: whatsAppMsg });
      await sleep(1000);
    }

    await upsertApplication({
      applicationId, jobId: app.jobId, userId,
      channel: app.channel, status: STATUS.SENT,
      emailSubject: app.emailSubject, emailBody, whatsAppMsg,
    });
    logger.info(`Application sent`, { applicationId });

  } catch (err) {
    await upsertApplication({
      applicationId, jobId: app.jobId, userId,
      channel: app.channel, status: STATUS.FAILED,
      emailSubject: app.emailSubject, emailBody, whatsAppMsg,
      errorMsg: err.message,
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
        jobId:        app.JobId        || app.jobId,
        channel:      app.Channel      || app.channel,
        contactEmail: app.ContactEmail || app.contactEmail || '',
        contactPhone: app.ContactPhone || app.contactPhone || '',
        emailSubject: app.EmailSubject || app.emailSubject,
        emailBody:    app.EmailBody    || app.emailBody,
        whatsAppMsg:  app.WhatsAppMsg  || app.whatsAppMsg,
        resumePath:   null,
      });
    } catch (err) {
      logger.error('Retry failed', { applicationId, error: err.message });
    }
  });
};