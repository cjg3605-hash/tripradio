const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja', 'zh', 'es'],
    localeDetection: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/public/locales',
  ns: ['common'],
  defaultNS: 'common',
  keySeparator: '.',
  nsSeparator: ':',
  serializeConfig: false,
  use: [],
}