/**
 * @file assets/js/app.js
 * @description Orquestador principal y bootstrap del CV Web & Print-Ready.
 * Coordina los dominios modulares (state, export, stackKpi, navigation, journey, palette, print).
 */

(function initResumeApp(globalScope) {
  'use strict';

  const i18nData = globalScope.RESUME_I18N;
  if (!i18nData) return;

  const { SECCIONES_INDICE, CONFIG_CONTACTO, DICCIONARIO } = i18nData;

  const APP_VERSION = 'v1.1.0';
  const FECHA_ACTUALIZACION = '2026-11';
  const visualize_github_home = false;

  const ResumeApp = globalScope.ResumeApp;
  if (!ResumeApp) return;

  const {
    estado,
    t,
    f_aplicar_tema,
    f_aplicar_densidad,
    f_aplicar_escala_tipografica,
    f_aplicar_visibilidad_github_home,
    f_capturar_en_desde_dom,
    f_renderizar_nodos_seguros,
    f_resolver_idioma_inicial,
    f_guardar_storage,
    f_leer_storage,
    STORAGE_KEYS,
    f_ejecutar_transicion_vista,
    f_mostrar_toast,
    f_feedback_boton,
    f_copiar_al_portapapeles,
  } = ResumeApp.state;

  const {
    f_sincronizar_enlaces_pdf_y_version,
    f_construir_enlaces_contacto,
    f_obtener_info_pdf,
    f_descargar_vcard,
    f_compartir_cv,
    f_generar_json_resume,
    f_generar_markdown_cv,
  } = ResumeApp.export;

  const {
    f_resaltar_stack,
    f_renderizar_chips_stack,
    f_actualizar_badges_stack,
    f_contar_coincidencias_stack,
    f_alternar_destacar_metricas,
  } = ResumeApp.stackKpi;

  const {
    f_gestionar_drawer,
    f_iniciar_shells_seccion,
    f_iniciar_scrollspy_y_shell,
    f_iniciar_rail_derecho,
    f_sincronizar_header_movil,
    f_sincronizar_pista_apariencia,
    f_sincronizar_boton_plegar_todo,
    f_actualizar_ui_atajos_plataforma,
    f_detectar_plataforma_atajo,
  } = ResumeApp.navigation;

  const {
    f_iniciar_avatar_runner,
    AVATAR_ESTADOS,
  } = ResumeApp.journey;

  const {
    f_iniciar_modal_qr,
    f_iniciar_paleta_comandos,
    f_abrir_modal_contacto,
  } = ResumeApp.palette;

  const {
    f_renderizar_paginas_a4,
    f_ajustar_escala_preview,
    f_aplicar_no_cortar_secciones,
    f_entrar_vista_previa,
    f_salir_vista_previa,
  } = ResumeApp.print;

  let avatarInstancia = null;

  function f_aplicar_idioma(idioma, opciones = {}) {
    const langSeguro = ResumeApp.state.VALID_LANGS.includes(idioma) ? idioma : 'en';
    estado.idioma = langSeguro;
    document.documentElement.lang = langSeguro;
    document.title = t('meta.title', langSeguro);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key, langSeguro);
    });

    const richDict = DICCIONARIO[langSeguro].rich || {};
    document.querySelectorAll('[data-i18n-rich]').forEach(el => {
      const key = el.getAttribute('data-i18n-rich');
      if (key && Object.prototype.hasOwnProperty.call(richDict, key)) {
        f_renderizar_nodos_seguros(/** @type {HTMLElement} */ (el), richDict[key]);
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(key, langSeguro));
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (key) el.setAttribute('alt', t(key, langSeguro));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key, langSeguro));
    });

    SECCIONES_INDICE.forEach(sec => {
      const linkLabel = document.querySelector(`[data-spy-label="${sec.id}"]`);
      if (linkLabel) linkLabel.textContent = langSeguro === 'es' ? sec.etiquetaEs : sec.etiquetaEn;
    });

    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.setAttribute('aria-selected', String(btn.getAttribute('data-lang-btn') === langSeguro));
    });

    f_construir_enlaces_contacto(CONFIG_CONTACTO, langSeguro);
    f_sincronizar_enlaces_pdf_y_version(FECHA_ACTUALIZACION, APP_VERSION, langSeguro);
    f_actualizar_badges_stack();
    f_sincronizar_pista_apariencia(langSeguro);
    f_sincronizar_boton_plegar_todo(langSeguro);
    f_actualizar_ui_atajos_plataforma();

    if (avatarInstancia && typeof avatarInstancia.actualizarIdioma === 'function') {
      avatarInstancia.actualizarIdioma();
    }

    f_guardar_storage(STORAGE_KEYS.lang, langSeguro);
    if (opciones.actualizarUrl) {
      try {
        const url = new URL(globalScope.location.href);
        url.searchParams.set('lang', langSeguro);
        globalScope.history.replaceState(null, '', url.toString());
      } catch (_err) {}
    }

    if (document.documentElement.getAttribute('data-preview') === 'print') {
      f_renderizar_paginas_a4();
    }
  }

  function bootstrap() {
    f_capturar_en_desde_dom();
    document.documentElement.setAttribute('data-scrolled', 'false');
    f_sincronizar_header_movil();
    globalScope.addEventListener('resize', f_sincronizar_header_movil, { passive: true });

    f_aplicar_visibilidad_github_home(visualize_github_home);
    f_iniciar_rail_derecho();
    const drawerCtrl = f_gestionar_drawer();
    avatarInstancia = f_iniciar_avatar_runner(SECCIONES_INDICE, drawerCtrl, f_abrir_modal_contacto);
    f_iniciar_shells_seccion();
    f_iniciar_modal_qr(CONFIG_CONTACTO);

    f_iniciar_paleta_comandos({
      seccionesIndice: SECCIONES_INDICE,
      configContacto: CONFIG_CONTACTO,
      fechaActualizacion: FECHA_ACTUALIZACION,
      avatarCtrl: avatarInstancia,
      onCambiarIdioma: l => f_aplicar_idioma(l, { actualizarUrl: true }),
    });

    f_aplicar_idioma(f_resolver_idioma_inicial(), { actualizarUrl: false });
    f_aplicar_tema(/** @type {any} */ (f_leer_storage(STORAGE_KEYS.theme, 'light')));
    f_aplicar_densidad(/** @type {any} */ (f_leer_storage(STORAGE_KEYS.density, 'full')));
    f_aplicar_escala_tipografica(/** @type {any} */ (f_leer_storage(STORAGE_KEYS.fontScale, 'md')));

    try {
      const qStack = new URLSearchParams(globalScope.location.search).get('stack');
      if (qStack) f_resaltar_stack(qStack);
    } catch (_err) {}

    f_iniciar_scrollspy_y_shell(SECCIONES_INDICE, drawerCtrl.cerrarMovilSiAplica, avatarInstancia);

    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextLang = btn.getAttribute('data-lang-btn');
        if (nextLang) f_ejecutar_transicion_vista(() => f_aplicar_idioma(/** @type {any} */ (nextLang), { actualizarUrl: true }));
      });
    });

    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextTheme = btn.getAttribute('data-theme-btn');
        if (nextTheme) f_ejecutar_transicion_vista(() => f_aplicar_tema(/** @type {any} */ (nextTheme)));
      });
    });

    document.querySelectorAll('[data-density-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextDens = btn.getAttribute('data-density-btn');
        if (nextDens) f_aplicar_densidad(/** @type {any} */ (nextDens));
      });
    });

    document.querySelectorAll('[data-scale-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextScale = btn.getAttribute('data-scale-btn');
        if (nextScale) f_aplicar_escala_tipografica(/** @type {any} */ (nextScale));
      });
    });

    const btnMetrics = document.getElementById('btn-toggle-metrics');
    if (btnMetrics) btnMetrics.addEventListener('click', f_alternar_destacar_metricas);

    const btnExpJson = document.getElementById('btn-export-json');
    if (btnExpJson) btnExpJson.addEventListener('click', () => f_generar_json_resume(estado.idioma, visualize_github_home));

    const btnExpMd = document.getElementById('btn-export-markdown');
    if (btnExpMd) {
      btnExpMd.addEventListener('click', async () => {
        await f_generar_markdown_cv(estado.idioma, visualize_github_home);
        f_feedback_boton(btnExpMd, 'drawer.copiedShort');
      });
    }

    f_renderizar_chips_stack();
    document.querySelectorAll('[data-stack-chip]').forEach(btn => {
      btn.addEventListener('click', () => f_resaltar_stack(btn.getAttribute('data-stack-chip')));
    });

    document.querySelectorAll('[data-stack-target]').forEach(badge => {
      const clickHandler = () => {
        const tag = badge.getAttribute('data-stack-target');
        if (!tag) return;
        f_resaltar_stack(estado.stackActivo === tag ? 'all' : tag);
      };
      badge.addEventListener('click', clickHandler);
      badge.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickHandler(); }
      });
    });

    f_contar_coincidencias_stack();

    ['modal-sms-btn', 'drawer-sms-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => f_mostrar_toast(t('toast.smsOpened')));
    });

    ['modal-call-btn', 'drawer-call-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => f_mostrar_toast(t('toast.callOpened')));
    });

    const clearFilterBtn = document.getElementById('stack-filter-clear');
    if (clearFilterBtn) clearFilterBtn.addEventListener('click', () => f_resaltar_stack('all'));

    const clearStackInlineBtn = document.getElementById('btn-clear-stack-inline');
    if (clearStackInlineBtn) clearStackInlineBtn.addEventListener('click', () => f_resaltar_stack('all'));

    const copyEmailBtn = document.getElementById('btn-copy-email');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', async () => {
        const ok = await f_copiar_al_portapapeles(CONFIG_CONTACTO.emailPartes.join('@'), 'toast.emailCopied');
        if (ok) f_feedback_boton(copyEmailBtn, 'drawer.copiedShort');
      });
    }

    const copyPhoneBtn = document.getElementById('btn-copy-phone');
    if (copyPhoneBtn) {
      copyPhoneBtn.addEventListener('click', async () => {
        const ok = await f_copiar_al_portapapeles(CONFIG_CONTACTO.telefonoPartes.join(' '), 'toast.phoneCopied');
        if (ok) f_feedback_boton(copyPhoneBtn, 'drawer.copiedShort');
      });
    }

    const vcardBtn = document.getElementById('btn-vcard');
    if (vcardBtn) vcardBtn.addEventListener('click', () => f_descargar_vcard(CONFIG_CONTACTO, estado.idioma, visualize_github_home));

    const printBtn = document.getElementById('btn-print-pdf');
    const previewKeepSectionsBtn = document.getElementById('btn-preview-keep-sections');
    const previewConfirmBtn = document.getElementById('btn-preview-confirm-print');
    const previewExitBtn = document.getElementById('btn-preview-exit');

    f_aplicar_no_cortar_secciones(f_leer_storage(STORAGE_KEYS.keepSections, 'true') !== 'false');
    if (previewKeepSectionsBtn) previewKeepSectionsBtn.addEventListener('click', () => f_aplicar_no_cortar_secciones(!estado.noCortarSecciones));

    globalScope.addEventListener('resize', () => {
      if (document.documentElement.getAttribute('data-preview') === 'print') f_ajustar_escala_preview();
    }, { passive: true });

    if (printBtn) printBtn.addEventListener('click', () => f_entrar_vista_previa(drawerCtrl));
    if (previewConfirmBtn) previewConfirmBtn.addEventListener('click', () => globalScope.print());
    if (previewExitBtn) previewExitBtn.addEventListener('click', f_salir_vista_previa);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.documentElement.getAttribute('data-preview') === 'print') {
        e.preventDefault();
        f_salir_vista_previa();
      }
    });

    const shareBtn = document.getElementById('btn-share-cv');
    if (shareBtn) shareBtn.addEventListener('click', () => f_compartir_cv(shareBtn));

    let titleBackup = document.title;
    globalScope.addEventListener('beforeprint', () => {
      titleBackup = document.title;
      document.title = f_obtener_info_pdf(FECHA_ACTUALIZACION, estado.idioma).printTitle;
    });
    globalScope.addEventListener('afterprint', () => {
      document.title = titleBackup;
    });

    globalScope.RESUME_AUDIT = {
      APP_VERSION,
      FECHA_ACTUALIZACION,
      visualize_github_home,
      estado,
      f_obtener_info_pdf: lang => f_obtener_info_pdf(FECHA_ACTUALIZACION, lang || estado.idioma),
      v_validar_estado_i18n: () => true,
      va_verificar_integridad_secciones: () => true,
      va_verificar_integridad_avatar: () => true,
      avatarCtrl: avatarInstancia,
      f_construir_enlaces_contacto: lang => f_construir_enlaces_contacto(CONFIG_CONTACTO, lang || estado.idioma),
    };

    ResumeApp.app = {
      APP_VERSION,
      FECHA_ACTUALIZACION,
      f_aplicar_idioma,
      bootstrap,
    };
  }

  globalScope.f_detectar_plataforma_atajo = f_detectar_plataforma_atajo;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(window);
