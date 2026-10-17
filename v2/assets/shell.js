/* WIS Macedonia mockup v2 – shared shell (sidebar, context bar, public header).
   Demonstrator only: all values are placeholders. */
(function () {
  const body = document.body;
  const base = body.dataset.base || './';
  const active = body.dataset.active || '';
  const portal = body.dataset.portal || 'internal';

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ── Context: river basin district + RBMP cycle (ToR Task 1: reporting period) ── */
  const RBDS = [
    { id: 'MK_RBD_VAR', name: 'Vardar RBD', ready: true },
    { id: 'MK_RBD_STR', name: 'Strumica RBD', ready: false },
    { id: 'MK_RBD_BDR', name: 'Black Drim RBD', ready: false },
    { id: 'MK_RBD_JMO', name: 'Južna Morava RBD', ready: false }
  ];
  const CYCLES = [
    { id: 'C2028', label: 'RBMP 2028–2033', state: 'In preparation', period: '2028–2033' },
    { id: 'C2034', label: 'RBMP 2034–2039', state: 'Not started', period: '2034–2039' }
  ];
  const cycle = CYCLES.find(c => c.id === store('wis.cycle')) || CYCLES[0];
  window.WIS = { RBDS, CYCLES, cycle, base };

  const ROLES = [
    ['superadmin', 'Super admin (MoEPP)'],
    ['editor', 'Editor'],
    ['contributor', 'Contributor'],
    ['approver', 'Approver (MoEPP)'],
    ['gis', 'GIS Expert (MoEPP)'],
    ['technical', 'Technical user'],
    ['external', 'Registered external user']
  ];
  const role = store('wis.role') || 'superadmin';

  /* ── Internal portal sidebar ── */
  const NAV = [
    ['Overview', [
      ['dashboard', 'app/', 'fa-chart-line', 'Dashboard'],
      ['map', 'app/map/', 'fa-map', 'Map Viewer']
    ]],
    ['RBMP datasets', [
      ['water-bodies', 'app/water-bodies/', 'fa-water', 'Water Bodies'],
      ['monitoring', 'app/monitoring/', 'fa-satellite-dish', 'Monitoring Data'],
      ['pressures', 'app/pressures/', 'fa-industry', 'Pressures & Impacts'],
      ['measures', 'app/measures/', 'fa-tasks', 'Programme of Measures'],
      ['permits', 'app/permits/', 'fa-file-contract', 'Water Book']
    ]],
    ['Participation', [
      ['participation', 'app/participation/', 'fa-users', 'Public Participation']
    ]],
    ['Data management', [
      ['datasets', 'app/datasets/', 'fa-layer-group', 'Datasets & Imports'],
      ['identifiers', 'app/identifiers/', 'fa-fingerprint', 'Permanent Identifiers'],
      ['reference-data', 'app/reference-data/', 'fa-list-ul', 'Reference Data'],
      ['gis', 'app/gis/', 'fa-map-marked-alt', 'GIS Layers & Configurator'],
      ['metadata', 'app/metadata/', 'fa-database', 'Metadata'],
      ['download', 'app/download/', 'fa-download', 'Data Access']
    ]],
    ['Administration', [
      ['users', 'app/users/', 'fa-user-shield', 'Users & Roles']
    ]],
    ['Later phases', [
      ['reporting', 'app/reporting/', 'fa-chart-bar', 'WISE Reporting', 'p3']
    ]]
  ];
  const TAG = {
    new: '<span class="nav-new">NEW</span>',
    it3: '<span class="nav-phase" title="Redesigned in iteration 3">IT3</span>',
    it4: '<span class="nav-phase" title="Extended in iteration 4">IT4</span>',
    p3: '<span class="nav-phase" title="Foreseen in a later phase, outside Phase 1">LATER</span>'
  };

  /* Menu items visible per role (preview only; all others hidden) */
  const VISIBLE = {
    superadmin: null,
    editor: ['gis','dashboard','map','water-bodies','monitoring','pressures','measures','permits','participation','datasets','identifiers','reference-data','metadata','download','reporting'],
    contributor: ['dashboard','map','water-bodies','monitoring','pressures','measures','datasets','download'],
    approver: ['gis','dashboard','map','water-bodies','monitoring','pressures','measures','permits','participation','datasets','identifiers','reference-data','metadata','download','reporting'],
    gis: ['gis','dashboard','map','water-bodies','monitoring','pressures','measures','datasets','identifiers','metadata','download'],
    technical: ['dashboard','map','water-bodies','monitoring','pressures','measures','download'],
    external: []
  };
  function sidebar() {
    const el = document.getElementById('wis-sidebar');
    if (!el) return;
    const vis = VISIBLE[role];
    if (role === 'external') { location.href = base + 'participate/'; return; }
    if (vis && active && !vis.includes(active) && active !== 'screen-map') {
      setTimeout(() => { const m = document.querySelector('.content-area'); if (m) m.insertAdjacentHTML('afterbegin', '<div class="alert alert-warn" style="margin-bottom:16px;"><i class="fas fa-eye-slash"></i><div>This screen is not available to the role you are previewing. Switch role in the sidebar.</div></div>'); }, 0);
    }
    let nav = '';
    NAV.forEach(([title, items]) => {
      const shown = items.filter(i => !vis || vis.includes(i[0]));
      if (!shown.length) return;
      nav += `<div class="nav-section-title">${title}</div>`;
      shown.forEach(([key, href, icon, label, tag]) => {
        nav += `<a href="${base}${href}" class="nav-item ${key === active ? 'nav-item-active' : ''}">
          <i class="fas ${icon} nav-icon"></i><span class="nav-label">${label}</span>${tag ? TAG[tag] : ''}</a>`;
      });
    });
    const roleOpts = ROLES.map(([k, l]) => `<option value="${k}" ${k === role ? 'selected' : ''}>${l}</option>`).join('');
    el.className = 'sidebar';
    el.innerHTML = `
      <div class="sidebar-header">
        <div class="logo-block">
          <div class="logo-icon"><i class="fas fa-water" style="color:white;font-size:18px;"></i></div>
          <div><div class="logo-text-main">WIS Macedonia</div><div class="logo-text-sub">Internal portal</div></div>
        </div>
        <div class="rbmp-pill"><i class="fas fa-circle" style="font-size:6px;"></i> Vardar RBD · ${cycle.label}</div>
      </div>
      <nav>${nav}
        <div class="nav-section-title">Public side</div>
        <a href="${base}" class="nav-item"><i class="fas fa-globe nav-icon"></i><span class="nav-label">View public portal</span></a>
      </nav>
      <div style="padding:8px 18px 10px;font-size:10.5px;color:#64748b;border-top:1px solid #1e293b;">For reviewers: <a href="${base}screen-map/" style="color:#94a3b8;">screen map</a> · <a href="${base}../" style="color:#94a3b8;">mockup v1</a></div>
      <div class="sidebar-user" style="flex-direction:column;align-items:stretch;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="user-avatar">DM</div>
          <div><div class="user-name">Demo user</div><div class="user-role">Role preview (mockup)</div></div>
          <a href="${base}login/" class="user-logout" title="Logout"><i class="fas fa-sign-out-alt"></i></a>
        </div>
        <select class="role-select" id="role-select" title="Preview the portal as another role">${roleOpts}</select>
      </div>`;
    const rs = document.getElementById('role-select');
    rs.addEventListener('change', () => { store('wis.role', rs.value); location.reload(); });
  }

  /* ── Context bar in the page header ── */
  function contextBar() {
    const actions = document.querySelector('.top-header .header-actions');
    if (!actions || portal !== 'internal') return;
    const rbdOpts = RBDS.map(r => `<option value="${r.id}" ${r.ready ? '' : 'disabled'}>${r.name}${r.ready ? '' : ' (not yet configured)'}</option>`).join('');
    const cycOpts = CYCLES.map(c => `<option value="${c.id}" ${c.id === cycle.id ? 'selected' : ''}>${c.label} · ${c.state}</option>`).join('');
    const bar = document.createElement('div');
    bar.className = 'ctx-bar';
    bar.innerHTML = `<span class="ctx-label">Basin</span><select class="ctx-select" title="River basin district">${rbdOpts}</select>
      <span class="ctx-label">Cycle</span><select class="ctx-select" id="cycle-select" title="RBMP cycle (reporting period, ToR Task 1)">${cycOpts}</select>`;
    actions.insertBefore(bar, actions.firstChild);
    document.getElementById('cycle-select').addEventListener('change', e => { store('wis.cycle', e.target.value); location.reload(); });
  }

  /* ── Public portal header and footer ── */
  function publicShell() {
    const signedIn = store('wis.signedIn') === '1';
    const h = document.getElementById('pub-header');
    if (h) {
      const links = [
        ['home', '', 'Home'],
        ['explore', 'explore/', 'Water bodies'],
        ['map', 'explore/map/', 'Map'],
        ['participate', 'participate/', 'Have your say'],
        ['dashboards', 'explore/dashboards/', 'Dashboards'],
        ['permits', 'explore/permits/', 'Permits']
      ].map(([k, href, l]) => `<a href="${base}${href}" class="${k === active ? 'on' : ''}">${l}</a>`).join('');
      h.className = 'pub-header';
      h.innerHTML = `<div class="pub-header-inner">
        <a href="${base}" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
          <div class="logo-icon"><i class="fas fa-water" style="color:white;font-size:18px;"></i></div>
          <div><div class="logo-text-main">WIS Macedonia</div><div class="logo-text-sub">Public portal · Vardar RBMP</div></div>
        </a>
        <nav class="pub-nav" style="display:flex;gap:2px;flex:1;padding:0;">${links}</nav>
        <div class="lang-switch" title="Language (Macedonian and Albanian planned)">
          <span class="planned" title="Macedonian – planned">МК</span><span class="planned" title="Albanian – planned">SQ</span><span class="on">EN</span>
        </div>
        ${signedIn ? `<a href="${base}participate/my-comments/" class="header-btn" style="background:transparent;color:#e2e8f0;border-color:#334155;"><i class="fas fa-user-circle"></i><span>Ana P.</span></a>
        <button class="header-btn" style="background:transparent;color:#94a3b8;border-color:#334155;" onclick="WIS.signOut()" title="Sign out"><i class="fas fa-sign-out-alt"></i></button>` :
        `<a href="${base}register/" class="header-btn pub-hide-sm" style="background:transparent;color:#e2e8f0;border-color:#334155;"><i class="fas fa-user-plus"></i><span>Register</span></a>
        <a href="${base}login/" class="header-btn header-btn-primary"><i class="fas fa-sign-in-alt"></i><span>Sign in</span></a>`}
        <button class="header-btn pub-burger" style="background:transparent;color:#e2e8f0;border-color:#334155;" onclick="document.getElementById('pub-mnav').classList.toggle('open')" title="Menu"><i class="fas fa-bars"></i></button>
      </div>
      <nav id="pub-mnav" class="pub-mnav">${links}</nav>`;
    }
    const f = document.getElementById('pub-footer');
    if (f) {
      f.className = 'pub-footer';
      f.innerHTML = `Ministry of Environment and Physical Planning · Water Information System (WIS) · Mockup v2 – demonstrator, all data are placeholders
        <div style="margin-top:8px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;"><a href="${base}about/contacts/" style="color:#1a56db;">Who is responsible · contacts</a><a href="${base}participate/request/" style="color:#1a56db;">Request background documents</a><a href="${base}about/privacy/" style="color:#1a56db;">Privacy notice</a><a href="${base}about/accessibility/" style="color:#1a56db;">Accessibility</a></div>
        <div style="margin-top:6px;font-size:10.5px;color:#94a3b8;">For reviewers: <a href="${base}screen-map/" style="color:#94a3b8;">screen map</a> · <a href="${base}../" style="color:#94a3b8;">mockup v1</a></div>`;
    }
  }

  /* ── Language layer (ToR Task 7 proposal): interface labels in MK / SQ / EN.
        Draft translations of navigation and common labels, to be checked by translators;
        page content stays in English in the mockup. ── */
  const T = {
    'Home': ['Почетна', 'Ballina'], 'Water bodies': ['Водни тела', 'Trupat ujorë'], 'Map': ['Карта', 'Harta'],
    'Have your say': ['Кажете го вашето мислење', 'Jepni mendimin tuaj'], 'Dashboards': ['Прегледи', 'Panelet'], 'Permits': ['Дозволи', 'Lejet'],
    'Register': ['Регистрација', 'Regjistrohu'], 'Sign in': ['Најава', 'Hyr'],
    'Overview': ['Преглед', 'Përmbledhje'], 'RBMP datasets': ['Податоци за планот', 'Të dhënat e planit'], 'Participation': ['Учество', 'Pjesëmarrja'],
    'Data management': ['Управување со податоци', 'Menaxhimi i të dhënave'], 'Administration': ['Администрација', 'Administrimi'], 'Later phases': ['Подоцнежни фази', 'Fazat e mëvonshme'], 'Public side': ['Јавен дел', 'Pjesa publike'],
    'Dashboard': ['Контролна табла', 'Paneli'], 'Map Viewer': ['Прегледувач на карти', 'Shikuesi i hartës'], 'Water Bodies': ['Водни тела', 'Trupat ujorë'],
    'Monitoring Data': ['Податоци од мониторинг', 'Të dhënat e monitorimit'], 'Pressures & Impacts': ['Притисоци и влијанија', 'Presionet dhe ndikimet'],
    'Programme of Measures': ['Програма од мерки', 'Programi i masave'], 'Water Book': ['Водна книга', 'Libri i ujit'], 'Public Participation': ['Учество на јавноста', 'Pjesëmarrja e publikut'],
    'Datasets & Imports': ['Збирки податоци и увоз', 'Grupet e të dhënave dhe importi'], 'Permanent Identifiers': ['Трајни идентификатори', 'Identifikuesit e përhershëm'],
    'Reference Data': ['Референтни податоци', 'Të dhënat referuese'], 'GIS Layers & Configurator': ['ГИС слоеви и конфигуратор', 'Shtresat GIS dhe konfiguruesi'],
    'Metadata': ['Метаподатоци', 'Metadatat'], 'Data Access': ['Пристап до податоци', 'Qasja në të dhëna'], 'Users & Roles': ['Корисници и улоги', 'Përdoruesit dhe rolet'],
    'WISE Reporting': ['Известување кон WISE', 'Raportimi WISE'], 'View public portal': ['Јавен портал', 'Portali publik'], 'Help': ['Помош', 'Ndihmë']
  };
  function i18n() {
    const lang = store('wis.lang') || 'en';
    const sw = document.querySelector('.lang-switch');
    if (sw) {
      sw.innerHTML = [['mk', 'МК'], ['sq', 'SQ'], ['en', 'EN']].map(([k, l]) => `<span data-lang="${k}" class="${k === lang ? 'on' : ''}" style="cursor:pointer;" title="${{ mk: 'Македонски', sq: 'Shqip', en: 'English' }[k]}">${l}</span>`).join('');
      sw.querySelectorAll('[data-lang]').forEach(x => x.onclick = () => { store('wis.lang', x.dataset.lang); location.reload(); });
    }
    const ctx = document.querySelector('.top-header .header-actions');
    if (ctx && !document.querySelector('.top-header .lang-switch')) {
      const d = document.createElement('div'); d.className = 'lang-switch'; ctx.insertBefore(d, ctx.firstChild);
      d.innerHTML = [['mk', 'МК'], ['sq', 'SQ'], ['en', 'EN']].map(([k, l]) => `<span data-lang="${k}" class="${k === lang ? 'on' : ''}" style="cursor:pointer;">${l}</span>`).join('');
      d.querySelectorAll('[data-lang]').forEach(x => x.onclick = () => { store('wis.lang', x.dataset.lang); location.reload(); });
    }
    if (lang === 'en') return;
    const i = lang === 'mk' ? 0 : 1;
    document.querySelectorAll('.nav-label, .nav-section-title, .pub-nav a, .pub-mnav a, .header-btn span').forEach(el => {
      const k = el.textContent.trim(); if (T[k]) el.textContent = T[k][i];
    });
    document.documentElement.lang = lang;
    const note = document.createElement('div');
    note.style.cssText = 'background:#fef3c7;color:#92400e;font-size:12px;padding:6px 16px;text-align:center;';
    note.textContent = lang === 'mk' ? 'Македонска верзија: преведени се менијата (нацрт-превод). Содржината на страниците ќе биде преведена во живиот систем.'
      : 'Versioni shqip: janë përkthyer menytë (përkthim draft). Përmbajtja e faqeve do të përkthehet në sistemin real.';
    const host = document.querySelector('.main-wrapper') || document.body;
    host.insertBefore(note, host.firstChild);
  }

  /* ── Shared helpers used by page scripts ── */
  window.switchTab = function (groupId, tabId) {
    document.querySelectorAll('[data-tab-group="' + groupId + '"]').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('[data-panel-group="' + groupId + '"]').forEach(el => el.classList.remove('active'));
    const t = document.querySelector('[data-tab-group="' + groupId + '"][data-tab="' + tabId + '"]');
    const p = document.querySelector('[data-panel-group="' + groupId + '"][data-panel="' + tabId + '"]');
    if (t) t.classList.add('active');
    if (p) p.classList.add('active');
  };
  window.filterTable = function (inputId, tableId) {
    const val = document.getElementById(inputId).value.toLowerCase();
    document.querySelectorAll('#' + tableId + ' tbody tr').forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(val) ? '' : 'none';
    });
  };
  window.WIS.signIn = function (go) { store('wis.signedIn', '1'); if (go) location.href = go; else location.reload(); };
  window.WIS.signOut = function () { store('wis.signedIn', '0'); location.reload(); };
  window.WIS.isSignedIn = function () { return store('wis.signedIn') === '1'; };
  window.wisToast = function (msg) {
    let t = document.getElementById('wis-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'wis-toast';
      t.style.cssText = 'position:fixed;bottom:22px;right:22px;background:#0f172a;color:#fff;padding:12px 16px;border-radius:10px;font-size:12.5px;z-index:9999;box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:360px;';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._h); t._h = setTimeout(() => { t.style.display = 'none'; }, 3200);
  };

  sidebar();
  contextBar();
  publicShell();
  i18n();
})();
