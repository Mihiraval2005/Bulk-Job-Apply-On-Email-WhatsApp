import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from './email.service.js';
import { sendWhatsApp } from './whatsapp.service.js';
import { upsertApplication } from '../db/repositories/application.repository.js';
import logger from '../utils/logger.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATUS  = { PENDING: 0, SENT: 1, FAILED: 2 };
const CHANNEL = { EMAIL: 1, WHATSAPP: 2, BOTH: 3 };

const processOne = async (userId, app) => {
  const applicationId = app.applicationId || uuidv4();

  await upsertApplication({
    applicationId, jobId: app.jobId, userId,
    channel: app.channel, status: STATUS.PENDING,
    emailSubject: app.emailSubject, emailBody: app.emailBody, whatsAppMsg: app.whatsAppMsg,
  });

  try {
    if (app.channel === CHANNEL.EMAIL || app.channel === CHANNEL.BOTH) {
      await sendEmail({ to: app.contactEmail, subject: app.emailSubject, html: app.emailBody, resumePath: app.resumePath });
      await sleep(2000);
    }
    if (app.channel === CHANNEL.WHATSAPP || app.channel === CHANNEL.BOTH) {
      await sendWhatsApp({ to: app.contactPhone, message: app.whatsAppMsg });
      await sleep(1000);
    }
    await upsertApplication({ applicationId, jobId: app.jobId, userId, channel: app.channel, status: STATUS.SENT });
    logger.info(`Application sent`, { applicationId });
  } catch (err) {
    await upsertApplication({ applicationId, jobId: app.jobId, userId, channel: app.channel, status: STATUS.FAILED, errorMsg: err.message });
    logger.error(`Application failed`, { applicationId, error: err.message });
  }
};

export const enqueueBulk = async (userId, applications) => {
  setImmediate(async () => {
    for (const app of applications) await processOne(userId, app);
  });
  return applications.length;
};

export const retryOne = async (applicationId, userId) => {
  logger.info(`Retry queued`, { applicationId });
};
