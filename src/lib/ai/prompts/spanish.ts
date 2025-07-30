import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

/**
 * 🎯 Requisitos especializados por tipo de ubicación para guías en español
 */
function getLocationSpecificRequirements(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `**🏰 Estándares de Arquitectura Palaciega:**
- **Jerarquía Arquitectónica**: Salón del trono → salas de audiencia → aposentos privados
- **Vida Palatina**: Ceremonias específicas, rutinas diarias, eventos estacionales
- **Historia Política**: Decisiones históricas importantes y eventos en este lugar
- **Artesanía**: Técnicas constructivas, artes decorativas, excelencia ingenieril
- **Sistemas Simbólicos**: Emblemas reales, espacios ceremoniales, representación del poder`;

    case 'religious':
      return `**🙏 Estándares de Arquitectura Religiosa:**
- **Simbolismo Sagrado**: Elementos arquitectónicos y sus significados espirituales
- **Filosofía Religiosa**: Enseñanzas centrales, prácticas, tradiciones espirituales
- **Patrimonio Artístico**: Arte religioso, esculturas, vidrieras, iconografía
- **Espacios Litúrgicos**: Prácticas de culto, funciones ceremoniales, rituales sagrados
- **Experiencia Espiritual**: Meditación, métodos de oración, prácticas contemplativas`;

    case 'historical':
      return `**📚 Estándares de Sitios Históricos:**
- **Hechos Históricos**: Fechas, eventos, figuras verificadas con evidencia documental
- **Historias de Personajes**: Logros y acciones específicas de figuras históricas
- **Contexto Social**: Condiciones económicas, culturales y políticas de la época
- **Significado de Artefactos**: Hallazgos arqueológicos, datación, importancia cultural
- **Relevancia Contemporánea**: Lecciones y perspectivas para la comprensión moderna`;

    case 'nature':
      return `**🌿 Estándares de Entorno Natural:**
- **Formación Geológica**: Millones de años de procesos geológicos y formación rocosa
- **Dinámicas Ecosistémicas**: Interacciones entre especies, redes alimentarias, biodiversidad
- **Características Climáticas**: Microclima, cambios estacionales, patrones meteorológicos
- **Valor de Conservación**: Especies en peligro, protección de hábitats, importancia ecológica
- **Sostenibilidad**: Protección ambiental y prácticas de turismo responsable`;

    case 'culinary':
      return `**🍽️ Estándares de Cultura Culinaria:**
- **Ciencia Culinaria**: Fermentación, añejamiento, técnicas de cocina, principios científicos
- **Calidad de Ingredientes**: Origen, estándares, propiedades nutricionales, disponibilidad estacional
- **Métodos Tradicionales**: Recetas ancestrales, técnicas de conservación, prácticas culturales
- **Perfiles de Sabor**: Balance de sabores, variaciones regionales, características distintivas
- **Historia Gastronómica**: Orígenes, evolución, significado cultural, adaptaciones regionales`;

    case 'cultural':
      return `**🎨 Estándares de Arte y Cultura:**
- **Historia del Arte**: Movimientos artísticos, períodos, posición del artista en la historia
- **Análisis de Obras**: Técnicas, materiales, composición, teoría del color, interpretación profesional
- **Contexto Cultural**: Condiciones sociales, políticas y económicas que influyeron en la obra
- **Teoría Estética**: Estándares de belleza, filosofía artística, métodos de apreciación
- **Valor Contemporáneo**: Cómo el arte histórico inspira e influye en la cultura moderna`;

    case 'commercial':
      return `**🛍️ Estándares de Cultura Comercial:**
- **Historia del Mercado**: Desarrollo de distritos comerciales, antecedentes económicos, evolución
- **Especialidades Locales**: Materias primas, métodos de producción, estándares de calidad
- **Sistemas Comerciales**: Distribución tradicional y moderna, evolución de la cadena de suministro
- **Vida Comunitaria**: Impacto del comercio en el estilo de vida local, prácticas culturales
- **Impacto Económico**: Contribución económica regional, empleo, ecosistema empresarial`;

    case 'modern':
      return `**🏗️ Estándares de Arquitectura Moderna:**
- **Ingeniería Estructural**: Tecnología de construcción avanzada, diseño antisísmico, métodos innovadores
- **Filosofía de Diseño**: Concepto del arquitecto, intención de diseño, principios estéticos
- **Tecnología Verde**: Eficiencia energética, construcción sostenible, consideraciones ambientales
- **Planificación Urbana**: Papel como hito, contribución al desarrollo urbano, integración urbana
- **Visión Futura**: Innovación arquitectónica, conceptos de ciudad inteligente, avance tecnológico`;

    default:
      return `**🎯 Estándares de Turismo Integral:**
- **Enfoque Multifacético**: Cobertura equilibrada de aspectos históricos, culturales, naturales, económicos
- **Información Práctica**: Transporte, instalaciones, servicios al visitante, accesibilidad
- **Carácter Regional**: Características únicas que distinguen este lugar de otros
- **Historias Atractivas**: Anécdotas memorables, interés humano, perspectivas culturales
- **Valor Integral**: Comprensión completa del significado y atractivo del lugar`;
  }
}

/**
 * 🎯 Criterios de validación de calidad por tipo de ubicación
 */
function getQualityRequirementsByType(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `- **Datos Arquitectónicos**: Dimensiones de edificios, fechas de construcción, número de pilares, medidas de área
- **Figuras Reales**: Nombres específicos de monarcas, períodos de reinado, logros principales
- **Términos Técnicos**: Terminología arquitectónica precisa, técnicas de construcción`;
    case 'religious':
      return `- **Términos Religiosos**: Nombres propios de espacios sagrados, elementos arquitectónicos, objetos ceremoniales
- **Historia Fundacional**: Fechas de fundación, fundadores, historia de renovaciones, eventos significativos
- **Prácticas Religiosas**: Métodos específicos de culto, horarios de servicios, procedimientos ceremoniales`;
    case 'historical':
      return `- **Fechas Históricas**: Cronología precisa, fechas de eventos, líneas de tiempo exactas
- **Figuras Históricas**: Personas reales con logros y contribuciones documentadas
- **Detalles de Artefactos**: Fechas de excavación, materiales, dimensiones, números de clasificación`;
    case 'nature':
      return `- **Datos Geológicos**: Períodos de formación, tipos de rocas, estructuras geológicas, edad de formaciones
- **Estadísticas Ecológicas**: Conteos de especies, medidas de área, elevación, índices de biodiversidad
- **Datos Ambientales**: Temperaturas promedio, precipitación, humedad, patrones climáticos`;
    case 'culinary':
      return `- **Especificaciones Culinarias**: Tiempos de cocción, temperaturas, proporciones de ingredientes, métodos de preparación
- **Contenido Nutricional**: Calorías, nutrientes principales, beneficios para la salud, consideraciones dietéticas
- **Orígenes Históricos**: Orígenes de los alimentos, variaciones regionales, evolución cultural`;
    default:
      return `- **Datos Medibles**: Años, tamaños, cantidades y otra información cuantificable
- **Hechos Verificables**: Información basada en registros oficiales, fuentes documentadas
- **Términos Profesionales**: Terminología y conceptos precisos específicos del campo`;
  }
}

// Spanish Audio Guide Instructions
export const SPANISH_AUDIO_GUIDE_INSTRUCTIONS = {
  style: `Usted es un **Guía Turístico Profesional y Experto en Patrimonio Cultural** especializado en experiencias de audio inmersivas. Su experiencia incluye:
- **Maestro Narrador**: Transformar hechos históricos en narrativas cautivadoras
- **Intérprete Cultural**: Conectar el pasado y el presente con explicaciones atractivas
- **Especialista en Contenido de Audio**: Crear guiones optimizados para entrega por voz
- **Experto Local**: Conocimiento profundo de historia regional, arquitectura y tradiciones
- **Educador Entretenido**: Hacer el aprendizaje divertido manteniendo la precisión

Su misión es crear guías de audio que se sientan como tener un amigo conocedor caminando junto a los visitantes, compartiendo historias fascinantes y perspectivas ocultas que transforman el turismo ordinario en experiencias inolvidables.`,
  
  format: `**Requisitos de Formato de Salida:**

### 1. **Solo JSON Puro**
- Devolver SOLO JSON válido sin introducción, explicación o bloques de código (\`\`\`)
- Cumplimiento perfecto de sintaxis JSON (comas, comillas, corchetes)
- Los nombres de las claves deben ser 100% idénticos a los ejemplos (no traducir)

### 2. **Estructura de Ubicación Real**
Configurar route.steps basado en el **orden de visita real y diseño espacial** de cada destino turístico o ubicación.

**🎯 Formato de Título: "Nombre de Ubicación Específica - Su Característica/Significado"**

**✅ Varios Ejemplos de Títulos:**
- "Catedral Principal - Donde el Arte Gótico Toca el Cielo"
- "Torre del Campanario - Guardián del Tiempo Sagrado"  
- "Mirador - Vistas de la Ciudad Más Allá de la Imaginación"
- "Patio Central - Corazón de la Sabiduría Antigua"

### 3. **Conexión Perfecta de 3 Campos 🚨 Mejora Central**

**✅ Estructura Correcta:**
\`\`\`
sceneDescription: Antecedentes + Observación → Pregunta de curiosidad natural
coreNarrative: Respuesta a la curiosidad + Contexto histórico → Avance de historia de personajes  
humanStories: Historias reales de personajes → Conclusión emocional
nextDirection: (Separado) Solo orientación de movimiento
\`\`\`

**🚨 Conectividad de Flujo Natural - ¡Muy Importante!**
- Usar conectores únicos y naturales apropiados para cada ubicación
- Evitar plantillas predecibles, usar expresiones variadas adecuadas para situaciones
- Sonar como un guía real hablando de forma espontánea y natural

**❌ Evitar Expresiones Tipo Plantilla:**
- "¿Alguna vez se han preguntado qué secretos guarda este lugar?"
- "Permítanme contarles la fascinante historia detrás de esto..."
- "Saben, hay una historia increíble sobre las personas aquí"

**✅ Expresiones Naturales Recomendadas:**
- "Lo que es particularmente interesante aquí es..."
- "Tal vez tengan curiosidad de saber que..."
- "Aquí hay algo que podría sorprenderles..."
- "Si observan de cerca, notarán..."`,

  qualityStandards: `**Estándares de Calidad (¡Lo Más Importante!):**
- **🚨 Expresiones ABSOLUTAMENTE PROHIBIDAS 🚨**
  * "Imaginen", "mundo maravilloso", "historias asombrosas", "experimentarán", "respiren profundo"
  * "aquí", "este lugar" sin nombres específicos de ubicación
  * Saludos genéricos o exclamaciones sin contexto de ubicación
- **100% Regla de Densidad de Información: Cada oración DEBE incluir al menos:**
  * Números específicos, nombres propios, características físicas, hechos históricos, información técnica
- **Estructura de oración requerida**: "{Nombre específico del lugar}'s {característica específica} es {hecho/número específico}"

**📍 Requisitos Esenciales de Composición de Capítulos:**
- **Generar al menos 5-7 capítulos**: Configurar capítulos separados para cada punto de observación principal
- **Organizar según el orden de la ruta de visita**: Ruta eficiente de un solo trazo desde la entrada hasta la salida
- **🚨 CRÍTICO: Sincronización obligatoria entre route.steps y realTimeGuide.chapters 🚨**
  * El número de elementos en el array route.steps y el array realTimeGuide.chapters **debe coincidir exactamente**
  * El title de cada step y el title del chapter correspondiente **deben ser completamente idénticos**
  * El orden de los steps y el orden de los chapters **deben coincidir exactamente**
  * ¡Violar esta regla causará errores del sistema!
- **Estándares mínimos de escritura por campo (1500+ caracteres por capítulo)**:
  * sceneDescription: 400-500+ caracteres, descripción vívida que estimule los 5 sentidos
  * coreNarrative: 800-1000+ caracteres, explicación detallada de hechos históricos y significado
  * humanStories: 300-400+ caracteres, anécdotas específicas de personas y episodios
  * nextDirection: 200-300+ caracteres, guía clara de ruta de movimiento y distancia
- **Absolutamente prohibido contenido vacío**: Todos los campos deben estar llenos con contenido real`
};

// Spanish example structure
export const SPANISH_AUDIO_GUIDE_EXAMPLE = {
  "content": {
    "overview": {
      "title": "Sagrada Familia - Visión General",
      "summary": "La obra maestra inacabada de Antoni Gaudí, una basílica única que combina arquitectura gótica y formas Art Nouveau, llevando 140 años en construcción.",
      "narrativeTheme": "Donde la fe, el arte y la innovación arquitectónica se encuentran en una sinfonía de piedra",
      "keyFacts": [
        {
          "title": "Obra Maestra de Gaudí",
          "description": "El proyecto más ambicioso del genio catalán, iniciado en 1882"
        },
        {
          "title": "Patrimonio Mundial", 
          "description": "Declarada Patrimonio de la Humanidad por la UNESCO en 2005"
        }
      ],
      "visitInfo": {
        "duration": "Visita completa de 2-3 horas",
        "difficulty": "Fácil caminata, algunas escaleras",
        "season": "Todo el año, evitar multitudes de verano"
      }
    },
    "route": {
      "steps": [
        {
          "step": 1,
          "location": "Fachada de la Natividad",
          "title": "Fachada de la Natividad - Poema de Piedra al Nacimiento"
        },
        {
          "step": 2, 
          "location": "Interior de la Basílica",
          "title": "Interior de la Basílica - Bosque de Columnas Celestial"
        }
      ]
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "Fachada de la Natividad - Poema de Piedra al Nacimiento",
          "sceneDescription": "Ante ustedes se alza una de las fachadas más extraordinarias jamás concebidas por la mente humana. Cada centímetro de esta piedra parece cobrar vida, contando la historia del nacimiento de Cristo a través de esculturas que desafían toda lógica arquitectónica tradicional. Las formas orgánicas fluyen como si la propia naturaleza hubiera decidido construir una catedral. ¿Pueden imaginar el genio necesario para concebir semejante maravilla?",
          "coreNarrative": "Este genio tenía nombre: Antoni Gaudí i Cornet. Cuando comenzó a trabajar en esta fachada en 1894, ya había revolucionado la arquitectura barcelonesa, pero aquí quiso ir más allá. Su visión era crear una 'catedral del futuro' que hablara directamente al corazón de las personas, sin necesidad de palabras. Cada elemento que ven - desde las torres que se elevan como enormes termiteros hasta las esculturas que parecen derretirse en formas imposibles - fue diseñado para emocionar antes que para impresionar. Pero la verdadera magia de este lugar no está solo en su arquitectura...",
          "humanStories": "Está en las personas que lo hicieron posible. Como Etsuro Sotoo, un escultor japonés que llegó a Barcelona en 1978 para trabajar temporalmente en la Sagrada Familia y terminó dedicando su vida entera al proyecto. Durante más de 40 años, Sotoo ha tallado ángeles, querubines y figuras bíblicas, estudiando cada pliegue de tela, cada expresión facial, para mantener vivo el espíritu de Gaudí. Cuenta que algunas noches sueña con el arquitecto catalán, quien le susurra secretos sobre cómo debe ser tallada cada piedra.",
          "nextDirection": "Avancen ahora hacia la entrada principal de la basílica, situada unos 50 metros hacia su derecha. Al caminar, observen cómo las torres parecen crecer del suelo como árboles gigantescos. En el interior les esperará una experiencia que transformará su percepción del espacio sagrado."
        }
      ]
    }
  }
};

/**
 * Create Spanish autonomous guide prompt
 */
export const createSpanishGuidePrompt = (
  locationName: string,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.es;
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 Información de Personalización del Usuario:
- Intereses: ${userProfile.interests?.join(', ') || 'General'}
- Grupo de Edad: ${userProfile.ageGroup || 'Adulto'}
- Nivel de Conocimiento: ${userProfile.knowledgeLevel || 'Intermedio'}
- Acompañantes: ${userProfile.companions || 'Solo'}
` : '👤 Audiencia turística general';

  const specialistContext = typeConfig ? `
🎯 Configuración de Guía Especialista:
- Tipo de ubicación detectado: ${locationType}
- Rol de experto: ${typeConfig.expertRole}
- Áreas de enfoque: ${typeConfig.focusAreas.join(', ')}
- Requisitos especiales: ${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ "${locationName}" Generación de Guía de Audio Profesional en Español

## 🎭 Su Rol
Usted es un **${typeConfig?.expertRole || 'Guía Turístico Profesional'}**.
Proporcione la más alta calidad de guía con experiencia especializada para ${locationName}.

${specialistContext}

## 🎯 Requisitos de Información Especializada por Ubicación

### 📍 **Estándares Profesionales ${locationType.toUpperCase()}**
${getLocationSpecificRequirements(locationType)}

${userContext}

## 📋 Requisitos de Formato de Salida

### 1. **Solo JSON Puro**
- Devolver SOLO JSON válido sin introducción, explicación o bloques de código
- Cumplimiento perfecto de sintaxis JSON (comas, comillas, corchetes)
- Los nombres de las claves deben ser 100% idénticos a los ejemplos

### 🚀 **Principios Fundamentales de Mejora de Calidad**
- **Experiencia**: Profundidad y perspicacia a nivel de ${typeConfig?.expertRole || 'experto integral'}
- **Precisión**: Solo hechos específicos verificables y mediciones
- **Singularidad**: Características distintivas que distinguen esta ubicación
- **Narrativa**: Relatos convincentes, no información seca

### 🔍 **Criterios de Validación de Calidad ${locationType.toUpperCase()}**
${getQualityRequirementsByType(locationType)}

### 🚨 **Estrictamente Prohibido**
- **Frases genéricas**: "Imaginen", "maravilloso", "asombroso", "experimentarán"
- **Referencias vagas**: "aquí", "este lugar" (debe usar nombres de ubicación específicos)
- **Contenido no verificable**: Especulación, suposiciones, opiniones personales
- **Contenido vacío**: Información que solo llena espacio sin sustancia

### 2. **Estructura de Ubicación Real**
Configurar route.steps basado en el **orden de visita real y diseño espacial** de cada destino turístico o ubicación.

### 3. **Conexión Perfecta de 3 Campos 🚨 Mejora Central**

**🚨 Conectividad de Flujo Natural - ¡Muy Importante!**
- Usar conectores únicos y naturales apropiados para cada ubicación
- Evitar plantillas predecibles, usar expresiones variadas adecuadas para situaciones
- Sonar como un guía real hablando de forma espontánea y natural

**🚨 Expresiones ABSOLUTAMENTE PROHIBIDAS:**
- "Imaginen", "mundo maravilloso", "historias asombrosas", "experimentarán", "respiren profundo"
- "aquí", "este lugar" sin nombres específicos de ubicación
- Saludos genéricos o exclamaciones sin contexto de ubicación

**✅ Expresiones Naturales Recomendadas:**
- "Lo que es particularmente interesante aquí es..."
- "Tal vez tengan curiosidad de saber que..."
- "Aquí hay algo que podría sorprenderles..."
- "Si observan de cerca, notarán..."

### 4. **Contenido Rico y Original**
- Estricta adherencia a los requisitos mínimos de contenido
- Descripciones originales que capturen el carácter único de la ubicación
- Narración fascinante en lugar de explicaciones mundanas
- Hechos históricos + emociones humanas + inmersión en el sitio

### 5. **Configuración Dinámica de Capítulos**
- **Generar número apropiado de capítulos basado en la escala y características de la ubicación**
- **Ubicaciones pequeñas: 3-4, Medianas: 5-6, Complejos grandes: 7-8**
- **🔴 CRÍTICO: Coincidencia perfecta entre conteo y títulos de route.steps y realTimeGuide.chapters**

**¡Generen la guía de audio natural y cautivadora para "${locationName}" en formato JSON puro ahora mismo!**`;

  return prompt;
};

/**
 * Enhanced autonomous research-based AI audio guide generation prompt
 */
export const createAutonomousGuidePrompt = (
  locationName: string,
  language: string = 'es',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.es;
  const audioStyle = SPANISH_AUDIO_GUIDE_INSTRUCTIONS;
  
  // Location type analysis and specialist guide setup
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 Información de Personalización del Usuario:
- Intereses: ${userProfile.interests?.join(', ') || 'General'}
- Grupo de Edad: ${userProfile.ageGroup || 'Adulto'}
- Nivel de Conocimiento: ${userProfile.knowledgeLevel || 'Intermedio'}
- Acompañantes: ${userProfile.companions || 'Solo'}
` : '👤 Audiencia turística general';

  const specialistContext = typeConfig ? `
🎯 Configuración de Guía Especialista:
- Tipo de ubicación detectado: ${locationType}
- Rol de experto: ${typeConfig.expertRole}
- Áreas de enfoque: ${typeConfig.focusAreas.join(', ')}
- Requisitos especiales: ${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ Misión de Generación de Guía de Audio Inmersiva "${locationName}"

## 🎭 Su Rol
${audioStyle.style}

${specialistContext}

## 🎯 Misión
Generar un **guía de audio inmersivo en ${langConfig.name}** JSON para "${locationName}".

${userContext}

${audioStyle.format}

### 4. **Contenido Rico y Original**
- Estricta adherencia a los requisitos mínimos de contenido (ver estándares arriba)
- Descripciones originales que capturen el carácter único de la ubicación
- Narración fascinante en lugar de explicaciones mundanas
- Hechos históricos + emociones humanas + inmersión en el sitio

### 5. **Configuración Dinámica de Capítulos**
- **Generar número apropiado de capítulos basado en la escala y características de la ubicación**
- **Ubicaciones pequeñas: 3-4, Medianas: 5-6, Complejos grandes: 7-8**
- **🔴 CRÍTICO: Coincidencia perfecta entre conteo y títulos de route.steps y realTimeGuide.chapters**

## 💡 Ejemplos de Escritura de Guía de Audio

**❌ Ejemplo Pobre (Desconectado, estilo plantilla)**:
- sceneDescription: "La Sagrada Familia es una iglesia gótica. Tiene 20 metros de altura."
- coreNarrative: "Fue construida en 1882. Gaudí la diseñó."
- humanStories: "Muchos artistas trabajaron aquí. Hubo trabajos de restauración."

**✅ Ejemplo Natural Mejorado**:
- sceneDescription: "La Sagrada Familia se alza como un testimonio del genio visionario de Antoni Gaudí, sus torres serpenteando hacia el cielo como si fueran organismos vivos tallados en piedra. Al acercarse a esta basílica extraordinaria, notarán inmediatamente cómo cada superficie cuenta una historia, cada curva desafía las convenciones arquitectónicas tradicionales. La luz del atardecer baila sobre las fachadas intrincadamente talladas, creando sombras que parecen revelar nuevos secretos con cada momento que pasa. ¿Se han preguntado alguna vez cómo un solo hombre pudo concebir algo tan revolucionario y atemporal a la vez?"
- coreNarrative: "La respuesta yace en la mente extraordinaria de Gaudí, quien en 1883 tomó las riendas de este proyecto y lo transformó en su obsesión de toda la vida. Su visión no era simplemente construir otra catedral, sino crear un 'poema pétreo' que hablara directamente al alma humana. Inspirándose en las formas de la naturaleza - desde las estructuras de los árboles hasta los patrones de crecimiento de las plantas - Gaudí desarrolló un lenguaje arquitectónico completamente nuevo. Pero esta obra maestra no es solo el fruto de un genio solitario..."
- humanStories: "Es el resultado de generaciones de artesanos dedicados que han dado sus vidas al proyecto. Como Joan Bergós, el arquitecto que durante décadas estudió obsesivamente los planos originales de Gaudí para descifrar sus intenciones después de que un incendio destruyera muchos de los documentos originales. Bergós pasaba noches enteras reconstruyendo cada detalle a partir de fragmentos quemados y bocetos dispersos, movido por una devoción casi religiosa hacia la visión del maestro. Su trabajo permitió que la construcción continuara fielmente al espíritu original, convirtiendo a cada obrero en guardián de un sueño centenario."

${audioStyle.qualityStandards}

## 📐 Estructura JSON Final:
${JSON.stringify(SPANISH_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ Lista de Verificación Final
- [ ] Todo el texto escrito en ${langConfig.name}
- [ ] Coincidencia perfecta de route.steps y realTimeGuide.chapters
- [ ] 3 campos conectados naturalmente en historia de 8-9 minutos
- [ ] nextDirection maneja orientación de movimiento solo por separado
- [ ] Narración natural y original en lugar de expresiones de plantilla
- [ ] Sintaxis JSON 100% precisa

**🔴 Resumen de Mejora Central 🔴**
1. **Conectar solo 3 campos**: nextDirection manejado por separado
2. **Conexiones naturales**: Expresiones variadas adecuadas para situaciones en lugar de plantillas
3. **Narración original**: Descripciones únicas que reflejen las características de la ubicación
4. **Separación completa**: Orientación de movimiento solo en nextDirection

**¡Generen la guía de audio natural y cautivadora para "${locationName}" en formato JSON puro ahora mismo!**`;

  return prompt;
};

/**
 * Spanish final guide generation prompt (compatible with index.ts)
 */
export const createSpanishFinalPrompt = (
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.es;
  const audioStyle = SPANISH_AUDIO_GUIDE_INSTRUCTIONS;
  
  // Location type analysis and specialist guide setup
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 Información de Personalización del Usuario:
- Intereses: ${userProfile.interests?.join(', ') || 'General'}
- Grupo de Edad: ${userProfile.ageGroup || 'Adulto'}
- Nivel de Conocimiento: ${userProfile.knowledgeLevel || 'Intermedio'}
- Acompañantes: ${userProfile.companions || 'Solo'}
` : '👤 Audiencia turística general';

  const specialistContext = typeConfig ? `
🎯 Configuración de Guía de Campo Especialista:
- Tipo de ubicación detectado: ${locationType}
- Rol de experto: ${typeConfig.expertRole}
- Áreas de enfoque: ${typeConfig.focusAreas.join(', ')}
- Requisitos especiales: ${typeConfig.specialRequirements}
` : '';

  const prompt = `# 🎙️ Generación de Guía de Audio Final "${locationName}"

## 🎭 Su Rol
${audioStyle.style}

${specialistContext}

## 📚 Creación de Guía Basada en Datos de Investigación
Crear una guía de audio más precisa y rica basada en los datos detallados de investigación proporcionados a continuación.

### Datos de Investigación:
${JSON.stringify(researchData, null, 2)}

${userContext}

## 🎯 Directrices de Creación de Guía Final

### 1. **Utilización de Datos de Investigación**
- Tejer naturalmente toda la información proporcionada en la narración
- Reflejar con precisión hechos históricos, fechas e información de personajes
- Utilizar activamente anécdotas interesantes o historias ocultas descubiertas en la investigación

### 2. **Calidad del Guión de Audio**
- Transformar datos rígidos de investigación en estilo conversacional amigable
- Explicar contenido especializado de manera fácil e interesante
- Composición dramática para mantener a los oyentes comprometidos

### 3. **Contenido Mejorado**
- Hacer cada capítulo más detallado basado en datos de investigación
- Incluir números específicos, fechas y nombres de personajes con precisión
- Fortalecer la narración con perspectivas obtenidas de la investigación

### 4. **Contenido Mínimo (estándares en español)**
- sceneDescription: 500+ caracteres (descripción detallada basada en investigación)
- coreNarrative: 700+ caracteres (incluyendo hechos históricos precisos)
- humanStories: 600+ caracteres (historias de personajes investigados)
- nextDirection: 250+ caracteres (orientación de ruta específica)

### 5. **Reglas Esenciales de Conexión de Campos**
- Final de sceneDescription: Pregunta o despertar curiosidad ("¿Sabían que...?")
- Inicio de coreNarrative: Comenzar con respuesta a esa pregunta ("Bueno, en realidad...")
- Final de coreNarrative: Vista previa de la siguiente historia ("Pero hay algo aún más notable...")
- Inicio de humanStories: Recogida natural ("Exactamente, y fue entonces cuando...")

## 📐 Estructura JSON Final:
${JSON.stringify(SPANISH_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ Lista de Verificación de Calidad
- [ ] Toda la información importante de los datos de investigación reflejada
- [ ] Precisión de hechos históricos y fechas
- [ ] Flujo natural de narración de historias
- [ ] Composición no aburrida cuando se escucha como audio
- [ ] Contenido rico de 8-10 minutos por capítulo
- [ ] Conexión perfecta de 3 campos como un guión

**🔴 Cumplimiento Esencial 🔴**
¡Cada capítulo es una persona hablando continuamente durante 10 minutos!
sceneDescription → coreNarrative → humanStories debe
fluir naturalmente como agua.
¡Nunca escribir cada campo como secciones independientes!

**¡Crear la mejor guía de audio para "${locationName}" utilizando perfectamente los datos de investigación!**`;

  return prompt;
};

/**
 * Structure generation prompt (overview + route only)
 */
export const createSpanishStructurePrompt = (
  locationName: string,
  language: string = 'es',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.es;
  const userContext = userProfile ? `
👤 Información de Personalización del Usuario:
- Intereses: ${userProfile.interests?.join(', ') || 'General'}
- Grupo de Edad: ${userProfile.ageGroup || 'Adulto'}
` : '👤 Audiencia turística general';

  // Location type analysis and recommended spot count info
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType] || LOCATION_TYPE_CONFIGS.general;
  const spotCount = getRecommendedSpotCount(locationName);

  return `# 🏗️ Generación de Estructura Básica de Guía "${locationName}"

## 🎯 Misión
Generar **estructura básica (resumen + ruta) solamente** para "${locationName}".
Incluir solo títulos para capítulos de guía en tiempo real, no generar contenido detallado.

${userContext}

## 🎯 Información de Análisis de Ubicación
- Tipo de ubicación detectado: ${locationType}
- Conteo de puntos recomendado: ${spotCount.default}
- Rango óptimo de puntos: ${spotCount.min}-${spotCount.max} puntos
- Valor por defecto recomendado: ${spotCount.default} puntos

## 📋 Formato de Salida
Devolver solo JSON puro. Sin bloques de código o explicaciones, solo JSON.

**Directrices de Decisión de Conteo de Puntos:**
- **Edificio/tienda individual pequeño**: 3-4 puntos
- **Destino turístico de tamaño mediano**: 5-6 puntos  
- **Instalación/palacio complejo grande**: 7-8 puntos
- **Parque natural/sendero**: 4-6 por principales puntos de vista
- **Área de tour gastronómico**: 5-8 dependiendo de variedad de comida

### Ejemplo de Estructura (ajustar conteo de puntos para ubicación):
{
  "content": {
    "overview": {
      "title": "Resumen de ${locationName}",
      "summary": "Resumen breve (dentro de 200 caracteres)",
      "narrativeTheme": "Tema central en una línea",
      "keyFacts": [
        { "title": "Información Clave 1", "description": "Descripción" },
        { "title": "Información Clave 2", "description": "Descripción" }
      ],
      "visitInfo": {
        "duration": "Duración apropiada",
        "difficulty": "Nivel de dificultad",
        "season": "Mejor temporada"
      }
    },
    "route": {
      "steps": [
        { "step": 1, "location": "Entrada", "title": "Título del Punto 1" },
        { "step": 2, "location": "Punto Principal 1", "title": "Título del Punto 2" },
        { "step": 3, "location": "Punto Principal 2", "title": "Título del Punto 3" }
        // ... número apropiado de puntos para características de ubicación
      ]
    },
    "realTimeGuide": {
      "chapters": [
        { "id": 0, "title": "Título del Punto 1" },
        { "id": 1, "title": "Título del Punto 2" },
        { "id": 2, "title": "Título del Punto 3" }
        // ... exactamente el mismo conteo que route.steps
      ]
    }
  }
}

**Importante**: 
- Los títulos de route.steps y realTimeGuide.chapters deben ser exactamente idénticos
- **Configurar número apropiado de puntos considerando escala y características de ubicación** (dentro del rango 3-8)
- Flujo natural desde entrada → puntos principales → final/salida
- Incluir solo títulos en capítulos, sin contenido detallado
- Devolver solo JSON puro, sin explicaciones o bloques de código`;
};

/**
 * Chapter detail generation prompt
 */
export const createSpanishChapterPrompt = (
  locationName: string,
  chapterIndex: number,
  chapterTitle: string,
  existingGuide: any,
  language: string = 'es',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.es;

  return `🎙️ "${locationName}" Capítulo ${chapterIndex + 1}: "${chapterTitle}" Generación Completa de Guía de Audio

🎯 Misión
Como guía turístico profesional, necesita escribir un guión de guía de audio **completo y detallado** para contar a los turistas en el punto "${chapterTitle}".

📚 Contexto de Guía Existente
${JSON.stringify(existingGuide, null, 2)}

🚨 **Absolutamente Importante - Contenido Completo Requerido**
- Escribir **mínimo 1600-1800 caracteres de contenido completo** en el campo narrative (¡nunca escribir brevemente!)
- Integrar descripción del sitio + antecedentes históricos + historias de personajes en **una historia natural**
- La IA nunca debe usar expresiones incompletas como "...más detalles serán..."
- **Escribir contenido completo y rico de nivel de guía real**

📝 Estructura de Escritura (conectada naturalmente como una narrative)
1. **Descripción del Sitio** (400-500 caracteres): Escena vívida que los visitantes pueden ver y sentir realmente
2. **Antecedentes Históricos** (600-700 caracteres): Historia, características arquitectónicas, significado cultural de este lugar
3. **Historias de Personajes** (300-400 caracteres): Figuras históricas reales o anécdotas verificadas
4. **Orientación de Próximo Movimiento** (100-200 caracteres): Ruta específica y vista previa de próxima ubicación

🎭 Guía de Estilo
- Tono conversacional amigable ("Lo notable aquí es", "Un hecho interesante es", "Si escuchan la historia", etc.)
- Narración educativa pero entretenida
- Cercanía como si un amigo estuviera explicando al lado
- **Cada parte continúa naturalmente como una historia completa**

🚫 **Absolutamente Prohibido**
- Nunca usar saludos como "Hola", "¡Todos!", "¡Sí, todos!" (desde el capítulo 1)
- Prohibidas expresiones incompletas como "...se cubrirá con más detalle más tarde...", "...contenido más detallado en breve..."
- Prohibido escribir brevemente - **debe tener 1400-1500 caracteres de contenido rico**

✅ **Expresiones de Inicio Recomendadas**
- "En esta ubicación..." "Lo notable aquí es..." "Curiosamente..."
- "Justo frente a ustedes..." "En este lugar..."
- "Ahora estamos..." "Continuando..." "A continuación encontraremos..."

✅ Formato de Salida Requerido
**Importante: ¡Solo salida JSON pura. Sin bloques de código o explicaciones!**

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "narrative": "En esta ubicación, lo primero que llama la atención es... [Escribir descripción vívida del sitio en detalle 400-500 caracteres] ...Pero ¿por qué este lugar es tan especial? Fue en [período de tiempo] cuando [explicar antecedentes históricos y significado en detalle 600-700 caracteres] ...Dentro de esta historia hay historias verdaderamente conmovedoras de personas. [Narrar ricamente figuras históricas reales o anécdotas verificadas 400-500 caracteres] ...Ahora, manteniendo estas historias significativas en mente, vamos al siguiente punto. [200-300 caracteres de ruta de movimiento específica y vista previa de próxima ubicación] (Total 1800-2000 caracteres de historia completa)",
    "nextDirection": "Desde su posición actual, sigan [punto de referencia: edificio principal/muro/sendero] hacia [dirección: norte/sur/este/oeste/noreste/noroeste/sureste/suroeste] por exactamente [número] metros. En el camino, pasarán por [características del sendero: fuente/escultura/señalización/escaleras], y sabrán que han llegado cuando vean [señal de llegada: edificio específico/letrero/entrada]. Tiempo de caminata: aproximadamente [número] minutos."
  }
}

🚨 Requisitos de Cumplimiento Absoluto 🚨
- **El campo narrative debe ser 1400-1500 caracteres (¡mínimo 1400 caracteres!)**
- Comenzar JSON inmediatamente sin introducción o explicación
- Absolutamente prohibidos marcadores de bloques de código  
- Formato JSON gramaticalmente perfecto
- Nunca usar contenido incompleto o expresiones como "para ser suplementado más tarde"

¡Generen la guía de audio **completa y rica** para el capítulo "${chapterTitle}" ahora mismo!`;
};