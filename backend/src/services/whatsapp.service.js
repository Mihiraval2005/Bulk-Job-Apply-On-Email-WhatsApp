import twilio from 'twilio';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let client = null;
const getClient = () => {
  if (client) return client;
  client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return client;
};

export const sendWhatsApp = async ({ to, message }) => {
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:+${to.replace(/\D/g, '')}`;
  const msg = await getClient().messages.create({
    from: env.TWILIO_WA_FROM,
    to: formattedTo,
    body: message,
  });
  logger.info(`WhatsApp sent to ${to}`, { sid: msg.sid });
  return msg;
};
