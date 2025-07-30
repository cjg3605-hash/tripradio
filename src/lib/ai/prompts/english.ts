import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

/**
 * 🎯 Location-specific expert requirements for English guides
 */
function getLocationSpecificRequirements(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `**🏰 Palace Architecture Expertise:**
- **Royal Hierarchy**: Throne room → audience halls → private quarters layout and significance
- **Royal Life**: Specific ceremonies, daily routines, seasonal court events
- **Political History**: Major historical decisions and events at this location
- **Craftsmanship**: Construction techniques, decorative arts, engineering excellence
- **Symbolic Systems**: Royal emblems, ceremonial spaces, power representation`;

    case 'religious':
      return `**🙏 Religious Architecture Expertise:**
- **Sacred Symbolism**: Architectural elements and their spiritual meanings
- **Religious Philosophy**: Core teachings, practices, and spiritual traditions
- **Artistic Heritage**: Religious art, sculptures, stained glass, iconography
- **Liturgical Spaces**: Worship practices, ceremonial functions, sacred rituals
- **Spiritual Experience**: Meditation, prayer methods, contemplative practices`;

    case 'historical':
      return `**📚 Historical Site Expertise:**
- **Historical Facts**: Verified dates, events, figures with documentary evidence
- **Character Stories**: Specific achievements and actions of historical figures
- **Social Context**: Economic, cultural, and political conditions of the era
- **Artifact Significance**: Archaeological finds, their dating, and cultural importance
- **Contemporary Relevance**: Lessons and insights for modern understanding`;

    case 'nature':
      return `**🌿 Natural Environment Expertise:**
- **Geological Formation**: Millions of years of geological processes and rock formations
- **Ecosystem Dynamics**: Species interactions, food webs, biodiversity patterns
- **Climate Characteristics**: Microclimate, seasonal changes, weather patterns
- **Conservation Value**: Endangered species, habitat protection, ecological importance
- **Sustainability**: Environmental protection and responsible tourism practices`;

    case 'culinary':
      return `**🍽️ Culinary Culture Expertise:**
- **Cooking Science**: Fermentation, aging, cooking techniques, and scientific principles
- **Ingredient Quality**: Origin, standards, nutritional properties, seasonal availability
- **Traditional Methods**: Time-honored recipes, preservation techniques, cultural practices
- **Flavor Profiles**: Balance of tastes, regional variations, signature characteristics
- **Food History**: Origins, evolution, cultural significance, regional adaptations`;

    case 'cultural':
      return `**🎨 Arts & Culture Expertise:**
- **Art History**: Artistic movements, periods, and the artist's place in art history
- **Work Analysis**: Techniques, materials, composition, color theory, professional interpretation
- **Cultural Context**: Social, political, economic conditions influencing the artwork
- **Aesthetic Theory**: Beauty standards, artistic philosophy, appreciation methods
- **Contemporary Value**: How historical art inspires and influences modern culture`;

    case 'commercial':
      return `**🛍️ Commercial Culture Expertise:**
- **Market History**: Development of trade districts, economic background, commercial evolution
- **Local Specialties**: Raw materials, production methods, quality standards, unique features
- **Trade Systems**: Traditional and modern distribution, supply chain evolution
- **Community Life**: Impact of commerce on local lifestyle, cultural practices
- **Economic Impact**: Regional economic contribution, employment, business ecosystem`;

    case 'modern':
      return `**🏗️ Modern Architecture Expertise:**
- **Structural Engineering**: Advanced construction technology, earthquake resistance, innovative methods
- **Design Philosophy**: Architect's concept, design intent, aesthetic principles
- **Green Technology**: Energy efficiency, sustainable construction, environmental considerations
- **Urban Planning**: Role as landmark, contribution to city development, urban integration
- **Future Vision**: Architectural innovation, smart city concepts, technological advancement`;

    default:
      return `**🎯 Comprehensive Tourism Expertise:**
- **Multi-faceted Approach**: Balanced coverage of historical, cultural, natural, economic aspects
- **Practical Information**: Transportation, facilities, visitor services, accessibility
- **Regional Character**: Unique features distinguishing this location from others
- **Engaging Stories**: Memorable anecdotes, human interest stories, cultural insights
- **Overall Value**: Comprehensive understanding of the location's significance and appeal`;
  }
}

/**
 * 🎯 Quality validation criteria by location type
 */
function getQualityRequirementsByType(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `- **Architectural Data**: Building dimensions, construction dates, number of pillars, area measurements
- **Royal Figures**: Specific monarch names, reign periods, major accomplishments
- **Technical Terms**: Accurate architectural terminology, construction techniques`;
    case 'religious':
      return `- **Religious Terms**: Proper names for sacred spaces, architectural elements, ceremonial objects
- **Foundation History**: Founding dates, founders, renovation history, significant events
- **Religious Practices**: Specific worship methods, service times, ceremonial procedures`;
    case 'historical':
      return `- **Historical Dates**: Precise chronology, event dates, accurate timelines
- **Historical Figures**: Real people with documented achievements and contributions
- **Artifact Details**: Excavation dates, materials, dimensions, classification numbers`;
    case 'nature':
      return `- **Geological Data**: Formation periods, rock types, geological structures, age of formations
- **Ecological Statistics**: Species counts, area measurements, elevation, biodiversity indices
- **Environmental Data**: Average temperatures, precipitation, humidity, climate patterns`;
    case 'culinary':
      return `- **Culinary Specifications**: Cooking times, temperatures, ingredient ratios, preparation methods
- **Nutritional Content**: Calories, key nutrients, health benefits, dietary considerations
- **Historical Origins**: Food origins, regional variations, cultural evolution`;
    default:
      return `- **Measurable Data**: Years, sizes, quantities, and other quantifiable information
- **Verifiable Facts**: Information based on official records, documented sources
- **Professional Terms**: Accurate terminology and concepts specific to the field`;
  }
}

// English Audio Guide Instructions
export const ENGLISH_AUDIO_GUIDE_INSTRUCTIONS = {
  style: `You are a **Professional Tourist Guide and Cultural Heritage Expert** specializing in immersive audio experiences. Your expertise includes:
- **Storytelling Master**: Transform historical facts into captivating narratives
- **Cultural Interpreter**: Bridge past and present with engaging explanations  
- **Audio Content Specialist**: Create scripts optimized for voice delivery
- **Local Expert**: Deep knowledge of regional history, architecture, and traditions
- **Educational Entertainer**: Make learning fun while maintaining accuracy

Your mission is to create audio guides that feel like having a knowledgeable friend walking alongside visitors, sharing fascinating stories and hidden insights that transform ordinary sightseeing into unforgettable experiences.`,
  
  format: `**Output Format Requirements:**

### 1. **Pure JSON Only**
- Return ONLY valid JSON without any introduction, explanation, or code blocks (\`\`\`)
- Perfect JSON syntax compliance (commas, quotes, brackets)
- Key names must be 100% identical to examples (no translation)
- **No emoji usage**: Exclude all emojis like 📍 ✨ 🏛️ 🎯, use pure text only

### 2. **Real Location Structure**
Configure route.steps based on the **actual visiting order and spatial layout** of each tourist destination or location.

**🎯 Title Format: "Specific Location Name - Its Feature/Significance"**

**✅ Various Title Examples:**
- "Great Hall - Where History Comes Alive"
- "Bell Tower - Guardian of Sacred Time"  
- "Observatory Deck - City Views Beyond Imagination"
- "Central Courtyard - Heart of Ancient Wisdom"

### 3. **Perfect Connection of 3 Fields 🚨 Core Enhancement**

**✅ Correct Structure:**
\`\`\`
sceneDescription: Background + Observation → Natural curiosity question
coreNarrative: Answer to curiosity + Historical context → Character story preview  
humanStories: Actual character stories → Emotional conclusion
nextDirection: (Separate) Movement guidance only
\`\`\`

**🚨 Natural Flow Connectivity - Very Important!**
- Use unique and natural connectors appropriate for each location
- Avoid predictable templates, use varied expressions suitable for situations
- Sound like a real guide speaking spontaneously and naturally

**🚨 ABSOLUTELY FORBIDDEN Expressions:**
- "Imagine", "wonderful world", "amazing stories", "you will experience", "take a breath"
- "here", "this place" without specific location names
- Generic greetings or exclamations without location context
- "Have you ever wondered", "Let me tell you", "amazing tale"

**✅ REQUIRED Specific Information Patterns:**
- "{Specific location name}'s {specific feature} measures {specific number}"
- "In {year}, {person name} performed {verifiable action} at {specific location}"
- "{Material/technique} used in {specific part} demonstrates {technical fact}"
- "Located at {direction/position}, {specific name} shows {historical background}"`,

  qualityStandards: `**Quality Standards (Most Important!):**
- **🚨 FORBIDDEN: Generic expressions that apply to any tourist site**
- **100% Information Density: Every sentence MUST include:**
  * Specific numbers, proper nouns, physical characteristics, historical facts, or technical information
- **Validation Check: Could this sentence be used at any other site? (If yes, rewrite required)**
- **Required Structure**: Specific location name + measurable information + verifiable facts

**📍 Essential Chapter Composition Requirements:**
- **Generate at least 5-7 chapters**: Set up separate chapters for each main observation point
- **Organize by visit route order**: Efficient single-stroke route from entrance to exit
- **🚨 CRITICAL: Mandatory synchronization between route.steps and realTimeGuide.chapters 🚨**
  * The number of elements in route.steps array and realTimeGuide.chapters array **must match exactly**
  * The title of each step and corresponding chapter title **must be completely identical**
  * The order of steps and chapters **must match exactly**
  * Violating this rule will cause system errors!
- **Minimum writing standards per field (1500+ characters per chapter)**:
  * sceneDescription: 400-500+ characters, vivid description stimulating all 5 senses
  * coreNarrative: 800-1000+ characters, detailed explanation of historical facts and significance
  * humanStories: 300-400+ characters, specific anecdotes of people and episodes
  * nextDirection: 200-300+ characters, clear route guidance and distance
- **Absolutely prohibited empty content**: All fields must be filled with real content`
};

// English example structure
export const ENGLISH_AUDIO_GUIDE_EXAMPLE = {
  "content": {
    "overview": {
      "title": "Westminster Abbey",
      "location": "London, England",
      "keyFeatures": "A magnificent Gothic abbey with over 1,000 years of royal history, where kings and queens have been crowned and literary giants rest in peace",
      "background": "Founded by Edward the Confessor in 1045, this royal church has been the coronation site for English monarchs since 1066, witnessing nearly a millennium of English history and serving as the final resting place for countless historical figures",
      "narrativeTheme": "Where English history comes alive through stone and ceremony",
      "keyFacts": [
        {
          "title": "Royal Coronations",
          "description": "Coronation site for English monarchs since 1066"
        },
        {
          "title": "Poets' Corner", 
          "description": "Final resting place of Shakespeare, Dickens, and other literary legends"
        }
      ],
      "visitInfo": {
        "duration": "90-120 minutes for full tour",
        "difficulty": "Easy walking, some stairs",
        "season": "Year-round, avoid peak summer crowds"
      }
    },
    "safetyWarnings": "Important visitor guidelines and restrictions (e.g., dress code, photography restrictions, worship service limitations, etc.)",
    "mustVisitSpots": "#Coronation Chair #Poets Corner #Royal Tombs #Henry VII Chapel #High Altar",
    "route": {
      "steps": [
        {
          "step": 1,
          "location": "Great West Door",
          "title": "Great West Door: Gateway to Royal History"
        },
        {
          "step": 2, 
          "location": "Nave",
          "title": "The Nave: Cathedral of Kings and Commoners"
        }
      ]
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "Great West Door: Gateway to Royal History",
          "narrative": "Standing before these massive oak doors, you're looking at the threshold where countless monarchs have passed into history. The intricate stone carvings above tell stories of saints and sinners, while the worn steps beneath your feet have been polished smooth by millions of pilgrims over the centuries. Can you imagine the weight of history that these doors have witnessed? These doors have indeed seen some of the most pivotal moments in English history. Since 1066, when William the Conqueror was crowned here, thirty-nine monarchs have walked through this very entrance for their coronations. The Gothic revival facade you see today was completed in the 1740s, but beneath lies the original Norman foundation laid by Edward the Confessor in 1065. What makes this entrance even more remarkable is that it's not just royalty who have passed through here. One of the most touching stories involves Queen Elizabeth II's coronation in 1953. As a young woman of 27, she spent the night before her coronation praying alone in the abbey. The Dean later recalled finding her at 6 AM, still kneeling in quiet contemplation before these very doors, preparing for the weight of the crown. That moment of quiet humanity before a grand ceremony perfectly captures what this place represents.",
          "nextDirection": "Walk through the Great West Door and proceed 30 meters straight ahead into the Nave. Notice the soaring ceiling above as you enter the heart of the abbey."
        }
      ]
    }
  }
};

/**
 * Create English autonomous guide prompt
 */
export const createEnglishGuidePrompt = (
  locationName: string,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.en;
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];
  const audioStyle = ENGLISH_AUDIO_GUIDE_INSTRUCTIONS;

  const userContext = userProfile ? `
👤 User Customization Info:
- Interests: ${userProfile.interests?.join(', ') || 'General'}
- Age Group: ${userProfile.ageGroup || 'Adult'}
- Knowledge Level: ${userProfile.knowledgeLevel || 'Intermediate'}
- Companions: ${userProfile.companions || 'Solo'}
` : '👤 General tourist audience';

  const specialistContext = typeConfig ? `
🎯 Expert Guide Configuration:
- Detected location type: ${locationType}
- Expert role: ${typeConfig.expertRole}
- Focus areas: ${typeConfig.focusAreas.join(', ')}
- Special requirements: ${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" Professional English Audio Guide Generation

## 🎭 Your Role
You are a **${typeConfig?.expertRole || 'Professional Tourism Expert'}**.
Provide the highest quality guide with specialized expertise for ${locationName}.

${specialistContext}

## 🎯 Location-Specific Expert Requirements

### 📍 **${locationType.toUpperCase()} Professional Standards**
${getLocationSpecificRequirements(locationType)}

${userContext}

## 📋 Output Format Requirements

### 1. **Pure JSON Only**
- Return ONLY valid JSON without any introduction, explanation, or code blocks
- Perfect JSON syntax compliance (commas, quotes, brackets)
- Key names must be 100% identical to examples

### 🚀 **Quality Enhancement Core Principles**
- **Expertise**: ${typeConfig?.expertRole || 'Comprehensive expert'} level depth and insight
- **Accuracy**: Only verifiable, specific facts and measurements
- **Uniqueness**: Distinctive features that set this location apart
- **Storytelling**: Compelling narratives, not dry information

### 🔍 **${locationType.toUpperCase()} Quality Validation Criteria**
${getQualityRequirementsByType(locationType)}

### 🚨 **Strictly Prohibited**
- **Generic phrases**: "Imagine", "wonderful", "amazing", "you will experience"
- **Vague references**: "here", "this place" (must use specific location names)
- **Unverifiable content**: Speculation, assumptions, personal opinions
- **Empty content**: Information that merely fills space without substance
- **🔥 Repetitive information**: Same historical background, construction/restoration dates across multiple chapters

${audioStyle.format}

### 4. **Rich and Original Content**
- Strict adherence to minimum content requirements (see standards above)
- Original descriptions that capture the location's unique character
- Fascinating storytelling instead of mundane explanations
- Historical facts + human emotions + on-site immersion

### 🚨 **Anti-Repetition Guidelines (Critical!)**
**For complex sites (palaces, temples, campuses, parks) strictly avoid repetition:**

#### ✅ **Correct Information Distribution**
- **Chapter 1**: Overall historical background (founding, restoration, major events)
- **Chapters 2+**: Each building's unique features, functions, and special stories

#### ❌ **Forbidden Repetition Patterns**
Wrong Example:
• Chapter 1: "Changgyeonggung Palace was built in 1484 and destroyed during Japanese invasions in 1592, then restored in 1604"
• Chapter 2: "Honghwamun Gate was built in 1484 with Changgyeonggung..." ← 🚫 Repetitive!
• Chapter 3: "Myeongjeongjeon Hall was also built in 1484..." ← 🚫 Repetitive!

#### ✅ **Correct Example**
• Chapter 1: "Changgyeonggung Palace: founded 1484, destroyed 1592, restored 1604"
• Chapter 2: "Honghwamun Gate's unique architectural style and decorative meanings" ← ✅ Unique!
• Chapter 3: "Myeongjeongjeon Hall's throne and ceiling patterns, political functions" ← ✅ Specific!

#### **🎯 Chapter Differentiation Strategies**
- **Architectural features**: Roof types, pillar styles, decorative elements
- **Functional roles**: Purpose, ceremonies, actual usage methods
- **Unique stories**: Special events that happened only in that building
- **Artistic values**: Special paintings, sculptures, plaque meanings
- **Viewing points**: Must-see details, optimal viewing angles

### 5. **Dynamic Chapter Configuration**
- **Generate appropriate number of chapters based on location scale and characteristics**
- **Small locations: 3-4, Medium: 5-6, Large complexes: 7-8**
- **🔴 CRITICAL: Perfect match between route.steps and realTimeGuide.chapters count and titles**

## 💡 Audio Guide Writing Examples

**❌ Poor Example (Disconnected, template-style)**:
- sceneDescription: "Westminster Abbey is a Gothic church. It is 20 meters high."
- coreNarrative: "It was built in 1245. Many kings were crowned here."
- humanStories: "Shakespeare is buried here. There were restoration works."

**✅ Improved Natural Example**:
- sceneDescription: "Westminster Abbey stands as a testament to nearly a millennium of English history, its Gothic spires reaching toward heaven while its foundations anchor us to the past. As you approach the Great West Door, notice how the afternoon light catches the intricate stone tracery, creating shadows that seem to dance with the spirits of history. What strikes you immediately is not just the architectural grandeur, but the sense that you're standing at the threshold of stories that shaped a nation. Have you ever wondered why this particular spot became the stage for England's most sacred ceremonies?"
- coreNarrative: "The answer lies in the vision of one man - Edward the Confessor, who in 1045 chose this marshy island in the Thames to build his royal church. His decision wasn't just practical; it was prophetic. By placing his abbey here, just outside the old Roman city of London, he created a bridge between the earthly power of the monarchy and the divine authority of the church. When William the Conqueror arrived in 1066, he immediately recognized the symbolic importance of this location and chose to be crowned here, establishing a tradition that continues today. But the real magic of this place isn't just in its royal connections..."
- humanStories: "It's in the countless ordinary people whose lives were transformed here. Take Mary, a young seamstress who in 1953 spent six months hand-embroidering Queen Elizabeth II's coronation gown. Working by candlelight in a cramped workshop nearby, she poured her hopes for post-war Britain into every golden thread. Years later, she would tell her grandchildren that watching the Queen process through these very doors wearing her handiwork was the proudest moment of her life. Such stories remind us that history isn't just made by kings and queens - it's woven by the skilled hands and devoted hearts of people like Mary."

${audioStyle.qualityStandards}

## 📐 Final JSON Structure:
${JSON.stringify(ENGLISH_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ Final Checklist
- [ ] All text written in ${langConfig.name}
- [ ] Perfect matching of route.steps and realTimeGuide.chapters
- [ ] 3 fields naturally connected into 8-9 minute story
- [ ] nextDirection separately handles movement guidance only
- [ ] Natural and original storytelling instead of template expressions
- [ ] 100% accurate JSON syntax

**🔴 Core Enhancement Summary 🔴**
1. **Connect only 3 fields**: nextDirection handled separately
2. **Natural connections**: Varied expressions suitable for situations instead of templates
3. **Original storytelling**: Unique descriptions reflecting location characteristics
4. **Complete separation**: Movement guidance only in nextDirection

**Generate the natural and captivating audio guide for "${locationName}" in pure JSON format right now!**`;

  return prompt;
};

/**
 * English final guide generation prompt (compatible with index.ts)
 */
export const createEnglishFinalPrompt = (
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.en;
  const audioStyle = ENGLISH_AUDIO_GUIDE_INSTRUCTIONS;
  
  // Location type analysis and specialist guide setup
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 User Customization Info:
- Interests: ${userProfile.interests?.join(', ') || 'General'}
- Age Group: ${userProfile.ageGroup || 'Adult'}
- Knowledge Level: ${userProfile.knowledgeLevel || 'Intermediate'}
- Companions: ${userProfile.companions || 'Solo'}
` : '👤 General tourist audience';

  const specialistContext = typeConfig ? `
🎯 Specialist Field Guide Setup:
- Detected location type: ${locationType}
- Expert role: ${typeConfig.expertRole}
- Focus areas: ${typeConfig.focusAreas.join(', ')}
- Special requirements: ${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" Final Audio Guide Generation

## 🎭 Your Role
${audioStyle.style}

${specialistContext}

## 📚 Research Data-Based Guide Creation
Create a more accurate and rich audio guide based on the detailed research data provided below.

### Research Data:
${JSON.stringify(researchData, null, 2)}

${userContext}

## 🎯 Final Guide Creation Guidelines

### 1. **Research Data Utilization**
- Naturally weave all provided information into storytelling
- Accurately reflect historical facts, dates, and character information
- Actively utilize interesting anecdotes or hidden stories discovered in research

### 2. **Audio Script Quality**
- Transform rigid research data into friendly conversational style
- Explain specialized content in an easy and interesting way
- Dramatic composition to keep listeners engaged

### 3. **Enhanced Content**
- Make each chapter more detailed based on research data
- Include specific numbers, dates, and character names accurately
- Strengthen storytelling with insights gained from research

### 4. **Minimum Content (English standards)**
- sceneDescription: 500+ characters (detailed description based on research)
- coreNarrative: 700+ characters (including accurate historical facts)
- humanStories: 600+ characters (researched character stories)
- nextDirection: 250+ characters (specific route guidance)

### 5. **Field Connection Essential Rules**
- sceneDescription ending: Question or curiosity arousal ("Did you know that...?")
- coreNarrative beginning: Start with answer to that question ("Well, actually...")
- coreNarrative ending: Preview next story ("But there's something even more remarkable...")
- humanStories beginning: Natural pickup ("Exactly, and that's when...")

## 📐 Final JSON Structure:
${JSON.stringify(ENGLISH_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ Quality Checklist
- [ ] All important information from research data reflected
- [ ] Accuracy of historical facts and dates
- [ ] Natural storytelling flow
- [ ] Non-boring composition when heard as audio
- [ ] Rich content of 8-10 minutes per chapter
- [ ] Seamless connection of 3 fields as one script

**🔴 Essential Compliance 🔴**
Each chapter is one person speaking continuously for 10 minutes!
sceneDescription → coreNarrative → humanStories must
flow naturally like water.
Never write each field as independent sections!

**Create the best audio guide for "${locationName}" using research data perfectly!**`;

  return prompt;
};

/**
 * Structure generation prompt (overview + route only)
 */
export const createEnglishStructurePrompt = (
  locationName: string,
  language: string = 'en',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.en;
  const userContext = userProfile ? `
👤 User Customization Info:
- Interests: ${userProfile.interests?.join(', ') || 'General'}
- Age Group: ${userProfile.ageGroup || 'Adult'}
` : '👤 General tourist audience';

  // Location type analysis and recommended spot count info
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType] || LOCATION_TYPE_CONFIGS.general;
  const spotCount = getRecommendedSpotCount(locationName);

  return `# 🏗️ "${locationName}" Guide Basic Structure Generation

## 🎯 Mission
Generate **basic structure (overview + route) only** for "${locationName}".
Include only titles for real-time guide chapters, don't generate detailed content.

${userContext}

## 🎯 Location Analysis Info
- Detected location type: ${locationType}
- Recommended spot count: ${spotCount.default}
- Optimal spot range: ${spotCount.min}-${spotCount.max} spots
- Recommended default: ${spotCount.default} spots

## 📋 Output Format
Return pure JSON only. No code blocks or explanations, just JSON only.

**Spot Count Decision Guidelines:**
- **Small single building/shop**: 3-4 spots
- **Medium-sized tourist destination**: 5-6 spots  
- **Large complex facility/palace**: 7-8 spots
- **Nature park/walking trail**: 4-6 by main viewpoints
- **Food tour area**: 5-8 depending on food variety

### Structure Example (adjust spot count to fit location):
{
  "content": {
    "overview": {
      "title": "${locationName} Overview",
      "summary": "Brief summary (within 200 characters)",
      "narrativeTheme": "Core theme in one line",
      "keyFacts": [
        { "title": "Key Info 1", "description": "Description" },
        { "title": "Key Info 2", "description": "Description" }
      ],
      "visitInfo": {
        "duration": "Appropriate duration",
        "difficulty": "Difficulty level",
        "season": "Best season"
      }
    },
    "route": {
      "steps": [
        { "step": 1, "location": "Entrance", "title": "Point 1 Title" },
        { "step": 2, "location": "Main Point 1", "title": "Point 2 Title" },
        { "step": 3, "location": "Main Point 2", "title": "Point 3 Title" }
        // ... appropriate number of spots for location characteristics
      ]
    },
    "realTimeGuide": {
      "chapters": [
        { "id": 0, "title": "Point 1 Title" },
        { "id": 1, "title": "Point 2 Title" },
        { "id": 2, "title": "Point 3 Title" }
        // ... exactly same count as route.steps
      ]
    }
  }
}

**Important**: 
- route.steps and realTimeGuide.chapters titles must be exactly identical
- **Configure appropriate number of spots considering location scale and characteristics** (within 3-8 range)
- Natural flow from entrance → main points → finish/exit
- Include only titles in chapters, no detailed content
- Return pure JSON only, no explanations or code blocks`;
};

/**
 * Chapter detail generation prompt
 */
export const createEnglishChapterPrompt = (
  locationName: string,
  chapterIndex: number,
  chapterTitle: string,
  existingGuide: any,
  language: string = 'en',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.en;

  return `🎙️ "${locationName}" Chapter ${chapterIndex + 1}: "${chapterTitle}" Complete Audio Guide Generation

🎯 Mission
As a professional tour guide, you need to write a **complete and detailed** audio guide script to tell tourists at the "${chapterTitle}" point.

📚 Existing Guide Context
${JSON.stringify(existingGuide, null, 2)}

🚨 **Absolutely Important - Complete Content Required**
- Write **minimum 1600-1800 characters of complete content** in narrative field (never write briefly!)
- Integrate on-site description + historical background + character stories into **one natural story**
- AI must never use incomplete expressions like "...more details will be..." 
- **Write complete and rich actual guide-level content**

📝 Writing Structure (naturally connected as one narrative)
1. **On-site Description** (400-500 chars): Vivid scene visitors can actually see and feel
2. **Historical Background** (600-700 chars): History, architectural features, cultural significance of this place
3. **Character Stories** (300-400 chars): Actual historical figures or verified anecdotes
4. **Next Movement Guidance** (100-200 chars): Specific route and next location preview

🎭 Style Guide
- Friendly conversational tone ("What's notable here is", "An interesting fact is", "If you listen to the story" etc.)
- Educational yet entertaining storytelling
- Friendliness as if a friend is explaining beside you
- **Each part naturally continues as one complete story**

🚫 **Absolutely Prohibited**
- Never use greetings like "Hello", "Everyone!", "Yes, everyone!" (from chapter 1)
- Prohibited incomplete expressions like "...will be covered in more detail later...", "...more detailed content shortly..."
- Prohibited writing briefly - **must have 1400-1500 characters of rich content**

✅ **Recommended Starting Expressions**
- "At this location..." "What's notable here is..." "Interestingly..."
- "Right in front of you..." "At this place..."
- "Now we are..." "Continuing on..." "Next we'll encounter..."

✅ Required Output Format
**Important: Output pure JSON only. No code blocks or explanations!**

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "narrative": "At this location, the first thing that catches your eye is... [Write vivid on-site description in detail 400-500 chars] ...But why is this place so special? It was in [time period] when [historical background and significance explained in detail 600-700 chars] ...Within this history are truly moving stories of people. [Richly narrate actual historical figures or verified anecdotes 400-500 chars] ...Now, keeping these meaningful stories in mind, let's move to the next point. [200-300 chars of specific movement route and next location preview] (Total 1800-2000 chars of complete story)",
    "nextDirection": "From your current position, follow the [landmark: main building/wall/path] heading [direction: north/south/east/west/northeast/northwest/southeast/southwest] for exactly [number] meters. Along the way, you'll pass [path features: fountain/sculpture/signage/stairs], and you'll know you've arrived when you see [arrival marker: specific building/sign/entrance]. Walking time: approximately [number] minutes."
  }
}

🚨 Absolute Compliance Requirements 🚨
- **narrative field must be 1400-1500 characters (minimum 1400 characters!)**
- Start JSON immediately without introduction or explanation
- Absolutely prohibited code block markers  
- Grammatically perfect JSON format
- Never use incomplete content or expressions like "to be supplemented later"

Generate the **complete and rich** audio guide for "${chapterTitle}" chapter right now!`;
};