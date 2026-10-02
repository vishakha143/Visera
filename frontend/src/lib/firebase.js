import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

const app = isFirebaseConfigured
  ? getApps()[0] || initializeApp(config)
  : null;

const auth = app ? getAuth(app) : null;

// Codes that mean "the user changed their mind" — not a real error, so the
// UI should just quietly reset instead of showing a scary red banner.
const CANCELLED_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

// Everything else gets a plain-English message — the raw Firebase error
// ("Firebase: Error (auth/network-request-failed).") never reaches the UI.
const FRIENDLY_MESSAGES = {
  "auth/popup-blocked":
    "Your browser blocked the sign-in popup. Allow popups for this site and try again.",
  "auth/network-request-failed":
    "Couldn't reach the sign-in service. Check your connection and try again.",
  "auth/account-exists-with-different-credential":
    "That email is already used with a different sign-in method. Try signing in with your password instead.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/unauthorized-domain":
    "This site isn't allowed to use Google/GitHub sign-in yet. Try email and password instead.",
};

function toFriendlyError(err) {
  const code = err?.code;
  if (code && CANCELLED_CODES.has(code)) {
    const cancelled = new Error("cancelled");
    cancelled.cancelled = true;
    return cancelled;
  }
  const friendly = new Error(
    FRIENDLY_MESSAGES[code] || "Something went wrong signing you in. Please try again."
  );
  friendly.cause = err;
  return friendly;
}

async function signInWithProvider(provider) {
  if (!auth) {
    throw new Error("Google/GitHub sign-in is not configured for this app yet.");
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user.getIdToken();
  } catch (err) {
    throw toFriendlyError(err);
  }
}

export function signInWithGoogle() {
  return signInWithProvider(new GoogleAuthProvider());
}

export function signInWithGithub() {
  const provider = new GithubAuthProvider();
  provider.addScope("user:email");
  return signInWithProvider(provider);
}
