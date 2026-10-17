/* NWIS – National Water Information System, mockup v2 – shared shell (sidebar, context bar, public header, basin selector).
   Demonstrator only: all values are placeholders. */
(function () {
  const body = document.body;
  const base = body.dataset.base || './';
  const active = body.dataset.active || '';
  const portal = body.dataset.portal || 'internal';

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ── Context: river basin district + RBMP cycle (ToR Task 1: reporting period) ── */
  const scope = body.dataset.scope || (portal === 'internal' ? 'internal' : 'national');
  /* The four river basin districts. Areas are approximate shares of the national territory (placeholders). */
  const RBDS = [
    { id: 'VAR', code: 'MK_RBD_VAR', name: 'Vardar', mk: 'Вардар', area: '≈ 20,500 km²', share: '≈ 80%', shared: 'Greece (Axios)', rivers: 'Vardar, Treska, Pchinja, Bregalnica, Crna Reka; Dojran Lake', centre: [41.70, 21.75], zoom: 8, color: '#1a56db', demo: true },
    { id: 'BDR', code: 'MK_RBD_BDR', name: 'Black Drim', mk: 'Црн Дрим', area: '≈ 3,350 km²', share: '≈ 13%', shared: 'Albania; Greece (Prespa)', rivers: 'Black Drim, Sateska, Radika; Ohrid and Prespa lakes', centre: [41.22, 20.75], zoom: 9, color: '#0891b2' },
    { id: 'STR', code: 'MK_RBD_STR', name: 'Strumica', mk: 'Струмица', area: '≈ 1,650 km²', share: '≈ 6.5%', shared: 'Bulgaria (Struma)', rivers: 'Strumica, Turija, Vodochnica', centre: [41.43, 22.65], zoom: 10, color: '#059669' },
    { id: 'JMO', code: 'MK_RBD_JMO', name: 'Južna Morava', mk: 'Јужна Морава', area: '≈ 45 km²', share: '< 1%', shared: 'Serbia, Kosovo', rivers: 'Binachka Morava (upper catchment)', centre: [42.28, 21.64], zoom: 11, color: '#d97706' }
  ];
  RBDS.forEach(r => { r.label = r.name + ' RBD'; r.full = r.name + ' River Basin District'; });
  const CYCLES = [
    { id: 'C2028', label: 'RBMP 2028–2033', state: 'In preparation', period: '2028–2033' },
    { id: 'C2034', label: 'RBMP 2034–2039', state: 'Not started', period: '2034–2039' }
  ];
  const qs = new URLSearchParams(location.search);
  const qRbd = (qs.get('rbd') || '').toUpperCase();
  if (RBDS.some(r => r.id === qRbd)) store('wis.rbd', qRbd);
  const RBD = RBDS.find(r => r.id === store('wis.rbd')) || RBDS[0];
  const qCyc = qs.get('cycle');
  if (CYCLES.some(c => c.id === qCyc)) store('wis.cycle.' + RBD.id, qCyc);
  const cycle = CYCLES.find(c => c.id === (store('wis.cycle.' + RBD.id) || store('wis.cycle'))) || CYCLES[0];
  const DEMO = RBD.id === 'VAR' && cycle.id === 'C2028';
  const lang = store('wis.lang') || 'en';
  const BRAND = lang === 'mk' ? ['НИСВ', 'Национален Информативен Систем за Води'] : lang === 'sq' ? ['NWIS', 'Sistemi Kombëtar i Informacionit për Ujërat'] : ['NWIS', 'National Water Information System'];
  window.WIS = { RBDS, CYCLES, cycle, base, RBD, DEMO, scope, BRAND };
  function setBasin(id) { store('wis.rbd', id); go(); }
  function setCycle(id) { store('wis.cycle.' + RBD.id, id); go(); }
  function go() {
    /* pages tied to one object (a water body, a document, a stage) fall back to the basin home */
    const p = location.pathname;
    if (/water-body|document|stage/.test(p)) { location.href = base + 'basin/'; return; }
    const u = new URL(location.href); u.searchParams.delete('rbd'); u.searchParams.delete('cycle'); u.searchParams.delete('wb');
    location.href = u.toString();
  }
  window.WIS.setBasin = setBasin; window.WIS.setCycle = setCycle;

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
          <div><div class="logo-text-main">${BRAND[0]}</div><div class="logo-text-sub">${BRAND[1]} · Internal portal</div></div>
        </div>
        <div class="rbmp-pill"><i class="fas fa-circle" style="font-size:6px;"></i> ${RBD.label} · ${cycle.label}</div>
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
    const rbdOpts = RBDS.map(r => `<option value="${r.id}" ${r.id === RBD.id ? 'selected' : ''}>${r.label}</option>`).join('');
    const cycOpts = CYCLES.map(c => `<option value="${c.id}" ${c.id === cycle.id ? 'selected' : ''}>${c.label} · ${c.state}</option>`).join('');
    const bar = document.createElement('div');
    bar.className = 'ctx-bar';
    bar.innerHTML = `<span class="ctx-label">Basin</span><select class="ctx-select" id="rbd-select" title="River basin district">${rbdOpts}</select>
      <span class="ctx-label">Cycle</span><select class="ctx-select" id="cycle-select" title="RBMP cycle (reporting period, ToR Task 1)">${cycOpts}</select>`;
    actions.insertBefore(bar, actions.firstChild);
    document.getElementById('cycle-select').addEventListener('change', e => setCycle(e.target.value));
    document.getElementById('rbd-select').addEventListener('change', e => setBasin(e.target.value));
    if (!DEMO) {
      const m = document.querySelector('.content-area');
      if (m) m.insertAdjacentHTML('afterbegin', `<div class="alert alert-warn" style="margin-bottom:16px;"><i class="fas fa-layer-group"></i><div><b>${RBD.label} · ${cycle.label}.</b> Every screen works the same way for all four river basin districts and both cycles. In this mockup the example records shown are those of Vardar RBD, RBMP 2028–2033; in the live system the screen lists only records of the selected basin and cycle.</div></div>`);
    }
  }

  /* ── Public portal header and footer ── */
  function publicShell() {
    const signedIn = store('wis.signedIn') === '1';
    const h = document.getElementById('pub-header');
    if (h) {
      const basinLinks = [
        ['basin', 'basin/', 'Basin home'],
        ['explore', 'explore/', 'Water bodies'],
        ['map', 'explore/map/', 'Map'],
        ['participate', 'participate/', 'Have your say'],
        ['dashboards', 'explore/dashboards/', 'Dashboards'],
        ['permits', 'explore/permits/', 'Permits']
      ];
      /* The national cover page and other national pages carry no portal menu: one enters a basin first. */
      const links = (scope === 'basin' ? basinLinks : [])
        .map(([k, href, l]) => `<a href="${href[0] === '#' && active !== 'home' ? base + href : (href[0] === '#' ? href : base + href)}" class="${k === active ? 'on' : ''}">${l}</a>`).join('');
      h.className = 'pub-header';
      h.innerHTML = `<div class="pub-header-inner">
        <a href="${base}" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
          <div class="logo-icon"><i class="fas fa-water" style="color:white;font-size:18px;"></i></div>
          <div><div class="logo-text-main">${BRAND[0]}</div><div class="logo-text-sub">${BRAND[1]}</div></div>
        </a>
        <nav class="pub-nav" style="display:flex;gap:2px;flex:1;padding:0;">${links}</nav>
        <div class="lang-switch" title="Language (Macedonian and Albanian planned)">
          <span class="planned" title="Macedonian – planned">МК</span><span class="planned" title="Albanian – planned">SQ</span><span class="on">EN</span>
        </div>
        ${signedIn ? `<a href="${base}participate/my-comments/" class="header-btn" style="background:transparent;color:#e2e8f0;border-color:#334155;"><i class="fas fa-user-circle"></i><span>Ana P.</span></a>
        <button class="header-btn" style="background:transparent;color:#94a3b8;border-color:#334155;" onclick="WIS.signOut()" title="Sign out"><i class="fas fa-sign-out-alt"></i></button>` :
        `<a href="${base}register/" class="header-btn pub-hide-sm" style="background:transparent;color:#e2e8f0;border-color:#334155;"><i class="fas fa-user-plus"></i><span>Register</span></a>
        <a href="${base}login/" class="header-btn header-btn-primary"><i class="fas fa-sign-in-alt"></i><span>Sign in</span></a>`}
        <button class="header-btn pub-burger" ${links ? '' : 'hidden'} style="background:transparent;color:#e2e8f0;border-color:#334155;" onclick="document.getElementById('pub-mnav').classList.toggle('open')" title="Menu"><i class="fas fa-bars"></i></button>
      </div>
      ${links ? `<nav id="pub-mnav" class="pub-mnav">${links}</nav>` : ''}`;
      if (scope === 'basin') {
        const strip = document.createElement('div');
        strip.className = 'basin-strip';
        strip.innerHTML = `<div class="basin-strip-inner">
          <a href="${base}" class="basin-all"><i class="fas fa-th-large"></i><span>All river basins</span></a>
          <div class="basin-tabs">${RBDS.map(r => `<button class="basin-tab ${r.id === RBD.id ? 'on' : ''}" data-rbd="${r.id}" title="${r.full}"><i class="fas fa-circle" style="color:${r.color};font-size:8px;"></i>${lang === 'mk' ? r.mk : r.name}</button>`).join('')}</div>
          <label class="basin-cycle"><span>RBMP cycle</span><select id="pub-cycle">${CYCLES.map(c => `<option value="${c.id}" ${c.id === cycle.id ? 'selected' : ''}>${c.label} · ${c.state}</option>`).join('')}</select></label>
        </div>`;
        h.after(strip);
        strip.querySelectorAll('[data-rbd]').forEach(b => b.onclick = () => setBasin(b.dataset.rbd));
        strip.querySelector('#pub-cycle').onchange = e => setCycle(e.target.value);
      }
    }
    if (scope === 'basin') basinContent();
    const f = document.getElementById('pub-footer');
    if (f) {
      f.className = 'pub-footer';
      f.innerHTML = `Ministry of Environment and Physical Planning · ${BRAND[1]} (${BRAND[0]}) · Mockup v2 – demonstrator, all data are placeholders
        <div style="margin-top:8px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;"><a href="${base}about/contacts/" style="color:#1a56db;">Who is responsible · contacts</a><a href="${base}participate/request/" style="color:#1a56db;">Request background documents</a><a href="${base}about/privacy/" style="color:#1a56db;">Privacy notice</a><a href="${base}about/accessibility/" style="color:#1a56db;">Accessibility</a></div>
        <div style="margin-top:6px;font-size:10.5px;color:#94a3b8;">For reviewers: <a href="${base}screen-map/" style="color:#94a3b8;">screen map</a> · <a href="${base}../" style="color:#94a3b8;">mockup v1</a></div>`;
    }
  }

  /* ── Basin pages: same structure for every basin; names and cycle follow the selection ── */
  function basinContent() {
    const main = document.querySelector('main.pub-wrap');
    if (!main) return;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      let t = n.nodeValue, o = t;
      if (RBD.id !== 'VAR') t = t.replace(/Vardar (River Basin District|River Basin Management Plan|River Basin Council|River Basin|RBD|RBMP)/g, RBD.name + ' $1');
      if (cycle.id !== 'C2028') t = t.replace(/RBMP 2028–2033( \(in preparation\))?/g, cycle.label + ' (' + cycle.state.toLowerCase() + ')');
      if (t !== o) n.nodeValue = t;
    });
    const empty = (el, what) => { el.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><div><b>No ${what || 'records'} published yet for ${RBD.label}${el.dataset.demoBasin ? '' : ' · ' + cycle.label}.</b><br>This section has the same structure in every river basin; it fills in when the competent authority publishes the data.</div></div>`; };
    if (RBD.id !== 'VAR') main.querySelectorAll('[data-demo-basin]').forEach(el => empty(el, el.dataset.demoBasin));
    if (!DEMO) {
      main.querySelectorAll('[data-demo]').forEach(el => {
        el.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><div><b>No ${el.dataset.demo || 'records'} published yet for ${RBD.label} · ${cycle.label}.</b><br>This section has the same structure in every river basin; it fills in when the competent authority publishes the data for this basin and cycle.</div></div>`;
      });
      main.insertAdjacentHTML('afterbegin', `<div class="alert alert-info" style="margin-bottom:16px;"><i class="fas fa-layer-group"></i><div><b>${RBD.full} · ${cycle.label}.</b> Same pages and tools as every river basin. In this mockup, full example content is loaded for Vardar RBD, RBMP 2028–2033; ${RBD.id === 'VAR' ? 'this cycle has not started yet, so only the water-body list is shown' : RBD.name + ' shows a few placeholder water bodies only'}.</div></div>`);
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
    'WISE Reporting': ['Известување кон WISE', 'Raportimi WISE'], 'View public portal': ['Јавен портал', 'Portali publik'], 'Help': ['Помош', 'Ndihmë'],
    'Basin home': ['Почетна на сливот', 'Ballina e pellgut'], 'About NWIS': ['За НИСВ', 'Rreth NWIS'], 'River basins': ['Речни сливови', 'Pellgjet lumore'],
    'Who is responsible': ['Кој е надлежен', 'Kush është përgjegjës'], 'All river basins': ['Сите речни сливови', 'Të gjitha pellgjet'], 'RBMP cycle': ['Циклус на планот', 'Cikli i planit']
  };
  function i18n() {
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
    document.querySelectorAll('.nav-label, .nav-section-title, .pub-nav a, .pub-mnav a, .header-btn span, .basin-all span, .basin-cycle span').forEach(el => {
      const k = el.textContent.trim(); if (T[k]) el.textContent = T[k][i];
    });
    document.documentElement.lang = lang;
    if (lang === 'mk') { const fix = () => { if (document.title.includes('NWIS')) document.title = document.title.replace(/NWIS/g, 'НИСВ'); }; fix(); setTimeout(fix, 0); }
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
