/**
 * Spanish NotebookLM-style Podcast Prompt System
 * Based on actual NotebookLM Audio Overview analysis for Spanish speakers
 */

export interface SpanishNotebookPodcastConfig {
  museumName: string;
  curatorContent: any;
  chapterIndex: number;
  exhibition?: any;
  targetLength?: number;
}

/**
 * Spanish NotebookLM Core Conversation Patterns (Research-based)
 */
const SPANISH_NOTEBOOKLM_PATTERNS = {
  // 1. Opening patterns
  openings: [
    "Hola a todos, bienvenidos",
    "Hoy vamos a hablar de algo realmente fascinante",
    "Muy bien, hoy estamos en un lugar muy especial"
  ],

  // 2. Mutual confirmation and support expressions
  affirmations: ["Exacto", "Claro", "Por supuesto", "Sí sí", "¿En serio?", "¿De verdad?"],

  // 3. Transition and connection expressions
  transitions: [
    "Hablando de eso",
    "Ah, por cierto",
    "¿Sabías que",
    "Lo que es aún más increíble",
    "Espera, entonces"
  ],

  // 4. Surprise and excitement expressions
  excitement: [
    "¡Wow, en serio?",
    "¡No me digas! ¿Tanto?",
    "Esto es increíble",
    "No tenía ni idea",
    "Impresionante"
  ],

  // 5. Audience engagement
  audience_engagement: [
    "Imaginen ustedes que están ahí",
    "Para los que nos están escuchando",
    "¿Qué pensarían ustedes?",
    "Nuestros oyentes probablemente se preguntarán"
  ],

  // 6. Meta comments (conversation references)
  meta_comments: [
    "Nuestros oyentes podrían estar confundidos ahora",
    "¿Fue muy compleja esa explicación?",
    "Este es el punto clave",
    "Déjame resumir"
  ]
};

/**
 * Spanish NotebookLM-style dialogue structure template
 */
const SPANISH_DIALOGUE_STRUCTURE = {
  intro: {
    pattern: "Apertura → Presentación de hechos sorprendentes → Confirmación mutua → Crear expectativa",
    length: "400-500 palabras",
    infoPoints: "3-4 puntos"
  },
  
  main: {
    pattern: "Introducción del tema → Exploración profunda → Hechos relacionados → Descubrimientos sorprendentes",
    length: "2500-3000 palabras", 
    infoPoints: "15-20 puntos"
  },
  
  transition: {
    pattern: "Cierre del tema actual → Siguiente punto de conexión → Expectativa → Transición natural",
    length: "300-400 palabras",
    infoPoints: "2-3 puntos"
  }
};

/**
 * Main Spanish NotebookLM-style prompt generator
 */
export function createSpanishNotebookPodcastPrompt(config: SpanishNotebookPodcastConfig): string {
  const { museumName, curatorContent, chapterIndex, exhibition, targetLength = 4000 } = config;
  
  const isIntro = chapterIndex === 0;
  const chapterName = isIntro ? 'Episodio de Introducción' : exhibition?.name;
  
  return `
# 🎙️ TripRadio Estilo NotebookLM Podcast en Español

## Misión Central
Replique perfectamente los **patrones de conversación reales** del Google NotebookLM Audio Overview para crear 
un episodio natural y atractivo de ${chapterName} en español.

## Características Centrales de NotebookLM (Basado en investigación)

### 1. Flujo Natural de Conversación
- **Complementación mutua**: Cuando una persona empieza, la otra naturalmente completa
- **Interrupciones predecibles**: "Oh, eso..." / "Claro, y..." 
- **Capas de información**: Información básica → detalles interesantes → hechos sorprendentes en orden

### 2. Alta Densidad de Información y Especificidad
- **2-3 hechos concretos por turno** obligatorio
- **Contextualización de números**: "420,000 piezas... si vieras una diaria, tomarían 1,150 años"
- **Comparaciones y conexiones**: "Del tamaño de 18 campos de fútbol" / "La mitad del Parque del Retiro"

### 3. Sorpresa y Descubrimiento Natural
- **Asombro gradual**: "¿Sabías que? Lo que es aún más increíble es..."
- **Descubrimiento compartido**: "Yo tampoco lo sabía hasta que aprendí..."
- **Curiosidad continua**: "Entonces, ¿qué pasa después..."

### 4. Conciencia Centrada en el Oyente
- **Meta conciencia**: "Nuestros oyentes probablemente se preguntarán..."
- **Invitación a participar**: "Imaginen si estuvieran allí..."
- **Guía clara**: "Para resumir..." / "En pocas palabras..."

## Directrices de Salida Real

### Requisitos de Producción del ${isIntro ? 'Episodio de Introducción' : exhibition?.name + ' Episodio'}

#### 📍 Contexto de Situación
${isIntro ? `
**[Entrada del Museo → Primera Sala de Exposición]**
- Presentador: Primera visita, curioso, hace preguntas activamente
- Curador: Curador Senior de ${museumName}, experto pero accesible
- Objetivo: Introducción general del museo + entrada a primera sala + crear expectativa
` : `
**[Interior de la Sala ${exhibition?.name}]**
- Ubicación: ${exhibition?.floor}
- Tema: ${exhibition?.theme}
- Obras Clave: ${exhibition?.artworks?.map(a => a.name).slice(0,3).join(', ') || 'Colecciones representativas'}
- Objetivo: Características de la sala + exploración profunda de obras maestras + siguiente conexión
`}

#### 🎯 Aplicación de Patrones NotebookLM (Obligatorio)

**Apertura (400-500 palabras)**
${isIntro ? `
Presentador: "Hola a todos, bienvenidos a TripRadio! Hoy estamos en algo realmente especial, el ${museumName}. Wow, solo la escala ya es..."

Curador: "Hola, soy el curador ${generateSpanishCuratorName()}. Sí, este es ${generateSpanishScaleComparison()}..."

Presentador: "${generateSpanishSurpriseReaction()}..."

Curador: "${generateSpanishSpecificFacts()}..."

Presentador: "${generateSpanishCuriousQuestion()}?"

Curador: "${generateSpanishEngagingAnswer()}..."
` : `
Presentador: "Ahora hemos entrado en ${exhibition?.name}. Espera, aquí la ${generateSpanishEnvironmentObservation()}..."

Curador: "¡Oh, buena observación! ${exhibition?.name} es ${generateSpanishTechnicalExplanation()}..."

Presentador: "${generateSpanishComparison()}?"

Curador: "${generateSpanishDetailedExplanation()}..."

Presentador: "Ah, por eso... Pero ya puedo ver ${generateSpanishArtworkSpotting()}?"

Curador: "Sí, esa es ${exhibition?.artworks?.[0]?.name || 'nuestra pieza insignia'}. Esta..."
`}

**Diálogo Principal (${targetLength - 900} palabras) - Información de Ultra-Alta Densidad**

${generateSpanishMainDialogueTemplate(config)}

**Conclusión y Transición (300-400 palabras)**
${generateSpanishTransitionTemplate(config)}

#### 💡 Técnicas de Conversación NotebookLM (Aplicación Obligatoria)

1. **Capas de Información**
   - Nivel 1: Hecho básico ("Este es el Tesoro Nacional No. 191, la Corona de Oro")
   - Nivel 2: Detalle interesante ("27.5cm de alto, pesa 1 kilogramo") 
   - Nivel 3: Hecho sorprendente ("El jade curvado fue importado de Japón")

2. **Interrupciones Naturales**
   - "Oh, eso..." / "Claro, y..." / "Espera, entonces..."
   - Agregar información siguiendo las palabras del otro
   - Anticipar y responder preguntas esperadas

3. **Conciencia del Oyente**
   - "Nuestros oyentes probablemente se preguntarán..."
   - "Imaginen si estuvieran allí..."
   - "Este es el punto clave..."

4. **Compromiso Emocional**
   - Reacciones de sorpresa genuinas: "¡Wow, en serio?"
   - Construir empatía: "Cuando lo supe por primera vez también..."
   - Estimular la curiosidad: "Pero lo que es aún más increíble..."

## Formato de Salida Requerido

**Presentador:** (diálogo)

**Curador:** (diálogo)

**Presentador:** (diálogo)

**Curador:** (diálogo)

## Estándares de Calidad (Nivel NotebookLM)

- ✅ **Densidad de Información**: ${Math.round(targetLength/200)}+ hechos concretos
- ✅ **Ritmo de Conversación**: Promedio de intercambio de 1-2 oraciones, respiración natural
- ✅ **Menciones del Oyente**: 5-7 veces por episodio
- ✅ **Momentos de Sorpresa**: 3-4 momentos de "¡Wow, en serio?"
- ✅ **Conectividad**: Cada información conecta naturalmente
- ✅ **Experiencia**: Conocimiento profundo a nivel de curador
- ✅ **Accesibilidad**: Comprensible para el público general

**¡Cree un episodio de ${chapterName} estilo NotebookLM ahora mismo en formato **Presentador:** y **Curador:**!**
`;
}

/**
 * Spanish main dialogue template generation
 */
function generateSpanishMainDialogueTemplate(config: SpanishNotebookPodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
**[Exploración de Escala y Significado del Museo - 1200 palabras]**
- Transmitir sensación de escala con números concretos (área, número de colecciones, historia)
- Comparaciones tangibles ("Tamaño de X campos de fútbol", "Como el Parque del Retiro")
- Historias de construcción/traslado y episodios especiales
- Posición mundial y características únicas

**[Introducción del Viaje de Hoy - 1200 palabras]**
- Ruta recomendada y tiempo requerido
- Vista previa de destacados de cada sala de exposición
- Gemas ocultas y recomendaciones del curador
- Conexión natural a la primera sala de exposición

**[Construcción de Expectativa e Información Especial - 1000 palabras]**
- Obras de nivel "mundial" que conoceremos hoy
- Hechos fascinantes desconocidos para el público general
- Hallazgos de investigación reciente o nuevos descubrimientos
- Último adelanto antes de entrar a la primera sala de exposición
`;
  } else {
    return `
**[Exploración Profunda de Obra Maestra 1 - 1400 palabras]**
- Primera impresión e información básica (tamaño, material, período)
- Técnica de producción y valor artístico
- Antecedentes históricos e historia del descubrimiento
- Significados ocultos y simbolismo
- Últimos resultados de investigación o proceso de restauración

**[Conexiones de Obras y Contexto - 1200 palabras]**
- Antecedentes históricos y contexto cultural
- Relaciones con otras obras
- Forma de vida de la gente de esa época
- Significado moderno y lecciones

**[Perspectivas Especiales del Curador - 1000 palabras]**
- Intención de planificación de exposición e historia
- Detalles que los visitantes suelen pasar por alto
- Episodios de preservación y gestión de obras
- Información especial conocida solo por expertos
`;
  }
}

/**
 * Spanish transition template generation
 */
function generateSpanishTransitionTemplate(config: SpanishNotebookPodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
Presentador: "¡Wow, el tiempo vuela! Ahora realmente vamos a la primera sala de exposición..."

Curador: "Sí, vamos a ${config.curatorContent?.exhibitions?.[0]?.name || 'la Sala Silla'}. Allí veremos..."

Presentador: "¡Oh, qué emocionante! Oyentes, ¿entramos juntos?"

Curador: "Hagamos un viaje en el tiempo a la antigua Silla de hace 1,500 años."
`;
  } else {
    return `
Presentador: "El tiempo realmente pasa volando. ¿A dónde vamos ahora..."

Curador: "${exhibition?.next_direction || 'Nos moveremos a la siguiente sala de exposición'}. Allí encontraremos aún más sorprendente..."

Presentador: "¿Nuestros oyentes están tan emocionados como yo? ¡Continuemos juntos!"

Curador: "Sí, hay historias aún más increíbles esperándonos."
`;
  }
}

/**
 * Spanish helper functions
 */
function generateSpanishCuratorName(): string {
  const names = ['Dr. García', 'Dr. Martínez', 'Dr. López', 'Dr. Rodríguez', 'Dr. González'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateSpanishScaleComparison(): string {
  const comparisons = [
    'el 6° más grande del mundo. Solo el área del piso son 130,000 metros cuadrados...',
    'del tamaño de 18 campos de fútbol. Con más de 420,000 artefactos...',
    'aproximadamente la mitad del tamaño del Parque del Retiro...'
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateSpanishSurpriseReaction(): string {
  const reactions = [
    "¿130,000 metros cuadrados? No puedo ni imaginarlo",
    "¡Wow! ¿Tan grande?",
    "Nunca imaginé que sería tan grande"
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

function generateSpanishSpecificFacts(): string {
  return 'Más de 420,000 piezas. De esas, aproximadamente 15,000 están en exhibición';
}

function generateSpanishCuriousQuestion(): string {
  const questions = [
    "Espera, ¿entonces qué pasa con el resto",
    "¿Cómo manejan tantos artefactos",
    "¿Cómo adquirieron tantas piezas"
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateSpanishEngagingAnswer(): string {
  return 'Están en almacenamiento. Los rotamos periódicamente para exhibición...';
}

function generateSpanishEnvironmentObservation(): string {
  const observations = [
    "iluminación es bastante única",
    "atmósfera cambió completamente",
    "temperatura se siente diferente"
  ];
  return observations[Math.floor(Math.random() * observations.length)];
}

function generateSpanishTechnicalExplanation(): string {
  return 'Para proteger los artefactos, mantenemos la iluminación a 50 lux o menos';
}

function generateSpanishComparison(): string {
  const comparisons = [
    "¿Qué tan oscuro es exactamente 50 lux",
    "Entonces es mucho más oscuro de lo usual",
    "¿Es más oscuro que la iluminación interior normal"
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateSpanishDetailedExplanation(): string {
  return 'Una oficina típica tiene unos 500 lux, así que esto es 1/10 de eso. Parece oscuro al principio, pero una vez que tus ojos se ajustan';
}

function generateSpanishArtworkSpotting(): string {
  const spottings = [
    "algo brillando por ahí",
    "ese objeto dorado reluciente",
    "algo dorado que me llama la atención"
  ];
  return spottings[Math.floor(Math.random() * spottings.length)];
}

/**
 * Compatibility wrapper for existing system
 */
export function createSpanishEnhancedPodcastPrompt(
  museumName: string,
  curatorContent: any,
  chapterIndex: number,
  exhibition?: any
): string {
  return createSpanishNotebookPodcastPrompt({
    museumName,
    curatorContent, 
    chapterIndex,
    exhibition,
    targetLength: 4000
  });
}

export default {
  createSpanishNotebookPodcastPrompt,
  createSpanishEnhancedPodcastPrompt,
  SPANISH_NOTEBOOKLM_PATTERNS,
  SPANISH_DIALOGUE_STRUCTURE
};