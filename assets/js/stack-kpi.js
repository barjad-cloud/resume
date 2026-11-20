/**
 * @file assets/js/stack-kpi.js
 * @description Filtrado y contadores del stack tecnológico y resaltador visual de KPIs y métricas clave.
 */

(function initStackKpiModule(globalScope) {
  'use strict';

  const ResumeApp = globalScope.ResumeApp = globalScope.ResumeApp || {};

  const VALID_STACKS = ['all', 'angular', 'typescript', 'javascript', 'node', 'php', 'sql', 'git', 'leadership'];
  const STACK_LABELS = {
    angular: 'Angular',
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    node: 'Node.js',
    php: 'PHP',
    sql: 'SQL',
    git: 'Git',
    leadership: null,
  };

  let kpisResaltados = [];

  function f_renderizar_chips_stack() {
    const container = document.getElementById('drawer-stack-chips');
    if (!container || container.children.length > 0) return;
    const { t } = ResumeApp.state;

    const chips = [
      { tag: 'all', labelKey: 'drawer.stackAll', defaultText: 'All', count: false },
      { tag: 'angular', text: 'Angular', count: true },
      { tag: 'typescript', text: 'TypeScript', count: true },
      { tag: 'javascript', text: 'JavaScript', count: true },
      { tag: 'node', text: 'Node.js', count: true },
      { tag: 'php', text: 'PHP', count: true },
      { tag: 'sql', text: 'SQL', count: true },
      { tag: 'git', text: 'Git', count: true },
      { tag: 'leadership', labelKey: 'drawer.stackLeadership', defaultText: 'Leadership', count: true },
    ];

    container.innerHTML = chips.map(c => {
      const isAll = c.tag === 'all';
      const label = c.labelKey
        ? `<span data-i18n="${c.labelKey}">${t(c.labelKey, ResumeApp.state.estado.idioma) || c.defaultText}</span>`
        : `<span>${c.text}</span>`;
      const count = c.count ? ` <span class="chip-count" data-stack-count="${c.tag}"></span>` : '';
      return `<button type="button" class="stack-chip" data-stack-chip="${c.tag}" aria-pressed="${isAll ? 'true' : 'false'}">${label}${count}</button>`;
    }).join('');
  }

  function f_actualizar_badges_stack() {
    const banner = document.getElementById('stack-filter-banner');
    const bannerValue = document.getElementById('stack-filter-value');
    const inlineClearBtn = document.getElementById('btn-clear-stack-inline');
    const activo = ResumeApp.state.estado.stackActivo;
    const { t } = ResumeApp.state;

    if (inlineClearBtn) inlineClearBtn.hidden = !activo;
    if (banner && bannerValue) {
      if (!activo) {
        banner.hidden = true;
        bannerValue.textContent = '';
      } else {
        banner.hidden = false;
        bannerValue.textContent = activo === 'leadership' ? t('drawer.stackLeadership') : (STACK_LABELS[activo] || activo);
      }
    }

    document.querySelectorAll('.section-shell').forEach(section => {
      const badge = section.querySelector('.section-match-badge');
      if (!badge) return;
      const taggedItems = section.querySelectorAll('[data-tags]');
      if (!activo || taggedItems.length === 0) {
        badge.hidden = true;
        badge.textContent = '';
        badge.classList.remove('is-zero');
        return;
      }
      const matches = section.querySelectorAll('[data-tags].is-stack-match').length;
      badge.textContent = `${matches} ${matches === 1 ? t('shell.matchSingular') : t('shell.matchPlural')}`;
      badge.hidden = false;
      badge.classList.toggle('is-zero', matches === 0);
    });
  }

  function f_resaltar_stack(stackTag) {
    const normalized = stackTag ? stackTag.toLowerCase() : 'all';
    const tagSeguro = VALID_STACKS.includes(normalized) ? normalized : 'all';
    const activo = tagSeguro === 'all' ? null : tagSeguro;
    ResumeApp.state.estado.stackActivo = activo;

    f_renderizar_chips_stack();

    document.querySelectorAll('[data-stack-chip]').forEach(btn => {
      const val = btn.getAttribute('data-stack-chip');
      btn.setAttribute('aria-pressed', String(activo === null ? val === 'all' : val === activo));
    });

    document.querySelectorAll('[data-tags]').forEach(item => {
      if (!activo) {
        item.classList.remove('is-stack-match', 'is-stack-dim');
        return;
      }
      const tags = (item.getAttribute('data-tags') || '').toLowerCase().split(/\s+/).filter(Boolean);
      const isMatch = tags.includes(activo);
      item.classList.toggle('is-stack-match', isMatch);
      item.classList.toggle('is-stack-dim', !isMatch);
    });
    f_actualizar_badges_stack();
  }

  function f_contar_coincidencias_stack() {
    const contenedor = document.getElementById('resume-scroll-body');
    if (!contenedor) return;
    const items = contenedor.querySelectorAll('[data-tags]');
    const conteos = {};
    VALID_STACKS.filter(s => s !== 'all').forEach(s => { conteos[s] = 0; });

    items.forEach(el => {
      const tags = (el.getAttribute('data-tags') || '').toLowerCase().split(/\s+/);
      Object.keys(conteos).forEach(tag => {
        if (tags.includes(tag)) conteos[tag] += 1;
      });
    });

    Object.entries(conteos).forEach(([tag, count]) => {
      const elCount = document.querySelector(`[data-stack-count="${tag}"]`);
      if (elCount) elCount.textContent = `(${count})`;
    });
  }

  function f_limpiar_resaltado_kpis() {
    const scrollBody = document.getElementById('resume-scroll-body');
    const badge = document.getElementById('kpi-count-badge');
    if (badge) badge.hidden = true;
    if (!scrollBody) return;
    scrollBody.querySelectorAll('mark.metric-highlight').forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
    kpisResaltados = [];
  }

  function f_resaltar_kpis_en_dom() {
    const scrollBody = document.getElementById('resume-scroll-body');
    const badge = document.getElementById('kpi-count-badge');
    if (!scrollBody) return;
    f_limpiar_resaltado_kpis();

    const kpiRegex = /(?:\+\d+(?:\.\d+)?%|\d+(?:\.\d+)?%|\+?€\d+(?:[.,]\d+)?k?|\+?\$?\d+k?|#\d+|100%|\b\d+\+?\s*(?:personas|empleados|staff|tiendas|restaurantes)\b|\b\d+[.,]\d+\s*\/\s*10\b|\b\d+\+?\s*años\b|\bSLA\b|\bKPIs\b|\bWFM\b|\bPM\b)/gi;

    function procesarNodoTexto(nodo) {
      if (nodo.nodeType === Node.TEXT_NODE) {
        const texto = nodo.nodeValue || '';
        if (!texto.trim() || !kpiRegex.test(texto)) return;
        kpiRegex.lastIndex = 0;

        const fragmento = document.createDocumentFragment();
        let lastIndex = 0;
        let coincidencia;

        while ((coincidencia = kpiRegex.exec(texto)) !== null) {
          const matchStart = coincidencia.index;
          const matchEnd = kpiRegex.lastIndex;
          if (matchStart > lastIndex) {
            fragmento.appendChild(document.createTextNode(texto.slice(lastIndex, matchStart)));
          }
          const mark = document.createElement('mark');
          mark.className = 'metric-highlight';
          mark.textContent = coincidencia[0];
          fragmento.appendChild(mark);
          kpisResaltados.push(mark);
          lastIndex = matchEnd;
        }

        if (lastIndex < texto.length) {
          fragmento.appendChild(document.createTextNode(texto.slice(lastIndex)));
        }
        if (nodo.parentNode) {
          nodo.parentNode.replaceChild(fragmento, nodo);
        }
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const el = /** @type {HTMLElement} */ (nodo);
        if (
          el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'BUTTON' ||
          el.tagName === 'MARK' || el.classList.contains('no-print') ||
          el.classList.contains('avatar-speech-bubble') || el.classList.contains('avatar-contact-sign')
        ) return;
        Array.from(el.childNodes).forEach(procesarNodoTexto);
      }
    }

    kpisResaltados = [];
    scrollBody.querySelectorAll('.section-shell-body, .profile-description').forEach(procesarNodoTexto);

    if (badge) {
      badge.textContent = String(kpisResaltados.length);
      badge.hidden = kpisResaltados.length === 0;
    }
  }

  function f_alternar_destacar_metricas() {
    const root = document.documentElement;
    const nuevo = !(root.getAttribute('data-highlight-metrics') === 'true');
    root.setAttribute('data-highlight-metrics', String(nuevo));
    ResumeApp.state.estado.destacarMetricas = nuevo;

    const btn = document.getElementById('btn-toggle-metrics');
    if (btn) btn.setAttribute('aria-pressed', String(nuevo));
    if (nuevo) f_resaltar_kpis_en_dom();
    else f_limpiar_resaltado_kpis();
  }

  ResumeApp.stackKpi = {
    VALID_STACKS,
    STACK_LABELS,
    f_renderizar_chips_stack,
    f_resaltar_stack,
    f_actualizar_badges_stack,
    f_contar_coincidencias_stack,
    f_limpiar_resaltado_kpis,
    f_resaltar_kpis_en_dom,
    f_alternar_destacar_metricas,
  };
})(window);
