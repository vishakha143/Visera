const nodemailer = require("nodemailer");
const env = require("../config/env");

const port = Number(env.smtpPort) || 465;

const transporter =
  env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
        host: env.smtpHost || "smtp.gmail.com",
        port,
        secure: port === 465,
        auth: {
          user: env.smtpUser,
          pass: String(env.smtpPass).replace(/\s/g, ""),
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        tls: {
          rejectUnauthorized: false,
        },
      })
    : null;

async function sendPasswordResetEmail(to, resetUrl) {
  if (!transporter) {
    console.log("[email] SMTP not configured. Reset URL:", resetUrl);
    throw new Error("SMTP not configured");
  }

  try {
    await transporter.verify();
    console.log("[email] SMTP verify OK");
  } catch (e) {
    console.error("[email] SMTP verify FAIL:", e.message);
    throw e;
  }

  const from = env.emailFrom || env.smtpUser;
  if (!from) {
    throw new Error("EMAIL_FROM / SMTP_USER missing");
  }

  const info = await transporter.sendMail({
    from: `"VISERA" <${from}>`,
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