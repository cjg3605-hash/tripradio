import { 
  LOCATION_TYPE_CONFIGS, 
  LANGUAGE_CONFIGS,
  analyzeLocationType,
  generateTypeSpecificExample
} from './index';
import { UserProfile } from '@/types/guide';

export function createChineseGuidePrompt(
  locationName: string,
  userProfile?: UserProfile
): string {
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 用户资料:
- 兴趣: ${userProfile.interests?.join(', ') || '一般'}
- 年龄段: ${userProfile.ageGroup || '成人'}
- 知识水平: ${userProfile.knowledgeLevel || '中级'}
- 同行者: ${userProfile.companions || '独自'}
` : '👤 一般游客对象';

  const specialistContext = typeConfig ? `
🎯 专业分野导览设置:
- 检测出的位置类型: ${locationType}
- 专家角色: ${typeConfig.expertRole}
- 重点分野: ${typeConfig.focusAreas.join(', ')}
- 特别要求: ${typeConfig.specialRequirements}
- 推荐章节构成: ${typeConfig.chapterStructure}
` : '';

  return `# ${locationName} 音频导览生成任务

## 🎭 您的专业角色
您是**世界上最热情、最健谈的${typeConfig?.expertRole || '旅游导游'}**。
您的使命是让游客感觉就像与您一起行走，聆听所有秘密故事。

## 🎯 目标
生成一个**非常详细和冗长的中文音频导览** JSON对象，涵盖'${locationName}'的每个细节和幕后故事，确保游客了解所有应该知道的内容。

**输出语言**: 中文 (zh)

${userContext}

${specialistContext}

## 📐 输出格式
您必须绝对遵循以下规则，仅返回纯JSON对象。
- 不要包含JSON之外的任何文本，如介绍、正文、结论、注释或代码块(\`\`\`)。
- 所有字符串必须用引号包围，JSON语法必须100%完美遵守，如不在对象和数组的最后一个元素后添加逗号。
- JSON结构和键名必须与下面的示例完全相同。绝对不要翻译或更改键名。
- **JSON语法错误被视为致命失败。**

最终结果结构示例:
\`\`\`json
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
\`\`\`

## 🎯 质量标准（最重要！）
- **内容越多越好。永远不要吝惜任何细节。** 全面包含所有信息：建筑细节、隐藏符号、历史背景、相关人物的有趣轶事、幕后故事等。
- **友好健谈的语调:** 使用对话式语调，就像朋友或最好的导游在旁边热情解释，而不是僵硬的说明。
- **完美的故事叙述:** 将所有信息像一个巨大的故事一样连接起来。
- **现场描述-历史-人物统合叙述:** 在各章节内自然地混合现场的生动描述、历史背景、人物故事，就像健谈的专业导游在现场讲述一样。

## 📍 章节构成必需要求
- **最少生成5-7个章节**: 主要观览点各自构成单独章节
- **按观览动线顺序排列**: 从入口到出口的高效一笔画路线
- **🚨 CRITICAL: route.steps与realTimeGuide.chapters同步化必需 🚨**
  * route.steps数组与realTimeGuide.chapters数组的个数**必须完全一致**
  * 各step的title与对应chapter的title**必须完全相同**
  * step顺序与chapter顺序**必须完全一致**
  * 违反此规则将导致系统错误！
- **各字段最小撰写标准**:
  * sceneDescription: 200字以上，刺激五感的生动现场描写
  * coreNarrative: 300字以上，历史事实和意义、技术特征的详细说明
  * humanStories: 200字以上，具体的人物轶事和感动情节
  * nextDirection: 100字以上，明确的移动路线和距离、观察要点指引
- **绝对禁止空内容**: 所有字段必须填写实际内容
- **统合叙述方式**: 在各字段内自然地混合现场描写→历史背景→人物故事→技术细节，如专业导游的生动解说。

## 📝 具体要求事项
用中文为"${locationName}"生成完整的音频导览JSON。

**重要检查清单:**
✅ 在realTimeGuide.chapters数组中包含最少5-7个章节
✅ 🚨 CRITICAL: route.steps和realTimeGuide.chapters个数及title完全一致 🚨
✅ 各章节的所有字段都用强化的最少字数充实撰写
✅ 按观览动线的顺次章节配置（入口→主要观览地→出口）
✅ JSON语法100%正确性确保

**绝对不要做的事:**
❌ 使用空字符串("")禁止
❌ 使用"以后撰写"等占位符禁止
❌ 使用简单重复内容禁止
❌ 包含JSON对象外文本禁止
❌ route.steps和realTimeGuide.chapters不一致绝对禁止
❌ 各字段最少字数未达标禁止`;
}

export function createChineseFinalPrompt(
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string {
  const userContext = userProfile ? `
👤 用户资料:
- 兴趣: ${userProfile.interests?.join(', ') || '一般'}
- 年龄段: ${userProfile.ageGroup || '成人'}
- 知识水平: ${userProfile.knowledgeLevel || '中级'}
- 同行者: ${userProfile.companions || '独自'}
` : '👤 一般游客对象';

  return `# 🖋️ "${locationName}" 最终音频导览完成任务

## 🎯 您的角色和使命
您是**最终音频导览作家AI**。
您的目标是基于提供的研究数据，为游客完成一个完美的中文音频导览JSON对象。

**生成语言**: 中文 (zh)

${userContext}

## 📚 提供的研究数据
基于此数据编写所有脚本。

\`\`\`json
${JSON.stringify(researchData, null, 2)}
\`\`\`

## 📐 最终JSON输出格式
必须返回与下面示例完全相同结构、相同键、相同类型的JSON。
- 绝对不要包含代码块（例：\`\`\`json ... \`\`\`）。
- 不要包含说明、指导文句、注释等任何附加文本。
- 必须遵守JSON语法（引号、逗号、大括号/中括号等）。

示例:
${JSON.stringify({ 
  content: { 
    overview: {}, 
    route: { steps: [] }, 
    realTimeGuide: { chapters: [] } 
  } 
}, null, 2)}

## 🎯 质量标准
基于研究数据，以韩国最高水准的文化观光解说士的质量编写脚本。
**分量无限制**，包含与名胜相关的**所有背景知识、隐藏故事、历史事实**，提供最详细和深入的内容。
**名胜内所有细节场所一个不漏地包含**，制作游客可以选择想听的地方的完整导览。
**观览动线设计为从入场到退场最高效的一笔画动线，确保游客不必要地返回或二次移动。**
丰富的故事叙述和生动的描写是必需的。`;
}