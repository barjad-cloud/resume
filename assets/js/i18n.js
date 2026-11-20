/**
 * @file assets/js/i18n.js
 * @description Contratos canónicos (M_*, T_*) y diccionario bilingüe EN/ES (SSOT).
 * Compatible con GitHub Pages y apertura local file:// mediante <script defer>.
 * Optimizado con I18N_COMUN y captura DOM inicial de tokens ricos en inglés.
 */

/**
 * @typedef {'en' | 'es'} T_Idioma
 * @typedef {'system' | 'light' | 'dark' | 'daniel'} T_Tema
 * @typedef {'full' | 'compact'} T_Densidad
 * @typedef {'sm' | 'md' | 'lg'} T_EscalaTexto
 * @typedef {'section' | 'stack' | 'theme' | 'lang' | 'export' | 'action'} T_TipoComando
 *
 * @typedef {Object} M_ComandoPaleta
 * @property {string} id
 * @property {string} titulo
 * @property {T_TipoComando} categoria
 * @property {string} [atajo]
 * @property {() => void} accion
 * @property {string[]} [tags]
 *
 * @typedef {Object} M_JsonResumeExport
 * @property {string}
 * @property {Object} basics
 * @property {Array<Object>} work
 * @property {Array<Object>} education
 * @property {Array<Object>} skills
 * @property {Array<Object>} languages
 *
 * @typedef {Object} M_SeccionIndice
 * @property {string} id
 * @property {string} etiquetaEn
 * @property {string} etiquetaEs
 * @property {number} orden
 *
 * @typedef {Object} M_ConfigContacto
 * @property {string} nombreCompleto
 * @property {string} nombreVcard
 * @property {string} tituloEn
 * @property {string} tituloEs
 * @property {string[]} telefonoPartes
 * @property {string[]} emailPartes
 * @property {string} linkedinUrl
 * @property {string} githubUrl
 * @property {string} webUrl
 * @property {string} ubicacionEn
 * @property {string} ubicacionEs
 *
 * @typedef {Object} M_EstadoDrawer
 * @property {boolean} abiertoDesktop
 * @property {boolean} abiertoMovil
 * @property {T_Idioma} idioma
 * @property {T_Tema} tema
 * @property {string | null} stackActivo
 * @property {T_Densidad} densidad
 * @property {T_EscalaTexto} escalaTexto
 * @property {boolean} destacarMetricas
 * @property {boolean} noCortarSecciones
 *
 * @typedef {Array<string | ['strong' | 'em', string]>} T_RichTokens
 *
 * @typedef {Object} M_DiccionarioIdioma
 * @property {Record<string, string>} text
 * @property {Record<string, T_RichTokens>} rich
 *
 * @typedef {Object} M_DiccionarioI18n
 * @property {M_DiccionarioIdioma} en
 * @property {M_DiccionarioIdioma} es
 */

(function initResumeI18n(globalScope) {
  'use strict';

  /** @type {M_SeccionIndice[]} */
  const SECCIONES_INDICE = [
    {
      id: 'profile',
      etiquetaEn: 'Executive Profile',
      etiquetaEs: 'Perfil Ejecutivo',
      orden: 1,
    },
    {
      id: 'highlights',
      etiquetaEn: 'Key Highlights',
      etiquetaEs: 'Logros Clave',
      orden: 2,
    },
    {
      id: 'stack',
      etiquetaEn: 'Technical Stack',
      etiquetaEs: 'Stack Técnico',
      orden: 3,
    },
    {
      id: 'experience',
      etiquetaEn: 'Experience',
      etiquetaEs: 'Experiencia',
      orden: 4,
    },
    {
      id: 'projects',
      etiquetaEn: 'Featured Projects',
      etiquetaEs: 'Proyectos',
      orden: 5,
    },
    {
      id: 'education',
      etiquetaEn: 'Education',
      etiquetaEs: 'Formación',
      orden: 6,
    },
    {
      id: 'languages',
      etiquetaEn: 'Languages',
      etiquetaEs: 'Idiomas',
      orden: 7,
    },
  ];

  /** @type {M_ConfigContacto} */
  const CONFIG_CONTACTO = {
    nombreCompleto: 'Daniel Barja Centeno',
    nombreVcard: 'Barja Centeno;Daniel;;;',
    tituloEn: 'Full-Stack Web Developer & Application Analyst',
    tituloEs: 'Desarrollador Web Full-Stack y Analista de Aplicaciones',
    telefonoPartes: ['+34', '601', '732', '537'],
    emailPartes: ['barjad', 'gmail.com'],
    linkedinUrl: 'https://www.linkedin.com/in/daniel-b-351320157/',
    githubUrl: 'https://github.com/barjad-cloud',
    webUrl: 'https://barjad-cloud.github.io/resume/',
    ubicacionEn: 'A Coruña, Galicia, Spain',
    ubicacionEs: 'A Coruña, Galicia, España',
  };

  /** Invariantes lingüísticos compartidos entre EN y ES ([CORE-07]) */
  const I18N_COMUN = {
    'drawer.whatsappBtn': 'WhatsApp',
    'drawer.emailLink': 'Email',
    'drawer.linkedinLink': 'LinkedIn',
    'drawer.githubLink': 'GitHub',
    'header.githubText': 'GitHub',
    'drawer.themeSystem': 'Auto',
    'drawer.scaleSm': 'A-',
    'drawer.scaleMd': 'A',
    'drawer.scaleLg': 'A+',
    'drawer.jsonResumeBtn': 'JSON Resume',
  };

  /** Cadenas reutilizadas intra-idioma para deduplicación máxima */
  const TXT_PRINT_EN = 'Print';
  const TXT_PRINT_ES = 'Imprimir';
  const TXT_DOWNLOAD_PDF_EN = 'Download PDF';
  const TXT_DOWNLOAD_PDF_ES = 'Descargar PDF';
  const TXT_BACK_TO_TOP_EN = 'Back to top';
  const TXT_BACK_TO_TOP_ES = 'Volver arriba';
  const TXT_SEARCH_CMD_EN = 'Search… ⌘K';
  const TXT_SEARCH_CMD_ES = 'Buscar… ⌘K';

  /** @type {M_DiccionarioI18n} */
  const DICCIONARIO = {
    en: {
      text: Object.assign({}, I18N_COMUN, {
        'meta.title': 'Daniel Barja Centeno - Full-Stack Web Developer & Application Analyst',
        'skip.content': 'Skip to resume content',
        'drawer.title': 'Resume Controls',
        'drawer.subtitle': 'Web & Print-Ready',
        'drawer.openBtn': 'Menu',
        'drawer.openAria': 'Open navigation and controls panel',
        'drawer.closeAria': 'Collapse navigation and controls panel',
        'drawer.langLabel': 'Language',
        'drawer.navLabel': 'Sections',
        'drawer.navAria': 'Resume sections index',
        'drawer.collapseAll': 'Collapse all',
        'drawer.expandAll': 'Expand all',
        'drawer.clearStack': 'Clear',
        'drawer.appearanceLabel': 'View & Appearance',
        'drawer.contactLabel': 'Direct Contact',
        'drawer.whatsappBtn': 'WhatsApp',
        'drawer.copyEmailBtn': 'Copy Email',
        'drawer.copyPhoneBtn': 'Copy Phone',
        'drawer.copiedShort': 'Copied',
        'drawer.linkCopiedShort': 'Link copied',
        'drawer.vcardBtn': 'Save Contact (.vcf)',
        'drawer.emailLink': 'Email',
        'drawer.linkedinLink': 'LinkedIn',
        'drawer.githubLink': 'GitHub',
        'drawer.actionsLabel': 'Document',
        'drawer.downloadPdfBtn': 'Download PDF',
        'drawer.printBtn': 'Print',
        'drawer.shareBtn': 'Share',
        'drawer.themeLabel': 'Theme',
        'drawer.themeLight': 'Light',
        'drawer.themeSystem': 'Auto',
        'drawer.themeDark': 'Dark',
        'drawer.themeDaniel': "Daniel's Favourite",
        'drawer.densityLabel': 'View Density',
        'drawer.densityFull': 'Full',
        'drawer.densityCompact': 'Compact',
        'drawer.stackLabel': 'Highlight Stack',
        'drawer.stackAll': 'All',
        'drawer.stackLeadership': 'Leadership',
        'drawer.updatedLabel': 'Updated Nov 2026',
        'contact.whatsappMsg':
          'Hi Daniel, I saw your online resume and would like to get in touch regarding a role or project.',
        'contact.emailSubject': 'Contact regarding your Resume — Daniel Barja Centeno',
        'contact.smsBtn': 'SMS',
        'contact.smsAria': 'Send direct SMS (+34 601 732 537)',
        'contact.smsBody':
          'Hi Daniel, I reviewed your interactive resume and would like to connect.',
        'contact.callBtn': 'Call',
        'contact.callAria': 'Call Daniel Barja (+34 601 732 537)',
        'contact.waBody':
          'Hi Daniel, I reviewed your interactive resume and would like to connect.',
        'stack.noMatches': 'No entries found in this section matching stack: ',
        'stack.resetFilter': 'Reset filter',
        'kpi.counterLabel': 'KPIs found',
        'toast.smsOpened': 'Opening SMS app...',
        'toast.callOpened': 'Starting phone call...',
        'toast.emailCopied': 'Email copied to clipboard',
        'toast.phoneCopied': 'Phone number copied to clipboard',
        'toast.linkCopied': 'Resume link copied to clipboard',
        'toast.copyError': 'Could not copy automatically',
        'toast.vcardDownloaded': 'Contact card (.vcf) downloaded',
        'toast.shared': 'Resume link shared',
        'shell.toggleAria': 'Toggle section visibility',
        'shell.filterPrefix': 'Highlighting stack:',
        'shell.clearFilter': 'Clear filter',
        'shell.matchSingular': 'match',
        'shell.matchPlural': 'matches',
        'shell.backToTop': 'Back to top',
        'shell.backToTopAria': 'Scroll back to top of resume',
        'preview.barAria': 'A4 print preview controls',
        'preview.badge': 'A4 Print Preview',
        'preview.pageWord': 'Page',
        'preview.pagesSingular': 'page',
        'preview.pagesPlural': 'pages',
        'preview.keepSections': 'Keep sections together',
        'preview.keepSectionsAria': 'Avoid splitting sections across pages when possible',
        'preview.downloadBtn': 'Download PDF',
        'preview.printBtn': 'Print',
        'preview.exitBtn': 'Back to normal view',
        'preview.exitAria': 'Exit print preview and return to normal view',
        'header.subtitle': 'Full-Stack Web Developer & Application Analyst',
        'header.location': 'A Coruña, Galicia, Spain',
        'header.availability': 'Availability: Remote (National & International)',
        'header.linkedinText': 'LinkedIn Profile',
        'header.githubText': 'GitHub',
        'header.endorsement':
          '2 Formal Recommendation Letters Available (Software Engineering & Management)',
        'header.photoAlt': 'Daniel Barja Centeno Portrait',
        'header.qrAlt': 'LinkedIn QR Code',
        'header.qrAria': 'Open direct contact & LinkedIn QR code',
        'sec.profile': 'Executive Profile',
        'sec.highlights': 'Key Technical & Leadership Highlights',
        'sec.stack': 'Technical Stack & Core Competencies',
        'sec.experience': 'Professional Experience',
        'sec.projects': 'Featured Software, Data & Digital Projects',
        'sec.education': 'Education & Technical Certifications',
        'sec.languages': 'Languages',
        'stack.domFrontend': 'Frontend Development',
        'stack.plainFrontend': 'Responsive UI/UX Design',
        'stack.domBackend': 'Backend & Languages',
        'stack.domData': 'Databases & BI Analytics',
        'stack.plainData': 'Relational Schema Design · Product Mix (PM) & Statistical Reporting',
        'stack.domTools': 'Version Control & Tools',
        'stack.plainTools': 'Video Production & Editing',
        'stack.domAnalysis': 'Application Analysis',
        'stack.plainAnalysis':
          'Full SDLC · Requirements Gathering · Functional Specification & UAT · Process Digitization · Live On-Site Support · Rapid SLA Hotfixes',
        'stack.domLeadership': 'Leadership & Operations',
        'stack.plainLeadership':
          'Team Leadership (65+ Staff) · Management Training & Onboarding · P&L & Labor Optimization · HACCP (APPCC) Regulatory Compliance',
        'exp.talkk.role': 'Full-Stack Web & Desktop Application Developer / Application Analyst',
        'exp.talkk.date': '2018 – Present',
        'exp.talkk.company': 'Talkk (School of Debate & Oratory) — A Coruña, Spain',
        'exp.talkk.quote':
          '"He has created, designed, developed, and implemented different computer applications for our company, both desktop and web... always demonstrating proactivity, recommending the technologies best suited to our circumstances, and responding to last-minute needs within just a few hours."',
        'exp.talkk.cite': '— Alba Formoso, Director at TALKK',
        'exp.mcdSantiago.role': 'Restaurant Manager & Operations Lead',
        'exp.mcdSantiago.date': 'Oct 2021 – Present',
        'exp.mcdSantiago.company': "McDonald's — Santiago de Compostela, Spain",
        'exp.advisor.role': 'Operational & Business Process Advisor',
        'exp.advisor.date': 'Nov 2017 – Jul 2018',
        'exp.advisor.company':
          'Ágora SL (Dec 2017 – Jul 2018) & Il Mercato Pizzería (Nov 2017 – Jul 2018) — A Coruña, Spain',
        'exp.najoka.role': 'Restaurant General Manager & Systems Supervisor',
        'exp.najoka.date': 'Aug 2004 – Aug 2017',
        'exp.najoka.company': "McDonald's (Najoka, S.L.) — A Coruña & Perillo-Oleiros, Spain",
        'exp.najoka.sub1Title': 'Systems Architecture, Data Analytics & Digital Transformation',
        'exp.najoka.sub2Title': '24/7/365 Leadership & Provincial Management Training Hub',
        'exp.najoka.sub3Title': 'Local Brand Marketing & Multimedia Production',
        'exp.najoka.sub4Title': 'Verified Quantitative Business, Audit & Quality Results',
        'exp.najoka.sub3Bullet':
          'Designed corporate logos for the organization and individual restaurants, large-format outdoor billboards (Alfonso Molina), bus wraps, mupis, flyers, event posters, promotional banners, and promotional video production for the Riazor concerts, while supervising local family and seasonal events.',
        'exp.najoka.quote':
          '"From the initial date he performed in all restaurant functions, from crew member up to reaching the category of General Manager... always showing great capacity for teamwork, excellent disposition toward new challenges and opportunities, adaptability to new tasks and responsibilities, good rapport with the public and colleagues, and trustworthy conduct."',
        'exp.najoka.cite': '— Miguel A. Expósito V., Coordinator at Najoka, S.L.',
        'exp.desktop.role': 'IT Support Technician',
        'exp.desktop.date': 'Jun 2005 – May 2006',
        'exp.desktop.company': 'Desktop Servicios Informáticos — A Coruña, Spain',
        'lang.es.name': 'Spanish',
        'lang.es.level': 'Native',
        'lang.gl.name': 'Galician',
        'lang.gl.level': 'Native',
        'lang.en.name': 'English',
        'lang.en.level': 'Advanced (Professional Working Proficiency)',
        'closing.availability': 'Remote Availability (National & International)',
        'closing.references': '2 Formal Recommendation Letters Available upon Request',
        'closing.webLabel': 'Interactive Web CV:',
        'drawer.scaleLabel': 'Text Size',
        'drawer.scaleSmTitle': 'Compact text (0.94x)',
        'drawer.scaleMdTitle': 'Default text (1.00x)',
        'drawer.scaleLgTitle': 'Large text (1.08x)',
        'drawer.qrBtn': 'Show QR Code',
        'contactModal.title': 'Direct Contact & QR',
        'contactModal.subtitle': "Let's connect! Reach out via your preferred channel:",
        'qr.title': 'LinkedIn Profile QR',
        'qr.desc': 'Scan with your smartphone camera to connect immediately.',
        'qr.closeBtn': 'Close',
        'qr.closeAria': 'Close QR code modal',
        'drawer.exportLabel': 'Export Formats',
        'drawer.jsonResumeAria': 'Download resume in standard JSON Resume v1.0 format',
        'drawer.markdownBtn': 'Copy Markdown',
        'drawer.markdownAria': 'Copy full resume in clean ATS Markdown format',
        'toast.markdownCopied': 'Resume copied to clipboard in ATS Markdown format',
        'toast.jsonDownloaded': 'JSON Resume v1.0 file downloaded',
        'drawer.searchCmd': 'Quick Search',
        'rail.searchCmd': 'Search…',
        'rail.searchCmdAria': 'Open command palette',
        'rail.highlightMetrics': 'Highlight KPIs',
        'palette.title': 'Command Palette',
        'palette.placeholder': 'Type a section, stack skill, action, theme or language...',
        'palette.noResults': 'No matching commands found',
        'palette.closeAria': 'Close command palette',
        'palette.resultsAria': 'Command suggestions',
        'palette.tipNav': 'to navigate',
        'palette.tipSel': 'to select',
        'palette.tipEsc': 'to exit',
        'palette.badgeSection': 'Section',
        'palette.badgeStack': 'Stack',
        'palette.badgeTheme': 'Theme',
        'palette.badgeLang': 'Language',
        'palette.badgeExport': 'Export',
        'palette.badgeAction': 'Action',
        'palette.catSections': 'Sections',
        'palette.catStack': 'Technical Stack',
        'palette.catActions': 'Actions & Exports',
        'palette.catPreferences': 'Preferences',
        'palette.actionAvatar': "View Daniel's Journey (Avatar)",
        'drawer.adventureLabel': 'Journey Avatar',
        'drawer.adventureOn': 'On',
        'drawer.adventureOff': 'Off',
        'drawer.achievementBadge': '100% Explored! Ready to Hire',
        'avatar.speechProfile': 'Hi! Welcome to my engineering journey.',
        'avatar.speechHighlights': 'Delivering high-impact business outcomes (+€229k, +11.4%).',
        'avatar.speechStack': 'Clean architecture, zero-build simplicity & performance.',
        'avatar.speechExperience': '18+ years leading teams & modernizing critical systems.',
        'avatar.speechExperience2':
          'Technical leadership, resilient architectures & continuous delivery.',
        'avatar.speechProjects': 'Transforming business vision into robust production software.',
        'avatar.speechEducation': 'Continuous learning, engineering rigor & perpetual mastery.',
        'avatar.speechLanguages': 'Seamless global collaboration (Native ES / Professional EN).',
        'avatar.completeTitle': 'Mission Accomplished!',
        'avatar.completeDesc': 'Ready to build something great together?',
        'avatar.completeCta': 'Contact Me!',
        'avatar.completeHint': 'Click to get in touch',
        'avatar.easterEgg': 'Keep exploring! Daniel is ready for new engineering challenges.',
      }),
      rich: {}, // Hidratado dinámicamente desde el DOM inicial por f_capturar_en_desde_dom() ([AJUSTE-02], [UNASKED-01])
    },
    es: {
      text: Object.assign({}, I18N_COMUN, {
        'meta.title':
          'Daniel Barja Centeno - Desarrollador Web Full-Stack y Analista de Aplicaciones',
        'skip.content': 'Saltar al contenido del currículum',
        'drawer.title': 'Panel del CV',
        'drawer.subtitle': 'Web e Impresión A4',
        'drawer.openBtn': 'Menú',
        'drawer.openAria': 'Abrir panel de navegación y controles',
        'drawer.closeAria': 'Plegar panel de navegación y controles',
        'drawer.langLabel': 'Idioma',
        'drawer.navLabel': 'Secciones',
        'drawer.navAria': 'Índice de secciones del currículum',
        'drawer.collapseAll': 'Plegar todo',
        'drawer.expandAll': 'Expandir todo',
        'drawer.clearStack': 'Limpiar',
        'drawer.appearanceLabel': 'Vista y Apariencia',
        'drawer.contactLabel': 'Contacto Directo',
        'drawer.whatsappBtn': 'WhatsApp',
        'drawer.copyEmailBtn': 'Copiar Email',
        'drawer.copyPhoneBtn': 'Copiar Tel.',
        'drawer.copiedShort': 'Copiado',
        'drawer.linkCopiedShort': 'Enlace copiado',
        'drawer.vcardBtn': 'Guardar Contacto (.vcf)',
        'drawer.emailLink': 'Email',
        'drawer.linkedinLink': 'LinkedIn',
        'drawer.githubLink': 'GitHub',
        'drawer.actionsLabel': 'Documento',
        'drawer.downloadPdfBtn': 'Descargar PDF',
        'drawer.printBtn': 'Imprimir',
        'drawer.shareBtn': 'Compartir',
        'drawer.themeLabel': 'Tema',
        'drawer.themeLight': 'Claro',
        'drawer.themeSystem': 'Auto',
        'drawer.themeDark': 'Oscuro',
        'drawer.themeDaniel': 'Favorito Daniel',
        'drawer.densityLabel': 'Densidad',
        'drawer.densityFull': 'Completa',
        'drawer.densityCompact': 'Compacta',
        'drawer.stackLabel': 'Resaltar Stack',
        'drawer.stackAll': 'Todo',
        'drawer.stackLeadership': 'Liderazgo',
        'drawer.updatedLabel': 'Actualizado Nov 2026',
        'contact.whatsappMsg':
          'Hola Daniel, he visto tu currículum online y me gustaría ponerme en contacto contigo por una oportunidad o proyecto.',
        'contact.emailSubject': 'Contacto sobre tu Currículum — Daniel Barja Centeno',
        'contact.smsBtn': 'SMS',
        'contact.smsAria': 'Enviar SMS directo (+34 601 732 537)',
        'contact.smsBody':
          'Hola Daniel, he visto tu CV interactivo y me gustaría contactar contigo.',
        'contact.callBtn': 'Llamar',
        'contact.callAria': 'Llamar a Daniel Barja (+34 601 732 537)',
        'contact.waBody':
          'Hola Daniel, he visto tu CV interactivo y me gustaría contactar contigo.',
        'stack.noMatches': 'Sin coincidencias en esta sección para el stack: ',
        'stack.resetFilter': 'Restablecer filtro',
        'kpi.counterLabel': 'KPIs detectados',
        'toast.smsOpened': 'Abriendo app de SMS...',
        'toast.callOpened': 'Iniciando llamada...',
        'toast.emailCopied': 'Correo electrónico copiado',
        'toast.phoneCopied': 'Teléfono copiado al portapapeles',
        'toast.linkCopied': 'Enlace del currículum copiado',
        'toast.copyError': 'No se pudo copiar automáticamente',
        'toast.vcardDownloaded': 'Tarjeta de contacto (.vcf) descargada',
        'toast.shared': 'Enlace del currículum compartido',
        'shell.toggleAria': 'Plegar o desplegar esta sección',
        'shell.filterPrefix': 'Resaltando tecnología:',
        'shell.clearFilter': 'Limpiar filtro',
        'shell.matchSingular': 'coincidencia',
        'shell.matchPlural': 'coincidencias',
        'shell.backToTop': 'Volver arriba',
        'shell.backToTopAria': 'Volver al inicio del currículum',
        'preview.barAria': 'Controles de vista previa de impresión A4',
        'preview.badge': 'Vista previa A4',
        'preview.pageWord': 'Página',
        'preview.pagesSingular': 'página',
        'preview.pagesPlural': 'páginas',
        'preview.keepSections': 'No cortar secciones',
        'preview.keepSectionsAria': 'Evitar dividir secciones entre páginas cuando quepan enteras',
        'preview.downloadBtn': 'Descargar PDF',
        'preview.printBtn': 'Imprimir',
        'preview.exitBtn': 'Volver a la vista normal',
        'preview.exitAria': 'Salir de la vista previa y volver a la vista normal',
        'header.subtitle': 'Desarrollador Web Full-Stack y Analista de Aplicaciones',
        'header.location': 'A Coruña, Galicia, España',
        'header.availability': 'Disponibilidad: Remoto (Nacional e Internacional)',
        'header.linkedinText': 'Perfil de LinkedIn',
        'header.githubText': 'GitHub',
        'header.endorsement':
          '2 Cartas Formales de Recomendación Disponibles (Ingeniería de Software y Dirección)',
        'header.photoAlt': 'Retrato de Daniel Barja Centeno',
        'header.qrAlt': 'Código QR de LinkedIn',
        'header.qrAria': 'Abrir modal de contacto directo y código QR',
        'sec.profile': 'Perfil Ejecutivo',
        'sec.highlights': 'Logros Técnicos y de Liderazgo Clave',
        'sec.stack': 'Stack Técnico y Competencias Clave',
        'sec.experience': 'Experiencia Profesional',
        'sec.projects': 'Proyectos Destacados de Software, Datos y Digitalización',
        'sec.education': 'Formación Académica y Certificaciones Técnicas',
        'sec.languages': 'Idiomas',
        'stack.domFrontend': 'Desarrollo Frontend',
        'stack.plainFrontend': 'Diseño UI/UX Responsive',
        'stack.domBackend': 'Backend y Lenguajes',
        'stack.domData': 'Bases de Datos y Analítica BI',
        'stack.plainData':
          'Diseño de Esquemas Relacionales · Product Mix (PM) y Reporting Estadístico',
        'stack.domTools': 'Control de Versiones y Herramientas',
        'stack.plainTools': 'Producción y Edición de Vídeo',
        'stack.domAnalysis': 'Análisis de Aplicaciones',
        'stack.plainAnalysis':
          'SDLC Completo · Toma de Requisitos · Especificación Funcional y UAT · Digitalización de Procesos · Soporte en Vivo · Hotfixes Rápidos SLA',
        'stack.domLeadership': 'Liderazgo y Operaciones',
        'stack.plainLeadership':
          'Dirección de Equipos (65+ personas) · Formación de Gerentes · Optimización de P&L y Mano de Obra · Cumplimiento Normativo APPCC (HACCP)',
        'exp.talkk.role': 'Desarrollador Full-Stack Web y de Escritorio / Analista de Aplicaciones',
        'exp.talkk.date': '2018 – Actualidad',
        'exp.talkk.company': 'Talkk (Escuela de Debate y Oratoria) — A Coruña, España',
        'exp.talkk.quote':
          '"Ha creado, diseñado, desarrollado e implementado diferentes aplicaciones informáticas para nuestra empresa, tanto de escritorio como web... demostrando siempre proactividad, recomendando las tecnologías más adecuadas a nuestras circunstancias y respondiendo a necesidades de última hora en cuestión de pocas horas."',
        'exp.talkk.cite': '— Alba Formoso, Directora en TALKK',
        'exp.mcdSantiago.role': 'Gerente de Restaurante y Responsable de Operaciones',
        'exp.mcdSantiago.date': 'Oct 2021 – Actualidad',
        'exp.mcdSantiago.company': "McDonald's — Santiago de Compostela, España",
        'exp.advisor.role': 'Asesor de Procesos de Negocio y Operaciones',
        'exp.advisor.date': 'Nov 2017 – Jul 2018',
        'exp.advisor.company':
          'Ágora SL (Dic 2017 – Jul 2018) e Il Mercato Pizzería (Nov 2017 – Jul 2018) — A Coruña, España',
        'exp.najoka.role': 'Gerente General de Restaurante y Supervisor de Sistemas',
        'exp.najoka.date': 'Ago 2004 – Ago 2017',
        'exp.najoka.company': "McDonald's (Najoka, S.L.) — A Coruña y Perillo-Oleiros, España",
        'exp.najoka.sub1Title':
          'Arquitectura de Sistemas, Analítica de Datos y Transformación Digital',
        'exp.najoka.sub2Title': 'Liderazgo 24/7/365 y Centro Provincial de Formación de Gerentes',
        'exp.najoka.sub3Title': 'Marketing de Marca Local y Producción Multimedia',
        'exp.najoka.sub4Title': 'Resultados Cuantitativos Verificados de Negocio y Auditoría',
        'exp.najoka.sub3Bullet':
          'Diseño de logotipos corporativos para la organización y restaurantes, vallas publicitarias de gran formato (Alfonso Molina), rotulación de autobuses, mupis, flyers, cartelería de eventos, banners promocionales y producción de vídeo promocional para los conciertos de Riazor, supervisando además eventos familiares y estacionales.',
        'exp.najoka.quote':
          '"Desde la fecha inicial desempeñó todas las funciones del restaurante, desde empleado hasta alcanzar la categoría de Gerente General... mostrando siempre una gran capacidad de trabajo en equipo, excelente disposición ante nuevos retos y oportunidades, adaptabilidad a nuevas tareas y responsabilidades, buen trato con el público y compañeros y conducta de total confianza."',
        'exp.najoka.cite': '— Miguel A. Expósito V., Coordinador en Najoka, S.L.',
        'exp.desktop.role': 'Técnico de Soporte Informático',
        'exp.desktop.date': 'Jun 2005 – May 2006',
        'exp.desktop.company': 'Desktop Servicios Informáticos — A Coruña, España',
        'lang.es.name': 'Español',
        'lang.es.level': 'Nativo',
        'lang.gl.name': 'Gallego',
        'lang.gl.level': 'Nativo',
        'lang.en.name': 'Inglés',
        'lang.en.level': 'Avanzado (Competencia profesional completa)',
        'closing.availability': 'Disponibilidad en Remoto (Nacional e Internacional)',
        'closing.references': '2 Cartas Formales de Recomendación Disponibles bajo Solicitud',
        'closing.webLabel': 'CV Web Interactivo:',
        'drawer.scaleLabel': 'Tamaño de Texto',
        'drawer.scaleSmTitle': 'Texto compacto (0.94x)',
        'drawer.scaleMdTitle': 'Texto normal (1.00x)',
        'drawer.scaleLgTitle': 'Texto grande (1.08x)',
        'drawer.qrBtn': 'Ver Código QR',
        'contactModal.title': 'Contacto Directo y QR',
        'contactModal.subtitle': '¡Conectemos! Contacta a través de tu canal preferido:',
        'qr.title': 'Código QR · Perfil LinkedIn',
        'qr.desc': 'Escanea con la cámara de tu móvil para acceder al perfil directo.',
        'qr.closeBtn': 'Cerrar',
        'qr.closeAria': 'Cerrar modal de código QR',
        'drawer.exportLabel': 'Exportar',
        'drawer.jsonResumeAria': 'Descargar CV en formato estándar JSON Resume v1.0',
        'drawer.markdownBtn': 'Copiar Markdown',
        'drawer.markdownAria': 'Copiar currículum completo en Markdown ATS limpio',
        'toast.markdownCopied': 'Currículum copiado al portapapeles en formato Markdown ATS',
        'toast.jsonDownloaded': 'Archivo JSON Resume v1.0 descargado',
        'drawer.searchCmd': 'Búsqueda Rápida',
        'rail.searchCmd': 'Buscar…',
        'rail.searchCmdAria': 'Abrir paleta de comandos',
        'rail.highlightMetrics': 'Destacar Métricas',
        'palette.title': 'Paleta de Comandos',
        'palette.placeholder': 'Escribe una sección, stack, acción, tema o idioma...',
        'palette.noResults': 'No se encontraron comandos coincidentes',
        'palette.closeAria': 'Cerrar paleta de comandos',
        'palette.resultsAria': 'Sugerencias de comandos',
        'palette.tipNav': 'navegar',
        'palette.tipSel': 'seleccionar',
        'palette.tipEsc': 'cerrar',
        'palette.badgeSection': 'Sección',
        'palette.badgeStack': 'Stack',
        'palette.badgeTheme': 'Tema',
        'palette.badgeLang': 'Idioma',
        'palette.badgeExport': 'Exportar',
        'palette.badgeAction': 'Acción',
        'palette.catSections': 'Secciones',
        'palette.catStack': 'Stack Técnico',
        'palette.catActions': 'Acciones y Exportación',
        'palette.catPreferences': 'Preferencias',
        'palette.actionAvatar': 'Ver viaje de Daniel (Avatar)',
        'drawer.adventureLabel': 'Modo Aventura (Avatar)',
        'drawer.adventureOn': 'On',
        'drawer.adventureOff': 'Off',
        'drawer.achievementBadge': '¡100% Explorado! Listo para contratar',
        'avatar.speechProfile': '¡Hola! Bienvenido a mi trayectoria técnica.',
        'avatar.speechHighlights': 'Resolviendo retos complejos con impacto real (+€229k, +11.4%).',
        'avatar.speechStack': 'Arquitectura limpia, cero dependencias y rendimiento.',
        'avatar.speechExperience': '18+ años guiando equipos y modernizando infraestructuras.',
        'avatar.speechExperience2':
          'Liderazgo técnico, arquitecturas resilientes y entrega continua.',
        'avatar.speechProjects':
          'Transformando visión de negocio en software fiable en producción.',
        'avatar.speechEducation': 'Aprendizaje continuo, rigor metodológico y mejora constante.',
        'avatar.speechLanguages':
          'Colaboración global sin fricción (Español nativo / Inglés Profesional).',
        'avatar.completeTitle': '¡Misión Cumplida!',
        'avatar.completeDesc': '¿Construimos el próximo gran hito juntos?',
        'avatar.completeCta': '¡Contáctame!',
        'avatar.completeHint': 'Haz clic para contactar',
        'avatar.easterEgg': '¡Sigue explorando! Daniel está listo para nuevos retos técnicos.',
      }),
      rich: {
        'profile.p1': [
          'Profesional orientado a resultados como ',
          ['strong', 'Desarrollador Web Full-Stack y Analista de Aplicaciones'],
          ', titulado en ',
          [
            'strong',
            'Técnico Superior en Desarrollo de Aplicaciones Informáticas (Nota media: 8,0 / 10)',
          ],
          ' con estudios universitarios en ',
          ['strong', 'Ingeniería Técnica Informática de Gestión'],
          ' (Universidad de A Coruña). Trayectoria demostrada en arquitectura, desarrollo y despliegue integral de aplicaciones web y de escritorio (',
          ['strong', 'Angular moderno, TypeScript, JavaScript, Node.js, PHP, .NET, C++, SQL'],
          '), diseño de bases de datos relacionales, modelos de inteligencia de negocio operativa y motores automáticos de reporting estadístico.',
        ],
        'profile.p2': [
          'Combina de forma diferencial la ingeniería de software y el análisis funcional con ',
          ['strong', 'más de 15 años de liderazgo operativo de alta exigencia'],
          ' en entornos 24/7/365: dirigiendo ',
          ['strong', 'equipos de más de 65 personas'],
          ', participando en el ',
          [
            'strong',
            'grupo de trabajo nacional de software WFM (planificación de horarios) en Madrid',
          ],
          ' y diseñando sistemas digitales multi-restaurante de planificación de turnos, nóminas y analítica de Product Mix (PM) adoptados por toda la organización. Reconocido por resolver incidencias críticas en horas, traducir reglas de negocio complejas en software fiable y formar tanto a usuarios técnicos como a equipos de gerencia.',
        ],
        'hl.1': [
          ['strong', 'Software en Producción de Extremo a Extremo (2018 – Actualidad):'],
          ' Único arquitecto y desarrollador de la suite de Gestión de Torneos de Debate y Analítica de Competencias de ',
          ['strong', 'Talkk'],
          ' (Escritorio y Web), avalado por carta formal de recomendación destacando asesoría tecnológica proactiva, soporte presencial en eventos en directo y entrega de hotfixes críticos en cuestión de horas.',
        ],
        'hl.2': [
          ['strong', 'Transformación Digital Corporativa y Diseño de Software Nacional:'],
          ' Creación de una arquitectura estandarizada de archivos, cuadrantes, nóminas y analítica de Product Mix (PM) adoptada en el ',
          ['strong', '100% de los restaurantes de la organización'],
          ', además de ser seleccionado para el grupo nacional de la aplicación web ',
          ['strong', 'WFM'],
          ' (planificación de horarios y turnos) en Madrid.',
        ],
        'hl.3': [
          ['strong', 'Excelencia Académica y Técnica:'],
          ' Titulado con ',
          ['strong', '8,0 / 10 de nota media'],
          ' en Desarrollo de Aplicaciones Informáticas y ',
          ['strong', '100% de puntuación en exámenes finales'],
          ' en todas las certificaciones especializadas en Angular moderno, Node.js, PHP, SQL y jQuery.',
        ],
        'hl.4': [
          ['strong', 'Liderazgo Crítico y Métricas Verificadas:'],
          ' Dirección del restaurante 24/7/365 con mayor facturación de Galicia (',
          ['strong', '~65+ personas'],
          '), logrando ',
          ['strong', '+11,4% de crecimiento interanual en ventas (+229.000 €)'],
          ', ',
          ['strong', '+7,3% en ticket medio'],
          ' y ',
          ['strong', '+3,8% en tráfico de clientes (+10.000 clientes)'],
          ' en 2017; clasificado ',
          ['strong', 'n.º 1 de España entre 488 restaurantes'],
          ' en evaluaciones Mystery Shopper (26 segundos de servicio en mostrador) y puntuaciones del ',
          ['strong', '99,2%–100%'],
          ' en auditorías externas de calidad y seguridad.',
        ],
        'exp.talkk.b1': [
          ['strong', 'Ingeniería de Software de Ciclo Completo:'],
          ' Liderazgo en toma de requisitos, selección de stack tecnológico, mejora de diseño UI/UX, programación y puesta en producción de aplicaciones de escritorio y web a medida para los flujos de la organización.',
        ],
        'exp.talkk.b2': [
          ['strong', 'Suite de Gestión de Torneos y Analítica de Competencias:'],
          ' Arquitectura y despliegue de la aplicación principal de torneos públicos de debate de Talkk, integrando persistencia relacional, seguimiento de enfrentamientos en tiempo real y motores estadísticos automáticos para evaluar competencias de participantes.',
        ],
        'exp.talkk.b3': [
          ['strong', 'Formación de Usuarios y Soporte Presencial en Eventos Críticos:'],
          ' Formación al personal no técnico en el uso del software, acompañamiento presencial durante torneos anuales para garantizar operación ininterrumpida y entrega de hotfixes y nuevas funciones en horas ante solicitudes de última hora.',
        ],
        'exp.mcdSantiago.b1': [
          ['strong', 'Operaciones de Alta Presión y Gestión de Incidencias:'],
          ' Dirección de la operativa diaria y equipos multidisciplinares en un entorno de alto volumen, aplicando diagnóstico estructurado, eliminación de cuellos de botella y toma de decisiones ágil en picos de demanda.',
        ],
        'exp.mcdSantiago.b2': [
          ['strong', 'Control de KPIs y Calidad Basado en Datos:'],
          ' Supervisión de resultados P&L, análisis de inventarios y facturas, optimización de mano de obra y cumplimiento estricto de auditorías externas de seguridad alimentaria y calidad operativa.',
        ],
        'exp.advisor.b1': [
          ['strong', 'Digitalización de Procesos y Analítica Financiera:'],
          ' Colaboración en la planificación anual de negocio, auditoría de flujos operativos e implantación sistemática de verificación de facturas, seguimiento de procedimientos y modelos de control de stock.',
        ],
        'exp.najoka.s1b1': [
          ['strong', 'Sistema Corporativo de Archivos y Planificación de Personal:'],
          ' Diseño y despliegue de una arquitectura estandarizada de gestión y turnos adoptada en ',
          ['strong', 'todos los restaurantes de la organización'],
          ', automatizando cuadrantes de equipo y gerencia, horas complementarias, vacaciones, preparación de nóminas, cierres diarios (mano de obra y Product Mix / PM), documentación e inventarios de cumpleaños y análisis de rendimiento de stock, pedidos y promociones.',
        ],
        'exp.najoka.s1b2': [
          [
            'strong',
            'Grupo de Trabajo Nacional de Software WFM (Planificación de Horarios y Turnos):',
          ],
          ' Seleccionado para participar en el grupo nacional en Madrid encargado de definir flujos funcionales y preparar el despliegue estatal de la aplicación web WFM de gestión de horarios.',
        ],
        'exp.najoka.s1b3': [
          ['strong', 'Evaluación Digital de Desempeño e Incentivos:'],
          ' Implantación de revisiones de rendimiento para gerentes en tablet mediante modelos de puntuación ponderada junto con un programa semanal de KPIs e incentivos por puntos.',
        ],
        'exp.najoka.s1b4': [
          ['strong', 'Cumplimiento Normativo y Mantenimiento Preventivo:'],
          ' Gestión de trazabilidad normativa estricta bajo protocolos ',
          ['strong', 'APPCC'],
          ' (HACCP) y dirección del programa de mantenimiento preventivo del establecimiento.',
        ],
        'exp.najoka.s2b1': [
          'Inicio a tiempo parcial compaginado con estudios de Informática, encadenando promociones en todos los niveles operativos: ',
          ['strong', '2 años como Entrenador Certificado'],
          ', ',
          ['strong', '4 años como Encargado de Turno'],
          ' y nombrado ',
          ['strong', 'Gerente General en julio de 2013'],
          ', liderando el restaurante 24/7/365 con mostrador y Auto de mayor venta en Galicia (',
          ['strong', '~65+ personas'],
          ': ~20 gerentes y ~45 empleados).',
        ],
        'exp.najoka.s2b2': [
          'Designado como ',
          ['strong', 'restaurante principal de formación para nuevos asistentes y gerentes'],
          ' de la organización, impulsando la promoción interna en toda la provincia (exportando equipos formados a restaurantes hermanos con ratios de promoción interna del ',
          ['strong', '47% en gerencia / 72% en plantilla'],
          ' en 2017 y ',
          ['strong', '100% en gerencia / 110% en plantilla'],
          ' en Perillo).',
        ],
        'exp.najoka.s4b1': [
          ['strong', 'Rankings Nacionales:'],
          ' Posición ',
          ['strong', 'n.º 1 de España (de 488 restaurantes)'],
          ' en el programa nacional Mystery Shopper en mostrador (',
          ['strong', '26 segundos de tiempo de servicio'],
          ' y ',
          ['strong', 'n.º 1 en España durante 9 meses consecutivos'],
          ' en Perillo), ',
          ['strong', '8.º Mejor Gerente General de la Zona Norte (2016)'],
          ' y semifinalista nacional en ',
          ['strong', 'All Stars Managers (2012)'],
          '.',
        ],
        'exp.najoka.s4b2': [
          ['strong', 'Crecimiento Financiero y de Tráfico Sostenido:'],
          ' Superación anual del crecimiento del ticket medio de la organización durante toda la etapa como Gerente General; ',
          ['strong', '+11,4% de crecimiento en ventas (+229.000 €)'],
          ', ',
          ['strong', '+7,3% en ticket medio (+0,57 €)'],
          ' y ',
          ['strong', '+3,8% en clientes (+10.000 visitas)'],
          ' en 2017 (tras ',
          ['strong', '+1,8% en ventas / +47.000 €'],
          ' y ',
          ['strong', '+2,6% en ticket medio'],
          ' en 2016), manteniendo crecimiento anual ininterrumpido incluso ante crisis y nuevas aperturas competidoras, optimizando P&L (',
          ['strong', '38% PAC, 24,59% Mano de obra, 25,92% F&P'],
          ' en 2016).',
        ],
        'exp.najoka.s4b3': [
          ['strong', 'Auditorías Externas de Calidad y Seguridad:'],
          ' Resultados del ',
          ['strong', '99,2%'],
          ' (2016-1) y ',
          ['strong', '94,8%'],
          ' (2016-2) en auditorías Eurofins A++; ',
          ['strong', '100%'],
          ' (2017-03) y ',
          ['strong', '95%'],
          ' (2017-05) en auditorías sorpresa CEV; y ',
          ['strong', '96,8%'],
          ' (2016) y ',
          ['strong', '96,4%'],
          ' (2017) en evaluaciones planificadas BSV, alcanzando ',
          ['strong', '100/100 en Servicio, Personas y Seguridad Alimentaria'],
          '.',
        ],
        'exp.desktop.b1': [
          ['strong', 'Configuración de Sistemas y Resolución de Incidencias:'],
          ' Diagnóstico y resolución de incidencias de hardware, software y redes locales (LAN), ensamblaje de equipos a medida, instalación de sistemas operativos/aplicaciones y soporte técnico directo a usuarios finales.',
        ],
        'proj.1': [
          ['strong', 'Suite de Torneos de Debate y Analítica de Competencias (Escritorio y Web):'],
          ' Plataforma integral creada para Talkk para gestionar torneos públicos de debate en vivo, almacenar actas y jueces en base de datos relacional y calcular informes estadísticos multivariables de competencias.',
        ],
        'proj.2': [
          ['strong', 'Sistema Corporativo Multi-Restaurante de Turnos y Product Mix (PM):'],
          ' Arquitectura estandarizada de cuadrantes, horas complementarias, vacaciones/nóminas, cierres diarios (mano de obra/PM) y control de stock/rendimientos adoptada en toda la franquicia.',
        ],
        'proj.3': [
          ['strong', 'Especificación Funcional y UAT de Aplicación Web Nacional WFM:'],
          ' Análisis multidisciplinar de requisitos y validación de flujos en Madrid para el despliegue nacional de la aplicación web WFM de planificación de horarios y turnos.',
        ],
        'proj.4': [
          ['strong', 'Sistema Digital Ponderado de Evaluación de Gerencia en Tablet:'],
          ' Herramienta digital de evaluación para estandarizar valoraciones de liderazgo mediante criterios ponderados, seguimiento semanal de KPIs y revisiones semestrales.',
        ],
        'proj.5': [
          ['strong', 'Identidad de Marca, Gran Formato y Vídeo (Photoshop, Illustrator y Vídeo):'],
          ' Creación de logotipos corporativos y de restaurantes, vallas en Alfonso Molina, rotulación de autobuses, mupis, cartelería de eventos y vídeos promocionales de conciertos en Riazor.',
        ],
        'edu.1': [
          ['strong', 'Técnico Superior en Desarrollo de Aplicaciones Informáticas'],
          ' — ',
          ['em', 'Centro de Estudios Superiores Caixa Galicia (2005)'],
          ' · ',
          ['strong', 'Nota media: 8,0 / 10'],
        ],
        'edu.2': [
          ['strong', 'Ingeniería Técnica Informática de Gestión'],
          ' — ',
          ['em', 'Universidad de A Coruña'],
          ' · ',
          ['em', 'Estudios universitarios cursados'],
        ],
        'edu.certHeader': [
          ['strong', 'Certificaciones Especializadas en Ingeniería de Software'],
          ' ',
          ['em', '(100% de nota en examen final en todos los cursos)'],
          ':',
        ],
        'edu.cert1': [
          ['strong', 'Máster en PHP, SQL y Programación Orientada a Objetos (POO)'],
          ' — ',
          ['em', 'Feb 2021'],
        ],
        'edu.cert2': [['strong', 'jQuery: De cero a avanzado'], ' — ', ['em', 'Ene 2021']],
        'edu.cert3': [['strong', 'Node.js: De cero a experto'], ' — ', ['em', 'Oct 2020']],
        'edu.cert4': [
          ['strong', 'Angular: De cero a experto y Angular Avanzado'],
          ' — ',
          ['em', 'Jun – Ago 2020'],
        ],
        'edu.mgmtHeader': [
          ['strong', 'Formación en Productividad Digital, Liderazgo y Gestión Operativa:'],
        ],
        'edu.mgmt1': [['strong', 'Curso Productividad Personal en la Era Digital']],
        'edu.mgmt2': [
          ['strong', 'Business Leadership Course (BLP CPLR)'],
          ' — ',
          ['em', 'Hamburger University, Londres (Abr 2015)'],
        ],
        'edu.mgmt3': [
          ['strong', 'Curso de Prácticas de Liderazgo en Restaurante (CPLR)'],
          ' — ',
          ['em', '(Nov 2014)'],
        ],
        'edu.mgmt4': [
          ['strong', 'Curso Regional de Equipos y Calidad'],
          ' — ',
          ['em', '(Sep 2014)'],
        ],
        'edu.mgmt5': [
          ['strong', 'Curso de Prácticas Efectivas de Gestión'],
          ' — ',
          ['em', '(Mar 2014)'],
        ],
        'edu.mgmt6': [
          ['strong', 'Curso Básico de Prevención de Riesgos Laborales (50h)'],
          ' — ',
          ['em', 'Mugatra (Nov 2013)'],
        ],
        'edu.mgmt7': [
          ['strong', 'Curso Avanzado de Control de Turno'],
          ' — ',
          ['em', '(Oct 2011)'],
        ],
        'edu.mgmt8': [['strong', 'Curso Formación de Líderes'], ' — ', ['em', '(May 2011)']],
        'edu.mgmt9': [['strong', 'Curso Básico de Control de Turno'], ' — ', ['em', '(Nov 2010)']],
        'edu.tutoring': [
          ['strong', 'Clases Particulares STEM:'],
          ' Impartición de clases particulares y en grupos reducidos de Ciencias para estudiantes de secundaria y bachillerato (3.º ESO – 1.º Bachillerato).',
        ],
      },
    },
  };

  globalScope.RESUME_I18N = {
    SECCIONES_INDICE,
    CONFIG_CONTACTO,
    I18N_COMUN,
    DICCIONARIO,
  };
})(window);
