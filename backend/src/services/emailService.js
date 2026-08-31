const nodemailer = require("nodemailer");
const env = require("../config/env");

const port = Number(env.smtpPort) || 465;

const transporter =
  env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
      host: env.smtpHost || "smtp.gmail.com",
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false,
      },
    })
    : null;

if (transporter) {
  transporter
    .verify()
    .then(() => console.log("[email] SMTP verify OK"))
    .catch((e) => console.error("[email] SMTP verify FAIL:", e.message));
}

async function sendPasswordResetEmail(to, resetUrl) {
  if (!transporter) {
    console.log("[email] SMTP not configured. Reset URL:", resetUrl);
    return { skipped: true };
  }

  const info = await transporter.sendMail({
    from: `"VISERA" <${env.emailFrom || env.smtpUser}>`,
    to,
    subject: "Reset your VISERA password",
    html: `
      <p>You requested a password reset for VISERA.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <p style="color:#888;font-size:12px;word-break:break-all;">${resetUrl}</p>
    `,
  });

  console.log("[email] sent:", info.messageId);
  return info;
}

module.exports = { sendPasswordResetEmail };