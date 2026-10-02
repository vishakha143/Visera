const jwt = require("jsonwebtoken");
const env = require("./env");

// Verifies Firebase ID tokens WITHOUT the Admin SDK / a service-account key.
// Firebase ID tokens are RS256 JWTs signed by Google; they can be verified
// against Google's public certificates using only the (public) project ID —
// see https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
const CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let certsCache = null;
let certsCacheExpiry = 0;

async function getGoogleCerts() {
  if (certsCache && Date.now() < certsCacheExpiry) return certsCache;

  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error("Failed to fetch Google signing certificates");

  const cacheControl = res.headers.get("cache-control") || "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 60 * 60 * 1000;

  certsCache = await res.json();
  certsCacheExpiry = Date.now() + maxAgeMs;
  return certsCache;
}

function isFirebaseConfigured() {
  return !!env.firebaseProjectId;
}

async function verifyFirebaseIdToken(idToken) {
  if (!isFirebaseConfigured()) {
    const err = new Error("Firebase is not configured on this server");
    err.code = "firebase-not-configured";
    throw err;
  }

  const decodedHeader = jwt.decode(idToken, { complete: true });
  const kid = decodedHeader?.header?.kid;
  if (!kid) throw new Error("Invalid Firebase ID token (missing kid)");

  const certs = await getGoogleCerts();
  const cert = certs[kid];
  if (!cert) throw new Error("Invalid Firebase ID token (unknown signing key)");

  return jwt.verify(idToken, cert, {
    algorithms: ["RS256"],
    audience: env.firebaseProjectId,
    issuer: `https://securetoken.google.com/${env.firebaseProjectId}`,
  });
}

module.exports = { isFirebaseConfigured, verifyFirebaseIdToken };
