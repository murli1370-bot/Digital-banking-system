const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async ({ email, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject,
    html: html || `<p>${text}</p>`,
    text
  };

  await transporter.sendMail(message);
  logger.info(`Email sent to ${email}`);
};

exports.sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
      <div style="background:#1a365d;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0">🏦 DigitalBank</h1>
      </div>
      <div style="background:#fff;padding:30px;border-radius:0 0 8px 8px">
        <h2>Welcome, ${user.firstName}!</h2>
        <p>Your account has been created successfully. You can now log in and start banking digitally.</p>
        <p>Please verify your email to activate all features.</p>
        <div style="margin-top:20px;padding:15px;background:#e8f4fd;border-radius:6px">
          <p style="margin:0;color:#333"><strong>Account Details:</strong></p>
          <p style="margin:5px 0">Name: ${user.fullName}</p>
          <p style="margin:5px 0">Email: ${user.email}</p>
        </div>
      </div>
    </div>`;
  await sendEmail({ email: user.email, subject: 'Welcome to DigitalBank!', html });
};

exports.sendVerifyEmail = async (user, verifyUrl) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2>Verify Your Email</h2>
      <p>Hi ${user.firstName}, click the button below to verify your email:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#1a365d;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0">Verify Email</a>
      <p style="color:#666;font-size:12px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
    </div>`;
  await sendEmail({ email: user.email, subject: 'Verify Your Email - DigitalBank', html });
};

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2>Password Reset Request</h2>
      <p>Hi ${user.firstName}, you requested a password reset. Click the button below:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#e53e3e;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0">Reset Password</a>
      <p style="color:#666;font-size:12px">This link expires in 10 minutes. If you didn't request this, please contact support immediately.</p>
    </div>`;
  await sendEmail({ email: user.email, subject: 'Password Reset - DigitalBank', html });
};

exports.sendTransactionAlert = async (user, transaction) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2>Transaction Alert</h2>
      <p>Hi ${user.firstName}, a transaction was made on your account:</p>
      <div style="padding:15px;background:#f5f5f5;border-radius:6px">
        <p><strong>Type:</strong> ${transaction.type.toUpperCase()}</p>
        <p><strong>Amount:</strong> ₹${transaction.amount.toLocaleString()}</p>
        <p><strong>Description:</strong> ${transaction.description}</p>
        <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>`;
  await sendEmail({ email: user.email, subject: `Transaction Alert - ₹${transaction.amount}`, html });
};

module.exports = { sendEmail, ...exports };
