/* WIS mockup v2 – iteration 3: shared participation data and behaviour.
   Demonstrator only. Comments a viewer adds are kept in that browser (localStorage). */
(function () {
  const W = window.WIS || (window.WIS = {});
  const DAY = 864e5;
  const today = new Date(new Date().toISOString().slice(0, 10));
  function addMonths(d, m) { const x = new Date(d); x.setUTCMonth(x.getUTCMonth() + m); return x; }
  function fmt(d) { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function iso(d) { return new Date(d).toISOString().slice(0, 10); }

  /* ── Art. 14 stages for Vardar RBD, cycle 2028–2033 (period starts 1 Jan 2028) ── */
  const STAGES = [
    { n: 1, key: 'timetable', title: 'Timetable and work programme', art: 'Art. 14(1)(a)',
      lead: 'How and when the plan is prepared, and how the public will be consulted.',
      legal: '2024-12-31', opens: '2024-12-16', closes: '2025-06-16',
      docs: ['TWP'] },
    { n: 2, key: 'swmi', title: 'Significant water management issues', art: 'Art. 14(1)(b)',
      lead: 'The main problems for water in the basin that the plan has to tackle.',
      legal: '2025-12-31', opens: '2025-12-15', closes: '2026-06-15',
      docs: ['SWMI'] },
    { n: 3, key: 'draft', title: 'Draft River Basin Management Plan', art: 'Art. 14(1)(c)',
      lead: 'The draft plan, its Programme of Measures and the Strategic Environmental Assessment.',
      legal: '2026-12-31', opens: '2026-09-01', closes: '2027-03-01',
      docs: ['RBMP', 'POM', 'SEA'] }
  ];
  STAGES.forEach(s => {
    const o = new Date(s.opens), c = new Date(s.closes);
    s.state = today < o ? 'Upcoming' : (today <= c ? 'Open' : 'Closed');
    s.daysLeft = Math.max(0, Math.ceil((c - today) / DAY));
    s.months = Math.round((c - o) / (DAY * 30.44));
    s.sixOk = c >= addMonths(o, 6);
    s.onTime = o <= new Date(s.legal);
  });

  /* ── Documents (versioned, permanent IDs, section anchors) ── */
  const DOCS = {
    TWP: { id: 'DOC-VAR-2028-TWP', title: 'Timetable and work programme, incl. statement of consultation measures', ver: 'v1.0', date: '2024-12-16', stage: 1, pages: 34,
      sections: [['1', 'Purpose and legal basis'], ['2', 'Planning steps and timetable 2024–2027'], ['3', 'Roles of institutions'], ['4', 'Consultation measures and channels'], ['5', 'How comments will be handled']] },
    SWMI: { id: 'DOC-VAR-2028-SWMI', title: 'Interim overview of significant water management issues', ver: 'v1.1', date: '2025-12-15', stage: 2, pages: 96,
      sections: [['1', 'Introduction'], ['2', 'Issue 1 – Urban wastewater'], ['3', 'Issue 2 – Diffuse agricultural pollution'], ['4', 'Issue 3 – Hydromorphological alterations'], ['5', 'Issue 4 – Over-abstraction and water scarcity'], ['6', 'Issue 5 – Industrial and mining pollution'], ['7', 'Issue 6 – Groundwater and drinking-water protection'], ['8', 'Issue 7 – Floods, droughts and climate change'], ['9', 'Issue 8 – Knowledge and governance gaps']] },
    RBMP: { id: 'DOC-VAR-2028-RBMP', title: 'Draft Vardar River Basin Management Plan 2028–2033', ver: 'v1.0 (draft)', date: '2026-09-01', stage: 3, pages: 312,
      sections: [['1', 'Introduction and general description'], ['2', 'Characterisation of water bodies'], ['3', 'Significant pressures and impacts'], ['4', 'Register of protected areas'], ['5', 'Monitoring networks and status'], ['6', 'Environmental objectives and exemptions'], ['7', 'Economic analysis of water use'], ['8', 'Programme of Measures (summary)'], ['9', 'Public information and consultation'], ['10', 'Competent authorities and contact points']] },
    POM: { id: 'DOC-VAR-2028-POM', title: 'Draft Programme of Measures 2028–2033', ver: 'v1.0 (draft)', date: '2026-09-01', stage: 3, pages: 128,
      sections: [['1', 'Basic measures (Art. 11(3))'], ['2', 'Supplementary measures (Art. 11(4))'], ['3', 'Measures by key type (KTM)'], ['4', 'Cost estimates and financing'], ['5', 'Measures by water body']] },
    SEA: { id: 'DOC-VAR-2028-SEA', title: 'Strategic Environmental Assessment – environmental report', ver: 'v1.0 (draft)', date: '2026-09-01', stage: 3, pages: 154,
      sections: [['1', 'Scope of the assessment'], ['2', 'Baseline environment'], ['3', 'Likely significant effects'], ['4', 'Alternatives considered'], ['5', 'Mitigation and monitoring']] }
  };

  const SWMI = [
    ['S1', 'Urban wastewater', 'Most towns discharge wastewater with little or no treatment, causing organic and nutrient pollution downstream.', 'Which towns should be treated first?'],
    ['S2', 'Diffuse pollution from agriculture', 'Fertilisers and manure raise nitrate levels, especially in alluvial aquifers such as Polog and Ovche Pole.', 'Which farming practices could change, and with what support?'],
    ['S3', 'Hydromorphological alterations', 'Dams, weirs, gravel extraction and channelisation change flow and block fish migration.', 'Where should river continuity be restored first?'],
    ['S4', 'Over-abstraction and water scarcity', 'Irrigation and supply abstractions exceed sustainable levels in dry summers, e.g. Bregalnica and Dojran.', 'How should water be shared between uses in dry years?'],
    ['S5', 'Industrial and mining pollution', 'Old and active mines and industry release heavy metals and hazardous substances.', 'Which hot spots should be cleaned up first?'],
    ['S6', 'Groundwater and drinking-water protection', 'Protection zones around wells and springs are incomplete; some groundwater bodies are at risk.', 'Which sources need protection zones most urgently?'],
    ['S7', 'Floods, droughts and climate change', 'More frequent extremes affect water availability and quality.', 'Which adaptation measures should the plan include?'],
    ['S8', 'Knowledge and governance gaps', 'Monitoring, data sharing and coordination between institutions are insufficient.', 'What would most improve how water is managed?']
  ];

  /* ── Places used by map and comment targets ── */
  const WBS = [
    { id: 'MK-VAR-RW-0014', name: 'Vardar – Gradsko to Negotino', cat: 'River', eco: 'Moderate', chem: 'Good', line: [[41.583, 21.950], [41.540, 22.005], [41.497, 22.090]] },
    { id: 'MK-VAR-RW-0015', name: 'Vardar – Veles to Gradsko', cat: 'River', eco: 'Poor', chem: 'Good', line: [[41.716, 21.776], [41.660, 21.850], [41.583, 21.950]] },
    { id: 'MK-VAR-RW-0102', name: 'Treska – middle reach', cat: 'River', eco: 'Good', chem: 'Good', line: [[41.930, 21.240], [41.965, 21.300], [41.985, 21.360]] },
    { id: 'MK-VAR-RW-0201', name: 'Bregalnica – Shtip reach', cat: 'River', eco: 'Poor', chem: 'Unknown', line: [[41.770, 22.080], [41.745, 22.150], [41.730, 22.215]] },
    { id: 'MK-VAR-LW-0003', name: 'Dojran Lake (national part)', cat: 'Lake', eco: 'Moderate', chem: 'Good', poly: [[41.235, 22.700], [41.235, 22.770], [41.185, 22.775], [41.180, 22.705]] },
    { id: 'MK-VAR-GW-004', name: 'Polog alluvial aquifer', cat: 'Groundwater', eco: 'n/a', chem: 'Poor', poly: [[42.080, 20.880], [42.090, 21.000], [41.960, 21.060], [41.930, 20.940]] }
  ];
  const SITES = [
    { id: 'MK_MON_SW_00431', name: 'Vardar – Gradsko', ll: [41.578, 21.955], wb: 'MK-VAR-RW-0014' },
    { id: 'MK_MON_SW_00447', name: 'Vardar – Demir Kapija', ll: [41.405, 22.245], wb: 'MK-VAR-RW-0015' },
    { id: 'MK_MON_GW_00112', name: 'Polog – piezometer P-12', ll: [42.010, 20.975], wb: 'MK-VAR-GW-004' },
    { id: 'MK_MON_HY_00019', name: 'Bregalnica – Shtip (flow)', ll: [41.742, 22.180], wb: 'MK-VAR-RW-0201' }
  ];
  const PRESSURES = [
    { id: 'MK_PRS_PT_0412', name: 'Urban wastewater discharge – Veles', ll: [41.708, 21.790], type: 'Point – urban wastewater' },
    { id: 'MK_PRS_PT_0398', name: 'Industrial discharge – Kavadarci', ll: [41.433, 22.012], type: 'Point – industry' },
    { id: 'MK_PRS_HM_0077', name: 'Weir – Treska middle reach', ll: [41.968, 21.318], type: 'Hydromorphological – weir' }
  ];
  const MEASURES = [
    { id: 'MK_MSR_VAR_001', name: 'Construction of UWWTP Veles', ll: [41.700, 21.800], ktm: 'KTM1' },
    { id: 'MK_MSR_VAR_019', name: 'Fish passage at Treska weir', ll: [41.972, 21.325], ktm: 'KTM5' }
  ];

  /* ── Seed comments (placeholders) ── */
  const SEED = [
    { id: 'PC-2025-0007', stage: 1, who: 'NGO', org: 'Eko-svest', date: '2025-02-11', target: { kind: 'chapter', doc: 'TWP', sec: '4' }, text: 'Please add public hearings in Shtip and Kumanovo, not only in Skopje.', status: 'Reviewed', outcome: 'Incorporated', reason: 'Two additional regional hearings added to the consultation measures.', change: 'TWP v1.1, §4.2' },
    { id: 'PC-2025-0012', stage: 1, who: 'Municipality / utility', org: 'Municipality of Veles', date: '2025-04-03', target: { kind: 'chapter', doc: 'TWP', sec: '2' }, text: 'The timetable leaves too little time for municipalities to deliver wastewater data.', status: 'Reviewed', outcome: 'Partly incorporated', reason: 'Data deadline moved by two months; overall timetable kept to meet Art. 14 deadlines.', change: 'TWP v1.1, §2.3' },
    { id: 'PC-2026-0031', stage: 2, who: 'Agriculture / irrigation', org: 'Irrigation users\' association', date: '2026-02-20', target: { kind: 'swmi', issue: 'S4' }, text: 'Irrigation abstraction figures for Bregalnica are outdated; new pumping stations are not counted.', status: 'Reviewed', outcome: 'Incorporated', reason: 'Abstraction inventory updated with 2025 permits from the Water Book.', change: 'SWMI v1.1, §5; dataset DS-VAR-011' },
    { id: 'PC-2026-0044', stage: 2, who: 'Citizen', org: '', date: '2026-03-14', target: { kind: 'wb', wb: 'MK-VAR-LW-0003' }, text: 'Dojran Lake level keeps falling. Is extraction for irrigation still allowed?', status: 'Reviewed', outcome: 'Not incorporated', reason: 'Issue already covered under S4; question answered with a link to the abstraction permits for the lake catchment.', change: '' },
    { id: 'PC-2026-0058', stage: 2, who: 'Research / consultancy', org: 'UKIM Faculty of Science', date: '2026-04-30', target: { kind: 'swmi', issue: 'S5' }, text: 'Add the Lojane and Zletovo mine areas as hot spots for heavy metals.', status: 'Reviewed', outcome: 'Incorporated', reason: 'Both areas added as significant point pressures.', change: 'SWMI v1.1, §6; MK_PRS_PT_0455, MK_PRS_PT_0456' },
    { id: 'PC-2026-0071', stage: 2, who: 'Energy / hydropower', org: 'Hydropower operator', date: '2026-05-22', target: { kind: 'swmi', issue: 'S3' }, text: 'Fish passages are not technically feasible at all weirs; please assess case by case.', status: 'Reviewed', outcome: 'Partly incorporated', reason: 'Case-by-case feasibility assessment added; restoration priority list kept.', change: 'SWMI v1.1, §4' },
    { id: 'PC-2026-0102', stage: 3, who: 'NGO', org: 'Eko-svest', date: '2026-09-18', target: { kind: 'chapter', doc: 'RBMP', sec: '6' }, text: 'Exemptions under Art. 4(4) for the Vardar main stem are not justified with costs.', status: 'Under review', outcome: '', reason: '', change: '' },
    { id: 'PC-2026-0109', stage: 3, who: 'Municipality / utility', org: 'PUC Veles', date: '2026-09-29', target: { kind: 'point', ll: [41.708, 21.790], label: 'Near Veles wastewater outlet' }, text: 'The wastewater outlet location shown is wrong; it moved 600 m downstream in 2023.', status: 'Received', outcome: '', reason: '', change: '' },
    { id: 'PC-2026-0115', stage: 3, who: 'Citizen', org: '', date: '2026-10-06', target: { kind: 'wb', wb: 'MK-VAR-GW-004' }, text: 'Nitrate in our village well is high. Will the plan include support for farmers in Polog?', status: 'Received', outcome: '', reason: '', change: '' },
    { id: 'PC-2026-0121', stage: 3, who: 'Agriculture / irrigation', org: 'Farmers\' federation', date: '2026-10-12', target: { kind: 'chapter', doc: 'POM', sec: '2' }, text: 'The nitrate measure needs a realistic timeline and funding from the agricultural budget.', status: 'Under review', outcome: '', reason: '', change: '' }
  ];

  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function comments() {
    const mine = store('wis.comments') || [];
    const edits = store('wis.commentEdits') || {};
    return SEED.concat(mine).map(c => Object.assign({}, c, edits[c.id] || {}));
  }
  function addComment(c) { const mine = store('wis.comments') || []; mine.push(c); store('wis.comments', mine); }
  function editComment(id, patch) { const e = store('wis.commentEdits') || {}; e[id] = Object.assign(e[id] || {}, patch); store('wis.commentEdits', e); }
  function myIds() { return (store('wis.comments') || []).map(c => c.id); }

  function targetLabel(t) {
    if (!t) return '—';
    if (t.kind === 'chapter') { const d = DOCS[t.doc]; const s = d.sections.find(x => x[0] === t.sec); return `${d.id} · §${t.sec} ${s ? s[1] : ''}`; }
    if (t.kind === 'swmi') { const i = SWMI.find(x => x[0] === t.issue); return `SWMI ${t.issue} · ${i ? i[1] : ''}`; }
    if (t.kind === 'wb') { const w = WBS.find(x => x.id === t.wb); return `${t.wb}${w ? ' · ' + w.name : ''}`; }
    if (t.kind === 'point') return `Map point ${t.ll[0].toFixed(3)}, ${t.ll[1].toFixed(3)}${t.label ? ' · ' + t.label : ''}`;
    return '—';
  }
  function targetIcon(t) { return { chapter: 'fa-file-alt', swmi: 'fa-exclamation-circle', wb: 'fa-water', point: 'fa-map-marker-alt' }[t && t.kind] || 'fa-comment'; }
  function statusBadge(c) {
    if (c.outcome) {
      const cls = { 'Incorporated': 'qa-accepted', 'Partly incorporated': 'qa-pending', 'Not incorporated': 'qa-rejected', 'Out of scope': 'qa-draft' }[c.outcome];
      return `<span class="badge ${cls}">${c.outcome}</span>`;
    }
    const cls = { 'Received': 'badge-active', 'Under review': 'badge-in-review', 'Reviewed': 'qa-accepted' }[c.status] || 'badge-active';
    return `<span class="badge ${cls}">${c.status}</span>`;
  }

  /* ── Comment modal (public side) ── */
  function modal(html) {
    let m = document.getElementById('wis-cm');
    if (!m) { m = document.createElement('div'); m.id = 'wis-cm'; document.body.appendChild(m); }
    m.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px;';
    m.innerHTML = html;
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    m.querySelectorAll('[data-close]').forEach(b => b.onclick = () => m.remove());
    return m;
  }
  function signInGate(after) {
    const m = modal(`<div class="card" style="width:min(460px,100%);"><div class="card-header"><h3 class="card-title"><i class="fas fa-user-lock" style="color:#1a56db;margin-right:6px;"></i>Sign in to comment</h3><button class="btn btn-secondary btn-sm" data-close>Close</button></div>
      <div class="card-body" style="display:grid;gap:10px;font-size:13px;color:#475569;">
        <p style="margin:0;">Reading is open to everyone. To comment, follow a consultation and track your comments, sign in or create a free account. You can also send comments by e-mail or post; they are registered in the same log.</p>
        <a class="btn btn-primary" style="justify-content:center;padding:9px;" href="${W.base}login/?next=${encodeURIComponent(location.pathname + location.search)}"><i class="fas fa-sign-in-alt"></i>Sign in</a>
        <a class="btn btn-secondary" style="justify-content:center;padding:9px;" href="${W.base}register/"><i class="fas fa-user-plus"></i>Create an account</a>
        <button class="btn btn-secondary" style="justify-content:center;padding:9px;" id="gate-demo"><i class="fas fa-flask"></i>Mockup: continue as demo user (Ana P.)</button>
      </div></div>`);
    m.querySelector('#gate-demo').onclick = () => { try { localStorage.setItem('wis.signedIn', '1'); } catch (e) {} m.remove(); after(); };
  }
  function follow(scope) {
    if (!W.isSignedIn()) return signInGate(() => follow(scope));
    const m = modal(`<div class="card" style="width:min(480px,100%);"><div class="card-header"><h3 class="card-title"><i class="fas fa-bell" style="color:#d97706;margin-right:6px;"></i>Follow the consultation</h3><button class="btn btn-secondary btn-sm" data-close>Close</button></div>
      <div class="card-body" style="display:grid;gap:8px;font-size:13px;">
        <div class="form-label">Send me an e-mail when</div>
        <label style="display:flex;gap:8px;"><input type="checkbox" checked> a consultation stage opens in the Vardar RBD</label>
        <label style="display:flex;gap:8px;"><input type="checkbox" checked> 30 days before a stage closes</label>
        <label style="display:flex;gap:8px;"><input type="checkbox" checked> a consultation report or a new plan version is published</label>
        <label style="display:flex;gap:8px;"><input type="checkbox"> a public hearing or meeting is announced</label>
        <div class="form-label" style="margin-top:6px;">Only about these topics (optional)</div>
        <select class="form-input" multiple size="4">${SWMI.map(i => `<option>${i[0]} · ${i[1]}</option>`).join('')}</select>
        <div class="form-hint">Also available as an RSS feed. You can unsubscribe from any e-mail.</div>
        <button class="btn btn-primary" id="fl-save" style="justify-content:center;padding:9px;"><i class="fas fa-check"></i>Save</button>
      </div></div>`);
    m.querySelector('#fl-save').onclick = () => { m.remove(); (window.wisToast || alert)('You now follow the Vardar RBMP consultation (mockup).'); };
  }

  function openComment(target, stageN) {
    if (!W.isSignedIn()) return signInGate(() => openComment(target, stageN));
    const st = STAGES.find(s => s.n === (stageN || 3));
    let m = document.getElementById('wis-cm');
    if (!m) { m = document.createElement('div'); m.id = 'wis-cm'; document.body.appendChild(m); }
    const closed = st.state !== 'Open';
    const tOpts = Object.keys(DOCS).filter(k => DOCS[k].stage === st.n).map(k => DOCS[k].sections.map(s => `<option value="chapter|${k}|${s[0]}">${DOCS[k].id} · §${s[0]} ${s[1]}</option>`).join('')).join('')
      + (st.n === 2 ? SWMI.map(i => `<option value="swmi|${i[0]}">SWMI ${i[0]} · ${i[1]}</option>`).join('') : '')
      + WBS.map(w => `<option value="wb|${w.id}">${w.id} · ${w.name}</option>`).join('');
    m.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px;';
    m.innerHTML = `<div class="card" style="width:min(620px,100%);max-height:92vh;overflow:auto;">
      <div class="card-header"><h3 class="card-title"><i class="fas fa-comment-dots" style="color:#7c3aed;margin-right:6px;"></i>Comment · Stage ${st.n}: ${st.title}</h3><button class="btn btn-secondary btn-sm" id="cm-x">Close</button></div>
      <div class="card-body" style="display:grid;gap:12px;">
        ${closed ? `<div class="alert alert-warn"><i class="fas fa-lock"></i><div>This stage is ${st.state.toLowerCase()} (comments ${st.state === 'Closed' ? 'closed on' : 'open on'} ${fmt(st.state === 'Closed' ? st.closes : st.opens)}). The form is shown for demonstration only.</div></div>` : `<div class="alert alert-info"><i class="fas fa-hourglass-half"></i><div>Open for comments until <b>${fmt(st.closes)}</b> · ${st.daysLeft} days left.</div></div>`}
        <div><label class="form-label">Your comment is about</label>
          <select class="form-input" id="cm-target">${target && target.kind === 'point' ? `<option value="point">${targetLabel(target)}</option>` : ''}${tOpts}</select>
          <div class="form-hint">A chapter, an issue, a water body or a point on the map. You can also start from the map with "Comment here".</div></div>
        <div><label class="form-label">Comment *</label><textarea class="form-input" id="cm-text" rows="5" placeholder="What should change, and why?"></textarea></div>
        <div><label class="form-label">Attachment (optional)</label><input class="form-input" type="file"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div><label class="form-label">Signed in as</label><div class="form-input" style="background:#f8fafc;">Ana P. · Citizen</div></div>
          <div><label class="form-label">Show my name in the public log</label><select class="form-input" id="cm-pub"><option value="0">No – show category only</option><option value="1">Yes</option></select></div>
        </div>
        <div style="font-size:11.5px;color:#64748b;">Every comment receives a reference number, is assessed by MoEPP, and gets a published outcome and reason. You will be notified by e-mail when the status changes.</div>
        <div style="display:flex;gap:8px;"><button class="btn btn-primary" id="cm-send" style="padding:9px 16px;"><i class="fas fa-paper-plane"></i>Submit comment</button><a class="btn btn-secondary" style="padding:9px 16px;" href="${W.base}register/">Not registered yet?</a></div>
      </div></div>`;
    if (target) {
      const sel = m.querySelector('#cm-target');
      const v = target.kind === 'chapter' ? `chapter|${target.doc}|${target.sec}` : target.kind === 'swmi' ? `swmi|${target.issue}` : target.kind === 'wb' ? `wb|${target.wb}` : 'point';
      if ([...sel.options].some(o => o.value === v)) sel.value = v;
    }
    m.querySelector('#cm-x').onclick = () => m.remove();
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    m.querySelector('#cm-send').onclick = () => {
      const txt = m.querySelector('#cm-text').value.trim();
      if (!txt) { m.querySelector('#cm-text').style.borderColor = '#dc2626'; return; }
      const v = m.querySelector('#cm-target').value.split('|');
      const t = v[0] === 'point' ? target : v[0] === 'chapter' ? { kind: 'chapter', doc: v[1], sec: v[2] } : v[0] === 'swmi' ? { kind: 'swmi', issue: v[1] } : { kind: 'wb', wb: v[1] };
      const id = 'PC-' + today.getFullYear() + '-' + String(200 + myIds().length).padStart(4, '0');
      addComment({ id, stage: st.n, who: 'Citizen', org: m.querySelector('#cm-pub').value === '1' ? 'Ana P.' : '', date: iso(today), target: t, text: txt, status: 'Received', outcome: '', reason: '', change: '', mine: true });
      m.remove();
      (window.wisToast || alert)(`Comment ${id} received. Confirmation sent by e-mail (mockup). Follow it under "My comments".`);
      if (window.onCommentAdded) window.onCommentAdded();
    };
  }

  Object.assign(W, { follow, signInGate, STAGES, DOCS, SWMI, WBS, SITES, PRESSURES, MEASURES, comments, addComment, editComment, myIds, targetLabel, targetIcon, statusBadge, openComment, fmt, iso, addMonths, today });
})();
