import nodemailer from 'nodemailer';

let transport;
function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export async function sendContactMail({ to, replyTo, message }) {
  const mail = {
    from: process.env.MAIL_FROM,
    to,
    replyTo,
    subject: 'New message from your CodeFolio portfolio',
    text: `From: ${replyTo}\n\n${message}`,
  };
  if (!process.env.SMTP_HOST) {
    console.log('[contact:dev] SMTP not configured, message not sent:\n', mail);
    return;
  }
  await getTransport().sendMail(mail);
}
