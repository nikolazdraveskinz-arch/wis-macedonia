/* NWIS mockup v3 – Programme of Measures in the structure of an RBMP chapter on measures (catalogue, measure sheets,
   issues, expected effect, costs, controls, progress monitoring). All values are placeholders, not real measures. */
(function () {
  const KTM = { KTM1: 'Wastewater treatment', KTM2: 'Nutrients from agriculture', KTM4: 'Contaminated sites', KTM5: 'Longitudinal continuity', KTM7: 'Flow regime, e-flows', KTM8: 'Water efficiency', KTM9: 'Pricing – households', KTM10: 'Pricing – industry', KTM12: 'Advisory services', KTM13: 'Drinking-water protection', KTM14: 'Knowledge base', KTM99: 'Other' };
  const M = [
    { id: 'MK_MSR_VAR_001', name: 'Construction of UWWTP Veles', group: 'Basic – EU directives', ktm: ['KTM1'], type: 'Basic – WFD Art. 11(3)(a), Urban Waste Water Treatment Directive', status: 'New', pressure: '1.1 Point – urban waste water (MK_PRS_PT_0412); issue S1', coverage: 'Middle Vardar · MK-VAR-RW-0014, MK-VAR-RW-0015', description: 'Collector and secondary treatment for the Veles agglomeration.', contribution: 'Lower organic and nutrient load downstream of Veles.', obstacles: 'Municipal co-financing; sludge disposal route [DATA NEEDED]', lead: 'MoEPP; Municipality of Veles', ind: ['WWTP operational', 0, 1, ''], cost: '€ 18.2 m', financing: 'Partly secured (EU grant)', deadline: '2031' },
    { id: 'MK_MSR_VAR_004', name: 'Nitrate action programme – Polog', group: 'Basic – EU directives', ktm: ['KTM2', 'KTM12'], type: 'Basic – WFD Art. 11(3)(a), Nitrates Directive', status: 'New', pressure: '2.2 Diffuse – agriculture (MK_PRS_DF_0031); issue S2', coverage: 'Upper Vardar · MK-VAR-GW-004', description: 'Designation of the vulnerable zone and an action programme on fertiliser and manure.', contribution: 'Nitrate in groundwater below the standard.', obstacles: 'Agreement between ministries', lead: 'MAFWE; MoEPP', ind: ['% agricultural land under the programme', 0, 40, '%'], cost: '[SIMULATION – € 3.2 m]', financing: '[DATA NEEDED]', deadline: '2030' },
    { id: 'MK_MSR_VAR_027', name: 'Drinking-water protection zones', group: 'Basic – EU directives', ktm: ['KTM13'], type: 'Basic – WFD Art. 7 and 11(3)(d)', status: 'Modified', pressure: 'Issue S6', coverage: 'Basin-wide · groundwater bodies', description: 'Delineation and designation of protection zones around priority sources.', contribution: 'Safer drinking-water sources.', obstacles: 'Compensation of land owners', lead: 'MoEPP; municipalities', ind: ['Designated zones', 6, 15, ''], cost: '€ 1.1 m', financing: 'Secured (state budget)', deadline: '2030' },
    { id: 'MK_MSR_VAR_033', name: 'Abstraction register and permit review – Bregalnica', group: 'Basic – other', ktm: ['KTM8', 'KTM99'], type: 'Basic – WFD Art. 11(3)(e)', status: 'Modified', pressure: '3.1 Abstraction – agriculture (MK_PRS_HM_0120); issue S4', coverage: 'Bregalnica · MK-VAR-RW-0201', description: 'Register of all abstractions with volumes, metering obligation and review of permits.', contribution: 'Abstractions within sustainable limits in dry summers.', obstacles: 'Metering not enforced', lead: 'MoEPP; water users', ind: ['% permitted abstractions in the register', 0, 100, '%'], cost: 'Administrative', financing: '—', deadline: '2031' },
    { id: 'MK_MSR_VAR_036', name: 'Ecological flow for small hydropower intakes', group: 'Basic – other', ktm: ['KTM7'], type: 'Basic – WFD Art. 11(3)(e)', status: 'New', pressure: '4.3 Hydrological alteration – hydropower; issue S3', coverage: 'Upper Vardar, Treska', description: 'Method for the minimum acceptable flow and its application at intakes.', contribution: 'Flow kept in the reaches below intakes.', obstacles: '[PENDING – method]', lead: 'MoEPP; operators', ind: ['Intakes with e-flow set', 0, 20, ''], cost: '[SIMULATION – € 0.4 m]', financing: '[DATA NEEDED]', deadline: '2032' },
    { id: 'MK_MSR_VAR_040', name: 'Water tariffs and cost recovery', group: 'Basic – other', ktm: ['KTM9', 'KTM10'], type: 'Basic – WFD Art. 9 and 11(3)(b)', status: 'Modified', pressure: 'Issue S8', coverage: 'Basin-wide', description: 'Tariff path for water supply and wastewater with an affordability safeguard.', contribution: 'Operation and maintenance financed by tariffs.', obstacles: 'Affordability in small municipalities', lead: 'Regulatory commission; utilities', ind: ['% cost recovery of O&M', 80, 95, '%'], cost: 'Administrative', financing: '—', deadline: '2033' },
    { id: 'MK_MSR_VAR_041', name: 'Remediation of a priority mining hotspot', group: 'Basic – other', ktm: ['KTM4'], type: 'Basic – WFD Art. 11(3)(k)', status: 'New', pressure: '2.5 Contaminated sites; issue S5', coverage: 'Bregalnica', description: 'Securing tailings and treating mine water at the priority site.', contribution: 'Lower metal loads to the river.', obstacles: 'Ownership of the site', lead: 'MoEPP', ind: ['Sites secured', 0, 2, ''], cost: '[DATA NEEDED]', financing: '[DATA NEEDED]', deadline: '2033' },
    { id: 'MK_MSR_VAR_019', name: 'Fish passage at Treska weir', group: 'Supplementary', ktm: ['KTM5'], type: 'Supplementary – WFD Art. 11(4)', status: 'New', pressure: '4.2 Dams and barriers (MK_PRS_HM_0077); issue S3', coverage: 'Treska · MK-VAR-RW-0102', description: 'Fish pass at the weir and monitoring of its use.', contribution: 'River continuity restored on the middle Treska.', obstacles: '—', lead: 'MoEPP; operator', ind: ['Barriers made passable', 0, 1, ''], cost: '€ 0.9 m', financing: 'Secured', deadline: '2029' },
    { id: 'MK_MSR_VAR_021', name: 'Farm advisory service', group: 'Supplementary', ktm: ['KTM12', 'KTM2'], type: 'Supplementary – WFD Art. 11(4)', status: 'Modified', pressure: '2.2 Diffuse – agriculture; issue S2', coverage: 'Lower Vardar', description: 'Advice on balanced fertilisation and pesticide use.', contribution: 'Lower nutrient and pesticide losses.', obstacles: '—', lead: 'Agency for agricultural development', ind: ['Farms advised', 0, 500, ''], cost: '€ 0.6 m', financing: 'Secured', deadline: '2033' },
    { id: 'MK_MSR_VAR_024', name: 'Modernisation of an irrigation scheme', group: 'Supplementary', ktm: ['KTM8'], type: 'Supplementary – WFD Art. 11(4)', status: 'Existing', pressure: '3.1 Abstraction – agriculture; issue S4', coverage: 'Lower Vardar', description: 'Pipes instead of open canals and volumetric metering.', contribution: 'Less water abstracted for the same area.', obstacles: '—', lead: 'Water management enterprise', ind: ['% irrigation efficiency', 30, 45, '%'], cost: '€ 12.0 m', financing: 'Secured (loan)', deadline: '2032' },
    { id: 'MK_MSR_VAR_044', name: 'Upgrade of the National Water Information System', group: 'Knowledge and governance', ktm: ['KTM14'], type: 'Knowledge base and governance', status: 'Modified', pressure: 'Issue S8', coverage: 'Basin-wide', description: 'NWIS operational and integrated with monitoring, permits and the groundwater database.', contribution: 'One authoritative source for planning and reporting.', obstacles: 'Link with the Water Quality platform', lead: 'MoEPP', ind: ['NWIS components operational', 0, 5, ''], cost: '€ 0.6 m', financing: 'Secured', deadline: '2030' },
    { id: 'MK_MSR_VAR_045', name: 'Extension of the monitoring network', group: 'Knowledge and governance', ktm: ['KTM14'], type: 'Knowledge base and governance', status: 'Modified', pressure: 'Issue S8', coverage: 'Basin-wide', description: 'New surface water stations and biological quality elements.', contribution: 'Status known for more water bodies.', obstacles: '[DATA NEEDED]', lead: 'Hydrometeorological Service; MoEPP', ind: ['Surface water stations', 20, 35, ''], cost: '[SIMULATION – € 1.5 m]', financing: 'Partly secured', deadline: '2032' }
  ];
  /* simulated reporting round: [status, % delivered, schedule, indicator value, milestone, obstacle] */
  const P = {
    MK_MSR_VAR_001: ['Ongoing', 45, 'At risk', 0, 'Works started 2029', 'Co-financing delayed'],
    MK_MSR_VAR_004: ['Delayed', 20, 'Late', 0, 'Zone proposal prepared', 'Designation not adopted'],
    MK_MSR_VAR_027: ['Ongoing', 60, 'On track', 11, '5 new zones designated', '—'],
    MK_MSR_VAR_033: ['Ongoing', 50, 'On track', 55, 'Register launched 2029', '—'],
    MK_MSR_VAR_036: ['In preparation', 15, 'At risk', 3, 'Method drafted', 'Method not adopted'],
    MK_MSR_VAR_040: ['Ongoing', 40, 'On track', 86, 'Tariff path approved', '—'],
    MK_MSR_VAR_041: ['Not started', 0, 'Late', 0, '—', 'Funding not secured'],
    MK_MSR_VAR_019: ['Completed', 100, 'On track', 1, 'Fish pass in operation 2029', '—'],
    MK_MSR_VAR_021: ['Ongoing', 45, 'On track', 210, 'Service active in 2 municipalities', '—'],
    MK_MSR_VAR_024: ['Ongoing', 55, 'On track', 37, 'Main pipeline completed', '—'],
    MK_MSR_VAR_044: ['Ongoing', 70, 'On track', 3, 'Phase 1 operational', 'API link pending'],
    MK_MSR_VAR_045: ['Ongoing', 40, 'At risk', 26, '6 new stations', 'Procurement delays']
  };
  const ISSUES = [
    ['S1', 'Urban wastewater', '1.1 Point – urban waste water', 'Middle Vardar, Bregalnica', ['KTM1'], ['MK_MSR_VAR_001']],
    ['S2', 'Diffuse pollution from agriculture', '2.2 Diffuse – agriculture', 'Upper Vardar, Lower Vardar', ['KTM2', 'KTM12'], ['MK_MSR_VAR_004', 'MK_MSR_VAR_021']],
    ['S3', 'Hydromorphological alterations', '4.2 Dams and barriers; 4.3 Hydrological alteration', 'Treska, Upper Vardar', ['KTM5', 'KTM7'], ['MK_MSR_VAR_019', 'MK_MSR_VAR_036']],
    ['S4', 'Over-abstraction and water scarcity', '3.1 Abstraction – agriculture', 'Bregalnica, Lower Vardar', ['KTM8'], ['MK_MSR_VAR_033', 'MK_MSR_VAR_024']],
    ['S5', 'Industrial and mining pollution', '1.3 IED plants; 2.5 Contaminated sites', 'Bregalnica', ['KTM4'], ['MK_MSR_VAR_041']],
    ['S6', 'Groundwater and drinking-water protection', 'Several', 'Basin-wide', ['KTM13'], ['MK_MSR_VAR_027']],
    ['S7', 'Floods, droughts and climate change', 'Climate change', 'Middle Vardar', ['KTM99'], []],
    ['S8', 'Knowledge and governance gaps', '—', 'Basin-wide', ['KTM14', 'KTM9'], ['MK_MSR_VAR_040', 'MK_MSR_VAR_044', 'MK_MSR_VAR_045']]
  ];
  /* indicator, unit, baseline, 2030 (simulated), target 2033, direction */
  const IND = [
    ['Population with wastewater treatment', '%', 35, 45, 55, 'up'],
    ['Industrial facilities without pre-treatment', '%', 50, 41, 30, 'down'],
    ['Designated drinking-water protection zones', 'zones', 6, 11, 15, 'up'],
    ['Cost recovery of water services', '% of O&M', 80, 84, 95, 'up'],
    ['Surface water quality stations', 'stations', 20, 26, 35, 'up'],
    ['Nitrate vulnerable zone designated', 'yes = 1', 0, 0, 1, 'up']
  ];
  const COSTS = [['Wastewater collection and treatment', '€ 18.2 m', 'MK_MSR_VAR_001'], ['Agriculture and irrigation', '€ 15.8 m', 'MK_MSR_VAR_004, _021, _024'], ['Hydromorphology', '€ 1.3 m', 'MK_MSR_VAR_019, _036'], ['Drinking-water protection', '€ 1.1 m', 'MK_MSR_VAR_027'], ['Contaminated sites', '[DATA NEEDED]', 'MK_MSR_VAR_041'], ['Knowledge base and governance', '€ 2.1 m', 'MK_MSR_VAR_044, _045']];
  const CONTROLS = [['(d) Drinking-water protection', 'Rulebooks on protection zones; zones designated by government decision', 'Zones incomplete; register of protected areas not consolidated', 'MK_MSR_VAR_027'], ['(e) Abstraction and impoundment', 'Water-use permits', 'No complete register with volumes; metering not systematic', 'MK_MSR_VAR_033, _036'], ['(g) Point-source discharges', 'Discharge and integrated permits', 'Many facilities discharge without pre-treatment', 'MK_MSR_VAR_001'], ['(i) Physical modifications', 'Authorisation for works in watercourses', 'Gravel extraction poorly controlled', '—']];

  const $ = (q) => document.querySelector(q);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rich = (s) => esc(s).replace(/\[(DATA NEEDED|SIMULATION|PENDING|CONFLICT)([^\]]*)\]/g, (m, k, rest) => `<span class="mk ${k === 'DATA NEEDED' ? 'mk-dn' : k === 'SIMULATION' ? 'mk-sim' : 'mk-pend'}">${k}${rest}</span>`);
  const chips = (ks) => ks.map((k, i) => `<span class="ktm-chip${i ? ' sec' : ''}" title="${esc(KTM[k] || '')}">${k}</span>`).join('');
  const stBadge = (s) => `<span class="badge ${s === 'New' ? 'badge-good' : s === 'Modified' ? 'qa-pending' : 'badge-inactive'}">${s}</span>`;
  const pBadge = (s) => `<span class="badge ${{ Completed: 'qa-accepted', Ongoing: 'badge-active', 'In preparation': 'qa-draft', 'Not started': 'qa-draft', Delayed: 'qa-rejected' }[s] || 'qa-draft'}">${s}</span>`;
  const scCol = { 'On track': '#059669', 'At risk': '#d97706', Late: '#dc2626', 'Off track': '#dc2626' };
  const open = (s) => (s.match(/\[(DATA NEEDED|SIMULATION|PENDING|CONFLICT)/g) || []).length;
  let current = M[0].id;

  /* ── Measures ── */
  function kpis() {
    const n = (f) => M.filter(f).length;
    $('#k-total').textContent = M.length; $('#k-basic').textContent = n((m) => m.group.startsWith('Basic'));
    $('#k-supp').textContent = n((m) => m.group === 'Supplementary'); $('#k-know').textContent = n((m) => m.group === 'Knowledge and governance');
    $('#k-new').textContent = n((m) => m.status === 'New'); $('#k-open').textContent = n((m) => Object.values(m).some((v) => typeof v === 'string' && /\[DATA NEEDED/.test(v)));
  }
  function filters() {
    const fill = (id, label, vals) => { $(id).innerHTML = `<option value="">${label}</option>` + vals.map((v) => `<option>${esc(v)}</option>`).join(''); };
    fill('#f-group', 'All groups', [...new Set(M.map((m) => m.group))]);
    fill('#f-status', 'All statuses', ['New', 'Modified', 'Existing']);
    $('#f-ktm').innerHTML = '<option value="">All KTM</option>' + [...new Set(M.flatMap((m) => m.ktm))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((k) => `<option value="${k}">${k} ${esc(KTM[k] || '')}</option>`).join('');
    ['#f-group', '#f-status', '#f-ktm'].forEach((id) => $(id).addEventListener('change', table));
    $('#ms-q').addEventListener('input', table);
  }
  function table() {
    const g = $('#f-group').value, s = $('#f-status').value, k = $('#f-ktm').value, q = $('#ms-q').value.toLowerCase();
    const rows = M.filter((m) => (!g || m.group === g) && (!s || m.status === s) && (!k || m.ktm.includes(k)) && (!q || JSON.stringify(m).toLowerCase().includes(q)));
    $('#ms-table tbody').innerHTML = rows.map((m) => `<tr data-id="${m.id}" class="${m.id === current ? 'on' : ''}"><td><span class="id-pill">${m.id}</span></td><td style="min-width:200px;"><b>${esc(m.name)}</b><div style="font-size:11px;color:#94a3b8;">${esc(m.group)} · ${esc(m.coverage.split(' · ')[0])}</div></td><td>${chips(m.ktm)}</td><td>${stBadge(m.status)}</td><td style="text-align:center;">${open(Object.values(m).filter((v) => typeof v === 'string').join(' ')) || '—'}</td></tr>`).join('');
    $('#ms-count').textContent = `${rows.length} of ${M.length} measures`;
    $('#ms-table tbody').querySelectorAll('tr').forEach((tr) => tr.onclick = () => { current = tr.dataset.id; table(); sheet(); });
  }
  function sheet() {
    const m = M.find((x) => x.id === current), p = P[m.id];
    $('#sh-title').innerHTML = `<span class="id-pill">${m.id}</span> ${esc(m.name)}`;
    const F = [['Group', esc(m.group) + ' · ' + stBadge(m.status)], ['Key Types of Measure', chips(m.ktm) + ' <span style="color:#94a3b8;font-size:11px;">first = primary</span>'], ['Type and legal basis', rich(m.type)], ['Pressure tackled', rich(m.pressure)], ['Coverage', rich(m.coverage)], ['Description', rich(m.description)], ['Expected contribution', rich(m.contribution)], ['Obstacles', rich(m.obstacles)], ['Lead and partners', rich(m.lead)], ['Indicator → target 2033', `${esc(m.ind[0])}: ${m.ind[1]} → ${m.ind[2]}${m.ind[3] ? ' ' + m.ind[3] : ''}`], ['Cost 2028–2033', rich(m.cost)], ['Financing / secured', rich(m.financing)], ['Deadline (proposed)', esc(m.deadline)], ['Progress (simulated)', `${pBadge(p[0])} ${p[1]}% · <span style="color:${scCol[p[2]]};font-weight:600;">${p[2]}</span> · indicator ${p[3]} / ${m.ind[2]}`]];
    $('#sh-dl').innerHTML = F.map(([l, v]) => `<dt>${l}</dt><dd>${v}</dd>`).join('');
  }

  /* ── Issues and expected effect ── */
  function issues() {
    $('#is-table tbody').innerHTML = ISSUES.map(([id, n, pr, sb, k, ms]) => `<tr><td><span class="id-pill">${id}</span></td><td><b>${esc(n)}</b></td><td>${esc(pr)}</td><td>${esc(sb)}</td><td>${chips(k)}</td><td>${ms.map((x) => `<span class="id-pill">${x}</span>`).join(' ') || '<span style="color:#94a3b8;">—</span>'}</td></tr>`).join('');
    $('#in-table tbody').innerHTML = IND.map(([n, u, b, , t, d]) => `<tr><td><b>${esc(n)}</b></td><td>${b} ${esc(u)}</td><td>${t} ${esc(u)}</td><td>${d === 'down' ? 'Lower is better' : 'Higher is better'}</td></tr>`).join('');
  }
  function costs() {
    $('#co-table tbody').innerHTML = COSTS.map(([a, b, c]) => `<tr><td><b>${esc(a)}</b></td><td>${rich(b)}</td><td>${esc(c)}</td></tr>`).join('');
    $('#ct-table tbody').innerHTML = CONTROLS.map(([a, b, c, d]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td><td>${esc(c)}</td><td>${esc(d)}</td></tr>`).join('');
  }

  /* ── Progress monitoring (simulated round) ── */
  function progress() {
    const vals = Object.values(P), n = (f) => vals.filter(f).length;
    $('#p-done').textContent = n((p) => p[0] === 'Completed'); $('#p-on').textContent = n((p) => p[0] === 'Ongoing');
    $('#p-prep').textContent = n((p) => p[0] === 'In preparation' || p[0] === 'Not started'); $('#p-late').textContent = n((p) => p[2] !== 'On track');
    $('#p-avg').textContent = Math.round(vals.reduce((a, p) => a + p[1], 0) / vals.length) + '%';
    $('#ind-list').innerHTML = IND.map(([name, u, b, v, t, d]) => {
      const share = Math.max(0, Math.min(1, (v - b) / (t - b))), j = share >= 0.4 ? 'On track' : share >= 0.25 ? 'At risk' : 'Off track';
      return `<div class="ind-row"><div class="ind-head"><span>${esc(name)}</span><span style="color:${scCol[j]};">${j} · ${Math.round(share * 100)}% of the way</span></div>
        <div class="ind-track"><i style="width:${Math.max(share ? 2 : 0, share * 100)}%;background:${scCol[j]};"></i><s style="left:50%;" title="Straight path: half way by 2030"></s></div>
        <div class="ind-nums">Baseline ${b} → 2030: <b style="color:#1f2937;">${v}</b> → target 2033: ${t} ${esc(u)}${d === 'down' ? ' (lower is better)' : ''}</div></div>`;
    }).join('');
    const only = $('#pg-risk').checked;
    const rows = M.filter((m) => !only || P[m.id][2] !== 'On track');
    $('#pg-table tbody').innerHTML = rows.map((m) => { const p = P[m.id]; const col = p[1] >= 100 ? '#059669' : '#1a6b82';
      return `<tr data-id="${m.id}"><td><span class="id-pill">${m.id}</span></td><td><b>${esc(m.name)}</b></td><td>${pBadge(p[0])}</td><td style="white-space:nowrap;"><span class="pbar"><i style="width:${p[1]}%;background:${col};"></i></span>${p[1]}%</td><td style="white-space:nowrap;"><b>${p[3]} / ${m.ind[2]}</b> <span style="font-size:11px;color:#94a3b8;">${esc(m.ind[0])}</span></td><td><span style="color:${scCol[p[2]]};font-weight:600;">${p[2]}</span></td><td>${esc(p[4])}</td><td>${esc(p[5])}</td></tr>`; }).join('');
    $('#pg-count').textContent = `${rows.length} of ${M.length} measures`;
    $('#pg-table tbody').querySelectorAll('tr').forEach((tr) => tr.onclick = () => { current = tr.dataset.id; switchTab('pm', 'cat'); table(); sheet(); $('#sh-card').scrollIntoView({ block: 'nearest' }); });
  }

  kpis(); filters(); table(); sheet(); issues(); costs(); progress();
  $('#pg-risk').addEventListener('change', progress);
})();
