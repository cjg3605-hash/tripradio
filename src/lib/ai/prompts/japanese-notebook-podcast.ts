/**
 * Japanese NotebookLM-style Podcast Prompt System
 * Based on actual NotebookLM Audio Overview analysis for Japanese speakers
 */

export interface JapaneseNotebookPodcastConfig {
  museumName: string;
  curatorContent: any;
  chapterIndex: number;
  exhibition?: any;
  targetLength?: number;
}

/**
 * Japanese NotebookLM Core Conversation Patterns (Research-based)
 */
const JAPANESE_NOTEBOOKLM_PATTERNS = {
  // 1. Opening patterns
  openings: [
    "はい、皆さんこんにちは",
    "今日はですね、本当に興味深いお話があるんです",
    "さあ、今回は特別な場所についてお話していきましょう"
  ],

  // 2. Mutual confirmation and support expressions
  affirmations: ["そうですね", "はい、その通りです", "本当にそうですね", "ええ", "あ、そうなんですか", "本当ですか"],

  // 3. Transition and connection expressions
  transitions: [
    "そのお話が出たということで",
    "あ、そういえば",
    "ところで、これご存知ですか",
    "さらに驚くべきことに",
    "ちょっと待ってください、それでは"
  ],

  // 4. Surprise and excitement expressions
  excitement: [
    "わあ、本当ですか",
    "えっ！そんなに",
    "これは本当に興味深いですね",
    "私も知りませんでした",
    "驚きですね"
  ],

  // 5. Audience engagement
  audience_engagement: [
    "聞いてらっしゃる皆さんも想像してみてください",
    "リスナーの皆さんの中には",
    "皆さんだったらどう思われますか",
    "聞いてらっしゃる皆さんが気になっておられるのは"
  ],

  // 6. Meta comments (conversation references)
  meta_comments: [
    "リスナーの皆さんが混乱されるかもしれませんが",
    "今の説明は複雑だったでしょうか",
    "これが重要なポイントなんです",
    "まとめてみますと"
  ]
};

/**
 * Japanese NotebookLM-style dialogue structure template
 */
const JAPANESE_DIALOGUE_STRUCTURE = {
  intro: {
    pattern: "オープニング → 驚くべき事実の提示 → 相互確認 → 期待感の醸成",
    length: "400-500文字",
    infoPoints: "3-4個"
  },
  
  main: {
    pattern: "主題紹介 → 深い探求 → 関連する事実 → 驚くべき発見",
    length: "2500-3000文字", 
    infoPoints: "15-20個"
  },
  
  transition: {
    pattern: "現在のトピック終了 → 次の接続点 → 期待感 → 自然な移行",
    length: "300-400文字",
    infoPoints: "2-3個"
  }
};

/**
 * Main Japanese NotebookLM-style prompt generator
 */
export function createJapaneseNotebookPodcastPrompt(config: JapaneseNotebookPodcastConfig): string {
  const { museumName, curatorContent, chapterIndex, exhibition, targetLength = 4000 } = config;
  
  const isIntro = chapterIndex === 0;
  const chapterName = isIntro ? 'イントロダクション' : exhibition?.name;
  
  return `
# 🎙️ TripRadio NotebookLMスタイル 日本語ポッドキャスト生成

## コアミッション
Google NotebookLM Audio Overviewの**実際の会話パターン**を完璧に再現して、
自然で魅力的な${chapterName}エピソードを日本語で作成してください。

## NotebookLM コア特性（研究に基づく）

### 1. 自然な会話の流れ
- **相互補完**: 一人が話し始めると、もう一人が自然に完成させる
- **予測可能な割り込み**: "あ、それは..." / "そうですね、そして..." 
- **情報の階層化**: 基本情報 → 興味深い詳細 → 驚くべき事実の順序

### 2. 高い情報密度と具体性
- **1ターンあたり2-3個の具体的事実**必須
- **数字の体感化**: "42万点ということは...毎日一つずつ見ても1,150年かかります"
- **比較と関連付け**: "サッカー場18個分の大きさ" / "皇居の半分くらい"

### 3. 自然な驚きと発見
- **段階的な驚き**: "ところで、これご存知ですか？さらに驚くべきことに..."
- **共有された発見**: "私も今回初めて知ったのですが..."
- **継続的な好奇心**: "では、その次は何が..."

### 4. リスナー中心の意識
- **メタ認識**: "リスナーの皆さんが疑問に思われているのは..."
- **参加の誘い**: "皆さんも想像してみてください..."
- **明確な案内**: "まとめますと..." / "簡単に言いますと..."

## 実際の出力ガイドライン

### ${isIntro ? 'イントロダクション・エピソード' : exhibition?.name + 'エピソード'} 制作要件

#### 📍 設定コンテキスト
${isIntro ? `
**[博物館入口 → 最初の展示ホール]**
- ホスト: 初回訪問、好奇心旺盛、積極的に質問
- キュレーター: ${museumName}主任キュレーター、専門家でありながら親しみやすい
- 目標: 博物館全体の紹介 + 最初のホール進入 + 期待感の醸成
` : `
**[${exhibition?.name} 展示ホール内部]**
- 場所: ${exhibition?.floor}
- テーマ: ${exhibition?.theme}
- 主要作品: ${exhibition?.artworks?.map(a => a.name).slice(0,3).join('、') || '代表的なコレクション'}
- 目標: ホールの特徴 + 代表作品の詳細探求 + 次への接続
`}

#### 🎯 NotebookLMパターン適用（必須）

**オープニング（400-500文字）**
${isIntro ? `
ホスト: "はい、皆さんこんにちは！TripRadioです。今日は本当に特別な場所、${museumName}にいるんですが、うわあ、まずこの規模がすごくて..."

キュレーター: "こんにちは、キュレーターの${generateJapaneseCuratorName()}です。はい、ここは${generateJapaneseScaleComparison()}..."

ホスト: "${generateJapaneseSurpriseReaction()}..."

キュレーター: "${generateJapaneseSpecificFacts()}..."

ホスト: "${generateJapaneseCuriousQuestion()}？"

キュレーター: "${generateJapaneseEngagingAnswer()}..."
` : `
ホスト: "さあ、${exhibition?.name}に入ってきました。あれ？でも、ここの${generateJapaneseEnvironmentObservation()}..."

キュレーター: "あ、よく気づかれましたね！${exhibition?.name}は${generateJapaneseTechnicalExplanation()}..."

ホスト: "${generateJapaneseComparison()}？"

キュレーター: "${generateJapaneseDetailedExplanation()}..."

ホスト: "あー、だから...でも、もう${generateJapaneseArtworkSpotting()}？"

キュレーター: "はい、あれが${exhibition?.artworks?.[0]?.name || '代表的な作品'}ですね。これが..."
`}

**メイン対話（${targetLength - 900}文字） - 超高密度情報**

${generateJapaneseMainDialogueTemplate(config)}

**まとめと移行（300-400文字）**
${generateJapaneseTransitionTemplate(config)}

#### 💡 NotebookLM会話技法（必須適用）

1. **情報の階層化**
   - レベル1: 基本事実（"これは国宝第191号の金冠です"）
   - レベル2: 興味深い詳細（"高さ27.5cm、重さ1キログラム"） 
   - レベル3: 驚くべき事実（"曲玉は実は日本から輸入されたものなんです"）

2. **自然な割り込み**
   - "あ、それは..." / "そうですね、そして..." / "ちょっと待ってください、それでは..."
   - 相手の言葉を受けて情報を追加する
   - 予想される質問を先回りして答える

3. **リスナーへの意識**
   - "リスナーの皆さんが今疑問に思われているのは..."
   - "皆さんも想像してみてください..."
   - "これが重要なポイントなんですが..."

4. **感情的な関与**
   - 本当に驚く反応: "わあ、本当ですか？"
   - 共感の形成: "私も初めて知った時は..."
   - 好奇心の刺激: "さらに驚くべきことに..."

## 必須出力フォーマット

**ホスト:** （対話）

**キュレーター:** （対話）

**ホスト:** （対話）

**キュレーター:** （対話）

## 品質基準（NotebookLMレベル）

- ✅ **情報密度**: ${Math.round(targetLength/200)}個以上の具体的事実
- ✅ **会話のリズム**: 平均1-2文の交換、自然な息づき
- ✅ **リスナーへの言及**: エピソード当たり5-7回
- ✅ **驚きの瞬間**: 3-4回の「わあ、本当ですか？」の瞬間
- ✅ **関連性**: 各情報が自然につながる
- ✅ **専門性**: キュレーターらしい深い知識
- ✅ **アクセス性**: 一般の人にも理解できる説明

**今すぐNotebookLMスタイルの${chapterName}エピソードを**ホスト:**と**キュレーター:**フォーマットで作成してください！**
`;
}

/**
 * Japanese main dialogue template generation
 */
function generateJapaneseMainDialogueTemplate(config: JapaneseNotebookPodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
**[博物館の規模と意義の探求 - 1200文字]**
- 具体的な数字で規模感を伝える（面積、収蔵品数、歴史）
- 体感できる比較（"サッカー場何個分"、"皇居の大きさ"）
- 建設・移転ストーリーと特別なエピソード
- 世界的地位と独特な特徴

**[今日の旅程紹介 - 1200文字]**
- おすすめ観覧ルートと所要時間
- 各展示ホールのハイライト予告
- 隠れた見どころとキュレーター推薦ポイント
- 最初の展示ホールへの自然な接続

**[期待感醸成と特別情報 - 1000文字]**
- 今日出会う"世界最高"レベルの作品たち
- 一般の人は知らない興味深い事実
- 最近の研究成果や新しい発見
- 最初の展示ホール進入前の最後のティーザー
`;
  } else {
    return `
**[代表作品1 集中探求 - 1400文字]**
- 第一印象と基本情報（大きさ、材料、時代）
- 制作技法と芸術的価値
- 歴史的背景と発見ストーリー
- 隠された意味と象徴
- 最新研究結果や復元過程

**[作品間の関連と文脈 - 1200文字]**
- 時代的背景と文化的文脈
- 他の作品との関係
- 当時の人々の生活様式
- 現代的意味と教訓

**[キュレーター特別インサイト - 1000文字]**
- 展示企画意図とストーリー
- 観覧者が見逃しがちな詳細
- 作品保存と管理エピソード
- 専門家だけが知る特別な情報
`;
  }
}

/**
 * Japanese transition template generation
 */
function generateJapaneseTransitionTemplate(config: JapaneseNotebookPodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
ホスト: "わあ、もうこんな時間！いよいよ最初の展示ホールに..."

キュレーター: "はい、${config.curatorContent?.exhibitions?.[0]?.name || '新羅館'}に行ってみましょう。そこでは..."

ホスト: "お、楽しみですね！リスナーの皆さん、一緒に入ってみましょうか？"

キュレーター: "さあ、1500年前の新羅へタイムトラベルしてみましょう。"
`;
  } else {
    return `
ホスト: "時間が経つのが本当に早いですね。次はどこに..."

キュレーター: "${exhibition?.next_direction || '次の展示ホールに移動しましょう'}。そこではまた別の驚くべき..."

ホスト: "リスナーの皆さんも私のようにワクワクしてらっしゃるでしょうね！続けて一緒に楽しみましょう！"

キュレーター: "はい、さらに素晴らしいストーリーが待っていますから。"
`;
  }
}

/**
 * Japanese helper functions
 */
function generateJapaneseCuratorName(): string {
  const names = ['田中先生', '佐藤先生', '山田先生', '高橋先生', '渡辺先生'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateJapaneseScaleComparison(): string {
  const comparisons = [
    '世界第6位の規模なんです。延べ床面積だけで13万平方メートルあるんですよ...',
    'サッカー場18個分の大きさです。収蔵品だけで42万点も...',
    '皇居の半分ほどの規模になります...'
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateJapaneseSurpriseReaction(): string {
  const reactions = [
    "13万平方メートルって想像がつかないんですが",
    "えっ！そんなに大きいんですか",
    "わあ、想像もできませんでした"
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

function generateJapaneseSpecificFacts(): string {
  return '42万点を超えるんです。そのうち展示されているのは1万5千点ほどで';
}

function generateJapaneseCuriousQuestion(): string {
  const questions = [
    "ちょっと待ってください、じゃあ残りは",
    "そんなにたくさんの収蔵品はどうやって",
    "どうやってそんなにたくさん集められたんですか"
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateJapaneseEngagingAnswer(): string {
  return '収蔵庫にあるんです。定期的に入れ替えながら展示して...';
}

function generateJapaneseEnvironmentObservation(): string {
  const observations = [
    "照明が特殊ですね",
    "雰囲気が全然違いますね",
    "温度が違うような気がするんですが"
  ];
  return observations[Math.floor(Math.random() * observations.length)];
}

function generateJapaneseTechnicalExplanation(): string {
  return '作品保護のために照度を50ルクス以下で管理していますので';
}

function generateJapaneseComparison(): string {
  const comparisons = [
    "50ルクスってどのくらい暗いんですか",
    "普段よりかなり暗いってことですね",
    "普通の室内より暗いってことですか"
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateJapaneseDetailedExplanation(): string {
  return '普通のオフィスが500ルクス程度ですから10分の1ですね。最初は暗く感じますが、目が慣れてくると';
}

function generateJapaneseArtworkSpotting(): string {
  const spottings = [
    "何かキラキラ光るものが見えるんですが",
    "あそこで金色に輝いているのは",
    "金色に光っているのが目に入りますね"
  ];
  return spottings[Math.floor(Math.random() * spottings.length)];
}

/**
 * Compatibility wrapper for existing system
 */
export function createJapaneseEnhancedPodcastPrompt(
  museumName: string,
  curatorContent: any,
  chapterIndex: number,
  exhibition?: any
): string {
  return createJapaneseNotebookPodcastPrompt({
    museumName,
    curatorContent, 
    chapterIndex,
    exhibition,
    targetLength: 4000
  });
}

export default {
  createJapaneseNotebookPodcastPrompt,
  createJapaneseEnhancedPodcastPrompt,
  JAPANESE_NOTEBOOKLM_PATTERNS,
  JAPANESE_DIALOGUE_STRUCTURE
};