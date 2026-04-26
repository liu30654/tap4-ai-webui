export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const GOOGLE_TRACKING_ID = process.env.GOOGLE_TRACKING_ID || '';
export const GOOGLE_ADSENSE_URL = process.env.GOOGLE_ADSENSE_URL || '';
export const CONTACT_US_EMAIL = process.env.CONTACT_US_EMAIL || '';
