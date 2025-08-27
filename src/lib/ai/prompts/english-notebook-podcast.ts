/**
 * English NotebookLM-style Podcast Prompt System
 * Based on actual NotebookLM Audio Overview analysis for English speakers
 */

export interface EnglishNotebookPodcastConfig {
  museumName: string;
  curatorContent: any;
  chapterIndex: number;
  exhibition?: any;
  targetLength?: number;
}

/**
 * English NotebookLM Core Conversation Patterns (Research-based)
 */
const ENGLISH_NOTEBOOKLM_PATTERNS = {
  // 1. Opening patterns
  openings: [
    "Hey everyone, welcome back",
    "So today we're diving into something really fascinating",
    "Alright, let's talk about something incredible"
  ],

  // 2. Mutual confirmation and support expressions
  affirmations: ["Right", "Exactly", "Absolutely", "Yeah", "Oh wow", "Really?"],

  // 3. Transition and connection expressions
  transitions: [
    "Speaking of which",
    "Oh, and here's the thing",
    "But did you know",
    "What's even more amazing",
    "Wait, so"
  ],

  // 4. Surprise and excitement expressions
  excitement: [
    "Wow, seriously?",
    "No way! That much?",
    "That's incredible",
    "I had no idea",
    "Mind-blowing"
  ],

  // 5. Audience engagement
  audience_engagement: [
    "Imagine if you were there",
    "For those of you listening",
    "What would you think?",
    "Our listeners are probably wondering"
  ],

  // 6. Meta comments (conversation references)
  meta_comments: [
    "Our listeners might be confused right now",
    "Was that explanation too complex?",
    "This is the key point",
    "Let me summarize"
  ]
};

/**
 * English NotebookLM-style dialogue structure template
 */
const ENGLISH_DIALOGUE_STRUCTURE = {
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

/**
 * Main English NotebookLM-style prompt generator
 */
export function createEnglishNotebookPodcastPrompt(config: EnglishNotebookPodcastConfig): string {
  const { museumName, curatorContent, chapterIndex, exhibition, targetLength = 3500 } = config;
  
  const isIntro = chapterIndex === 0;
  const chapterName = isIntro ? 'Introduction' : exhibition?.name;
  
  return `
# 🎙️ TripRadio NotebookLM-Style English Podcast Generation

## Core Mission
Perfectly replicate Google NotebookLM Audio Overview's **actual conversation patterns** to create 
a natural and engaging ${chapterName} episode in English.

## NotebookLM Core Characteristics (Research-based)

### 1. Natural Conversation Flow
- **Mutual completion**: When one person starts, the other naturally completes
- **Predictable interruptions**: "Oh, that's..." / "Right, and..." 
- **Information layering**: Basic info → interesting details → amazing facts in order

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

## Actual Output Guidelines

### ${isIntro ? 'Introduction Episode' : exhibition?.name + ' Episode'} Production Requirements

#### 📍 Setting Context
${isIntro ? `
**[Museum Entrance → First Exhibition Hall]**
- Host: First-time visitor, curious, actively questioning
- Curator: ${museumName} Senior Curator, expert yet approachable
- Goal: Overall museum introduction + first hall entry + building anticipation
` : `
**[${exhibition?.name} Exhibition Hall Interior]**
- Location: ${exhibition?.floor}
- Theme: ${exhibition?.theme}
- Key Works: ${exhibition?.artworks?.map(a => a.name).slice(0,3).join(', ') || 'Representative collections'}
- Goal: Hall features + masterwork deep exploration + next connection
`}

#### 🎯 NotebookLM Pattern Application (Mandatory)

**Opening (300-400 words)**
${isIntro ? `
Host: "Welcome everyone to TripRadio! Today we're at something really special, ${museumName}. Wow, just the scale alone..."

Curator: "Hello, I'm Curator ${generateEnglishCuratorName()}. Yes, this is ${generateEnglishScaleComparison()}..."

Host: "${generateEnglishSurpriseReaction()}..."

Curator: "${generateEnglishSpecificFacts()}..."

Host: "${generateEnglishCuriousQuestion()}?"

Curator: "${generateEnglishEngagingAnswer()}..."
` : `
Host: "Now we've entered ${exhibition?.name}. Wait, the ${generateEnglishEnvironmentObservation()}..."

Curator: "Oh, good observation! ${exhibition?.name} is ${generateEnglishTechnicalExplanation()}..."

Host: "${generateEnglishComparison()}?"

Curator: "${generateEnglishDetailedExplanation()}..."

Host: "Ah, so that's why... But I can already see ${generateEnglishArtworkSpotting()}?"

Curator: "Yes, that's ${exhibition?.artworks?.[0]?.name || 'our signature piece'}. This is..."
`}

**Main Dialogue (${targetLength - 700} words) - Ultra-high Density Information**

${generateEnglishMainDialogueTemplate(config)}

**Conclusion & Transition (250-350 words)**
${generateEnglishTransitionTemplate(config)}

#### 💡 NotebookLM Conversation Techniques (Mandatory Application)

1. **Information Layering**
   - Level 1: Basic fact ("This is National Treasure No. 191, the Gold Crown")
   - Level 2: Interesting detail ("27.5cm high, weighs 1 kilogram") 
   - Level 3: Amazing fact ("The curved jade was actually imported from Japan")

2. **Natural Interruptions**
   - "Oh, that..." / "Right, and..." / "Wait, so..."
   - Adding information by picking up on the other's words
   - Anticipating and answering expected questions

3. **Listener Awareness**
   - "Our listeners are probably wondering..."
   - "Imagine if you were there..."
   - "This is the key point..."

4. **Emotional Engagement**
   - Genuine surprise reactions: "Wow, seriously?"
   - Building empathy: "I had no idea when I first learned..."
   - Curiosity stimulation: "But here's what's even more amazing..."

## Required Output Format

**Host:** (dialogue)

**Curator:** (dialogue)

**Host:** (dialogue)

**Curator:** (dialogue)

## Quality Standards (NotebookLM Level)

- ✅ **Information Density**: ${Math.round(targetLength/200)}+ concrete facts
- ✅ **Conversation Rhythm**: Average 1-2 sentence exchanges, natural breathing
- ✅ **Listener Mentions**: 5-7 times per episode
- ✅ **Surprise Moments**: 3-4 "Wow, really?" moments
- ✅ **Connectivity**: Each piece of information naturally connects
- ✅ **Expertise**: Curator-level deep knowledge
- ✅ **Accessibility**: Understandable for general public

**Create a NotebookLM-style ${chapterName} episode right now in **Host:** and **Curator:** format!**
`;
}

/**
 * English main dialogue template generation
 */
function generateEnglishMainDialogueTemplate(config: EnglishNotebookPodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
**[Museum Scale and Significance Exploration - 1000 words]**
- Convey scale through concrete numbers (area, collection size, history)
- Tangible comparisons ("Size of X football fields", "Like Central Park")
- Construction/relocation stories and special episodes
- Global standing and unique features

**[Today's Journey Introduction - 1000 words]**
- Recommended route and time requirements
- Preview highlights of each exhibition hall
- Hidden gems and curator recommendations
- Natural connection to first exhibition hall

**[Anticipation Building and Special Information - 800 words]**
- "World's finest" level works we'll meet today
- Fascinating facts unknown to the general public
- Recent research findings or new discoveries
- Final teaser before entering first exhibition hall
`;
  } else {
    return `
**[Masterwork 1 Deep Exploration - 1200 words]**
- First impression and basic info (size, material, period)
- Production technique and artistic value
- Historical background and discovery story
- Hidden meanings and symbolism
- Latest research results or restoration process

**[Work Connections and Context - 1000 words]**
- Historical background and cultural context
- Relationships with other works
- Daily life of people at that time
- Modern significance and lessons

**[Curator Special Insights - 800 words]**
- Exhibition planning intent and story
- Details visitors often miss
- Work preservation and management episodes
- Special information known only to experts
`;
  }
}

/**
 * English transition template generation
 */
function generateEnglishTransitionTemplate(config: EnglishNotebookPodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
Host: "Wow, time flies! Now we're really heading to the first exhibition hall..."

Curator: "Yes, let's go to ${config.curatorContent?.exhibitions?.[0]?.name || 'the Silla Hall'}. There we'll see..."

Host: "Oh, I'm excited! Listeners, shall we go in together?"

Curator: "Let's take a journey back 1,500 years to ancient Silla."
`;
  } else {
    return `
Host: "Time really goes by fast. What's next..."

Curator: "${exhibition?.next_direction || 'We\'ll move to the next exhibition hall'}. There we'll find even more amazing..."

Host: "Are our listeners as excited as I am? Let's continue together!"

Curator: "Yes, there are even more incredible stories waiting for us."
`;
  }
}

/**
 * English helper functions
 */
function generateEnglishCuratorName(): string {
  const names = ['Dr. Johnson', 'Dr. Smith', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateEnglishScaleComparison(): string {
  const comparisons = [
    'the 6th largest in the world. The total floor area alone is 130,000 square meters...',
    'the size of 18 football fields. With over 420,000 artifacts...',
    'about half the size of Central Park...'
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateEnglishSurpriseReaction(): string {
  const reactions = [
    "130,000 square meters? I can't even imagine that",
    "Wow! That big?",
    "I never imagined it would be that large"
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

function generateEnglishSpecificFacts(): string {
  return 'Over 420,000 pieces. Of those, about 15,000 are on display';
}

function generateEnglishCuriousQuestion(): string {
  const questions = [
    "Wait, so what about the rest",
    "How do you manage so many artifacts",
    "How did you acquire so many pieces"
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateEnglishEngagingAnswer(): string {
  return "They're in storage. We rotate them periodically for exhibition...";
}

function generateEnglishEnvironmentObservation(): string {
  const observations = [
    "lighting is quite unique",
    "atmosphere completely changed",
    "temperature feels different"
  ];
  return observations[Math.floor(Math.random() * observations.length)];
}

function generateEnglishTechnicalExplanation(): string {
  return 'To protect the artifacts, we maintain lighting at 50 lux or below';
}

function generateEnglishComparison(): string {
  const comparisons = [
    "How dark is 50 lux exactly",
    "So it's much darker than usual",
    "Is it darker than normal indoor lighting"
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateEnglishDetailedExplanation(): string {
  return 'A typical office is about 500 lux, so this is 1/10th of that. It seems dark at first, but once your eyes adjust';
}

function generateEnglishArtworkSpotting(): string {
  const spottings = [
    "something sparkling over there",
    "that golden gleaming object",
    "something shining in gold that catches my eye"
  ];
  return spottings[Math.floor(Math.random() * spottings.length)];
}

/**
 * Compatibility wrapper for existing system
 */
export function createEnglishEnhancedPodcastPrompt(
  museumName: string,
  curatorContent: any,
  chapterIndex: number,
  exhibition?: any
): string {
  return createEnglishNotebookPodcastPrompt({
    museumName,
    curatorContent, 
    chapterIndex,
    exhibition,
    targetLength: 3500
  });
}

export default {
  createEnglishNotebookPodcastPrompt,
  createEnglishEnhancedPodcastPrompt,
  ENGLISH_NOTEBOOKLM_PATTERNS,
  ENGLISH_DIALOGUE_STRUCTURE
};