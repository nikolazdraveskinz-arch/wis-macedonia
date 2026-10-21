/* NWIS mockup v2 – Programme of Measures register and MoEPP progress record (Phase 1).
   MoEPP is the only institution entering data: other institutions appear only as the source of information ("reported by").
   All measures and values are placeholders. Records added in this browser are kept in localStorage ("wis.v2.pomprog"). */
(function () {
  const $ = (q) => document.querySelector(q);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const role = (() => { try { return localStorage.getItem('wis.role') || 'superadmin'; } catch (e) { return 'superadmin'; } })();
  const RL = { superadmin: 'Super admin (MoEPP)', editor: 'Editor (MoEPP)', contributor: 'Contributor', approver: 'Approver (MoEPP)', gis: 'GIS Expert (MoEPP)', technical: 'Technical user' }[role] || role;
  const canEnter = ['superadmin', 'editor'].includes(role), canApprove = ['superadmin', 'approver'].includes(role);
  const KTM = { KTM1: 'Construction or upgrades of wastewater treatment plants', KTM2: 'Reduce nutrient pollution from agriculture', KTM5: 'Improving longitudinal continuity', KTM7: 'Improvements in flow regime and/or e-flows', KTM8: 'Water efficiency, technical measures', KTM12: 'Advisory services for agriculture', KTM13: 'Drinking water protection measures', KTM14: 'Research, improvement of knowledge base' };
  /* ToR "Information on measures": code, KTM, name, type, water categories, coverage, status, description, contribution, obstacles, responsible, partners, cost, financing */
  const M = [
    { id: 'MK_MSR_VAR_001', name: 'Construction of UWWTP Veles', type: 'Basic – Art. 11(3)(a), Urban Waste Water Treatment Directive', ktm: ['KTM1'], cat: 'RW', cov: 'Water bodies', wb: 'MK-VAR-RW-0014, MK-VAR-RW-0015', prs: 'MK_PRS_PT_0412 · 1.1 Point – urban waste water', status: 'New', desc: 'Collector and secondary treatment for the Veles agglomeration.', contrib: 'Lower organic and nutrient load downstream of Veles.', obst: 'Municipal co-financing; sludge disposal route', lead: 'MoEPP', partners: 'Municipality of Veles; public utility', ind: ['KN28', 'Wastewater treatment works to be constructed or upgraded', 'number', 0, 1], cost: '€ 18.2 m', fin: 'EU grant and municipal budget', sec: 'Partly', deadline: 2032 },
    { id: 'MK_MSR_VAR_012', name: 'Nitrate action programme – Polog', type: 'Basic – Art. 11(3)(a), Nitrates Directive', ktm: ['KTM2', 'KTM12'], cat: 'GW', cov: 'Sub-unit', wb: 'MK-VAR-GW-004', prs: 'MK_PRS_DF_0031 · 2.2 Diffuse – agriculture', status: 'New', desc: 'Designation of the vulnerable zone and an action programme on fertiliser and manure.', contrib: 'Nitrate in groundwater below the standard.', obst: 'Agreement between ministries', lead: 'Ministry of Agriculture, Forestry and Water Economy', partners: 'MoEPP; agricultural advisory agency', ind: ['KA02', 'Agricultural land covered by measures', 'km²', 0, 120], cost: '€ 3.2 m', fin: 'State budget', sec: 'No', deadline: 2031 },
    { id: 'MK_MSR_VAR_019', name: 'Fish passage at Treska weir', type: 'Supplementary – Art. 11(4)', ktm: ['KTM5'], cat: 'RW', cov: 'Water body', wb: 'MK-VAR-RW-0102', prs: 'MK_PRS_HM_0077 · 4.2 Dams, barriers and locks', status: 'New', desc: 'Fish pass at the weir and monitoring of its use.', contrib: 'River continuity restored on the middle Treska.', obst: '—', lead: 'MoEPP', partners: 'Weir operator', ind: ['KN03', 'Barriers to be tackled', 'number', 0, 1], cost: '€ 0.9 m', fin: 'Operator and state budget', sec: 'Yes', deadline: 2029 },
    { id: 'MK_MSR_VAR_027', name: 'Drinking-water protection zones – delineation', type: 'Basic – Art. 11(3)(d) (WFD Art. 7)', ktm: ['KTM13'], cat: 'GW, RW', cov: 'RBD', wb: 'MK-VAR-GW-001 … MK-VAR-GW-012', prs: '— (protection measure)', status: 'Modified', desc: 'Delineation and designation of protection zones around priority sources.', contrib: 'Safer drinking-water sources; lower treatment needs.', obst: 'Compensation of land owners', lead: 'MoEPP', partners: 'Ministry of Health; municipalities', ind: ['KN07', 'Drinking water protection zones', 'zones', 6, 15], cost: '€ 1.1 m', fin: 'State budget', sec: 'Yes', deadline: 2031 },
    { id: 'MK_MSR_VAR_033', name: 'Abstraction register and permit review – Bregalnica', type: 'Basic – Art. 11(3)(e)', ktm: ['KTM7', 'KTM8'], cat: 'RW, GW', cov: 'Sub-unit', wb: 'MK-VAR-RW-0201', prs: 'MK_PRS_HM_0120 · 3.1 Abstraction – agriculture', status: 'Modified', desc: 'Register of all abstractions with volumes, metering obligation and review of permits.', contrib: 'Abstractions within sustainable limits in dry summers.', obst: 'Metering not enforced', lead: 'MoEPP', partners: 'Water users; irrigation enterprise', ind: ['KN17', 'Permits to be issued or updated', 'permits', 0, 140], cost: 'Administrative', fin: '—', sec: '—', deadline: 2031 },
    { id: 'MK_MSR_VAR_044', name: 'Upgrade of the National Water Information System', type: 'Supplementary – Art. 11(4), knowledge base', ktm: ['KTM14'], cat: 'All', cov: 'National', wb: 'Basin-wide', prs: '—', status: 'Modified', desc: 'NWIS operational and integrated with monitoring, permits and groundwater data.', contrib: 'One authoritative source for planning and reporting.', obst: 'Staff and IT capacity', lead: 'MoEPP', partners: 'Hydrometeorological Service', ind: ['KO99', 'Other: NWIS modules in operation', 'modules', 0, 6], cost: '€ 0.6 m', fin: 'EU project', sec: 'Yes', deadline: 2031 }
  ];
  /* MoEPP progress record: [measure, as-of, status, % delivered, indicator value, reported by (source), entered by, record state, note] */
  const SEED = [
    ['MK_MSR_VAR_001', '2029-12-31', 'In preparation', 15, 0, 'Municipality of Veles – letter of 2030-01-20', 'Editor (MoEPP)', 'Approved', 'Design completed'],
    ['MK_MSR_VAR_001', '2030-12-31', 'Ongoing', 45, 0, 'Municipality of Veles – letter of 2031-01-15', 'Editor (MoEPP)', 'Approved', 'Works started; co-financing delayed'],
    ['MK_MSR_VAR_012', '2030-12-31', 'Delayed', 20, 0, 'Ministry of Agriculture – meeting of 2031-01-22', 'Editor (MoEPP)', 'Approved', 'Zone proposal prepared; designation not adopted'],
    ['MK_MSR_VAR_019', '2030-12-31', 'Completed', 100, 1, 'Weir operator – completion report', 'Editor (MoEPP)', 'Approved', 'Fish pass in operation since 2029'],
    ['MK_MSR_VAR_027', '2030-12-31', 'Ongoing', 60, 11, 'MoEPP – own data', 'Editor (MoEPP)', 'Approved', '5 new zones designated'],
    ['MK_MSR_VAR_033', '2030-12-31', 'Ongoing', 35, 48, 'MoEPP – water permits unit', 'Editor (MoEPP)', 'Pending approval', 'Register launched; reviews ongoing'],
    ['MK_MSR_VAR_044', '2030-12-31', 'Ongoing', 70, 4, 'MoEPP – own data', 'Editor (MoEPP)', 'Approved', 'Phase 1 operational']
  ];
  const KEY = 'wis.v2.pomprog';
  let R; try { R = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { R = null; }
  if (!R) R = SEED.map((r) => r.slice());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(R)); } catch (e) { /* kept for this visit only */ } };
  let cur = M[0].id;

  const latest = (id, approvedOnly) => R.filter((r) => r[0] === id && (!approvedOnly || r[7] === 'Approved')).sort((a, b) => (a[1] < b[1] ? 1 : -1))[0];
  function schedule(m, r) {
    if (!r) return ['No record', '#94a3b8'];
    if (r[2] === 'Completed') return ['Completed', '#059669'];
    const t = (new Date(r[1]) - new Date('2028-01-01')) / (new Date(m.deadline + '-12-31') - new Date('2028-01-01'));
    const exp = Math.max(0, Math.min(100, Math.round(t * 100)));
    if (r[1] > m.deadline + '-12-31') return ['Late', '#dc2626'];
    return r[3] >= exp - 10 ? ['On track', '#059669'] : r[3] >= exp - 25 ? ['At risk', '#d97706'] : ['Late', '#dc2626'];
  }
  const chips = (k) => k.map((x, i) => `<span class="ktm-chip${i ? ' sec' : ''}" title="${esc(KTM[x] || '')}">${x}</span>`).join('');
  const stB = (s) => `<span class="badge ${s === 'New' ? 'badge-good' : s === 'Modified' ? 'qa-pending' : 'badge-inactive'}">${s}</span>`;

  function kpis() {
    const n = (f) => M.filter(f).length;
    $('#k-n').textContent = M.length; $('#k-b').textContent = n((m) => m.type.startsWith('Basic')); $('#k-s').textContent = n((m) => m.type.startsWith('Supp'));
    $('#k-new').textContent = n((m) => m.status === 'New');
    $('#k-pend').textContent = R.filter((r) => r[7] === 'Pending approval').length;
  }
  function table() {
    const q = ($('#ms-q').value || '').toLowerCase(), ty = $('#ms-type').value, kt = $('#ms-ktm').value;
    const rows = M.filter((m) => (!ty || m.type.startsWith(ty)) && (!kt || m.ktm.includes(kt)) && (!q || JSON.stringify(m).toLowerCase().includes(q)));
    $('#ms-table tbody').innerHTML = rows.map((m) => `<tr class="ms-row ${m.id === cur ? 'sel' : ''}" data-id="${m.id}"><td><span class="id-pill">${m.id}</span></td><td><b>${esc(m.name)}</b></td><td style="font-size:12px;">${esc(m.type)}</td><td>${chips(m.ktm)}</td><td>${stB(m.status)}</td><td style="font-size:12px;">${esc(m.lead)}</td><td>${esc(m.cost)}</td><td>${m.deadline}</td></tr>`).join('');
    document.querySelectorAll('.ms-row').forEach((tr) => tr.onclick = () => { cur = tr.dataset.id; table(); sheet(); });
  }
  function sheet() {
    const m = M.find((x) => x.id === cur), r = latest(m.id, true), [sc, col] = schedule(m, r);
    $('#sh-title').innerHTML = `Measure sheet · <span class="id-pill">${m.id}</span>`;
    const F = [['Measure name', esc(m.name)], ['Key Types of Measure', chips(m.ktm) + ' <span style="color:#94a3b8;font-size:11px;">first = primary</span>'], ['Type of measure', esc(m.type)], ['Status in this RBMP', stB(m.status) + ' <span style="color:#94a3b8;font-size:11px;">Existing / Modified / New</span>'], ['Water categories', esc(m.cat)], ['Geographic coverage', esc(m.cov) + ' · ' + esc(m.wb)], ['Pressure tackled', esc(m.prs)], ['Description', esc(m.desc)], ['Expected contribution', esc(m.contrib)], ['Obstacles', esc(m.obst)], ['Responsible authority', esc(m.lead)], ['Partners', esc(m.partners)], ['Indicator (KTM list)', `<span class="id-pill">${m.ind[0]}</span> ${esc(m.ind[1])}: baseline ${m.ind[3]} → target 2033: ${m.ind[4]} ${esc(m.ind[2])}`], ['Cost 2028–2033', esc(m.cost)], ['Financing', esc(m.fin) + (m.sec !== '—' ? ` · secured: <b>${m.sec}</b>` : '')], ['Deadline', m.deadline], ['Latest approved progress', r ? `${r[2]} · ${r[3]}% · indicator ${r[4]} / ${m.ind[4]} · <b style="color:${col};">${sc}</b> <span style="color:#94a3b8;font-size:11px;">as of ${r[1]}</span>` : '<span style="color:#94a3b8;">No record yet</span>']];
    $('#sh-body').innerHTML = `<dl class="pm-dl">${F.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
  }
  function prog() {
    $('#pr-role').textContent = RL;
    $('#pr-table tbody').innerHTML = M.map((m) => { const r = latest(m.id, true), p = latest(m.id), [sc, col] = schedule(m, r);
      return `<tr><td><span class="id-pill">${m.id}</span><div style="font-size:12px;font-weight:600;">${esc(m.name)}</div></td><td style="white-space:nowrap;">${r ? r[1] : '—'}</td><td>${r ? esc(r[2]) : '—'}</td><td style="white-space:nowrap;">${r ? `<span class="pbar"><i style="width:${r[3]}%;background:${r[3] >= 100 ? '#059669' : '#1a6b82'};"></i></span>${r[3]}%` : '—'}</td><td style="white-space:nowrap;">${r ? `<b>${r[4]}</b> / ${m.ind[4]}` : '—'} <span style="font-size:11px;color:#94a3b8;">${m.ind[0]}</span></td><td><b style="color:${col};">${sc}</b></td><td style="font-size:11.5px;">${r ? esc(r[5]) : '—'}</td><td>${p && p[7] === 'Pending approval' ? '<span class="badge qa-pending" style="white-space:nowrap;">1 pending</span>' : ''}</td></tr>`; }).join('');
    $('#ind-list').innerHTML = M.map((m) => { const r = latest(m.id, true), v = r ? r[4] : m.ind[3], sh = Math.max(0, Math.min(1, (v - m.ind[3]) / (m.ind[4] - m.ind[3] || 1)));
      return `<div class="ind-row"><div class="ind-head"><span><span class="id-pill">${m.ind[0]}</span> ${esc(m.ind[1])}</span><span style="color:#64748b;">${Math.round(sh * 100)}% of the way</span></div><div class="ind-track"><i style="width:${Math.max(sh ? 2 : 0, sh * 100)}%;background:#1a6b82;"></i></div><div class="ind-nums">${m.id} · baseline ${m.ind[3]} → latest ${v} → target 2033: ${m.ind[4]} ${esc(m.ind[2])}</div></div>`; }).join('');
    const pend = R.map((r, i) => [r, i]).filter(([r]) => r[7] === 'Pending approval');
    $('#pend').innerHTML = pend.length ? pend.map(([r, i]) => `<div style="display:flex;gap:10px;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12.5px;"><div><span class="id-pill">${r[0]}</span> as of ${r[1]} · ${esc(r[2])} · ${r[3]}% · indicator ${r[4]}<div style="font-size:11.5px;color:#64748b;">Reported by: ${esc(r[5])} · entered by ${esc(r[6])}${r[8] ? ' · ' + esc(r[8]) : ''}</div></div>${canApprove ? `<div style="display:flex;gap:6px;"><button class="btn btn-primary btn-sm" data-ok="${i}">Approve</button><button class="btn btn-secondary btn-sm" data-no="${i}">Reject</button></div>` : '<span style="font-size:11px;color:#94a3b8;">Approver (MoEPP)</span>'}</div>`).join('') : '<div style="font-size:12.5px;color:#94a3b8;">Nothing waiting for approval.</div>';
    document.querySelectorAll('[data-ok]').forEach((b) => b.onclick = () => { R[+b.dataset.ok][7] = 'Approved'; save(); all(); wisToast('Progress record approved.'); });
    document.querySelectorAll('[data-no]').forEach((b) => b.onclick = () => { R.splice(+b.dataset.no, 1); save(); all(); wisToast('Progress record rejected and removed (logged in the audit trail).'); });
    $('#hist tbody').innerHTML = R.filter((r) => r[0] === $('#h-m').value).sort((a, b) => (a[1] < b[1] ? 1 : -1)).map((r) => `<tr><td style="white-space:nowrap;">${r[1]}</td><td>${esc(r[2])}</td><td>${r[3]}%</td><td>${r[4]}</td><td style="font-size:11.5px;">${esc(r[5])}</td><td style="font-size:11.5px;">${esc(r[6])}</td><td><span class="badge ${r[7] === 'Approved' ? 'qa-accepted' : 'qa-pending'}">${r[7]}</span></td><td style="font-size:11.5px;">${esc(r[8])}</td></tr>`).join('') || '<tr><td colspan="8" style="color:#94a3b8;">No records.</td></tr>';
    $('#f-go').disabled = !canEnter; $('#f-note-role').style.display = canEnter ? 'none' : 'block';
  }
  function all() { kpis(); table(); sheet(); prog(); }
  function csv(rows) { return rows.map((r) => r.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n'); }
  function dl(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400); }

  /* shared with the internal Dashboard and the public dashboards (approved records only there) */
  window.POM2 = { M, R, latest, schedule };
  if (!document.getElementById('ms-table')) return;
  $('#f-m').innerHTML = $('#h-m').innerHTML = M.map((m) => `<option value="${m.id}">${m.id} · ${esc(m.name)}</option>`).join('');
  $('#f-m').onchange = () => { const m = M.find((x) => x.id === $('#f-m').value); $('#f-i-l').textContent = `Indicator value (${m.ind[0]}, target ${m.ind[4]} ${m.ind[2]})`; };
  $('#f-m').onchange();
  $('#h-m').onchange = prog;
  ['#ms-q', '#ms-type', '#ms-ktm'].forEach((s) => $(s).addEventListener(s === '#ms-q' ? 'input' : 'change', table));
  $('#f-go').onclick = () => {
    const src = $('#f-src').value.trim(); if (!src) return wisToast('Enter the source of the information (who reported it, how and when).');
    const pct = Math.max(0, Math.min(100, +$('#f-p').value || 0)), st = $('#f-s').value;
    R.push([$('#f-m').value, $('#f-d').value || '2030-12-31', st, st === 'Completed' ? 100 : pct, +$('#f-i').value || 0, src, RL, 'Pending approval', $('#f-n').value.trim()]);
    save(); all(); wisToast('Record saved as pending. The Approver (MoEPP) checks it before it counts.');
  };
  $('#tpl').onclick = () => dl('NWIS_PoM_progress_template.csv', csv([['measure_id', 'as_of_date', 'status', 'share_delivered_pct', 'indicator_code', 'indicator_value', 'reported_by', 'note'], ...M.map((m) => [m.id, '2031-12-31', '', '', m.ind[0], '', '', ''])]));
  $('#imp').onclick = () => { const add = [['MK_MSR_VAR_027', '2031-12-31', 'Ongoing', 75, 13, 'MoEPP – compiled from municipal replies (Excel)', RL, 'Pending approval', 'Bulk import'], ['MK_MSR_VAR_001', '2031-12-31', 'Ongoing', 60, 0, 'Municipality of Veles – e-mail (Excel)', RL, 'Pending approval', 'Bulk import']];
    if (!canEnter) return wisToast('Import needs the Editor (MoEPP) or Super admin role.'); R.push(...add); save(); all(); wisToast('Template read: 2 rows valid, 0 errors – saved as pending approval (mockup).'); };
  $('#exp').onclick = () => dl('NWIS_PoM_progress_' + new Date().toISOString().slice(0, 10) + '.csv', csv([['measure_id', 'measure', 'ktm', 'lead', 'deadline', 'as_of', 'status', 'share_pct', 'schedule', 'indicator_code', 'indicator', 'value', 'target_2033', 'reported_by', 'entered_by']].concat(M.map((m) => { const r = latest(m.id, true); return [m.id, m.name, m.ktm.join(' '), m.lead, m.deadline, r ? r[1] : '', r ? r[2] : 'no information', r ? r[3] : '', schedule(m, r)[0], m.ind[0], m.ind[1], r ? r[4] : '', m.ind[4], r ? r[5] : '', r ? r[6] : '']; }))));
  $('#reset').onclick = (e) => { e.preventDefault(); try { localStorage.removeItem(KEY); } catch (er) {} location.reload(); };
  all();
})();
