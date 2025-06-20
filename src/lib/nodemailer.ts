import { getSettings } from '@/server/settings/setting-services';
import httpStatus from 'http-status';
import nodemailer from 'nodemailer';

import APIError from './api-error';

interface MailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  senderName: string;
  senderEmail: string;
}

async function getMailConfigFromDB(): Promise<MailConfig> {
  try {
    const config = await getSettings('mail');

    if (!config) {
      throw new APIError(
        'No active mail configuration found in database',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      host: config.smtpHost || '',
      port: parseInt(config.smtpPort || '0', 10),
      username: config.smtpUser || '',
      password: config.smtpPass || '',
      senderName: config.senderName || '',
      senderEmail: config.senderEmail || '',
    };
  } catch (error) {
    console.error('Failed to fetch mail configuration:', error);
    throw new APIError('Error retrieving mail configuration', httpStatus.INTERNAL_SERVER_ERROR);
  }
}

function validateMailConfig(config: MailConfig): void {
  const requiredFields: (keyof MailConfig)[] = [
    'host',
    'port',
    'username',
    'password',
    'senderName',
    'senderEmail',
  ];

  const missingFields = requiredFields.filter((field) => !config[field]);
  if (missingFields.length > 0) {
    throw new APIError(
      `Invalid mail configuration - missing: ${missingFields.join(', ')}`,
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const mailConfig = await getMailConfigFromDB();
    validateMailConfig(mailConfig);

    const transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.port === 465, // true for 465, false for other ports
      auth: {
        user: mailConfig.username,
        pass: mailConfig.password,
      },
    });

    await transporter.sendMail({
      from: `${mailConfig.senderName} <${mailConfig.senderEmail}>`,
      to,
      subject,
      html,
    });

    transporter.close();
  } catch (error) {
    console.error('Error sending email:', error);

    throw new APIError('Failed to send email');
  }
};
