const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(",")}`);
  process.exit(1);
}

const clientOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((o) => o.trim().replace(/^["']|["']$/g, ""))
  .filter(Boolean)
  // Browsers send just "scheme://host[:port]" as Origin, so a trailing slash or
  // a pasted full link (https://site.app/login) must be reduced to that form.
  .map((o) => {
    try {
      return new URL(o).origin;
    } catch {
      return o;
    }
  });

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIN: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: process.env.COOKIE_NAME || "arr_token",
  clientOrigins,
  clientOrigin: clientOrigins[0] || "http://localhost:5173",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  // gemini-2.0-flash* was shut down by Google (June 2026); map stale settings forward.
  geminiModel: /^gemini-2\.0/.test(process.env.GEMINI_MODEL || "")
    ? "gemini-3.6-flash"
    : process.env.GEMINI_MODEL || "gemini-3.6-flash",
  isProd: process.env.NODE_ENV === "production",
  resendApiKey: process.env.RESEND_API_KEY || "",
  brevoApiKey: process.env.BREVO_API_KEY || "",
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT) || 465,
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  emailFrom: process.env.EMAIL_FROM || process.env.SMTP_USER || "",
  adzunaAppId: process.env.ADZUNA_APP_ID || "",
  adzunaAppKey: process.env.ADZUNA_APP_KEY || "",
  adzunaCountry: (process.env.ADZUNA_COUNTRY || "in").toLowerCase(),
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
};