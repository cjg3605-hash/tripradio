/**
 * Sistema de Prompts para Podcasts en Español
 * Generación de conversaciones optimizada estilo NotebookLM para audiencias hispanohablantes
 * Sistema integrado que combina patrones exitosos existentes con características culturales hispanas
 */

import { PERSONAS, type PodcastPersona } from '@/lib/ai/personas/podcast-personas';
import type { PodcastPromptConfig } from './index';

// ===============================
// 🔧 Sistema de Patrones de Conversación NotebookLM Español
// ===============================

/**
 * Patrones centrales de conversación del análisis real de NotebookLM Audio Overview para hispanohablantes
 */
const SPANISH_NOTEBOOKLM_PATTERNS = {
  // 1. Patrones de apertura - Inicios de conversación naturales
  openings: [
    "¡Hola a todos! Bienvenidos de nuevo a TripRadio",
    "Hoy vamos a explorar algo realmente fascinante",
    "Muy bien, vamos a sumergirnos en algo increíble",
    "¡Qué tal! Estamos aquí en este lugar impresionante",
    "Bienvenidos a TripRadio. Hoy estamos en algo verdaderamente especial"
  ],

  // 2. Expresiones de confirmación mutua y apoyo - Núcleo de NotebookLM
  affirmations: [
    "Exacto", "Claro", "Así es", "Sí",
    "¡Increíble!", "¿En serio?", "¿De verdad?", "¡No puede ser!", "¡Impresionante!"
  ],

  // 3. Expresiones de transición y conexión - Movimiento natural de temas
  transitions: [
    "Hablando de eso",
    "Ah, por cierto",
    "Pero ¿sabías que",
    "Lo que es aún más increíble",
    "Espera, entonces",
    "La verdad es que",
    "Y otra cosa fascinante"
  ],

  // 4. Expresiones de sorpresa y emoción - Compromiso emocional
  excitement: [
    "¡Increíble! ¿En serio?",
    "¡No me digas! ¿Tanto?",
    "¡Qué maravilla!",
    "No tenía ni idea",
    "¡Impresionante!",
    "¿En serio?",
    "¡Eso es absolutamente fascinante!"
  ],

  // 5. Participación de la audiencia - Característica de NotebookLM
  audience_engagement: [
    "Imagínense ustedes si estuvieran ahí",
    "Para los que nos están escuchando",
    "¿Qué pensarían ustedes?",
    "Nuestros oyentes probablemente se preguntarán",
    "Exploremos esto juntos",
    "Visualicen esto, queridos oyentes"
  ],

  // 6. Comentarios meta - Autoconciencia de la conversación
  meta_comments: [
    "Nuestros oyentes podrían estar confundidos ahora mismo",
    "¿Fue muy compleja esa explicación?",
    "Este es el punto clave aquí",
    "Déjame desglosar esto",
    "En pocas palabras",
    "Para ser más específicos"
  ]
};

/**
 * Plantillas de densidad de información y estructura
 */
const SPANISH_DIALOGUE_STRUCTURE = {
  // Densidad de información: 2-3 hechos concretos por turno
  // Ritmo de conversación: Promedio de intercambios de 1-2 oraciones
  // Interrupciones y completaciones naturales
  intro: {
    pattern: "Apertura → Presentación de hechos sorprendentes → Confirmación mutua → Creación de expectativa",
    length: "400-500 palabras",
    infoPoints: "3-4 puntos"
  },
  
  main: {
    pattern: "Introducción del tema → Exploración profunda → Hechos conectados → Descubrimientos sorprendentes", 
    length: "2500-3000 palabras",
    infoPoints: "18-22 puntos"
  },
  
  transition: {
    pattern: "Conclusión del tema actual → Siguiente punto de conexión → Expectativa → Movimiento natural",
    length: "300-400 palabras",
    infoPoints: "2-3 puntos"
  }
};

// ===============================
// 🔧 Sistema de Integración de Personas
// ===============================

/**
 * Aplicar características de persona al contenido real del prompt
 */
function applySpanishPersonaCharacteristics(persona: PodcastPersona, content: string): string {
  const { characteristics, responses } = persona;
  
  if (persona.role === 'host') {
    // Presentador: Tono curioso y amigable
    const hostPatterns = [
      ...responses.surprise,
      ...responses.curiosity,
      ...characteristics.speakingStyle.slice(0, 3)
    ];
    return `Características del presentador aplicadas: ${hostPatterns.slice(0, 2).join(', ')} usado en ${content}`;
  } else {
    // Curador: Comentario experto pero accesible
    const curatorPatterns = [
      ...responses.explanation, 
      ...characteristics.expertise.slice(0, 2),
      ...characteristics.conversationPatterns.slice(0, 2)
    ];
    return `Características del curador aplicadas: ${curatorPatterns.slice(0, 2).join(', ')} usado en ${content}`;
  }
}

// ===============================
// 🔧 Funciones Principales de Generación de Prompts
// ===============================

/**
 * Generación de prompts de podcast en español por capítulos (compatible con API existente)
 */
export function createSpanishPodcastPrompt(config: PodcastPromptConfig): string {
  const { locationName, chapter, locationContext, personaDetails, locationAnalysis, language } = config;
  
  const hostPersona = PERSONAS.HOST; // Usar persona base y adaptarla al español
  const curatorPersona = PERSONAS.CURATOR;
  const targetLength = chapter.targetDuration * 10; // 10 palabras por segundo para español
  
  return `
## Misión Central
Replicar perfectamente los **patrones de conversación reales** de Google NotebookLM Audio Overview para crear 
un episodio natural y cautivador de ${locationName} - ${chapter.title} en español.

## Información del Capítulo
- **Título**: ${chapter.title}
- **Descripción**: ${chapter.description}  
- **Duración Objetivo**: ${chapter.targetDuration} segundos (aproximadamente ${Math.round(chapter.targetDuration/60)} minutos)
- **Segmentos Esperados**: ${chapter.estimatedSegments} segmentos
- **Contenido Principal**: ${chapter.contentFocus.join(', ')}

## Personas Expertas Activadas
${personaDetails.map(p => 
  `### ${p.name}\n${p.description}\nExperiencia: ${p.expertise.join(', ')}`
).join('\n\n')}

## Características Centrales de NotebookLM (Basado en Investigación)

### 1. Flujo Natural de Conversación
- **Completación mutua**: Cuando una persona empieza, la otra completa naturalmente
- **Interrupciones predecibles**: "Ah, eso es..." / "Exacto, y..." 
- **Capas de información**: Información básica → detalles interesantes → hechos sorprendentes en secuencia

### 2. Alta Densidad de Información y Especificidad
- **2-3 hechos concretos por turno** obligatorio
- **Contextualización de números**: "420,000 piezas... si vieras una diariamente, tomarían 1,150 años"
- **Comparaciones y conexiones**: "Del tamaño de 18 campos de fútbol" / "Como la mitad del Parque del Retiro"

### 3. Sorpresa Natural y Descubrimiento  
- **Asombro gradual**: "¿Pero sabías que? Lo que es aún más increíble es..."
- **Descubrimiento compartido**: "No tenía ni idea hasta que aprendí esto..."
- **Curiosidad continua**: "Entonces, ¿qué pasa después..."

### 4. Conciencia Centrada en el Oyente
- **Conciencia meta**: "Nuestros oyentes probablemente se preguntarán..."
- **Invitación a participar**: "Imaginen si estuvieran ahí..."
- **Guía clara**: "Para resumir..." / "En pocas palabras..."

## 📍 Configuración de Conversación Basada en Personas

### Presentador (${hostPersona.name}) Características
${applySpanishPersonaCharacteristics(hostPersona, 'papel curioso y de preguntas activas')}
- **Estilo de Habla**: ${hostPersona.characteristics.speakingStyle.join(', ')} (adaptado al español)
- **Patrones de Respuesta**: ${SPANISH_NOTEBOOKLM_PATTERNS.excitement.slice(0, 3).join(', ')}
- **Estilo de Preguntas**: Preguntas curiosas y entusiastas típicas del español

### Curador (${curatorPersona.name}) Características  
${applySpanishPersonaCharacteristics(curatorPersona, 'papel de narrador experto pero amigable')}
- **Estilo de Explicación**: ${curatorPersona.characteristics.speakingStyle.join(', ')} (adaptado al español)
- **Expresión de Experiencia**: ${SPANISH_NOTEBOOKLM_PATTERNS.affirmations.slice(0, 3).join(', ')}
- **Patrones de Conexión**: ${SPANISH_NOTEBOOKLM_PATTERNS.transitions.slice(0, 2).join(', ')}

## 🎯 Aplicación de Patrones NotebookLM (Obligatorio)

**Estructura de Apertura (400-500 palabras)**
Presentador: "${SPANISH_NOTEBOOKLM_PATTERNS.openings[0]} Estamos aquí en ${locationName}, y wow, solo la escala ya es..."

Curador: "Hola, soy ${personaDetails.find(p => p.expertise.includes('curador') || p.name.includes('curador'))?.name || 'Dr. González'}. Sí, ${locationName} es verdaderamente notable..."

**Estructura de Diálogo Principal (${targetLength - 900} palabras) - Información de Ultra-Alta Densidad**

${generateSpanishMainDialogueTemplate(chapter, locationAnalysis)}

**Conclusión y Transición (300-400 palabras)**  
${generateSpanishTransitionTemplate(chapter)}

## 💡 Técnicas de Conversación NotebookLM (Aplicación Obligatoria)

1. **Capas de Información**
   - Nivel 1: Hecho básico ("Esta es la pieza más representativa de ${locationName}...")
   - Nivel 2: Detalle interesante ("Mide 27.5cm de alto, pesa 1 kilogramo") 
   - Nivel 3: Hecho sorprendente ("En realidad fue creada con técnicas de hace 1,500 años...")

2. **Interrupciones Naturales**
   - ${SPANISH_NOTEBOOKLM_PATTERNS.transitions.slice(0, 3).join(' / ')}
   - Construir sobre las palabras de la otra persona para añadir información
   - Anticipar y responder preguntas esperadas

3. **Conciencia del Oyente**
   - ${SPANISH_NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 3).join(' / ')}
   - ${SPANISH_NOTEBOOKLM_PATTERNS.meta_comments.slice(0, 2).join(' / ')}

4. **Compromiso Emocional**
   - Reacciones de sorpresa genuinas: ${SPANISH_NOTEBOOKLM_PATTERNS.excitement.slice(0, 3).join(' / ')}
   - Construir empatía: "No tenía ni idea cuando aprendí por primera vez..." / "¿No es fascinante?"
   - Estimulación de curiosidad: "Pero lo que es aún más increíble..." / "¿También sabías que?"

## Adaptaciones Culturales para Hispanohablantes

### Referencias Comparativas
- **Comparaciones de Escala**: "Del tamaño de 18 campos de fútbol" / "Como tres veces la Plaza Mayor"
- **Referencias Culturales**: Comparar con Sagrada Familia, Parque del Retiro, Plaza de España
- **Unidades de Medida**: Incluir sistema métrico familiar ("27.5cm, eso es como...")
- **Referencias Temporales**: "Remontándose a cuando el Imperio Romano aún prosperaba"

### Patrones de Comunicación Específicos del Español
- **Participación Directa**: "¿Qué piensan de eso?" / "¿Pueden imaginárselo?"
- **Búsqueda de Confirmación**: "¿Tiene sentido?" / "¿Me siguen?"
- **Expresión de Entusiasmo**: "¡Eso es absolutamente increíble!" / "¡Impresionante, ¿verdad?"
- **Enfoque Práctico**: "Esto es lo que necesitan saber" / "En resumen..."

### Consideraciones de Audiencia Internacional Hispana
- **Contextos Universales**: Referenciar lugares y conceptos conocidos globalmente en español
- **Sensibilidad Cultural**: Explicar matices culturales sin asumir conocimiento previo
- **Accesibilidad**: Definir términos que podrían ser desconocidos para visitantes internacionales
- **Valor Práctico**: Enfocarse en información práctica para viajeros

## Formato de Salida Requerido

**Presentador:** (diálogo)

**Curador:** (diálogo)

**Presentador:** (diálogo)

**Curador:** (diálogo)

## Prohibiciones Absolutas
- Sin formato markdown (**, ##, * etc.) permitido
- Sin uso de emojis
- Sin lenguaje abstracto florido ("hermoso", "increíble" como adjetivos vacíos)
- Sin expresiones especulativas ("probablemente", "parece que")

## Estándares de Calidad (Nivel NotebookLM)

- ✅ **Densidad de Información**: ${Math.round(targetLength/250)}+ hechos concretos
- ✅ **Ritmo de Conversación**: Promedio de intercambios de 1-2 oraciones, respiración natural
- ✅ **Menciones del Oyente**: 5-7 veces por episodio
- ✅ **Momentos de Sorpresa**: 3-4 momentos de "¡Increíble, en serio!"
- ✅ **Conectividad**: Cada pieza de información se conecta naturalmente
- ✅ **Experiencia**: Conocimiento profundo a nivel de curador
- ✅ **Accesibilidad**: Comprensible para el público general hispanohablante

**¡Crea un episodio estilo NotebookLM de ${chapter.title} ahora mismo en formato **Presentador:** y **Curador:**!**
`;
}

/**
 * Generación de prompt de podcast completo en español
 */
export function createSpanishFullGuidePrompt(
  locationName: string,
  guideData: any,
  options: {
    priority?: 'engagement' | 'accuracy' | 'emotion';
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    podcastStyle?: 'deep-dive' | 'casual' | 'educational' | 'exploratory';
  } = {}
): string {
  const { priority = 'engagement', audienceLevel = 'beginner', podcastStyle = 'educational' } = options;
  const hostPersona = PERSONAS.HOST; // Adaptado al español
  const curatorPersona = PERSONAS.CURATOR;
  
  const styleConfig = {
    'deep-dive': 'análisis profundo y comentario profesional',
    'casual': 'conversación relajada y amigable',
    'educational': 'explicación educativa y sistemática',
    'exploratory': 'diálogo exploratorio y enfocado en el descubrimiento'
  };

  const audienceConfig = {
    'beginner': 'explicaciones fáciles para el público general',
    'intermediate': 'para audiencias interesadas con conocimiento básico',
    'advanced': 'conocimiento profundo para oyentes de nivel experto'
  };

  return `
## 🎙️ Generación de Podcast de Guía Completa Estilo NotebookLM de TripRadio

### Misión Central  
Crear un **podcast de guía completa estilo NotebookLM** sobre ${locationName} para comprensión integral.
Configurado para ${styleConfig[podcastStyle]} adaptado a ${audienceConfig[audienceLevel]}.

### Análisis de Información de la Guía
**Ubicación**: ${locationName}
**Prioridad**: ${priority} (enfoque en participación/exactitud/emoción)
**Nivel de Audiencia**: ${audienceLevel}  
**Estilo de Podcast**: ${podcastStyle}

### Estrategia de Estructura General

#### Fase 1: Introducción General (900-1000 palabras)
${hostPersona.name}: "${SPANISH_NOTEBOOKLM_PATTERNS.openings[1]} Vamos a contarles la historia completa de ${locationName}..."

${curatorPersona.name}: "${SPANISH_NOTEBOOKLM_PATTERNS.affirmations[0]} ${locationName} no es solo un destino turístico, es..."

**Elementos Incluidos**:
- Significado general e importancia de la ubicación
- Vista previa de los temas clave que cubriremos hoy
- Lo que los oyentes pueden esperar descubrir
- ${SPANISH_NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 2).join(', ')}

#### Fase 2: Historia y Contexto Cultural (1200-1400 palabras)
**Capas de Información Aplicadas**:
- Antecedentes históricos básicos
- Significado y valor cultural
- Importancia moderna
- Posición internacional

**Patrones NotebookLM**:
- ${SPANISH_NOTEBOOKLM_PATTERNS.transitions[0]} + 2-3 hechos concretos
- ${SPANISH_NOTEBOOKLM_PATTERNS.excitement[1]} + descubrimiento sorprendente
- ${SPANISH_NOTEBOOKLM_PATTERNS.meta_comments[2]} + guía al oyente

#### Fase 3: Características Clave y Atracciones (1400-1600 palabras)  
**Características de Persona Utilizadas**:
- ${hostPersona.name}: Curiosidad entusiasta y preguntas activas
- ${curatorPersona.name}: Explicaciones expertas pero accesibles

**Información Específica Proporcionada**:
- Atracciones representativas y características
- Detalles ocultos y perspectivas de expertos  
- Consejos de visualización y rutas recomendadas
- Características estacionales/específicas del tiempo

#### Fase 4: Experiencia y Actividades (800-1000 palabras)
**Información Práctica**:
- Actividades de experiencia recomendadas
- Lugares para fotos y recuerdos
- Atracciones turísticas conectadas cercanas
- Transporte e instalaciones

#### Fase 5: Conclusión e Impresiones (600-800 palabras)
**Conclusión Emocional**:
- Resumen de las cualidades únicas de ${locationName}
- Puntos emocionales destacados que los visitantes pueden experimentar
- ${SPANISH_NOTEBOOKLM_PATTERNS.audience_engagement[0]}
- Pistas sobre próximos destinos de viaje

### Estándares de Calidad NotebookLM

- **Densidad de Información**: En total 30-35 hechos concretos
- **Intercambios de Diálogo**: 90-110 turnos de conversación naturales
- **Menciones del Oyente**: 15-18 veces de participación activa de la audiencia
- **Momentos de Sorpresa**: 8-10 reacciones de "¡Increíble, en serio!"
- **Consistencia de Persona**: Personalidades distintas de ambos personajes mantenidas

### Pautas de Aplicación de Personas

**${hostPersona.name} (Presentador)**:
- Características: Curioso, entusiasta, hace preguntas que la audiencia haría
- Estilo de Habla: Natural, expresivo, con matices hispanohablantes
- Reacciones: ${SPANISH_NOTEBOOKLM_PATTERNS.excitement.slice(0, 3).join(', ')}

**${curatorPersona.name} (Curador)**:
- Características: Experto conocedor, apasionado por compartir conocimiento
- Método de Explicación: Claro, detallado pero accesible, culturalmente sensible
- Experiencia: Conocimiento profundo con contexto cultural hispano

### Comparaciones Culturales Específicas para Hispanohablantes

#### Referencias Comparativas Hispanas
- **Comparaciones de Escala**: "Del tamaño de 18 campos de fútbol" / "Como tres veces la Plaza Mayor de Madrid"
- **Referencias Culturales**: "Imaginen el Parque del Retiro, pero con tesoros de 1,500 años"
- **Contexto Temporal**: "Cuando los reinos visigodos dominaban la península ibérica"
- **Medidas Familiares**: "27.5 centímetros, más o menos como una regla escolar"

#### Sensibilidad Cultural Hispana
- **Calidez Personal**: Uso de "queridos oyentes", "amigos", tono cercano y familiar
- **Expresividad Emocional**: Permitir expresiones naturales de asombro y admiración
- **Contexto Familiar**: Comparaciones con experiencias cotidianas hispanohablantes
- **Hospitalidad**: Invitar a los oyentes como si fueran huéspedes especiales

## Formato de Salida Final

**Presentador:** (diálogo)
**Curador:** (diálogo)

**¡Absolutamente sin markdown, emojis o expresiones abstractas!**

¡Crea el podcast de guía completa de ${locationName} a nivel de calidad NotebookLM ahora mismo!
`;
}

// ===============================
// 🔧 Funciones Auxiliares
// ===============================

/**
 * Generar plantilla de diálogo principal
 */
function generateSpanishMainDialogueTemplate(chapter: any, locationAnalysis: any): string {
  const dialogueTypes = [
    `**[Exploración Profunda del Contenido Central 1 - 1000 palabras]**
- Primeras impresiones e información básica
- Cifras específicas y datos comparativos
- ${SPANISH_NOTEBOOKLM_PATTERNS.excitement[0]} → conexión de hechos sorprendentes
- ${SPANISH_NOTEBOOKLM_PATTERNS.transitions[1]} → enlace a la siguiente información`,

    `**[Información Profunda y Contexto - 900 palabras]** 
- Explicación de antecedentes históricos/culturales
- ${SPANISH_NOTEBOOKLM_PATTERNS.meta_comments[0]} → verificación de comprensión del oyente
- Perspectivas de expertos e información más reciente
- ${SPANISH_NOTEBOOKLM_PATTERNS.audience_engagement[1]} → invitación a participar`,

    `**[Detalles Especiales y Descubrimientos - 800 palabras]**
- Puntos fácilmente perdidos por visitantes generales
- ${SPANISH_NOTEBOOKLM_PATTERNS.affirmations[2]} → confirmación mutua
- Información especial que solo conocen los curadores  
- ${SPANISH_NOTEBOOKLM_PATTERNS.transitions[3]} → conexión de conclusión`
  ];

  return dialogueTypes.join('\n\n');
}

/**
 * Generar plantilla de transición
 */
function generateSpanishTransitionTemplate(chapter: any): string {
  return `
**Conclusión Natural:**

Presentador: "${SPANISH_NOTEBOOKLM_PATTERNS.transitions[0]}, ¡el tiempo realmente vuela! De ${chapter.title}..."

Curador: "Sí, ${SPANISH_NOTEBOOKLM_PATTERNS.affirmations[1]}. A continuación descubriremos aún más increíble..."

Presentador: "${SPANISH_NOTEBOOKLM_PATTERNS.audience_engagement[0]} mientras continuamos juntos..."

Curador: "Hay tantas más historias fascinantes esperándonos."

**Patrones de Aplicación Central:**
- ${SPANISH_NOTEBOOKLM_PATTERNS.transitions.slice(0, 2).join(' → ')}
- ${SPANISH_NOTEBOOKLM_PATTERNS.affirmations.slice(0, 2).join(' → ')}  
- ${SPANISH_NOTEBOOKLM_PATTERNS.audience_engagement[0]} (inclusión obligatoria)
`;
}

// ===============================
// 🔧 Funciones de Adaptación Cultural
// ===============================

/**
 * Generar comparaciones culturales específicas para español
 */
function generateSpanishCulturalComparisons(locationName: string): string[] {
  return [
    `Piensen en la Plaza Mayor de Madrid, pero con 1,500 años de historia`,
    `Imaginen el Parque del Retiro, pero lleno de tesoros antiguos`,
    `Como la Sagrada Familia, pero de la edad dorada de Corea`,
    `Tiene el tamaño de aproximadamente 18 campos de fútbol`,
    `Eso es aproximadamente tres veces la Plaza de España`,
    `Piensen en ello como el equivalente coreano del Museo del Prado`
  ];
}

/**
 * Generar contextualización de medidas en español
 */
function generateSpanishMeasurements(metric: string): string {
  const conversions: Record<string, string> = {
    '27.5cm': '27.5 centímetros (aproximadamente el largo de una regla)',
    '1kg': '1 kilogramo (como una botella de agua grande)',
    '130,000 metros cuadrados': '130,000 metros cuadrados (como 18 campos de fútbol)',
    '420,000 piezas': '420,000 piezas - ¡eso es más que todo el Museo del Prado!'
  };
  
  return conversions[metric] || metric;
}

/**
 * Generar expresiones de entusiasmo hispanas
 */
function generateSpanishEnthusiasm(): string[] {
  return [
    "¡Qué maravilla!",
    "¡Increíble!",
    "¡No puede ser!",
    "¡Impresionante!",
    "¡Fascinante!",
    "¡Espectacular!",
    "¡Extraordinario!"
  ];
}

// ===============================
// 🔧 Exportación Por Defecto
// ===============================

const SpanishPodcastModule = {
  createSpanishPodcastPrompt,
  createSpanishFullGuidePrompt,
  SPANISH_NOTEBOOKLM_PATTERNS,
  SPANISH_DIALOGUE_STRUCTURE,
  applySpanishPersonaCharacteristics,
  generateSpanishCulturalComparisons,
  generateSpanishMeasurements,
  generateSpanishEnthusiasm
};

export default SpanishPodcastModule;