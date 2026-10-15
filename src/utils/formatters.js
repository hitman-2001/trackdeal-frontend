/**
 * Formats numeric values to Indian Currency Standard (INR) notation (₹).
 * Handles Indian Lakh and Crore formatting divisions.
 * @param {number} value - Numeric value
 * @returns {string}
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formats ISO strings or Date instances to locale date format.
 * @param {string|Date} date - Date value
 * @param {string} format - Option formatting (defaults to short format)
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—';
  const instance = new Date(date);
  if (isNaN(instance.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(instance);
}

/**
 * Formats bytes to standard KB/MB/GB storage notation.
 * @param {number} bytes - Storage size in bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const SOURCE_LABEL_MAP = {
  manual_entry: 'Manual Entry',
  'manual-entry': 'Manual Entry',
  manual: 'Manual Entry',
  walk_in: 'Campus Walk-in',
  campus: 'Campus Walk-in',
  referral: 'Direct Referral',
  website: 'Website & Digital',
  social_media: 'Social Media Ads',
  google_ads: 'Google Search Ads',
  education_fair: 'Education Fairs',
  direct: 'Direct Inquiry',
  whatsapp: 'WhatsApp',
  phone: 'Phone Call',
  call: 'Phone Call',
  portal: 'Web Portal',
  facebook: 'Facebook / Instagram',
  instagram: 'Instagram',
};

/**
 * Formats raw source slugs (e.g. 'manual_entry', 'manual-entry', 'whatsapp') to clean display labels.
 * @param {string} source
 * @returns {string}
 */
export function formatLeadSource(source) {
  if (!source) return 'Direct Inquiry';
  const cleanKey = String(source).trim().toLowerCase();
  if (SOURCE_LABEL_MAP[cleanKey]) return SOURCE_LABEL_MAP[cleanKey];
  return cleanKey
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default {
  formatCurrency,
  formatDate,
  formatBytes,
  formatLeadSource,
};
