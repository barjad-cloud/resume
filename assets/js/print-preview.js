/**
 * @file assets/js/print-preview.js
 * @description Motor interactivo de paginación A4 en pantalla, simulación fiel de impresión y responsive scaling.
 */

(function initPrintPreviewModule(globalScope) {
  'use strict';

  const ResumeApp = globalScope.ResumeApp = globalScope.ResumeApp || {};
  let savedScrollTop = 0;

  function f_renderizar_paginas_a4() {
    const pagesHost = document.getElementById('a4-preview-pages');
    const resumeContainer = document.getElementById('resume-container');
    const pageCountEl = document.getElementById('preview-page-count');
    if (!pagesHost || !resumeContainer) return 0;

    pagesHost.replaceChildren();
    pagesHost.hidden = false;

    function clonarLimpio(el) {
      const clone = /** @type {HTMLElement} */ (el.cloneNode(true));
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      clone.querySelectorAll(
        '.no-print, .header-journey-shelf, .header-progress, .header-avatar-track, .header-avatar-runner, .avatar-speech-bubble, .avatar-contact-sign, .avatar-complete-banner, .section-shell-actions, .ats-semantic-layer, [hidden]'
      ).forEach(n => n.remove());
      clone.classList.remove('is-stack-dim', 'is-stack-match');
      clone.querySelectorAll('.is-stack-dim, .is-stack-match').forEach(n => n.classList.remove('is-stack-dim', 'is-stack-match'));
      return clone;
    }

    const hojas = [];
    let contenidoActual = null;
    let maxAlturaUtil = 0;

    function nuevaHoja() {
      const frame = document.createElement('div');
      frame.className = 'a4-sheet-frame';
      const sheet = document.createElement('article');
      sheet.className = 'a4-sheet';
      const content = document.createElement('div');
      content.className = 'a4-sheet-content';
      const footer = document.createElement('div');
      footer.className = 'a4-page-footer';

      sheet.appendChild(content);
      sheet.appendChild(footer);
      frame.appendChild(sheet);
      pagesHost.appendChild(frame);

      if (maxAlturaUtil === 0) {
        const cs = globalScope.getComputedStyle(sheet);
        maxAlturaUtil = Math.floor(sheet.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 6);
      }
      hojas.push({ frame, sheet, content, footer });
      contenidoActual = content;
    }

    function desborda() {
      return contenidoActual.offsetHeight > maxAlturaUtil;
    }

    function agregarGrupo(nodos) {
      const estaVacia = contenidoActual.childElementCount === 0;
      nodos.forEach(n => contenidoActual.appendChild(n));
      if (!desborda() || estaVacia) return !desborda();
      nodos.forEach(n => n.remove());
      nuevaHoja();
      nodos.forEach(n => contenidoActual.appendChild(n));
      return !desborda();
    }

    function paginarColeccion(items, crearContenedor, agregarHijo, headingPendiente) {
      if (items.length === 0) return;
      let contenedor = crearContenedor();
      let heading = headingPendiente;
      for (let i = 0; i < items.length; i += 1) {
        const itemClone = clonarLimpio(items[i]);
        if (!contenedor.parentElement) {
          agregarHijo(contenedor, itemClone);
          agregarGrupo(heading ? [heading, contenedor] : [contenedor]);
          heading = null;
        } else {
          agregarHijo(contenedor, itemClone);
          if (desborda()) {
            itemClone.remove();
            nuevaHoja();
            contenedor = crearContenedor();
            agregarHijo(contenedor, itemClone);
            contenidoActual.appendChild(contenedor);
          }
        }
      }
    }

    function paginarLista(ulOriginal, headingPendiente) {
      paginarColeccion(
        Array.from(ulOriginal.children),
        () => { const el = document.createElement('ul'); el.className = ulOriginal.className; return el; },
        (parent, child) => parent.appendChild(child),
        headingPendiente
      );
    }

    function paginarTabla(tableOriginal, headingPendiente) {
      paginarColeccion(
        Array.from(tableOriginal.querySelectorAll('tr')),
        () => {
          const tEl = document.createElement('table');
          tEl.className = tableOriginal.className;
          tEl.appendChild(document.createElement('tbody'));
          return tEl;
        },
        (parent, child) => parent.querySelector('tbody').appendChild(child),
        headingPendiente
      );
    }

    function paginarExperiencia(expOriginal, headingPendiente) {
      const expEntero = clonarLimpio(expOriginal);
      const paqueteEntero = headingPendiente ? [headingPendiente, expEntero] : [expEntero];

      paqueteEntero.forEach(n => contenidoActual.appendChild(n));
      const alturaPaquete = paqueteEntero.reduce((acc, n) => acc + n.offsetHeight, 0);
      if (!desborda()) return;
      paqueteEntero.forEach(n => n.remove());

      if (ResumeApp.state.estado.noCortarSecciones && alturaPaquete <= maxAlturaUtil && contenidoActual.childElementCount > 0) {
        nuevaHoja();
        paqueteEntero.forEach(n => contenidoActual.appendChild(n));
        if (!desborda()) return;
        paqueteEntero.forEach(n => n.remove());
      }

      const hijos = Array.from(expOriginal.children);
      if (hijos.length <= 3) {
        if (contenidoActual.childElementCount > 0) nuevaHoja();
        paqueteEntero.forEach(n => contenidoActual.appendChild(n));
        return;
      }

      let wrapActual = document.createElement('div');
      wrapActual.className = 'experience-item';
      const starterCount = Math.min(3, hijos.length);
      for (let i = 0; i < starterCount; i += 1) {
        wrapActual.appendChild(clonarLimpio(hijos[i]));
      }
      agregarGrupo(headingPendiente ? [headingPendiente, wrapActual] : [wrapActual]);

      for (let i = starterCount; i < hijos.length; i += 1) {
        const subClone = clonarLimpio(hijos[i]);
        wrapActual.appendChild(subClone);
        if (desborda()) {
          subClone.remove();
          nuevaHoja();
          wrapActual = document.createElement('div');
          wrapActual.className = 'experience-item is-continued';
          wrapActual.appendChild(subClone);
          contenidoActual.appendChild(wrapActual);
        }
      }
    }

    nuevaHoja();

    const headerOrig = resumeContainer.querySelector('.resume-header');
    if (headerOrig) {
      const headerClone = clonarLimpio(headerOrig);
      agregarGrupo([headerClone]);
    }

    const sections = Array.from(resumeContainer.querySelectorAll('.section-shell'));
    sections.forEach(sec => {
      const titleOrig = sec.querySelector('.section-shell-header h2');
      let headingPendiente = null;
      if (titleOrig) {
        const hWrap = document.createElement('div');
        hWrap.className = 'section-shell-header a4-section-header';
        hWrap.appendChild(clonarLimpio(titleOrig));
        headingPendiente = hWrap;
      }

      const bodyOrig = sec.querySelector('.section-shell-body');
      if (!bodyOrig) {
        if (headingPendiente) agregarGrupo([headingPendiente]);
        return;
      }

      const directChildren = Array.from(bodyOrig.children);
      directChildren.forEach(child => {
        if (child.matches('.experience-item')) {
          paginarExperiencia(child, headingPendiente);
          headingPendiente = null;
        } else if (child.tagName === 'TABLE') {
          paginarTabla(child, headingPendiente);
          headingPendiente = null;
        } else if (child.tagName === 'UL') {
          paginarLista(child, headingPendiente);
          headingPendiente = null;
        } else {
          const blockClone = clonarLimpio(child);
          const paquete = headingPendiente ? [headingPendiente, blockClone] : [blockClone];
          agregarGrupo(paquete);
          headingPendiente = null;
        }
      });
    });

    const closingOrig = document.getElementById('resume-closing-note');
    if (closingOrig) {
      const closingClone = clonarLimpio(closingOrig);
      agregarGrupo([closingClone]);
    }

    const total = hojas.length;
    const isEs = ResumeApp.state.estado.idioma === 'es';
    const wordPagina = ResumeApp.state.t('preview.pageWord') || (isEs ? 'Página' : 'Page');
    const wordDe = isEs ? 'de' : 'of';

    hojas.forEach((h, idx) => {
      const num = idx + 1;
      h.footer.innerHTML = `
        <span class="a4-footer-left">Daniel Barja Centeno &middot; ${ResumeApp.state.t('header.subtitle')}</span>
        <span class="a4-footer-right">${wordPagina} ${num} ${wordDe} ${total}</span>
      `;
    });

    if (pageCountEl) {
      const wordHojas = total === 1 ? ResumeApp.state.t('preview.pagesSingular') : ResumeApp.state.t('preview.pagesPlural');
      pageCountEl.textContent = `${total} ${wordHojas || (isEs ? 'páginas A4' : 'A4 pages')}`;
    }

    f_ajustar_escala_preview();
    return total;
  }

  function f_ajustar_escala_preview() {
    if (document.documentElement.getAttribute('data-preview') !== 'print') return;
    const previewBar = document.getElementById('print-preview-bar');
    if (previewBar && !previewBar.hidden) {
      document.documentElement.style.setProperty('--preview-bar-offset', `${previewBar.offsetHeight + 16}px`);
    }
    const frames = document.querySelectorAll('#a4-preview-pages .a4-sheet-frame');
    if (frames.length === 0) return;
    const availWidth = Math.max(260, (globalScope.innerWidth || 360) - 24);

    frames.forEach(frame => {
      const sheet = frame.querySelector('.a4-sheet');
      if (!sheet) return;
      const sheetW = sheet.offsetWidth;
      const sheetH = sheet.offsetHeight;
      if (!sheetW || !sheetH) return;
      const scale = Math.min(1, availWidth / sheetW);
      if (scale < 0.999) {
        /** @type {HTMLElement} */ (frame).style.width = `${Math.floor(sheetW * scale)}px`;
        /** @type {HTMLElement} */ (frame).style.height = `${Math.floor(sheetH * scale)}px`;
        /** @type {HTMLElement} */ (sheet).style.transform = `scale(${scale.toFixed(4)})`;
      } else {
        /** @type {HTMLElement} */ (frame).style.width = `${sheetW}px`;
        /** @type {HTMLElement} */ (frame).style.height = `${sheetH}px`;
        /** @type {HTMLElement} */ (sheet).style.transform = '';
      }
    });
  }

  function f_aplicar_no_cortar_secciones(activo) {
    ResumeApp.state.estado.noCortarSecciones = Boolean(activo);
    document.documentElement.setAttribute('data-keep-sections', String(ResumeApp.state.estado.noCortarSecciones));
    ResumeApp.state.f_guardar_storage(ResumeApp.state.STORAGE_KEYS.keepSections, String(ResumeApp.state.estado.noCortarSecciones));
    const btn = document.getElementById('btn-preview-keep-sections');
    if (btn) btn.setAttribute('aria-checked', String(ResumeApp.state.estado.noCortarSecciones));
    if (document.documentElement.getAttribute('data-preview') === 'print') f_renderizar_paginas_a4();
  }

  function f_entrar_vista_previa(drawerCtrl) {
    const resumeScrollBody = document.getElementById('resume-scroll-body');
    if (resumeScrollBody) savedScrollTop = resumeScrollBody.scrollTop;
    if (drawerCtrl && typeof drawerCtrl.cerrarMovilSiAplica === 'function') drawerCtrl.cerrarMovilSiAplica();
    document.documentElement.setAttribute('data-preview', 'print');
    const previewBar = document.getElementById('print-preview-bar');
    if (previewBar) previewBar.hidden = false;
    f_renderizar_paginas_a4();
    globalScope.scrollTo({ top: 0, behavior: 'auto' });
    const previewConfirmBtn = document.getElementById('btn-preview-confirm-print');
    if (previewConfirmBtn) previewConfirmBtn.focus();
  }

  function f_salir_vista_previa() {
    if (document.documentElement.getAttribute('data-preview') !== 'print') return;
    document.documentElement.removeAttribute('data-preview');
    document.documentElement.style.removeProperty('--preview-bar-offset');
    const previewBar = document.getElementById('print-preview-bar');
    if (previewBar) previewBar.hidden = true;
    const previewPagesHost = document.getElementById('a4-preview-pages');
    if (previewPagesHost) {
      previewPagesHost.hidden = true;
      previewPagesHost.replaceChildren();
    }
    const resumeScrollBody = document.getElementById('resume-scroll-body');
    if (resumeScrollBody) resumeScrollBody.scrollTop = savedScrollTop;
    const printBtn = document.getElementById('btn-print-pdf');
    if (printBtn) printBtn.focus();
  }

  ResumeApp.print = {
    f_renderizar_paginas_a4,
    f_ajustar_escala_preview,
    f_aplicar_no_cortar_secciones,
    f_entrar_vista_previa,
    f_salir_vista_previa,
  };
})(window);
