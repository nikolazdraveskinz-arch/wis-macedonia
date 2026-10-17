/* NWIS mockup v2 – map viewer to ToR Task 7 specification (public and internal modes). */
window.initWisMap = function (opts) {
  const W = window.WIS, mode = opts.mode || 'public';
  const map = L.map(opts.el, { zoomControl: true }).setView((W.RBD && W.RBD.centre) || [41.72, 21.75], (W.RBD && W.RBD.zoom) || 8);
  const base = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap contributors' }),
    'Topographic': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '© OpenTopoMap' })
  };
  base['OpenStreetMap'].addTo(map);
  const ECO = { High: '#1a56db', Good: '#059669', Moderate: '#d97706', Poor: '#dc2626', Bad: '#7f1d1d', Unknown: '#94a3b8', 'n/a': '#94a3b8' };
  const info = document.getElementById(opts.info);

  function showInfo(html) { info.innerHTML = html; info.scrollTop = 0; }
  function docLinks(list) { return list.map(([t, h]) => `<a href="${h}" style="display:block;color:#1a56db;font-size:12px;margin:2px 0;"><i class="fas fa-file-alt" style="margin-right:5px;"></i>${t}</a>`).join(''); }
  function actions(target, extra) {
    const dl = mode === 'internal'
      ? `<button class="btn btn-secondary btn-sm" onclick="wisToast('Download as GeoPackage / Shapefile / GeoJSON – full attributes (role: ' + (function(){try{return localStorage.getItem('wis.role')||'superadmin'}catch(e){return 'superadmin'}})() + ') (mockup)')"><i class="fas fa-download"></i>Download</button>`
      : `<button class="btn btn-secondary btn-sm" onclick="wisToast('Public download: GeoJSON with generalised attributes (mockup)')"><i class="fas fa-download"></i>Download</button>`;
    const cm = mode === 'public' ? `<button class="btn btn-primary btn-sm" onclick='WIS.openComment(${JSON.stringify(target)},3)'><i class="fas fa-comment-dots"></i>Comment here</button>` : '';
    return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">${cm}${dl}${extra || ''}</div>`;
  }
  function photo(label) { return `<div style="height:90px;border-radius:8px;background:linear-gradient(135deg,#cffafe,#dbeafe);display:flex;align-items:center;justify-content:center;color:#64748b;font-size:11px;margin:8px 0;"><i class="fas fa-image" style="margin-right:6px;"></i>${label}</div>`; }

  const groups = {};
  function grp(name) { return groups[name] || (groups[name] = L.layerGroup().addTo(map)); }

  /* Water bodies */
  const wbLayers = {};
  W.WBS.forEach(w => {
    const style = { color: ECO[w.eco] || ECO[w.chem], weight: 5, fillOpacity: .25, bubblingMouseEvents: false };
    const lyr = w.line ? L.polyline(w.line, style) : L.polygon(w.poly, Object.assign({}, style, { weight: 2, color: w.cat === 'Groundwater' ? '#7c3aed' : style.color }));
    wbLayers[w.id] = lyr;
    lyr.addTo(grp(w.cat === 'River' ? 'River water bodies' : w.cat === 'Lake' ? 'Lake water bodies' : 'Groundwater bodies'));
    lyr.on('click', () => showInfo(`<div class="form-label" style="color:#64748b;">${w.cat} water body</div>
      <div style="font-weight:800;font-size:15px;color:#0f172a;">${w.name}</div><span class="id-pill">${w.id}</span>
      ${photo('Photo of ' + w.name)}
      <table class="data-table" style="font-size:12px;"><tr><td>Ecological status</td><td><b style="color:${ECO[w.eco]}">${w.eco}</b></td></tr><tr><td>Chemical status</td><td><b style="color:${ECO[w.chem]}">${w.chem}</b></td></tr>
      <tr><td>Reporting period</td><td>${W.cycle.period}</td></tr>${mode === 'internal' ? '<tr><td>Dataset / QA/QC</td><td>DS-VAR-001 v1.4 · accepted</td></tr><tr><td>Access level</td><td>Public</td></tr>' : ''}</table>
      <div class="form-label" style="margin-top:8px;">Documents and links</div>
      ${docLinks([['Water body fact sheet', W.base + 'explore/water-body/?id=' + w.id], ['Draft RBMP §2 Characterisation', W.base + 'participate/document/?d=RBMP#s2'], ['Draft RBMP §5 Monitoring and status', W.base + 'participate/document/?d=RBMP#s5']])}
      ${actions({ kind: 'wb', wb: w.id })}`));
  });
  /* River network (hydrological features) */
  const isVar = !W.RBD || W.RBD.id === 'VAR';
  if (isVar) L.polyline([[42.08, 21.30], [41.99, 21.42], [41.85, 21.62], [41.716, 21.776], [41.583, 21.950], [41.497, 22.090], [41.40, 22.25], [41.18, 22.52]], { color: '#60a5fa', weight: 2, dashArray: '4 4', interactive: false }).addTo(grp('River network (hydrology)'));
  /* Monitoring sites */
  W.SITES.forEach(s => L.circleMarker(s.ll, { radius: 7, color: '#0f172a', weight: 1.5, fillColor: '#38bdf8', fillOpacity: .9, bubblingMouseEvents: false }).addTo(grp('Monitoring sites'))
    .on('click', () => showInfo(`<div class="form-label" style="color:#64748b;">Monitoring site</div><div style="font-weight:800;font-size:15px;">${s.name}</div><span class="id-pill">${s.id}</span>
      <table class="data-table" style="font-size:12px;margin-top:8px;"><tr><td>Water body</td><td>${s.wb}</td></tr><tr><td>Responsible</td><td>Hydrometeorological Service</td></tr><tr><td>Latest results</td><td>2025 (imported)</td></tr></table>
      ${docLinks([['Monitoring results (CSV)', '#'], ['Monitoring programme description', '#']])}${actions({ kind: 'point', ll: s.ll, label: s.name })}`)));
  /* Pressures */
  W.PRESSURES.forEach(p => L.marker(p.ll, { icon: L.divIcon({ className: '', html: '<div style="width:14px;height:14px;background:#dc2626;transform:rotate(45deg);border:2px solid #fff;box-shadow:0 0 0 1px #dc2626;"></div>' }) }).addTo(grp('Pressures'))
    .on('click', () => showInfo(`<div class="form-label" style="color:#64748b;">Significant pressure</div><div style="font-weight:800;font-size:15px;">${p.name}</div><span class="id-pill">${p.id}</span>
      <table class="data-table" style="font-size:12px;margin-top:8px;"><tr><td>Type</td><td>${p.type}</td></tr><tr><td>Source</td><td>Pressures and impacts study (imported)</td></tr></table>
      ${docLinks([['Draft RBMP §3 Pressures and impacts', W.base + 'participate/document/?d=RBMP#s3']])}${actions({ kind: 'point', ll: p.ll, label: p.name })}`)));
  /* Protected area */
  if (isVar) L.polygon([[41.98, 21.25], [42.03, 21.36], [41.95, 21.42], [41.91, 21.30]], { color: '#16a34a', weight: 1.5, fillOpacity: .12, dashArray: '3 3', bubblingMouseEvents: false }).addTo(grp('Protected areas'))
    .on('click', () => showInfo(`<div class="form-label" style="color:#64748b;">Protected area</div><div style="font-weight:800;font-size:15px;">Drinking-water protection zone – Rashche</div><span class="id-pill">MK_PRA_DW_0019</span>
      ${docLinks([['Draft RBMP §4 Register of protected areas', W.base + 'participate/document/?d=RBMP#s4']])}${actions({ kind: 'point', ll: [41.97, 21.33], label: 'Protection zone Rashche' })}`));
  /* Programme of Measures */
  W.MEASURES.forEach(ms => L.marker(ms.ll, { icon: L.divIcon({ className: '', html: '<div style="width:16px;height:16px;border-radius:50%;background:#059669;border:2px solid #fff;box-shadow:0 0 0 1px #059669;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;">M</div>' }) }).addTo(grp('Programme of Measures'))
    .on('click', () => showInfo(`<div class="form-label" style="color:#64748b;">Planned measure</div><div style="font-weight:800;font-size:15px;">${ms.name}</div><span class="id-pill">${ms.id}</span>
      <table class="data-table" style="font-size:12px;margin-top:8px;"><tr><td>Key type of measure</td><td>${ms.ktm}</td></tr></table>
      ${docLinks([['Draft Programme of Measures §1', W.base + 'participate/document/?d=POM#s1']])}${actions({ kind: 'point', ll: ms.ll, label: ms.name })}`)));
  /* Comments layer */
  const cl = grp('Public comments (stage 3)');
  function drawComments() {
    cl.clearLayers();
    W.comments().filter(c => c.stage === 3).forEach(c => {
      let ll = null;
      if (c.target.kind === 'point') ll = c.target.ll;
      if (c.target.kind === 'wb') { const w = W.WBS.find(x => x.id === c.target.wb); if (w) { const pts = w.line || w.poly; ll = pts[Math.floor(pts.length / 2)]; } }
      if (!ll) return;
      L.marker(ll, { icon: L.divIcon({ className: '', html: '<div style="background:#7c3aed;color:#fff;border-radius:12px 12px 12px 2px;padding:2px 6px;font-size:10px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.3);"><i class="fas fa-comment"></i></div>' }) }).addTo(cl)
        .on('click', () => showInfo(`<div class="form-label" style="color:#64748b;">Public comment</div><div style="font-weight:800;">${c.id}</div><div style="margin:4px 0;">${W.statusBadge(c)}</div>
          <p style="font-size:12.5px;color:#334155;">"${c.text}"</p><div class="meta-row"><span><b>From:</b> ${c.org || c.who}</span><span><b>Date:</b> ${W.fmt(c.date)}</span></div>
          ${c.reason ? `<div class="alert alert-success" style="margin-top:8px;"><i class="fas fa-reply"></i><div>${c.reason}</div></div>` : ''}
          <a href="${W.base}participate/log/#${c.id}" class="btn btn-secondary btn-sm" style="margin-top:8px;">Open in public log</a>`));
    });
  }
  drawComments();
  window.onCommentAdded = drawComments;
  if (W.WBS.length) map.fitBounds(L.latLngBounds(W.WBS.flatMap(w => w.line || w.poly)), { padding: [30, 30] });
  const focus = new URLSearchParams(location.search).get('wb');
  const fw = focus && W.WBS.find(w => w.id === focus);
  if (fw) { map.fitBounds(L.latLngBounds(fw.line || fw.poly), { padding: [60, 60], maxZoom: 12 }); wbLayers[fw.id] && wbLayers[fw.id].fire('click'); }

  /* Layer control grouped by theme */
  const panel = document.getElementById(opts.layers);
  const THEMES = [['Water bodies', ['River water bodies', 'Lake water bodies', 'Groundwater bodies']], ['Hydrology', ['River network (hydrology)']], ['Monitoring', ['Monitoring sites']], ['Pressures', ['Pressures']], ['Protected areas', ['Protected areas']], ['Programme of Measures', ['Programme of Measures']], ['Participation', ['Public comments (stage 3)']]];
  const ACCESS = mode === 'internal' ? { 'Pressures': 'Internal', 'Monitoring sites': 'Public' } : {};
  panel.innerHTML = THEMES.map(([t, ls]) => `<div class="form-label" style="margin:10px 0 4px;color:#64748b;text-transform:uppercase;font-size:10px;letter-spacing:.8px;">${t}</div>` +
    ls.map(l => `<label class="layer-item" style="cursor:pointer;"><input type="checkbox" checked data-l="${l}"> <span style="flex:1;">${l}</span>${ACCESS[l] ? `<span class="badge badge-inactive" style="font-size:9px;">${ACCESS[l]}</span>` : ''}</label>`).join('')).join('') +
    `<div class="form-label" style="margin:10px 0 4px;color:#64748b;text-transform:uppercase;font-size:10px;letter-spacing:.8px;">Base map</div>` +
    Object.keys(base).map((b, i) => `<label class="layer-item"><input type="radio" name="bm" ${i ? '' : 'checked'} data-b="${b}"> ${b}</label>`).join('');
  panel.querySelectorAll('[data-l]').forEach(cb => cb.onchange = () => { const g = groups[cb.dataset.l]; cb.checked ? g.addTo(map) : map.removeLayer(g); });
  panel.querySelectorAll('[data-b]').forEach(r => r.onchange = () => { Object.values(base).forEach(x => map.removeLayer(x)); base[r.dataset.b].addTo(map); });

  /* Search: water-body ID, place name or "lat, lon" */
  const PLACES = { skopje: [41.998, 21.425], veles: [41.715, 21.775], tetovo: [42.010, 20.970], shtip: [41.745, 22.195], kavadarci: [41.433, 22.012], dojran: [41.21, 22.74], negotino: [41.484, 22.090], gevgelija: [41.14, 22.50], strumica: [41.437, 22.643], radovish: [41.638, 22.464], ohrid: [41.117, 20.802], struga: [41.178, 20.678], debar: [41.524, 20.524], resen: [41.089, 21.012], kumanovo: [42.132, 21.714] };
  const s = document.getElementById(opts.search);
  s.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = s.value.trim(), ql = q.toLowerCase();
    const m = q.match(/^\s*(-?\d+(\.\d+)?)\s*[, ]\s*(-?\d+(\.\d+)?)\s*$/);
    if (m) { const ll = [+m[1], +m[3]]; map.setView(ll, 12); L.popup().setLatLng(ll).setContent('Coordinates ' + q).openOn(map); return; }
    const w = W.WBS.find(x => x.id.toLowerCase() === ql || x.name.toLowerCase().includes(ql));
    if (w) { const pts = w.line || w.poly; map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] }); return; }
    const p = Object.keys(PLACES).find(k => k.startsWith(ql));
    if (p) { map.setView(PLACES[p], 12); return; }
    window.wisToast && wisToast('No match for "' + q + '" (try a water-body ID such as ' + ((W.WBS[0] && W.WBS[0].id) || 'MK-VAR-RW-0014') + ', a town, or 41.7, 21.8)');
  });

  /* Click on the map: comment on a point (public) or coordinates (internal) */
  map.on('click', e => {
    const ll = [+e.latlng.lat.toFixed(4), +e.latlng.lng.toFixed(4)];
    const html = mode === 'public'
      ? `<div style="font-size:12px;"><b>${ll[0]}, ${ll[1]}</b><br><button class="btn btn-primary btn-sm" style="margin-top:6px;" onclick='WIS.openComment({"kind":"point","ll":[${ll}]},3)'><i class="fas fa-comment-dots"></i>Comment here</button></div>`
      : `<div style="font-size:12px;"><b>${ll[0]}, ${ll[1]}</b><br>EPSG:4326</div>`;
    L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
  });
  return map;
};
