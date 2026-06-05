const defaultLocale = process.env.DEFAULT_LOCALE || process.env.DEFAULT_LOCALES || 'en';
const locales = (process.env.LOCALES || defaultLocale)
    .split(',')
    .map((locale) => locale.trim())
    .filter(Boolean);

export const i18n = {
    defaultLocale,
    locales,
} as const;

export type Locale = typeof i18n['locales'][number];
