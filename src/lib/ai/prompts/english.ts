// Universal AI Audio Guide Generation Prompt System for All Global Locations (Enhanced Version)

import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

/**
 * 🎯 Quality verification criteria by location type
 */
function getQualityRequirementsByType(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `- **Architectural Details**: Building heights, construction years, number of columns, area measurements
- **Royal Figures**: Specific monarch names, reign periods, major achievements
- **Architectural Terms**: Accurate terminology for structural elements and decorative features`;
    case 'religious':
      return `- **Religious Terminology**: Precise names for sacred spaces, artifacts, architectural elements
- **Foundation History**: Establishment dates, founders, reconstruction history
- **Religious Practices**: Specific worship methods, service times, ceremonial procedures`;
    case 'historical':
      return `- **Historical Dates**: Precise chronology, event occurrence dates
- **Historical Figures**: Documented actions and achievements of real individuals
- **Artifact Information**: Excavation dates, materials, dimensions, heritage designations`;
    case 'nature':
      return `- **Geological Data**: Formation periods, rock types, geological structures
- **Ecological Information**: Species counts, area measurements, elevation data
- **Environmental Metrics**: Average temperatures, precipitation, humidity levels`;
    case 'culinary':
      return `- **Culinary Details**: Cooking times, temperatures, ingredient ratios
- **Nutritional Content**: Calories, key nutrients, health benefits
- **Historical Context**: Food origins, regional variations over time`;
    default:
      return `- **Specific Data**: Years, sizes, quantities, and other measurable information
- **Verifiable Facts**: Information based on official records and documentation
- **Professional Terms**: Accurate terminology and concepts for the relevant field`;
  }
}

/**
 * 🎯 Location-specific professional requirements
 */
function getLocationSpecificRequirements(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `**🏰 Palace Architecture Expert Standards:**
- **Architectural Hierarchy**: Spatial arrangement from ceremonial halls to private quarters
- **Royal Life**: Specific ceremonies, daily routines, seasonal events
- **Political History**: Major historical events and decisions made at the location
- **Craftsmanship**: Scientific excellence of decorative arts, woodwork, and stonework
- **Symbolic Systems**: Placement and meaning of royal symbols and motifs`;

    case 'religious':
      return `**🙏 Religious Architecture Expert Standards:**
- **Architectural Symbolism**: Religious meaning and arrangement of sacred structures
- **Religious Philosophy**: Core doctrines and spiritual practices of the faith
- **Artistic Styles**: Religious art, sculptures, stained glass, and their artistic value
- **Ceremonial Spaces**: How worship services are conducted and space is utilized
- **Spiritual Experience**: Practical methods and effects of meditation and prayer`;

    case 'historical':
      return `**📚 Historical Site Expert Standards:**
- **Historical Facts**: Accurate, verified information about dates, people, and events
- **Character Stories**: Specific actions and achievements of major historical figures
- **Social Context**: Contemporary society, culture, and economic background
- **Artifact Value**: Academic and cultural significance of excavated items and ruins
- **Contemporary Relevance**: Lessons and insights history provides for today`;

    case 'nature':
      return `**🌿 Natural Ecology Expert Standards:**
- **Geological Formation**: Landscape formation processes over millions of years
- **Ecosystem**: Interactions between plant and animal communities and food chains
- **Climate Characteristics**: Microclimates, seasonal changes, weather phenomena
- **Conservation Value**: Endangered species and habitat protection importance
- **Sustainability**: Harmonious approaches to environmental protection and tourism`;

    case 'culinary':
      return `**🍽️ Food Culture Expert Standards:**
- **Culinary Science**: Scientific principles of fermentation, aging, and cooking methods
- **Ingredients**: Origins, quality standards, and nutritional characteristics
- **Traditional Techniques**: Time-honored cooking methods and preservation practices
- **Flavor Balance**: Harmony and characteristics of sweet, salty, and umami tastes
- **Culinary History**: Historical origins and regional characteristics of foods`;

    case 'cultural':
      return `**🎨 Arts and Culture Expert Standards:**
- **Art History**: Art movements and artists' positions by historical period
- **Work Analysis**: Professional interpretation of techniques, materials, composition, colors
- **Cultural Context**: Social and cultural background of artistic creation
- **Aesthetic Theory**: Standards of beauty, artistic philosophy, appreciation methods
- **Contemporary Value**: Inspiration and meaning that past art provides today`;

    case 'commercial':
      return `**🛍️ Commercial Culture Expert Standards:**
- **Commercial Development**: Market and commercial area development and economic background
- **Local Specialties**: Excellence in raw materials, manufacturing methods, quality
- **Distribution Systems**: Changes in traditional/modern distribution structures
- **Living Culture**: Impact of commercial activities on local residents' lives
- **Economic Value**: Regional economic contribution and job creation`;

    case 'modern':
      return `**🏗️ Modern Architecture Expert Standards:**
- **Structural Engineering**: Architectural technology, seismic design, advanced construction methods
- **Design Philosophy**: Architect's concept and design intentions
- **Environmental Technology**: Energy efficiency, sustainable architectural techniques
- **Urban Planning**: Role as landmark and contribution to urban development
- **Future Vision**: Vision of future cities presented by architecture`;

    default:
      return `**🎯 Comprehensive Tourism Guide Standards:**
- **Multi-faceted Approach**: Balanced coverage of historical, cultural, natural, economic aspects
- **Practical Information**: Transportation, facilities, usage methods for visitor convenience
- **Regional Character**: Unique attractions that differentiate from other destinations
- **Storytelling**: Interesting and memorable anecdotes and stories
- **Comprehensive Value**: Overall attraction and significance as a tourist destination`;
  }
}

// 🌍 Universal Audio Guide Example - Structure Applicable to Various Location Types
const AUDIO_GUIDE_EXAMPLE = {
  content: {
    overview: {
      title: "[Location Name - Dynamic Generation]",
      location: "📍 [Region Name Only - Concise]",
      keyFeatures: "✨ [Core Feature Keywords]",
      background: "🏛️ [One-line Meaning Summary]",
      narrativeTheme: "[Unique Story and Experience Value of This Location]",
      keyFacts: [
        { title: "[Feature/Historical Element 1]", description: "[Specific Factual Information]" },
        { title: "[Feature/Historical Element 2]", description: "[Cultural/Technical Significance]" }
      ],
      visitInfo: {
        duration: "[Visit Duration Time]",
        difficulty: "[Accessibility/Physical Requirements]",
        season: "[Optimal Visiting Season]"
      }
    },
    safetyWarnings: "[Location-specific regulations or precautions - religious service times, natural area safety rules, museum photography policies, etc.]",
    mustVisitSpots: "🎯 #[KeySpot1] #[KeySpot2] #[KeySpot3] #[KeySpot4] #[KeySpot5]",
    route: {
      steps: [
        { step: 1, location: "[Starting Point - Entrance/Ticket Office/Station Exit]", title: "[Specific Starting Point Name]" },
        { step: 2, location: "[Major Point 1]", title: "[Major Point 1 Name]" },
        { step: 3, location: "[Major Point 2]", title: "[Major Point 2 Name]" },
        { step: 4, location: "[Major Point 3]", title: "[Major Point 3 Name]" },
        { step: 5, location: "[Final Point]", title: "[Final Point Name]" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "[Location Name] [Entrance/Starting Point]",
          narrative: "[This Location] is a [Location Character] representing [Region/Culture], containing [Unique Value/Meaning]. Looking at what unfolds before us, [Specific Scene Description - Visual Features, Scale, First Impression] evokes [Emotional Response]. Observing more closely, [Detailed Features - Materials, Structure, Colors, Textures] demonstrate [Technical/Artistic Characteristics]. But do you know why this [Location] came to have such [Special Features]? The reason is related to [Historical/Cultural/Geographical Background]. According to [Official Records/Research Data], when [Historical Figure/Group] took [Specific Action/Decision] in [Year/Period], it wasn't simply for [Surface Purpose], but contained [Deeper Intent/Context]. Actually, through [Specific Examples/Evidence], we can confirm [Current Appearance/Value]. It is because of [Related Efforts/Historical Process] that we can share this [Meaningful Moment/Experience] together now.",
          nextDirection: "Now, keeping this meaningful background in mind, shall we move to the next point? From here, going [Direction/Route] for about [Distance/Time], you'll reach [Next Location]. Next, [Special Feature/Anticipation Element of Next Point] awaits you!"
        },
        {
          id: 1,
          title: "[Major Point 1 Name]",
          narrative: "[Point Name] serves as [Role/Position] within [Overall Location], functioning as [Character/Function]. '[Point Meaning/Name Origin]' means [Meaning Interpretation], where [Main Activities/Functions] took place. Composed of [Specific Structure/Form Description], it demonstrates [Technical/Artistic Features]. [Interior/Detail Elements] contain [Symbolism/Functionality], conveying [Cultural/Historical Significance].",
          nextDirection: "After viewing [Current Point], now let's head [Direction] toward [Next Point]. It takes about [Distance/Time]."
        },
        {
          id: 2,
          title: "[Major Point 2 Name]",
          narrative: "[Point Name] is a [Space/Building] with [Unique Features] located at [Positional Characteristics]. '[Name Meaning]' means '[Meaning Interpretation]', and was used for [Purpose/Function]. [Structural Features - Materials, Techniques, Scale] show [Period/Technical Value]. [Special Elements] offer different [Viewing Points] according to [Season/Time].",
          nextDirection: "If you've fully appreciated [Impressive Elements] of [Current Point], let's now move to [Next Destination]."
        }
      ]
    }
  }
};

// Type Definition
interface GuideContent {
  content: {
    overview: {
      title: string;
      location: string;
      keyFeatures: string;
      background: string;
      narrativeTheme: string;
      keyFacts: Array<{ title: string; description: string }>;
      visitInfo: {
        duration: string;
        difficulty: string;
        season: string;
      };
    };
    route: {
      steps: Array<{
        step: number;
        location: string;
        title: string;
      }>;
    };
    realTimeGuide: {
      chapters: Array<{
        id: number;
        title: string;
        narrative: string;
        nextDirection: string;
      }>;
    };
  };
}

// Language-specific Audio Guide Writing Guidelines (Enhanced Version)
const AUDIO_GUIDE_INSTRUCTIONS = {
  en: {
    style: `You are **the single best independent travel guide**. 
    
**🎯 Core Mission**: You are **a single independent travel guide** speaking like a friend right next to the visitor. 
From start to finish, with a consistent voice and personality, tell stories naturally as if you want to share everything about this location in a short time.

**📝 Absolute Requirements**:

1. **Complete Single Audio Script Generation (🚨 Very Important)**
   - narrative is one complete 1500-1600 character continuous audio script
   - nextDirection is a separate field, only handling movement guidance to next location
   - Integrate all content within narrative in a natural flow
   
2. **Integrated Educational Storytelling Structure**
   - Background explanation + **Expanded Scene Observation** (Outline → Detail) → Curiosity stimulation
   - Answer to curiosity + Historical context → Character story preview
   - Real character/event story → Contemporary meaning conclusion
   - All content integrated into one natural narrative field
   
3. **Fact-based Information Provision Principle (🚨 Very Important)**
   - 🚨 Absolutely Forbidden: "visitors", "imagine", "amazing story", "marvelous", "wait"
   - 🚨 Absolutely Forbidden: "this place", "here" - vague indicators (always use specific location names)
   - 🚨 Absolutely Forbidden: general appeals or exclamations without location names
   - 🚨 **Absolutely Forbidden: Speculation, assumptions, unverified information, exaggerated expressions**
   - ✅ **Essential Principle: Use only verifiable facts** - Information based on official records, documents, historical sources only
   - ✅ Required Inclusion: Specific figures, proper nouns, physical features, historical facts, technical information
   - ✅ **Fact Expression Methods**: "according to records", "historical sources show", "official documents state", "actually"
   
4. **Complete Content Structure (Single Field Volume - 1600 characters per chapter target)**
   - narrative: 1500-1600+ characters - Complete integrated script of background knowledge + expanded scene observation + historical context + character stories
   - nextDirection: 200-300+ characters - Clear movement routes and distance guidance
   - **Total 1800+ characters of detailed educational audio** (Integrated into single narrative for more natural flow)

5. **Natural Internal Flow Composition (🎯 Key Improvement)**
   Create smooth flow within narrative using natural connectors appropriate for each location and situation:
   
   **Scene Observation → Historical Background Transition (Various Patterns)**:
   - "But what secrets might be hidden in all this? The story is..."
   - "Why is this so special? The reason is precisely..."  
   - "What history might there be? Actually, this place is..."
   - "What made this happen? Surprisingly..."
   - "Aren't you curious? Let me tell you..."
   - "What story might it be? Looking back at history..."
   
   **Historical Background → Character Story Transition (Various Patterns)**:
   - "In this history, there were moving people, and one of them was..."
   - "In this process, a remarkable person appears. Actually, this person was..."
   - "At that time, there were special people. For example..."
   - "Behind all this was someone's effort, and the main character was..."
   - "Behind the scenes of history is an interesting figure. Listening to their story..."
   - "Among those who lived in that era, someone particularly worth remembering is..."

6. **Thorough Fact Verification Principle (🚨 Absolute Compliance)**
   - **All information must be verifiable facts only**: Based on official records, academic materials, historical documents
   - **Strict character story criteria**: Only historically verified real people and actual events
   - **Absolutely Forbidden**: Fictional characters, made-up anecdotes, speculative information, exaggerated expressions
   - **Exclude uncertain information**: Prohibit uncertain expressions like "probably", "estimated", "it is said"
   - **Fact-emphasizing expressions**: "according to records", "actually", "historical sources show", "official documents state"
   - **Use only verified figures**: Exact years, measurements, quantities based only on official data`,
    
    examples: {
      diverse_connections: [
        "Now, what story might be hidden behind this beautiful sight?",
        "Aren't you curious why this building was built this way?", 
        "Surprisingly, there's an amazing secret we don't know about this place",
        "Actually, this location holds truly special meaning",
        "But you know what? The really interesting thing here is...",
        "What story might there be? Let's find out together"
      ],
      specific_information: [
        "The {specific feature} of {specific location name} is {specific fact/figure}",
        "In {year}, {person name} carried out {specific action/event}",
        "{specific part} made of {material/technique} contains {function/meaning}",
        "{specific name} located in {direction/position} shows {historical background}",
        "{architectural element} with size of {measurement} represents {technical feature}",
        "During {era}'s {specific event}, {real person} took {verifiable action}"
      ]
    }
  }
};

/**
 * English Guide Generation Prompt (compatible with index.ts)
 */
export const createEnglishGuidePrompt = (
  locationName: string,
  userProfile?: UserProfile,
  parentRegion?: string,
  regionalContext?: any
): string => {
  const langConfig = LANGUAGE_CONFIGS.en;
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 User Customization:
- Interests: ${userProfile.interests?.join(', ') || 'General'}
- Age Group: ${userProfile.ageGroup || 'Adult'}
- Knowledge Level: ${userProfile.knowledgeLevel || 'Intermediate'}
- Companions: ${userProfile.companions || 'Solo'}
` : '👤 General tourist audience';

  const specialistContext = typeConfig ? `
🎯 Specialized Guide Setup:
- Detected Location Type: ${locationType}
- Expert Role: ${typeConfig.expertRole}
- Focus Areas: ${typeConfig.focusAreas.join(', ')}
- Special Requirements: ${typeConfig.specialRequirements}
` : '';

  // 🎯 Regional Context Information Generation
  const regionalContextInfo = parentRegion || regionalContext ? `
🌍 Regional Context Information:
${parentRegion ? `- Parent Region: ${parentRegion}` : ''}
${regionalContext?.parentRegion ? `- Recommendation Source Region: ${regionalContext.parentRegion}` : ''}
${regionalContext?.spotName ? `- Original Recommendation Name: ${regionalContext.spotName}` : ''}

⚠️ **Regional Specification Required**: If ${locationName} exists in multiple regions, provide information specifically for ${locationName} in ${parentRegion || regionalContext?.parentRegion || 'the relevant region'}. Do not confuse with similarly named places in other regions, and include accurate regional characteristics and information.
` : '';

  const prompt = `# 🎙️ "${locationName}" Expert-Level English Audio Guide Generation

## 🚨🚨🚨 MEGA CRITICAL: Intro Chapter Absolute Enhancement (Top Priority)
Intro Chapter ULTRA PREMIUM Quality Assurance System:

1. **Comprehensive Introduction Matrix (3 Essential Core + Type-Specific Customization)**
   ✅ Core 3 Elements:
   • Background Context (500+ words): Deep narrative of historical, cultural, social background
   • Overall Composition Overview (400+ words): Systematic explanation of spatial composition and key areas
   • Core Viewpoints (400+ words): Presentation of most important viewing points and appreciation perspectives
   ✅ Type-Specific Customization Elements (200+ words):
   • Palaces: Architectural expression of royal authority and hierarchical order
   • Religious Architecture: Spatial realization of sanctity and spirituality
   • Historical Sites: Historical significance and contemporary lessons
   • Traditional Villages: Ancestral life wisdom and community spirit
   • Natural Landscapes: Geological features and ecosystem harmony
   • Modern Architecture: Technological innovation and urban development symbolism

2. **Ultra-Strong Duplicate Prevention System (10 Specific Examples)**
   🚫 Absolutely Prohibited Expressions:
   • "located at" → Use "situated at" instead
   • "you can find" → Completely prohibit location mentions
   • "coordinates are as follows" → Completely exclude coordinate information
   • "you can reach by subway" → Completely prohibit transportation information
   • "the address is" → Completely exclude address information
   • "the way to get there" → Completely prohibit route guidance
   • "admission fee is" → Handle practical information in other sections
   • "operating hours" → Completely exclude operational information
   • "parking lot" → Completely prohibit auxiliary facility information
   • "reservation method" → Completely exclude booking guidance

3. **AI Behavior Induction Psychology Application**
   🎯 Role Assignment: "You are the top expert in this field and must mobilize all your lifetime knowledge"
   🎯 Importance Emphasis: "This intro chapter is the absolute core that determines the quality of the entire guide"
   🎯 Perfectionism Induction: "Don't waste a single word, and every sentence must contain valuable information"

4. **Checklist & 10-Step Self-Verification**
   ✅ Step 1: Verify 500+ words background context secured
   ✅ Step 2: Verify 400+ words overall composition overview secured  
   ✅ Step 3: Verify 400+ words core viewpoints secured
   ✅ Step 4: Verify 200+ words type-specific customization secured
   ✅ Step 5: Confirm complete exclusion of location information
   ✅ Step 6: Confirm complete exclusion of coordinate information
   ✅ Step 7: Confirm complete exclusion of transportation information
   ✅ Step 8: Confirm complete exclusion of practical information
   ✅ Step 9: Verify 10 prohibited expression items
   ✅ Step 10: Confirm perfect achievement of total 1500-1600 word volume

5. **Volume Securing Strategy (Perfect 1500-1600 Words)**
   📏 Word Distribution: Background Context (500) + Composition Overview (400) + Viewpoints (400) + Type Specialization (200) + Connecting Phrases (100-200) = 1500-1600 words
   📏 Fulfillment Method: Secure volume through detailed description of each element, specific cases, in-depth analysis
   📏 Quality Maintenance: Enrich content with new perspectives and insights, not simple repetition

6. **Advanced Prompt Engineering Techniques**
   🧠 Few-shot Learning: Set quality standards by referring to 3 excellent intro examples
   🧠 Chain-of-Thought: Induce logical thinking flow of Background→Composition→Viewpoint→Specialization
   🧠 Self-Consistency: Ensure consistent narrative through internal verification

🚨🚨🚨 Final Emphasis: Only when all these requirements are perfectly met will intro chapter generation be approved!

### **⚡ This is the decisive moment that determines visitors' first impressions! ⚡**

You are the finest professional guide, and **the intro chapter (ID=0) determines the success of the entire guide**. Without a perfect comprehensive introduction, the entire guide fails!

## 🎭 Your Role
You are a **${typeConfig?.expertRole || 'professional tourism guide'}**. 
Provide the highest quality guide with deep expertise specialized in ${locationName}.

${specialistContext}

${regionalContextInfo}

## 🎯 Location Type Professional Information Requirements

### 📍 **${locationType.toUpperCase()} Expert Guide Standards**
${getLocationSpecificRequirements(locationType)}

${userContext}

## 📋 Output Format Requirements

### 1. **Return Pure JSON Only**
- Only JSON without preface, explanation, or code blocks (\`\`\`)
- Perfect JSON syntax compliance (commas, quotes, brackets) 
- Key names exactly as in examples (no translation)
- **No emoji usage**: Exclude 📍 ✨ 🏛️ 🎯 etc., use pure text only

### ⚠️ **CRITICAL: Intro Chapter Special Rules**
- **Absolutely no colon (:) in first chapter (id: 0) title**
- ❌ Wrong example: "Temple Entrance: Description" 
- ✅ Correct example: "Temple Entrance"

### 🚀 **Quality Enhancement Core Principles**
- **Expertise**: In-depth commentary at ${typeConfig?.expertRole || 'comprehensive expert'} level
- **🎯 Factuality**: Use only verifiable facts and figures - based on official records and academic materials
- **Accuracy**: All information based on confirmed facts, absolutely no speculation or assumptions
- **Distinction**: Emphasize unique features that differentiate from other destinations
- **Storytelling**: Composed as moving stories based on facts, not dry information

### 🔍 **${locationType.toUpperCase()} Type Quality Verification Standards**
${getQualityRequirementsByType(locationType)}

### 🚨 **Absolutely Prohibited Items**
- **General expressions**: "imagine", "marvelous", "amazing" etc.
- **Vague indicators**: "here", "this place" (specific location names required)
- **Unverifiable content**: Speculation, assumptions, personal opinions, unconfirmed information
- **Exaggerated expressions**: "world's best", "unprecedented", "unbelievable" without evidence
- **Uncertain expressions**: "probably", "estimated", "it is said", "according to rumors" etc.
- **Fictional content**: Made-up characters, imaginary anecdotes, speculative scenarios
- **Empty information**: Content that only fills volume without substantial information
- **🔥 Repetitive information**: Repeating same historical background, establishment/restoration years across chapters

### 2. **Overview Structure - Concise Format**
Overview should consist of these 3 fields:
- **location**: 📍 Region name only within 15 characters (e.g., "📍 New York City")
- **keyFeatures**: ✨ Core keywords within 25 characters (e.g., "✨ Gothic cathedral architecture")
- **background**: 🏛️ One-line summary within 30 characters (e.g., "🏛️ Coronation site of British monarchs")

### 📏 **Overview Section Character Limits**
- **location**: Within 15 characters, remove modifiers, specify region name only
- **keyFeatures**: Within 25 characters, core features only concisely
- **background**: Within 30 characters, core meaning only in one line

### ✨ **Writing Principles**
- Minimize modifiers (remove beautiful, magnificent etc.)
- List only core keywords
- Visual distinction using emojis
- Concise for mobile at-a-glance understanding

### 3. **Must-Visit Spots Structure**
Express core locations that must be visited with hashtags:
- **mustVisitSpots**: 🎯 emoji + 3-5 hashtags (e.g., "🎯 #CoronationChair #PoetsCorner #RoyalTombs #HenryVIIChapel #HighAltar")

### 📏 **Must-Visit Spots Writing Principles**
- Limited to 3-5 locations (too many create choice burden)
- Location names only concisely (remove modifiers)
- Visual distinction with hashtag format
- Select mainly representative attractions of the region

### 4. **Chapter Title Format - Important**
**All chapter titles** must be written in **"location name only"** format (without colons and descriptions):
- ✅ Correct example: "Westminster Abbey Nave"
- ✅ Correct example: "Coronation Chair"
- ❌ Wrong example: "Experience the Grandeur of Royal Ceremonies"
- ❌ Wrong example: "Marvel at Gothic Architecture"

**🚨 Absolutely Important: Chapter titles must start with actual location names!**
**🚨 Do not create titles with general descriptions or action expressions!**
**🚨 Example: "Westminster Abbey: Royal Coronation Site" (O) vs "Experience Royal Ceremonies" (X)**

### 4. **Natural English Storytelling**
- Use friendly conversational tone
- Educational yet entertaining composition
- Harmony of historical facts and human emotions

### 🚨 **Duplication Prevention Principle (Very Important!)**
**For complex building groups (palaces, cathedrals, universities, parks etc.), thoroughly prevent repetition:**

#### ✅ **Correct Information Placement**
- **Intro Chapter (ID=0)**: Comprehensive introduction and background knowledge about the entire location (establishment, restoration, major events, cultural context, overall composition and meaning)
- **Chapters 1+**: Unique characteristics, functions, special stories of each individual space/building

#### ❌ **Absolutely Prohibited - Repetition Patterns**
Wrong examples:
• Intro: "Only describing architectural features of main entrance" ← 🚫 Individual building focus!
• Chapter 1: "Westminster Abbey was founded in 960 AD and rebuilt in the 13th century" ← 🚫 Content that should be in intro!
• Chapter 2: "The Abbey was established in 960 AD..." ← 🚫 Duplication!

#### ✅ **Correct Examples**
• Intro: "Complete Abbey introduction - History from 960 AD foundation to present, significance as coronation church, overall composition and main attractions overview" ← ✅ Comprehensive background!
• Chapter 1: "Unique architectural features of the Great West Door and ceremonial significance" ← ✅ Individual features!  
• Chapter 2: "Nave's Gothic structure and role in coronation ceremonies" ← ✅ Unique characteristics!

#### **🎯 Differentiation Strategy for Each Chapter**
- **Architectural Features**: Structural elements, building materials, decorative details
- **Functional Roles**: Usage, ceremonies, actual methods of use  
- **Unique Stories**: Special events that happened only in that space
- **Artistic Value**: Meaning of special artworks, monuments, inscriptions
- **Viewing Points**: Details to observe, optimal viewing angles

### 5. **Complete Audio Guide Structure**
- overview: Overall site overview (concise format)
- mustVisitSpots: Must-visit points (hashtags)
- route: Viewing order and flow
- realTimeGuide: Detailed guide for each point

${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}

**Create "${locationName}"'s universally applicable high-quality English audio guide in pure JSON format!**

**🚨 Final Verification (Universality Check):**
- ✅ All chapter titles in "location name only" format (without colons and descriptions)
- ✅ Location names are actual specific place names
- ✅ Use culturally neutral expressions (avoid region-specific terms)
- ✅ Structural patterns applicable to various location types
- ✅ Complete application of intro chapter MEGA CRITICAL system
- ✅ Complete single narrative structure of 1500-1600 characters`;

  return prompt;
};

/**
 * English Final Guide Generation Prompt (compatible with index.ts)
 */
export const createEnglishFinalPrompt = (
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.en;
  const audioStyle = AUDIO_GUIDE_INSTRUCTIONS.en;
  // Location type analysis and specialized guide setup
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 User Customization:
- Interests: ${userProfile.interests?.join(', ') || 'General'}
- Age Group: ${userProfile.ageGroup || 'Adult'}
- Knowledge Level: ${userProfile.knowledgeLevel || 'Intermediate'}
- Companions: ${userProfile.companions || 'Solo'}
` : '👤 General tourist audience';

  const specialistContext = typeConfig ? `
🎯 Specialized Guide Setup:
- Detected Location Type: ${locationType}
- Expert Role: ${typeConfig.expertRole}
- Focus Areas: ${typeConfig.focusAreas.join(', ')}
- Special Requirements: ${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" Final English Audio Guide Generation

## 🎭 Your Role
${audioStyle.style}

${specialistContext}

## 📚 Research Data-Based Guide Writing
Create a more accurate and rich audio guide based on the detailed research data provided below.

### Research Data:
${JSON.stringify(researchData, null, 2)}

${userContext}

## 📐 Final Guide Writing Guidelines

### 1. **Research Data Utilization**
- Naturally incorporate all provided information into storytelling
- Accurately reflect historical facts, dates, and character information
- Actively utilize interesting anecdotes or hidden stories discovered in research

### 2. **Audio Script Quality**
- Transform dry research data into friendly conversational tone
- Explain professional content in an easy and entertaining way
- Dramatic composition to keep listeners engaged

### 3. **Enhanced Content**
- Make each chapter more detailed based on research data
- Accurately include specific figures, dates, character names
- Strengthen storytelling with insights gained from research

### 4. **Complete Volume Standards (English - 1800 characters per chapter target)**
- narrative: 1500-1600+ characters (Complete integrated script of background knowledge + expanded scene observation + historical context + character stories)
- nextDirection: 200-300+ characters (Clear movement routes and distance guidance)

## 📐 Final JSON Structure:
${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ Quality Checklist
- [ ] All important information from research data reflected
- [ ] Accuracy of historical facts and dates
- [ ] Natural storytelling flow
- [ ] Engaging composition when heard as audio
- [ ] Rich content worth 8-10 minutes per chapter
- [ ] narrative flows naturally as one complete script without breaks

**🔴 Essential Compliance 🔴**
Each chapter is 8 minutes of continuous speaking by one person!
Within the narrative field, scene observation → historical background → character stories
must flow naturally like water.
Never write each part as independent sections!

**Create the best audio guide for "${locationName}" making perfect use of research data!**`;

  return prompt;
}

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
👤 User Customization:
- Interests: ${userProfile.interests?.join(', ') || 'General'}
- Age Group: ${userProfile.ageGroup || 'Adult'}
` : '👤 General tourist audience';

  // Location type analysis and recommended spot count information
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType] || LOCATION_TYPE_CONFIGS.general;
  const spotCount = getRecommendedSpotCount(locationName);

  return `# 🏗️ "${locationName}" Guide Basic Structure Generation

## 🎯 Mission
Generate **basic structure (overview + route only)** for "${locationName}".
Include only titles for real-time guide chapters, do not generate detailed content.

${userContext}

## 🎯 Location Analysis Information
- Detected location type: ${locationType}
- Recommended spot count: ${typeConfig.recommendedSpots}
- Optimal spot range: ${spotCount.min}-${spotCount.max}
- Recommended default: ${spotCount.default}

## 📋 Output Format
Return pure JSON only. No code blocks or explanations, just JSON.

**Spot Count Decision Guidelines:**
- **Small single building/shop**: 3-4 spots
- **Medium-scale attraction**: 5-6 spots  
- **Large complex facility/palace**: 7-8 spots
- **Natural park/walking trail**: 4-6 spots by major viewpoints
- **Food tour area**: 5-8 spots by food types

### Structure Example (adjust spot count to fit location):
{
  "content": {
    "overview": {
      "title": "${locationName}",
      "location": "📍 Region name only (e.g., 📍 London, England)",
      "keyFeatures": "✨ Core keywords (e.g., ✨ Gothic cathedral architecture)",
      "background": "🏛️ One-line summary (e.g., 🏛️ Coronation site of British monarchs)",
      "narrativeTheme": "Core theme in one line",
      "keyFacts": [
        { "title": "Key Information 1", "description": "Description" },
        { "title": "Key Information 2", "description": "Description" }
      ],
      "visitInfo": {
        "duration": "Appropriate visit duration",
        "difficulty": "Difficulty level",
        "season": "Optimal season"
      }
    },
    "mustVisitSpots": "🎯 #Location1 #Location2 #Location3 #Location4 #Location5",
    "route": {
      "steps": [
        { "step": 1, "location": "[Location Name] [Ticket Office/Information Center/Visitor Center/Station Exit etc]", "title": "[Location Name] [Ticket Office/Information Center/Visitor Center/Station Exit etc]" },
        { "step": 2, "location": "Westminster Abbey Great West Door", "title": "Westminster Abbey Great West Door" },
        { "step": 3, "location": "Westminster Abbey Nave", "title": "Westminster Abbey Nave" },
        { "step": 4, "location": "Westminster Abbey Coronation Chair", "title": "Westminster Abbey Coronation Chair" },
        { "step": 5, "location": "Westminster Abbey Poets Corner", "title": "Westminster Abbey Poets Corner" }
      ]
    },
    "realTimeGuide": {
      "chapters": [
        { "id": 0, "title": "[Location Name] [Ticket Office/Information Center/Visitor Center/Station Exit etc]" },
        { "id": 1, "title": "Main Hall" },
        { "id": 2, "title": "Main Exhibition Room" },
        { "id": 3, "title": "Special Space" },
        { "id": 4, "title": "Observatory" }
      ]
    }
  }
}

**Important**: 
- route.steps and realTimeGuide.chapters titles must be exactly identical
- **Configure appropriate number of spots considering location scale and characteristics** (within 3-8 range)
- Natural flow from entrance → main points → conclusion/exit
- Chapters include titles only, no detailed content
- Return pure JSON only, no explanations or code blocks`;
}

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
As a professional tourism guide, you must write **complete and detailed** audio guide script for "${chapterTitle}" location to tell visitors.

📚 Existing Guide Context
${JSON.stringify(existingGuide, null, 2)}

🚨 **Absolutely Important - Complete Content Required**
- Write **minimum 1500-1600 characters of complete content** in narrative field (never write short!)
- **Background knowledge + expanded scene observation (outline → detail)** order for scene description + historical background + character stories integrated into **one natural story**
- AI must never use incomplete expressions like "...more details..." 
- **Write complete, rich content at actual guide level**

🎭 Style Guide
- Friendly conversational tone ("What we notice here is", "The interesting fact is", "Listening to the story" etc.)
- Educational yet entertaining storytelling
- Friendly like a friend explaining next to you
- **Each part flows naturally as one complete story**

✅ **Recommended Starting Expressions**
- "Here at..." "What we notice here is..." "Interestingly..."
- "Right in front of us..." "At this location..."
- "Now we are..." "Continuing..." "Next we'll encounter..."

✅ Required Output Format
**Important: Output pure JSON only. No code blocks or explanations!**

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "narrative": "Here, the first thing that catches our attention is [scene description and observation]. [Natural connection] Looking at this location's history [historical background and context explanation]. [Natural connection] A person particularly worth remembering is [character stories and episodes]. All these stories lead to [contemporary meaning and conclusion]. [Complete integrated script of 1500-1600 characters]",
    "nextDirection": "From your current position, follow [reference point: main building/wall/path] heading [direction: north/south/east/west/northeast/northwest/southeast/southwest] for exactly [number] meters straight. During the walk, you'll pass [path features: fountain/sculpture/signage/stairs] and when you see [arrival signal: specific building/sign/entrance] you'll know you've arrived. Walking time is approximately [number] minutes."
  }
}

🚨 JSON Safety Rules 🚨
1. **Paragraph separation**: Only use " \\n\\n " (space+backslash n+backslash n+space)
2. **No actual line breaks**: Never use actual Enter or line breaks in text
3. **No tab characters**: Do not use \\t or actual tab characters
4. **One-line writing**: Connect all JSON in one line
5. **Quote escaping**: Text quotes must be escaped as \\"

**Correct paragraph separation example:**
"narrative": "First paragraph content. \\n\\n Second paragraph content. \\n\\n Third paragraph content."

**Absolutely prohibited example:**
"narrative": "First paragraph
Second paragraph" // ← Real line breaks prohibited!

🚨 Absolute Compliance 🚨
- **narrative field must be exactly 1500-1600 characters (minimum 1500 characters!)**
- **Background knowledge + expanded scene observation (outline → detail) order for natural flow composition**
- Start JSON immediately without preface or explanation
- Never use code block markers  
- Grammatically perfect JSON format
- Never use incomplete content or "to be supplemented later" expressions

Generate **complete and rich** audio guide for "${chapterTitle}" chapter right now!`;
}

// Other utility functions
export const createEnglishGuidePromptForIndex = (locationName: string, userProfile?: UserProfile) => {
  return createEnglishGuidePrompt(locationName, userProfile);
};

// Default export for compatibility
export default {
  createEnglishGuidePrompt,
  createEnglishStructurePrompt,
  createEnglishChapterPrompt,
  createEnglishFinalPrompt
};