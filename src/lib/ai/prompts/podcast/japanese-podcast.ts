/**
 * 日本語ポッドキャストプロンプトシステム
 * NotebookLMスタイル最適化された日本語対話生成
 * 優秀な既存プロンプトを統合した完成度の高いシステム
 */

import { PERSONAS, type PodcastPersona } from '@/lib/ai/personas/podcast-personas';
import type { PodcastPromptConfig } from './index';

// ===============================
// 🔧 NotebookLM対話パターンシステム
// ===============================

/**
 * 実際のNotebookLM Audio Overview分析による核心的対話パターン
 */
const JAPANESE_NOTEBOOKLM_PATTERNS = {
  // 1. オープニングパターン - 自然な開始
  openings: [
    "皆さんこんにちは！",
    "今日は本当に興味深いお話があるんです",
    "さあ、今回は特別な場所に行ってみましょう",
    "わあ、ここは本当に素晴らしいところですね",
    "TripRadioです。今日は本当に特別な場所にいるんですが"
  ],

  // 2. 相互確認及び支持表現 - NotebookLMの核心
  affirmations: [
    "そうですね", "正確です", "その通りですね", "はい、はい", 
    "あ、そうなんですか", "本当ですか", "わあ、そうなんですね", "へえ、そうなんですか"
  ],

  // 3. 転換及び連結表現 - 自然な話題移動
  transitions: [
    "その話が出たということで",
    "あ、そういえば", 
    "ところで、これご存知ですか",
    "さらに驚くべきことに",
    "ちょっと待ってください、それでは",
    "それで申し上げますと",
    "まさにその部分が"
  ],

  // 4. 驚きや興味の表現 - 感情的没入
  excitement: [
    "わあ、本当ですか？",
    "えっ！そんなに？", 
    "これは本当に興味深いですね",
    "私も今回初めて知りました",
    "想像もしませんでした",
    "え？そんなことがあったんですか？",
    "本当に驚きですね"
  ],

  // 5. 聴取者参加誘導 - NotebookLMの特徴
  audience_engagement: [
    "聞いてらっしゃる皆さんも想像してみてください",
    "今聞いてくださっている方々の中で",
    "皆さんならどう思われますか？",
    "聞いてらっしゃる皆さんが気になっておられるのは",
    "一緒に考えてみましょうか？",
    "皆さんも驚かれたでしょうね？"
  ],

  // 6. メタコメント - 対話に対する言及
  meta_comments: [
    "今聞いてらっしゃる皆さんが混乱されるかもしれませんが",
    "あ、今の説明は複雑でしたでしょうか？",
    "これが重要なポイントなんです",
    "ちょっと、まとめてみますと",
    "簡単に言いますと",
    "より具体的に申し上げますと"
  ]
};

/**
 * 情報密度と構造テンプレート
 */
const JAPANESE_DIALOGUE_STRUCTURE = {
  // 情報密度: ターン当たり2-3個の具体的事実
  // 対話リズム: 平均1-2文の交換
  // 自然な割り込みと完成
  intro: {
    pattern: "オープニング → 驚くべき事実提示 → 相互確認 → 期待感醸成",
    length: "400-500文字",
    infoPoints: "3-4個"
  },
  
  main: {
    pattern: "主題紹介 → 深い探求 → 関連する事実 → 驚くべき発見", 
    length: "2500-3000文字",
    infoPoints: "15-20個"
  },
  
  transition: {
    pattern: "現在の主題終了 → 次の接続点 → 期待感 → 自然な移動",
    length: "300-400文字", 
    infoPoints: "2-3個"
  }
};

// ===============================
// 🔧 ペルソナ統合システム
// ===============================

/**
 * ペルソナ特性を実際のプロンプトに適用
 */
function applyJapanesePersonaCharacteristics(persona: PodcastPersona, content: string): string {
  const { characteristics, responses } = persona;
  
  if (persona.role === 'host') {
    // 進行者: 好奇心旺盛で親しみやすいトーン
    const hostPatterns = [
      ...responses.surprise,
      ...responses.curiosity,
      ...characteristics.speakingStyle.slice(0, 3)
    ];
    return `進行者特性適用: ${hostPatterns.slice(0, 2).join('、')}を活用した ${content}`;
  } else {
    // キュレーター: 専門的だが親しみやすい解説
    const curatorPatterns = [
      ...responses.explanation, 
      ...characteristics.expertise.slice(0, 2),
      ...characteristics.conversationPatterns.slice(0, 2)
    ];
    return `キュレーター特性適用: ${curatorPatterns.slice(0, 2).join('、')}を活用した ${content}`;
  }
}

// ===============================
// 🔧 メインプロンプト生成関数
// ===============================

/**
 * チャプター別日本語ポッドキャストプロンプト生成（既存API互換）
 */
export function createJapanesePodcastPrompt(config: PodcastPromptConfig): string {
  const { locationName, chapter, locationContext, personaDetails, locationAnalysis, language } = config;
  
  const hostPersona = PERSONAS.JAPANESE_HOST;
  const curatorPersona = PERSONAS.JAPANESE_CURATOR;
  const targetLength = chapter.targetDuration * 10; // 秒当たり10文字基準
  
  return `
## 核心ミッション
Google NotebookLM Audio Overviewの**実際の対話パターン**を完璧に再現して
自然で魅力的な ${locationName} - ${chapter.title} エピソードを製作してください。

## チャプター情報
- **タイトル**: ${chapter.title}
- **説明**: ${chapter.description}  
- **目標時間**: ${chapter.targetDuration}秒（約${Math.round(chapter.targetDuration/60)}分）
- **予想セグメント**: ${chapter.estimatedSegments}個
- **主要内容**: ${chapter.contentFocus.join('、')}

## 活性化した専門家ペルソナ
${personaDetails.map(p => 
  `### ${p.name}\n${p.description}\n専門分野: ${p.expertise.join('、')}`
).join('\n\n')}

## NotebookLM核心特性（研究結果に基づく）

### 1. 対話の自然な流れ
- **相互補完**: 一人が話し始めると、もう一人が自然に完成させる
- **予想可能な割り込み**: "あ、それは..." / "そうですね、そして..." 
- **情報階層化**: 基本情報 → 興味深いディテール → 驚くべき事実の順序

### 2. 高い情報密度と具体性
- **ターン当たり2-3個の具体的事実**必須含有
- **数字の体感化**: "42万点ということは...毎日一つずつ見ても1,150年かかります"
- **比較と関連付け**: "サッカー場18個分の大きさ" / "東京ドーム3個分"

### 3. 自然な驚きと発見  
- **段階的驚き**: "ところで、これご存知ですか？さらに驚くべきことに..."
- **共有された発見**: "私も今回初めて知ったのですが..."
- **継続的好奇心**: "では、その次は何が..."

### 4. リスナー中心の意識
- **メタ認識**: "今聞いてらっしゃる皆さんが疑問に思われているのは..."
- **参加の誘い**: "皆さんも想像してみてください..."
- **明確な案内**: "まとめますと..." / "簡単に言いますと..."

## 📍 ペルソナベース対話設定

### 進行者 (${hostPersona.name}) 特性
${applyJapanesePersonaCharacteristics(hostPersona, '好奇心旺盛で積極的な質問者役割')}
- **話し方**: ${hostPersona.characteristics.speakingStyle.join('、')}
- **反応パターン**: ${hostPersona.responses.surprise.slice(0, 3).join('、')}
- **質問スタイル**: ${hostPersona.notebookLMPatterns.questions.slice(0, 2).join('、')}

### キュレーター (${curatorPersona.name}) 特性  
${applyJapanesePersonaCharacteristics(curatorPersona, '専門家だが親しみやすい解説者役割')}
- **説明スタイル**: ${curatorPersona.characteristics.speakingStyle.join('、')}
- **専門性表現**: ${curatorPersona.responses.explanation.slice(0, 3).join('、')}
- **接続パターン**: ${curatorPersona.responses.transition.slice(0, 2).join('、')}

## 🎯 NotebookLMパターン適用（必須）

**オープニング構造（400-500文字）**
ホスト: "${JAPANESE_NOTEBOOKLM_PATTERNS.openings[0]} TripRadioです。今日は${locationName}にいるんですが..."

キュレーター: "こんにちは、${personaDetails.find(p => p.expertise.includes('キュレーター') || p.name.includes('キュレーター'))?.name || '佐藤先生'}です。ここ${locationName}は..."

**メイン対話構造（${targetLength - 900}文字）- 超高密度情報**

${generateJapaneseMainDialogueTemplate(chapter, locationAnalysis)}

**まとめと移行（300-400文字）**  
${generateJapaneseTransitionTemplate(chapter)}

## 💡 NotebookLM対話技法（必須適用）

1. **情報階層化**
   - 1段階: 基本事実（"これが${locationName}の代表的な..."）
   - 2段階: 興味深いディテール（"高さ27.5cm、重さ1キログラム"） 
   - 3段階: 驚くべき事実（"実際には1500年前の技術で..."）

2. **自然な割り込み**
   - ${JAPANESE_NOTEBOOKLM_PATTERNS.transitions.slice(0, 3).join(' / ')}
   - 相手の言葉を受けて情報追加する
   - 予想される質問を先回りして答える

3. **リスナー意識**
   - ${JAPANESE_NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 3).join(' / ')}
   - ${JAPANESE_NOTEBOOKLM_PATTERNS.meta_comments.slice(0, 2).join(' / ')}

4. **感情的没入**
   - 本物の驚き反応: ${JAPANESE_NOTEBOOKLM_PATTERNS.excitement.slice(0, 3).join(' / ')}
   - 共感形成: "私も初めて知った時は..." / "本当に興味深いですよね？"
   - 好奇心刺激: "さらに驚くべきことに..." / "これもご存知ですか？"

## 必須出力形式

**ホスト:** （対話）

**キュレーター:** （対話）

**ホスト:** （対話）

**キュレーター:** （対話）

## 日本語文化適応

### 日本人向け比較表現
- **スケール比較**: "東京ドーム3個分の大きさ" / "皇居の半分ほど"
- **文化的参照**: 上野公園、東京駅、富士山、京都御所と比較
- **測定単位**: 日本の伝統的単位も併記（"約27.5cm（一尺弱）"）
- **時代的参照**: "平安時代と同じ頃" / "江戸時代よりもっと昔"

### 日本語特有のコミュニケーションパターン
- **直接的関与**: "いかがですか？" / "想像できますか？"
- **確認要請**: "分かりますでしょうか？" / "ついてこられますか？"
- **熱意表現**: "それは本当に素晴らしいですね！" / "驚きですよね？"
- **実用的焦点**: "これだけは知っておいてください" / "要するに"

### 日本文化配慮事項
- **間接的表現**: 直接的でない、婉曲な表現を好む
- **謙遜と尊敬**: 適切な敬語使用と謙遜の姿勢
- **調和重視**: 対立を避け、合意を求める対話
- **細部への注意**: 細かいディテールへの関心と配慮

## 絶対禁止事項
- マークダウン形式（**, ##, * など）絶対使用禁止
- 絵文字使用禁止
- 抽象的美辞麗句（"美しい"、"素晴らしい"など）禁止
- 推測的表現（"多分"、"〜と思われる"）禁止

## 品質基準（NotebookLMレベル）

- ✅ **情報密度**: ${Math.round(targetLength/250)}個以上の具体的事実
- ✅ **対話リズム**: 平均1-2文の交換、自然な呼吸
- ✅ **リスナー言及**: エピソード当たり5-7回
- ✅ **驚き要素**: 3-4回の"わあ、本当ですか？"の瞬間
- ✅ **連結性**: 各情報が自然に繋がる
- ✅ **専門性**: キュレーターらしい深い知識
- ✅ **アクセス性**: 一般の人にも理解できる説明

**今すぐNotebookLMスタイル${chapter.title}エピソードを**ホスト:**と**キュレーター:**形式で制作してください！**
`;
}

/**
 * 全体ガイド日本語ポッドキャストプロンプト生成
 */
export function createJapaneseFullGuidePrompt(
  locationName: string,
  guideData: any,
  options: {
    priority?: 'engagement' | 'accuracy' | 'emotion';
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    podcastStyle?: 'deep-dive' | 'casual' | 'educational' | 'exploratory';
  } = {}
): string {
  const { priority = 'engagement', audienceLevel = 'beginner', podcastStyle = 'educational' } = options;
  const hostPersona = PERSONAS.JAPANESE_HOST;
  const curatorPersona = PERSONAS.JAPANESE_CURATOR;
  
  const styleConfig = {
    'deep-dive': '深層分析と専門的解説',
    'casual': '気楽で親しみやすい対話',
    'educational': '教育的で体系的な説明',
    'exploratory': '探検的で発見中心の対話'
  };

  const audienceConfig = {
    'beginner': '一般人目線の分かりやすい説明',
    'intermediate': '基本知識がある関心の高い聴衆',
    'advanced': '深い背景知識を求める専門家級'
  };

  return `
## 🎙️ TripRadio NotebookLMスタイル全体ガイドポッドキャスト生成

### 核心ミッション  
${locationName}についての完全な理解のための**NotebookLMスタイル全体ガイドポッドキャスト**を製作してください。
${styleConfig[podcastStyle]}で${audienceConfig[audienceLevel]}に合わせて構成します。

### ガイド情報分析
**場所**: ${locationName}
**優先順位**: ${priority}（関与度/正確性/感情中心）
**聴衆レベル**: ${audienceLevel}  
**ポッドキャストスタイル**: ${podcastStyle}

### 全体構成戦略

#### 第1段階: 全体的紹介（800-1000文字）
${hostPersona.name}: "${JAPANESE_NOTEBOOKLM_PATTERNS.openings[1]} ${locationName}についての完全な話をお聞かせします..."

${curatorPersona.name}: "${curatorPersona.responses.explanation[0]} ${locationName}は単純に観光地ではなく..."

**含有要素**:
- 場所の全体的意味と重要性
- 今日扱う核心主題の予告
- 聴取者が期待できること
- ${JAPANESE_NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 2).join('、')}

#### 第2段階: 歴史と文化的脈絡（1200-1400文字）
**情報階層化適用**:
- 基本的な歴史的背景
- 文化的意味と価値
- 現代的重要性
- 国際的地位

**NotebookLMパターン**:
- ${JAPANESE_NOTEBOOKLM_PATTERNS.transitions[0]} + 具体的事実2-3個
- ${JAPANESE_NOTEBOOKLM_PATTERNS.excitement[1]} + 驚くべき発見
- ${JAPANESE_NOTEBOOKLM_PATTERNS.meta_comments[2]} + リスナー案内

#### 第3段階: 核心特徴と見どころ（1400-1600文字）  
**ペルソナ特性活用**:
- ${hostPersona.name}: ${hostPersona.responses.curiosity.slice(0, 2).join('、')}
- ${curatorPersona.name}: ${curatorPersona.responses.explanation.slice(0, 2).join('、')}

**具体的情報提供**:
- 代表的な見どころと特徴
- 隠れたディテールと専門家インサイト  
- 観覧のコツとおすすめコース
- 季節別・時間帯別特色

#### 第4段階: 体験と活動（1000-1200文字）
**実用的情報**:
- おすすめ体験活動
- フォトスポットと記念品
- 周辺連携観光地
- 交通と便利施設

#### 第5段階: まとめと感想（700-900文字）
**感情的まとめ**:
- ${locationName}だけの特別さ整理
- 訪問後感じることができる感動ポイント
- ${JAPANESE_NOTEBOOKLM_PATTERNS.audience_engagement[0]}
- 次の旅行地ヒント

### NotebookLM品質基準

- **情報密度**: 全体30-35個の具体的事実
- **対話交換**: 90-110回の自然なターン
- **リスナー言及**: 12-15回の積極的参加誘導
- **驚きの瞬間**: 6-8回の"わあ、本当ですか？"反応
- **ペルソナ一貫性**: 二人のキャラクターの明確な個性維持

### ペルソナ適用指針

**${hostPersona.name}（進行者）**:
- 特性: ${hostPersona.characteristics.personality.slice(0, 2).join('、')}
- 話し方: ${hostPersona.characteristics.speakingStyle.slice(0, 2).join('、')}
- 反応: ${hostPersona.responses.surprise.slice(0, 3).join('、')}

**${curatorPersona.name}（キュレーター）**:
- 特性: ${curatorPersona.characteristics.personality.slice(0, 2).join('、')}
- 説明法: ${curatorPersona.characteristics.conversationPatterns.slice(0, 2).join('、')}
- 専門性: ${curatorPersona.responses.explanation.slice(0, 3).join('、')}

## 日本文化適応

### 日本人向け比較表現
- **規模比較**: "東京ドーム3個分の大きさ" / "上野公園の半分ほど"
- **文化的参照**: 東京駅、上野公園、富士山、皇居と比較
- **測定単位**: メートル法と伝統単位併記（"27.5cm、約一尺弱"）
- **時代的参照**: "平安時代よりも古い時代" / "江戸幕府が開かれる前"

### 日本語特有のコミュニケーションパターン
- **直接的関与**: "いかがでしょうか？" / "想像できますか？"
- **確認要請**: "お分かりいただけますでしょうか？" / "ついてこられますか？"
- **熱意表現**: "それは本当に素晴らしいですね！" / "驚きですよね？"
- **実用的焦点**: "これだけは覚えておいてください" / "簡潔に言いますと"

### 国際聴衆配慮事項
- **普遍的文脈**: 世界的に知られた名所や概念を参照
- **文化的敏感性**: 文化的ニュアンスを仮定せずに説明
- **アクセシビリティ**: 国際訪問者に馴染みがない用語の定義
- **実用的価値**: 旅行者にとって行動可能な情報に焦点

## 最終出力形式

**ホスト:** （対話）
**キュレーター:** （対話）

**絶対マークダウン、絵文字、抽象的表現禁止！**

今すぐ${locationName}完全ガイドポッドキャストをNotebookLMレベルで制作してください！
`;
}

// ===============================
// 🔧 ヘルパー関数
// ===============================

/**
 * メイン対話テンプレート生成
 */
function generateJapaneseMainDialogueTemplate(chapter: any, locationAnalysis: any): string {
  const dialogueTypes = [
    `**[核心内容1集中探求 - 1000文字]**
- 第一印象と基本情報提示
- 具体的数値と比較データ
- ${JAPANESE_NOTEBOOKLM_PATTERNS.excitement[0]} → 驚くべき事実連結
- ${JAPANESE_NOTEBOOKLM_PATTERNS.transitions[1]} → 次の情報へ連結`,

    `**[深化情報と文脈 - 800文字]** 
- 歴史的・文化的背景説明
- ${JAPANESE_NOTEBOOKLM_PATTERNS.meta_comments[0]} → リスナー理解度確認
- 専門家インサイトと最新情報
- ${JAPANESE_NOTEBOOKLM_PATTERNS.audience_engagement[1]} → 参加誘導`,

    `**[特別ディテールと発見 - 700文字]**
- 一般人が見逃しやすいポイント
- ${JAPANESE_NOTEBOOKLM_PATTERNS.affirmations[2]} → 相互確認
- キュレーターだけが知る特別情報  
- ${JAPANESE_NOTEBOOKLM_PATTERNS.transitions[3]} → まとめ連結`
  ];

  return dialogueTypes.join('\n\n');
}

/**
 * 移行テンプレート生成
 */
function generateJapaneseTransitionTemplate(chapter: any): string {
  return `
**自然なまとめ:**

ホスト: "${JAPANESE_NOTEBOOKLM_PATTERNS.transitions[0]}、時間が本当に早いですね。${chapter.title}では..."

キュレーター: "はい、${JAPANESE_NOTEBOOKLM_PATTERNS.affirmations[1]}。次にはまた別の驚くべき..."

ホスト: "${JAPANESE_NOTEBOOKLM_PATTERNS.audience_engagement[0]} 私たちと一緒に..."

キュレーター: "さらに素晴らしい話が待っていますからね。"

**核心適用パターン:**
- ${JAPANESE_NOTEBOOKLM_PATTERNS.transitions.slice(0, 2).join(' → ')}
- ${JAPANESE_NOTEBOOKLM_PATTERNS.affirmations.slice(0, 2).join(' → ')}  
- ${JAPANESE_NOTEBOOKLM_PATTERNS.audience_engagement[0]} （必須含有）
`;
}

// ===============================
// 🔧 文化適応ヘルパー
// ===============================

/**
 * 日本特有の文化比較生成
 */
function generateJapaneseCulturalComparisons(locationName: string): string[] {
  return [
    `新宿駅のような賑やかさですが、1500年の歴史があります`,
    `上野公園のように思ってください、でも古代の宝物で満ちています`,
    `東京スカイツリーのような存在ですが、朝鮮の黄金時代から`,
    `東京ドーム約3個分の大きさです`,
    `それは皇居の半分ほどの規模です`,
    `日本で言えば東京国立博物館のような存在です`
  ];
}

/**
 * 日本語測定値文脈化生成
 */
function generateJapaneseMeasurements(metric: string): string {
  const conversions: Record<string, string> = {
    '27.5cm': '27.5cm（約一尺弱）',
    '1kg': '1キログラム（約270匁）',
    '130,000 square meters': '13万平方メートル（東京ドーム約3個分）',
    '420,000 pieces': '42万点 - 東京国立博物館より多いコレクションです！'
  };
  
  return conversions[metric] || metric;
}

// ===============================
// 🔧 基本エクスポート
// ===============================

const JapanesePodcastModule = {
  createJapanesePodcastPrompt,
  createJapaneseFullGuidePrompt,
  JAPANESE_NOTEBOOKLM_PATTERNS,
  JAPANESE_DIALOGUE_STRUCTURE,
  applyJapanesePersonaCharacteristics,
  generateJapaneseCulturalComparisons,
  generateJapaneseMeasurements
};

export default JapanesePodcastModule;