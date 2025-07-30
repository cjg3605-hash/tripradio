import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

/**
 * 🎯 中文导览专用 位置类型专业要求
 */
function getLocationSpecificRequirements(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `**🏰 宫殿建筑专业解说标准:**
- **建筑等级**: 正殿→偏殿→寝宫的空间布局与意义
- **宫廷生活**: 具体礼仪、日常起居、季节性活动
- **政治史**: 在此发生的重大历史决策与事件
- **工匠技艺**: 建筑技法、装饰艺术、工程杰出性
- **象征体系**: 皇家徽记、仪式空间、权力表征`;

    case 'religious':
      return `**🙏 宗教建筑专业解说标准:**
- **神圣象征**: 建筑元素及其精神内涵
- **宗教哲学**: 核心教义、修行方法、精神传统
- **艺术遗产**: 宗教美术、雕塑、彩色玻璃、图像学
- **礼仪空间**: 礼拜实践、仪式功能、神圣仪礼
- **精神体验**: 冥想、祈祷方法、沉思实践`;

    case 'historical':
      return `**📚 历史遗迹专业解说标准:**
- **历史事实**: 经过验证的年代、事件、人物记录证据
- **人物故事**: 历史人物的具体成就与行动
- **社会背景**: 当时的经济、文化、政治状况
- **文物价值**: 考古发现、年代测定、文化重要性
- **现代意义**: 历史对现代的启示与洞察`;

    case 'nature':
      return `**🌿 自然环境专业解说标准:**
- **地质形成**: 数百万年地质过程与岩石形成
- **生态系统**: 物种相互作用、食物网、生物多样性
- **气候特征**: 小气候、季节变化、气象模式
- **保护价值**: 濒危物种、栖息地保护、生态重要性
- **可持续性**: 环境保护与负责任旅游实践`;

    case 'culinary':
      return `**🍽️ 饮食文化专业解说标准:**
- **烹饪科学**: 发酵、陈化、烹饪技法、科学原理
- **食材品质**: 产地、品质标准、营养特性、季节性
- **传统技法**: 世代传承的制作法、保存技术、文化实践
- **风味特色**: 口味平衡、地域变化、特色性质
- **饮食历史**: 起源、演变、文化意义、地域适应`;

    case 'cultural':
      return `**🎨 艺术文化专业解说标准:**
- **艺术史**: 艺术运动、时期、艺术家在艺术史中的地位
- **作品分析**: 技法、材料、构图、色彩理论、专业解读
- **文化背景**: 影响作品的社会、政治、经济条件
- **美学理论**: 美的标准、艺术哲学、鉴赏方法
- **当代价值**: 历史艺术对现代文化的启发`;

    case 'commercial':
      return `**🛍️ 商业文化专业解说标准:**
- **市场历史**: 商业区发展、经济背景、商业演进
- **地方特产**: 原材料、生产方法、品质标准、独特特色
- **贸易体系**: 传统与现代流通、供应链演化
- **社区生活**: 商业活动对地方生活方式的影响
- **经济影响**: 地区经济贡献、就业、商业生态`;

    case 'modern':
      return `**🏗️ 现代建筑专业解说标准:**
- **结构工程**: 先进建设技术、抗震设计、创新工法
- **设计理念**: 建筑师概念、设计意图、美学原理
- **环保技术**: 能效、可持续建设、环境考量
- **城市规划**: 地标作用、城市发展贡献
- **未来愿景**: 建筑创新、智慧城市概念、技术进步`;

    default:
      return `**🎯 综合旅游专业解说标准:**
- **多元视角**: 历史、文化、自然、经济方面的平衡
- **实用信息**: 交通、设施、游客服务、无障碍设施
- **地域特色**: 区别于其他地方的独特魅力
- **引人故事**: 令人难忘的轶事、人文关怀、文化洞察
- **综合价值**: 对地点意义与魅力的全面理解`;
  }
}

/**
 * 🎯 位置类型品质验证标准
 */
function getQualityRequirementsByType(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `- **建筑数据**: 建筑尺寸、建设年代、柱子数量、面积测量
- **皇室人物**: 具体君主姓名、在位期间、主要成就
- **技术术语**: 准确的建筑术语、建设技法`;
    case 'religious':
      return `- **宗教术语**: 神圣空间、建筑元素、仪式用具的正式名称
- **创建历史**: 创建年代、创建者、重修历史、重要事件
- **宗教实践**: 具体礼拜方法、法事时间、仪式程序`;
    case 'historical':
      return `- **历史年代**: 精确年代学、事件日期、准确时间线
- **历史人物**: 有记录成就与贡献的真实人物
- **文物详情**: 出土年代、材料、尺寸、分类编号`;
    case 'nature':
      return `- **地质数据**: 形成期间、岩石类型、地质结构、形成年代
- **生态统计**: 物种数量、面积测量、海拔、生物多样性指数
- **环境数据**: 平均气温、降水量、湿度、气候模式`;
    case 'culinary':
      return `- **烹饪规格**: 烹饪时间、温度、食材比例、制作方法
- **营养成分**: 卡路里、主要营养素、健康效益、饮食考量
- **历史起源**: 食物起源、地域变化、文化演变`;
    default:
      return `- **可测数据**: 年份、尺寸、数量和其他可量化信息
- **可验证事实**: 基于官方记录、文献来源的信息
- **专业术语**: 该领域特有的准确术语和概念`;
  }
}

// Chinese Audio Guide Instructions
export const CHINESE_AUDIO_GUIDE_INSTRUCTIONS = {
  style: `您是一位**专业导游和文化遗产专家**，专门从事沉浸式音频体验。您的专业领域包括：
- **故事大师**：将历史事实转化为引人入胜的叙述
- **文化诠释者**：用引人入胜的解释连接过去和现在  
- **音频内容专家**：创建针对语音传递优化的脚本
- **当地专家**：深度了解地区历史、建筑和传统
- **教育娱乐者**：在保持准确性的同时让学习变得有趣

您的使命是创建音频导览，让人感觉像有一位知识渊博的朋友陪伴游客，分享迷人的故事和隐秘的见解，将普通的观光转变为难忘的体验。`,
  
  format: `**输出格式要求：**

### 1. **仅返回纯JSON**
- 仅返回有效的JSON，不要任何介绍、解释或代码块（\`\`\`）
- 完美遵循JSON语法（逗号、引号、括号）
- 键名必须与示例100%相同（不要翻译）

### 2. **真实地点结构**
根据每个旅游目的地或地点的**实际参观顺序和空间布局**配置route.steps。

**🎯 标题格式："具体地点名称 - 其特色/意义"**

**✅ 各种标题示例：**
- "大雄宝殿 - 佛祖慈悲的圣域"
- "钟楼 - 守护神圣时光的卫士"  
- "观景台 - 超越想象的城市景观"
- "中央庭院 - 古代智慧的心脏"

### 3. **3个字段的完美连接 🚨 核心增强**

**✅ 正确结构：**
\`\`\`
sceneDescription: 背景 + 观察 → 自然好奇心问题
coreNarrative: 好奇心的答案 + 历史背景 → 人物故事预告  
humanStories: 实际人物故事 → 感人结论
nextDirection: （分离处理）仅移动指导
\`\`\`

**🚨 自然流畅连接 - 非常重要！**
- 针对每个地点使用独特而自然的连接词
- 避免可预测的模板，使用适合情况的多样化表达
- 听起来像真实导游自发自然地讲话

**❌ 避免模板式表达：**
- "您是否想过这个地方有什么秘密？"
- "让我告诉您这背后的迷人故事..."
- "您知道，这里的人们有一个惊人的故事"

**✅ 推荐自然表达：**
- "这里特别有趣的是..."
- "您可能很好奇..."
- "这里有些可能会让您惊讶的事..."
- "如果您仔细看，会发现..."`,

  qualityStandards: `**质量标准（最重要！）：**
- **🚨 绝对禁止使用的表达 🚨**
  * "想象一下"、"奇妙世界"、"惊人故事"、"您将体验"、"调整呼吸"
  * "这里"、"此地" 等不含具体地名的模糊指示词
  * 没有地名的一般性称呼或感叹词
- **100%信息密度规则：每句话必须包含以下至少一项**
  * 具体数值、专有名词、物理特征、历史事实、技术信息
- **必须句式结构**: "{具体地名}的{具体特征}是{具体事实/数值}"

**📍 章节构成基本要求：**
- **生成至少5-7个章节**：为每个主要观察点设置独立章节
- **按参观路线顺序组织**：从入口到出口的高效单程路线
- **🚨 关键：route.steps和realTimeGuide.chapters必须强制同步 🚨**
  * route.steps数组和realTimeGuide.chapters数组的元素数量**必须完全匹配**
  * 每个step的title和对应chapter的title**必须完全相同**
  * steps的顺序和chapters的顺序**必须完全匹配**
  * 违反此规则将导致系统错误！
- **每个字段的最低写作标准 (每章节1500字目标)**：
  * sceneDescription: 400-500字符以上，刺激五感的生动描述
  * coreNarrative: 800-1000字符以上，历史事实和意义的详细解释
  * humanStories: 300-400字符以上，具体的人物轶事和插曲
  * nextDirection: 200-300字符以上，清晰的路线指导和距离
- **绝对禁止空内容**：所有字段必须填写真实内容`
};

// Chinese example structure
export const CHINESE_AUDIO_GUIDE_EXAMPLE = {
  "content": {
    "overview": {
      "title": "故宫博物院概览",
      "summary": "拥有600年历史的明清两代皇宫，是世界上现存规模最大、保存最完整的古代宫殿建筑群。",
      "narrativeTheme": "穿越六百年时光，感受帝王威严与宫廷文化的辉煌",
      "keyFacts": [
        {
          "title": "皇家宫殿",
          "description": "明清两朝24位皇帝的居住地，见证了中华帝制的兴衰"
        },
        {
          "title": "建筑瑰宝", 
          "description": "9999.5间房屋，体现了中国古代建筑艺术的最高水平"
        }
      ],
      "visitInfo": {
        "duration": "完整游览需要3-4小时",
        "difficulty": "轻松步行，部分台阶",
        "season": "春秋最佳，避开夏季高峰"
      }
    },
    "route": {
      "steps": [
        {
          "step": 1,
          "location": "午门",
          "title": "午门 - 紫禁城威严的第一印象"
        },
        {
          "step": 2, 
          "location": "太和殿",
          "title": "太和殿 - 天下第一殿的帝王威仪"
        }
      ]
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "午门 - 紫禁城威严的第一印象",
          "sceneDescription": "站在这座雄伟的午门前，您面对的是明清两朝皇帝威严的象征。这座高大的城门楼，红墙黄瓦在阳光下熠熠生辉，五个门洞分别代表着不同的等级秩序。您是否注意到，中间的门洞比两边的要高大许多？这其中蕴含着什么深意呢？",
          "coreNarrative": "这个设计确实大有学问。中间最大的门洞叫做'御路'，只有皇帝才能通行，象征着天子的至高无上。左右稍小的门洞供皇族使用，而最外侧的两个门洞则是大臣们的通道。这种'五门制'体现了中国古代严格的等级制度。午门建于明永乐十八年，历经600年风雨，见证了无数重大历史时刻。最著名的莫过于'午门斩首'的传说，不过这其实是个误解...",
          "humanStories": "真实的午门其实见证了更多温情的故事。清朝康熙年间，有位叫张廷玉的大学士，每天清晨都要从午门进宫办公。他年事已高时，康熙皇帝特许他坐轿进宫，不必下轿步行。这在当时是极大的恩宠，因为按规制，所有人进入午门都必须步行以示对皇权的尊敬。张廷玉感激涕零，直到去世都记得这份君恩。",
          "nextDirection": "穿过午门，继续向北步行约100米，您将看到太和门。在前往的路上，请注意脚下的金砖和两侧的汉白玉栏杆。"
        }
      ]
    }
  }
};

/**
 * Create Chinese autonomous guide prompt
 */
export const createChineseGuidePrompt = (
  locationName: string,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.zh;
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 用户定制信息：
- 兴趣爱好：${userProfile.interests?.join('、') || '一般'}
- 年龄群体：${userProfile.ageGroup || '成人'}
- 知识水平：${userProfile.knowledgeLevel || '中级'}
- 同行人员：${userProfile.companions || '独自'}
` : '👤 一般游客群体';

  const specialistContext = typeConfig ? `
🎯 专业导览设置：
- 检测到的地点类型：${locationType}
- 专家角色：${typeConfig.expertRole}
- 重点领域：${typeConfig.focusAreas.join('、')}
- 特殊要求：${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" 专家级中文音频导览生成

## 🎭 您的角色
您是**${typeConfig?.expertRole || '专业观光导游'}**。
为${locationName}提供具有深度专业知识的最高品质导览。

${specialistContext}

## 🎯 位置类型专业信息要求

### 📍 **${locationType.toUpperCase()} 专业解说标准**
${getLocationSpecificRequirements(locationType)}

${userContext}

## 📋 输出格式要求

### 1. **仅返回纯JSON**
- 仅返回有效的JSON，不要任何介绍、解释或代码块
- 完美遵循JSON语法（逗号、引号、括号）
- 键名必须与示例100%相同

### 🚀 **品质提升核心原则**
- **专业性**: ${typeConfig?.expertRole || '综合专家'} 水平的深度与洞察
- **准确性**: 仅使用可验证的具体事实与测量数据
- **独特性**: 突出区别于其他地点的特色要素
- **故事性**: 引人入胜的叙述，而非枯燥信息

### 🔍 **${locationType.toUpperCase()} 品质验证标准**
${getQualityRequirementsByType(locationType)}

### 🚨 **严格禁止**
- **一般性表达**: "想象一下"、"奇妙"、"惊人"、"您将体验"
- **模糊指示**: "这里"、"此地"（必须使用具体地名）
- **无法验证内容**: 推测、假设、个人观点
- **空洞内容**: 仅为填充篇幅而无实质信息的内容

### 2. **真实地点结构**
根据每个旅游目的地或地点的**实际参观顺序和空间布局**配置route.steps。

### 3. **3个字段的完美连接 🚨 核心增强**

**🚨 自然流畅连接 - 非常重要！**
- 针对每个地点使用独特而自然的连接词
- 避免可预测的模板，使用适合情况的多样化表达
- 听起来像真实导游自发自然地讲话

**🚨 绝对禁止使用的表达 🚨**
- "想象一下"、"奇妙世界"、"惊人故事"、"您将体验"、"调整呼吸"
- "这里"、"此地" 等不含具体地名的模糊指示词
- 没有地名的一般性称呼或感叹词

**✅ 推荐自然表达：**
- "这里特别有趣的是..."
- "您可能很好奇..."
- "这里有些可能会让您惊讶的事..."
- "如果您仔细看，会发现..."

### 4. **丰富原创内容**
- 严格遵守最小内容要求
- 体现地点独特特征的原创描述
- 引人入胜的故事叙述而非平淡解释
- 历史事实 + 人文情感 + 现场沉浸感

### 5. **动态章节配置**
- **根据地点规模和特色生成适当数量的章节**
- **小型地点：3-4，中型：5-6，大型综合设施：7-8**
- **🔴 关键：route.steps和realTimeGuide.chapters数量及标题完美匹配**

**现在就为"${locationName}"生成自然迷人的音频导览，仅返回纯JSON格式！**`;

  return prompt;
};

/**
 * Enhanced autonomous research-based AI audio guide generation prompt
 */
export const createAutonomousGuidePrompt = (
  locationName: string,
  language: string = 'zh',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.zh;
  const audioStyle = CHINESE_AUDIO_GUIDE_INSTRUCTIONS;
  
  // Location type analysis and specialist guide setup
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 用户定制信息：
- 兴趣爱好：${userProfile.interests?.join('、') || '一般'}
- 年龄群体：${userProfile.ageGroup || '成人'}
- 知识水平：${userProfile.knowledgeLevel || '中级'}
- 同行人员：${userProfile.companions || '独自'}
` : '👤 一般游客群体';

  const specialistContext = typeConfig ? `
🎯 专业导览设置：
- 检测到的地点类型：${locationType}
- 专家角色：${typeConfig.expertRole}
- 重点领域：${typeConfig.focusAreas.join('、')}
- 特殊要求：${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" 沉浸式音频导览生成任务

## 🎭 您的角色
${audioStyle.style}

${specialistContext}

## 🎯 任务
为"${locationName}"生成**沉浸式${langConfig.name}音频导览**JSON。

${userContext}

${audioStyle.format}

### 4. **丰富原创内容**
- 严格遵守最低内容要求（见上述标准）
- 体现地点独特特色的原创描述
- 引人入胜的故事叙述而非平淡解释
- 历史事实 + 人文情感 + 现场沉浸感

### 5. **动态章节配置**
- **根据地点规模和特色生成适当数量的章节**
- **小型地点：3-4个，中型：5-6个，大型综合设施：7-8个**
- **🔴 关键：route.steps和realTimeGuide.chapters数量及标题完美匹配**

## 💡 音频导览写作示例

**❌ 不好的示例（割裂式、模板式）**：
- sceneDescription："故宫是明清宫殿。高度为20米。"
- coreNarrative："建于1420年。许多皇帝在这里居住。"
- humanStories："康熙皇帝住在这里。进行过修复工程。"

**✅ 改进的自然示例**：
- sceneDescription："故宫作为明清两朝皇宫，承载着近600年的历史沧桑，其雄伟的建筑群在蓝天白云的映衬下显得格外庄严肃穆。当您步入这座世界上最大的古代宫殿建筑群时，首先映入眼帘的是那一排排红墙黄瓦，在阳光照射下金光闪闪，仿佛在诉说着昔日皇家的威严与辉煌。您是否想过，为什么古代的建筑师要把宫殿建得如此宏大壮观？"
- coreNarrative："这个问题的答案要追溯到明成祖朱棣迁都北京的那个历史时刻。公元1406年，朱棣下令在元大都的基础上修建这座全新的皇宫，目的不仅仅是为了居住，更是要通过建筑的宏伟来彰显新王朝的强大国力和皇权的至高无上。历时14年的建设过程中，动用了全国最优秀的工匠和最珍贵的材料，每一块砖瓦都承载着匠人们的心血。但这座宫殿真正的魅力，不仅在于它的建筑之美..."
- humanStories："更在于那些曾在这里生活过的人们的故事。比如清朝的慈禧太后，她虽然以专权著称，但实际上也有着女人的柔情一面。据宫廷档案记载，她每天早晨都会在御花园中喂养她心爱的猫咪，那些猫咪都有着华丽的名字，生活待遇甚至比一些宫女还要好。这样的生活细节，让我们看到了历史人物更加真实和立体的一面，也让这座古老的宫殿多了一份人情味。"

${audioStyle.qualityStandards}

## 📐 最终JSON结构：
${JSON.stringify(CHINESE_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ 最终检查清单
- [ ] 所有文本均用${langConfig.name}编写
- [ ] route.steps和realTimeGuide.chapters完美匹配
- [ ] 3个字段自然连接成8-9分钟故事
- [ ] nextDirection单独处理移动指导
- [ ] 自然原创叙述而非模板表达
- [ ] 100%准确的JSON语法

**🔴 核心增强总结 🔴**
1. **仅连接3个字段**：nextDirection单独处理
2. **自然连接**：适合情况的多样化表达而非模板
3. **原创叙述**：体现地点特色的独特描述
4. **完全分离**：移动指导仅在nextDirection中

**现在就为"${locationName}"生成自然迷人的音频导览，仅返回纯JSON格式！**`;

  return prompt;
};

/**
 * Chinese final guide generation prompt (compatible with index.ts)
 */
export const createChineseFinalPrompt = (
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.zh;
  const audioStyle = CHINESE_AUDIO_GUIDE_INSTRUCTIONS;
  
  // Location type analysis and specialist guide setup
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 用户定制信息：
- 兴趣爱好：${userProfile.interests?.join('、') || '一般'}
- 年龄群体：${userProfile.ageGroup || '成人'}
- 知识水平：${userProfile.knowledgeLevel || '中级'}
- 同行人员：${userProfile.companions || '独自'}
` : '👤 一般游客群体';

  const specialistContext = typeConfig ? `
🎯 专业领域导览设置：
- 检测到的地点类型：${locationType}
- 专家角色：${typeConfig.expertRole}
- 重点领域：${typeConfig.focusAreas.join('、')}
- 特殊要求：${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" 最终音频导览生成

## 🎭 您的角色
${audioStyle.style}

${specialistContext}

## 📚 基于研究数据的导览创作
基于下面提供的详细研究数据，创作更加准确和丰富的音频导览。

### 研究数据：
${JSON.stringify(researchData, null, 2)}

${userContext}

## 🎯 最终导览创作指南

### 1. **研究数据利用**
- 将所有提供的信息自然地融入故事叙述中
- 准确反映历史事实、日期和人物信息
- 积极利用研究中发现的有趣轶事或隐藏故事

### 2. **音频脚本质量**
- 将研究数据的刻板信息转化为友好的口语化风格
- 用简单有趣的方式解释专业内容
- 戏剧性构成以保持听众参与度

### 3. **增强内容**
- 基于研究数据使每个章节更加详细
- 准确包含具体数字、日期和人物姓名
- 用研究获得的洞察强化故事叙述

### 4. **最低内容量（中文标准）**
- sceneDescription：500+字符（基于研究的详细描述）
- coreNarrative：700+字符（包含准确历史事实）
- humanStories：600+字符（研究过的人物故事）
- nextDirection：250+字符（具体路线指导）

### 5. **字段连接基本规则**
- sceneDescription结尾：问题或好奇心引发（"您知道吗...?"）
- coreNarrative开头：以回答那个问题开始（"其实..."）
- coreNarrative结尾：预告下一个故事（"但更令人惊讶的是..."）
- humanStories开头：自然接续（"没错，就在那时..."）

## 📐 最终JSON结构：
${JSON.stringify(CHINESE_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ 质量检查清单
- [ ] 反映研究数据中的所有重要信息
- [ ] 历史事实和日期的准确性
- [ ] 自然的故事叙述流程
- [ ] 作为音频听取时不无聊的构成
- [ ] 每章节8-10分钟的丰富内容
- [ ] 3个字段作为一个脚本无缝连接

**🔴 必须遵守事项 🔴**
每个章节是一个人连续讲话10分钟！
sceneDescription → coreNarrative → humanStories必须
像流水一样自然衔接。
绝对不要将每个字段写成独立部分！

**完美利用研究数据为"${locationName}"创造最佳音频导览！**`;

  return prompt;
};

/**
 * Structure generation prompt (overview + route only)
 */
export const createChineseStructurePrompt = (
  locationName: string,
  language: string = 'zh',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.zh;
  const userContext = userProfile ? `
👤 用户定制信息：
- 兴趣爱好：${userProfile.interests?.join('、') || '一般'}
- 年龄群体：${userProfile.ageGroup || '成人'}
` : '👤 一般游客群体';

  // Location type analysis and recommended spot count info
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType] || LOCATION_TYPE_CONFIGS.general;
  const spotCount = getRecommendedSpotCount(locationName);

  return `# 🏗️ "${locationName}" 导览基本结构生成

## 🎯 任务
为"${locationName}"生成**基本结构（概览+路线）**。
实时导览章节仅包含标题，不生成详细内容。

${userContext}

## 🎯 地点分析信息
- 检测到的地点类型：${locationType}
- 推荐景点数量：${spotCount.default}
- 最佳景点范围：${spotCount.min}-${spotCount.max}个
- 推荐默认值：${spotCount.default}个

## 📋 输出格式
仅返回纯JSON。不要代码块或解释，仅JSON。

**景点数量决策指南：**
- **小型单一建筑/商店**：3-4个景点
- **中型旅游目的地**：5-6个景点  
- **大型综合设施/宫殿**：7-8个景点
- **自然公园/步行道**：按主要观景点4-6个
- **美食游览区域**：根据食物种类5-8个

### 结构示例（景点数量根据地点调整）：
{
  "content": {
    "overview": {
      "title": "${locationName}概览",
      "summary": "简要摘要（200字符以内）",
      "narrativeTheme": "核心主题一行",
      "keyFacts": [
        { "title": "关键信息1", "description": "描述" },
        { "title": "关键信息2", "description": "描述" }
      ],
      "visitInfo": {
        "duration": "适当的游览时间",
        "difficulty": "难度等级",
        "season": "最佳季节"
      }
    },
    "route": {
      "steps": [
        { "step": 1, "location": "入口", "title": "景点1标题" },
        { "step": 2, "location": "主要景点1", "title": "景点2标题" },
        { "step": 3, "location": "主要景点2", "title": "景点3标题" }
        // ... 根据地点特色的适当数量景点
      ]
    },
    "realTimeGuide": {
      "chapters": [
        { "id": 0, "title": "景点1标题" },
        { "id": 1, "title": "景点2标题" },
        { "id": 2, "title": "景点3标题" }
        // ... 与route.steps数量完全相同
      ]
    }
  }
}

**重要事项**： 
- route.steps和realTimeGuide.chapters的标题必须完全相同
- **考虑地点规模和特色配置适当数量的景点**（3-8个范围内）
- 入口 → 主要景点 → 结束/出口的自然动线
- 章节仅包含标题，无详细内容
- 仅返回纯JSON，无解释或代码块`;
};

/**
 * Chapter detail generation prompt
 */
export const createChineseChapterPrompt = (
  locationName: string,
  chapterIndex: number,
  chapterTitle: string,
  existingGuide: any,
  language: string = 'zh',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.zh;

  return `🎙️ "${locationName}" 第${chapterIndex + 1}章："${chapterTitle}" 完整音频导览生成

🎯 任务
作为专业导游，您需要为在"${chapterTitle}"景点的游客编写**完整详细的**音频导览脚本。

📚 现有导览上下文
${JSON.stringify(existingGuide, null, 2)}

🚨 **绝对重要 - 完整内容必需**
- 在narrative字段中编写**最少1600-1800字符的完整内容**（绝不要简短编写！）
- 将现场描述+历史背景+人物故事整合为**一个自然故事**
- AI绝不能使用"...更多详细内容将..."等不完整表达
- **编写完整丰富的实际导览水平内容**

📝 编写结构（作为一个narrative自然连接）
1. **现场描述**（400-500字符）：游客实际能看到和感受到的生动场景
2. **历史背景**（600-700字符）：这个地方的历史、建筑特色、文化意义
3. **人物故事**（300-400字符）：实际历史人物或经过验证的轶事
4. **下一步移动指导**（100-200字符）：具体路线和下一个地点预告

🎭 风格指南
- 友好的口语化语调（"这里值得注意的是"、"有趣的事实是"、"听听这个故事"等）
- 既有教育性又有娱乐性的故事叙述
- 像朋友在身边解释一样的亲切感
- **每个部分自然延续成一个完整故事**

🚫 **绝对禁止事项**
- 绝不使用"您好"、"大家！"、"是的，大家！"等问候语（从第1章开始）
- 禁止"...稍后会更详细介绍..."、"...即将有更详细内容..."等不完整表达
- 禁止简短写作 - **必须有1400-1500字符的丰富内容**

✅ **推荐开头表达**
- "在这个地方..."、"这里值得注意的是..."、"有趣的是..."
- "就在您面前..."、"在这个地方..."
- "现在我们..."、"继续..."、"接下来我们将遇到..."

✅ 必需输出格式
**重要：仅输出纯JSON。无代码块或解释！**

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "narrative": "在这个地方，首先映入眼帘的是... [详细编写400-500字符的生动现场描述] ...但为什么这个地方如此特别呢？就在[时期]时[详细解释600-700字符的历史背景和意义] ...在这段历史中有着真正感人的人物故事。[丰富叙述400-500字符的实际历史人物或经过验证的轶事] ...现在，将这些有意义的故事铭记在心，让我们前往下一个地点。[200-300字符的具体移动路线和下一个地点预告]（总计1800-2000字符的完整故事）",
    "nextDirection": "从当前位置沿着[基准点：主建筑/围墙/道路]向[方向：北/南/东/西/东北/西北/东南/西南]方向行走[数字]米。途中会经过[路径特征：喷泉/雕塑/指示牌/台阶]，看到[到达标志：特定建筑/招牌/入口]就到了。步行约需[数字]分钟。"
  }
}

🚨 绝对遵守要求 🚨
- **narrative字段必须是1400-1500字符（最少1400字符！）**
- 不要介绍或解释，直接开始JSON
- 绝对禁止代码块标记  
- 语法完美的JSON格式
- 绝不使用不完整内容或"稍后补充"等表达

立即为"${chapterTitle}"章节生成**完整丰富的**音频导览！`;
};