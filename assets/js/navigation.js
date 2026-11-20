/**
 * @file assets/js/navigation.js
 * @description Navegación por secciones: Drawer lateral, Right Rail, ScrollSpy, shells colapsables y atajos.
 */

(function initNavigationModule(globalScope) {
  'use strict';

  const ResumeApp = globalScope.ResumeApp = globalScope.ResumeApp || {};
  const i18nData = globalScope.RESUME_I18N || {};
  const { SECCIONES_INDICE } = i18nData;

  let scrollLockTimer = null;
  let scrollProgramatico = false;
  let lastFocusedBeforeModal = null;

  function f_iniciar_shells_seccion() {
    document.querySelectorAll('.section-shell').forEach(section => {
      const collapseBtn = section.querySelector('.section-collapse-btn');
      if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
          const isCollapsed = section.classList.toggle('is-collapsed');
          collapseBtn.setAttribute('aria-expanded', String(!isCollapsed));
          f_sincronizar_boton_plegar_todo();
        });
      }
    });

    const toggleAllBtn = document.getElementById('btn-toggle-all-sections');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        const shells = Array.from(document.querySelectorAll('.section-shell'));
        const todasPlegadas = shells.length > 0 && shells.every(sec => sec.classList.contains('is-collapsed'));
        const plegar = !todasPlegadas;
        shells.forEach(sec => {
          sec.classList.toggle('is-collapsed', plegar);
          const collapseBtn = sec.querySelector('.section-collapse-btn');
          if (collapseBtn) collapseBtn.setAttribute('aria-expanded', String(!plegar));
        });
        f_sincronizar_boton_plegar_todo();
      });
    }
  }

  function f_expandir_seccion_si_plegada(sectionEl) {
    if (sectionEl.classList.contains('is-collapsed')) {
      sectionEl.classList.remove('is-collapsed');
      const collapseBtn = sectionEl.querySelector('.section-collapse-btn');
      if (collapseBtn) collapseBtn.setAttribute('aria-expanded', 'true');
      f_sincronizar_boton_plegar_todo();
    }
  }

  function f_sincronizar_boton_plegar_todo(idioma = ResumeApp.state.estado.idioma) {
    const btn = document.getElementById('btn-toggle-all-sections');
    if (!btn) return;
    const shells = Array.from(document.querySelectorAll('.section-shell'));
    const todasPlegadas = shells.length > 0 && shells.every(sec => sec.classList.contains('is-collapsed'));
    const key = todasPlegadas ? 'drawer.expandAll' : 'drawer.collapseAll';
    btn.setAttribute('data-i18n', key);
    btn.setAttribute('aria-pressed', String(todasPlegadas));
    btn.textContent = ResumeApp.state.t(key, idioma);
  }

  function f_sincronizar_pista_apariencia(idioma = ResumeApp.state.estado.idioma) {
    const hint = document.getElementById('drawer-appearance-hint');
    if (!hint) return;
    const themeKeys = {
      system: 'drawer.themeSystem',
      light: 'drawer.themeLight',
      dark: 'drawer.themeDark',
      daniel: 'drawer.themeDaniel',
    };
    hint.textContent = ResumeApp.state.t(themeKeys[ResumeApp.state.estado.tema] || 'drawer.themeLight', idioma);
  }

  function f_gestionar_drawer() {
    const drawer = document.getElementById('resume-drawer');
    const drawerInner = document.getElementById('drawer-inner');
    const main = document.getElementById('resume-main');
    const closeBtn = document.getElementById('drawer-collapse-btn');
    const reopenBtn = document.getElementById('drawer-reopen-btn');
    const backdrop = document.getElementById('drawer-backdrop');
    const desktopMedia = globalScope.matchMedia('(min-width: 1024px)');

    if (!drawer || !drawerInner || !main || !closeBtn || !reopenBtn || !backdrop) {
      return { cerrarMovilSiAplica: () => {} };
    }

    ResumeApp.state.estado.abiertoDesktop = ResumeApp.state.f_leer_storage(ResumeApp.state.STORAGE_KEYS.drawerDesktop, 'open') !== 'collapsed';
    ResumeApp.state.estado.abiertoMovil = false;

    function sincronizarUI() {
      const isDesktop = desktopMedia.matches;
      if (isDesktop) {
        ResumeApp.state.estado.abiertoMovil = false;
        document.documentElement.setAttribute('data-drawer-desktop', ResumeApp.state.estado.abiertoDesktop ? 'open' : 'collapsed');
        document.documentElement.setAttribute('data-drawer-mobile', 'closed');
        drawer.removeAttribute('role');
        drawer.removeAttribute('aria-modal');
        main.removeAttribute('inert');
        drawer.setAttribute('aria-hidden', String(!ResumeApp.state.estado.abiertoDesktop));
        if (ResumeApp.state.estado.abiertoDesktop) drawerInner.removeAttribute('inert');
        else drawerInner.setAttribute('inert', '');
        closeBtn.setAttribute('aria-expanded', String(ResumeApp.state.estado.abiertoDesktop));
        reopenBtn.setAttribute('aria-expanded', String(ResumeApp.state.estado.abiertoDesktop));
      } else {
        document.documentElement.setAttribute('data-drawer-mobile', ResumeApp.state.estado.abiertoMovil ? 'open' : 'closed');
        if (ResumeApp.state.estado.abiertoMovil) {
          drawer.setAttribute('role', 'dialog');
          drawer.setAttribute('aria-modal', 'true');
          drawer.setAttribute('aria-hidden', 'false');
          drawerInner.removeAttribute('inert');
          main.setAttribute('inert', '');
        } else {
          drawer.removeAttribute('role');
          drawer.removeAttribute('aria-modal');
          drawer.setAttribute('aria-hidden', 'true');
          drawerInner.setAttribute('inert', '');
          main.removeAttribute('inert');
        }
        const exp = String(ResumeApp.state.estado.abiertoMovil);
        closeBtn.setAttribute('aria-expanded', exp);
        reopenBtn.setAttribute('aria-expanded', exp);
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', exp);
      }
    }

    function abrirDrawer() {
      if (desktopMedia.matches) {
        ResumeApp.state.estado.abiertoDesktop = true;
        ResumeApp.state.f_guardar_storage(ResumeApp.state.STORAGE_KEYS.drawerDesktop, 'open');
      } else {
        lastFocusedBeforeModal = document.activeElement;
        ResumeApp.state.estado.abiertoMovil = true;
      }
      sincronizarUI();
      closeBtn.focus();
    }

    function cerrarDrawer(restaurarFoco = true) {
      if (desktopMedia.matches) {
        ResumeApp.state.estado.abiertoDesktop = false;
        ResumeApp.state.f_guardar_storage(ResumeApp.state.STORAGE_KEYS.drawerDesktop, 'collapsed');
        sincronizarUI();
        if (restaurarFoco) reopenBtn.focus();
      } else {
        ResumeApp.state.estado.abiertoMovil = false;
        sincronizarUI();
        if (restaurarFoco && lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
          lastFocusedBeforeModal.focus();
        }
      }
    }

    closeBtn.addEventListener('click', () => cerrarDrawer(true));
    reopenBtn.addEventListener('click', abrirDrawer);
    backdrop.addEventListener('click', () => cerrarDrawer(false));

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', abrirDrawer);

    globalScope.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !desktopMedia.matches && ResumeApp.state.estado.abiertoMovil) {
        e.preventDefault();
        cerrarDrawer(true);
      }
    });

    if (typeof desktopMedia.addEventListener === 'function') {
      desktopMedia.addEventListener('change', sincronizarUI);
    }
    sincronizarUI();

    return {
      cerrarMovilSiAplica: () => {
        if (!desktopMedia.matches && ResumeApp.state.estado.abiertoMovil) cerrarDrawer(false);
      },
    };
  }

  function f_iniciar_scrollspy_y_shell(secciones, alNavegarMovil, avatarCtrl) {
    const links = Array.from(document.querySelectorAll('.scrollspy-link'));
    const sectionEls = secciones.map(s => document.getElementById(s.id)).filter(Boolean);
    const resumeContainer = document.getElementById('resume-container');
    const scrollBody = document.getElementById('resume-scroll-body');
    const progressBar = document.getElementById('header-progress-bar');
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const desktopMedia = globalScope.matchMedia('(min-width: 1024px)');

    if (links.length === 0 || sectionEls.length === 0 || !scrollBody || !resumeContainer) return;

    const ultimaId = secciones[secciones.length - 1].id;
    let observer = null;

    function marcarActiva(id) {
      links.forEach(link => {
        if (link.getAttribute('data-spy-target') === id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      if (avatarCtrl && typeof avatarCtrl.sincronizarEstado === 'function') {
        avatarCtrl.sincronizarEstado(id);
      }
    }

    function obtenerMetricasScroll() {
      const isInnerScroll = scrollBody && scrollBody.scrollHeight > scrollBody.clientHeight + 5;
      const innerTop = scrollBody ? scrollBody.scrollTop : 0;
      const windowTop = globalScope.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (isInnerScroll) {
        return { top: innerTop, viewHeight: scrollBody.clientHeight, totalHeight: scrollBody.scrollHeight };
      }
      return {
        top: windowTop > 0 ? windowTop : innerTop,
        viewHeight: globalScope.innerHeight || document.documentElement.clientHeight,
        totalHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      };
    }

    function actualizarTelemetriaScroll() {
      const { top, viewHeight, totalHeight } = obtenerMetricasScroll();
      const maxScroll = Math.max(0, totalHeight - viewHeight);
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, top / maxScroll)) : 0;

      if (progressBar) {
        progressBar.style.setProperty('--scroll-progress', ratio.toFixed(4));
        progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }
      if (avatarCtrl && typeof avatarCtrl.actualizarPosicion === 'function') {
        avatarCtrl.actualizarPosicion(ratio);
      }

      if (top > 36 && !resumeContainer.classList.contains('is-scrolled')) {
        resumeContainer.classList.add('is-scrolled');
        document.documentElement.setAttribute('data-scrolled', 'true');
      } else if (top < 8 && resumeContainer.classList.contains('is-scrolled')) {
        resumeContainer.classList.remove('is-scrolled');
        document.documentElement.setAttribute('data-scrolled', 'false');
      }

      if (scrollTopBtn) scrollTopBtn.classList.toggle('is-visible', top > 220);

      if (!scrollProgramatico) {
        if (maxScroll > 0 && top + viewHeight >= totalHeight - 24) marcarActiva(ultimaId);
        else if (top < 24) marcarActiva(secciones[0].id);
      }
    }

    function montarObserver() {
      if (observer) { observer.disconnect(); observer = null; }
      if (!('IntersectionObserver' in globalScope)) return;
      observer = new IntersectionObserver(
        entries => {
          if (scrollProgramatico) return;
          const visibles = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visibles.length > 0) marcarActiva(visibles[0].target.id);
        },
        { root: desktopMedia.matches ? scrollBody : null, rootMargin: '-12% 0px -70% 0px', threshold: 0 }
      );
      sectionEls.forEach(sec => observer.observe(sec));
    }

    let rafPending = false;
    function onScrollEvent() {
      if (rafPending) return;
      rafPending = true;
      globalScope.requestAnimationFrame(() => {
        rafPending = false;
        actualizarTelemetriaScroll();
      });
    }

    scrollBody.addEventListener('scroll', onScrollEvent, { passive: true });
    globalScope.addEventListener('scroll', onScrollEvent, { passive: true });

    if (typeof desktopMedia.addEventListener === 'function') {
      desktopMedia.addEventListener('change', () => {
        montarObserver();
        actualizarTelemetriaScroll();
      });
    }

    marcarActiva(secciones[0].id);
    montarObserver();
    actualizarTelemetriaScroll();

    links.forEach(link => {
      link.addEventListener('click', e => {
        const targetId = link.getAttribute('data-spy-target');
        const targetEl = targetId ? document.getElementById(targetId) : null;
        if (!targetEl) return;

        e.preventDefault();
        f_expandir_seccion_si_plegada(targetEl);
        scrollProgramatico = true;
        marcarActiva(targetId);
        alNavegarMovil();

        const prefersReduced = globalScope.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const behavior = prefersReduced ? 'auto' : 'smooth';
        const isInnerScroll = scrollBody && scrollBody.scrollHeight > scrollBody.clientHeight + 5;

        if (desktopMedia.matches || isInnerScroll) {
          scrollBody.scrollTo({ top: Math.max(0, targetEl.offsetTop - 16), behavior });
        } else {
          targetEl.scrollIntoView({ behavior, block: 'start' });
        }

        const liberar = () => {
          scrollProgramatico = false;
          actualizarTelemetriaScroll();
        };
        if (scrollLockTimer) globalScope.clearTimeout(scrollLockTimer);
        scrollLockTimer = globalScope.setTimeout(liberar, prefersReduced ? 50 : 650);

        const scrollTarget = desktopMedia.matches ? scrollBody : globalScope;
        if ('onscrollend' in scrollTarget) {
          scrollTarget.addEventListener('scrollend', () => {
            if (scrollLockTimer) globalScope.clearTimeout(scrollLockTimer);
            liberar();
          }, { once: true });
        }
      });
    });

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        const behavior = globalScope.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        if (desktopMedia.matches) scrollBody.scrollTo({ top: 0, behavior });
        else globalScope.scrollTo({ top: 0, behavior });
      });
    }
  }

  function f_iniciar_rail_derecho() {
    const navTools = document.getElementById('resume-nav-tools');
    const drawerSlot = document.getElementById('drawer-nav-slot');
    const rightRail = document.getElementById('resume-right-rail');
    if (!navTools || !drawerSlot || !rightRail) return;
    const wideMedia = globalScope.matchMedia('(min-width: 1360px)');

    function sincronizarUbicacion() {
      const destino = wideMedia.matches ? rightRail : drawerSlot;
      if (navTools.parentElement !== destino) destino.appendChild(navTools);
      rightRail.setAttribute('aria-hidden', String(!wideMedia.matches));
    }
    if (typeof wideMedia.addEventListener === 'function') {
      wideMedia.addEventListener('change', sincronizarUbicacion);
    }
    sincronizarUbicacion();
  }

  function f_sincronizar_header_movil() {
    const header = document.querySelector('.resume-header');
    const container = document.getElementById('resume-container');
    const scrollBody = document.getElementById('resume-scroll-body');
    const shelf = document.getElementById('header-journey-shelf');
    if (!header || !container || !scrollBody) return;

    if (globalScope.innerWidth < 1024) {
      if (header.parentElement !== scrollBody) scrollBody.insertBefore(header, scrollBody.firstChild);
    } else {
      if (header.parentElement !== container) {
        if (shelf) container.insertBefore(header, shelf);
        else container.insertBefore(header, container.firstChild);
      }
    }
  }

  function f_detectar_plataforma_atajo() {
    let esApple = false;
    try {
      if (typeof navigator !== 'undefined') {
        const plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
        esApple = /mac|iphone|ipad|ipod/i.test(plat);
      }
    } catch (_) {
      esApple = false;
    }
    return {
      glifo: esApple ? '⌘K' : 'Ctrl+K',
      aria: esApple ? 'Command+K' : 'Ctrl+K',
      shortcutAttr: esApple ? 'Meta+K' : 'Control+K',
      esApple,
    };
  }

  function f_actualizar_ui_atajos_plataforma() {
    const info = f_detectar_plataforma_atajo();
    const kbd = document.getElementById('rail-search-kbd');
    if (kbd) kbd.textContent = info.glifo;

    const btnRail = document.getElementById('rail-btn-search');
    if (btnRail) {
      btnRail.setAttribute('aria-keyshortcuts', info.shortcutAttr);
      btnRail.setAttribute('aria-label', `${ResumeApp.state.t('rail.searchCmdAria', ResumeApp.state.estado.idioma)} (${info.aria})`);
    }

    const input = /** @type {HTMLInputElement | null} */ (document.getElementById('palette-input'));
    if (input) input.placeholder = `${ResumeApp.state.t('palette.placeholder', ResumeApp.state.estado.idioma)} (${info.glifo})`;

    const smsParam = info.esApple ? '&body=' : '?body=';
    const smsHref = `sms:+34601732537${smsParam}${encodeURIComponent(ResumeApp.state.t('contact.smsBody', ResumeApp.state.estado.idioma))}`;
    ['modal-sms-btn', 'drawer-sms-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('href', smsHref);
        el.setAttribute('title', 'SMS (+34 601 732 537)');
      }
    });

    ['modal-call-btn', 'drawer-call-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('href', 'tel:+34601732537');
        el.setAttribute('title', `${ResumeApp.state.t('contact.callBtn', ResumeApp.state.estado.idioma)}: +34 601 732 537`);
      }
    });

    const waHref = `https://wa.me/34601732537?text=${encodeURIComponent(ResumeApp.state.t('contact.whatsappMsg', ResumeApp.state.estado.idioma))}`;
    const btnWa = document.getElementById('btn-whatsapp');
    if (btnWa) btnWa.setAttribute('href', waHref);
    const modalWa = document.querySelector('#qr-modal .drawer-btn-whatsapp');
    if (modalWa) modalWa.setAttribute('href', waHref);
  }

  ResumeApp.navigation = {
    f_iniciar_shells_seccion,
    f_expandir_seccion_si_plegada,
    f_sincronizar_boton_plegar_todo,
    f_sincronizar_pista_apariencia,
    f_gestionar_drawer,
    f_iniciar_scrollspy_y_shell,
    f_iniciar_rail_derecho,
    f_sincronizar_header_movil,
    f_detectar_plataforma_atajo,
    f_actualizar_ui_atajos_plataforma,
  };
})(window);
