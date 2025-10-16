/**
 * Chinese NotebookLM-style Podcast Prompt System
 * Based on actual NotebookLM Audio Overview analysis for Chinese speakers
 */

export interface ChineseNotebookPodcastConfig {
  museumName: string;
  curatorContent: any;
  chapterIndex: number;
  exhibition?: any;
  targetLength?: number;
}

/**
 * Chinese NotebookLM Core Conversation Patterns (Research-based)
 */
const CHINESE_NOTEBOOKLM_PATTERNS = {
  // 1. Opening patterns
  openings: [
    "大家好，欢迎收听",
    "今天我们要聊的这个地方真的很有意思",
    "好，今天我们来到了一个特别的地方"
  ],

  // 2. Mutual confirmation and support expressions
  affirmations: ["对对", "没错", "是的", "嗯嗯", "哇，真的吗", "真的假的"],

  // 3. Transition and connection expressions
  transitions: [
    "说到这个",
    "哦，对了",
    "你知道吗",
    "更神奇的是",
    "等等，那"
  ],

  // 4. Surprise and excitement expressions
  excitement: [
    "哇，真的吗",
    "不会吧！这么多",
    "这真的太神奇了",
    "我也不知道呢",
    "太厉害了"
  ],

  // 5. Audience engagement
  audience_engagement: [
    "听众朋友们可以想象一下",
    "正在收听的朋友们",
    "大家觉得怎么样",
    "听众朋友们可能会好奇"
  ],

  // 6. Meta comments (conversation references)
  meta_comments: [
    "听众朋友们现在可能有点困惑",
    "刚才的解释会不会太复杂了",
    "这是很重要的一点",
    "我来总结一下"
  ]
};

/**
 * Chinese NotebookLM-style dialogue structure template
 */
const CHINESE_DIALOGUE_STRUCTURE = {
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

/**
 * Main Chinese NotebookLM-style prompt generator
 */
export function createChineseNotebookPodcastPrompt(config: ChineseNotebookPodcastConfig): string {
  const { museumName, curatorContent, chapterIndex, exhibition, targetLength = 4000 } = config;
  
  const isIntro = chapterIndex === 0;
  const chapterName = isIntro ? '介绍篇' : exhibition?.name;
  
  return `
# 🎙️ TripRadio NotebookLM风格 中文播客生成

## 核心任务
完美复现Google NotebookLM Audio Overview的**真实对话模式**，
创作自然且引人入胜的${chapterName}节目。

## NotebookLM 核心特征（基于研究）

### 1. 自然的对话流程
- **相互补全**: 一个人开始说话，另一个人自然地接着完成
- **可预见的插话**: "哦，那个..." / "对对，还有..." 
- **信息分层**: 基础信息 → 有趣细节 → 惊人事实的顺序

### 2. 高信息密度和具体性
- **每轮2-3个具体事实**必须包含
- **数字的具象化**: "42万件文物...每天看一件都要1150年"
- **比较和联系**: "18个足球场那么大" / "相当于天安门广场的一半"

### 3. 自然的惊讶和发现
- **递进式惊叹**: "你知道吗？更神奇的是..."
- **共同发现**: "我也是刚知道..."
- **持续好奇**: "那接下来是什么..."

### 4. 以听众为中心的意识
- **元认知**: "听众朋友们现在可能在想..."
- **参与邀请**: "大家可以想象一下..."
- **清楚指引**: "总结一下..." / "简单来说..."

## 实际输出指南

### ${isIntro ? '介绍节目' : exhibition?.name + '节目'} 制作要求

#### 📍 情境设置
${isIntro ? `
**[博物馆入口 → 第一个展厅]**
- 主持人: 首次参观，充满好奇，积极提问
- 策展人: ${museumName}高级策展人，专业而亲和
- 目标: 博物馆整体介绍 + 第一展厅入门 + 营造期待感
` : `
**[${exhibition?.name} 展厅内部]**
- 位置: ${exhibition?.floor}
- 主题: ${exhibition?.theme}
- 核心作品: ${exhibition?.artworks?.map(a => a.name).slice(0,3).join('、') || '代表性藏品'}
- 目标: 展厅特色 + 代表作品深度探索 + 下一步连接
`}

#### 🎯 NotebookLM模式应用（必须）

**开场（400-500字）**
${isIntro ? `
主持人: "大家好，欢迎收听TripRadio！今天我们来到了一个特别的地方，${museumName}。哇，光是这个规模就..."

策展人: "你好，我是策展人${generateChineseCuratorName()}。是的，这里${generateChineseScaleComparison()}..."

主持人: "${generateChineseSurpriseReaction()}..."

策展人: "${generateChineseSpecificFacts()}..."

主持人: "${generateChineseCuriousQuestion()}？"

策展人: "${generateChineseEngagingAnswer()}..."
` : `
主持人: "现在我们进入了${exhibition?.name}。咦？这里的${generateChineseEnvironmentObservation()}..."

策展人: "啊，你观察得很仔细！${exhibition?.name}是${generateChineseTechnicalExplanation()}..."

主持人: "${generateChineseComparison()}？"

策展人: "${generateChineseDetailedExplanation()}..."

主持人: "啊，原来如此...不过我已经看到${generateChineseArtworkSpotting()}？"

策展人: "对，那就是${exhibition?.artworks?.[0]?.name || '我们的镇馆之宝'}。这件..."
`}

**主要对话（${targetLength - 900}字） - 超高密度信息**

${generateChineseMainDialogueTemplate(config)}

**总结与过渡（300-400字）**
${generateChineseTransitionTemplate(config)}

#### 💡 NotebookLM对话技巧（必须应用）

1. **信息分层**
   - 第1层: 基础事实（"这是国宝第191号金冠"）
   - 第2层: 有趣细节（"高27.5厘米，重1公斤"） 
   - 第3层: 惊人事实（"这些曲玉其实是从日本进口的"）

2. **自然插话**
   - "哦，那个..." / "对对，还有..." / "等等，那..."
   - 接着对方的话添加信息
   - 提前回答预期的问题

3. **听众意识**
   - "听众朋友们现在可能想知道..."
   - "大家可以想象一下..."
   - "这是重点..."

4. **情感参与**
   - 真实的惊讶反应: "哇，真的吗？"
   - 形成共鸣: "我第一次知道的时候也..."
   - 刺激好奇: "更神奇的是..."

## 必需输出格式

**主持人:** （对话）

**策展人:** （对话）

**主持人:** （对话）

**策展人:** （对话）

## 质量标准（NotebookLM水平）

- ✅ **信息密度**: ${Math.round(targetLength/200)}个以上具体事实
- ✅ **对话节奏**: 平均1-2句交换，自然呼吸
- ✅ **听众提及**: 每集5-7次
- ✅ **惊喜时刻**: 3-4个"哇，真的吗？"时刻
- ✅ **连贯性**: 每个信息自然连接
- ✅ **专业性**: 策展人级别的深度知识
- ✅ **可接受性**: 普通人也能理解的解释

**立即创建NotebookLM风格的${chapterName}节目，使用**主持人:**和**策展人:**格式！**
`;
}

/**
 * Chinese main dialogue template generation
 */
function generateChineseMainDialogueTemplate(config: ChineseNotebookPodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
**[博物馆规模与意义探索 - 1200字]**
- 用具体数字传达规模感（面积、藏品数、历史）
- 可感知的比较（"几个足球场大小"、"天安门广场大小"）
- 建造/迁移故事和特殊经历
- 世界地位和独特特色

**[今日行程介绍 - 1200字]**
- 推荐参观路线和所需时间
- 各展厅亮点预览
- 隐藏看点和策展人推荐
- 向第一展厅的自然过渡

**[期待营造与特殊信息 - 1000字]**
- 今天将遇到的"世界级"作品
- 普通人不知道的有趣事实
- 最新研究成果或新发现
- 进入第一展厅前的最后预告
`;
  } else {
    return `
**[代表作品1深度探索 - 1400字]**
- 第一印象和基本信息（大小、材料、年代）
- 制作技法和艺术价值
- 历史背景和发现故事
- 隐藏含义和象征意义
- 最新研究成果或修复过程

**[作品间联系与背景 - 1200字]**
- 时代背景和文化语境
- 与其他作品的关系
- 当时人们的生活状态
- 现代意义和启示

**[策展人特别见解 - 1000字]**
- 展览策划意图和故事
- 参观者容易忽略的细节
- 作品保护和管理故事
- 只有专家才知道的特殊信息
`;
  }
}

/**
 * Chinese transition template generation
 */
function generateChineseTransitionTemplate(config: ChineseNotebookPodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
主持人: "哇，时间过得真快！现在我们真的要去第一个展厅了..."

策展人: "对，我们去${config.curatorContent?.exhibitions?.[0]?.name || '新罗馆'}看看。在那里我们会看到..."

主持人: "哦，太期待了！听众朋友们，我们一起进去看看吧？"

策展人: "好，让我们穿越到1500年前的新罗王国。"
`;
  } else {
    return `
主持人: "时间过得真快啊。接下来我们要去哪里..."

策展人: "${exhibition?.next_direction || '我们接下来去下一个展厅'}。在那里还有更多惊喜的..."

主持人: "听众朋友们是不是和我一样兴奋？让我们继续一起探索吧！"

策展人: "是的，还有更多精彩的故事等着我们。"
`;
  }
}

/**
 * Chinese helper functions
 */
function generateChineseCuratorName(): string {
  const names = ['王老师', '李老师', '张老师', '刘老师', '陈老师'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateChineseScaleComparison(): string {
  const comparisons = [
    '世界第6大博物馆。仅建筑面积就有13万平方米...',
    '相当于18个足球场的大小。光藏品就有42万件...',
    '大概是天安门广场一半的规模...'
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateChineseSurpriseReaction(): string {
  const reactions = [
    "13万平方米我完全想象不出来",
    "不会吧！这么大？",
    "哇，我根本想不到"
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

function generateChineseSpecificFacts(): string {
  return '超过42万件藏品。其中展出的大概有1万5千件';
}

function generateChineseCuriousQuestion(): string {
  const questions = [
    "等等，那其他的呢",
    "那么多藏品怎么管理",
    "怎么收集到这么多的"
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateChineseEngagingAnswer(): string {
  return '都在库房里。定期轮换展出...';
}

function generateChineseEnvironmentObservation(): string {
  const observations = [
    "灯光很特别",
    "气氛完全不一样了",
    "温度好像不一样"
  ];
  return observations[Math.floor(Math.random() * observations.length)];
}

function generateChineseTechnicalExplanation(): string {
  return '为了保护文物，我们把照度控制在50勒克斯以下';
}

function generateChineseComparison(): string {
  const comparisons = [
    "50勒克斯有多暗啊",
    "比平常要暗很多吧",
    "比普通室内暗吗"
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateChineseDetailedExplanation(): string {
  return '普通办公室大概500勒克斯，这里是十分之一。刚开始会觉得暗，眼睛适应了就';
}

function generateChineseArtworkSpotting(): string {
  const spottings = [
    "有什么金光闪闪的东西",
    "那里金色发光的是什么",
    "金色的东西很显眼啊"
  ];
  return spottings[Math.floor(Math.random() * spottings.length)];
}

/**
 * Compatibility wrapper for existing system
 */
export function createChineseEnhancedPodcastPrompt(
  museumName: string,
  curatorContent: any,
  chapterIndex: number,
  exhibition?: any
): string {
  return createChineseNotebookPodcastPrompt({
    museumName,
    curatorContent, 
    chapterIndex,
    exhibition,
    targetLength: 4000
  });
}

export default {
  createChineseNotebookPodcastPrompt,
  createChineseEnhancedPodcastPrompt,
  CHINESE_NOTEBOOKLM_PATTERNS,
  CHINESE_DIALOGUE_STRUCTURE
};