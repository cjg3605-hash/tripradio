import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

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
- **内容は多いほど良い。詳細を決して惜しまない。** 細かい建築の詳細、隠されたシンボル、歴史的背景、関連人物の興味深い逸話、舞台裏の物語など、包括的な情報を含める。
- **親しみやすく会話的なトーン：** 堅苦しい説明ではなく、友人や最高のガイドが横で情熱的に説明しているようなスタイル。
- **完璧な物語：** すべての情報を一つの巨大な物語として繋げる。

**📍 章構成の必須要件：**
- **最低5-7章を生成**：各主要観察ポイントに対して個別の章を設定
- **見学ルート順に組織化**：入口から出口まで効率的な一筆書きルート
- **🚨 重要：route.stepsとrealTimeGuide.chaptersの強制同期 🚨**
  * route.steps配列とrealTimeGuide.chapters配列の要素数が**完全に一致する必要がある**
  * 各stepのtitleと対応するchapterのtitleが**完全に同一である必要がある**
  * stepsの順序とchaptersの順序が**完全に一致する必要がある**
  * この規則に違反するとシステムエラーが発生します！
- **フィールドごとの最小執筆基準**：
  * sceneDescription: 200文字以上、五感を刺激する生き生きとした描写
  * coreNarrative: 300文字以上、歴史的事実と意義の詳細な説明
  * humanStories: 200文字以上、具体的な人物の逸話とエピソード
  * nextDirection: 100文字以上、明確なルート案内と距離
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
  return createAutonomousGuidePrompt(locationName, 'ja', userProfile);
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