import 'next-i18next';

declare module 'next-i18next' {
  interface I18nDictionary {
    home: {
      brandTitle: string;
      title: string;
      subtitle: string;
      subtitle2: string;
      searchPlaceholder: string;
      searchButton: string;
      popularDestinations: string;
      description: string;
      features: {
        realTime: string;
        personalized: string;
        multiLanguage: string;
        offline: string;
        storyteller: string;
        docent: string;
      };
    };
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
