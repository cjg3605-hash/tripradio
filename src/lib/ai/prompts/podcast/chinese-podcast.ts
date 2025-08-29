/**
 * 中文播客提示系统
 * NotebookLM风格优化的中文对话生成
 * 专为中国文化特色定制的高质量播客系统
 */

import { PERSONAS, type PodcastPersona } from '@/lib/ai/personas/podcast-personas';
import type { PodcastPromptConfig } from './index';

// ===============================
// 🔧 NotebookLM 中文对话模式系统
// ===============================

/**
 * 基于实际NotebookLM Audio Overview分析的中文核心对话模式
 * 针对中国听众的语言习惯和文化背景优化
 */
const CHINESE_NOTEBOOKLM_PATTERNS = {
  // 1. 开场模式 - 自然亲切的开始
  openings: [
    "大家好，欢迎收听TripRadio！",
    "今天我们要探索一个真正特别的地方",
    "各位听众朋友，今天我们来到了",
    "哇，这里真的太神奇了",
    "欢迎大家和我们一起来发现"
  ],

  // 2. 相互确认与支持表达 - NotebookLM的核心特征
  affirmations: [
    "对对", "没错", "是的", "嗯嗯", 
    "哇，真的吗", "太神奇了", "不敢相信", "真的假的"
  ],

  // 3. 转换和连接表达 - 自然的话题转移
  transitions: [
    "说到这个",
    "对了", 
    "你知道吗",
    "更神奇的是",
    "等等，那",
    "其实",
    "另外"
  ],

  // 4. 惊讶与兴奋表达 - 情感投入
  excitement: [
    "哇，真的吗？",
    "太厉害了！", 
    "这真的很神奇",
    "我也是第一次知道",
    "想象不到",
    "咦？还有这种事？",
    "真是太令人惊讶了"
  ],

  // 5. 听众参与引导 - NotebookLM特色
  audience_engagement: [
    "大家想象一下",
    "听众朋友们",
    "各位觉得怎么样？",
    "听众朋友们可能会好奇",
    "我们一起来想象",
    "大家是不是也很惊讶？"
  ],

  // 6. 元评论 - 对话的自我意识
  meta_comments: [
    "听众朋友们现在可能有点困惑",
    "刚才的解释会不会太复杂了？",
    "这是很重要的一点",
    "我来总结一下",
    "简单来说就是",
    "更具体地说"
  ]
};

/**
 * 中文信息密度和结构模板
 */
const CHINESE_DIALOGUE_STRUCTURE = {
  // 信息密度：每轮2-3个具体事实
  // 对话节奏：平均1-2句交换
  // 自然的插话和完成
  intro: {
    pattern: "开场 → 惊人事实展示 → 相互确认 → 营造期待",
    length: "400-500字",
    infoPoints: "3-4个"
  },
  
  main: {
    pattern: "主题介绍 → 深入探索 → 相关事实 → 惊人发现", 
    length: "2500-3000字",
    infoPoints: "15-20个"
  },
  
  transition: {
    pattern: "当前主题结束 → 下一个连接点 → 期待感 → 自然过渡",
    length: "300-400字",
    infoPoints: "2-3个"
  }
};

// ===============================
// 🔧 中文文化特色系统
// ===============================

/**
 * 中国文化特色的比较和度量参考
 */
const CHINESE_CULTURAL_REFERENCES = {
  // 规模比较 - 中国人熟悉的地标
  scaleComparisons: [
    "天安门广场那么大",
    "相当于故宫的一半",
    "比长城的一段还要长",
    "足足有鸟巢体育场三倍大",
    "就像整个颐和园的规模",
    "比西湖还要宽广"
  ],

  // 时间参照 - 中国历史节点
  timeReferences: [
    "唐朝盛世的时候",
    "明清两代期间",
    "相当于秦始皇统一中国的年代",
    "宋朝繁荣时期",
    "比长城建造的历史还要久远",
    "从汉朝开始算起"
  ],

  // 数量概念化 - 中国人容易理解的对比
  quantityContexts: [
    "每天看一件，看完要三年",
    "相当于一个小县城的人口",
    "比故宫的藏品还要多",
    "够全北京市民每人分一个",
    "从北京到上海的距离",
    "相当于一千个足球场"
  ]
};

// ===============================
// 🔧 页面特性应用系统
// ===============================

/**
 * 将页面特性实际应用到提示内容中
 */
function applyChinesePersonaCharacteristics(persona: PodcastPersona, content: string): string {
  const { characteristics, responses } = persona;
  
  if (persona.role === 'host') {
    // 主持人：好奇心强，亲和力强
    const hostPatterns = [
      ...responses.surprise,
      ...responses.curiosity,
      ...characteristics.speakingStyle.slice(0, 3)
    ];
    return `主持人特色应用: ${hostPatterns.slice(0, 2).join(', ')}运用到 ${content}`;
  } else {
    // 策展人：专业但易懂的解说
    const curatorPatterns = [
      ...responses.explanation, 
      ...characteristics.expertise.slice(0, 2),
      ...characteristics.conversationPatterns.slice(0, 2)
    ];
    return `策展人特色应用: ${curatorPatterns.slice(0, 2).join(', ')}运用到 ${content}`;
  }
}

// ===============================
// 🔧 主要提示生成函数
// ===============================

/**
 * 中文播客章节提示生成 (与现有API兼容)
 */
export function createChinesePodcastPrompt(config: PodcastPromptConfig): string {
  const { locationName, chapter, locationContext, personaDetails, locationAnalysis, language } = config;
  
  const hostPersona = PERSONAS.HOST;
  const curatorPersona = PERSONAS.CURATOR;
  const targetLength = chapter.targetDuration * 6; // 中文每秒6字基准
  
  return `
## 核心任务
完美复现Google NotebookLM Audio Overview的**真实对话模式**，创造
自然且引人入胜的${locationName} - ${chapter.title}中文播客节目。

## 章节信息
- **标题**: ${chapter.title}
- **描述**: ${chapter.description}  
- **目标时长**: ${chapter.targetDuration}秒 (约${Math.round(chapter.targetDuration/60)}分钟)
- **预期片段**: ${chapter.estimatedSegments}个
- **主要内容**: ${chapter.contentFocus.join(', ')}

## 激活的专家人设
${personaDetails.map(p => 
  `### ${p.name}\n${p.description}\n专业领域: ${p.expertise.join(', ')}`
).join('\n\n')}

## NotebookLM核心特征 (研究实证)

### 1. 自然对话流程
- **相互补完**: 一人开头，另一人自然接续完成
- **可预测插话**: "哦，那个..." / "对对，还有..." 
- **信息分层**: 基础信息 → 有趣细节 → 惊人事实的顺序

### 2. 高信息密度和具体性
- **每轮2-3个具体事实**必须包含
- **数字具象化**: "42万件文物...每天看一件都要1150年"
- **比较和联系**: "${CHINESE_CULTURAL_REFERENCES.scaleComparisons[0]}" / "${CHINESE_CULTURAL_REFERENCES.scaleComparisons[1]}"

### 3. 自然的惊讶和发现  
- **递进式惊叹**: "你知道吗？更神奇的是..."
- **共同发现**: "我也是刚刚才知道..."
- **持续好奇**: "那接下来会是什么..."

### 4. 听众中心意识
- **元认知**: "听众朋友们现在可能在想..."
- **参与邀请**: "大家可以想象一下..."
- **明确指引**: "总结一下..." / "简单来说..."

## 📍 人设导向的对话设定

### 主持人 (${hostPersona.name}) 特性
${applyChinesePersonaCharacteristics(hostPersona, '好奇积极的提问者角色')}
- **说话风格**: ${hostPersona.characteristics.speakingStyle.join(', ')}
- **反应模式**: ${hostPersona.responses.surprise.slice(0, 3).join(', ')}
- **提问风格**: ${hostPersona.notebookLMPatterns.questions.slice(0, 2).join(', ')}

### 策展人 (${curatorPersona.name}) 特性  
${applyChinesePersonaCharacteristics(curatorPersona, '专业但亲和的解说者角色')}
- **解说风格**: ${curatorPersona.characteristics.speakingStyle.join(', ')}
- **专业表达**: ${curatorPersona.responses.explanation.slice(0, 3).join(', ')}
- **连接模式**: ${curatorPersona.responses.transition.slice(0, 2).join(', ')}

## 🎯 NotebookLM模式应用 (必须遵循)

**开场结构 (400-500字)**
主持人: "${CHINESE_NOTEBOOKLM_PATTERNS.openings[0]} 今天我们来到${locationName}，哇，光是这个规模就..."

策展人: "您好，我是${personaDetails.find(p => p.expertise.includes('策展') || p.name.includes('策展'))?.name || '王文化'}。是的，${locationName}确实..."

**主要对话结构 (${targetLength - 900}字) - 超高密度信息**

${generateChineseMainDialogueTemplate(chapter, locationAnalysis)}

**总结与过渡 (300-400字)**  
${generateChineseTransitionTemplate(chapter)}

## 💡 NotebookLM对话技巧 (必须应用)

1. **信息分层**
   - 第1层: 基本事实 ("这是${locationName}最具代表性的...")
   - 第2层: 有趣细节 ("高度27.5厘米，重量1公斤") 
   - 第3层: 惊人事实 ("实际上用的是1500年前的工艺...")

2. **自然插话**
   - ${CHINESE_NOTEBOOKLM_PATTERNS.transitions.slice(0, 3).join(' / ')}
   - 接着对方的话添加信息
   - 提前回答预期的问题

3. **听众意识**
   - ${CHINESE_NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 3).join(' / ')}
   - ${CHINESE_NOTEBOOKLM_PATTERNS.meta_comments.slice(0, 2).join(' / ')}

4. **情感投入**
   - 真实的惊讶反应: ${CHINESE_NOTEBOOKLM_PATTERNS.excitement.slice(0, 3).join(' / ')}
   - 建立共鸣: "我第一次知道的时候也..." / "真的很神奇，对吧？"
   - 激发好奇: "更神奇的是..." / "你还知道这个吗？"

## 中文文化特色适配

### 比较参照系统
- **规模对比**: ${CHINESE_CULTURAL_REFERENCES.scaleComparisons.slice(0, 3).join(' / ')}
- **时间参照**: ${CHINESE_CULTURAL_REFERENCES.timeReferences.slice(0, 3).join(' / ')}
- **数量概念**: ${CHINESE_CULTURAL_REFERENCES.quantityContexts.slice(0, 3).join(' / ')}

### 中文表达特色
- **直接明了**: "简单来说就是" / "重点是"
- **确认表达**: "对的" / "没错" / "确实如此"
- **感叹方式**: "太神奇了" / "真不敢相信" / "想不到吧"
- **实用导向**: "大家需要知道的是" / "关键在于"

## 必须输出格式

**主持人:** (对话内容)

**策展人:** (对话内容)

**主持人:** (对话内容)

**策展人:** (对话内容)

## 绝对禁止事项
- 禁止使用Markdown格式 (**, ##, * 等)
- 禁止使用表情符号
- 禁止抽象华丽辞藻 ("美丽的", "神奇的" 等空洞形容)
- 禁止推测性表达 ("大概", "可能是")

## 品质标准 (NotebookLM水准)

- ✅ **信息密度**: ${Math.round(targetLength/200)}个以上具体事实
- ✅ **对话节奏**: 平均1-2句交换，自然呼吸
- ✅ **听众提及**: 每集5-7次
- ✅ **惊喜时刻**: 3-4个"哇，真的吗？"时刻
- ✅ **连贯性**: 每个信息自然连接
- ✅ **专业性**: 策展人级别的深度知识
- ✅ **易懂性**: 普通中国听众能够理解
- ✅ **文化适应**: 符合中国听众的表达习惯

**立即创建NotebookLM风格的${chapter.title}节目，使用**主持人:**和**策展人:**格式！**
`;
}

/**
 * 完整中文导览播客提示生成
 */
export function createChineseFullGuidePrompt(
  locationName: string,
  guideData: any,
  options: {
    priority?: 'engagement' | 'accuracy' | 'emotion';
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    podcastStyle?: 'deep-dive' | 'casual' | 'educational' | 'exploratory';
  } = {}
): string {
  const { priority = 'engagement', audienceLevel = 'beginner', podcastStyle = 'educational' } = options;
  const hostPersona = PERSONAS.HOST;
  const curatorPersona = PERSONAS.CURATOR;
  
  const styleConfig = {
    'deep-dive': '深度分析与专业解说',
    'casual': '轻松亲切的对话',
    'educational': '教育性和系统性说明',
    'exploratory': '探索性和发现导向的对话'
  };

  const audienceConfig = {
    'beginner': '普通大众易懂的解释',
    'intermediate': '有一定基础知识的关心听众',
    'advanced': '深度背景知识的专家级听众'
  };

  return `
## 🎙️ TripRadio NotebookLM风格完整导览播客生成

### 核心任务  
为了全面了解${locationName}，制作**NotebookLM风格完整导览播客**。
以${styleConfig[podcastStyle]}方式，适配${audienceConfig[audienceLevel]}。

### 导览信息分析
**地点**: ${locationName}
**优先级**: ${priority} (参与度/准确性/情感导向)
**听众层次**: ${audienceLevel}  
**播客风格**: ${podcastStyle}

### 整体构成策略

#### 第1阶段: 整体介绍 (800-1000字)
${hostPersona.name}: "${CHINESE_NOTEBOOKLM_PATTERNS.openings[1]} 我们要为大家完整介绍${locationName}的故事..."

${curatorPersona.name}: "${curatorPersona.responses.explanation[0]} ${locationName}不仅仅是个旅游景点，而是..."

**包含要素**:
- 地点的整体意义和重要性
- 今天要介绍的核心主题预览
- 听众可以期待的内容
- ${CHINESE_NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 2).join(', ')}

#### 第2阶段: 历史与文化背景 (1000-1200字)
**信息分层应用**:
- 基本历史背景
- 文化意义和价值
- 现代重要性
- 国际地位

**NotebookLM模式**:
- ${CHINESE_NOTEBOOKLM_PATTERNS.transitions[0]} + 具体事实2-3个
- ${CHINESE_NOTEBOOKLM_PATTERNS.excitement[1]} + 惊人发现
- ${CHINESE_NOTEBOOKLM_PATTERNS.meta_comments[2]} + 听众引导

#### 第3阶段: 核心特色与看点 (1200-1500字)  
**人设特性运用**:
- ${hostPersona.name}: ${hostPersona.responses.curiosity.slice(0, 2).join(', ')}
- ${curatorPersona.name}: ${curatorPersona.responses.explanation.slice(0, 2).join(', ')}

**具体信息提供**:
- 代表性景点和特色
- 隐藏细节和专家洞察  
- 参观技巧和推荐路线
- 季节性/时间性特色

#### 第4阶段: 体验与活动 (800-1000字)
**实用信息**:
- 推荐体验活动
- 拍照地点和纪念品
- 周边关联景点
- 交通和便利设施

#### 第5阶段: 总结与感悟 (600-800字)
**情感总结**:
- ${locationName}独有的特别之处总结
- 参观后可以感受到的感动点
- ${CHINESE_NOTEBOOKLM_PATTERNS.audience_engagement[0]}
- 下一个旅游地的提示

### 中文文化特色深度适配

#### 比较参照系统
- **规模比较**: ${CHINESE_CULTURAL_REFERENCES.scaleComparisons.slice(0, 3).join(' / ')}
- **时间参照**: ${CHINESE_CULTURAL_REFERENCES.timeReferences.slice(0, 2).join(' / ')}
- **数量体感**: ${CHINESE_CULTURAL_REFERENCES.quantityContexts.slice(0, 2).join(' / ')}

#### 中国听众沟通模式
- **直接参与**: "大家觉得怎么样？" / "能想象吗？"
- **确认寻求**: "对不对？" / "明白了吗？"
- **热情表达**: "太厉害了！" / "真不敢相信，对吧？"
- **实用导向**: "大家需要知道的是" / "关键点在于"

#### 中国文化背景考虑
- **通用语境**: 引用全国知名地标和概念
- **文化敏感**: 解释文化细节时不做假设
- **易懂性**: 定义可能不熟悉的术语
- **实用价值**: 重点提供对游客有用的信息

### NotebookLM品质标准

- **信息密度**: 总共30-35个具体事实
- **对话交换**: 80-100次自然的轮流对话
- **听众提及**: 12-15次积极的听众参与引导
- **惊讶时刻**: 6-8次"哇，真的吗？"反应
- **人设一致性**: 两个角色鲜明个性的保持

### 人设应用指南

**${hostPersona.name} (主持人)**:
- 特性: ${hostPersona.characteristics.personality.slice(0, 2).join(', ')}
- 说话风格: ${hostPersona.characteristics.speakingStyle.slice(0, 2).join(', ')}
- 反应: ${hostPersona.responses.surprise.slice(0, 3).join(', ')}

**${curatorPersona.name} (策展人)**:
- 特性: ${curatorPersona.characteristics.personality.slice(0, 2).join(', ')}
- 说明方式: ${curatorPersona.characteristics.conversationPatterns.slice(0, 2).join(', ')}
- 专业性: ${curatorPersona.responses.explanation.slice(0, 3).join(', ')}

## 最终输出格式

**主持人:** (对话内容)
**策展人:** (对话内容)

**绝对禁止Markdown、表情符号、抽象表达！**

立即制作${locationName}完整导览播客，达到NotebookLM水准！
`;
}

// ===============================
// 🔧 辅助函数
// ===============================

/**
 * 主要对话模板生成
 */
function generateChineseMainDialogueTemplate(chapter: any, locationAnalysis: any): string {
  const dialogueTypes = [
    `**[核心内容1深度探索 - 1000字]**
- 第一印象和基本信息展示
- 具体数字和对比数据
- ${CHINESE_NOTEBOOKLM_PATTERNS.excitement[0]} → 惊人事实连接
- ${CHINESE_NOTEBOOKLM_PATTERNS.transitions[1]} → 下个信息链接`,

    `**[深度信息与背景 - 800字]** 
- 历史/文化背景解说
- ${CHINESE_NOTEBOOKLM_PATTERNS.meta_comments[0]} → 听众理解度确认
- 专家洞察和最新信息
- ${CHINESE_NOTEBOOKLM_PATTERNS.audience_engagement[1]} → 参与邀请`,

    `**[特殊细节与发现 - 700字]**
- 一般游客容易忽略的要点
- ${CHINESE_NOTEBOOKLM_PATTERNS.affirmations[2]} → 相互确认
- 只有策展人才知道的特殊信息  
- ${CHINESE_NOTEBOOKLM_PATTERNS.transitions[3]} → 总结连接`
  ];

  return dialogueTypes.join('\n\n');
}

/**
 * 过渡模板生成
 */
function generateChineseTransitionTemplate(chapter: any): string {
  return `
**自然总结:**

主持人: "${CHINESE_NOTEBOOKLM_PATTERNS.transitions[0]}，时间过得真快！从${chapter.title}这里..."

策展人: "是的，${CHINESE_NOTEBOOKLM_PATTERNS.affirmations[1]}。接下来我们还会发现更多惊人的..."

主持人: "${CHINESE_NOTEBOOKLM_PATTERNS.audience_engagement[0]}，我们一起..."

策展人: "还有更多精彩的故事等着我们发现呢。"

**核心应用模式:**
- ${CHINESE_NOTEBOOKLM_PATTERNS.transitions.slice(0, 2).join(' → ')}
- ${CHINESE_NOTEBOOKLM_PATTERNS.affirmations.slice(0, 2).join(' → ')}  
- ${CHINESE_NOTEBOOKLM_PATTERNS.audience_engagement[0]} (必须包含)
`;
}

// ===============================
// 🔧 中文文化适配辅助函数
// ===============================

/**
 * 生成中文特色的文化比较
 */
function generateChineseCulturalComparisons(locationName: string): string[] {
  return [
    `想象一下天安门广场，但有着1500年的历史`,
    `就像故宫一样，但装满了古代珍宝`,
    `相当于中国的大英博物馆`,
    `大概有${CHINESE_CULTURAL_REFERENCES.scaleComparisons[0]}`,
    `就是${CHINESE_CULTURAL_REFERENCES.scaleComparisons[1]}的规模`,
    `可以说是中华文化的瑰宝`
  ];
}

/**
 * 生成中文度量语境化
 */
function generateChineseMeasurements(metric: string): string {
  const conversions: Record<string, string> = {
    '27.5cm': '27.5厘米（大概一尺长）',
    '1kg': '1公斤（相当于两瓶矿泉水的重量）',
    '130,000 square meters': '13万平方米（相当于18个足球场）',
    '420,000 pieces': '42万件藏品 - 比故宫博物院还要多！'
  };
  
  return conversions[metric] || metric;
}

// ===============================
// 🔧 默认导出
// ===============================

const ChinesePodcastModule = {
  createChinesePodcastPrompt,
  createChineseFullGuidePrompt,
  CHINESE_NOTEBOOKLM_PATTERNS,
  CHINESE_DIALOGUE_STRUCTURE,
  CHINESE_CULTURAL_REFERENCES,
  applyChinesePersonaCharacteristics,
  generateChineseCulturalComparisons,
  generateChineseMeasurements
};

export default ChinesePodcastModule;