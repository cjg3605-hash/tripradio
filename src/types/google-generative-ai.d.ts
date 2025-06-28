declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(params: { 
      model: string; 
      generationConfig?: {
        maxOutputTokens?: number;
        temperature?: number;
      } 
    }): {
      generateContent: (prompt: string) => Promise<{
        response: {
          text: () => Promise<string>;
        };
      }>;
    };
  }
}
