/**
 * @file assets/js/palette.js
 * @description Diálogos modales: Modal de contacto/QR y Paleta de Comandos ⌘K / Ctrl+K.
 */

(function initPaletteModule(globalScope) {
  'use strict';

  const ResumeApp = globalScope.ResumeApp = globalScope.ResumeApp || {};
  let lastFocusedBeforeModal = null;

  function f_es_click_fuera_dialog(dialog, cardSelector, e) {
    const card = dialog.querySelector(cardSelector);
    if (!card) return false;
    if (e.target === dialog || !card.contains(/** @type {Node} */ (e.target))) return true;
    const rect = card.getBoundingClientRect();
    return e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  }

  function f_abrir_modal_contacto() {
    const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('qr-modal'));
    if (!dialog) return;
    lastFocusedBeforeModal = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function f_iniciar_modal_qr(configContacto) {
    const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('qr-modal'));
    const btnOpen = document.getElementById('btn-show-qr');
    const headerQrBtn = document.getElementById('header-qr-btn');
    if (!dialog) return;

    function cerrar() {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') lastFocusedBeforeModal.focus();
    }

    if (btnOpen) btnOpen.addEventListener('click', f_abrir_modal_contacto);
    if (headerQrBtn) headerQrBtn.addEventListener('click', f_abrir_modal_contacto);

    let clickStartedOutside = false;
    dialog.addEventListener('mousedown', e => {
      clickStartedOutside = f_es_click_fuera_dialog(dialog, '.contact-modal-card', e);
    });
    dialog.addEventListener('click', e => {
      if (clickStartedOutside && f_es_click_fuera_dialog(dialog, '.contact-modal-card', e)) cerrar();
      clickStartedOutside = false;
    });

    dialog.querySelectorAll('[data-close-qr]').forEach(el => el.addEventListener('click', cerrar));
    dialog.addEventListener('cancel', () => {
      if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') lastFocusedBeforeModal.focus();
    });

    const channelsSource = document.getElementById('contact-channels-list');
    const modalTarget = document.getElementById('modal-contact-channels');
    if (channelsSource && modalTarget && modalTarget.children.length === 0) {
      modalTarget.appendChild(channelsSource.cloneNode(true));
    }

    dialog.querySelectorAll('[data-modal-copy-email], [data-action="copy-email"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await ResumeApp.state.f_copiar_al_portapapeles(configContacto.emailPartes.join('@'), 'toast.emailCopied');
        if (ok) ResumeApp.state.f_feedback_boton(btn, 'drawer.copiedShort');
      });
    });

    dialog.querySelectorAll('[data-modal-copy-phone], [data-action="copy-phone"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await ResumeApp.state.f_copiar_al_portapapeles(configContacto.telefonoPartes.join(' '), 'toast.phoneCopied');
        if (ok) ResumeApp.state.f_feedback_boton(btn, 'drawer.copiedShort');
      });
    });

    dialog.querySelectorAll('[data-modal-vcard], [data-action="vcard"]').forEach(btn => {
      btn.addEventListener('click', () => ResumeApp.export.f_descargar_vcard(configContacto, ResumeApp.state.estado.idioma));
    });
  }

  function f_iniciar_paleta_comandos(deps) {
    const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('command-palette'));
    const input = /** @type {HTMLInputElement | null} */ (document.getElementById('palette-input'));
    const resultsContainer = document.getElementById('palette-results');
    const btnRail = document.getElementById('rail-btn-search');
    const btnMobile = document.getElementById('mobile-search-btn');
    if (!dialog || !input || !resultsContainer) return;

    let selectedIndex = 0;
    let comandosFiltrados = [];

    function normalizar(str) {
      return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    function f_construir_registro_comandos() {
      const isEs = ResumeApp.state.estado.idioma === 'es';
      const comandos = [];
      const addCmd = (id, titulo, categoria, accion, tags = []) => comandos.push({ id, titulo, categoria, accion, tags });

      (deps.seccionesIndice || []).forEach(sec => {
        const titulo = isEs ? sec.etiquetaEs : sec.etiquetaEn;
        addCmd(`sec-${sec.id}`, `${isEs ? 'Ir a' : 'Go to'} ${titulo}`, 'section', () => {
          const el = document.getElementById(sec.id);
          if (el) {
            ResumeApp.navigation.f_expandir_seccion_si_plegada(el);
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, [sec.id, sec.etiquetaEn, sec.etiquetaEs]);
      });

      ResumeApp.stackKpi.VALID_STACKS.forEach(stk => {
        const label = stk === 'leadership' ? (isEs ? 'Liderazgo y Gestión' : 'Leadership & Management') : stk === 'all' ? (isEs ? 'Mostrar todo el Stack' : 'Show All Stack') : (ResumeApp.stackKpi.STACK_LABELS[stk] || stk);
        addCmd(`stack-${stk}`, `${isEs ? 'Resaltar Stack:' : 'Highlight Stack:'} ${label}`, 'stack', () => ResumeApp.stackKpi.f_resaltar_stack(stk === 'all' ? null : stk), ['stack', 'filtro', 'filter', stk, label]);
      });

      const temas = [
        ['light', isEs ? 'Tema Claro' : 'Light Theme'],
        ['dark', isEs ? 'Tema Oscuro' : 'Dark Theme'],
        ['system', isEs ? 'Tema Automático (Sistema)' : 'System Theme (Auto)'],
        ['daniel', 'Favorito Daniel (Barja Software Studio)'],
      ];
      temas.forEach(([id, nom]) => addCmd(`theme-${id}`, nom, 'theme', () => ResumeApp.state.f_ejecutar_transicion_vista(() => ResumeApp.state.f_aplicar_tema(id)), ['tema', 'theme', id, nom]));

      addCmd('lang-en', isEs ? 'Cambiar idioma a Inglés (English)' : 'Switch language to English', 'lang', () => ResumeApp.state.f_ejecutar_transicion_vista(() => deps.onCambiarIdioma('en')), ['language', 'idioma', 'english', 'en']);
      addCmd('lang-es', isEs ? 'Cambiar idioma a Español' : 'Switch language to Spanish (Español)', 'lang', () => ResumeApp.state.f_ejecutar_transicion_vista(() => deps.onCambiarIdioma('es')), ['language', 'idioma', 'español', 'es', 'spanish']);

      addCmd('action-download-pdf', isEs ? 'Descargar PDF (Versión Actualizada)' : 'Download PDF (Latest Release)', 'export', () => {
        const info = ResumeApp.export.f_obtener_info_pdf(deps.fechaActualizacion);
        const a = document.createElement('a');
        a.href = info.href;
        a.download = info.download;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, ['pdf', 'download', 'descargar', 'imprimir']);

      addCmd('action-print', isEs ? 'Imprimir / Guardar como PDF' : 'Print / Save as PDF', 'action', () => globalScope.print(), ['print', 'imprimir']);
      addCmd('action-json-resume', isEs ? 'Descargar JSON Resume (Estándar v1.0)' : 'Download JSON Resume (Standard v1.0)', 'export', () => ResumeApp.export.f_generar_json_resume(), ['json', 'resume', 'schema', 'export']);
      addCmd('action-markdown-ats', isEs ? 'Copiar CV en Markdown ATS al portapapeles' : 'Copy resume in Markdown ATS to clipboard', 'export', () => ResumeApp.export.f_generar_markdown_cv(), ['markdown', 'ats', 'copiar', 'copy']);
      addCmd('action-qr', isEs ? 'Ver Código QR (Perfil LinkedIn)' : 'Show QR Code (LinkedIn Profile)', 'action', () => f_abrir_modal_contacto(), ['qr', 'linkedin', 'movil', 'mobile']);
      addCmd('action-toggle-metrics', isEs ? 'Destacar / Atenuar Métricas cuantitativas (KPIs)' : 'Highlight / Dim quantitative KPIs', 'action', () => ResumeApp.stackKpi.f_alternar_destacar_metricas(), ['metricas', 'metrics', 'kpi', 'destacar', 'highlight']);
      addCmd('action-vcard', isEs ? 'Descargar Contacto (.vcf vCard)' : 'Download Contact Card (.vcf vCard)', 'action', () => ResumeApp.export.f_descargar_vcard(deps.configContacto, ResumeApp.state.estado.idioma), ['vcard', 'vcf', 'contacto', 'contact', 'telefono', 'email']);
      addCmd('action-avatar-journey', isEs ? 'Ver viaje de Daniel (Avatar)' : "View Daniel's Journey (Avatar)", 'action', () => {
        if (deps.avatarCtrl && typeof deps.avatarCtrl.enfocar === 'function') deps.avatarCtrl.enfocar();
      }, ['avatar', 'journey', 'viaje', 'caricatura', 'progreso', 'story', 'animacion']);

      return comandos;
    }

    function renderizarResultados(lista) {
      comandosFiltrados = lista;
      selectedIndex = Math.min(selectedIndex, Math.max(0, lista.length - 1));
      resultsContainer.replaceChildren();

      if (lista.length === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'palette-empty';
        emptyEl.textContent = ResumeApp.state.t('palette.noResults');
        resultsContainer.appendChild(emptyEl);
        return;
      }

      const BADGE_KEYS = {
        section: 'palette.badgeSection',
        stack: 'palette.badgeStack',
        theme: 'palette.badgeTheme',
        lang: 'palette.badgeLang',
        export: 'palette.badgeExport',
        action: 'palette.badgeAction',
      };

      lista.forEach((cmd, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = `palette-item${idx === selectedIndex ? ' is-selected' : ''}`;
        itemEl.setAttribute('role', 'option');
        itemEl.setAttribute('aria-selected', String(idx === selectedIndex));

        const leftEl = document.createElement('div');
        leftEl.className = 'palette-item-left';

        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgEl.setAttribute('class', 'palette-item-icon');
        svgEl.setAttribute('viewBox', '0 0 24 24');
        svgEl.setAttribute('aria-hidden', 'true');
        const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        const iconId = cmd.categoria === 'section' ? '#ic-chevron-down' :
                       cmd.categoria === 'stack' ? '#ic-code' :
                       cmd.categoria === 'export' ? '#ic-file-text' :
                       cmd.categoria === 'theme' ? '#ic-sparkles' : '#ic-search';
        useEl.setAttribute('href', iconId);
        svgEl.appendChild(useEl);
        leftEl.appendChild(svgEl);

        const titleEl = document.createElement('span');
        titleEl.textContent = cmd.titulo;
        leftEl.appendChild(titleEl);

        const badgeEl = document.createElement('span');
        badgeEl.className = 'palette-item-badge';
        const bKey = BADGE_KEYS[cmd.categoria];
        badgeEl.textContent = bKey ? ResumeApp.state.t(bKey, ResumeApp.state.estado.idioma) : cmd.categoria;

        itemEl.appendChild(leftEl);
        itemEl.appendChild(badgeEl);

        itemEl.addEventListener('mouseenter', () => {
          selectedIndex = idx;
          actualizarSeleccionVisual();
        });
        itemEl.addEventListener('click', () => ejecutarComando(cmd));
        resultsContainer.appendChild(itemEl);
      });

      const selectedEl = resultsContainer.children[selectedIndex];
      if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }

    function actualizarSeleccionVisual() {
      const items = resultsContainer.querySelectorAll('.palette-item');
      items.forEach((el, i) => {
        el.classList.toggle('is-selected', i === selectedIndex);
        el.setAttribute('aria-selected', String(i === selectedIndex));
      });
      const selectedEl = items[selectedIndex];
      if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }

    function ejecutarComando(cmd) {
      cerrar();
      if (cmd && typeof cmd.accion === 'function') cmd.accion();
    }

    function filtrar(query) {
      const term = normalizar(query);
      const todos = f_construir_registro_comandos();
      if (!term) {
        renderizarResultados(todos);
        return;
      }
      renderizarResultados(todos.filter(cmd => normalizar(`${cmd.titulo} ${cmd.categoria} ${(cmd.tags || []).join(' ')}`).includes(term)));
    }

    function abrir() {
      lastFocusedBeforeModal = document.activeElement;
      input.value = '';
      input.placeholder = ResumeApp.state.t('palette.placeholder', ResumeApp.state.estado.idioma);
      dialog.setAttribute('aria-label', ResumeApp.state.t('palette.title', ResumeApp.state.estado.idioma));
      resultsContainer.setAttribute('aria-label', ResumeApp.state.t('palette.resultsAria', ResumeApp.state.estado.idioma));
      filtrar('');
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      input.focus();
    }

    function cerrar() {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') lastFocusedBeforeModal.focus();
    }

    input.addEventListener('input', () => {
      selectedIndex = 0;
      filtrar(input.value);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (comandosFiltrados.length > 0) {
          selectedIndex = (selectedIndex + 1) % comandosFiltrados.length;
          actualizarSeleccionVisual();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (comandosFiltrados.length > 0) {
          selectedIndex = (selectedIndex - 1 + comandosFiltrados.length) % comandosFiltrados.length;
          actualizarSeleccionVisual();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (comandosFiltrados[selectedIndex]) ejecutarComando(comandosFiltrados[selectedIndex]);
      } else if (e.key === 'Escape') {
        cerrar();
      }
    });

    if (btnRail) btnRail.addEventListener('click', abrir);
    if (btnMobile) btnMobile.addEventListener('click', abrir);

    let clickStartedOutside = false;
    dialog.addEventListener('mousedown', e => {
      clickStartedOutside = f_es_click_fuera_dialog(dialog, '.palette-card', e);
    });
    dialog.addEventListener('click', e => {
      if (clickStartedOutside && f_es_click_fuera_dialog(dialog, '.palette-card', e)) cerrar();
      clickStartedOutside = false;
    });

    dialog.querySelectorAll('[data-close-palette]').forEach(el => el.addEventListener('click', cerrar));
    dialog.addEventListener('cancel', () => {
      if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') lastFocusedBeforeModal.focus();
    });

    globalScope.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        const activeTag = (document.activeElement && document.activeElement.tagName) || '';
        const isEditable = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || (document.activeElement && document.activeElement.isContentEditable);
        if (isEditable && document.activeElement !== input) return;
        e.preventDefault();
        if (dialog.hasAttribute('open')) cerrar();
        else abrir();
      }
    });
  }

  ResumeApp.palette = {
    f_es_click_fuera_dialog,
    f_abrir_modal_contacto,
    f_iniciar_modal_qr,
    f_iniciar_paleta_comandos,
  };
})(window);
