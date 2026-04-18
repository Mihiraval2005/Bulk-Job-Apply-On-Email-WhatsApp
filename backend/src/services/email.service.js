import nodemailer from 'nodemailer';
import fs from 'fs';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, html, resumePath }) => {
   console.log('=== RESUME PATH ===', resumePath);
  console.log('=== FILE EXISTS ===', resumePath ? fs.existsSync(resumePath) : false);
  const mailer = getTransporter();
  const info = await mailer.sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments: resumePath && fs.existsSync(resumePath)
      ? [{ filename: 'Resume.pdf', path: resumePath }]
      : [],
  });
  logger.info(`Email sent to ${to}`, { messageId: info.messageId });
  return info;
};
