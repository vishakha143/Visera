const { rateLimit } = require("express-rate-limit");

const analyzerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Prefer user id when logged in, otherwise IP
  keyGenerator: (req) => {
    if (req.user?._id) return req.user._id.toString();
    return req.ip; // express default when trust proxy is set
  },
  message: {
    error: {
      message: "Too many analyses — please wait a minute and retry.",
    },
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Default IP-based limit is fine for login/register
  // no custom keyGenerator needed
  message: {
    error: {
      message: "Too many attempts — please wait and retry.",
    },
  },
});

module.exports = { analyzerLimiter, authLimiter };