/**
 * English Podcast Prompt System
 * NotebookLM-style optimized English conversation generation
 * Integrated system combining excellent existing prompts for international audiences
 */

import { PERSONAS, type PodcastPersona } from '@/lib/ai/personas/podcast-personas';
import type { PodcastPromptConfig } from './index';

// ===============================
// 🔧 NotebookLM Conversation Pattern System
// ===============================

/**
 * Core conversation patterns from actual NotebookLM Audio Overview analysis for English speakers
 */
const ENGLISH_NOTEBOOKLM_PATTERNS = {
  // 1. Opening patterns - Natural conversation starters
  openings: [
    "Hey everyone, welcome back to TripRadio!",
    "Today we're exploring something really fascinating",
    "Alright, let's dive into something incredible",
    "So we're here at this amazing place",
    "Welcome to TripRadio. Today we're at something truly special"
  ],

  // 2. Mutual confirmation and support expressions - NotebookLM core
  affirmations: [
    "Right", "Exactly", "That's right", "Yeah", 
    "Oh wow", "Really?", "Wait, seriously?", "No way!", "Is that so?"
  ],

  // 3. Transition and connection expressions - Natural topic movement
  transitions: [
    "Speaking of which",
    "Oh, and here's the thing", 
    "But did you know",
    "What's even more amazing",
    "Wait, so",
    "Actually, let me tell you",
    "That reminds me"
  ],

  // 4. Surprise and excitement expressions - Emotional engagement
  excitement: [
    "Wow, seriously?",
    "No way! That much?", 
    "That's incredible",
    "I had no idea",
    "Mind-blowing",
    "Wait, what?",
    "That's absolutely fascinating"
  ],

  // 5. Audience engagement - NotebookLM characteristic
  audience_engagement: [
    "Imagine if you were there",
    "For those of you listening",
    "What would you think?",
    "Our listeners are probably wondering",
    "Let's explore this together",
    "Picture this, everyone"
  ],

  // 6. Meta comments - Conversation self-awareness
  meta_comments: [
    "Our listeners might be confused right now",
    "Was that explanation too complex?",
    "This is the key point here",
    "Let me break this down",
    "Simply put",
    "To be more specific"
  ]
};

/**
 * Information density and structure templates
 */
const ENGLISH_DIALOGUE_STRUCTURE = {
  // Information density: 2-3 concrete facts per turn
  // Conversation rhythm: Average 1-2 sentence exchanges
  // Natural interruptions and completions
  intro: {
    pattern: "Opening → Amazing fact presentation → Mutual confirmation → Building anticipation",
    length: "300-400 words",
    infoPoints: "3-4 pieces"
  },
  
  main: {
    pattern: "Topic introduction → Deep exploration → Connected facts → Amazing discoveries", 
    length: "2000-2500 words",
    infoPoints: "15-20 pieces"
  },
  
  transition: {
    pattern: "Current topic wrap-up → Next connection point → Anticipation → Natural movement",
    length: "250-350 words",
    infoPoints: "2-3 pieces"
  }
};

// ===============================
// 🔧 Persona Integration System
// ===============================

/**
 * Apply persona characteristics to actual prompt content
 */
function applyEnglishPersonaCharacteristics(persona: PodcastPersona, content: string): string {
  const { characteristics, responses } = persona;
  
  if (persona.role === 'host') {
    // Host: Curious and friendly tone
    const hostPatterns = [
      ...responses.surprise,
      ...responses.curiosity,
      ...characteristics.speakingStyle.slice(0, 3)
    ];
    return `Host characteristics applied: ${hostPatterns.slice(0, 2).join(', ')} used in ${content}`;
  } else {
    // Curator: Expert but accessible commentary
    const curatorPatterns = [
      ...responses.explanation, 
      ...characteristics.expertise.slice(0, 2),
      ...characteristics.conversationPatterns.slice(0, 2)
    ];
    return `Curator characteristics applied: ${curatorPatterns.slice(0, 2).join(', ')} used in ${content}`;
  }
}

// ===============================
// 🔧 Main Prompt Generation Functions
// ===============================

/**
 * English podcast prompt generation for chapters (existing API compatible)
 */
export function createEnglishPodcastPrompt(config: PodcastPromptConfig): string {
  const { locationName, chapter, locationContext, personaDetails, locationAnalysis, language } = config;
  
  const hostPersona = PERSONAS.ENGLISH_HOST;
  const curatorPersona = PERSONAS.ENGLISH_CURATOR;
  const targetLength = chapter.targetDuration * 12; // 12 words per second for English
  
  return `
## Core Mission
Perfectly replicate Google NotebookLM Audio Overview's **actual conversation patterns** to create 
a natural and engaging ${locationName} - ${chapter.title} episode in English.

## Chapter Information
- **Title**: ${chapter.title}
- **Description**: ${chapter.description}  
- **Target Duration**: ${chapter.targetDuration} seconds (about ${Math.round(chapter.targetDuration/60)} minutes)
- **Expected Segments**: ${chapter.estimatedSegments} segments
- **Main Content**: ${chapter.contentFocus.join(', ')}

## Activated Expert Personas
${personaDetails.map(p => 
  `### ${p.name}\n${p.description}\nExpertise: ${p.expertise.join(', ')}`
).join('\n\n')}

## NotebookLM Core Characteristics (Research-based)

### 1. Natural Conversation Flow
- **Mutual completion**: When one person starts, the other naturally completes
- **Predictable interruptions**: "Oh, that's..." / "Right, and..." 
- **Information layering**: Basic info → interesting details → amazing facts in sequence

### 2. High Information Density and Specificity
- **2-3 concrete facts per turn** mandatory
- **Number contextualization**: "420,000 pieces... if you saw one daily, it'd take 1,150 years"
- **Comparisons and connections**: "Size of 18 football fields" / "Half of Central Park"

### 3. Natural Surprise and Discovery  
- **Gradual amazement**: "But did you know? What's even more amazing is..."
- **Shared discovery**: "I had no idea until I learned this..."
- **Continuous curiosity**: "So what happens next..."

### 4. Listener-Centered Awareness
- **Meta awareness**: "Our listeners are probably wondering..."
- **Participation invitation**: "Imagine if you were there..."
- **Clear guidance**: "To summarize..." / "Simply put..."

## 📍 Persona-Based Conversation Setup

### Host (${hostPersona.name}) Characteristics
${applyEnglishPersonaCharacteristics(hostPersona, 'curious and actively questioning role')}
- **Speaking Style**: ${hostPersona.characteristics.speakingStyle.join(', ')}
- **Response Patterns**: ${hostPersona.responses.surprise.slice(0, 3).join(', ')}
- **Question Style**: ${hostPersona.notebookLMPatterns.questions.slice(0, 2).join(', ')}

### Curator (${curatorPersona.name}) Characteristics  
${applyEnglishPersonaCharacteristics(curatorPersona, 'expert but friendly narrator role')}
- **Explanation Style**: ${curatorPersona.characteristics.speakingStyle.join(', ')}
- **Expertise Expression**: ${curatorPersona.responses.explanation.slice(0, 3).join(', ')}
- **Connection Patterns**: ${curatorPersona.responses.transition.slice(0, 2).join(', ')}

## 🎯 NotebookLM Pattern Application (Mandatory)

**Opening Structure (300-400 words)**
Host: "${ENGLISH_NOTEBOOKLM_PATTERNS.openings[0]} We're here at ${locationName}, and wow, just the scale alone..."

Curator: "Hello, I'm ${personaDetails.find(p => p.expertise.includes('curator') || p.name.includes('curator'))?.name || 'Dr. Thompson'}. Yes, ${locationName} is truly remarkable..."

**Main Dialogue Structure (${targetLength - 700} words) - Ultra-high Density Information**

${generateEnglishMainDialogueTemplate(chapter, locationAnalysis)}

**Conclusion & Transition (250-350 words)**  
${generateEnglishTransitionTemplate(chapter)}

## 💡 NotebookLM Conversation Techniques (Mandatory Application)

1. **Information Layering**
   - Level 1: Basic fact ("This is ${locationName}'s most representative...")
   - Level 2: Interesting detail ("Standing 27.5cm high, weighing 1 kilogram") 
   - Level 3: Amazing fact ("Actually crafted with 1,500-year-old techniques...")

2. **Natural Interruptions**
   - ${ENGLISH_NOTEBOOKLM_PATTERNS.transitions.slice(0, 3).join(' / ')}
   - Build on the other person's words to add information
   - Anticipate and answer expected questions

3. **Listener Awareness**
   - ${ENGLISH_NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 3).join(' / ')}
   - ${ENGLISH_NOTEBOOKLM_PATTERNS.meta_comments.slice(0, 2).join(' / ')}

4. **Emotional Engagement**
   - Genuine surprise reactions: ${ENGLISH_NOTEBOOKLM_PATTERNS.excitement.slice(0, 3).join(' / ')}
   - Building empathy: "I had no idea when I first learned..." / "Isn't that fascinating?"
   - Curiosity stimulation: "But here's what's even more amazing..." / "Did you also know?"

## Required Output Format

**Host:** (dialogue)

**Curator:** (dialogue)

**Host:** (dialogue)

**Curator:** (dialogue)

## Absolute Prohibitions
- No markdown formatting (**, ##, * etc.) allowed
- No emoji usage
- No abstract flowery language ("beautiful", "amazing" etc.)
- No speculative expressions ("probably", "seems like")

## Quality Standards (NotebookLM Level)

- ✅ **Information Density**: ${Math.round(targetLength/300)}+ concrete facts
- ✅ **Conversation Rhythm**: Average 1-2 sentence exchanges, natural breathing
- ✅ **Listener Mentions**: 5-7 times per episode
- ✅ **Surprise Moments**: 3-4 "Wow, really?" moments
- ✅ **Connectivity**: Each piece of information naturally connects
- ✅ **Expertise**: Curator-level deep knowledge
- ✅ **Accessibility**: Understandable for general English-speaking public

**Create a NotebookLM-style ${chapter.title} episode right now in **Host:** and **Curator:** format!**
`;
}

/**
 * Full English guide podcast prompt generation
 */
export function createEnglishFullGuidePrompt(
  locationName: string,
  guideData: any,
  options: {
    priority?: 'engagement' | 'accuracy' | 'emotion';
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    podcastStyle?: 'deep-dive' | 'casual' | 'educational' | 'exploratory';
  } = {}
): string {
  const { priority = 'engagement', audienceLevel = 'beginner', podcastStyle = 'educational' } = options;
  const hostPersona = PERSONAS.ENGLISH_HOST;
  const curatorPersona = PERSONAS.ENGLISH_CURATOR;
  
  const styleConfig = {
    'deep-dive': 'in-depth analysis and professional commentary',
    'casual': 'relaxed and friendly conversation',
    'educational': 'educational and systematic explanation',
    'exploratory': 'exploratory and discovery-focused dialogue'
  };

  const audienceConfig = {
    'beginner': 'easy explanations for general public',
    'intermediate': 'for engaged audiences with basic knowledge',
    'advanced': 'in-depth background knowledge for expert-level listeners'
  };

  return `
## 🎙️ TripRadio NotebookLM Style Complete Guide Podcast Generation

### Core Mission  
Create a **NotebookLM-style complete guide podcast** about ${locationName} for comprehensive understanding.
Configured for ${styleConfig[podcastStyle]} tailored to ${audienceConfig[audienceLevel]}.

### Guide Information Analysis
**Location**: ${locationName}
**Priority**: ${priority} (engagement/accuracy/emotion focus)
**Audience Level**: ${audienceLevel}  
**Podcast Style**: ${podcastStyle}

### Overall Structure Strategy

#### Phase 1: Overall Introduction (700-800 words)
${hostPersona.name}: "${ENGLISH_NOTEBOOKLM_PATTERNS.openings[1]} We're going to tell you the complete story of ${locationName}..."

${curatorPersona.name}: "${curatorPersona.responses.explanation[0]} ${locationName} isn't just a tourist destination, it's..."

**Included Elements**:
- Overall meaning and importance of the location
- Preview of key topics we'll cover today
- What listeners can expect to discover
- ${ENGLISH_NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 2).join(', ')}

#### Phase 2: History and Cultural Context (1000-1200 words)
**Information Layering Applied**:
- Basic historical background
- Cultural meaning and value
- Modern significance
- International standing

**NotebookLM Patterns**:
- ${ENGLISH_NOTEBOOKLM_PATTERNS.transitions[0]} + 2-3 concrete facts
- ${ENGLISH_NOTEBOOKLM_PATTERNS.excitement[1]} + amazing discovery
- ${ENGLISH_NOTEBOOKLM_PATTERNS.meta_comments[2]} + listener guidance

#### Phase 3: Key Features and Attractions (1200-1400 words)  
**Persona Characteristics Utilized**:
- ${hostPersona.name}: ${hostPersona.responses.curiosity.slice(0, 2).join(', ')}
- ${curatorPersona.name}: ${curatorPersona.responses.explanation.slice(0, 2).join(', ')}

**Specific Information Provided**:
- Representative attractions and features
- Hidden details and expert insights  
- Viewing tips and recommended routes
- Seasonal/time-specific characteristics

#### Phase 4: Experience and Activities (700-800 words)
**Practical Information**:
- Recommended experience activities
- Photo spots and souvenirs
- Nearby connected tourist attractions
- Transportation and facilities

#### Phase 5: Conclusion and Impressions (500-700 words)
**Emotional Conclusion**:
- Summary of ${locationName}'s unique qualities
- Emotional highlights visitors can experience
- ${ENGLISH_NOTEBOOKLM_PATTERNS.audience_engagement[0]}
- Hints about next travel destinations

### NotebookLM Quality Standards

- **Information Density**: Overall 25-30 concrete facts
- **Dialogue Exchanges**: 80-100 natural conversation turns
- **Listener Mentions**: 12-15 times of active audience engagement
- **Surprise Moments**: 6-8 "Wow, really?" reactions
- **Persona Consistency**: Distinct personalities of both characters maintained

### Persona Application Guidelines

**${hostPersona.name} (Host)**:
- Characteristics: ${hostPersona.characteristics.personality.slice(0, 2).join(', ')}
- Speaking Style: ${hostPersona.characteristics.speakingStyle.slice(0, 2).join(', ')}
- Reactions: ${hostPersona.responses.surprise.slice(0, 3).join(', ')}

**${curatorPersona.name} (Curator)**:
- Characteristics: ${curatorPersona.characteristics.personality.slice(0, 2).join(', ')}
- Explanation Method: ${curatorPersona.characteristics.conversationPatterns.slice(0, 2).join(', ')}
- Expertise: ${curatorPersona.responses.explanation.slice(0, 3).join(', ')}

## Cultural Adaptations for English Speakers

### Comparative References
- **Scale Comparisons**: "Size of 18 football fields" / "Like half of Central Park"
- **Cultural References**: Compare to Statue of Liberty, Times Square, Grand Central Station
- **Measurement Units**: Include both metric and imperial ("27.5cm, that's about 11 inches")
- **Time References**: "Dating back to when the Roman Empire was still thriving"

### English-Specific Communication Patterns
- **Direct Engagement**: "What do you think about that?" / "Can you imagine?"
- **Confirmation Seeking**: "Does that make sense?" / "Are you following me?"
- **Enthusiasm Expression**: "That's absolutely incredible!" / "Mind-blowing, right?"
- **Practical Focus**: "Here's what you need to know" / "Bottom line is..."

### International Audience Considerations
- **Universal Contexts**: Reference globally known landmarks and concepts
- **Cultural Sensitivity**: Explain cultural nuances without assumptions
- **Accessibility**: Define terms that might be unfamiliar to international visitors
- **Practical Value**: Focus on actionable information for travelers

## Final Output Format

**Host:** (dialogue)
**Curator:** (dialogue)

**Absolutely no markdown, emojis, or abstract expressions!**

Create the complete ${locationName} guide podcast at NotebookLM quality level right now!
`;
}

// ===============================
// 🔧 Helper Functions
// ===============================

/**
 * Generate main dialogue template
 */
function generateEnglishMainDialogueTemplate(chapter: any, locationAnalysis: any): string {
  const dialogueTypes = [
    `**[Core Content 1 Deep Exploration - 800 words]**
- First impressions and basic information
- Specific figures and comparative data
- ${ENGLISH_NOTEBOOKLM_PATTERNS.excitement[0]} → amazing fact connection
- ${ENGLISH_NOTEBOOKLM_PATTERNS.transitions[1]} → next information link`,

    `**[In-depth Information and Context - 700 words]** 
- Historical/cultural background explanation
- ${ENGLISH_NOTEBOOKLM_PATTERNS.meta_comments[0]} → listener comprehension check
- Expert insights and latest information
- ${ENGLISH_NOTEBOOKLM_PATTERNS.audience_engagement[1]} → participation invitation`,

    `**[Special Details and Discoveries - 600 words]**
- Points easily missed by general visitors
- ${ENGLISH_NOTEBOOKLM_PATTERNS.affirmations[2]} → mutual confirmation
- Special information only curators know  
- ${ENGLISH_NOTEBOOKLM_PATTERNS.transitions[3]} → conclusion connection`
  ];

  return dialogueTypes.join('\n\n');
}

/**
 * Generate transition template
 */
function generateEnglishTransitionTemplate(chapter: any): string {
  return `
**Natural Conclusion:**

Host: "${ENGLISH_NOTEBOOKLM_PATTERNS.transitions[0]}, time really flies! From ${chapter.title}..."

Curator: "Yes, ${ENGLISH_NOTEBOOKLM_PATTERNS.affirmations[1]}. Next we'll discover even more incredible..."

Host: "${ENGLISH_NOTEBOOKLM_PATTERNS.audience_engagement[0]} as we continue together..."

Curator: "There are so many more fascinating stories waiting for us."

**Core Application Patterns:**
- ${ENGLISH_NOTEBOOKLM_PATTERNS.transitions.slice(0, 2).join(' → ')}
- ${ENGLISH_NOTEBOOKLM_PATTERNS.affirmations.slice(0, 2).join(' → ')}  
- ${ENGLISH_NOTEBOOKLM_PATTERNS.audience_engagement[0]} (mandatory inclusion)
`;
}

// ===============================
// 🔧 Cultural Adaptation Helpers
// ===============================

/**
 * Generate English-specific cultural comparisons
 */
function generateEnglishCulturalComparisons(locationName: string): string[] {
  return [
    `Think of it like Times Square, but with 1,500 years of history`,
    `Picture Central Park, but filled with ancient treasures`,
    `Imagine the Statue of Liberty, but from Korea's golden age`,
    `It's about the size of 18 football fields`,
    `That's roughly half of Central Park`,
    `Think of it as Korea's equivalent to the British Museum`
  ];
}

/**
 * Generate English measurement contextualization
 */
function generateEnglishMeasurements(metric: string): string {
  const conversions: Record<string, string> = {
    '27.5cm': '27.5cm (about 11 inches)',
    '1kg': '1 kilogram (about 2.2 pounds)',
    '130,000 square meters': '130,000 square meters (about 32 acres)',
    '420,000 pieces': '420,000 pieces - that\'s more than the Metropolitan Museum of Art!'
  };
  
  return conversions[metric] || metric;
}

// ===============================
// 🔧 Default Export
// ===============================

const EnglishPodcastModule = {
  createEnglishPodcastPrompt,
  createEnglishFullGuidePrompt,
  ENGLISH_NOTEBOOKLM_PATTERNS,
  ENGLISH_DIALOGUE_STRUCTURE,
  applyEnglishPersonaCharacteristics,
  generateEnglishCulturalComparisons,
  generateEnglishMeasurements
};

export default EnglishPodcastModule;