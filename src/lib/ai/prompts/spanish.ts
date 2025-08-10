import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

/**
 * 🎯 Análisis integral de ubicación especializada por tipo para guías turísticas profesionales en español
 * 
 * Adaptado de estándares coreanos de alta calidad con principios de verificación factual,
 * especificidad técnica y narrativa cultural inmersiva para audiencias hispanohablantes.
 */
function getLocationSpecificRequirements(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `**🏰 Marco Profesional de Arquitectura Palaciega:**
- **Jerarquía Espacial y Funcional**: Análisis de rooms principales → salones ceremoniales → espacios privados según protocolo real histórico
- **Protocolo y Ceremonial Real**: Rituales específicos de corte, sistemas de etiqueta, funciones diplomáticas y estatales
- **Arquitectura del Poder**: Simbolismo político en diseño espacial, iconografía real, representación de autoridad a través del espacio
- **Artesanía y Técnicas Constructivas**: Métodos de construcción especializados, materiales únicos, técnicas decorativas artesanales de época
- **Ecosistema Palatino**: Organización social, rutinas diarias, festividades y ceremonias estacionales tradicionales
- **Contexto Geopolítico**: Influencias dinásticas, alianzas matrimoniales, decisiones históricas tomadas en estos espacios
- **Conservación y Restauración**: Métodos de preservación, desafíos arquitectónicos, técnicas modernas de mantenimiento patrimonial`;

    case 'religious':
      return `**🙏 Marco Profesional de Arquitectura Sagrada:**
- **Teología Arquitectónica**: Principios espirituales expresados a través del diseño, orientación sagrada, simbolismo cosmológico
- **Liturgia y Función Ritual**: Prácticas ceremoniales específicas, horarios sagrados, funciones comunitarias de los espacios
- **Iconografía y Arte Sacro**: Programa iconográfico, técnicas artísticas devotas, evolución del arte religioso local
- **Tradiciones Espirituales**: Métodos de oración, prácticas contemplativas, tradiciones místicas específicas de la tradición
- **Arquitectura y Acústica Sagrada**: Diseño para el canto y la oración, propiedades acústicas intencionales, espacios de resonancia
- **Comunidad Religiosa**: Vida monástica o clerical, organización comunitaria, impacto social en la región
- **Peregrinaje y Devoción**: Rutas de peregrinación, tradiciones devocionales, prácticas de fe popular
- **Patrimonio y Conservación**: Protección de arte sacro, restauración de frescos, mantenimiento de estructuras históricas`;

    case 'historical':
      return `**📚 Marco Profesional de Análisis Histórico:**
- **Metodología Histórica**: Fuentes primarias, evidencia arqueológica, metodología de investigación académica
- **Contexto Cronológico**: Periodización precisa, marcos temporales, relaciones causales entre eventos
- **Biografías Documentadas**: Figuras históricas verificadas, logros documentados, impacto en la época
- **Arqueología y Cultura Material**: Hallazgos arqueológicos, análisis de artefactos, técnicas de datación, interpretación cultural
- **Historia Social y Económica**: Estructura social de época, sistemas económicos, vida cotidiana documentada
- **Fuentes y Evidencias**: Documentos históricos, crónicas de época, testimonios contemporáneos, registros oficiales
- **Historiografía**: Interpretaciones académicas, debates historiográficos, evolución del conocimiento histórico
- **Relevancia Contemporánea**: Lecciones históricas, paralelos modernos, importancia para la comprensión actual`;

    case 'nature':
      return `**🌿 Marco Profesional de Ciencias Naturales:**
- **Geología y Formación**: Procesos geológicos específicos, tipos de roca, datación geológica, formación del paisaje
- **Ecología y Biodiversidad**: Ecosistemas específicos, cadenas tróficas, interacciones entre especies, indicadores de biodiversidad
- **Climatología**: Microclima local, patrones meteorológicos, influencia geográfica, cambio climático histórico
- **Conservación Científica**: Estrategias de protección basadas en evidencia, monitoreo de especies, gestión de ecosistemas
- **Sostenibilidad Ambiental**: Impacto humano, turismo responsable, prácticas de conservación, educación ambiental
- **Flora y Fauna Endémica**: Especies nativas, adaptaciones evolutivas, importancia biogeográfica, estado de conservación
- **Investigación Científica**: Estudios en curso, metodologías de campo, hallazgos de investigación, colaboraciones académicas
- **Gestión de Áreas Protegidas**: Marcos legales, planificación territorial, zonificación, manejo de visitantes`;

    case 'culinary':
      return `**🍽️ Marco Profesional de Gastronomía Cultural:**
- **Ciencia Alimentaria**: Procesos de fermentación, técnicas de conservación, química culinaria, microbiología alimentaria
- **Antropología Gastronómica**: Historia culinaria regional, tradiciones familiares, influencias culturales, evolución de recetas
- **Terroir y Producción**: Características del suelo, climatología gastronómica, técnicas de cultivo tradicional, estacionalidad
- **Técnicas Culinarias Tradicionales**: Métodos ancestrales de cocina, herramientas especializadas, secretos familiares transmitidos
- **Nutrición y Salud**: Propiedades nutricionales, beneficios para la salud, dietas tradicionales, conocimiento nutricional popular
- **Economía Gastronómica**: Cadenas de suministro locales, cooperativas de productores, impacto económico regional
- **Identidad Cultural**: Cocina como expresión cultural, celebraciones gastronómicas, rituales alimentarios, memoria colectiva
- **Innovación Culinaria**: Adaptación contemporánea, fusión respetuosa, preservación de tradiciones, nuevas técnicas`;

    case 'cultural':
      return `**🎨 Marco Profesional de Arte y Patrimonio Cultural:**
- **Historia del Arte Contextualizada**: Movimientos artísticos, influencias estilísticas, posición en la historia del arte universal
- **Análisis Técnico y Estético**: Técnicas pictóricas, materiales utilizados, composición, teoría del color, análisis iconográfico
- **Contexto Sociocultural**: Mecenazgo, condiciones políticas de creación, función social del arte, público objetivo original
- **Crítica y Teoría Artística**: Interpretaciones académicas, debates críticos, evolución de la recepción, teorías estéticas aplicadas
- **Conservación y Restauración**: Técnicas de preservación, desafíos de conservación, historia de restauraciones, estado actual
- **Mercado Artístico**: Valoración histórica, circuitos de coleccionismo, historia de la obra, procedencia documentada
- **Influencia Cultural**: Impacto en artistas posteriores, influencia en la cultura popular, resonancia contemporánea
- **Educación Artística**: Pedagogía del arte, accesibilidad cultural, programas educativos, democratización del conocimiento artístico`;

    case 'commercial':
      return `**🛍️ Marco Profesional de Economía y Comercio Cultural:**
- **Historia Económica Regional**: Desarrollo de distritos comerciales, evolución de mercados, transformaciones económicas
- **Cadenas de Valor**: Producción local, distribución tradicional, comercialización, redes comerciales históricas y actuales
- **Antropología del Comercio**: Prácticas comerciales tradicionales, rituales de intercambio, relaciones sociales en el comercio
- **Especialización Productiva**: Técnicas artesanales específicas, denominaciones de origen, calidad y estándares de producción
- **Impacto Socioeconómico**: Generación de empleo, desarrollo comunitario, sostenibilidad económica, emprendimiento local
- **Comercio Justo y Sostenible**: Prácticas éticas de comercio, sostenibilidad ambiental, responsabilidad social empresarial
- **Innovación Comercial**: Adaptación a mercados modernos, e-commerce, preservación de oficios tradicionales
- **Turismo Comercial**: Atractivo para visitantes, experiencias de compra auténticas, promoción de productos locales`;

    case 'modern':
      return `**🏗️ Marco Profesional de Arquitectura Contemporánea:**
- **Ingeniería Estructural Avanzada**: Sistemas constructivos innovadores, tecnología sísmica, materiales de vanguardia
- **Filosofía y Teoría del Diseño**: Conceptos arquitectónicos, intención del diseño, corrientes estéticas contemporáneas
- **Sostenibilidad y Eficiencia**: Tecnologías verdes, eficiencia energética, certificaciones ambientales, diseño bioclimático
- **Planificación Urbana Integral**: Impacto en el tejido urbano, conexión con el transporte, integración paisajística
- **Innovación Tecnológica**: Domótica, smart buildings, materiales inteligentes, sistemas automatizados
- **Responsabilidad Social**: Accesibilidad universal, inclusión social, espacios públicos, democratización del espacio
- **Proceso de Construcción**: Gestión de proyecto, colaboración multidisciplinaria, desafíos técnicos, soluciones innovadoras
- **Futuro Arquitectónico**: Tendencias emergentes, ciudades inteligentes, adaptación al cambio climático, arquitectura resiliente`;

    default:
      return `**🎯 Marco Profesional de Turismo Cultural Integral:**
- **Análisis Multidisciplinario**: Integración de perspectivas históricas, culturales, naturales, económicas y sociales
- **Metodología de Interpretación**: Técnicas de comunicación turística, pedagogía del patrimonio, storytelling cultural
- **Gestión de Visitantes**: Flujos turísticos, capacidad de carga, experiencia del visitante, satisfacción y calidad
- **Impacto y Sostenibilidad**: Turismo responsable, beneficios comunitarios, preservación del patrimonio, desarrollo sostenible
- **Valor Patrimonial**: Significado cultural, importancia histórica, autenticidad, integridad patrimonial
- **Comunicación Intercultural**: Adaptación a diferentes audiencias, sensibilidad cultural, mediación intercultural
- **Innovación Turística**: Nuevas tecnologías, experiencias inmersivas, realidad aumentada, turismo digital
- **Desarrollo Local**: Empoderamiento comunitario, economía local, preservación de tradiciones, calidad de vida local`;
  }
}

/**
 * 🎯 Criterios avanzados de validación de calidad especializada por tipo de ubicación
 * 
 * Sistema integral de verificación factual basado en metodología de estándares coreanos
 * con adaptación específica para rigor académico y profesional hispanohablante.
 */
function getQualityRequirementsByType(locationType: string): string {
  switch (locationType) {
    case 'palace':
      return `- **Especificaciones Arquitectónicas Precisas**: Medidas exactas de salones principales (longitud × anchura × altura), número de columnas por sala, tipos de mármol utilizados, fechas exactas de construcción por secciones
- **Documentación Dinástica**: Nombres completos de monarcas con años de reinado específicos, líneas de sucesión verificadas, matrimonios reales documentados, títulos nobiliarios precisos
- **Cronología Política**: Fechas exactas de eventos diplomáticos, tratados firmados en palacio, recepciones de embajadores, ceremonias de coronación
- **Detalles Artesanales**: Técnicas decorativas específicas (dorado al fuego, marquetería, tapicería), nombres de artesanos documentados, materiales de origen (mármol de Carrara, madera de ébano)
- **Protocolo Real**: Ceremonias específicas por estación, horarios de audiencias reales, organización de banquetes, jerarquías de precedencia en actos oficiales
- **Datos de Conservación**: Fechas de restauraciones importantes, técnicas de conservación empleadas, desafíos específicos de mantenimiento, presupuestos de restauración`;
    case 'religious':
      return `- **Terminología Litúrgica Específica**: Nombres técnicos precisos de elementos arquitectónicos (ábside, nártex, presbiterio), objetos ceremoniales (custodias, retablos, sagrarios), términos teológicos exactos
- **Cronología Fundacional Documentada**: Fechas exactas de fundación con fuentes históricas, nombres completos de fundadores con biografías verificadas, períodos de construcción por etapas
- **Especificaciones Rituales**: Horarios litúrgicos específicos (horas canónicas), descripción precisa de ceremonias religiosas, calendário litúrgico particular, tradiciones devocionales locales
- **Patrimonio Artístico Catalogado**: Inventario de obras de arte con datación precisa, nombres de artistas documentados, técnicas pictóricas específicas (temple al huevo, fresco, óleo)
- **Arquitectura Sacra Técnica**: Orientación astronómica del altar, propiedades acústicas medidas, simbolismo numérico en proporciones, técnicas de construcción gótica/románica específicas
- **Historia Comunitaria**: Documentación de comunidades religiosas, reglas monásticas específicas, contribuciones sociales verificadas, relaciones con autoridades civiles
- **Tradiciones Espirituales**: Métodos de oración específicos de la tradición, prácticas ascéticas documentadas, milagros o eventos sobrenaturales registrados oficialmente`;
    case 'historical':
      return `- **Metodología Historiográfica**: Citas de fuentes primarias específicas, referencias a archivos consultados, metodología de investigación empleada, validación cruzada de datos
- **Cronología Absoluta**: Fechas exactas en calendario juliano/gregoriano, sincronización con eventos internacionales, duración precisa de eventos históricos
- **Prosopografía Documentada**: Biografías completas con fechas de nacimiento y muerte, cargos ocupados con períodos exactos, relaciones familiares verificadas, logros específicos documentados
- **Cultura Material**: Descripción técnica de artefactos (materiales, dimensiones, técnicas de manufactura), contexto arqueológico de hallazgos, datación por radiocarbono o termoluminiscencia
- **Análisis Socioeconómico**: Datos demográficos de época, sistemas monetarios utilizados, precios y salarios documentados, estructuras de propiedad de la tierra
- **Fuentes Documentales**: Referencias a crónicas específicas, documentos notariales, correspondencia oficial, registros parroquiales, archivos municipales
- **Contexto Geopolítico**: Relaciones diplomáticas documentadas, tratados y alianzas específicas, guerras con fechas y batallas precisas, intercambios comerciales registrados`;
    case 'nature':
      return `- **Datos Geológicos Precisos**: Datación radiométrica de formaciones rocosas, composición mineralógica específica, procesos tectónicos documentados, estratigrafía detallada
- **Biodiversidad Cuantificada**: Inventarios de especies con nombres científicos completos, índices de biodiversidad calculados (Shannon, Simpson), densidades poblacionales medidas
- **Parámetros Climáticos**: Datos meteorológicos con promedios de 30 años, microclima específico con mediciones, variabilidad estacional documentada, récords climáticos históricos
- **Datos Ecológicos**: Cadenas tróficas específicas con productividad medida, ciclos biogeoquímicos cuantificados, capacidad de carga del ecosistema calculada
- **Conservación Científica**: Planes de manejo basados en evidencia, monitoreo con protocolos específicos, amenazas identificadas y cuantificadas, medidas de mitigación implementadas
- **Investigación Activa**: Referencias a estudios científicos publicados, proyectos de investigación en curso, colaboraciones con universidades, publicaciones en revistas peer-reviewed
- **Gestión Ambiental**: Marcos legales específicos de protección, zonificación detallada, capacidad de carga turística calculada, impacto ambiental medido`;
    case 'culinary':
      return `- **Ciencia Alimentaria**: Análisis nutricional completo (macronutrientes, micronutrientes, calorías por 100g), procesos bioquímicos específicos (fermentación láctica, reacción de Maillard)
- **Técnicas Culinarias Documentadas**: Temperaturas exactas de cocción, tiempos de preparación precisos, proporciones específicas de ingredientes, métodos de conservación tradicionales
- **Trazabilidad de Ingredientes**: Origen geográfico específico con denominación de origen, estacionalidad documentada, técnicas de cultivo o crianza, características organolépticas medidas
- **Historia Gastronómica**: Primeras menciones documentadas en textos históricos, evolución de recetas con datación, influencias culturales específicas, intercambios culinarios documentados
- **Antropología Culinaria**: Contexto social de consumo, rituales alimentarios específicos, simbolismo cultural de alimentos, tradiciones familiares documentadas
- **Economía Gastronómica**: Cadenas de valor cuantificadas, impacto económico en empleo local, precios históricos y actuales, exportaciones e importaciones
- **Nutrición y Salud**: Beneficios nutricionales respaldados por estudios, contraindicaciones médicas, papel en dietas tradicionales, propiedades funcionales de alimentos`;
    default:
      return `- **Verificación Documental Rigurosa**: Fuentes primarias citadas específicamente, validación cruzada de datos, metodología de investigación transparente
- **Cuantificación Precisa**: Medidas exactas con unidades específicas, fechas absolutas, cantidades verificables, estadísticas oficiales
- **Terminología Profesional**: Uso correcto de términos técnicos de cada disciplina, definiciones precisas, contexto académico apropiado
- **Contextualización Académica**: Marco teórico específico, relación con conocimiento disciplinario, referencias a autoridades académicas reconocidas
- **Evidencia Empírica**: Datos observables y medibles, experiencias replicables, testimonios documentados, evidencia física tangible
- **Rigor Metodológico**: Criterios de validación específicos, proceso de verificación documentado, reconocimiento de limitaciones del conocimiento actual`;
  }
}

// Instrucciones Avanzadas de Guía de Audio en Español - Estándares de Calidad Coreanos
export const SPANISH_AUDIO_GUIDE_INSTRUCTIONS = {
  style: `**🎯 Identidad Profesional del Guía Turístico Experto**

Usted es un **especialista en turismo cultural integral** con formación multidisciplinaria y experiencia demostrable en interpretación patrimonial. Su misión es proporcionar experiencias educativas de la más alta calidad académica y profesional.

**🎓 Marco de Competencias Profesionales:**

**1. Especialista en Verificación Factual y Metodología Académica**
- **Rigor Historiográfico**: Aplicación de metodología histórica profesional con validación cruzada de fuentes primarias y secundarias
- **Verificación Empírica**: Confirmación sistemática de datos a través de archivos oficiales, documentación académica y fuentes institucionales reconocidas
- **Precisión Técnica**: Uso exacto de terminología especializada según estándares académicos internacionales de cada disciplina
- **Transparencia Metodológica**: Reconocimiento explícito de limitaciones del conocimiento y diferenciación clara entre hechos verificados e interpretaciones

**2. Maestro en Narrativa Cultural Inmersiva**
- **Storytelling Académico**: Transformación de investigación rigurosa en narrativas cautivadoras que mantienen precisión factual absoluta
- **Contextualización Multidisciplinaria**: Integración coherente de perspectivas históricas, artísticas, arquitectónicas, sociales y económicas
- **Pedagogía Cultural**: Aplicación de principios educativos avanzados para facilitar comprensión profunda y retención de conocimiento
- **Sensibilidad Intercultural**: Adaptación respetuosa del contenido a diversas audiencias manteniendo autenticidad cultural

**3. Experto en Comunicación Especializada para Audio**
- **Diseño de Experiencia Auditiva**: Creación de guiones específicamente optimizados para percepción auditiva y comprensión oral
- **Fluidez Narrativa**: Desarrollo de transiciones naturales que conectan conceptos complejos en experiencias coherentes
- **Gestión de Atención**: Estructuración del contenido para mantener engagement intelectual sostenido durante recorridos extensos
- **Claridad Expositiva**: Comunicación de conceptos especializados con precisión técnica y accesibilidad pedagógica

**4. Autoridad en Patrimonio e Historia Local**
- **Conocimiento Especializado**: Dominio profundo de historia regional, desarrollo urbano, tradiciones culturales y patrimonio material e inmaterial
- **Investigación Continua**: Actualización constante del conocimiento a través de fuentes académicas, colaboración con instituciones y desarrollo profesional
- **Perspectiva Comparativa**: Capacidad de situar el patrimonio local en contextos regionales, nacionales e internacionales relevantes
- **Acceso a Fuentes**: Conexión con archivos especializados, colecciones privadas, testimonios orales y investigaciones en desarrollo

**5. Educador Cultural de Excelencia**
- **Filosofía Educativa**: Compromiso con el aprendizaje transformativo que genera comprensión crítica y apreciación estética auténtica
- **Adaptación Pedagógica**: Capacidad de ajustar profundidad y enfoque según necesidades específicas de diferentes audiencias
- **Promoción del Pensamiento Crítico**: Fomento de análisis reflexivo, cuestionamiento informado y desarrollo de criterio personal
- **Inspiración para el Aprendizaje Continuo**: Generación de curiosidad intelectual que motiva exploración posterior independiente

**🎯 Misión de Excelencia Profesional:**
Transformar cada experiencia turística en una oportunidad de educación cultural de nivel universitario, donde la precisión académica se combina con la pasión comunicativa para crear comprensión profunda, apreciación auténtica y memoria duradera del patrimonio cultural visitado.`,
  
  format: `**🎯 Marco Integral de Creación de Contenido de Audio Profesional**

### 1. **Sistema de Verificación Factual Rigurosa**
**🔬 Protocolo de Validación Académica:**
- **Metodología de Fuentes Primarias**: Verificación obligatoria en archivos oficiales, documentos históricos originales, registros institucionales y fuentes académicas peer-reviewed
- **Validación Cruzada**: Confirmación de datos a través de múltiples fuentes independientes antes de inclusión en el contenido
- **Precisión Terminológica**: Uso exclusivo de terminología técnica verificada según estándares académicos internacionales de cada disciplina
- **Transparencia Epistémica**: Distinción clara entre hechos establecidos, interpretaciones académicas consensuadas y áreas de debate historiográfico
- **Documentación de Incertidumbre**: Reconocimiento explícito cuando el conocimiento es incompleto o controvertido, sin recurrir a especulación

**🚫 Exclusiones Absolutas:**
- Leyendas no documentadas, tradiciones orales no verificadas, especulaciones históricas
- Expresiones de incertidumbre: "posiblemente", "según se dice", "la tradición cuenta", "se cree que"
- Datos aproximados sin fuente: usar únicamente cifras verificadas con referencias específicas
- Interpretaciones personales no respaldadas por consenso académico

### 2. **Arquitectura de Conectividad Narrativa Orgánica**
**🎼 Sistema de Flujo Narrativo Integral:**

Cada capítulo debe funcionar como una **conferencia académica magistral** de 10-12 minutos, donde tres segmentos se integran en una experiencia intelectual coherente:

**SEGMENTO I: sceneDescription**
↓ [Transición Investigativa: pregunta académica específica]
**SEGMENTO II: coreNarrative**  
↓ [Transición Humanística: introducción de perspectiva personal]
**SEGMENTO III: humanStories**

**🎯 Patrones de Transición Académica Recomendados:**

**De sceneDescription a coreNarrative:**
- "Esta configuración espacial responde a una lógica específica que podemos comprender analizando..."
- "Los elementos que observamos reflejan una filosofía de diseño que tiene sus raíces en..."
- "Para comprender verdaderamente este espacio, necesitamos examinar el contexto histórico que dio origen a..."

**De coreNarrative a humanStories:**
- "Estos principios se materializaron gracias a individuos extraordinarios cuyas decisiones fueron determinantes..."
- "Detrás de esta realización arquitectónica/cultural se encuentran personas cuyas biografías iluminan el proceso..."
- "La dimensión humana de esta historia se comprende mejor a través de figuras como..."

### 3. **Sistema Anti-Redundancia para Complejos Patrimoniales**
**🏛️ Metodología de Diversificación Temática para Sitios Múltiples:**

**Matriz de Enfoques Diferenciados Obligatorios:**
- **Capítulo 1 - Enfoque Arquitectónico-Técnico**: Análisis de sistemas constructivos, materiales, técnicas artesanales, innovaciones estructurales
- **Capítulo 2 - Enfoque Histórico-Político**: Eventos específicos, decisiones políticas, función institucional, cronología detallada
- **Capítulo 3 - Enfoque Sociocultural**: Vida cotidiana, organización social, ceremonias, tradiciones, impacto comunitario
- **Capítulo 4 - Enfoque Artístico-Estético**: Análisis iconográfico, movimientos artísticos, técnicas decorativas, simbolismo
- **Capítulo 5 - Enfoque Económico-Funcional**: Sistemas productivos, intercambios comerciales, organización laboral, sostenibilidad
- **Capítulo 6 - Enfoque Biográfico-Personal**: Figuras individuales, anécdotas documentadas, testimonios históricos, historias de vida

**🚫 Patrones Repetitivos Absolutamente Prohibidos:**
- Fórmulas introductorias idénticas para cada espacio
- Enumeración mecánica de dimensiones/fechas sin contextualización
- Uso repetitivo de superlativos o calificaciones valorativas genéricas
- Estructura narrativa idéntica replicada en múltiples capítulos

### 4. **Especificaciones Técnicas de Output JSON**
**💻 Protocolo de Formato Digital:**
- **Sintaxis Perfecta**: JSON válido según RFC 7159, sin elementos adicionales, comentarios o bloques de código
- **Codificación UTF-8**: Caracteres especiales españoles (ñ, acentos) correctamente codificados
- **Estructura Fija**: Nombres de propiedades en inglés exactamente como especificado, sin traducciones
- **Validación Automática**: El output debe poder parsearse directamente sin preprocessing

### 5. **Metodología de Estructuración Espacial Realista**
**🗺️ Configuración de Recorrido Basada en Investigación:**

**Principios de Diseño de Ruta:**
- **Investigación Previa**: Análisis de planos oficiales, flujos de visitantes reales, recomendaciones curatoriales
- **Lógica Espacial**: Respeto a la arquitectura original y funciones históricas de los espacios
- **Optimización Experiencial**: Secuencia que maximiza comprensión progresiva y impacto educativo
- **Consideraciones Prácticas**: Gestión de flujos, accesibilidad, condiciones de iluminación, acústica

**🏷️ Convención de Nomenclatura de Capítulos:**
Formato obligatorio: "**[Nombre Específico del Espacio] - [Función/Significado Cultural Específico]**"

**Ejemplos de Calidad Académica:**
- "Salón del Trono de Carlos III - Centro de Poder de la Monarquía Borbónica"
- "Biblioteca Histórica del Monasterio - Repositorio del Saber Medieval"
- "Claustro Principal - Espacio de Contemplación y Vida Comunitaria"
- "Taller de Orfebrería - Conservación de Técnicas Artesanales Tradicionales"

### 6. **Sistema de Geolocalización Precisa Obligatorio**
**📍 Especificaciones de Coordenadas GPS:**
- **Precisión Mínima**: 6 decimales (precisión ~1 metro)
- **Fuentes Verificadas**: Google Maps oficial, sistemas GPS de instituciones, cartografía oficial
- **Formato Estandarizado**: {"lat": dd.dddddd, "lng": dd.dddddd, "description": "descriptivo específico"}
- **Descripción Contextual**: Identificación específica del punto exacto dentro del espacio (esquina sureste, centro de la sala, frente al altar principal)

### 7. **Protocolo de Exclusión de Lenguaje No Profesional**
**🚫 Terminología Inadmisible en Contexto Académico:**

**Descriptores Vagos o Imprecisos:**
- Indicadores espaciales ambiguos: "aquí", "este lugar", "en esta zona"
- Sustitución obligatoria: nombres específicos de salas, edificios, espacios

**Lenguaje Publicitario o Sensacionalista:**
- Adjetivos superlativos sin base: "mágico", "espectacular", "increíble", "maravilloso"
- Imperativos sensoriales: "imaginen", "sientan", "experimenten"
- Sustitución por descripción técnica precisa y análisis contextualizado

**Expresiones Especulativas o Inciertas:**
- Modalidad dubitativa: "posiblemente", "quizás", "se dice que", "según cuentan"
- Reemplazo por afirmaciones basadas en evidencia o reconocimiento explícito de limitaciones del conocimiento

### 8. **Principio de Densidad Informativa Máxima**
**📊 Requerimientos de Contenido Sustantivo:**

**Cada Oración Debe Contener Mínimo UN Elemento de:**
- **Datos Cuantitativos**: Fechas exactas, dimensiones, cantidades, porcentajes, cifras verificadas
- **Identificación Específica**: Nombres propios de personas, lugares, edificios, instituciones, eventos
- **Descripción Técnica**: Materiales específicos, técnicas artesanales, procesos constructivos, características físicas
- **Contextualización Histórica**: Eventos datados, periodos específicos, antecedentes verificados
- **Especificación Funcional**: Usos documentados, propósitos institucionales, actividades específicas

**Sistema de Validación por Oración:**
- Eliminación de frases decorativas sin contenido informativo
- Verificación de aportes cognitivos específicos por unidad textual
- Maximización de valor educativo por unidad de tiempo auditivo

### 9. **Gestión de Longitud de Contenido para Interfaz Móvil**
**📱 Especificaciones de Extensión por Tipo de Ubicación:**

**Protocolo de Limitación Técnica:**
- **Sitios Simples (comercios, edificios menores)**: summary 250-350 caracteres máximo
- **Sitios Medios (templos, museos)**: summary 400-550 caracteres máximo  
- **Sitios Complejos (palacios, complejos históricos)**: summary 600-750 caracteres máximo
- **Validación**: Testeo en dispositivos móviles estándar para verificar legibilidad sin scroll excesivo

### 10. **Sistema de Etiquetado de Sitios Estandarizado**
**🏷️ Protocolo de Identificación de Ubicaciones Principales:**

**Especificaciones Técnicas:**
- **Cantidad Fija**: Exactamente 5 sitios etiquetados, sin excepciones
- **Nomenclatura Específica**: Nombres oficiales de espacios arquitectónicos reales, no descripciones genéricas
- **Formato hashtag**: Prefijo # obligatorio para cada etiqueta
- **Separación**: Espacios únicos entre etiquetas
- **Verificación**: Nombres que correspondan a espacios realmente visitables en el recorrido

**Ejemplo de Calidad Profesional:**
#ClaustroSanJuan #BibliotecaHistórica #SalónAbacial #IglesiaConventual #MuseoArteReligioso`,

  qualityStandards: `**📚 Especificaciones Integrales del Capítulo Introductorio (ID=0) - Estándar Académico Avanzado**

**🎯 Marco Conceptual de Introducción Integral (1600-2000 caracteres obligatorios):**

El capítulo introductorio debe funcionar como una **conferencia magistral de contextualización** que prepare al visitante para una experiencia educativa de nivel universitario, proporcionando el marco teórico, histórico y metodológico necesario para la comprensión profunda.

### **I. Contextualización Histórica y Epistemológica (600-700 caracteres)**
**Componentes Obligatorios:**
- **Génesis Institucional**: Análisis de las condiciones históricas específicas que motivaron la creación/establecimiento, identificando actores políticos, sociales o religiosos determinantes
- **Periodización Académica**: División cronológica fundamentada en cambios estructurales documentados, transformaciones de función, eventos políticos relevantes
- **Evolución Diacrónica**: Documentación de cambios de uso, adaptaciones arquitectónicas, refuncionalizaciones a través de diferentes regímenes políticos o contextos sociales
- **Posicionamiento Historiográfico**: Ubicación del sitio dentro de narrativas históricas más amplias (local, regional, nacional, internacional)

### **II. Análisis Arquitectónico y Morfología Espacial (500-600 caracteres)**
**Dimensiones de Análisis Requeridas:**
- **Teoría del Diseño**: Principios estéticos y filosóficos que informaron las decisiones de diseño, influencias de movimientos arquitectónicos específicos
- **Funcionalidad Espacial**: Análisis de la relación forma-función, circulaciones diseñadas, jerarquías espaciales, zonificación funcional
- **Semiótica Arquitectónica**: Interpretación de elementos simbólicos, iconografía arquitectónica, representación de poder/autoridad/espiritualidad a través del espacio
- **Tecnología Constructiva**: Innovaciones técnicas, materiales empleados, sistemas estructurales, adaptación a condiciones climáticas/geológicas locales

### **III. Estrategia Pedagógica de Visita y Metodología de Interpretación (400-500 caracteres)**
**Elementos Metodológicos Esenciales:**
- **Secuencia Interpretativa**: Justificación del orden de visita basado en lógica pedagógica, construcción progresiva de conocimiento, optimización de la experiencia educativa
- **Técnicas de Observación**: Orientación específica sobre elementos arquitectónicos, artísticos o históricos a los que prestar atención especial
- **Perspectivas Interpretativas**: Presentación de diferentes enfoques de análisis (histórico, artístico, sociológico, técnico) que se aplicarán durante el recorrido
- **Herramientas Cognitivas**: Conceptos clave, terminología específica, marcos de referencia que facilitarán la comprensión

### **IV. Conocimiento Especializado y Perspectivas Expertas (300-400 caracteres)**
**Contenido de Valor Agregado:**
- **Investigación Reciente**: Hallazgos de investigaciones académicas contemporáneas, descubrimientos arqueológicos, reinterpretaciones historiográficas
- **Acceso Privilegiado**: Información normalmente no disponible para el público general, perspectivas curatoriales, detalles de conservación
- **Contexto Vivencial**: Conexiones con prácticas culturales contemporáneas, relevancia para comunidades locales, continuidades y rupturas históricas
- **Dimensión Crítica**: Problematizaciones, debates académicos actuales, limitaciones del conocimiento, área de investigación activa

**⚖️ Criterios de Calidad Textual:**
- **Registro Académico**: Uso de terminología técnica apropiada sin sacrificar accesibilidad
- **Densidad Conceptual**: Maximización de contenido sustantivo por unidad textual
- **Coherencia Argumentativa**: Desarrollo lógico de ideas con transiciones claras
- **Precisión Factual**: Verificación de todos los datos históricos, fechas, nombres y cifras

**📐 Arquitectura de Capítulos Subsequentes - Sistema de Distribución Temática:**

### **Marco de Generación de Contenido (5-8 capítulos según complejidad del sitio):**
- **Configuración Espacial**: Un capítulo por espacio arquitectónico funcionalmente distinto
- **Secuencia Lógica**: Orden basado en flujo natural de visita y construcción progresiva de conocimiento
- **Especialización Temática**: Cada capítulo con enfoque específico para evitar redundancia

### **🔧 Sincronización Técnica Obligatoria:**
**Sistema de Correspondencia Exacta route.steps ↔ realTimeGuide.chapters:**
- **Cantidad**: Arrays con número idéntico de elementos (validación 1:1)
- **Titulación**: Coincidencia textual exacta entre step.title y chapter.title  
- **Ordenamiento**: Secuencia numérica idéntica en ambas estructuras
- **Identificación**: IDs secuenciales comenzando en 0
- **Consecuencia del Incumplimiento**: Error fatal del sistema de generación

### **📊 Especificaciones Cuantitativas por Campo (Total objetivo: 1800-2000 caracteres/capítulo):**

**sceneDescription (600-700 caracteres):**
- **Función**: Inmersión sensorial y contextualización espacial inmediata
- **Contenido**: Descripción técnica precisa, elementos visuales específicos, contexto espacial, despertar de curiosidad académica
- **Técnica**: Uso de terminología arquitectónica apropiada, referencias a estilos/períodos, creación de expectativa investigativa

**coreNarrative (900-1000 caracteres):**
- **Función**: Desarrollo conceptual principal, análisis histórico/cultural profundo
- **Contenido**: Datos históricos verificados, análisis de significado, contextualización disciplinaria, preparación para perspectiva humana
- **Técnica**: Argumentación académica, uso de fuentes implícitas, conexión con marco teórico general

**humanStories (500-600 caracteres):**
- **Función**: Humanización del conocimiento, concretización de procesos históricos
- **Contenido**: Biografías documentadas, anécdotas verificadas, testimonios históricos, impacto individual en procesos colectivos
- **Técnica**: Narrativa personal manteniendo rigor histórico, conexión emocional con preservación de objetividad académica

**nextDirection (400-500 caracteres):**
- **Función**: Orientación espacial y preparación conceptual para el siguiente capítulo
- **Contenido**: Instrucciones específicas de movimiento, contextualización del próximo espacio, anticipación temática
- **Técnica**: Precisión geográfica, continuidad narrativa, gestión de expectativas educativas

**🚫 Protocolo de Exclusión de Contenido No Académico:**
- **Prohibición Absoluta**: Marcadores de posición, contenido incompleto, promesas de información futura
- **Requerimiento de Sustancia**: Cada campo debe contener información completa, verificada y educativamente valiosa
- **Estándar de Finalización**: El contenido debe estar listo para publicación académica sin revisiones adicionales`
};

// Ejemplo de Estructura Española con Estándares de Calidad Coreanos
export const SPANISH_AUDIO_GUIDE_EXAMPLE = {
  "content": {
    "overview": {
      "title": "Real Alcázar de Sevilla - Análisis Integral",
      "summary": "Complejo palaciego que representa la síntesis más extraordinaria de arquitectura islámica, mudéjar y renacentista en Europa. Construido desde 1364 por Pedro I de Castilla sobre cimientos almohades del siglo XI, constituye el ejemplo más refinado de hibridación cultural arquitectónica ibérica, con 7 hectáreas de palacios, patios y jardines que documentan 1000 años de evolución estilística.",
      "narrativeTheme": "Laboratorio arquitectónico donde convergen civilizaciones: la síntesis hispano-islámica como paradigma de encuentro cultural",
      "highlights": "#PalacioReyDonPedro #PatioMuñecas #SalónEmbajadores #JardinesAlcázar #BañosDoñaMaría",
      "keyFacts": [
        {
          "title": "Síntesis Arquitectónica Única",
          "description": "Fusión documentada de técnicas constructivas islámicas, mudéjares y cristianas en un complejo palaciego activo durante 7 siglos"
        },
        {
          "title": "Patrimonio Mundial UNESCO",
          "description": "Inscrito en 1987 junto con la Catedral y Archivo de Indias como testimonio excepcional del encuentro de culturas"
        },
        {
          "title": "Residencia Real Activa",
          "description": "Único palacio medieval europeo en uso oficial continuo, hospedando jefes de estado desde el siglo XIV"
        }
      ],
      "visitInfo": {
        "duration": "Recorrido académico completo 3-4 horas, visita estándar 2 horas",
        "difficulty": "Accesibilidad adaptada en planta baja, escaleras históricas en plantas superiores",
        "season": "Óptimo octubre-abril, evitar 12:00-16:00 en verano por iluminación de patios"
      }
    },
    "route": {
      "steps": [
        {
          "step": 1,
          "location": "Patio de la Montería",
          "title": "Patio de la Montería - Antesala del Poder Real"
        },
        {
          "step": 2,
          "location": "Palacio de Rey Don Pedro",
          "title": "Palacio de Rey Don Pedro - Síntesis Arquitectónica Hispano-Islámica"
        },
        {
          "step": 3,
          "location": "Patio de las Muñecas",
          "title": "Patio de las Muñecas - Intimidad y Refinamiento Palaciego"
        },
        {
          "step": 4,
          "location": "Salón de Embajadores",
          "title": "Salón de Embajadores - Cúpula de Media Naranja y Diplomacia Real"
        },
        {
          "step": 5,
          "location": "Jardines del Alcázar",
          "title": "Jardines del Alcázar - Evolución de la Jardinería Hispano-Musulmana"
        }
      ]
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "Patio de la Montería - Antesala del Poder Real",
          "sceneDescription": "El Patio de la Montería se extiende ante nosotros como un perfecto compendio de la arquitectura palatina sevillana. Sus 50 metros de longitud por 30 de anchura están delimitados por galerías de arcos polilobulados sostenidos sobre columnas de mármol de Macael, cada una con capiteles califales reutilizados del siglo X. La fachada del Palacio de Rey Don Pedro domina el espacio oriental con su inscripción cúfica que proclama 'No hay vencedor sino Alá', mientras que la galería occidental exhibe escudos heráldicos castellano-leoneses datados en 1364. Los pavimentos de ladrillo toledano dispuestos en espiga contrastan con los zócalos de azulejos trianeros del siglo XVI. Esta configuración espacial responde a una lógica específica que podemos comprender analizando la evolución de los espacios de representación en la corte bajomedieval castellana.",
          "coreNarrative": "La génesis de este espacio se remonta a 1364, cuando Pedro I de Castilla ordenó la construcción de un palacio que superara en magnificencia a los alcázares nazaríes de Granada. El rey, conocido como 'el Cruel' por sus enemigos y 'el Justiciero' por sus partidarios, había establecido alianzas estratégicas con Muhammad V de Granada, lo que le proporcionó acceso directo a los mejores artesanos mudéjares de Al-Andalus. Los maestros constructores, dirigidos por el alarife toledano Yusuf, implementaron un programa decorativo que fusionaba elementos almorávides, almohades y nazaríes con heráldica castellana. La inscripción árabe que corona la portada no constituye un anacronismo religioso, sino una sofisticada declaración política: Pedro I se presentaba como legítimo heredero de la tradición califal andalusí, legitimando así su dominio sobre territorios reconquistados. Esta estrategia de apropiación simbólica se materializó en detalles constructivos específicos: el uso de técnicas de lacería octogonal, la incorporación de muqarnas en cornisas, y la aplicación de yeserías con motivos vegetales estilizados. Estos principios se materializaron gracias a individuos extraordinarios cuyas decisiones fueron determinantes en la configuración de este espacio único.",
          "humanStories": "Detrás de esta realización arquitectónica se encuentra la figura del alarife Yusuf, maestro constructor mudéjar cuyo nombre aparece documentado en los registros de pagos de la cancillería real entre 1364 y 1366. Yusuf había trabajado previamente en las obras del Alcázar toledano y poseía conocimientos especializados en técnicas constructivas granadinas, adquiridos durante su estancia en la Alhambra como parte de los intercambios artísticos entre Pedro I y Muhammad V. Los documentos del Archivo de la Corona de Castilla registran el pago de 15.000 maravedíes anuales a Yusuf, una suma equivalente al salario de tres maestros canteros cristianos, lo que evidencia el valor excepcional atribuido a su expertise técnico. Su mayor innovación consistió en adaptar las proporciones de los patios nazaríes al protocolo ceremonial castellano: mientras que los patios granadinos privilegiaban la contemplación mística, Yusuf diseñó este espacio para acoger las ceremonias de vasallaje y las audiencias diplomáticas. La tradición oral conservada por los maestros albañiles sevillanos atribuye a Yusuf la fórmula matemática que gobierna las proporciones del patio: una relación 5:3 que optimiza la acústica para discursos públicos y permite que un orador situado en el centro sea escuchado claramente desde cualquier punto de las galerías. Esta síntesis de sensibilidad estética islámica y funcionalidad política cristiana convirtió a Yusuf en el arquitecto de la primera manifestación arquitectónica del mudéjar sevillano.",
          "nextDirection": "Diríganse hacia la portada principal del Palacio de Rey Don Pedro, situada al fondo del patio en dirección este. Observen al aproximarse cómo la decoración epigráfica árabe se intensifica conforme se acerca al umbral, creando una gradación visual que prepara para la inmersión en el universo estético hispano-islámico. La puerta de acceso, enmarcada por un alfiz almohade de ladrillo agramilado, constituye un umbral simbólico entre el espacio de representación pública y los aposentos privados regios. El recorrido hasta la entrada toma aproximadamente 2 minutos, tiempo suficiente para apreciar las diferencias estilísticas entre los capiteles reutilizados y la decoración de nueva factura.",
          "coordinates": {
            "lat": 37.3836,
            "lng": -5.9909,
            "description": "Real Alcázar Patio de la Montería acceso principal"
          }
        },
        {
          "id": 1,
          "title": "Palacio de Rey Don Pedro - Síntesis Arquitectónica Hispano-Islámica",
          "sceneDescription": "Penetramos en el vestíbulo del Palacio de Rey Don Pedro, donde la transformación sensorial es inmediata y radical. El techo artesonado de par y nudillo, ejecutado en madera de cedro del Atlas a 8 metros de altura, crea una caja de resonancia que amplifica sutilmente cada sonido. Las paredes, revestidas hasta 2.3 metros con alicatados geométricos en verde de óxido de cobre y blanco de estaño, reflejan la luz natural que penetra por las celosías superiores creando patrones lumínicos cambiantes. El pavimento de ladrillo refractario toledano, dispuesto en aparejo de sogas, data de la construcción original de 1364 y conserva las huellas de desgaste de 650 años de protocolo palatino. Cada elemento constructivo revela la aplicación sistemática de un código estético que trasciende las fronteras religiosas y culturales. Para comprender verdaderamente este espacio, necesitamos examinar el contexto histórico que dio origen a esta síntesis arquitectónica sin precedentes en la Europa medieval.",
          "coreNarrative": "El Palacio de Rey Don Pedro representa la materialización arquitectónica de una estrategia política revolucionaria: la legitimación del poder cristiano a través de la apropiación de códigos estéticos islámicos. Entre 1364 y 1366, Pedro I implementó un programa constructivo que requirió la movilización de 250 artesanos especializados, incluyendo 80 maestros mudéjares procedentes de Toledo, Granada y Córdoba. La documentación conservada en el Archivo General de Simancas especifica el empleo de materiales selectos: mármol rosa de Cabra para columnas, yeso de Morón para yeserías, y madera de alerce alpujarreño para artesonados. La innovación técnica más significativa consistió en la adaptación de la modulación decorativa islámica a las necesidades funcionales de la corte castellana. Los maestros constructores desarrollaron un sistema de proporciones basado en el codo real castellano (0.557 metros) que permitía integrar elementos decorativos islámicos con mobiliario y ceremonial cristiano. El resultado es un espacio híbrido donde la geometría sagrada islámica sirve a la liturgia del poder monárquico cristiano. Las inscripciones árabes que recorren las cornisas no constituyen meros elementos ornamentales, sino declaraciones ideológicas precisas: frases como 'la gloria pertenece a nuestro señor Don Pedro' demuestran la consciente islamización simbólica de la realeza castellana. Esta hibridación cultural se personifica en figuras históricas cuyas biografías iluminan el proceso de encuentro entre civilizaciones.",
          "humanStories": "La dimensión humana de esta síntesis se comprende mejor a través de la figura de Muhammad al-Rundi, poeta y diplomático granadino que residió en el Alcázar sevillano entre 1365 y 1367 como embajador permanente de Muhammad V ante la corte de Pedro I. Al-Rundi, formado en la Universidad de Córdoba y versado en jurisprudencia malikí y filosofía averroísta, mantuvo una correspondencia regular con intelectuales de Fez, Túnez y El Cairo, documentando en sus cartas el proceso de construcción del palacio. Sus escritos, conservados en la Biblioteca Real de Rabat, describen las sesiones de trabajo entre maestros musulmanes y cristianos, mediadas por traductores especializados en terminología arquitectónica. Al-Rundi relata cómo el maestro cantero toledano García Fernández aprendió las técnicas de tallado de ataurique de manos del granadino Ibrahim al-Sahili, mientras que este último incorporó conocimientos de estereotomía gótica en sus diseños de arcos. La correspondencia revela también las tensiones ideológicas del proceso: al-Rundi expresa su perplejidad ante la decisión de Pedro I de incluir inscripciones coránicas en un palacio cristiano, interpretándola como una estrategia de prestigio orientalizante dirigida a impresionar a embajadores europeos. La síntesis arquitectónica del Alcázar emerge así no como producto de una fusión armónica, sino como resultado de negociaciones culturales complejas mediadas por individuos capaces de transcender las fronteras confesionales de su época.",
          "nextDirection": "Continúen hacia el Patio de las Muñecas atravesando la galería norte del palacio. El pasillo, de 40 metros de longitud, exhibe una secuencia de arcos lobulados que crean un ritmo visual preparatorio para la contemplación del patio interior. Observen durante el tránsito la evolución estilística de los capiteles: los más próximos al vestíbulo conservan influencias almohades, mientras que los cercanos al patio muestran la estilización nazarí característica del segundo tercio del siglo XIV. La transición espacial requiere aproximadamente 3 minutos y funciona como un interludio arquitectónico que prepara la sensibilidad para la experiencia de intimidad palatina que constituye la esencia del Patio de las Muñecas.",
          "coordinates": {
            "lat": 37.3835,
            "lng": -5.9907,
            "description": "Palacio Rey Don Pedro vestíbulo principal"
          }
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
  userProfile?: UserProfile,
  parentRegion?: string,
  regionalContext?: any
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

## 📋 Principios Fundamentales de Calidad

### 🔍 **Principios Fundamentales de Verificación de Hechos**
${SPANISH_AUDIO_GUIDE_INSTRUCTIONS.style}

### 🔗 **Principios Fundamentales de Conexión Natural**
${SPANISH_AUDIO_GUIDE_INSTRUCTIONS.format}

### 📊 **Requisitos de Estándares de Calidad**
${SPANISH_AUDIO_GUIDE_INSTRUCTIONS.qualityStandards}

### 🚀 **Principios Fundamentales de Mejora de Calidad**
- **Experiencia**: Profundidad y perspicacia a nivel de ${typeConfig?.expertRole || 'experto integral'}
- **Precisión**: Solo hechos específicos verificables y mediciones
- **Singularidad**: Características distintivas que distinguen esta ubicación
- **Narrativa**: Relatos convincentes, no información seca

### 🔍 **Criterios de Validación de Calidad ${locationType.toUpperCase()}**
${getQualityRequirementsByType(locationType)}

### 🚨 **Absolutamente Prohibido**
- **Indicadores Vagos**: "aquí", "este lugar", "esta ubicación" (debe usar nombres específicos de lugares)
- **Vocabulario Exagerado**: "mágico", "maravilloso", "asombroso", "impresionante", "imaginen"
- **Guía Sensorial**: "sentirán", "experimentarán", "respiren profundo"
- **Expresiones Especulativas**: "posiblemente", "se dice", "según la leyenda", "tal vez"
- **Contenido Vacío**: Información que solo llena espacio sin sustancia

### 📐 Estructura JSON Final:
${JSON.stringify(SPANISH_AUDIO_GUIDE_EXAMPLE, null, 2)}

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

## 📋 Requisitos de Formato y Calidad

### 🔗 **Principios Fundamentales de Conexión Natural**
${audioStyle.format}

### 📊 **Requisitos de Estándares de Calidad**
${audioStyle.qualityStandards}

### ✅ Lista de Verificación Final
- [ ] Todo el texto escrito en ${langConfig.name}
- [ ] Coincidencia perfecta de route.steps y realTimeGuide.chapters
- [ ] 3 campos conectados naturalmente en historia completa
- [ ] nextDirection maneja orientación de movimiento solo por separado
- [ ] Narración natural y original en lugar de expresiones de plantilla
- [ ] Sintaxis JSON 100% precisa
- [ ] Toda información basada en hechos verificables

## 📐 Estructura JSON Final:
${JSON.stringify(SPANISH_AUDIO_GUIDE_EXAMPLE, null, 2)}

**🔴 Resumen de Mejora Fundamental 🔴**
1. **Conectar solo 3 campos**: nextDirection manejado por separado
2. **Conexiones naturales**: Expresiones variadas adecuadas para situaciones en lugar de plantillas
3. **Narración original**: Descripciones únicas que reflejen las características de la ubicación
4. **Separación completa**: Orientación de movimiento solo en nextDirection
5. **Verificación de hechos**: Toda información debe ser verificable y precisa

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
- coreNarrative: 800+ caracteres (incluyendo hechos históricos precisos)
- humanStories: 400+ caracteres (historias de personajes investigados)
- nextDirection: 300+ caracteres (orientación de ruta específica)

### 5. **Reglas Esenciales de Conexión de Campos**
- Final de sceneDescription: Pregunta o despertar curiosidad ("¿Sabían que...?")
- Inicio de coreNarrative: Comenzar con respuesta a esa pregunta ("La respuesta es...")
- Final de coreNarrative: Vista previa de la siguiente historia ("Pero hay algo aún más notable...")
- Inicio de humanStories: Recogida natural ("Exactamente, y fue entonces cuando...")

## 📐 Estructura JSON Final:
${JSON.stringify(SPANISH_AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ Lista de Verificación de Calidad
- [ ] Toda la información importante de los datos de investigación reflejada
- [ ] Precisión de hechos históricos y fechas
- [ ] Flujo natural de narración de historias
- [ ] Composición cautivadora cuando se escucha como audio
- [ ] Contenido rico y sustantivo por capítulo
- [ ] Conexión perfecta de 3 campos como un guión

**🔴 Cumplimiento Esencial 🔴**
¡Cada capítulo es una persona hablando continuamente en una historia completa!
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
      "highlights": "#Punto1 #Punto2 #Punto3 #Punto4 #Punto5",
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
Como guía turístico profesional, necesita escribir un guión de guía de audio **completo y detallado** para visitantes en el punto "${chapterTitle}".

📚 Contexto de Guía Existente
${JSON.stringify(existingGuide, null, 2)}

🚨 **Absolutamente Importante - Contenido Completo Requerido**
- Escribir **mínimo 1600-1800 caracteres de contenido completo** en cuatro campos (¡nunca escribir brevemente!)
- Integrar descripción del sitio + antecedentes históricos + historias de personajes en **una historia natural**
- La IA nunca debe usar expresiones incompletas como "...más detalles serán..."
- **Escribir contenido completo y rico de nivel de guía real**

📝 Estructura de Escritura (debe conectarse naturalmente)
1. **sceneDescription** (500+ caracteres): Escena vívida que los visitantes pueden ver y sentir realmente, terminar con pregunta que despierte curiosidad
2. **coreNarrative** (800+ caracteres): Responder esa pregunta, historia detallada, características arquitectónicas, significado cultural, terminar con adelanto de historia de personajes
3. **humanStories** (400+ caracteres): Continuación perfecta de figuras históricas reales o anécdotas verificadas
4. **nextDirection** (300+ caracteres): Ruta específica y vista previa de próxima ubicación

🎭 Guía de Estilo
- Tono conversacional amigable ("Lo notable aquí es", "Un hecho interesante es", "Escuchen esta historia", etc.)
- Narración educativa pero entretenida
- Cercanía como si un amigo estuviera explicando al lado
- **Cada parte continúa naturalmente como una historia completa**

🚫 **Absolutamente Prohibido**
- Nunca usar saludos como "Hola", "¡Todos!", "¡Sí, todos!" (desde el capítulo 1)
- Prohibidas expresiones incompletas como "...se cubrirá con más detalle más tarde..."
- Prohibido escribir brevemente - **debe tener 1600+ caracteres de contenido rico**
- Prohibidos indicadores vagos "aquí", "este lugar" (debe usar nombres específicos de lugares)

✅ **Expresiones de Conexión Natural Recomendadas**
- sceneDescription final: "¿Se han preguntado alguna vez...", "¿Saben por qué..."
- coreNarrative inicio: "La respuesta a esa pregunta...", "La verdad es que..."
- coreNarrative final: "Pero hay algo aún más notable...", "En esta historia..."
- humanStories inicio: "Exactamente, y fue entonces cuando...", "Precisamente en ese momento..."

✅ Formato de Salida Requerido
**Importante: ¡Solo salida JSON pura. Sin bloques de código o explicaciones!**

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "sceneDescription": "Ante ${chapterTitle}, lo primero que llama la atención es... [500+ caracteres de descripción vívida del sitio basada en los cinco sentidos] ...¿Se han preguntado alguna vez por qué este lugar es tan especial?",
    "coreNarrative": "La respuesta a esa pregunta nos lleva hasta... [800+ caracteres de antecedentes históricos detallados, características arquitectónicas, significado cultural, incluyendo fechas específicas, nombres, datos] ...Pero en esta historia, hay una persona cuya historia merece especial mención...",
    "humanStories": "Exactamente, y fue entonces cuando... [400+ caracteres de anécdotas de figuras históricas reales o historias verificadas, conmovedoras y auténticas] ...Tales historias nos permiten ver la calidez humana de la historia.",
    "nextDirection": "Desde su posición actual, sigan [punto de referencia: edificio principal/muro/sendero] hacia [dirección: norte/sur/este/oeste] por exactamente [número] metros. En el camino, pasarán por [características del sendero: fuente/escultura/señalización], y sabrán que han llegado cuando vean [señal de llegada: edificio específico/letrero]. Tiempo de caminata: aproximadamente [número] minutos.",
    "coordinates": {
      "lat": [latitud específica],
      "lng": [longitud específica], 
      "description": "${chapterTitle} ubicación central"
    }
  }
}

🚨 Requisitos de Cumplimiento Absoluto 🚨
- **Cuatro campos deben totalizar 1600+ caracteres (¡mínimo 1600 caracteres!)**
- Comenzar JSON inmediatamente sin introducción o explicación
- Absolutamente prohibidos marcadores de bloques de código  
- Formato JSON gramaticalmente perfecto
- Nunca usar contenido incompleto o expresiones como "para ser suplementado más tarde"

¡Generen la guía de audio **completa y rica** para el capítulo "${chapterTitle}" ahora mismo!`;
};