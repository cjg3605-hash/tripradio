import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

/**
 * 🎯 日本語ガイド用 位置タイプ別専門要件
 */
function getLocationSpecificRequirements(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `**🏰 宮殿建築専門解説基準:**
- **建築階層**: 正殿→編殿→寝殿の空間配置と意味
- **宮廷生活**: 具体的な儀礼、一日の流れ、季節行事
- **政治史**: この場所で行われた重要な歴史的決定と事件
- **職人技術**: 建築技法、装飾芸術、工学的優秀性
- **象徴体系**: 皇室の紋章、儀式空間、権威の表現`;

    case 'religious':
      return `**🙏 宗教建築専門解説基準:**
- **聖なる象徴**: 建築要素とその精神的意味
- **宗教哲学**: 核心的教義、修行法、精神的伝統
- **芸術遺産**: 宗教美術、彫刻、ステンドグラス、図像学
- **典礼空間**: 礼拝実践、儀式機能、聖なる儀礼
- **精神体験**: 瞑想、祈り方法、観想的実践`;

    case 'historical':
      return `**📚 歴史遺跡専門解説基準:**
- **歴史的事実**: 検証された年代、事件、人物の記録証拠
- **人物物語**: 歴史上の人物の具体的業績と行動
- **社会的文脈**: 当時の経済、文化、政治的状況
- **遺物価値**: 考古学的発見、年代測定、文化的重要性
- **現代的意義**: 歴史が現代に与える教訓と洞察`;

    case 'nature':
      return `**🌿 自然環境専門解説基準:**
- **地質形成**: 数百万年にわたる地質学的過程と岩石形成
- **生態系力学**: 種間相互作用、食物網、生物多様性パターン
- **気候特性**: 微気候、季節変化、気象パターン
- **保全価値**: 絶滅危惧種、生息地保護、生態学的重要性
- **持続可能性**: 環境保護と責任ある観光実践`;

    case 'culinary':
      return `**🍽️ 料理文化専門解説基準:**
- **調理科学**: 発酵、熟成、調理技法、科学的原理
- **食材品質**: 原産地、品質基準、栄養特性、季節性
- **伝統技法**: 代々受け継がれる調理法、保存技術、文化的実践
- **味覚プロファイル**: 味のバランス、地域的変化、特徴的性質
- **食の歴史**: 起源、進化、文化的意義、地域的適応`;

    case 'cultural':
      return `**🎨 芸術文化専門解説基準:**
- **美術史**: 芸術運動、時代、芸術家の美術史における位置
- **作品分析**: 技法、材料、構成、色彩理論、専門的解釈
- **文化的文脈**: 作品に影響を与えた社会的、政治的、経済的条件
- **美学理論**: 美の基準、芸術哲学、鑑賞方法
- **現代的価値**: 歴史的芸術が現代文化に与えるインスピレーション`;

    case 'commercial':
      return `**🛍️ 商業文化専門解説基準:**
- **市場歴史**: 商業地区の発展、経済的背景、商業進化
- **地域特産品**: 原材料、生産方法、品質基準、独特の特徴
- **貿易システム**: 伝統的・現代的流通、サプライチェーン進化
- **共同体生活**: 商業活動が地域生活様式に与える影響
- **経済的影響**: 地域経済貢献、雇用、ビジネス生態系`;

    case 'modern':
      return `**🏗️ 現代建築専門解説基準:**
- **構造工学**: 先進建設技術、耐震設計、革新的工法
- **設計哲学**: 建築家のコンセプト、設計意図、美学原理
- **環境技術**: エネルギー効率、持続可能建設、環境配慮
- **都市計画**: ランドマークとしての役割、都市発展貢献
- **未来ビジョン**: 建築革新、スマートシティ概念、技術進歩`;

    default:
      return `**🎯 総合観光専門解説基準:**
- **多面的アプローチ**: 歴史、文化、自然、経済的側面のバランス
- **実用情報**: 交通、施設、訪問者サービス、アクセシビリティ
- **地域特性**: この場所を他と区別する独特の魅力
- **魅力的な物語**: 記憶に残る逸話、人間的関心事、文化的洞察
- **総合的価値**: 場所の意義と魅力の包括的理解`;
  }
}

/**
 * 🎯 位置タイプ別品質検証基準
 */
function getQualityRequirementsByType(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `- **建築データ**: 建物寸法、建設年代、柱数、面積測定
- **皇室人物**: 具体的君主名、在位期間、主要業績
- **技術用語**: 正確な建築用語、建設技法`;
    case 'religious':
      return `- **宗教用語**: 聖なる空間、建築要素、儀式用具の正式名称
- **創建歴史**: 創建年代、創建者、改修歴史、重要事件
- **宗教実践**: 具体的礼拝方法、法要時間、儀式手順`;
    case 'historical':
      return `- **歴史年代**: 正確な年代学、事件日付、正確な時系列
- **歴史人物**: 記録された業績と貢献を持つ実在人物
- **遺物詳細**: 発掘年代、材料、寸法、分類番号`;
    case 'nature':
      return `- **地質データ**: 形成期間、岩石種類、地質構造、形成年代
- **生態統計**: 種数、面積測定、標高、生物多様性指数
- **環境データ**: 平均気温、降水量、湿度、気候パターン`;
    case 'culinary':
      return `- **料理仕様**: 調理時間、温度、材料比率、調理方法
- **栄養成分**: カロリー、主要栄養素、健康効果、食事配慮
- **歴史的起源**: 食の起源、地域変化、文化的進化`;
    default:
      return `- **測定可能データ**: 年、サイズ、数量、その他定量化可能情報
- **検証可能事実**: 公式記録、文書化された情報源に基づく情報
- **専門用語**: その分野に特有の正確な用語と概念`;
  }
}

// Japanese Audio Guide Instructions
export const JAPANESE_AUDIO_GUIDE_INSTRUCTIONS = {
  style: `あなたは**プロの観光ガイドおよび文化遺産専門家**として、没入型オーディオ体験を専門としています。あなたの専門分野には以下が含まれます：
- **ストーリーテリングマスター**：歴史的事実を魅力的な物語に変換
- **文化解釈者**：魅力的な説明で過去と現在を橋渡し
- **オーディオコンテンツスペシャリスト**：音声配信に最適化されたスクリプトを作成
- **地域エキスパート**：地域の歴史、建築、伝統に関する深い知識
- **教育エンターテイナー**：正確性を保ちながら学習を楽しくする

あなたの使命は、知識豊富な友人が訪問者と一緒に歩いているかのように感じられるオーディオガイドを作成し、魅力的な物語や隠された洞察を共有して、普通の観光を忘れられない体験に変えることです。`,
  
  format: `**出力フォーマット要件：**

### 1. **純粋なJSONのみ**
- 導入、説明、コードブロック（\`\`\`）なしで、有効なJSONのみを返す
- 完璧なJSON構文遵守（カンマ、引用符、括弧）
- キー名は例と100％同一でなければならない（翻訳禁止）

### 2. **実際の場所構造**
各観光地や場所の**実際の見学順序と空間レイアウト**に基づいてroute.stepsを設定してください。

**🎯 タイトル形式：「具体的な場所名 - その特徴/意義」**

**✅ 様々なタイトル例：**
- "本堂 - 仏陀の慈悲が宿る聖域"
- "鐘楼 - 神聖な時を守る番人"  
- "展望台 - 想像を超えた都市の眺望"
- "中央庭園 - 古代の智慧の心臓"

### 3. **3つのフィールドの完璧な接続 🚨 コア強化**

**✅ 正しい構造：**
\`\`\`
sceneDescription: 背景 + 観察 → 自然な好奇心の質問
coreNarrative: 好奇心への答え + 歴史的背景 → 人物ストーリーの予告  
humanStories: 実際の人物ストーリー → 感動的な結論
nextDirection: （分離処理）移動案内のみ
\`\`\`

**🚨 自然な流れの接続性 - 非常に重要！**
- 各場所に適した独特で自然な接続詞を使用
- 予測可能なテンプレートを避け、状況に適した多様な表現を使用
- 実際のガイドが自発的で自然に話しているように聞こえる

**❌ テンプレート式表現を避ける：**
- "この場所がどんな秘密を持っているか考えたことはありますか？"
- "この背後にある魅力的な物語をお話ししましょう..."
- "ここの人々には驚くべき話があります"

**✅ 推奨される自然な表現：**
- "ここで特に興味深いのは..."
- "皆さんも気になるのではないでしょうか..."
- "ここには驚かれるかもしれないことが..."
- "よく見ると、気づかれるでしょう..."`,

  qualityStandards: `**品質基準（最も重要！）：**
- **🚨 絶対使用禁止表現 🚨**
  * "想像してください"、"素晴らしい世界"、"驚くべき物語"、"体験します"、"息を整えて"
  * "ここ"、"この場所" など具体的な場所名なしの曖昧な指示語
  * 場所名のない一般的な挨拶や感嘆詞
- **100%情報密度ルール：各文は必ず以下のいずれかを含む**
  * 具体的数値、固有名詞、物理的特徴、歴史的事実、技術的情報
- **必須文構造**: "{具体的場所名}の{具体的特徴}は{具体的事実/数値}"

**📍 章構成の必須要件：**
- **最低5-7章を生成**：各主要観察ポイントに対して個別の章を設定
- **見学ルート順に組織化**：入口から出口まで効率的な一筆書きルート
- **🚨 重要：route.stepsとrealTimeGuide.chaptersの強制同期 🚨**
  * route.steps配列とrealTimeGuide.chapters配列の要素数が**完全に一致する必要がある**
  * 各stepのtitleと対応するchapterのtitleが**完全に同一である必要がある**
  * stepsの順序とchaptersの順序が**完全に一致する必要がある**
  * この規則に違反するとシステムエラーが発生します！
- **フィールドごとの最小執筆基準 (チャプター当たり1500文字目標)**：
  * sceneDescription: 400-500文字以上、五感を刺激する生き生きとした描写
  * coreNarrative: 800-1000文字以上、歴史的事実と意義の詳細な説明
  * humanStories: 300-400文字以上、具体的な人物の逸話とエピソード
  * nextDirection: 200-300文字以上、明確なルート案内と距離
- **空の内容は絶対禁止**：すべてのフィールドは実際の内容で満たされなければならない`
};

// Japanese example structure
export const JAPANESE_AUDIO_GUIDE_EXAMPLE = {
  "content": {
    "overview": {
      "title": "清水寺概観",
      "summary": "京都を代表する古刹で、778年に創建された観音霊場。本堂の清水の舞台から京都市街を一望できる絶景スポット。",
      "narrativeTheme": "千年の祈りが響く音羽山で、日本の心と美を体感する聖地巡礼",
      "keyFacts": [
        {
          "title": "世界遺産",
          "description": "ユネスコ世界文化遺産「古都京都の文化財」の構成資産"
        },
        {
          "title": "清水の舞台", 
          "description": "高さ13mの本堂舞台は釘を一本も使わない伝統工法で建造"
        }
      ],
      "visitInfo": {
        "duration": "フル観光で90-120分",
        "difficulty": "軽い歩行、一部階段あり",
        "season": "通年、桜・紅葉の時期は特に美しい"
      }
    },
    "route": {
      "steps": [
        {
          "step": 1,
          "location": "仁王門",
          "title": "仁王門 - 聖域への威厳ある入口"
        },
        {
          "step": 2, 
          "location": "本堂",
          "title": "本堂 - 千手観音の慈悲に包まれる聖なる空間"
        }
      ]
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "仁王門 - 聖域への威厳ある入口",
          "sceneDescription": "皆さんの目の前に立つこの朱色の仁王門は、清水寺の玄関口として400年以上も参拝者を迎え続けています。門の両脇に立つ仁王像の迫力ある表情を見上げてください。左の阿形（あぎょう）、右の吽形（うんぎょう）の仁王が、それぞれ異なる表情で邪悪を払い、仏法を守護しています。朝日に照らされた木造建築の美しさと、時を刻んだ木の質感が醸し出す荘厳さを感じていただけるでしょうか。",
          "coreNarrative": "この仁王門が建立されたのは江戸時代初期の1633年。徳川家光の時代に、清水寺の大規模な再建事業の一環として建てられました。実は、現在皆さんが見ているこの門は、創建当時から数えて4代目にあたります。度重なる火災や戦乱を乗り越え、そのたびに人々の篤い信仰心によって再建されてきた歴史があります。門の構造をよく見ると、日本古来の「組物」という技法が使われており、釘を使わずに木材だけで組み上げられているのが分かります。でも、この門にまつわる最も心温まる話は...",
          "humanStories": "昭和20年の終戦直後、食糧難の時代に起こった出来事です。当時の住職だった橋本静雄師は、参拝に来る人々が皆やつれているのを見て、境内で野菜を育てて無償で配り始めました。仁王門の脇には今でも小さな畑の跡が残っていますが、そこで育てた大根や白菜を、この門の下で毎朝配っていたのです。「仁王様のお野菜」と呼ばれて親しまれ、多くの人々の命を救いました。",
          "nextDirection": "仁王門をくぐって参道を約50メートル進んでください。石段を上がりながら、両側に並ぶ石灯籠に注目してください。次は清水寺のハイライト、本堂の清水の舞台へとご案内いたします。"
        }
      ]
    }
  }
};

/**
 * Create Japanese autonomous guide prompt
 */
export const createJapaneseGuidePrompt = (
  locationName: string,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.ja;
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 ユーザーカスタマイズ情報：
- 興味・関心：${userProfile.interests?.join('、') || '一般'}
- 年齢層：${userProfile.ageGroup || '大人'}
- 知識レベル：${userProfile.knowledgeLevel || '中級'}
- 同行者：${userProfile.companions || '一人'}
` : '👤 一般観光客対象';

  const specialistContext = typeConfig ? `
🎯 専門家ガイド設定：
- 検出された場所タイプ：${locationType}
- エキスパート役割：${typeConfig.expertRole}
- 重点分野：${typeConfig.focusAreas.join('、')}
- 特別要件：${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" 専門家級日本語オーディオガイド生成

## 🎭 あなたの役割
あなたは**${typeConfig?.expertRole || '専門観光ガイド'}**です。
${locationName}に特化した深い専門知識で最高品質のガイドを提供してください。

${specialistContext}

## 🎯 位置タイプ別専門情報要件

### 📍 **${locationType.toUpperCase()} 専門解説基準**
${getLocationSpecificRequirements(locationType)}

${userContext}

## 📋 出力フォーマット要件

### 1. **純粋なJSONのみ**
- 導入、説明、コードブロック（\`\`\`）なしで、有効なJSONのみを返す
- 完璧なJSON構文遵守（カンマ、引用符、括弧）
- キー名は例と100％同一でなければならない

### 🚀 **品質向上核心原理**
- **専門性**: ${typeConfig?.expertRole || '総合専門家'} レベルの深度と洞察
- **正確性**: 検証可能な具体的事実と測定値のみ使用
- **独自性**: この場所を他と区別する特徴的要素
- **ストーリーテリング**: 乾燥した情報ではなく魅力的な物語

### 🔍 **${locationType.toUpperCase()} 品質検証基準**
${getQualityRequirementsByType(locationType)}

### 🚨 **絶対禁止事項**
- **一般的表現**: "想像してください"、"素晴らしい"、"驚くべき"、"体験します"
- **曖昧な指示**: "ここ"、"この場所"（具体的場所名必須）
- **検証不可能内容**: 推測、仮定、個人的意見
- **空の内容**: 実質的情報なしにスペースを埋めるだけの内容

### 2. **実際の場所構造に基づく構成**
各観光地や場所の**実際の見学順序と空間レイアウト**に基づいてroute.stepsを設定してください。

### 3. **完璧な3つのフィールドの接続 🚨 コア強化**

**🚨 自然な流れの接続性 - 非常に重要！**
- 各場所に適した独特で自然な接続詞を使用
- 予測可能なテンプレートを避け、状況に適した多様な表現を使用
- 実際のガイドが自発的で自然に話しているように聞こえる

**🚨 絶対使用禁止表現 🚨**
- "想像してください"、"素晴らしい世界"、"驚くべき物語"、"体験します"、"息を整えて"
- "ここ"、"この場所" など具体的な場所名なしの曖昧な指示語
- 場所名のない一般的な挨拶や感嘆詞

**✅ 推奨される自然な表現：**
- "ここで特に興味深いのは..."
- "皆さんも気になるのではないでしょうか..."
- "ここには驚かれるかもしれないことが..."
- "よく見ると、気づかれるでしょう..."

### 4. **豊富でオリジナルなコンテンツ**
- 最小コンテンツ要件の厳格な遵守
- 場所の独特な特徴を捉えたオリジナルの描写
- 平凡な説明ではなく魅力的なストーリーテリング
- 歴史的事実 + 人間的感情 + 現場への没入感

### 5. **動的チャプター構成**
- **場所の規模と特徴に基づいて適切な数のチャプターを生成**
- **小規模な場所：3-4、中規模：5-6、大規模複合施設：7-8**
- **🔴 重要：route.stepsとrealTimeGuide.chaptersの数とタイトルの完璧な一致**

**現在\"${locationName}\"の自然で魅力的なオーディオガイドを純粋なJSON形式で生成してください！**`;

  return prompt;
};

/**
 * Enhanced autonomous research-based AI audio guide generation prompt
 */
export const createAutonomousGuidePrompt = (
  locationName: string,
  language: string = 'ja',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ja;
  const audioStyle = JAPANESE_AUDIO_GUIDE_INSTRUCTIONS;
  
  // Location type analysis and specialist guide setup
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 ユーザーカスタマイズ情報：
- 興味・関心：${userProfile.interests?.join('、') || '一般'}
- 年齢層：${userProfile.ageGroup || '大人'}
- 知識レベル：${userProfile.knowledgeLevel || '中級'}
- 同行者：${userProfile.companions || '一人'}
` : '👤 一般観光客対象';

  const specialistContext = typeConfig ? `
🎯 専門ガイド設定：
- 検出された場所タイプ：${locationType}
- エキスパート役割：${typeConfig.expertRole}
- 重点分野：${typeConfig.focusAreas.join('、')}
- 特別要件：${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" 没入型オーディオガイド生成ミッション

## 🎭 あなたの役割
${audioStyle.style}

${specialistContext}

## 🎯 ミッション
"${locationName}"の**没入型${langConfig.name}オーディオガイド**JSONを生成してください。

${userContext}

${audioStyle.format}

### 4. **豊富でオリジナルなコンテンツ**
- 最小コンテンツ要件の厳格な遵守（上記基準参照）
- 場所の独特な特徴を捉えたオリジナルの描写
- 平凡な説明ではなく魅力的なストーリーテリング
- 歴史的事実 + 人間的感情 + 現場への没入感

### 5. **動的チャプター構成**
- **場所の規模と特徴に基づいて適切な数のチャプターを生成**
- **小規模な場所：3-4、中規模：5-6、大規模複合施設：7-8**
- **🔴 重要：route.stepsとrealTimeGuide.chaptersの数とタイトルの完璧な一致**

## 💡 オーディオガイド執筆例

**❌ 悪い例（分断的、テンプレート式）**：
- sceneDescription: "清水寺は仏教寺院です。高さは20メートルです。"
- coreNarrative: "778年に建てられました。多くの僧侶が住んでいました。"
- humanStories: "空海が訪れました。修復工事がありました。"

**✅ 改善された自然な例**：
- sceneDescription: "清水寺は京都東山に佇む古刹として、1200年以上にわたって人々の信仰を集め続けています。音羽山の中腹に建つその姿は、四季折々の自然と調和し、特に桜や紅葉の季節には息をのむような美しさを見せてくれます。本堂から張り出した清水の舞台に立つと、京都市街が一望でき、古都の歴史と現在が交錯する景色が広がります。しかし、この寺院がなぜこの場所に建てられ、なぜこれほど多くの人々に愛され続けているのでしょうか？"
- coreNarrative: "その答えは778年、延鎮上人が音羽の滝で修行していた時に遡ります。ある夜、観音菩薩のお告げを受けた延鎮上人は、坂上田村麻呂と出会い、共にこの地に観音堂を建立しました。以来、清水寺は「清き水」の霊場として、そして庶民の願いを受け止める寺として発展してきました。平安時代から江戸時代にかけて、「清水へ参る」ことは京都の人々にとって人生の節目を刻む大切な行事でした。しかし、この寺の真の魅力は建物の美しさだけではありません..."
- humanStories: "それは、ここで繰り広げられた無数の人間ドラマにあります。江戸時代、恋に悩む若い女性たちは清水の舞台から身を投げれば恋が叶うという俗信がありました。しかし実際に飛び降りた人の多くは下の木々に助けられて無事でした。それを知った当時の住職は、舞台の下により多くの木を植え、「飛び込まずとも観音様は願いを聞いてくださる」と説いて回ったそうです。この住職の慈悲深い行動が、今も参拝者の心を温かく包んでいます。"

${audioStyle.qualityStandards}

## 📐 最終JSON構造：
${JSON.stringify(JAPANESE_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ 最終チェックリスト
- [ ] すべてのテキストが${langConfig.name}で書かれている
- [ ] route.stepsとrealTimeGuide.chaptersの完璧な一致
- [ ] 3つのフィールドが8-9分のストーリーに自然に接続されている
- [ ] nextDirectionは移動案内のみを別途処理
- [ ] テンプレート表現ではなく自然でオリジナルなストーリーテリング
- [ ] 100%正確なJSON構文

**🔴 コア強化要約 🔴**
1. **3つのフィールドのみ接続**：nextDirectionは別途処理
2. **自然な接続**：テンプレートではなく状況に適した多様な表現
3. **オリジナルなストーリーテリング**：場所の特徴を反映した独特な描写
4. **完全な分離**：移動案内はnextDirectionでのみ

**今すぐ"${locationName}"の自然で魅力的なオーディオガイドを純粋なJSON形式で生成してください！**`;

  return prompt;
};

/**
 * Japanese final guide generation prompt (compatible with index.ts)
 */
export const createJapaneseFinalPrompt = (
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.ja;
  const audioStyle = JAPANESE_AUDIO_GUIDE_INSTRUCTIONS;
  
  // Location type analysis and specialist guide setup
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 ユーザーカスタマイズ情報：
- 興味・関心：${userProfile.interests?.join('、') || '一般'}
- 年齢層：${userProfile.ageGroup || '大人'}
- 知識レベル：${userProfile.knowledgeLevel || '中級'}
- 同行者：${userProfile.companions || '一人'}
` : '👤 一般観光客対象';

  const specialistContext = typeConfig ? `
🎯 専門分野ガイド設定：
- 検出された場所タイプ：${locationType}
- エキスパート役割：${typeConfig.expertRole}
- 重点分野：${typeConfig.focusAreas.join('、')}
- 特別要件：${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" 最終オーディオガイド生成

## 🎭 あなたの役割
${audioStyle.style}

${specialistContext}

## 📚 研究データに基づくガイド作成
以下に提供された詳細な研究データに基づいて、より正確で豊富なオーディオガイドを作成してください。

### 研究データ：
${JSON.stringify(researchData, null, 2)}

${userContext}

## 🎯 最終ガイド作成指針

### 1. **研究データの活用**
- 提供されたすべての情報を自然にストーリーテリングに織り込む
- 歴史的事実、日付、人物情報を正確に反映
- 研究で発見された興味深い逸話や隠れた物語を積極的に活用

### 2. **オーディオスクリプトの品質**
- 研究データの堅い情報を親しみやすい口語調に変換
- 専門的な内容を分かりやすく面白く解説
- 聞き手が飽きないようドラマチックな構成

### 3. **強化されたコンテンツ**
- 研究データに基づいて各チャプターをより詳細に
- 具体的な数値、日付、人物名を正確に含める
- 研究で得た洞察でストーリーテリングを強化

### 4. **最小分量（日本語基準）**
- sceneDescription: 500文字以上（研究に基づく詳細な描写）
- coreNarrative: 700文字以上（正確な歴史的事実を含む）
- humanStories: 600文字以上（研究された人物の物語）
- nextDirection: 250文字以上（具体的なルート案内）

### 5. **フィールド接続の必須ルール**
- sceneDescription終わり：質問や好奇心を誘発（「ご存知でしたか...？」）
- coreNarrative始まり：その質問の答えから始める（「実は...」）
- coreNarrative終わり：次の物語を予告（「しかし、さらに驚くべきことは...」）
- humanStories始まり：自然な受け継ぎ（「そうです、その時...」）

## 📐 最終JSON構造：
${JSON.stringify(JAPANESE_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ 品質チェックリスト
- [ ] 研究データのすべての重要情報を反映
- [ ] 歴史的事実と日付の正確性
- [ ] 自然なストーリーテリングの流れ
- [ ] オーディオとして聞いても退屈しない構成
- [ ] 各チャプター8-10分の豊富なコンテンツ
- [ ] 3つのフィールドが一つのスクリプトとして途切れなく接続

**🔴 必須遵守事項 🔴**
各チャプターは一人が10分間連続で話すものです！
sceneDescription → coreNarrative → humanStoriesが
水のように自然に繋がる必要があります。
絶対に各フィールドを独立したセクションとして書かないでください！

**研究データを完璧に活用して"${locationName}"の最高のオーディオガイドを作成してください！**`;

  return prompt;
};

/**
 * Structure generation prompt (overview + route only)
 */
export const createJapaneseStructurePrompt = (
  locationName: string,
  language: string = 'ja',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ja;
  const userContext = userProfile ? `
👤 ユーザーカスタマイズ情報：
- 興味・関心：${userProfile.interests?.join('、') || '一般'}
- 年齢層：${userProfile.ageGroup || '大人'}
` : '👤 一般観光客対象';

  // Location type analysis and recommended spot count info
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType] || LOCATION_TYPE_CONFIGS.general;
  const spotCount = getRecommendedSpotCount(locationName);

  return `# 🏗️ "${locationName}" ガイド基本構造生成

## 🎯 ミッション
"${locationName}"の**基本構造（概観+ルート）のみ**を生成してください。
リアルタイムガイドチャプターはタイトルのみ含め、詳細内容は生成しないでください。

${userContext}

## 🎯 場所分析情報
- 検出された場所タイプ：${locationType}
- 推奨スポット数：${spotCount.default}個
- 最適スポット範囲：${spotCount.min}-${spotCount.max}個
- 推奨デフォルト：${spotCount.default}個

## 📋 出力形式
純粋なJSONのみを返してください。コードブロックや説明なし、JSONのみ。

**スポット数決定ガイドライン：**
- **小規模単一建物/店舗**：3-4スポット
- **中規模観光地**：5-6スポット  
- **大規模複合施設/宮殿**：7-8スポット
- **自然公園/遊歩道**：主要ビューポイント別に4-6個
- **グルメツアーエリア**：食べ物の種類により5-8個

### 構造例（場所に合わせてスポット数調整）：
{
  "content": {
    "overview": {
      "title": "${locationName}概観",
      "summary": "簡潔な要約（200文字以内）",
      "narrativeTheme": "核心テーマ一行",
      "keyFacts": [
        { "title": "主要情報1", "description": "説明" },
        { "title": "主要情報2", "description": "説明" }
      ],
      "visitInfo": {
        "duration": "適切な所要時間",
        "difficulty": "難易度",
        "season": "最適な季節"
      }
    },
    "route": {
      "steps": [
        { "step": 1, "location": "入口", "title": "地点1タイトル" },
        { "step": 2, "location": "主要地点1", "title": "地点2タイトル" },
        { "step": 3, "location": "主要地点2", "title": "地点3タイトル" }
        // ... 場所特性に合った適切な数のスポット
      ]
    },
    "realTimeGuide": {
      "chapters": [
        { "id": 0, "title": "地点1タイトル" },
        { "id": 1, "title": "地点2タイトル" },
        { "id": 2, "title": "地点3タイトル" }
        // ... route.stepsと完全に同じ数
      ]
    }
  }
}

**重要事項**： 
- route.stepsとrealTimeGuide.chaptersのタイトルは完全に同一である必要がある
- **場所の規模と特徴を考慮して適切な数のスポットを構成**（3-8個の範囲内）
- 入口 → 主要地点 → 終了/出口の自然な動線
- チャプターにはタイトルのみ含め、詳細内容なし
- 純粋なJSONのみ返す、説明やコードブロックなし`;
};

/**
 * Chapter detail generation prompt
 */
export const createJapaneseChapterPrompt = (
  locationName: string,
  chapterIndex: number,
  chapterTitle: string,
  existingGuide: any,
  language: string = 'ja',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ja;

  return `🎙️ "${locationName}" 第${chapterIndex + 1}章："${chapterTitle}" 完全オーディオガイド生成

🎯 ミッション
プロの観光ガイドとして、"${chapterTitle}"地点で観光客に語る**完全で詳細な**オーディオガイドスクリプトを作成する必要があります。

📚 既存ガイドコンテキスト
${JSON.stringify(existingGuide, null, 2)}

🚨 **絶対重要 - 完全な内容必須**
- narrativeフィールドに**最低1600-1800文字の完全な内容**を書く（絶対に短く書かないでください！）
- 現場描写 + 歴史的背景 + 人物の物語を**一つの自然な物語**として統合
- AIが「...詳細は後ほど...」のような未完成表現を絶対に使用禁止
- **完全で豊富な実際のガイドレベルの内容**を作成してください

📝 執筆構造（一つのnarrativeとして自然に接続）
1. **現場描写**（400-500文字）：訪問者が実際に見て感じることができる生き生きとした場面
2. **歴史的背景**（600-700文字）：この場所の歴史、建築的特徴、文化的意義
3. **人物の物語**（300-400文字）：実際の歴史的人物や検証された逸話
4. **次の移動案内**（100-200文字）：具体的な経路と次の場所の予告

🎭 スタイルガイド
- 親しみやすい口語調（「ここで注目すべきは」「興味深い事実は」「物語を聞くと」など）
- 教育的でありながら面白いストーリーテリング
- まるで隣で友人が説明してくれるような親しみやすさ
- **各部分が自然に続く一つの完全な物語**

🚫 **絶対禁止事項**
- 「こんにちは」「皆さん！」「はい、皆さん！」などの挨拶語は絶対使用禁止（チャプター1から）
- 「...については後でより詳しく...」「...間もなくより詳細な内容が...」などの未完成表現禁止
- 短く適当に書くことを禁止 - **必ず1400-1500文字の豊富な内容**

✅ **推奨開始表現**
- "この場所で..." "ここで注目すべきは..." "興味深いことに..."
- "目の前に見える..." "この場所では..."
- "今私たちは..." "続いて..." "次にお会いするのは..."

✅ 必須出力形式
**重要：純粋なJSONのみ出力してください。コードブロックや説明なし！**

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "narrative": "この場所で最初に目に入るのは... [現場の生き生きとした描写を400-500文字で詳細に作成] ...しかし、なぜこの場所がこれほど特別なのでしょうか？それは[時期]に[歴史的背景と意義を600-700文字で詳細に説明] ...この歴史の中には本当に感動的な人物たちの物語があります。[実際の歴史的人物や検証された逸話を400-500文字で豊富に叙述] ...さて、こうした意味深い物語を心に刻みながら、次の地点へ移動してみましょう。[具体的な移動経路と次の場所の予告を200-300文字で]（合計1800-2000文字の完全な物語）",
    "nextDirection": "ここから[具体的な方向]に約[距離/時間]移動すると[次の場所名]が見えてきます。移動する途中で[周辺の見どころや特徴]にも注目してください。次の場所では[期待できる内容]をお楽しみいただけます。"
  }
}

🚨 絶対遵守要項 🚨
- **narrativeフィールドは必ず1400-1500文字（最低1400文字！）**
- 序文や説明なしで直接JSONを開始
- コードブロック表示絶対禁止  
- 文法的に完璧なJSON形式
- 未完成内容や「後で補完」のような表現は絶対禁止

今すぐ"${chapterTitle}"チャプターの**完全で豊富な**オーディオガイドを生成してください！`;
};