import 'next-i18next';

declare module 'next-i18next' {
  interface I18nDictionary {
    guide: {
      overview: string;
      route: string;
      realTimeGuide: string;
      play: string;
      pause: string;
      startingLocation: string;
      viewOnGoogleMaps: string;
      keyFacts: string;
      duration: string;
      difficulty: string;
      season: string;
      nextMove: string;
    };
    // Add other translation namespaces and their types here
  }
}
