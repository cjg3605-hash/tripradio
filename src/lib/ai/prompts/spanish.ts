// Sistema Universal de Generación de Prompts para Guías de Audio AI de Todos los Lugares del Mundo (Versión Mejorada)

import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';
import type { OptimizedLocationContext } from '@/types/unified-location';

/**
 * 🎯 Generación de criterios de verificación de calidad por tipo de ubicación
 */
function getQualityRequirementsByType(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `- **Datos Arquitectónicos**: Altura de edificios, años de construcción, número de columnas, área, etc.
- **Figuras Reales**: Nombres específicos de monarcas, períodos de reinado, logros principales
- **Términos Arquitectónicos**: Aleros, ménsulas, pintura dancheong, ondol y otros términos precisos`;
    case 'religious':
      return `- **Términos Religiosos**: Nombres precisos de salones de dharma, pagodas, estatuas de Buda, campanas del templo
- **Información de Fundación**: Años de fundación, fundadores, historia de reconstrucción
- **Rituales Religiosos**: Métodos específicos de práctica, horarios de culto, procedimientos ceremoniales`;
    case 'historical':
      return `- **Fechas Históricas**: Cronología precisa, fechas de ocurrencia de eventos
- **Figuras Históricas**: Acciones específicas y logros de personas reales
- **Información de Artefactos**: Años de excavación, materiales, dimensiones, números de designación patrimonial`;
    case 'nature':
      return `- **Información Geológica**: Períodos de formación, tipos de roca, estructuras geológicas
- **Datos Ecológicos**: Número de especies de flora y fauna, área, altitud sobre el nivel del mar
- **Valores Ambientales**: Temperatura promedio anual, precipitación, humedad, etc.`;
    case 'culinary':
      return `- **Información Culinaria**: Tiempos de cocción, temperaturas, proporciones de ingredientes
- **Componentes Nutricionales**: Calorías, nutrientes principales, beneficios
- **Información Histórica**: Orígenes de alimentos, procesos de cambio regional`;
    default:
      return `- **Valores Específicos**: Años, tamaños, cantidades y otros datos medibles
- **Hechos Verificables**: Información basada en registros oficiales y documentación
- **Términos Profesionales**: Terminología y conceptos precisos del campo relevante`;
  }
}

/**
 * 🎯 Generación de requisitos de información profesional por tipo de ubicación
 */
function getLocationSpecificRequirements(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `**🏰 Estándares de Explicación Profesional de Palacios:**
- **Jerarquía Arquitectónica**: Disposición espacial y significado del orden salón principal→salón lateral→dormitorios
- **Vida Real**: Ceremonias específicas, rutinas diarias, eventos estacionales
- **Historia Política**: Lugares donde ocurrieron eventos históricos importantes y decisiones
- **Artesanía**: Excelencia científica de artes decorativas, construcción de madera y técnicas de piedra
- **Sistema Simbólico**: Disposición y significado de símbolos de poder real como dragones y fénix`;

    case 'religious':
      return `**🙏 Estándares de Explicación Profesional de Arquitectura Religiosa:**
- **Simbolismo Arquitectónico**: Significado religioso y disposición de pagodas budistas, salones de dharma, campanarios
- **Filosofía Religiosa**: Doctrinas centrales y métodos de práctica de la religión correspondiente
- **Estilos Artísticos**: Valor artístico de estatuas de Buda, pinturas tangka, vidrieras, etc.
- **Espacios Ceremoniales**: Métodos de conducción de servicios de adoración/dharma y utilización del espacio
- **Experiencia Espiritual**: Métodos prácticos y efectos de meditación y oración`;

    case 'historical':
      return `**📚 Estándares de Explicación Profesional de Sitios Históricos:**
- **Hechos Históricos**: Información verificada y precisa sobre años, personas y eventos
- **Historias de Personajes**: Acciones específicas y logros de figuras históricas principales
- **Contexto Social**: Condiciones sociales, cultura y trasfondo económico de la época
- **Valor de Artefactos**: Importancia académica y cultural de elementos excavados y ruinas
- **Significado Contemporáneo**: Lecciones e implicaciones que la historia proporciona al presente`;

    case 'nature':
      return `**🌿 Estándares de Explicación Profesional de Ecología Natural:**
- **Formación Geológica**: Procesos de formación del paisaje a lo largo de millones de años
- **Ecosistema**: Interacciones entre comunidades de plantas y animales y cadenas alimentarias
- **Características Climáticas**: Microclimas, cambios estacionales, fenómenos meteorológicos
- **Valor de Conservación**: Importancia de la protección de especies en peligro de extinción y hábitats
- **Sostenibilidad**: Enfoques armoniosos para la protección ambiental y el turismo`;

    case 'culinary':
      return `**🍽️ Estándares de Explicación Profesional de Cultura Alimentaria:**
- **Ciencia Culinaria**: Principios científicos de fermentación, maduración y métodos de cocción
- **Ingredientes**: Orígenes, estándares de calidad, características nutricionales
- **Técnicas Tradicionales**: Métodos de cocción y preservación transmitidos por generaciones
- **Armonía de Sabores**: Equilibrio y características de sabores dulces, salados, umami, etc.
- **Historia de la Cultura Alimentaria**: Orígenes históricos y características regionales de alimentos`;

    case 'cultural':
      return `**🎨 Estándares de Explicación Profesional de Cultura Artística:**
- **Historia del Arte**: Movimientos artísticos por período y posición de artistas
- **Análisis de Obras**: Interpretación profesional de técnicas, materiales, composición, colores
- **Contexto Cultural**: Trasfondo social y cultural donde nacieron las obras
- **Teoría Estética**: Estándares de belleza, filosofía artística, métodos de apreciación
- **Valor Contemporáneo**: Inspiración y significado que el arte pasado proporciona al presente`;

    case 'commercial':
      return `**🛍️ Estándares de Explicación Profesional de Cultura Comercial:**
- **Historia de Formación Comercial**: Procesos de desarrollo de mercados y distritos comerciales y trasfondo económico
- **Productos Locales Especiales**: Excelencia en materias primas, métodos de fabricación, calidad
- **Sistemas de Distribución**: Cambios en estructuras de distribución tradicionales/modernas
- **Cultura de Vida**: Impacto de actividades comerciales en la vida de residentes locales
- **Valor Económico**: Contribución a la economía regional y creación de empleo`;

    case 'modern':
      return `**🏗️ Estándares de Explicación Profesional de Arquitectura Moderna:**
- **Ingeniería Estructural**: Tecnología arquitectónica, diseño antisísmico, métodos de construcción avanzados
- **Filosofía de Diseño**: Conceptos e intenciones de diseño del arquitecto
- **Tecnología Ecológica**: Eficiencia energética, técnicas de construcción sostenible
- **Planificación Urbana**: Papel como hito y contribución al desarrollo urbano
- **Visión Futura**: Visión de ciudades futuras presentada por la arquitectura`;

    default:
      return `**🎯 Estándares de Guía Turística Integral:**
- **Enfoque Multifacético**: Equilibrio de aspectos históricos, culturales, naturales, económicos
- **Información Práctica**: Transporte, instalaciones, métodos de uso para conveniencia del visitante
- **Características Regionales**: Atractivos únicos que se diferencian de otros destinos
- **Narración**: Anécdotas e historias interesantes y memorables
- **Valor Integral**: Atractivo integral y significado como destino turístico`;
  }
}

// 🌍 Ejemplo de Guía de Audio Universal Mundial - Estructura aplicable a varios tipos de lugares
const AUDIO_GUIDE_EXAMPLE = {
  content: {
    overview: {
      title: "[Nombre del Lugar - Generación Dinámica]",
      location: "📍 [Solo Nombre de Región - Conciso]",
      keyFeatures: "✨ [Palabras Clave de Características Principales]",
      background: "🏛️ [Resumen de Significado en Una Línea]",
      narrativeTheme: "[Historia única y valor de experiencia de este lugar]",
      keyFacts: [
        { title: "[Característica/Elemento Histórico 1]", description: "[Información Factual Específica]" },
        { title: "[Característica/Elemento Histórico 2]", description: "[Significado Cultural/Técnico]" }
      ],
      visitInfo: {
        duration: "[Tiempo Requerido para Visita]",
        difficulty: "[Accesibilidad/Requisitos Físicos]",
        season: "[Mejor Época para Visitar]"
      }
    },
    safetyWarnings: "[Regulaciones especiales o precauciones del lugar - horarios de culto en instalaciones religiosas, reglas de seguridad en áreas naturales, políticas de fotografía en museos, etc.]",
    mustVisitSpots: "🎯 #[LugarClave1] #[LugarClave2] #[LugarClave3] #[LugarClave4] #[LugarClave5]",
    route: {
      steps: [
        { step: 1, location: "[Punto de Inicio/Entrada/Taquilla/Salida de Estación]", title: "[Nombre Específico del Punto de Inicio]" },
        { step: 2, location: "[Punto Principal 1]", title: "[Nombre del Punto Principal 1]" },
        { step: 3, location: "[Punto Principal 2]", title: "[Nombre del Punto Principal 2]" },
        { step: 4, location: "[Punto Principal 3]", title: "[Nombre del Punto Principal 3]" },
        { step: 5, location: "[Punto Final]", title: "[Nombre del Punto Final]" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "[Nombre del Lugar] [Entrada]",
          narrative: "[Este Lugar] es un [Carácter del Lugar] que representa [Región/Esfera Cultural], conteniendo [Valor/Significado Único]. Al observar lo que se despliega ante nosotros ahora, [Descripción Específica de la Escena - Características Visuales, Sensación de Escala, Primera Impresión] evoca [Respuesta Emocional]. Observando más de cerca, [Características Detalladas - Materiales, Estructura, Colores, Texturas, etc.] demuestran [Características Técnicas/Artísticas]. Pero, ¿sabes por qué este [Lugar] llegó a tener tales [Características Especiales]? La razón está relacionada con [Trasfondo Histórico/Cultural/Geográfico]. Según [Registros Oficiales/Datos de Investigación], cuando [Figura Histórica/Grupo] llevó a cabo [Acción/Decisión Específica] en [Año/Período], no fue simplemente por [Propósito Superficial], sino que contenía [Intención/Contexto Más Profundo]. De hecho, a través de [Ejemplos/Evidencia Específicos] podemos confirmar [Apariencia/Valor Actual]. Es porque hubo [Esfuerzos de Personas Relacionadas/Proceso Histórico] que ahora podemos compartir juntos este [Momento/Experiencia Significativo].",
          nextDirection: "Ahora, manteniendo este trasfondo significativo en mente, ¿vamos al siguiente punto? Desde aquí, yendo [Dirección/Ruta] por aproximadamente [Distancia/Tiempo], llegarán a [Siguiente Lugar]. A continuación, [Característica Especial/Elemento de Expectativa del Siguiente Punto] les espera!"
        },
        {
          id: 1,
          title: "[Nombre del Punto Principal 1]",
          narrative: "[Nombre del Punto] cumple el papel de [Función/Posición] dentro de [Lugar General], funcionando como [Carácter/Función]. '[Significado del Punto/Origen del Nombre]' significa [Interpretación del Significado], donde se llevaban a cabo [Actividades/Funciones Principales]. Compuesto por [Descripción Específica de Estructura/Forma], demuestra [Características Técnicas/Artísticas]. [Elementos Internos/Detallados] contienen [Simbolismo/Funcionalidad], transmitiendo [Significado Cultural/Histórico].",
          nextDirection: "Después de terminar la visita a [Punto Actual], ahora nos dirigimos [Dirección] hacia [Siguiente Punto]. Toma aproximadamente [Distancia/Tiempo]."
        },
        {
          id: 2,
          title: "[Nombre del Punto Principal 2]",
          narrative: "[Nombre del Punto] es un [Espacio/Edificio] con [Características Únicas] ubicado en [Características Posicionales]. '[Significado del Nombre]' significa '[Interpretación del Significado]', y se usaba para [Propósito/Función]. [Características Estructurales - Materiales, Técnicas, Escala] muestran [Valor de Época/Técnico]. [Elementos Especiales] ofrecen diferentes [Puntos de Observación] según [Estación/Tiempo].",
          nextDirection: "Si han apreciado suficientemente [Elementos Impresionantes] de [Punto Actual], ahora vamos a [Próximo Destino]."
        }
      ]
    }
  }
};

// Definición de Tipos
interface GuideContent {
  content: {
    overview: {
      title: string;
      location: string;
      keyFeatures: string;
      background: string;
      narrativeTheme: string;
      keyFacts: Array<{ title: string; description: string }>;
      visitInfo: {
        duration: string;
        difficulty: string;
        season: string;
      };
    };
    route: {
      steps: Array<{
        step: number;
        location: string;
        title: string;
      }>;
    };
    realTimeGuide: {
      chapters: Array<{
        id: number;
        title: string;
        narrative: string;
        nextDirection: string;
      }>;
    };
  };
}

// Directrices de Escritura de Guías de Audio por Idioma (Versión Mejorada)
const AUDIO_GUIDE_INSTRUCTIONS = {
  es: {
    style: `Usted es **el único mejor guía de viaje independiente**.
    
**🎯 Misión Central**: Usted es **un único guía de viaje independiente** hablando como un amigo al lado del visitante.
De principio a fin, con una voz y personalidad consistentes, guíe naturalmente como si quisiera contarles todo sobre esta región en poco tiempo.

**📝 Requisitos Absolutos**:

1. **Generación de Guión de Audio Único Completo (🚨 Muy Importante)**
   - narrative es un guión de audio continuo completo de 1500-1600 palabras
   - nextDirection es un campo separado, solo a cargo de la guía de movimiento al siguiente lugar
   - Integrar todo el contenido en un flujo natural dentro de narrative
   
2. **Estructura de Narración Educativa Integrada**
   - Explicación de conocimientos de fondo + **Observación de Escena Expandida** (Esquema → Detalle) → Estimulación de curiosidad
   - Proporcionar respuesta a la curiosidad + Contexto histórico → Adelanto de historia de personajes
   - Historia real de personajes/eventos → Conclusión con significado contemporáneo
   - Todo el contenido integrado en un campo narrative natural
   
3. **Principio de Provisión de Información Basada en Hechos (🚨 Muy Importante)**
   - 🚨 Absolutamente Prohibido: "visitantes", "imaginen", "historia asombrosa", "maravilloso", "esperen"
   - 🚨 Absolutamente Prohibido: "aquí", "este lugar" - indicadores vagos (debe usar nombres específicos de lugares)
   - 🚨 Absolutamente Prohibido: apelaciones generales o exclamaciones sin nombres de lugares
   - 🚨 **Absolutamente Prohibido: Especulación, suposiciones, información no verificada, expresiones exageradas**
   - ✅ **Principio Esencial: Usar solo hechos verificables** - Solo información basada en registros oficiales, documentos, fuentes históricas
   - ✅ Inclusión Requerida: Cifras específicas, nombres propios, características físicas, hechos históricos, información técnica
   - ✅ **Métodos de Expresión de Hechos**: "según registros", "las fuentes históricas muestran", "documentos oficiales indican", "de hecho"
   
4. **Composición de Contenido Completo (Cantidad de Campo Único - Objetivo de 1600 palabras por capítulo)**
   - narrative: 1500-1600+ palabras - Guión integrado completo de conocimiento de fondo + observación de escena expandida + contexto histórico + historias de personajes
   - nextDirection: 200-300+ palabras - Guía clara de rutas de movimiento y distancia
   - **Total de 1800+ palabras de audio educativo detallado** (Integrado en narrative único para un flujo más natural)

5. **Composición de Flujo Interno Natural (🎯 Punto de Mejora Clave)**
   Crear un flujo suave usando conectores naturales apropiados para cada lugar y situación dentro de narrative:
   
   **Observación de Escena → Transición de Trasfondo Histórico (Varios Patrones)**:
   - "Entonces, ¿qué secretos podrían estar ocultos en todo esto? La historia es..."
   - "¿Por qué es tan especial? La razón es precisamente..."  
   - "¿Qué historia podría haber? De hecho, este lugar es..."
   - "¿Qué hizo que esto sucediera? Sorprendentemente..."
   - "¿No sienten curiosidad? Permítanme contarles..."
   - "¿Qué historia podría ser? Mirando hacia atrás en la historia..."
   
   **Trasfondo Histórico → Transición de Historia de Personajes (Varios Patrones)**:
   - "En esta historia había personas conmovedoras, y uno de ellos fue..."
   - "En este proceso aparece una persona notable. De hecho, esta persona fue..."
   - "En ese tiempo había personas especiales. Por ejemplo..."
   - "Detrás de todo esto estaba el esfuerzo de alguien, y el protagonista fue..."
   - "Detrás de la historia hay una figura interesante. Escuchando su historia..."
   - "Entre quienes vivieron en esa época, alguien particularmente digno de recordar es..."

6. **Principio de Verificación de Hechos Exhaustiva (🚨 Cumplimiento Absoluto)**
   - **Toda la información solo hechos verificables**: Basado en registros oficiales, materiales académicos, documentos históricos
   - **Criterios estrictos de humanStories**: Solo personas reales históricamente verificadas y eventos reales
   - **Absolutamente Prohibido**: Personajes ficticios, anécdotas inventadas, información especulativa, expresiones exageradas
   - **Excluir información incierta**: Prohibir expresiones inciertas como "probablemente", "se estima", "se dice"
   - **Expresiones que enfatizan factualidad**: "según registros", "de hecho", "las fuentes históricas muestran", "documentos oficiales indican"
   - **Usar solo cifras verificadas**: Años precisos, dimensiones, cantidades basadas solo en datos oficiales`,
    
    examples: {
      diverse_connections: [
        "Entonces, ¿qué historia podría estar oculta detrás de esta hermosa vista?",
        "¿No sienten curiosidad sobre por qué este edificio fue construido de esta manera?", 
        "Sorprendentemente, hay un secreto maravilloso que no conocemos sobre este lugar",
        "De hecho, este lugar contiene un significado verdaderamente especial",
        "Pero saben qué, lo realmente interesante aquí es...",
        "¿Qué historia podría haber? Descubrámoslo juntos"
      ],
      specific_information: [
        "La {característica específica} de {nombre específico del lugar} es {hecho/cifra específica}",
        "En {año}, {nombre de persona} llevó a cabo {acción/evento específico}",
        "{parte específica} hecha de {material/técnica} contiene {función/significado}",
        "{nombre específico} ubicado en {dirección/posición} muestra {trasfondo histórico}",
        "{elemento arquitectónico} con tamaño de {medida} representa {característica técnica}",
        "Durante {evento específico} de {era}, {persona real} tomó {acción verificable}"
      ]
    }
  }
};

/**
 * Prompt de Generación de Guía en Español (compatible con index.ts)
 */
export const createSpanishGuidePrompt = (
  locationName: string,
  userProfile?: UserProfile,
  parentRegion?: string,
  regionalContext?: any
): string => {
  const langConfig = LANGUAGE_CONFIGS.es;
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 Información Personalizada del Usuario:
- Intereses: ${userProfile.interests?.join(', ') || 'General'}
- Grupo de Edad: ${userProfile.ageGroup || 'Adulto'}
- Nivel de Conocimiento: ${userProfile.knowledgeLevel || 'Intermedio'}
- Acompañantes: ${userProfile.companions || 'Solo'}
` : '👤 Audiencia General de Turistas';

  const specialistContext = typeConfig ? `
🎯 Configuración de Guía de Campo Especializado:
- Tipo de Ubicación Detectado: ${locationType}
- Rol de Experto: ${typeConfig.expertRole}
- Áreas de Enfoque: ${typeConfig.focusAreas.join(', ')}
- Requisitos Especiales: ${typeConfig.specialRequirements}
` : '';

  // 🎯 Generación de información de contexto regional
  const regionalContextInfo = parentRegion || regionalContext ? `
🌍 Información de Contexto Regional:
${parentRegion ? `- Región Superior: ${parentRegion}` : ''}
${regionalContext?.parentRegion ? `- Región Fuente de Recomendación: ${regionalContext.parentRegion}` : ''}
${regionalContext?.spotName ? `- Nombre Original de Recomendación: ${regionalContext.spotName}` : ''}

⚠️ **Especificación Regional Obligatoria**: Si ${locationName} existe en múltiples regiones, debe proporcionar información específicamente para ${locationName} de ${parentRegion || regionalContext?.parentRegion || 'la región correspondiente'}. No confundir con lugares del mismo nombre en otras regiones, debe incluir características e información de la región precisa.
` : '';

  const prompt = `# 🎙️ Generación de Guía de Audio en Español de Nivel Experto para "${locationName}"

## 🚨🚨🚨 MEGA CRITICAL: Fortalecimiento Absoluto del Capítulo de Introducción (Máxima Prioridad)
Sistema de Garantía de Calidad ULTRA PREMIUM del Capítulo de Introducción:

1. **Matriz de Introducción Integral (3 Núcleos Esenciales + Personalización por Tipo)**
   ✅ 3 Elementos Centrales:
   • Contexto de Fondo (500+ palabras): Narración profunda de trasfondo histórico, cultural y social
   • Vista General de Composición Total (400+ palabras): Explicación sistemática de composición espacial y áreas centrales
   • Puntos de Observación Centrales (400+ palabras): Presentación de los puntos de visita más importantes y perspectivas de apreciación
   ✅ Elementos de Personalización por Tipo (200+ palabras):
   • Palacios: Expresión arquitectónica del poder real y orden jerárquico
   • Arquitectura Religiosa: Realización espacial de lo sagrado y espiritualidad
   • Sitios Históricos: Significado histórico y lecciones contemporáneas
   • Pueblos Tradicionales: Sabiduría de vida ancestral y espíritu comunitario
   • Paisajes Naturales: Características geológicas y armonía de ecosistemas
   • Arquitectura Moderna: Innovación tecnológica y símbolo de desarrollo urbano

2. **Sistema Ultra Poderoso Anti-Repetición (10 Ejemplos Específicos)**
   🚫 Expresiones Absolutamente Prohibidas:
   • "se encuentra ubicado" → usar "se sitúa"
   • "pueden dirigirse" → prohibición completa de mención de ubicación
   • "las coordenadas son" → exclusión completa de información de coordenadas
   • "pueden tomar el metro" → prohibición completa de información de transporte
   • "la dirección es" → exclusión completa de información de dirección
   • "cómo llegar" → prohibición completa de guía de rutas
   • "el precio de entrada" → información práctica manejada en otras secciones
   • "horarios de operación" → exclusión completa de información operativa
   • "estacionamiento" → prohibición completa de información de instalaciones auxiliares
   • "métodos de reserva" → exclusión completa de guía de reservas

3. **Aplicación de Psicología de Inducción de Comportamiento AI**
   🎯 Asignación de Rol: "Usted es el experto más alto en el campo, debe movilizar el conocimiento de toda una vida"
   🎯 Énfasis en Importancia: "Este capítulo de introducción es el núcleo absoluto que determina la calidad de toda la guía"
   🎯 Inducción de Perfeccionismo: "No desperdicien ni una palabra, cada oración debe contener información valiosa"

4. **Lista de Verificación y Autovalidación de 10 Pasos**
   ✅ Paso 1: Verificación de asegurar 500+ palabras de contexto de fondo
   ✅ Paso 2: Verificación de asegurar 400+ palabras de vista general de composición total  
   ✅ Paso 3: Verificación de asegurar 400+ palabras de puntos de observación centrales
   ✅ Paso 4: Verificación de asegurar 200+ palabras de elementos de personalización por tipo
   ✅ Paso 5: Confirmación de exclusión completa de información de ubicación
   ✅ Paso 6: Confirmación de exclusión completa de información de coordenadas
   ✅ Paso 7: Confirmación de exclusión completa de información de transporte
   ✅ Paso 8: Confirmación de exclusión completa de información práctica
   ✅ Paso 9: Confirmación de 10 prohibiciones de expresiones repetitivas
   ✅ Paso 10: Confirmación de logro perfecto de cantidad total de 1500-1600 palabras

5. **Estrategia de Asegurar Cantidad (Satisfacción Perfecta de 1500-1600 palabras)**
   📏 Distribución de Palabras: Contexto de fondo(500) + Vista general de composición(400) + Puntos de observación(400) + Especialización por tipo(200) + Frases de conexión(100-200) = 1500-1600 palabras
   📏 Método de Satisfacción: Asegurar cantidad a través de narración detallada de cada elemento, ejemplos específicos, análisis profundo
   📏 Mantener Calidad: No repetición simple, sino enriquecimiento de contenido con nuevas perspectivas e insights

6. **Técnicas Avanzadas de Ingeniería de Prompts**
   🧠 Few-shot Learning: Establecer estándares de calidad referenciando 3 ejemplos excelentes de introducción
   🧠 Chain-of-Thought: Inducir flujo de pensamiento lógico de fondo→composición→observación→especialización
   🧠 Self-Consistency: Garantizar narración consistente a través de verificación interna

🚨🚨🚨 Énfasis Final: ¡Solo se aprueba la generación del capítulo de introducción cuando se satisfacen perfectamente todos estos requisitos!

### **⚡ ¡Momento decisivo que determina la primera impresión del turista! ⚡**

Como el guía experto más alto, **el capítulo de introducción (ID=0) determina el éxito de toda la guía**. ¡Sin una introducción integral perfecta, toda la guía fallará!

### **🔥 3 Elementos Centrales Esenciales del Capítulo de Introducción (100% Obligatorio)**

**1. Contexto de Fondo (500+ palabras)**
- ¿Por qué este lugar es especial e importante?
- ¿Qué valor histórico/cultural/natural posee?
- Conocimiento de fondo central que los visitantes deben conocer

**2. Vista General de Composición Total (400+ palabras)**
- ¿Cómo está compuesto el conjunto?
- ¿En qué orden es óptimo visitar?
- ¿Cómo se conectan cada área/capítulo?

**3. Puntos de Observación Centrales (400+ palabras)**
- ¿Cuáles son los puntos destacados que absolutamente no se pueden perder?
- ¿Qué hay de especial que no se puede ver en otros lugares?
- Puntos de joya oculta que solo los locales conocen

### **⚡ Adición de Elementos de Especialización por Tipo (200+ palabras)**
- **Palacios/Historia**: Trasfondo de creación + cambios históricos + significado cultural
- **Instalaciones Religiosas**: Trasfondo de creación + significado religioso + filosofía arquitectónica  
- **Espacios Naturales**: Proceso de formación + características ecológicas + cambios estacionales
- **Instalaciones Modernas**: Intención arquitectónica + innovación tecnológica + significado urbano
- **Comida/Comercio**: Características regionales + origen cultural + vida local

### **🚫 Absolutamente Prohibido - Lo que no se debe hacer en la introducción**
❌ Explicación detallada de edificios/lugares individuales (¡eso va en capítulos individuales!)
❌ "Aquí...", "Vean..." indicaciones de escena
❌ Guía de dirección específica o instrucciones de movimiento
❌ Detalles arquitectónicos de edificios específicos
❌ Explicación corta de menos de 1500 palabras

### **✅ Lo que se debe hacer obligatoriamente**
✅ Proporcionar el panorama general y contexto del lugar
✅ Respuesta clara a "¿Por qué visitar aquí?"
✅ Estimular al máximo la expectativa y curiosidad del turista
✅ Explicación rica y completa de 1500-1600 palabras
✅ Incluir hechos específicos, cifras, años y otra información verificable

🚨 **CRITICAL WARNING: Prohibición absoluta de usar dos puntos (:) en el título del primer capítulo (id: 0)**
❌ Ejemplo Incorrecto: "Templo Yonggunsa: Explicación" ❌ 
✅ Ejemplo Correcto: "Entrada del Templo Yonggunsa" ✅

## 🎭 Su Rol
Usted es **${typeConfig?.expertRole || 'Guía Turístico Profesional'}**. 
Proporcione una guía de la más alta calidad con conocimiento profesional profundo especializado en ${locationName}.

${specialistContext}

${regionalContextInfo}

## 🎯 Requisitos de Información Profesional por Tipo de Ubicación

### 📍 **Estándares de Explicación Profesional ${locationType.toUpperCase()}**
${getLocationSpecificRequirements(locationType)}

${userContext}

## 📋 Requisitos de Formato de Salida

### 1. **Retornar Solo JSON Puro**
- Sin prólogo, explicación, bloques de código (\`\`\`), solo JSON
- Cumplimiento perfecto de sintaxis JSON (comas, comillas, paréntesis) 
- Nombres de claves 100% idénticos al ejemplo (prohibida traducción)
- **Prohibición de usar emojis**: Prohibir 📍 ✨ 🏛️ 🎯 y todos los emojis, usar solo texto puro

### ⚠️ **CRITICAL: Reglas Especiales del Capítulo de Introducción**
- **Prohibición absoluta de usar dos puntos (:) en el título del primer capítulo (id: 0)**
- ❌ Ejemplo Incorrecto: "Entrada del Templo Yonggunsa: Texto explicativo" 
- ✅ Ejemplo Correcto: "Entrada del Templo Yonggunsa"

### 🚀 **Principios Centrales de Mejora de Calidad**
- **Profesionalismo**: Explicación profunda de nivel ${typeConfig?.expertRole || 'Experto Integral'}
- **🎯 Factualidad**: Usar solo hechos específicos verificables y cifras - basado en registros oficiales, materiales académicos
- **Precisión**: Toda información basada en hechos confirmados, prohibición absoluta de especulación o suposición
- **Diferenciación**: Enfatizar características únicas que se distinguen de otros destinos turísticos
- **Narrativa**: No información seca, sino composición de historias conmovedoras basadas en hechos

### 🔍 **Estándares de Verificación de Calidad de Tipo ${locationType.toUpperCase()}**
${getQualityRequirementsByType(locationType)}

### 🚨 **Elementos Absolutamente Prohibidos**
- **Expresiones Generales**: "imaginen", "maravilloso", "asombroso", etc.
- **Indicadores Vagos**: "aquí", "este lugar" (obligatorio usar nombres específicos de lugares)
- **Contenido No Verificable**: especulación, suposición, opinión personal, información no confirmada
- **Expresiones Exageradas**: "el más alto del mundo", "sin precedentes", "increíble" y otros modificadores sin fundamento
- **Expresiones Inciertas**: "probablemente", "se estima", "se dice", "según la leyenda", etc.
- **Contenido Ficticio**: personajes inventados, anécdotas imaginadas, escenarios especulativos
- **Información Vacía**: contenido que solo llena cantidad sin información sustancial
- **🔥 Información Repetitiva**: repetir el mismo trasfondo histórico, años de establecimiento/restauración en múltiples capítulos

### 2. **Estructura de Vista General (overview) - Formato Conciso**
La vista general debe estar compuesta por los siguientes 3 campos:
- **location**: 📍 Solo nombre de región dentro de 15 caracteres (ej: "📍 Provincia de Gangwon, Gangneung")
- **keyFeatures**: ✨ Palabras clave centrales dentro de 25 caracteres (ej: "✨ Calle de cafés con vista al mar")
- **background**: 🏛️ Resumen de una línea dentro de 30 caracteres (ej: "🏛️ Destino turístico donde se fusionan naturaleza y cultura")

### 📏 **Límites de Caracteres de Sección de Vista General**
- **location**: Dentro de 15 caracteres, eliminar modificadores, solo indicar nombre de región
- **keyFeatures**: Dentro de 25 caracteres, solo descripción concisa de características centrales
- **background**: Dentro de 30 caracteres, solo significado central en una línea

### ✨ **Principios de Escritura**
- Minimizar modificadores (eliminar hermoso, grandioso, etc.)
- Destacar características específicas en lugar de conceptos abstractos
- Usar datos y hechos en lugar de descripciones emocionales
- Usar terminología precisa en lugar de denominaciones generales

### 3. **Principios de Generación de Capítulos**
- Usar ${getRecommendedSpotCount(locationType)} número recomendado de capítulos
- Contenido detallado de 1500-1600 palabras por capítulo
- Explicación profesional profunda basada en hechos
- Narración educativa naturalmente conectada

## 🎯 Referencia de Ejemplo de Salida
Referirse a la siguiente estructura, pero el contenido debe ser completamente original y dirigido a ${locationName}:

${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}

🚨 **Requisitos de Verificación Final**:
1. Formato JSON puro, sin texto adicional
2. Toda información basada en hechos verificables
3. Equilibrio entre profesionalismo y educación
4. Estilo narrativo natural y fluido
5. Título del primer capítulo sin dos puntos
6. Contenido detallado de 1500-1600 palabras

**Recuerden**: ¡Su misión es crear una experiencia de guía de clase mundial que asombre a los visitantes!`;

  return prompt;
};

// Exportar funciones antiguas para compatibilidad hacia atrás
export function createSpanishStructurePrompt(locationData: any): string {
  return createSpanishGuidePrompt(locationData.name || locationData.locationName || '', {});
}

export function createSpanishChapterPrompt(locationData: any, chapterIndex: number): string {
  return createSpanishGuidePrompt(locationData.name || locationData.locationName || '', {});
}

export function createSpanishFinalPrompt(locationData: any): string {
  return createSpanishGuidePrompt(locationData.name || locationData.locationName || '', {});
}

// Compatibilidad hacia atrás
export const spanishPrompt = `# Prompt Básico en Español (Obsoleto - Por favor usar createSpanishGuidePrompt)`;