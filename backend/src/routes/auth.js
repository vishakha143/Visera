const express = require("express");
const { z } = require("zod");
const crypto = require("crypto");

const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const { signToken, cookieOptions } = require("../utils/jwt");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../services/emailService");
const { verifyFirebaseIdToken, isFirebaseConfigured } = require("../config/firebaseAdmin");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(120),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resetSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(8).max(128),
});

const firebaseSchema = z.object({
  idToken: z.string().min(20),
});

const PROVIDER_MAP = {
  "google.com": "google",
  "github.com": "github",
};

function issueSession(res, user) {
  const token = signToken({ sub: user._id.toString() });
  res.cookie(env.cookieName, token, cookieOptions);
  return token;
}

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict("Email already registered");

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      authProviders: ["password"],
    });

    const token = issueSession(res, user);
    res.status(201).json({ user, token });
  })
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) throw ApiError.unauthorized("Invalid credentials");

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized("Invalid credentials");

    const token = issueSession(res, user);
    res.json({ user, token });
  })
);

/* -------------------------------------------------------------------------- */
/* Google / GitHub sign-in — client authenticates with Firebase, then          */
/* exchanges the resulting Firebase ID token for our own app session.         */
/* -------------------------------------------------------------------------- */

router.post(
  "/firebase",
  authLimiter,
  validate(firebaseSchema),
  asyncHandler(async (req, res) => {
    if (!isFirebaseConfigured()) {
      throw ApiError.badRequest(
        "Google/GitHub sign-in is not configured on this server yet."
      );
    }

    let decoded;
    try {
      decoded = await verifyFirebaseIdToken(req.body.idToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired sign-in. Please try again.");
    }

    const provider = PROVIDER_MAP[decoded.firebase?.sign_in_provider] || "google";
    const email = (decoded.email || "").toLowerCase().trim();
    if (!email) {
      throw ApiError.badRequest(
        "Your GitHub account doesn't expose a public email. Make an email public on GitHub, or sign up with a password instead."
      );
    }

    let user = await User.findOne({ firebaseUid: decoded.sub });

    if (!user) {
      // Link to an existing password-based account with the same email,
      // rather than creating a duplicate.
      user = await User.findOne({ email });
      if (user) {
        user.firebaseUid = decoded.sub;
        if (!user.authProviders.includes(provider)) {
          user.authProviders.push(provider);
        }
        if (!user.avatarUrl && decoded.picture) user.avatarUrl = decoded.picture;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({
        name: decoded.name || email.split("@")[0],
        email,
        firebaseUid: decoded.sub,
        authProviders: [provider],
        avatarUrl: decoded.picture || "",
      });
    }

    const token = issueSession(res, user);
    res.json({ user, token });
  })
);

router.post("/logout", (req, res) => {
  res.clearCookie(env.cookieName, { ...cookieOptions, maxAge: 0 });
  res.json({ ok: true });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

router.patch(
  "/profile",
  requireAuth,
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    req.user.name = req.body.name;
    await req.user.save();
    res.json({ user: req.user });
  })
);

router.patch(
  "/password",
  authLimiter,
  requireAuth,
  validate(passwordSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user) throw ApiError.unauthorized("Session no longer valid");

    const ok = await user.comparePassword(req.body.currentPassword);
    if (!ok) throw ApiError.unauthorized("Current password is incorrect");

    user.passwordHash = await User.hashPassword(req.body.newPassword);
    await user.save();
    res.json({ ok: true });
  })
);

/* -------------------------------------------------------------------------- */
/* Forgot password — send email with reset link                                */
/* -------------------------------------------------------------------------- */

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({ ok: true });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.passwordResetToken = hash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const base = env.clientOrigin || "http://localhost:5173";
    const resetUrl = `${base}/reset-password?token=${rawToken}`;
    console.log("[forgot-password] resetUrl:", resetUrl);

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      console.error("[forgot-password] send failed:", err.message);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw ApiError.badRequest("Could not send reset email. Try again later.");
    }

    res.json({ ok: true });
  })
);

/* -------------------------------------------------------------------------- */
/* Reset password — token from email link                                      */
/* -------------------------------------------------------------------------- */

router.post(
  "/reset-password",
  authLimiter,
  validate(resetSchema),
  asyncHandler(async (req, res) => {
    const hash = crypto
      .createHash("sha256")
      .update(req.body.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordHash +passwordResetToken +passwordResetExpires");

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset link");
    }

    user.passwordHash = await User.hashPassword(req.body.newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ ok: true });
  })
);

module.exports = router;