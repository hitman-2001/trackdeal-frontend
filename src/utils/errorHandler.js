/**
 * Utility to sanitize and format user-facing error messages.
 * Prevents internal server stack traces, OpenSSL dumps, database errors,
 * or raw runtime exceptions from leaking into the UI.
 */

// Regex patterns that indicate low-level technical or internal system errors
const TECHNICAL_ERROR_PATTERNS = [
  // OpenSSL / TLS / Cipher routines & codes
  /\b(ssl|tls|openssl|handshake|cipher|routines|rec_layer|rec_layer_s3|alert internal error)\b/i,
  /^[0-9a-f]{8,}:error:/i,
  /error:0[a-z0-9]+:/i,
  /CERT_HAS_EXPIRED|UNABLE_TO_VERIFY_LEAF_SIGNATURE|DEPTH_ZERO_SELF_SIGNED_CERT/i,

  // Node.js & network socket codes
  /\b(econnrefused|econnreset|etimedout|enotfound|enetunreach|ehostunreach|socket hang up)\b/i,
  /\b(net::err_|err_connection_|err_ssl_|err_name_not_resolved)\b/i,

  // Stack traces, file system paths, source maps
  /\.\.\/deps\/|node_modules|node:internal|\.js:\d+|\.ts:\d+|\.c:\d+|\.cpp:\d+|\.h:\d+/i,
  /\bat\s+[a-zA-Z0-9_$.<>]+\s+\(/i,

  // Database & ORM internals
  /\b(mongoservererror|e11000|duplicate key|sequelize|prisma|sqlstate|database error|queryfailed)\b/i,

  // JavaScript runtime exception types
  /\b(typeerror|syntaxerror|referenceerror|rangeerror|evalerror|urierror|unhandledpromiserejection)\b/i,

  // HTML error pages from proxies/gateways
  /<html|<!doctype|<body|<head/i,
];

/**
 * Checks if a string contains internal technical jargon or stack traces.
 * @param {string} msg
 * @returns {boolean}
 */
export function isTechnicalError(msg) {
  if (!msg || typeof msg !== 'string') return false;
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(msg));
}

/**
 * Extracts and sanitizes an error into a clean, human-readable message.
 * @param {any} err - The error object (Axios error, Error instance, or string)
 * @param {string} fallback - Default friendly message if none could be resolved safely
 * @returns {string}
 */
export function getErrorMessage(err, fallback = 'An unexpected error occurred. Please try again.') {
  if (!err) return fallback;

  if (typeof err === 'string') {
    return isTechnicalError(err) ? fallback : err;
  }

  const status = err.response?.status;
  const rawMsg =
    err.response?.data?.error?.message ||
    err.response?.data?.message ||
    (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) ||
    err.data?.message ||
    err.message ||
    '';

  // Check for specific SSL / Network / Connection errors
  if (
    /ssl|tls|openssl|handshake|rec_layer/i.test(rawMsg) ||
    /econnrefused|econnreset|etimedout|socket hang up|network error/i.test(rawMsg) ||
    (!err.response && /network|timeout|connection/i.test(rawMsg))
  ) {
    return 'Unable to securely connect to the server. Please check your internet connection or try again shortly.';
  }

  // HTTP Status based sanitization
  if (status === 401) {
    if (rawMsg && !isTechnicalError(rawMsg) && rawMsg.length < 120) {
      return rawMsg;
    }
    return fallback || 'Invalid credentials. Please check your organization, email, and password.';
  }

  if (status === 403) {
    if (rawMsg && !isTechnicalError(rawMsg) && rawMsg.length < 120) {
      return rawMsg;
    }
    return 'Access denied. You do not possess permission for this action.';
  }

  if (status === 404) {
    if (rawMsg && !isTechnicalError(rawMsg) && rawMsg.length < 120) {
      return rawMsg;
    }
    return 'The requested resource or organization could not be found.';
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (status >= 500) {
    return 'A server error occurred. Please try again shortly or contact support.';
  }

  // If a raw message exists, verify it doesn't leak internal code/stack traces
  if (rawMsg && typeof rawMsg === 'string') {
    const trimmed = rawMsg.trim();
    if (!isTechnicalError(trimmed) && trimmed.length <= 200) {
      return trimmed;
    }
  }

  return fallback;
}

export default {
  isTechnicalError,
  getErrorMessage,
};
