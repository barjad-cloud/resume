/**
 * @file assets/js/journey.js
 * @description Avatar runner interactivo, barra de progreso del encabezado, bocadillos de diálogo y confeti.
 */

(function initJourneyModule(globalScope) {
  'use strict';

  const ResumeApp = globalScope.ResumeApp = globalScope.ResumeApp || {};

  const AVATAR_ESTADOS = [
    { seccionId: 'profile', propId: 'prop-profile', claveTexto: 'avatar.speechProfile', orden: 1 },
    { seccionId: 'highlights', propId: 'prop-highlights', claveTexto: 'avatar.speechHighlights', orden: 2 },
    { seccionId: 'stack', propId: 'prop-stack', claveTexto: 'avatar.speechStack', orden: 3 },
    { seccionId: 'experience', propId: 'prop-experience', claveTexto: 'avatar.speechExperience', orden: 4 },
    { seccionId: 'projects', propId: 'prop-projects', claveTexto: 'avatar.speechProjects', orden: 5 },
    { seccionId: 'education', propId: 'prop-education', claveTexto: 'avatar.speechEducation', orden: 6 },
    { seccionId: 'languages', propId: 'prop-languages', claveTexto: 'avatar.speechLanguages', orden: 7 },
  ];

  function v_validar_soporte_animacion_avatar() {
    return !('matchMedia' in globalScope) || !globalScope.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function f_disparar_confeti_avatar(anchorEl) {
    if (!anchorEl || !('getBoundingClientRect' in anchorEl)) return;
    const rect = anchorEl.getBoundingClientRect();
    const contenedor = document.createElement('div');
    contenedor.className = 'confetti-wrapper no-print';
    contenedor.style.position = 'fixed';
    contenedor.style.left = `${rect.left + rect.width / 2}px`;
    contenedor.style.top = `${rect.top}px`;
    contenedor.style.pointerEvents = 'none';
    contenedor.style.zIndex = '9999';

    const colores = ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 16; i += 1) {
      const p = document.createElement('span');
      p.className = 'confetti-particle';
      const angulo = (Math.PI * 2 * i) / 16;
      const dist = 24 + Math.random() * 36;
      const x = Math.cos(angulo) * dist;
      const y = Math.sin(angulo) * dist - 20;
      p.style.setProperty('--confetti-x', `${x.toFixed(1)}px`);
      p.style.setProperty('--confetti-y', `${y.toFixed(1)}px`);
      p.style.setProperty('--confetti-r', `${(Math.random() * 540 - 270).toFixed(0)}deg`);
      p.style.backgroundColor = colores[i % colores.length];
      contenedor.appendChild(p);
    }
    document.body.appendChild(contenedor);
    setTimeout(() => {
      if (contenedor.parentNode) contenedor.parentNode.removeChild(contenedor);
    }, 1200);
  }

  function f_iniciar_avatar_runner(secciones, drawerCtrl, onCtaClick) {
    const shelf = document.getElementById('header-journey-shelf');
    const track = document.getElementById('header-avatar-track');
    const runner = document.getElementById('header-avatar-runner');
    const speechBubble = document.getElementById('avatar-speech-bubble');
    const speechText = document.getElementById('avatar-speech-text');
    const contactSign = document.getElementById('avatar-contact-sign');
    const graphicContainer = document.getElementById('avatar-graphic-container');
    const achievementBadge = document.getElementById('drawer-achievement-badge');
    const avatarBtns = document.querySelectorAll('[data-avatar-btn]');

    if (!track || !runner) {
      return {
        actualizarPosicion: () => {},
        sincronizarEstado: () => {},
        actualizarIdioma: () => {},
        activarModo: () => {},
        enfocar: () => {},
      };
    }

    let activo = ResumeApp.state.f_leer_storage('resume_avatar_mode', 'on') !== 'off';
    let seccionActiva = 'profile';
    let completado = ResumeApp.state.f_leer_storage('resume_journey_completed', 'false') === 'true';
    let walkingTimer = null;
    let easterEggTimer = null;
    let ultimoRatio = 0;

    runner.classList.toggle('is-disabled', !activo);
    if (shelf) shelf.classList.toggle('is-avatar-off', !activo);
    avatarBtns.forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-avatar-btn') === (activo ? 'on' : 'off')));
    });

    if (completado && achievementBadge) achievementBadge.hidden = false;

    const mapaTextos = {};
    AVATAR_ESTADOS.forEach(est => { mapaTextos[est.seccionId] = est.claveTexto; });

    function actualizarTextoBocadillo(clave) {
      if (speechText) speechText.textContent = ResumeApp.state.t(clave);
    }

    function sincronizarEstado(seccionId) {
      if (!seccionId) return;
      seccionActiva = seccionId;
      runner.setAttribute('data-active-section', seccionId);
      if (!speechBubble || speechBubble.classList.contains('is-easter-egg')) return;
      let clave = mapaTextos[seccionId] || 'avatar.speechProfile';
      if (seccionId === 'experience') {
        const currR = parseFloat(runner.style.getPropertyValue('--scroll-progress') || '0');
        if (currR >= 0.50) clave = 'avatar.speechExperience2';
      }
      actualizarTextoBocadillo(clave);
    }

    function dispararCelebracionCompletado() {
      if (completado) return;
      completado = true;
      ResumeApp.state.f_guardar_storage('resume_journey_completed', 'true');
      if (achievementBadge) achievementBadge.hidden = false;
      if (speechBubble) speechBubble.hidden = true;
      if (contactSign) contactSign.hidden = false;
      runner.setAttribute('data-state', 'complete');
      const svg = runner.querySelector('.daniel-avatar-svg');
      if (svg) svg.setAttribute('viewBox', '-190 0 270 96');
      f_disparar_confeti_avatar(contactSign || runner);
    }

    function actualizarPosicion(ratio) {
      if (!activo) return;
      const r = Math.min(1, Math.max(0, ratio));
      ultimoRatio = r;
      runner.style.setProperty('--scroll-progress', r.toFixed(4));
      runner.style.left = `${(r * 100).toFixed(2)}%`;
      runner.style.transform = `translate3d(-${(r * 100).toFixed(2)}%, 0, 0)`;

      const esMovil = globalScope.innerWidth < 641;
      const limiteIzq = esMovil ? 0.30 : 0.14;
      const limiteDer = esMovil ? 0.70 : 0.82;
      if (r <= limiteIzq) runner.setAttribute('data-edge', 'left');
      else if (r >= limiteDer) runner.setAttribute('data-edge', 'right');
      else runner.removeAttribute('data-edge');

      if (seccionActiva === 'experience' && speechText && (!speechBubble || !speechBubble.classList.contains('is-easter-egg'))) {
        actualizarTextoBocadillo(r >= 0.50 ? 'avatar.speechExperience2' : 'avatar.speechExperience');
      }

      if (v_validar_soporte_animacion_avatar()) {
        runner.classList.add('is-walking');
        if (walkingTimer) clearTimeout(walkingTimer);
        walkingTimer = setTimeout(() => runner.classList.remove('is-walking'), 150);
      }

      if (r >= 0.96) {
        if (speechBubble) speechBubble.hidden = true;
        if (contactSign) contactSign.hidden = false;
        runner.setAttribute('data-state', 'complete');
        const svg = runner.querySelector('.daniel-avatar-svg');
        if (svg) svg.setAttribute('viewBox', '-190 0 270 96');
        dispararCelebracionCompletado();
      } else {
        if (contactSign) contactSign.hidden = true;
        if (speechBubble && activo) speechBubble.hidden = false;
        runner.removeAttribute('data-state');
        const svg = runner.querySelector('.daniel-avatar-svg');
        if (svg) svg.setAttribute('viewBox', '0 0 80 96');
        if (r < 0.92) completado = false;
      }
    }

    function activarModo(on) {
      activo = on;
      runner.classList.toggle('is-disabled', !on);
      if (shelf) shelf.classList.toggle('is-avatar-off', !on);
      avatarBtns.forEach(btn => {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-avatar-btn') === (on ? 'on' : 'off')));
      });
      ResumeApp.state.f_guardar_storage('resume_avatar_mode', on ? 'on' : 'off');
      if (on) actualizarPosicion(ultimoRatio);
    }

    function activarCtaContratame() {
      if (typeof onCtaClick === 'function') onCtaClick();
      f_disparar_confeti_avatar(contactSign || runner);
    }

    function dispararEasterEgg() {
      if (easterEggTimer) clearTimeout(easterEggTimer);
      runner.classList.add('is-bouncing');
      if (speechBubble) {
        speechBubble.classList.add('is-easter-egg');
        actualizarTextoBocadillo('avatar.easterEgg');
      }
      easterEggTimer = setTimeout(() => {
        runner.classList.remove('is-bouncing');
        if (speechBubble) {
          speechBubble.classList.remove('is-easter-egg');
          actualizarTextoBocadillo(mapaTextos[seccionActiva] || 'avatar.speechProfile');
        }
      }, 3000);
    }

    function enfocar() {
      if (!activo) activarModo(true);
      dispararEasterEgg();
    }

    if (graphicContainer) {
      graphicContainer.addEventListener('click', () => {
        if (runner.getAttribute('data-state') === 'complete') activarCtaContratame();
        else dispararEasterEgg();
      });
      graphicContainer.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (runner.getAttribute('data-state') === 'complete') activarCtaContratame();
          else dispararEasterEgg();
        }
      });
    }

    if (contactSign) {
      contactSign.addEventListener('click', e => {
        e.stopPropagation();
        activarCtaContratame();
      });
    }

    avatarBtns.forEach(btn => {
      btn.addEventListener('click', () => activarModo(btn.getAttribute('data-avatar-btn') === 'on'));
    });

    return {
      actualizarPosicion,
      sincronizarEstado,
      actualizarIdioma: () => {
        let clave = mapaTextos[seccionActiva] || 'avatar.speechProfile';
        if (seccionActiva === 'experience') {
          const currR = parseFloat(runner.style.getPropertyValue('--scroll-progress') || '0');
          if (currR >= 0.50) clave = 'avatar.speechExperience2';
        }
        actualizarTextoBocadillo(clave);
        const signText = document.querySelector('.contact-sign-text');
        if (signText) signText.textContent = ResumeApp.state.t('avatar.completeCta');
        const cartelSvgText = runner.querySelector('.avatar-cartel-text');
        if (cartelSvgText) cartelSvgText.textContent = ResumeApp.state.t('avatar.completeCta');
      },
      activarModo,
      enfocar,
      activarCtaContratame,
    };
  }

  ResumeApp.journey = {
    AVATAR_ESTADOS,
    f_iniciar_avatar_runner,
    f_disparar_confeti_avatar,
    v_validar_soporte_animacion_avatar,
  };
})(window);
