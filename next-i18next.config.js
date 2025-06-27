const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja', 'zh', 'es'],
    localePath: path.resolve('./public/locales'),
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
  localePath: path.resolve('./public/locales'),
  ns: ['common'],
  defaultNS: 'common',
  keySeparator: '.',
  nsSeparator: ':',
  serializeConfig: false,
  use: [],
}