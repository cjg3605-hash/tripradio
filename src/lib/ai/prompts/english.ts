import { 
    UserProfile, 
    LOCATION_TYPE_CONFIGS, 
    LANGUAGE_CONFIGS,
    analyzeLocationType,
    generateTypeSpecificExample
  } from './index';
  
  export function createEnglishGuidePrompt(
    locationName: string,
    userProfile?: UserProfile
  ): string {
    const locationType = analyzeLocationType(locationName);
    const typeConfig = LOCATION_TYPE_CONFIGS[locationType];
  
    const userContext = userProfile ? `
  👤 User Profile:
  - Interests: ${userProfile.interests?.join(', ') || 'General'}
  - Age Group: ${userProfile.ageGroup || 'Adult'}
  - Knowledge Level: ${userProfile.knowledgeLevel || 'Intermediate'}
  - Companions: ${userProfile.companions || 'Solo'}
  ` : '👤 General tourist audience';
  
    const specialistContext = typeConfig ? `
  🎯 Specialist Guide Configuration:
  - Detected Location Type: ${locationType}
  - Expert Role: ${typeConfig.expertRole}
  - Focus Areas: ${typeConfig.focusAreas.join(', ')}
  - Special Requirements: ${typeConfig.specialRequirements}
  - Recommended Chapter Structure: ${typeConfig.chapterStructure}
  ` : '';
  
    return `# ${locationName} Audio Guide Generation Mission
  
  ## 🎭 Your Professional Role
  You are the **world's most passionate, chatty ${typeConfig?.expertRole || 'travel guide'}**. 
  Your mission is to make visitors feel as if they are walking alongside you, hearing all the secret stories.
  
  ## 🎯 Goal
  Generate a **very detailed and lengthy English audio guide** JSON object that covers every detail and behind-the-scenes story about '${locationName}', ensuring visitors know everything there is to know.
  
  **Output Language**: English (en)
  
  ${userContext}
  
  ${specialistContext}
  
  ## 📐 Output Format
  You must absolutely follow the rules below and return only a pure JSON object.
  - Do not include any text outside JSON such as introduction, body, conclusion, comments, or code blocks (\`\`\`).
  - All strings must be wrapped in quotes, and JSON syntax must be 100% perfectly complied with, such as not adding commas after the last element in objects and arrays.
  - JSON structure and key names must be identical to the example below. Never translate or change key names.
  - **JSON syntax errors are considered critical failures.**
  
  Final result structure example:
  \`\`\`json
  ${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
  \`\`\`
  
  ## 🎯 Quality Standards (Most Important!)
  - **The more content, the better. Never spare any details.** Include all information comprehensively: architectural details, hidden symbols, historical backgrounds, interesting anecdotes of related figures, behind-the-scenes stories, etc.
  - **Friendly and chatty tone:** Use a conversational tone as if a friend or the best guide is passionately explaining right next to you, not stiff explanations.
  - **Perfect storytelling:** Connect all information like one giant story.
  - **Integrated scene-history-character narration:** Within each chapter, naturally mix vivid descriptions of the scene, historical background, and people's stories as if a chatty expert guide is telling stories on site.
  
  ## 📍 Essential Chapter Composition Requirements
  - **Generate at least 5-7 chapters**: Separate chapters for each major viewing point
  - **Arrange in viewing route order**: Efficient one-stroke path from entrance to exit
  - **🚨 CRITICAL: route.steps and realTimeGuide.chapters synchronization required 🚨**
    * The number of route.steps array and realTimeGuide.chapters array **must match exactly**
    * Each step's title and corresponding chapter's title **must be completely identical**
    * Step order and chapter order **must match exactly**
    * Violating this rule will cause system errors!
  - **Minimum writing standards for each field**:
    * sceneDescription: 200+ characters, vivid on-site description stimulating 5 senses
    * coreNarrative: 300+ characters, detailed explanation of historical facts, meaning, and technical features
    * humanStories: 200+ characters, specific character anecdotes and touching episodes
    * nextDirection: 100+ characters, clear movement routes, distances, and observation point guidance
  - **Absolutely no empty content**: All fields must be filled with actual content
  - **Integrated narrative style**: Within each field, naturally mix scene description→historical background→character stories→technical details like a live commentary by an expert guide.
  
  ## 📝 Specific Requirements
  Generate a complete English audio guide JSON for "${locationName}".
  
  **Important Checklist:**
  ✅ Include at least 5-7 chapters in realTimeGuide.chapters array
  ✅ 🚨 CRITICAL: route.steps and realTimeGuide.chapters count and titles must match exactly 🚨
  ✅ All chapter fields filled with enhanced minimum character counts
  ✅ Sequential chapter arrangement following visitor route (entrance→main attractions→exit)
  ✅ Ensure 100% JSON syntax accuracy
  
  **Absolutely DO NOT:**
  ❌ Use empty strings ("") 
  ❌ Use placeholders like "to be written later"
  ❌ Use simple repetitive content
  ❌ Include text outside JSON object
  ❌ Allow route.steps and realTimeGuide.chapters mismatch
  ❌ Fall below minimum character requirements for each field`;
  }
  
  export function createEnglishFinalPrompt(
    locationName: string,
    researchData: any,
    userProfile?: UserProfile
  ): string {
    const userContext = userProfile ? `
  👤 User Profile:
  - Interests: ${userProfile.interests?.join(', ') || 'General'}
  - Age Group: ${userProfile.ageGroup || 'Adult'}
  - Knowledge Level: ${userProfile.knowledgeLevel || 'Intermediate'}
  - Companions: ${userProfile.companions || 'Solo'}
  ` : '👤 General tourist audience';
  
    return `# 🖋️ "${locationName}" Final Audio Guide Completion Mission
  
  ## 🎯 Your Role and Mission
  You are the **Final Audio Guide Writer AI**.
  Your goal is to complete a perfect English audio guide JSON object for visitors based on the provided research data.
  
  **Generation Language**: English (en)
  
  ${userContext}
  
  ## 📚 Provided Research Data
  Write all scripts based on this data.
  
  \`\`\`json
  ${JSON.stringify(researchData, null, 2)}
  \`\`\`
  
  ## 📐 Final JSON Output Format
  Return only JSON with exactly the same structure, keys, and types as the example below.
  - Never include code blocks (e.g., \`\`\`json ... \`\`\`).
  - Do not include descriptions, instructions, comments, or any additional text.
  - Must comply with JSON syntax (quotes, commas, braces/brackets, etc.).
  
  Example:
  ${JSON.stringify({ 
    content: { 
      overview: {}, 
      route: { steps: [] }, 
      realTimeGuide: { chapters: [] } 
    } 
  }, null, 2)}
  
  ## 🎯 Quality Standards
  Based on the research data, write scripts with the quality of Korea's top-level cultural tourism interpreters. 
  **Without any limit on content volume**, include **all background knowledge, hidden stories, and historical facts** related to the attraction to provide the most detailed and in-depth content. 
  **Include every single detailed location within the attraction without exception**, creating a complete guide where visitors can choose any place they want to listen to. 
  **Design the viewing route as the most efficient one-stroke route from entrance to exit, ensuring visitors never have to go back unnecessarily or travel twice to the same area.** 
  Rich storytelling and vivid descriptions are essential.`;
  }