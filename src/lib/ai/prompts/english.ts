import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

/**
 * 🎯 English Guide Location-Specific Requirements
 */
function getLocationSpecificRequirements(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `**🏰 Palace Architecture Expert Standards:**
- **Architectural Hierarchy**: Throne room → audience halls → private quarters spatial layout and meaning
- **Court Life**: Specific ceremonies, daily routines, seasonal events
- **Political History**: Important historical decisions and events at this location
- **Craftsmanship**: Construction techniques, decorative arts, engineering excellence
- **Symbolic Systems**: Royal emblems, ceremonial spaces, power representation`;

    case 'religious':
      return `**🙏 Religious Architecture Expert Standards:**
- **Sacred Symbolism**: Architectural elements and their spiritual meanings
- **Religious Philosophy**: Core teachings, practices, spiritual traditions
- **Artistic Heritage**: Religious art, sculptures, stained glass, iconography
- **Liturgical Spaces**: Worship practices, ceremonial functions, sacred rituals
- **Spiritual Experience**: Meditation, prayer methods, contemplative practices`;

    case 'historical':
      return `**📚 Historical Site Expert Standards:**
- **Historical Facts**: Verified dates, events, documented evidence of figures
- **Character Stories**: Specific achievements and actions of historical figures
- **Social Context**: Economic, cultural, political conditions of the time
- **Artifact Value**: Archaeological findings, dating, cultural significance
- **Contemporary Relevance**: Historical lessons and insights for modern understanding`;

    case 'nature':
      return `**🌿 Natural Environment Expert Standards:**
- **Geological Formation**: Millions of years of geological processes and rock formation
- **Ecosystem Dynamics**: Species interactions, food webs, biodiversity patterns
- **Climate Characteristics**: Microclimate, seasonal changes, weather patterns
- **Conservation Value**: Endangered species, habitat protection, ecological importance
- **Sustainability**: Environmental protection and responsible tourism practices`;

    case 'culinary':
      return `**🍽️ Culinary Culture Expert Standards:**
- **Culinary Science**: Fermentation, aging, cooking techniques, scientific principles
- **Ingredient Quality**: Origin, quality standards, nutritional properties, seasonality
- **Traditional Methods**: Ancestral recipes, preservation techniques, cultural practices
- **Flavor Profiles**: Taste balance, regional variations, distinctive characteristics
- **Gastronomic History**: Origins, evolution, cultural significance, regional adaptations`;

    case 'cultural':
      return `**🎨 Art and Culture Expert Standards:**
- **Art History**: Artistic movements, periods, artist's position in art history
- **Work Analysis**: Techniques, materials, composition, color theory, professional interpretation
- **Cultural Context**: Social, political, economic conditions that influenced the work
- **Aesthetic Theory**: Beauty standards, artistic philosophy, appreciation methods
- **Contemporary Value**: How historical art inspires and influences modern culture`;

    case 'commercial':
      return `**🛍️ Commercial Culture Expert Standards:**
- **Market History**: Commercial district development, economic background, trade evolution
- **Local Specialties**: Raw materials, production methods, quality standards, unique features
- **Trade Systems**: Traditional and modern distribution, supply chain evolution
- **Community Life**: Impact of commerce on local lifestyle, cultural practices
- **Economic Impact**: Regional economic contribution, employment, business ecosystem`;

    case 'modern':
      return `**🏗️ Modern Architecture Expert Standards:**
- **Structural Engineering**: Advanced construction technology, seismic design, innovative methods
- **Design Philosophy**: Architect's concept, design intent, aesthetic principles
- **Green Technology**: Energy efficiency, sustainable construction, environmental considerations
- **Urban Planning**: Landmark role, urban development contribution, city integration
- **Future Vision**: Architectural innovation, smart city concepts, technological advancement`;

    default:
      return `**🎯 Comprehensive Tourism Expert Standards:**
- **Multifaceted Approach**: Balanced coverage of historical, cultural, natural, economic aspects
- **Practical Information**: Transportation, facilities, visitor services, accessibility
- **Regional Character**: Unique characteristics that distinguish this place from others
- **Engaging Stories**: Memorable anecdotes, human interest, cultural insights
- **Comprehensive Value**: Complete understanding of the place's significance and appeal`;
  }
}

/**
 * 🎯 Location Type Quality Validation Criteria
 */
function getQualityRequirementsByType(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `- **Architectural Data**: Building dimensions, construction dates, number of pillars, area measurements
- **Royal Figures**: Specific monarch names, reign periods, major achievements
- **Technical Terms**: Accurate architectural terminology, construction techniques`;
    case 'religious':
      return `- **Religious Terms**: Proper names of sacred spaces, architectural elements, ceremonial objects
- **Founding History**: Founding dates, founders, renovation history, significant events
- **Religious Practices**: Specific worship methods, service times, ceremonial procedures`;
    case 'historical':
      return `- **Historical Data**: Specific dates, documented events, verified historical records
- **Historical Figures**: Real names, documented actions, verified achievements
- **Archaeological Evidence**: Artifact descriptions, excavation data, scientific dating`;
    case 'nature':
      return `- **Scientific Data**: Geological age, species names, ecological measurements
- **Environmental Facts**: Climate data, biodiversity statistics, conservation status
- **Geographic Information**: Elevation, area size, geographic coordinates`;
    case 'culinary':
      return `- **Culinary Terms**: Traditional dish names, cooking techniques, ingredient specifications
- **Historical Origins**: Documented recipe history, cultural development, regional variations
- **Production Data**: Preparation methods, ingredient sources, nutritional information`;
    case 'cultural':
      return `- **Artistic Details**: Artist names, creation dates, artistic techniques, materials used
- **Historical Context**: Art movement periods, cultural influences, social background
- **Technical Analysis**: Artistic methods, composition principles, color analysis`;
    case 'commercial':
      return `- **Market Data**: Establishment dates, trade volumes, economic indicators
- **Product Information**: Local specialties, production methods, quality certifications
- **Business History**: Commercial development, trade routes, economic impact`;
    case 'modern':
      return `- **Technical Specifications**: Building height, construction materials, engineering data
- **Architectural Details**: Design elements, construction timeline, architectural features
- **Urban Impact**: City development role, population served, infrastructure contribution`;
    default:
      return `- **Accuracy**: Only verifiable, specific facts and measurements
- **Uniqueness**: Distinctive features that set this location apart
- **Storytelling**: Compelling narratives, not dry information`;
  }
}

// English Audio Guide Instructions
export const ENGLISH_AUDIO_GUIDE_INSTRUCTIONS = {
  style: `You are **the single best independent travel guide**. 

**🎯 Core Mission**: You are **the one and only independent travel guide** talking right next to visitors like a friend. 
From start to finish with consistent voice and personality, guide them naturally as if you want to tell them everything about this region in a short time.

**📝 Absolute Compliance Requirements**:

1. **Perfect Connection of 3 Fields (🚨 Very Important)**
   - sceneDescription, coreNarrative, humanStories form one complete 8-9 minute continuous audio
   - nextDirection is a separate field, only responsible for movement guidance to the next location
   - Use natural connectors between the 3 fields for smooth transitions ("But you know what", "That's exactly why", "Actually")
   
2. **Enhanced Educational Storytelling Structure (Expanded On-site Observation)**
   - sceneDescription: Background knowledge + **Expanded On-site Observation** (outline → details) → curiosity-inducing question
   - coreNarrative: Answer to curiosity + historical context → preview of character story
   - humanStories: Actual person/event stories → conclusion with present-day meaning
   
3. **Fact-Based Information Principle (🚨 Very Important)**
   - 🚨 Absolutely Forbidden: "you", "imagine", "amazing stories", "wonderful", "take a moment"
   - 🚨 Absolutely Forbidden: vague references like "here", "this place" (must use specific location names)
   - 🚨 Absolutely Forbidden: generic greetings or exclamations without location names
   - 🚨 **Absolutely Forbidden: speculation, assumptions, unverified information, exaggerated expressions**
   - ✅ **Essential Principle: Use only verifiable facts** - information based on official records, documents, historical texts only
   - ✅ Must Include: specific numbers, proper nouns, physical characteristics, historical facts, technical information
   - ✅ **Fact Expression Methods**: "According to records", "Historical texts show", "Official documents state", "Actually"
   
4. **Enhanced Content Composition (Per field volume - targeting 1600 characters per chapter)**
   - sceneDescription: 500-600+ characters - background knowledge + expanded on-site observation (outline → details)
   - coreNarrative: 800-1000+ characters - detailed explanation of historical facts and significance
   - humanStories: 300-400+ characters - specific personal anecdotes and episodes
   - nextDirection: 200-300+ characters - clear movement route and distance guidance
   - **Total 1600+ characters of detailed educational audio** (on-site observation section increased by 100 characters)

5. **Connection Pattern Diversification (🎯 Core Improvement)**
   Use natural connectors appropriate for each location and situation:
   
   **sceneDescription → coreNarrative connections (various patterns)**:
   - "But what secrets might be hidden in all this? → That story is..."
   - "Why is this so special? → The reason is..."  
   - "What history lies here? → Actually, this place..."
   - "What created this? → Surprisingly..."
   - "Aren't you curious? → Let me tell you..."
   - "What story could it be? → Looking back at history..."
   
   **coreNarrative → humanStories connections (various patterns)**:
   - "In this history are touching people... → One of them was..."
   - "In that process, an amazing person... → Actually, this person..."
   - "Back then, special people... → For example..."
   - "Behind all this was someone's effort... → That person was..."`,
  
  format: `**Output Format Requirements:**

### 1. **Pure JSON Only**
- Return ONLY valid JSON without any introduction, explanation, or code blocks (\`\`\`)
- Perfect JSON syntax compliance (commas, quotes, brackets)
- Key names must be 100% identical to examples (do not translate)

### 2. **Real Location Structure Based on Actual Spatial Layout**
Configure route.steps based on the **actual visit order and spatial layout** of each tourist destination.

**🚨 CRITICAL: location field must use specific location names**
- ❌ Forbidden: "entrance", "main hall", "exhibition room", "special space", "observatory" etc. generic terms
- ✅ Required: "Westminster Abbey", "Coronation Chair", "Poet's Corner", "Royal Tombs" etc. actual unique location names
- ✅ Required: "Eiffel Tower", "Louvre Museum", "Île de la Cité" etc. names visitors can actually find
- ✅ Required: "[Location Name] [Specific Building/Area]" format for more detail (e.g., "Westminster Abbey Great West Door")

**🔴 Essential Title Format - Common to All Locations:**
\`\`\`
"[Specific Location Name]: [Feature/Significance of that Location]"
\`\`\`

**📝 Various Correct Examples by Location Type:**

**🏛️ Museums/Exhibition Halls:**
- "Entrance Hall"
- "Permanent Collection"  
- "Special Exhibition Room"

**🏰 Historical Sites/Palaces:**
- "Main Gate"
- "Throne Hall"
- "Royal Gardens"

**🏛️ Religious Buildings:**
- "Cathedral Entrance"
- "Main Altar"
- "Bell Tower"

**🚨 CRITICAL - All Locations Common Rules:**
- Must follow "[Specific Location Name] - [Feature/Significance]" format
- Location name must be a specific place visitors can actually find
- Mandatory use of dash (-) to separate location name and feature
- route.steps and realTimeGuide.chapters titles must be completely identical

### 3. **Perfect Connection of 3 Fields 🚨 Core Enhancement**

**✅ Enhanced Structure (Background Knowledge + Expanded On-site Observation):**
\`\`\`
sceneDescription: Background knowledge explanation + Expanded on-site observation (outline → details) → Natural curiosity question
coreNarrative: Answer to curiosity + Historical context → Character story preview  
humanStories: Actual character stories → Touching conclusion
nextDirection: (Separate) Movement guidance only
\`\`\`

**🚨 Natural Flow Connectivity - Very Important!**
- Use unique and natural connectors appropriate for each location
- Avoid predictable templates, use varied expressions suitable for situations
- Sound like a real guide speaking spontaneously and naturally

**❌ Avoid Template Expressions:**
- "Have you ever wondered what secrets this place holds?"
- "Let me tell you the fascinating story behind this..."
- "You know, there's an incredible story about the people here"

**✅ Required Specific Expression Patterns:**
- "What can be confirmed at {Specific Location Name}'s {Physical Feature} is..."
- "In {Year}, {Real Person Name} performed {Verifiable Action} at {Specific Location}..."
- "{Measurement Value} sized {Specific Architectural Element} demonstrates {Technical Fact}..."
- "Located at {Direction/Position}, {Specific Name}'s {Historical Background} shows..."

### 4. **Rich and Original Content**
- Strict adherence to minimum content requirements (see standards above)
- Original descriptions that capture the location's unique character
- Fascinating storytelling instead of mundane explanations
- Historical facts + human emotions + on-site immersion

### 5. **Dynamic Chapter Configuration**
- **Generate appropriate number of chapters based on location scale and characteristics**
- **Small locations: 3-4, Medium: 5-6, Large complexes: 7-8**
- **🔴 CRITICAL: Perfect match between route.steps and realTimeGuide.chapters count and titles**

### 6. **📍 GPS Coordinates Required - Very Important!**
Each chapter must include accurate GPS coordinates:
- **coordinates**: Exact GPS coordinates (lat, lng, description) for each chapter's actual location
- **Format**: { "lat": 37.5665, "lng": 126.9780, "description": "Main entrance of Gyeongbokgung Palace" }
- **Accuracy**: Use precise coordinates verified from official sources
- **Description**: Brief location description matching the chapter content

### 🚨 **Anti-Repetition Guidelines (Critical!)**
**For complex sites (palaces, temples, campuses, parks) strictly avoid repetition:**

#### ✅ **Correct Information Distribution**
- **Introduction Chapter (ID=0)**: Comprehensive introduction about the entire location (founding, restoration, major events, cultural context, overall layout and significance)
- **Chapters 1+**: Each building's unique features, functions, and special stories

#### ❌ **Forbidden Repetition Patterns**
Wrong Example:
• Introduction: "Only talking about the main gate features" ← 🚫 Individual building focused!
• Chapter 1: "Changgyeonggung Palace was built in 1484 and destroyed during Japanese invasions in 1592, then restored in 1604" ← 🚫 Should be covered in introduction!
• Chapter 2: "Honghwamun Gate was built in 1484 with Changgyeonggung..." ← 🚫 Repetitive!
• Chapter 3: "Myeongjeongjeon Hall was also built in 1484..." ← 🚫 Repetitive!

#### ✅ **Correct Differentiation Strategy**
Correct Example:
• Introduction: "Changgyeonggung overall introduction - from 1484 founding (King Seongjong 15th year) to present, significance as Joseon royal secondary palace, overall layout and major highlights overview" ← ✅ Comprehensive background!
• Chapter 1: "Honghwamun Gate - unique architectural features as the main entrance and symbolic meaning" ← ✅ Building-specific content!
• Chapter 2: "Myeongjeongjeon Hall - function as throne hall and architectural characteristics" ← ✅ Functional focus!

**🎯 Each Chapter Differentiation Strategy**
- **Introduction**: Overall historical background, restoration timeline, cultural significance
- **Individual Chapters**: Unique architectural features, specific functions, special stories related to each building
- **Avoid**: Repeating founding dates, general history, restoration information in individual chapters`,

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
- **Minimum writing standards per field (1600+ characters per chapter)**:
  * sceneDescription: 500-600+ characters, background knowledge + expanded on-site observation
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
      "keyFeatures": "Royal coronation church since 1066",
      "background": "Britain's most significant religious building where monarchs have been crowned for nearly 1,000 years",
      "narrativeTheme": "Journey through British history where monarchy, faith, and national identity converge in sacred stone",
      "keyFacts": [
        {
          "title": "Royal Coronations",
          "description": "Site of every English and British coronation since William the Conqueror in 1066"
        },
        {
          "title": "Gothic Masterpiece", 
          "description": "13th-century Gothic architecture featuring the highest nave in England at 31 meters"
        }
      ],
      "visitInfo": {
        "duration": "Full tour requires 90-120 minutes",
        "difficulty": "Easy walking, some stairs",
        "season": "Year-round, avoid major ceremonies and Sunday services"
      }
    },
    "safetyWarnings": "Dress respectfully for this active place of worship. Photography prohibited inside. Silent observation required during services. Large bags not permitted.",
    "mustVisitSpots": "#CoronationChair #PoetsCorner #RoyalTombs #HenryVIIChapel #HighAltar",
    "route": {
      "steps": [
        {
          "step": 1,
          "location": "Westminster Abbey Great West Door",
          "title": "Westminster Abbey Great West Door"
        },
        {
          "step": 2, 
          "location": "Westminster Abbey Nave",
          "title": "Westminster Abbey Nave"
        }
      ]
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "Westminster Abbey Great West Door",
          "sceneDescription": "Westminster Abbey stands as the spiritual heart of the British monarchy, where for nearly a thousand years, the destiny of a nation has been shaped within these sacred walls. Founded in 960 AD by Benedictine monks, this Gothic masterpiece has witnessed the coronation of 39 monarchs, from William the Conqueror to King Charles III. The abbey serves not just as a church, but as the nation's memory bank, housing over 3,000 graves and memorials including 17 monarchs, famous poets, scientists, and statesmen. Standing before the Great West Door, visitors encounter towering twin towers that reach 69 meters skyward, framed by Henry VII's Chapel to the east and the medieval Chapter House to the south. The optimal visiting route moves from west to east, beginning at this ceremonial entrance, proceeding through the nave to witness the Coronation Chair, exploring Poets' Corner where literary giants rest, and culminating at the High Altar where coronations take place. What makes this threshold particularly remarkable is its role as the boundary between the secular and sacred worlds of British society.",
          "coreNarrative": "This magnificent doorway has witnessed history's most pivotal moments. According to historical records, every monarch since 1066 has processed through these doors for their coronation, creating an unbroken chain of royal tradition spanning nearly a millennium. The Great West Door itself was constructed in 1245 during Henry III's reign as part of his ambitious rebuilding project that created the Gothic structure visitors see today. What makes this entrance architecturally significant is its innovative Gothic design - the pointed arches distribute weight more efficiently than Norman rounded arches, allowing for the soaring heights that characterize the abbey's interior. The intricate stone tracery and rose window above demonstrate the mathematical precision of medieval craftsmen who worked without modern tools yet achieved structural perfection. But the most compelling story connected to this entrance involves a moment of profound personal significance.",
          "humanStories": "During the 1953 coronation of Queen Elizabeth II, a touching moment occurred at this very threshold. According to the Dean's diary, the 27-year-old princess arrived an hour before the ceremony and requested to spend time alone in prayer. She knelt quietly before these doors, overwhelmed by the weight of responsibility she was about to assume. The Archbishop of Canterbury later recalled finding her still there at dawn, having spent the entire night in contemplation. This moment of vulnerability and devotion before taking on the crown exemplified the deeply personal nature of royal duty that this sacred space has witnessed for nearly a thousand years.",
          "nextDirection": "Pass through the Great West Door and walk straight ahead for 30 meters into the Nave. Notice the soaring vaulted ceiling above as you enter the heart of the abbey where coronations take place.",
          "coordinates": {
            "lat": 51.4994,
            "lng": -0.1270,
            "description": "Westminster Abbey Great West Door main entrance"
          }
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
  userProfile?: UserProfile,
  parentRegion?: string,
  regionalContext?: any
): string => {
  const langConfig = LANGUAGE_CONFIGS.en;
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 User Customization Information:
- Interests: ${userProfile.interests?.join(', ') || 'General'}
- Age Group: ${userProfile.ageGroup || 'Adult'}
- Knowledge Level: ${userProfile.knowledgeLevel || 'Intermediate'}
- Companions: ${userProfile.companions || 'Solo'}
` : '👤 General tourist audience';

  const specialistContext = typeConfig ? `
🎯 Specialist Guide Setup:
- Detected location type: ${locationType}
- Expert role: ${typeConfig.expertRole}
- Focus areas: ${typeConfig.focusAreas.join(', ')}
- Special requirements: ${typeConfig.specialRequirements}
` : '';

  // 🎯 Regional context information
  const regionalContextInfo = parentRegion || regionalContext ? `
🌍 Regional Context Information:
${parentRegion ? `- Parent region: ${parentRegion}` : ''}
${regionalContext?.parentRegion ? `- Recommendation source region: ${regionalContext.parentRegion}` : ''}
${regionalContext?.spotName ? `- Original recommendation name: ${regionalContext.spotName}` : ''}

⚠️ **Regional Specification Required**: If ${locationName} exists in multiple regions, you must provide information specifically for ${locationName} in ${parentRegion || regionalContext?.parentRegion || 'the specified region'}. Do not confuse with same-named locations in other regions - include accurate regional characteristics and information.
` : '';

  const prompt = `# 🎙️ "${locationName}" Professional English Audio Guide Generation

## 🎭 Your Role
${ENGLISH_AUDIO_GUIDE_INSTRUCTIONS.style}

${specialistContext}

${regionalContextInfo}

## 🎯 Mission
Generate an **immersive ${langConfig.name} audio guide** JSON for "${locationName}".

${userContext}

## 🎯 Location Type Expert Information Requirements

### 📍 **${locationType.toUpperCase()} Expert Commentary Standards**
${getLocationSpecificRequirements(locationType)}

## 📋 Output Format Requirements
${ENGLISH_AUDIO_GUIDE_INSTRUCTIONS.format}

### 🔍 **${locationType.toUpperCase()} Type Quality Validation Criteria**
${getQualityRequirementsByType(locationType)}

## 📐 Final JSON Structure:
${JSON.stringify(ENGLISH_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ Final Checklist
- [ ] All text written in ${langConfig.name}
- [ ] route.steps and realTimeGuide.chapters perfectly matched
- [ ] 3 fields naturally connected into 8-9 minute story
- [ ] nextDirection separately handled for movement guidance only
- [ ] Natural and original storytelling instead of template expressions
- [ ] **📍 All chapters include accurate coordinates information (lat, lng, description)**
- [ ] JSON syntax 100% accurate

**🔴 Core Improvement Summary 🔴**
1. **3 Fields Only Connected**: nextDirection handled separately
2. **Natural Connections**: Various expressions instead of templates for each situation
3. **Original Storytelling**: Unique descriptions capturing location characteristics
4. **Complete Separation**: Movement guidance only in nextDirection
5. **📍 Coordinates Required**: Accurate GPS coordinates essential for all chapters
6. **🎯 Fact-Based Absolute Compliance**: Only use verifiable facts, absolutely prohibit speculation or assumptions

**Generate "${locationName}"'s natural and engaging audio guide in pure JSON format right now!**`;

  return prompt;
}

/**
 * Final Korean guide generation prompt (compatible with index.ts)
 */
export const createEnglishGuidePromptForIndex = (locationName: string, userProfile?: UserProfile) => {
  return createEnglishGuidePrompt(locationName, userProfile);
};