import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale || 'ko';
  
  try {
    const messages = await import(`../public/locales/translations.json`);
    return {
      locale: currentLocale,
      messages: messages.default[currentLocale] || messages.default['ko']
    };
  } catch (error) {
    console.error('Translation loading error:', error);
    return {
      locale: 'ko',
      messages: {}
    };
  }
});