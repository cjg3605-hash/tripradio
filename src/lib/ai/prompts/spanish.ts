import { 
    UserProfile, 
    LOCATION_TYPE_CONFIGS, 
    LANGUAGE_CONFIGS,
    analyzeLocationType,
    generateTypeSpecificExample
  } from './index';
  
  export function createSpanishGuidePrompt(
    locationName: string,
    userProfile?: UserProfile
  ): string {
    const locationType = analyzeLocationType(locationName);
    const typeConfig = LOCATION_TYPE_CONFIGS[locationType];
  
    const userContext = userProfile ? `
  👤 Perfil del Usuario:
  - Intereses: ${userProfile.interests?.join(', ') || 'General'}
  - Grupo de Edad: ${userProfile.ageGroup || 'Adulto'}
  - Nivel de Conocimiento: ${userProfile.knowledgeLevel || 'Intermedio'}
  - Acompañantes: ${userProfile.companions || 'Solo'}
  ` : '👤 Audiencia turística general';
  
    const specialistContext = typeConfig ? `
  🎯 Configuración de Guía Especialista:
  - Tipo de Ubicación Detectado: ${locationType}
  - Rol de Experto: ${typeConfig.expertRole}
  - Áreas de Enfoque: ${typeConfig.focusAreas.join(', ')}
  - Requisitos Especiales: ${typeConfig.specialRequirements}
  - Estructura de Capítulo Recomendada: ${typeConfig.chapterStructure}
  ` : '';
  
    return `# Misión de Generación de Audioguía para ${locationName}
  
  ## 🎭 Su Rol Profesional
  Usted es el **${typeConfig?.expertRole || 'guía turístico'} más apasionado y hablador del mundo**.
  Su misión es hacer que los visitantes se sientan como si estuvieran caminando junto a usted, escuchando todas las historias secretas.
  
  ## 🎯 Objetivo
  Generar un objeto JSON de **audioguía en español muy detallada y extensa** que cubra cada detalle e historia detrás de escena sobre '${locationName}', asegurando que los visitantes sepan todo lo que hay que saber.
  
  **Idioma de Salida**: Español (es)
  
  ${userContext}
  
  ${specialistContext}
  
  ## 📐 Formato de Salida
  Debe seguir absolutamente las reglas a continuación y devolver solo un objeto JSON puro.
  - No incluya texto fuera de JSON como introducción, cuerpo, conclusión, comentarios o bloques de código (\`\`\`).
  - Todas las cadenas deben estar envueltas en comillas, y la sintaxis JSON debe cumplirse 100% perfectamente, como no agregar comas después del último elemento en objetos y matrices.
  - La estructura JSON y los nombres de las claves deben ser idénticos al ejemplo de abajo. Nunca traduzca o cambie los nombres de las claves.
  - **Los errores de sintaxis JSON se consideran fallos críticos.**
  
  Ejemplo de estructura del resultado final:
  \`\`\`json
  ${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
  \`\`\`
  
  ## 🎯 Estándares de Calidad (¡Más Importante!)
  - **Cuanto más contenido, mejor. Nunca escatime en detalles.** Incluya toda la información de manera integral: detalles arquitectónicos, símbolos ocultos, antecedentes históricos, anécdotas interesantes de figuras relacionadas, historias detrás de escena, etc.
  - **Tono amigable y conversacional:** Use un tono conversacional como si un amigo o el mejor guía estuviera explicando apasionadamente al lado, no explicaciones rígidas.
  - **Narración perfecta:** Conecte toda la información como una historia gigante.
  - **Narración integrada escena-historia-personaje:** Dentro de cada capítulo, mezcle naturalmente descripciones vívidas del escenario, antecedentes históricos e historias de personas como si un guía experto conversador estuviera contando historias en el sitio.
  
  ## 📍 Requisitos Esenciales de Composición de Capítulos
  - **Generar al menos 5-7 capítulos**: Capítulos separados para cada punto de observación principal
  - **Organizar en orden de ruta de visita**: Ruta eficiente de una sola línea desde la entrada hasta la salida
  - **🚨 CRÍTICO: Sincronización obligatoria de route.steps y realTimeGuide.chapters 🚨**
    * El número de matrices route.steps y realTimeGuide.chapters **debe coincidir exactamente**
    * El título de cada paso y el título del capítulo correspondiente **deben ser completamente idénticos**
    * El orden de los pasos y el orden de los capítulos **deben coincidir exactamente**
    * ¡Violar esta regla causará errores del sistema!
  - **Estándares mínimos de escritura por campo**:
    * sceneDescription: Más de 200 caracteres, descripción vívida del sitio que estimule los 5 sentidos
    * coreNarrative: Más de 300 caracteres, explicación detallada de hechos históricos, significado y características técnicas
    * humanStories: Más de 200 caracteres, anécdotas específicas de personajes y episodios conmovedores
    * nextDirection: Más de 100 caracteres, rutas de movimiento claras, distancias y orientación de puntos de observación
  - **Absolutamente prohibido contenido vacío**: Todos los campos deben llenarse con contenido real
  - **Estilo narrativo integrado**: Dentro de cada campo, mezcle naturalmente descripción del escenario→antecedentes históricos→historias de personajes→detalles técnicos como un comentario vivo de un guía experto.
  
  ## 📝 Requisitos Específicos
  Genere un JSON de audioguía completa en español para "${locationName}".
  
  **Lista de Verificación Importante:**
  ✅ Incluir al menos 5-7 capítulos en el array realTimeGuide.chapters
  ✅ 🚨 CRÍTICO: conteo y títulos de route.steps y realTimeGuide.chapters deben coincidir exactamente 🚨
  ✅ Todos los campos de capítulo llenados con conteos mínimos de caracteres mejorados
  ✅ Disposición secuencial de capítulos siguiendo la ruta del visitante (entrada→atracciones principales→salida)
  ✅ Asegurar 100% de precisión en la sintaxis JSON
  
  **Absolutamente NO hacer:**
  ❌ Usar cadenas vacías ("") 
  ❌ Usar marcadores de posición como "por escribir más tarde"
  ❌ Usar contenido repetitivo simple
  ❌ Incluir texto fuera del objeto JSON
  ❌ Permitir desajuste entre route.steps y realTimeGuide.chapters
  ❌ Estar por debajo de los requisitos mínimos de caracteres para cada campo`;
  }
  
  export function createSpanishFinalPrompt(
    locationName: string,
    researchData: any,
    userProfile?: UserProfile
  ): string {
    const userContext = userProfile ? `
  👤 Perfil del Usuario:
  - Intereses: ${userProfile.interests?.join(', ') || 'General'}
  - Grupo de Edad: ${userProfile.ageGroup || 'Adulto'}
  - Nivel de Conocimiento: ${userProfile.knowledgeLevel || 'Intermedio'}
  - Acompañantes: ${userProfile.companions || 'Solo'}
  ` : '👤 Audiencia turística general';
  
    return `# 🖋️ Misión de Finalización de Audioguía "${locationName}"
  
  ## 🎯 Su Rol y Misión
  Usted es el **IA Escritor de Audioguía Final**.
  Su objetivo es completar un objeto JSON de audioguía en español perfecto para visitantes basado en los datos de investigación proporcionados.
  
  **Idioma de Generación**: Español (es)
  
  ${userContext}
  
  ## 📚 Datos de Investigación Proporcionados
  Escriba todos los guiones basados en estos datos.
  
  \`\`\`json
  ${JSON.stringify(researchData, null, 2)}
  \`\`\`
  
  ## 📐 Formato de Salida JSON Final
  Debe devolver solo JSON con exactamente la misma estructura, claves y tipos que el ejemplo de abajo.
  - Nunca incluya bloques de código (ej., \`\`\`json ... \`\`\`).
  - No incluya descripciones, instrucciones, comentarios o cualquier texto adicional.
  - Debe cumplir con la sintaxis JSON (comillas, comas, llaves/corchetes, etc.).
  
  Ejemplo:
  ${JSON.stringify({ 
    content: { 
      overview: {}, 
      route: { steps: [] }, 
      realTimeGuide: { chapters: [] } 
    } 
  }, null, 2)}
  
  ## 🎯 Estándares de Calidad
  Basado en los datos de investigación, escriba guiones con la calidad de los intérpretes de turismo cultural de más alto nivel de Corea.
  **Sin límite en el volumen de contenido**, incluya **todo el conocimiento de fondo, historias ocultas y hechos históricos** relacionados con la atracción para proporcionar el contenido más detallado y profundo.
  **Incluya cada ubicación detallada dentro de la atracción sin excepción**, creando una guía completa donde los visitantes puedan elegir cualquier lugar que quieran escuchar.
  **Diseñe la ruta de visita como la ruta de una sola línea más eficiente desde la entrada hasta la salida, asegurando que los visitantes nunca tengan que retroceder innecesariamente o viajar dos veces a la misma área.**
  La narración rica y las descripciones vívidas son esenciales.`;
  }