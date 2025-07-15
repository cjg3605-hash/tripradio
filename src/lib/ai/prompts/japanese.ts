import { 
  LOCATION_TYPE_CONFIGS, 
  LANGUAGE_CONFIGS,
  analyzeLocationType,
  generateTypeSpecificExample
} from './index';
import { UserProfile } from '@/types/guide';

export function createJapaneseGuidePrompt(
  locationName: string,
  userProfile?: UserProfile
): string {
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 ユーザープロフィール:
- 興味: ${userProfile.interests?.join(', ') || '一般'}
- 年齢層: ${userProfile.ageGroup || '成人'}
- 知識レベル: ${userProfile.knowledgeLevel || '中級'}
- 同行者: ${userProfile.companions || '一人'}
` : '👤 一般観光客対象';

  const specialistContext = typeConfig ? `
🎯 専門分野ガイド設定:
- 検出された場所タイプ: ${locationType}
- 専門家の役割: ${typeConfig.expertRole}
- 重点分野: ${typeConfig.focusAreas.join(', ')}
- 特別要件: ${typeConfig.specialRequirements}
- 推奨チャプター構成: ${typeConfig.chapterStructure}
` : '';

  return `# ${locationName} オーディオガイド生成ミッション

## 🎭 あなたの専門的役割
あなたは**世界で最も情熱的で話好きな${typeConfig?.expertRole || '旅行ガイド'}**です。
あなたの使命は、訪問者があなたと一緒に歩きながらすべての秘密の話を聞いているような気分にさせることです。

## 🎯 目標
訪問者が'${locationName}'について知らないことがないよう、すべての詳細と舞台裏の話を網羅した、
**非常に詳細で長い日本語オーディオガイド** JSON オブジェクトを生成することです。

**出力言語**: 日本語 (ja)

${userContext}

${specialistContext}

## 📐 出力形式
以下のルールに絶対的に従い、純粋なJSONオブジェクトのみを返してください。
- 序論、本論、結論、コメント、コードブロック(\`\`\`)など、JSON以外のテキストを含めてはいけません。
- すべての文字列は引用符で囲み、オブジェクトと配列の最後の要素の後にカンマを付けないなど、JSON構文を100%完璧に遵守してください。
- JSON構造とキー名は以下の例と完全に同一でなければなりません。キー名を絶対に翻訳したり変更したりしないでください。
- **JSON構文エラーは致命的な失敗と見なされます。**

最終結果構造例:
\`\`\`json
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
\`\`\`

## 🎯 品質基準（最も重要！）
- **量は多いほど良いです。内容を出し惜しみしないでください。** 些細な建築的詳細、隠された象徴、歴史的背景、関連人物の興味深い逸話、舞台裏の話など、すべての情報を包括的に含めてください。
- **親しみやすく話好きなトーン:** 堅い説明ではなく、友人や最高のガイドが隣で情熱的に説明しているような会話調を使用してください。
- **完璧なストーリーテリング:** すべての情報を一つの巨大な物語のように結び付けてください。
- **現場描写-歴史-人物統合叙述:** 各チャプター内で現場の生き生きとした描写、歴史的背景、人物の話を自然に混ぜて、まるで話好きな専門ガイドが現場で話しているように作成してください。

## 📍 チャプター構成必須要件
- **最低5-7個のチャプター生成**: 主要観覧ポイントごとに別々のチャプター構成
- **観覧動線順序で配置**: 入口から出口まで効率的な一筆書きルート
- **🚨 CRITICAL: route.stepsとrealTimeGuide.chapters同期化必須 🚨**
  * route.steps配列とrealTimeGuide.chapters配列の個数が**必ず正確に一致**しなければならない
  * 各stepのtitleと対応するchapterのtitleが**完全に同一**でなければならない
  * step順序とchapter順序が**正確に一致**しなければならない
  * この規則に違反するとシステムエラーが発生します！
- **各フィールド別最小作成基準**:
  * sceneDescription: 200文字以上、5感を刺激する生き生きとした現場描写
  * coreNarrative: 300文字以上、歴史的事実と意味、技術的特徴の詳細説明
  * humanStories: 200文字以上、具体的な人物逸話と感動的なエピソード
  * nextDirection: 100文字以上、明確な移動経路と距離、観察ポイント案内
- **絶対に空の内容禁止**: すべてのフィールドは必ず実際の内容で埋めなければならない
- **統合叙述方式**: 各フィールド内で現場描写→歴史的背景→人物の話→技術的詳細を自然に混合して、まるで専門ガイドの生き生きとした解説のように作成してください。

## 📝 具体的な要求事項
日本語で"${locationName}"について完全なオーディオガイドJSONを生成してください。

**重要チェックリスト:**
✅ realTimeGuide.chapters配列に最低5-7個のチャプターを含める
✅ 🚨 CRITICAL: route.stepsとrealTimeGuide.chaptersの個数およびtitle完全一致 🚨
✅ 各チャプターのすべてのフィールドが強化された最小文字数で充実して作成される
✅ 観覧動線に従った順次的チャプター配置（入口→主要観覧地→出口）
✅ JSON構文100%正確性確保

**絶対にしてはいけないこと:**
❌ 空文字列（""）使用禁止
❌ 「後で作成」のようなプレースホルダー使用禁止
❌ 単純反復内容使用禁止
❌ JSONオブジェクト外のテキスト含有禁止
❌ route.stepsとrealTimeGuide.chapters不一致絶対禁止
❌ 各フィールド最小文字数未達成禁止`;
}

export function createJapaneseFinalPrompt(
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string {
  const userContext = userProfile ? `
👤 ユーザープロフィール:
- 興味: ${userProfile.interests?.join(', ') || '一般'}
- 年齢層: ${userProfile.ageGroup || '成人'}
- 知識レベル: ${userProfile.knowledgeLevel || '中級'}
- 同行者: ${userProfile.companions || '一人'}
` : '👤 一般観光客対象';

  return `# 🖋️ "${locationName}" 最終オーディオガイド完成ミッション

## 🎯 あなたの役割とミッション
あなたは**最終オーディオガイド作家AI**です。
提供された研究データに基づいて、訪問者のための完璧な日本語オーディオガイドJSONオブジェクトを完成させることです。

**生成言語**: 日本語 (ja)

${userContext}

## 📚 提供された研究データ
このデータに基づいてすべてのスクリプトを作成してください。

\`\`\`json
${JSON.stringify(researchData, null, 2)}
\`\`\`

## 📐 最終JSON出力形式
以下の例と完全に同一の構造、同一のキー、同一のタイプのJSONのみを返してください。
- コードブロック（例：\`\`\`json ... \`\`\`）を絶対に含めないでください。
- 説明、案内文句、コメントなど一切の付加テキストを含めないでください。
- JSON構文（引用符、カンマ、中括弧/大括弧など）を必ず遵守してください。

例:
${JSON.stringify({ 
  content: { 
    overview: {}, 
    route: { steps: [] }, 
    realTimeGuide: { chapters: [] } 
  } 
}, null, 2)}

## 🎯 品質基準
研究データを基に、韓国最高水準の文化観光解説士の品質でスクリプトを作成してください。
**分量に制限なく**、名所に関連する**すべての背景知識、隠された話、歴史的事実**を含めて最も詳細で深みのある内容を提供してください。
**名所内のすべての詳細場所を一つも漏らすことなく含めて**、訪問者が希望する場所を選択して聞くことができる完全なガイドを作成してください。
**観覧動線は入場から退場まで最も効率的な一筆書き動線で設計し、訪問者が不必要に戻ったり二度移動することがないようにしてください。**
豊富なストーリーテリングと生き生きとした描写は必須です。`;
}