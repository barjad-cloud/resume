/**
 * @file assets/js/state.js
 * @description Gestión centralizada de estado, persistencia localStorage, temas, densidad y tipografía.
 */

(function initStateModule(globalScope) {
  'use strict';

  const ResumeApp = globalScope.ResumeApp = globalScope.ResumeApp || {};
  const i18nData = globalScope.RESUME_I18N || {};
  const { DICCIONARIO } = i18nData;

  const VALID_LANGS = ['en', 'es'];
  const VALID_THEMES = ['system', 'light', 'dark', 'daniel'];
  const VALID_DENSITIES = ['full', 'compact'];

  const STORAGE_KEYS = {
    lang: 'cv_lang',
    theme: 'cv_theme',
    drawerDesktop: 'cv_drawer_desktop',
    density: 'cv_density',
    keepSections: 'cv_keep_sections',
    fontScale: 'cv_font_scale',
  };

  const estado = {
    abiertoDesktop: true,
    abiertoMovil: false,
    idioma: 'en',
    tema: 'light',
    stackActivo: null,
    densidad: 'full',
    noCortarSecciones: true,
    escalaTexto: 'md',
    destacarMetricas: false,
  };

  let toastTimer = null;
  const feedbackTimers = new WeakMap();

  function f_leer_storage(clave, defecto) {
    try {
      const val = globalScope.localStorage.getItem(clave);
      return val !== null ? val : defecto;
    } catch (_err) {
      return defecto;
    }
  }

  function f_guardar_storage(clave, valor) {
    try {
      globalScope.localStorage.setItem(clave, valor);
    } catch (_err) {}
  }

  function t(clave, idioma = estado.idioma) {
    const langDict = DICCIONARIO[idioma] || DICCIONARIO.en;
    if (Object.prototype.hasOwnProperty.call(langDict.text, clave)) {
      return langDict.text[clave];
    }
    return DICCIONARIO.en.text[clave] || '';
  }

  const f_traducir_texto = t;

  function f_resolver_idioma_inicial() {
    try {
      const params = new URLSearchParams(globalScope.location.search);
      const queryLang = (params.get('lang') || '').toLowerCase();
      if (VALID_LANGS.includes(queryLang)) return queryLang;
    } catch (_err) {}
    const stored = f_leer_storage(STORAGE_KEYS.lang, 'en').toLowerCase();
    return VALID_LANGS.includes(stored) ? stored : 'en';
  }

  function f_capturar_tokens_nodo(contenedor) {
    const tokens = [];
    contenedor.childNodes.forEach(nodo => {
      if (nodo.nodeType === 3 && nodo.textContent) {
        tokens.push(nodo.textContent);
      } else if (nodo.nodeType === 1) {
        const tag = nodo.nodeName.toLowerCase();
        if (tag === 'strong' || tag === 'em') {
          tokens.push([tag, nodo.textContent || '']);
        } else {
          tokens.push(nodo.textContent || '');
        }
      }
    });
    return tokens;
  }

  function f_capturar_en_desde_dom() {
    const enDict = DICCIONARIO.en;
    if (!enDict.rich) enDict.rich = {};

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (k && !Object.prototype.hasOwnProperty.call(enDict.text, k)) {
        enDict.text[k] = (el.textContent || '').replace(/\s+/g, ' ').trim();
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const k = el.getAttribute('data-i18n-aria');
      if (k && !Object.prototype.hasOwnProperty.call(enDict.text, k)) {
        enDict.text[k] = el.getAttribute('aria-label') || '';
      }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const k = el.getAttribute('data-i18n-alt');
      if (k && !Object.prototype.hasOwnProperty.call(enDict.text, k)) {
        enDict.text[k] = el.getAttribute('alt') || '';
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const k = el.getAttribute('data-i18n-placeholder');
      if (k && !Object.prototype.hasOwnProperty.call(enDict.text, k)) {
        enDict.text[k] = el.getAttribute('placeholder') || '';
      }
    });

    document.querySelectorAll('[data-i18n-rich]').forEach(el => {
      const k = el.getAttribute('data-i18n-rich');
      if (k) enDict.rich[k] = f_capturar_tokens_nodo(/** @type {HTMLElement} */ (el));
    });
  }

  function f_renderizar_nodos_seguros(contenedor, tokens) {
    const fragmento = document.createDocumentFragment();
    tokens.forEach(token => {
      if (typeof token === 'string') {
        fragmento.appendChild(document.createTextNode(token));
      } else if (Array.isArray(token) && token.length === 2) {
        const [tag, texto] = token;
        if (tag === 'strong' || tag === 'em') {
          const nodo = document.createElement(tag);
          nodo.textContent = texto;
          fragmento.appendChild(nodo);
        }
      }
    });
    contenedor.replaceChildren(fragmento);
  }

  function f_mostrar_toast(mensaje) {
    const el = document.getElementById('toast-message');
    if (!el) return;
    el.textContent = mensaje;
    el.classList.add('is-visible');
    if (toastTimer) globalScope.clearTimeout(toastTimer);
    toastTimer = globalScope.setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  function f_feedback_boton(btn, claveTexto) {
    if (!btn) return;
    const span = btn.querySelector('span[data-i18n]');
    if (!span) return;
    const origKey = span.getAttribute('data-i18n');
    const prevTimer = feedbackTimers.get(btn);
    if (prevTimer) globalScope.clearTimeout(prevTimer);
    btn.classList.add('is-copied');
    span.textContent = `✓ ${t(claveTexto)}`;
    const timer = globalScope.setTimeout(() => {
      btn.classList.remove('is-copied');
      if (origKey) span.textContent = t(origKey);
      feedbackTimers.delete(btn);
    }, 1500);
    feedbackTimers.set(btn, timer);
  }

  function f_aplicar_tema(tema) {
    const temaSeguro = VALID_THEMES.includes(tema) ? tema : 'light';
    estado.tema = temaSeguro;
    document.documentElement.setAttribute('data-theme', temaSeguro);
    f_guardar_storage(STORAGE_KEYS.theme, temaSeguro);
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-btn') === temaSeguro));
    });
    if (ResumeApp.navigation && typeof ResumeApp.navigation.f_sincronizar_pista_apariencia === 'function') {
      ResumeApp.navigation.f_sincronizar_pista_apariencia();
    }
  }

  function f_aplicar_densidad(densidad) {
    const densSegura = VALID_DENSITIES.includes(densidad) ? densidad : 'full';
    estado.densidad = densSegura;
    document.documentElement.setAttribute('data-density', densSegura);
    f_guardar_storage(STORAGE_KEYS.density, densSegura);
    document.querySelectorAll('[data-density-btn]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-density-btn') === densSegura));
    });
  }

  function f_aplicar_escala_tipografica(escala) {
    const ESCALAS = { sm: 0.94, md: 1.0, lg: 1.08 };
    const escalaSegura = ['sm', 'md', 'lg'].includes(escala) ? escala : 'md';
    estado.escalaTexto = escalaSegura;
    document.documentElement.style.setProperty('--ctx-font-scale', String(ESCALAS[escalaSegura]));
    f_guardar_storage(STORAGE_KEYS.fontScale, escalaSegura);
    document.querySelectorAll('[data-scale-btn]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-scale-btn') === escalaSegura));
    });
  }

  function f_aplicar_visibilidad_github_home(visualize_github_home) {
    document.querySelectorAll('[data-github-home]').forEach(el => {
      /** @type {HTMLElement} */ (el).hidden = !visualize_github_home;
    });
    const jsonLdEl = document.getElementById('resume-jsonld');
    if (jsonLdEl && jsonLdEl.textContent) {
      try {
        const data = JSON.parse(jsonLdEl.textContent);
        if (data && data.mainEntity && i18nData.CONFIG_CONTACTO) {
          data.mainEntity.sameAs = visualize_github_home
            ? [i18nData.CONFIG_CONTACTO.linkedinUrl, i18nData.CONFIG_CONTACTO.githubUrl]
            : [i18nData.CONFIG_CONTACTO.linkedinUrl];
          jsonLdEl.textContent = JSON.stringify(data);
        }
      } catch (_err) {}
    }
  }

  function f_ejecutar_transicion_vista(callback) {
    if (!document.startViewTransition || globalScope.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      callback();
      return;
    }
    document.startViewTransition(callback);
  }

  async function f_copiar_al_portapapeles(texto, claveToast) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(texto);
        f_mostrar_toast(t(claveToast));
        return true;
      }
    } catch (_err) {}

    try {
      const area = document.createElement('textarea');
      area.value = texto;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      f_mostrar_toast(t(ok ? claveToast : 'toast.copyError'));
      return ok;
    } catch (_err) {
      f_mostrar_toast(t('toast.copyError'));
      return false;
    }
  }

  ResumeApp.state = {
    estado,
    STORAGE_KEYS,
    VALID_LANGS,
    VALID_THEMES,
    VALID_DENSITIES,
    f_leer_storage,
    f_guardar_storage,
    t,
    f_traducir_texto,
    f_resolver_idioma_inicial,
    f_capturar_tokens_nodo,
    f_capturar_en_desde_dom,
    f_renderizar_nodos_seguros,
    f_mostrar_toast,
    f_feedback_boton,
    f_aplicar_tema,
    f_aplicar_densidad,
    f_aplicar_escala_tipografica,
    f_aplicar_visibilidad_github_home,
    f_ejecutar_transicion_vista,
    f_copiar_al_portapapeles,
  };
})(window);
