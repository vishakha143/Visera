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

function resetHtml(resetUrl) {
  return `
      <p>You requested a password reset for VISERA.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <p style="color:#888;font-size:12px;word-break:break-all;">${resetUrl}</p>
    `;
}

// Hosts like Render's free tier block outbound SMTP, so HTTPS email APIs are
// preferred when a key is configured. Both have free tiers.
async function sendViaHttpApi(to, resetUrl) {
  const from = env.emailFrom || env.smtpUser;
  const html = resetHtml(resetUrl);
  const subject = "Reset your VISERA password";

  if (env.brevoApiKey) {
    if (!from) throw new Error("EMAIL_FROM missing (must be a verified Brevo sender)");
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.brevoApiKey, "content-type": "application/json" },
      body: JSON.stringify({
        sender: { name: "VISERA", email: from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 200)}`);
    console.log("[email] sent via Brevo");
    return true;
  }

  if (env.resendApiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: `VISERA <${from || "onboarding@resend.dev"}>`,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    console.log("[email] sent via Resend");
    return true;
  }
  return false;
}

async function sendPasswordResetEmail(to, resetUrl) {
  if (await sendViaHttpApi(to, resetUrl)) return;

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
    html: resetHtml(resetUrl),
  });

  console.log("[email] sent:", info.messageId);
  return info;
}

module.exports = { sendPasswordResetEmail };