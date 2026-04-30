const DEFAULT_BASE_URL = 'https://sos2526-17-production.cloudflare-kpgod.workers.dev';

export const APP_BASE_URL = (process.env.APP_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
