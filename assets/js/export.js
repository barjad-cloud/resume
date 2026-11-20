/**
 * @file assets/js/export.js
 * @description Generadores de exportación: vCard RFC 6350, JSON Resume v1.0, Markdown ATS y enlaces de contacto.
 */

(function initExportModule(globalScope) {
  'use strict';

  const ResumeApp = globalScope.ResumeApp = globalScope.ResumeApp || {};
  const i18nData = globalScope.RESUME_I18N || {};
  const { CONFIG_CONTACTO } = i18nData;

  function f_construir_enlaces_contacto(config, idioma) {
    const { t } = ResumeApp.state;
    const telefonoDisplay = config.telefonoPartes.join(' ');
    const telefonoE164 = config.telefonoPartes.join('');
    const telefonoWa = telefonoE164.replace(/[^\d]/g, '');
    const email = config.emailPartes.join('@');
    const waMsg = encodeURIComponent(t('contact.whatsappMsg', idioma));
    const mailSubj = encodeURIComponent(t('contact.emailSubject', idioma));

    const urls = {
      telefonoDisplay,
      telefonoE164,
      telefonoWa,
      email,
      whatsappUrl: `https://wa.me/${telefonoWa}?text=${waMsg}`,
      mailtoUrl: `mailto:${email}?subject=${mailSubj}`,
      telUrl: `tel:${telefonoE164}`,
    };

    const waBtn = document.getElementById('btn-whatsapp');
    const drawerEmailLink = document.getElementById('drawer-email-link');
    const headerEmailLink = document.getElementById('header-email-link');
    const headerPhoneLink = document.getElementById('header-phone-link');

    if (waBtn) waBtn.setAttribute('href', urls.whatsappUrl);
    if (drawerEmailLink) drawerEmailLink.setAttribute('href', urls.mailtoUrl);
    if (headerEmailLink) {
      headerEmailLink.setAttribute('href', urls.mailtoUrl);
      headerEmailLink.textContent = urls.email;
    }
    if (headerPhoneLink) {
      headerPhoneLink.setAttribute('href', urls.telUrl);
      headerPhoneLink.textContent = urls.telefonoDisplay;
    }
    return urls;
  }

  function f_obtener_info_pdf(fechaActualizacion, idioma = ResumeApp.state.estado.idioma) {
    const sufijo = (fechaActualizacion || '2026-11').replace('-', '_');
    const baseName = idioma === 'es' ? 'Daniel_Barja_Centeno_CV_ES' : 'Daniel_Barja_Centeno_Resume_EN';
    return {
      href: `./assets/pdf/${baseName}.pdf`,
      download: `${baseName}_v${sufijo}.pdf`,
      printTitle: `${baseName}_v${sufijo}`,
    };
  }

  function f_formatear_fecha_actualizacion(fechaActualizacion, idioma) {
    const partes = (fechaActualizacion || '2026-11').split('-');
    const anio = partes[0] || '';
    const mesIdx = Math.max(0, Math.min(11, parseInt(partes[1], 10) - 1));
    const mesesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mesesEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mes = (idioma === 'es' ? mesesEs : mesesEn)[mesIdx] || '';
    return idioma === 'es' ? `Actualizado ${mes} ${anio}` : `Updated ${mes} ${anio}`;
  }

  function f_sincronizar_enlaces_pdf_y_version(fechaActualizacion, appVersion, idioma = ResumeApp.state.estado.idioma) {
    const pdfInfo = f_obtener_info_pdf(fechaActualizacion, idioma);
    ['btn-download-pdf', 'btn-preview-download-pdf'].forEach(id => {
      const link = document.getElementById(id);
      if (link) {
        link.setAttribute('href', pdfInfo.href);
        link.setAttribute('download', pdfInfo.download);
      }
    });
    const updatedEl = document.getElementById('drawer-updated-label');
    if (updatedEl) updatedEl.textContent = f_formatear_fecha_actualizacion(fechaActualizacion, idioma);
    const versionEl = document.getElementById('drawer-version-label');
    if (versionEl) versionEl.textContent = appVersion;
  }

  function f_construir_url_compartible(sectionId) {
    const base = CONFIG_CONTACTO.webUrl.endsWith('/') ? CONFIG_CONTACTO.webUrl : `${CONFIG_CONTACTO.webUrl}/`;
    const url = ResumeApp.state.estado.idioma === 'es' ? `${base}?lang=es` : base;
    return sectionId ? `${url}#${sectionId}` : url;
  }

  function f_descargar_vcard(config, idioma, visualize_github_home = false) {
    const telefonoFormateado = config.telefonoPartes.join(' ');
    const email = config.emailPartes.join('@');
    const titulo = idioma === 'es' ? config.tituloEs : config.tituloEn;
    const pais = idioma === 'es' ? 'España' : 'Spain';
    const etiquetaWeb = idioma === 'es' ? 'CV Web' : 'Web Resume';
    const nota = idioma === 'es'
      ? 'Disponibilidad en remoto (Nacional e Internacional). 2 cartas formales de recomendación disponibles.'
      : 'Remote availability (National & International). 2 formal recommendation letters available.';

    const vcardLines = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `N;CHARSET=UTF-8:${config.nombreVcard}`,
      `FN;CHARSET=UTF-8:${config.nombreCompleto}`,
      `TITLE;CHARSET=UTF-8:${titulo}`,
      `TEL;TYPE=CELL,VOICE:${telefonoFormateado}`,
      `EMAIL;TYPE=INTERNET,WORK:${email}`,
      `item1.URL:${config.webUrl}`,
      `item1.X-ABLabel;CHARSET=UTF-8:${etiquetaWeb}`,
      `item2.URL:${config.linkedinUrl}`,
      'item2.X-ABLabel:LinkedIn',
      ...(visualize_github_home ? [`item3.URL:${config.githubUrl}`, 'item3.X-ABLabel:GitHub'] : []),
      `ADR;TYPE=WORK;CHARSET=UTF-8:;;;A Coruña;Galicia;;${pais}`,
      `NOTE;CHARSET=UTF-8:${nota}`,
      'END:VCARD',
    ];

    const blob = new Blob(['\uFEFF', vcardLines.join('\r\n') + '\r\n'], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Daniel_Barja_Centeno.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    globalScope.setTimeout(() => URL.revokeObjectURL(url), 1000);
    ResumeApp.state.f_mostrar_toast(ResumeApp.state.t('toast.vcardDownloaded'));
  }

  async function f_compartir_cv(triggerBtn = null) {
    const shareUrl = f_construir_url_compartible();
    if (navigator.share) {
      try {
        await navigator.share({
          title: ResumeApp.state.t('meta.title'),
          text: `${CONFIG_CONTACTO.nombreCompleto} — ${ResumeApp.state.t('header.subtitle')}`,
          url: shareUrl,
        });
        ResumeApp.state.f_mostrar_toast(ResumeApp.state.t('toast.shared'));
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    const ok = await ResumeApp.state.f_copiar_al_portapapeles(shareUrl, 'toast.linkCopied');
    if (ok && triggerBtn) ResumeApp.state.f_feedback_boton(triggerBtn, 'drawer.linkCopiedShort');
  }

  function f_generar_json_resume(idioma = ResumeApp.state.estado.idioma, visualize_github_home = false) {
    const isEs = idioma === 'es';
    const profiles = [{ network: 'LinkedIn', username: 'daniel-b-351320157', url: CONFIG_CONTACTO.linkedinUrl }];
    if (visualize_github_home) profiles.push({ network: 'GitHub', username: 'barjad-cloud', url: CONFIG_CONTACTO.githubUrl });

    const resumeData = {
      $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
      basics: {
        name: CONFIG_CONTACTO.nombreCompleto,
        label: isEs ? CONFIG_CONTACTO.tituloEs : CONFIG_CONTACTO.tituloEn,
        image: 'https://barjad-cloud.github.io/resume/assets/img/daniel_barja_photo.png',
        email: CONFIG_CONTACTO.emailPartes.join('@'),
        phone: CONFIG_CONTACTO.telefonoPartes.join(' '),
        url: CONFIG_CONTACTO.webUrl,
        summary: isEs
          ? 'Desarrollador Web Full-Stack y Analista de Aplicaciones (DAI - UDC). 15+ años de liderazgo operativo en entornos 24/7/365 liderando equipos de 65+ personas y creando sistemas analíticos y de gestión.'
          : 'Results-driven Full-Stack Web Developer and Application Analyst holding a Higher Technician degree in Computer Applications Development (GPA: 8.0 / 10). Uniquely combines software engineering with 15+ years of operational leadership managing 65+ person teams.',
        location: { city: 'A Coruña', countryCode: 'ES', region: 'Galicia' },
        profiles,
      },
      work: [
        {
          name: isEs ? 'Talkk (Escuela de Debate y Oratoria)' : 'Talkk (School of Debate & Oratory)',
          position: isEs ? 'Desarrollador Web Full-Stack y Aplicaciones de Escritorio / Analista' : 'Full-Stack Web & Desktop Developer / Analyst',
          startDate: '2020-09-01',
          endDate: '2022-07-31',
          summary: isEs ? 'Creación, diseño y desarrollo de aplicaciones web y de escritorio.' : 'End-to-end design and development of web and desktop applications.',
          highlights: [
            isEs ? 'Desarrollo web full-stack y escritorio (Angular, TypeScript, Node.js, PHP, SQL)' : 'Full-stack web & desktop development (Angular, TypeScript, Node.js, PHP, SQL)',
            isEs ? 'Resolución de incidentes y hotfixes SLA en cuestión de horas' : 'Rapid SLA hotfix delivery within hours',
          ],
        },
        {
          name: isEs ? "McDonald's (Najoka, S.L.)" : "McDonald's (Najoka, S.L.)",
          position: isEs ? 'Director de Restaurante y Supervisor de Sistemas' : 'Restaurant General Manager & Systems Supervisor',
          startDate: '2008-05-01',
          endDate: '2020-03-31',
          summary: isEs ? 'Dirección general, arquitectura de sistemas y optimización operativa de equipos de 65+ personas.' : 'General management, systems architecture, and operational optimization leading 65+ staff.',
          highlights: [
            isEs ? '+11.4% de incremento anual en transacciones (+€229k facturación)' : '+11.4% annual guest count growth (+€229k net sales)',
            isEs ? 'Puesto #1 en Galicia en auditorías de operaciones' : '#1 ranked restaurant in Galicia in operations audits',
          ],
        },
      ],
      education: [
        {
          institution: 'IES Fernando Wirtz Suárez',
          area: isEs ? 'Desarrollo de Aplicaciones Informáticas (DAI)' : 'Computer Applications Development',
          studyType: isEs ? 'Técnico Superior (Nota media: 8.0 / 10)' : 'Higher Technician Degree (GPA: 8.0 / 10)',
          startDate: '2001-09-01',
          endDate: '2003-06-30',
        },
        {
          institution: 'Universidade da Coruña (UDC)',
          area: isEs ? 'Ingeniería Técnica en Informática de Gestión' : 'Technical Engineering in Management Informatics',
          studyType: isEs ? 'Estudios Universitarios' : 'University Coursework',
          startDate: '2003-09-01',
          endDate: '2008-06-30',
        },
      ],
      skills: [
        { name: 'Frontend', level: 'Master', keywords: ['Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3'] },
        { name: 'Backend', level: 'Advanced', keywords: ['Node.js', 'PHP', 'SQL', 'MySQL', 'MongoDB', '.NET'] },
        { name: 'Tools', level: 'Advanced', keywords: ['Git', 'GitHub', 'REST APIs', 'Vite'] },
        { name: 'Leadership', level: 'Master', keywords: ['Team Leadership (65+ Staff)', 'P&L Optimization', 'WFM Scheduling'] },
      ],
      languages: [
        { language: isEs ? 'Español' : 'Spanish', fluency: isEs ? 'Nativo' : 'Native speaker' },
        { language: isEs ? 'Gallego' : 'Galician', fluency: isEs ? 'Nativo' : 'Native speaker' },
        { language: isEs ? 'Inglés' : 'English', fluency: isEs ? 'B1-B2 Competencia Profesional' : 'B1-B2 Working Proficiency' },
      ],
    };

    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Daniel_Barja_Centeno_Resume_${idioma.toUpperCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ResumeApp.state.f_mostrar_toast(ResumeApp.state.t('toast.jsonDownloaded'));
  }

  async function f_generar_markdown_cv(idioma = ResumeApp.state.estado.idioma, visualize_github_home = false) {
    const isEs = idioma === 'es';
    const githubLine = visualize_github_home ? ` | GitHub: ${CONFIG_CONTACTO.githubUrl}` : '';

    const md = [
      `# ${CONFIG_CONTACTO.nombreCompleto}`,
      `**${isEs ? CONFIG_CONTACTO.tituloEs : CONFIG_CONTACTO.tituloEn}**`,
      `${isEs ? CONFIG_CONTACTO.ubicacionEs : CONFIG_CONTACTO.ubicacionEn} | ${isEs ? 'Disponibilidad: Remoto (Nacional e Internacional)' : 'Availability: Remote (National & International)'}`,
      `Tel: ${CONFIG_CONTACTO.telefonoPartes.join(' ')} | Email: ${CONFIG_CONTACTO.emailPartes.join('@')} | LinkedIn: ${CONFIG_CONTACTO.linkedinUrl} | Web: ${CONFIG_CONTACTO.webUrl}${githubLine}`,
      '',
      `## ${isEs ? 'Perfil Ejecutivo' : 'Executive Profile'}`,
      isEs
        ? 'Desarrollador Web Full-Stack y Analista de Aplicaciones con titulación de Técnico Superior en Desarrollo de Aplicaciones Informáticas (DAI - Nota media: 8.0 / 10) y formación universitaria en Ingeniería Técnica en Informática de Gestión (UDC). Sólida trayectoria diseñando, desarrollando y desplegando aplicaciones web y de escritorio (Angular moderno, TypeScript, JavaScript, Node.js, PHP, .NET, C++, SQL), modelos analíticos de negocio y cuadros de mando.\n\nCombina desarrollo de software con más de 15 años de liderazgo operativo en entornos 24/7/365 gestionando equipos de 65+ personas y participando en grupos nacionales de trabajo de software de planificación (WFM) en Madrid.'
        : 'Results-driven Full-Stack Web Developer and Application Analyst holding a Higher Technician degree in Computer Applications Development (GPA: 8.0 / 10) with university coursework in Technical Engineering in Management Informatics (University of A Coruña). Proven track record architecting, developing, and deploying end-to-end web and desktop applications (Modern Angular, TypeScript, JavaScript, Node.js, PHP, .NET, C++, SQL).\n\nUniquely combines software engineering with 15+ years of operational leadership managing 65+ person teams, serving on a national WFM scheduling software working group in Madrid, and engineering digital management systems.',
      '',
      `## ${isEs ? 'Logros Clave' : 'Key Highlights'}`,
      isEs
        ? '- Arquitectura y Desarrollo de Aplicaciones de Producción: Desarrollo de aplicaciones de gestión interna y plataformas web en Angular, TypeScript, Node.js, PHP y SQL.\n- Liderazgo de Alto Impacto: Dirección de más de 65 personas en turnos 24/7/365, con +11.4% de incremento anual de transacciones (+€229k facturación).\n- Digitalización e Innovación Operativa: Automatización de procesos mediante hojas de cálculo relacionales, consultas SQL y herramientas de previsión de demanda.\n- Excelencia Operativa y Auditorías: Puesto #1 en Galicia en auditorías de operaciones y 100% en inspecciones higiénico-sanitarias.'
        : '- Full-Stack Software Engineering: Delivered production web & desktop platforms utilizing Angular, TypeScript, Node.js, PHP, and SQL with relational schemas.\n- Operational Leadership & Scale: Managed 65+ person teams, delivering +11.4% annual transaction growth (+€229k net sales).\n- Digital Transformation & Process Engineering: Engineered automated scheduling models, SQL reporting pipelines, and Demand Forecasting algorithms.\n- Audit & Quality Excellence: Ranked #1 across Galicia in operations audits and maintained 100% in regulatory sanitary compliance.',
      '',
      `## ${isEs ? 'Stack Técnico' : 'Technical Stack'}`,
      '- Frontend: Angular, TypeScript, JavaScript, HTML5, CSS3, jQuery',
      '- Backend: Node.js, PHP, SQL, MySQL, MongoDB, .NET, C++, Java',
      '- Tools: Git, GitHub, REST APIs, JSON, Postman, Vite',
      '- Leadership: Team Management (65+ Staff), P&L Optimization, WFM Scheduling, SLA Hotfix Resolution',
      '',
      `## ${isEs ? 'Experiencia Laboral' : 'Experience'}`,
      `### ${isEs ? 'Desarrollador Web y Escritorio / Analista' : 'Full-Stack Web & Desktop Developer / Analyst'} — Talkk`,
      `${isEs ? 'Sep 2020 – Jul 2022 | A Coruña, España' : 'Sep 2020 – Jul 2022 | A Coruña, Spain'}`,
      isEs
        ? '- Creación, diseño, desarrollo e implantación de aplicaciones web y de escritorio.\n- Resolución rápida de incidencias y despliegue de hotfixes en cuestión de horas bajo SLA.'
        : '- End-to-end architecture and implementation of web and desktop software applications.\n- Rapid root-cause debugging and hotfix resolution within hours under high SLAs.',
      '',
      `### ${isEs ? 'Director de Restaurante y Supervisor de Sistemas' : 'Restaurant General Manager & Systems Supervisor'} — McDonald\'s (Najoka, S.L.)`,
      `${isEs ? 'May 2008 – Mar 2020 | A Coruña, España' : 'May 2008 – Mar 2020 | A Coruña, Spain'}`,
      isEs
        ? '- Dirección ejecutiva de restaurante liderando equipos de más de 65 personas.\n- Miembro del grupo de trabajo nacional de software de planificación horaria (WFM) en Madrid.\n- Creación de sistemas digitales de gestión de turnos, nóminas y Product Mix (PM).\n- +11.4% de incremento anual en volumen de clientes (+€229k de facturación).'
        : '- Executive operational management leading teams of 65+ professionals in high-volume environments.\n- Selected for the national workforce management (WFM) scheduling software working group in Madrid.\n- Engineered automated scheduling and Product Mix (PM) statistical analytics tools.\n- Delivered +11.4% annual guest count growth (+€229k net revenue increase).',
      '',
      `## ${isEs ? 'Formación y Certificaciones' : 'Education & Certifications'}`,
      `- ${isEs ? 'Técnico Superior en Desarrollo de Aplicaciones Informáticas (DAI) (Nota media: 8.0 / 10)' : 'Higher Technician degree in Computer Applications Development (GPA: 8.0 / 10)'} — IES Fernando Wirtz Suárez`,
      `- ${isEs ? 'Ingeniería Técnica en Informática de Gestión (Estudios universitarios)' : 'Technical Engineering in Management Informatics (University coursework)'} — Universidad de A Coruña (UDC)`,
      `- Máster en PHP, SQL y POO | Angular: De cero a experto | Node.js | jQuery`,
      '',
      `## ${isEs ? 'Idiomas' : 'Languages'}`,
      `- ${isEs ? 'Español: Nativo' : 'Spanish: Native'}`,
      `- ${isEs ? 'Gallego: Nativo' : 'Galician: Native'}`,
      `- ${isEs ? 'Inglés: B1-B2 Competencia Profesional' : 'English: B1-B2 Working Proficiency'}`,
    ].join('\n');

    await ResumeApp.state.f_copiar_al_portapapeles(md, 'toast.markdownCopied');
  }

  ResumeApp.export = {
    f_construir_enlaces_contacto,
    f_obtener_info_pdf,
    f_formatear_fecha_actualizacion,
    f_sincronizar_enlaces_pdf_y_version,
    f_construir_url_compartible,
    f_descargar_vcard,
    f_compartir_cv,
    f_generar_json_resume,
    f_generar_markdown_cv,
  };
})(window);
