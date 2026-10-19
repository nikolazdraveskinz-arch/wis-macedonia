/* NWIS mockup v2 – geoportal toolbar for the map viewer, modelled on the Sava GIS Geoportal tool set.
   Navigation · view aids · identify/selection · measuring · attribute table, print and settings.
   All values are placeholders; geometry is schematic. */
window.initWisMapTools = function (map, opts) {
  const W = window.WIS, M = map.wis, stage = document.getElementById(opts.stage);
  const info = M.info, toast = m => (window.wisToast || alert)(m);
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const settings = { coord: 'dec', hoverCoords: true };
  const internal = M.mode === 'internal';
  const idle = opts.idle || 'Click a water body, site, pressure, measure or comment on the map. Click anywhere else to comment on that point.';

  /* ───────── toolbar ───────── */
  const GROUPS = [
    ['Navigation', [['identify', 'fa-hand-paper', 'Pan and identify', 1], ['zrect', 'fa-vector-square', 'Zoom to rectangle', 1], ['home', 'fa-expand', 'Zoom to full extent'],
      ['zsel', 'fa-crosshairs', 'Zoom to selected feature'], ['prev', 'fa-arrow-left', 'Previous view'], ['next', 'fa-arrow-right', 'Next view']]],
    ['View', [['ov', 'fa-map', 'Overview map', 2], ['grat', 'fa-border-all', 'Graticule (coordinate grid)', 2]]],
    ['Identify', [['idpoly', 'fa-draw-polygon', 'Identify features by polygon', 1], ['search', 'fa-search', 'Search data'], ['clearsel', 'fa-eraser', 'Clear identify and selection']]],
    ['Measure', [['dist', 'fa-ruler', 'Measure length', 1], ['area', 'fa-ruler-combined', 'Measure area', 1], ['clearmeas', 'fa-times-circle', 'Clear measurements']]],
    ['Data', [['table', 'fa-table', 'Attribute table', 2], ['print', 'fa-print', 'Print / export map'], ['set', 'fa-cog', 'Settings']]]
  ];
  /* opts.tools: optional list of tool keys to show (the internal portal uses a reduced staff set) */
  if (opts.tools) GROUPS.forEach(g => { g[1] = g[1].filter(t => opts.tools.includes(t[0])); });
  for (let i = GROUPS.length - 1; i >= 0; i--) if (!GROUPS[i][1].length) GROUPS.splice(i, 1);
  /* kind 1 = map mode (one at a time), 2 = on/off panel, none = one-off action */
  const KIND = {}; GROUPS.forEach(g => g[1].forEach(t => KIND[t[0]] = t[3] || 0));
  const bar = document.createElement('div');
  bar.className = 'mtb'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Map tools');
  bar.innerHTML = GROUPS.map(([g, ts]) => `<div class="mtb-grp" role="group" aria-label="${g}">` + ts.map(([k, ic, t, kind]) =>
    `<button type="button" class="mtb-btn" data-t="${k}" title="${t}" aria-label="${t}"${kind ? ' aria-pressed="false"' : ''}><i class="fas ${ic}"></i></button>`).join('') + '</div>').join('') +
    `<span class="mtb-hint" id="mtb-hint" aria-live="polite"></span>`;
  stage.prepend(bar);
  const btn = k => bar.querySelector(`[data-t="${k}"]`);
  const hint = t => { bar.querySelector('#mtb-hint').textContent = t || ''; };

  /* status bar: scale, cursor coordinates, reference system */
  const status = document.createElement('div');
  status.className = 'map-status';
  status.innerHTML = `<span class="map-chip" id="ms-scale">Scale 1 : –</span><span class="map-chip" id="ms-xy">Move the cursor over the map</span><span class="map-chip">WGS 84 (EPSG:4326) · display</span>`;
  stage.appendChild(status);
  L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);
  const dms = v => { const a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60), s = ((a - d - m / 60) * 3600).toFixed(1); return `${d}° ${String(m).padStart(2, '0')}′ ${String(s).padStart(4, '0')}″`; };
  const fmtLL = ll => settings.coord === 'dms' ? `${dms(ll.lat)} N · ${dms(ll.lng)} E` : `${ll.lat.toFixed(5)}° N · ${ll.lng.toFixed(5)}° E`;
  function scale() {
    const c = map.getCenter(), mpp = 156543.03392 * Math.cos(c.lat * Math.PI / 180) / Math.pow(2, map.getZoom());
    const sc = Math.round(mpp * 96 / 0.0254), r = sc > 100000 ? Math.round(sc / 5000) * 5000 : Math.round(sc / 500) * 500;
    status.querySelector('#ms-scale').textContent = 'Scale 1 : ' + r.toLocaleString('en-GB').replace(/,/g, ' ');
  }
  map.on('zoomend moveend', scale); scale();
  map.on('mousemove', e => { if (settings.hoverCoords) status.querySelector('#ms-xy').textContent = fmtLL(e.latlng); });

  /* ───────── modes ───────── */
  let mode = 'identify';
  const pressed = (k, on) => { const b = btn(k); b && b.setAttribute('aria-pressed', on); };
  function setMode(k) {
    if (mode !== 'identify' && mode !== k) stopDrawing();
    mode = (mode === k && k !== 'identify') ? 'identify' : k;
    map.wisTool = mode;
    ['identify', 'zrect', 'idpoly', 'dist', 'area'].forEach(t => pressed(t, t === mode));
    stage.classList.toggle('tool-draw', mode !== 'identify');
    if (mode === 'zrect') map.dragging.disable(); else map.dragging.enable();
    map.doubleClickZoom[['idpoly', 'dist', 'area'].includes(mode) ? 'disable' : 'enable']();
    hint({ identify: '', zrect: 'Drag a rectangle on the map to zoom to it', idpoly: 'Click to draw a polygon · double-click to finish · Esc to cancel',
      dist: 'Click to add points · double-click to finish · Esc to cancel', area: 'Click to add corners · double-click to finish · Esc to cancel' }[mode]);
  }

  /* ───────── selection ───────── */
  const selLayer = L.featureGroup().addTo(map);
  let selected = null;
  function highlight(layer) {
    selLayer.clearLayers(); selected = layer;
    if (!layer) return;
    if (layer.getLatLng) L.circleMarker(layer.getLatLng(), { radius: 16, color: '#c9a84c', weight: 3, fill: false, interactive: false }).addTo(selLayer);
    else L.polyline(flat(layer.getLatLngs()), { color: '#c9a84c', weight: 9, opacity: .55, interactive: false }).addTo(selLayer).bringToBack();
  }
  map.on('wis:select', e => { if (mode === 'identify') highlight(e.layer); });
  const flat = a => Array.isArray(a) && a.length && Array.isArray(a[0]) ? a.flatMap(flat) : a;
  const boundsOf = l => l.getLatLng ? L.latLngBounds([l.getLatLng(), l.getLatLng()]) : l.getBounds();

  /* ───────── view history ───────── */
  const hist = []; let hi = -1, nav = false;
  map.on('moveend', () => {
    if (nav) { nav = false; return; }
    const v = { c: map.getCenter(), z: map.getZoom() }, last = hist[hi];
    if (last && last.z === v.z && last.c.distanceTo(v.c) < 1) return;
    hist.splice(hi + 1); hist.push(v); hi = hist.length - 1; navState();
  });
  function navState() { const p = btn('prev'), n = btn('next'); if (p) p.disabled = hi <= 0; if (n) n.disabled = hi >= hist.length - 1; }
  function go(d) { const v = hist[hi + d]; if (!v) return; hi += d; nav = true; map.setView(v.c, v.z); navState(); }

  /* ───────── drawing (zoom rectangle, polygon identify, measuring) ───────── */
  const drawLayer = L.featureGroup().addTo(map), measLayer = L.featureGroup().addTo(map);
  let pts = [], rubber = null, shape = null, rect = null, rectStart = null;
  const R = 6378137;
  function geoArea(lls) { let a = 0; for (let i = 0; i < lls.length; i++) { const p1 = lls[i], p2 = lls[(i + 1) % lls.length]; a += (p2.lng - p1.lng) * Math.PI / 180 * (2 + Math.sin(p1.lat * Math.PI / 180) + Math.sin(p2.lat * Math.PI / 180)); } return Math.abs(a * R * R / 2); }
  const fmtLen = m => m >= 1000 ? (m / 1000).toFixed(m >= 100000 ? 0 : 2) + ' km' : Math.round(m) + ' m';
  const fmtArea = a => a >= 1e6 ? (a / 1e6).toFixed(a >= 1e8 ? 0 : 2) + ' km²' : a >= 1e4 ? (a / 1e4).toFixed(1) + ' ha' : Math.round(a) + ' m²';
  const pathLen = lls => lls.reduce((s, p, i) => i ? s + map.distance(lls[i - 1], p) : 0, 0);
  function stopDrawing() { pts = []; drawLayer.clearLayers(); rubber = shape = null; if (rect) { map.removeLayer(rect); rect = null; } rectStart = null; }
  function redraw(cursor) {
    drawLayer.clearLayers();
    const poly = mode === 'idpoly' || mode === 'area', all = cursor ? pts.concat([cursor]) : pts;
    const col = mode === 'idpoly' ? '#c9a84c' : '#0d4a5e';
    if (all.length > 1) (poly ? L.polygon(all, { color: col, weight: 2, dashArray: '6 4', fillOpacity: .12, interactive: false }) : L.polyline(all, { color: col, weight: 3, dashArray: '6 4', interactive: false })).addTo(drawLayer);
    pts.forEach(p => L.circleMarker(p, { radius: 4, color: col, weight: 2, fillColor: '#fff', fillOpacity: 1, interactive: false }).addTo(drawLayer));
    if (cursor && (mode === 'dist' || mode === 'area') && pts.length) {
      const txt = mode === 'dist' ? fmtLen(pathLen(all)) : (all.length > 2 ? fmtArea(geoArea(all)) : fmtLen(pathLen(all)));
      L.tooltip({ permanent: true, direction: 'right', offset: [10, 0], className: 'meas-tip' }).setLatLng(cursor).setContent(txt).addTo(drawLayer);
    }
  }
  map.on('click', e => {
    if (!['idpoly', 'dist', 'area'].includes(mode)) return;
    pts.push(e.latlng); redraw();
  });
  map.on('mousemove', e => { if (pts.length && ['idpoly', 'dist', 'area'].includes(mode)) redraw(e.latlng); });
  map.on('dblclick', () => {
    if (!['idpoly', 'dist', 'area'].includes(mode)) return;
    /* the double-click's two clicks each added a point: drop the duplicate */
    if (pts.length > 1 && pts[pts.length - 1].distanceTo(pts[pts.length - 2]) < 1) pts.pop();
    finish();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mode !== 'identify') { stopDrawing(); hint(mode === 'identify' ? '' : 'Cancelled · ' + bar.querySelector('#mtb-hint').textContent.replace(/^Cancelled · /, '')); } });
  function finish() {
    const p = pts.slice(); stopDrawing();
    if (mode === 'dist' && p.length > 1) {
      const len = pathLen(p);
      L.polyline(p, { color: '#0d4a5e', weight: 3, interactive: false }).addTo(measLayer);
      p.forEach(q => L.circleMarker(q, { radius: 4, color: '#0d4a5e', weight: 2, fillColor: '#fff', fillOpacity: 1, interactive: false }).addTo(measLayer));
      L.tooltip({ permanent: true, direction: 'right', offset: [10, 0], className: 'meas-tip' }).setLatLng(p[p.length - 1]).setContent(fmtLen(len)).addTo(measLayer);
      M.showInfo(panel('Measure length', 'fa-ruler', `<div class="tool-big">${fmtLen(len)}</div><div class="tool-sub">${p.length} points · ${p.length - 1} segments · geodesic distance on WGS 84</div>
        <table class="data-table" style="font-size:12px;margin-top:10px;">${p.slice(1).map((q, i) => `<tr><td>Segment ${i + 1}</td><td style="text-align:right;">${fmtLen(map.distance(p[i], q))}</td></tr>`).join('')}</table>`));
    } else if (mode === 'area' && p.length > 2) {
      const a = geoArea(p), per = pathLen(p.concat([p[0]]));
      L.polygon(p, { color: '#0d4a5e', weight: 2, fillColor: '#2a8fa8', fillOpacity: .18, interactive: false }).addTo(measLayer);
      L.tooltip({ permanent: true, direction: 'center', className: 'meas-tip' }).setLatLng(L.polygon(p).getBounds().getCenter()).setContent(fmtArea(a)).addTo(measLayer);
      M.showInfo(panel('Measure area', 'fa-ruler-combined', `<div class="tool-big">${fmtArea(a)}</div><div class="tool-sub">Perimeter ${fmtLen(per)} · ${p.length} corners · geodesic area on WGS 84</div>`));
    } else if (mode === 'idpoly' && p.length > 2) identifyIn(p);
    else hint('Add more points before finishing');
  }
  /* zoom to rectangle */
  map.on('mousedown', e => { if (mode !== 'zrect') return; rectStart = e.latlng; rect = L.rectangle([rectStart, rectStart], { color: '#c9a84c', weight: 2, dashArray: '5 4', fillOpacity: .1, interactive: false }).addTo(map); });
  map.on('mousemove', e => { if (mode === 'zrect' && rectStart && rect) rect.setBounds([rectStart, e.latlng]); });
  map.on('mouseup', e => {
    if (mode !== 'zrect' || !rectStart) return;
    const b = L.latLngBounds(rectStart, e.latlng); map.removeLayer(rect); rect = null; rectStart = null;
    if (map.latLngToContainerPoint(b.getNorthWest()).distanceTo(map.latLngToContainerPoint(b.getSouthEast())) > 12) map.fitBounds(b);
  });

  /* ───────── identify by polygon ───────── */
  function inside(pt, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if (((a.lat > pt.lat) !== (b.lat > pt.lat)) && (pt.lng < (b.lng - a.lng) * (pt.lat - a.lat) / (b.lat - a.lat) + a.lng)) c = !c; } return c; }
  function features() {
    const out = [];
    Object.entries(M.groups).forEach(([g, fg]) => { if (!map.hasLayer(fg)) return; fg.eachLayer(l => out.push({ g, l })); });
    return out;
  }
  function label(l, g) {
    const w = Object.entries(M.wbLayers).find(([, x]) => x === l);
    if (w) { const o = W.WBS.find(x => x.id === w[0]); return [o.name, o.id]; }
    const ll = l.getLatLng && l.getLatLng(), near = (arr, key) => ll && arr.find(o => Math.abs(o[key][0] - ll.lat) < 1e-6 && Math.abs(o[key][1] - ll.lng) < 1e-6);
    const s = near(W.SITES, 'll') || near(W.PRESSURES, 'll') || near(W.MEASURES, 'll');
    return s ? [s.name, s.id] : [g, ''];
  }
  let found = [];
  function identifyIn(poly) {
    L.polygon(poly, { color: '#c9a84c', weight: 2, fillOpacity: .08, dashArray: '6 4', interactive: false }).addTo(selLayer);
    found = features().filter(({ l }) => l.getLatLng ? inside(l.getLatLng(), poly) : flat(l.getLatLngs()).some(p => inside(p, poly)));
    const by = {}; found.forEach((f, i) => (by[f.g] = by[f.g] || []).push(i));
    M.showInfo(panel('Identify by polygon', 'fa-draw-polygon', found.length ? `<div class="tool-sub">${found.length} features in ${Object.keys(by).length} layers · area ${fmtArea(geoArea(poly))}</div>` +
      Object.entries(by).map(([g, ix]) => `<div class="form-label" style="margin:12px 0 4px;color:#64748b;text-transform:uppercase;font-size:10px;letter-spacing:.8px;">${g} (${ix.length})</div>` +
        ix.map(i => { const [n, id] = label(found[i].l, g); return `<button class="tool-row" data-f="${i}"><b>${n}</b>${id ? `<span class="id-pill">${id}</span>` : ''}</button>`; }).join('')).join('')
      : '<div class="tool-sub">No visible features inside the polygon. Switch more layers on, or draw a larger polygon.</div>'));
    info.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const f = found[+b.dataset.f]; map.fitBounds(boundsOf(f.l), { maxZoom: 13, padding: [60, 60] }); f.l.fire('click'); });
  }

  /* ───────── search data ───────── */
  function searchPanel() {
    const rows = [].concat(W.WBS.map(w => ({ n: w.name, id: w.id, t: w.cat + ' water body', l: M.wbLayers[w.id] })),
      W.SITES.map(s => ({ n: s.name, id: s.id, t: 'Monitoring site', ll: s.ll })), W.PRESSURES.map(p => ({ n: p.name, id: p.id, t: 'Pressure · ' + p.type, ll: p.ll })),
      W.MEASURES.map(m => ({ n: m.name, id: m.id, t: 'Measure · ' + m.ktm, ll: m.ll })));
    M.showInfo(panel('Search data', 'fa-search', `<div class="search-wrap"><i class="fas fa-search"></i><input id="tool-q" class="search-input" style="width:100%;" placeholder="Name, identifier or type" autocomplete="off"></div>
      <div class="tool-sub" id="tool-qn" style="margin-top:8px;"></div><div id="tool-qr"></div>`));
    const q = info.querySelector('#tool-q'), out = info.querySelector('#tool-qr');
    function run() {
      const t = q.value.trim().toLowerCase(), hit = rows.filter(r => !t || (r.n + ' ' + r.id + ' ' + r.t).toLowerCase().includes(t));
      info.querySelector('#tool-qn').textContent = `${hit.length} of ${rows.length} features`;
      out.innerHTML = hit.map((r, i) => `<button class="tool-row" data-r="${rows.indexOf(r)}"><b>${r.n}</b><span class="tool-sub" style="display:block;">${r.t}</span><span class="id-pill">${r.id}</span></button>`).join('');
      out.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
        const r = rows[+b.dataset.r];
        if (r.l) { map.fitBounds(r.l.getBounds(), { padding: [60, 60], maxZoom: 13 }); r.l.fire('click'); }
        else { map.setView(r.ll, 13); const lyr = features().find(f => f.l.getLatLng && f.l.getLatLng().distanceTo(L.latLng(r.ll)) < 1); lyr ? lyr.l.fire('click') : L.popup().setLatLng(r.ll).setContent(`<b>${r.n}</b><br>${r.id}`).openOn(map); }
      });
    }
    q.oninput = run; run(); q.focus();
  }

  /* ───────── overview map ───────── */
  let ov = null, ovBox = null;
  function toggleOverview(on) {
    pressed('ov', on); stage.classList.toggle('ov-on', on);
    if (!on) { if (ov) { ov.remove(); ov = null; } const e = stage.querySelector('.map-ov'); e && e.remove(); return; }
    const el = document.createElement('div'); el.className = 'map-ov'; el.setAttribute('aria-label', 'Overview map'); stage.appendChild(el);
    ov = L.map(el, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(ov);
    ov.fitBounds([[40.85, 20.45], [42.37, 23.03]]);
    ovBox = L.rectangle(map.getBounds(), { color: '#c9a84c', weight: 2, fillOpacity: .15, interactive: false }).addTo(ov);
    ov.on('click', e => map.panTo(e.latlng));
  }
  map.on('moveend', () => { if (ovBox) ovBox.setBounds(map.getBounds()); });

  /* ───────── graticule ───────── */
  const gratLayer = L.featureGroup(); let gratOn = false;
  function drawGrat() {
    gratLayer.clearLayers(); if (!gratOn) return;
    const b = map.getBounds(), z = map.getZoom(), st = z >= 13 ? 0.01 : z >= 11 ? 0.05 : z >= 9 ? 0.1 : z >= 8 ? 0.25 : 0.5;
    const r = v => Math.round(v / st) * st;
    for (let la = r(b.getSouth()) - st; la <= b.getNorth() + st; la += st) {
      L.polyline([[la, b.getWest() - 1], [la, b.getEast() + 1]], { color: '#0d4a5e', weight: 1, opacity: .35, interactive: false }).addTo(gratLayer);
      L.tooltip({ permanent: true, direction: 'right', className: 'grat-lbl', offset: [2, 0] }).setLatLng([la, b.getWest()]).setContent(la.toFixed(st < .1 ? 2 : 2) + '°N').addTo(gratLayer);
    }
    for (let lo = r(b.getWest()) - st; lo <= b.getEast() + st; lo += st) {
      L.polyline([[b.getSouth() - 1, lo], [b.getNorth() + 1, lo]], { color: '#0d4a5e', weight: 1, opacity: .35, interactive: false }).addTo(gratLayer);
      L.tooltip({ permanent: true, direction: 'bottom', className: 'grat-lbl', offset: [0, 2] }).setLatLng([b.getNorth(), lo]).setContent(lo.toFixed(2) + '°E').addTo(gratLayer);
    }
  }
  map.on('moveend', drawGrat);

  /* ───────── attribute table ───────── */
  let drawer = null;
  function toggleTable(on) {
    pressed('table', on); stage.classList.toggle('table-on', on);
    if (!on) { drawer && drawer.remove(); drawer = null; setTimeout(() => map.invalidateSize(), 50); return; }
    drawer = document.createElement('section'); drawer.className = 'map-drawer'; drawer.setAttribute('aria-label', 'Attribute table');
    /* internal portal: staff also see the source dataset and its access level (placeholders, as in the metadata catalogue) */
    const staff = (ds, acc) => internal ? { Dataset: ds, Access: acc } : {};
    const LAY = { 'Water bodies': W.WBS.map(w => Object.assign({ Identifier: w.id, Name: w.name, Category: w.cat, 'Ecological status': w.eco, 'Chemical status': w.chem }, staff('DS-VAR-001', 'Public'), { _l: M.wbLayers[w.id] })),
      'Monitoring sites': W.SITES.map(s => Object.assign({ Identifier: s.id, Name: s.name, 'Water body': s.wb }, staff('DS-VAR-003', 'Public'), { _ll: s.ll })),
      'Pressures': W.PRESSURES.map(p => Object.assign({ Identifier: p.id, Name: p.name, Type: p.type }, staff('DS-VAR-006', 'Internal'), { _ll: p.ll })),
      'Programme of Measures': W.MEASURES.map(m => Object.assign({ Identifier: m.id, Name: m.name, 'Key type of measure': m.ktm }, staff('DS-VAR-009', 'Internal'), { _ll: m.ll })) };
    const accBadge = v => `<span class="badge ${v === 'Public' ? 'badge-good' : 'badge-inactive'}">${v}</span>`;
    drawer.innerHTML = `<div class="map-drawer-h"><b><i class="fas fa-table"></i> Attribute table</b>
      <select id="at-layer" class="filter-select" aria-label="Layer">${Object.keys(LAY).map(k => `<option>${k}</option>`).join('')}</select>
      <div class="search-wrap" style="flex:0 1 240px;"><i class="fas fa-search"></i><input id="at-q" class="search-input" style="width:100%;min-width:0;" placeholder="Filter rows"></div>
      <span class="tool-sub" id="at-n"></span>
      <span style="margin-left:auto;display:flex;gap:6px;"><button class="btn btn-secondary btn-sm" id="at-csv"><i class="fas fa-file-csv"></i>Export CSV</button><button class="btn btn-secondary btn-sm" id="at-x" aria-label="Close attribute table"><i class="fas fa-times"></i></button></span></div>
      <div class="map-drawer-b"><table class="data-table"><thead id="at-h"></thead><tbody id="at-b"></tbody></table></div>`;
    stage.appendChild(drawer);
    const $ = id => drawer.querySelector('#' + id);
    let rows = [];
    function render() {
      const data = LAY[$('at-layer').value], cols = Object.keys(data[0] || {}).filter(c => c[0] !== '_'), t = $('at-q').value.trim().toLowerCase();
      rows = data.filter(r => !t || cols.some(c => String(r[c]).toLowerCase().includes(t)));
      $('at-h').innerHTML = '<tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>';
      $('at-b').innerHTML = rows.map((r, i) => '<tr data-i="' + i + '" tabindex="0">' + cols.map(c => `<td>${c === 'Identifier' || c === 'Dataset' ? `<span class="id-pill">${r[c]}</span>` : c === 'Access' ? accBadge(r[c]) : r[c]}</td>`).join('') + '</tr>').join('');
      $('at-n').textContent = `${rows.length} of ${data.length} rows`;
      $('at-b').querySelectorAll('tr').forEach(tr => tr.onclick = tr.onkeydown = e => {
        if (e.type === 'keydown' && e.key !== 'Enter') return;
        const r = rows[+tr.dataset.i];
        if (r._l) { map.fitBounds(r._l.getBounds(), { padding: [60, 60], maxZoom: 13 }); r._l.fire('click'); }
        else { map.setView(r._ll, 13); const f = features().find(f => f.l.getLatLng && f.l.getLatLng().distanceTo(L.latLng(r._ll)) < 1); f && f.l.fire('click'); }
      });
    }
    $('at-layer').onchange = render; $('at-q').oninput = render; $('at-x').onclick = () => toggleTable(false);
    $('at-csv').onclick = () => {
      const data = LAY[$('at-layer').value], cols = Object.keys(data[0] || {}).filter(c => c[0] !== '_');
      const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => `"${String(r[c]).replace(/"/g, '""')}"`).join(','))).join('\r\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
      a.download = `NWIS_${internal ? 'internal_' : ''}${W.RBD.id}_${$('at-layer').value.replace(/\W+/g, '_')}.csv`; document.body.appendChild(a); a.click(); a.remove();
      toast('CSV exported: ' + rows.length + ' rows (placeholder data)');
    };
    render(); setTimeout(() => map.invalidateSize(), 50);
  }

  /* ───────── print, settings ───────── */
  function print() {
    let t = document.querySelector('.map-print-title');
    if (!t) { t = document.createElement('div'); t.className = 'map-print-title'; stage.parentNode.insertBefore(t, stage); }
    t.innerHTML = `<b>NWIS · ${internal ? 'Internal map viewer · ' : 'Map of the '}${W.RBD.full}</b><span>${internal ? 'For official use · ' : ''}${W.cycle.label} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · ${status.querySelector('#ms-scale').textContent} · placeholder data</span>`;
    setTimeout(() => window.print(), 50);
  }
  function settingsPanel() {
    M.showInfo(panel('Settings', 'fa-cog', `<div class="form-label">Coordinate format</div>
      <label class="layer-item"><input type="radio" name="st-c" value="dec" ${settings.coord === 'dec' ? 'checked' : ''}> Decimal degrees (41.71500°)</label>
      <label class="layer-item"><input type="radio" name="st-c" value="dms" ${settings.coord === 'dms' ? 'checked' : ''}> Degrees, minutes, seconds (41° 42′ 54″)</label>
      <div class="form-label" style="margin-top:10px;">Cursor</div>
      <label class="layer-item"><input type="checkbox" id="st-h" ${settings.hoverCoords ? 'checked' : ''}> Show coordinates under the cursor</label>`));
    info.querySelectorAll('[name="st-c"]').forEach(r => r.onchange = () => { settings.coord = r.value; status.querySelector('#ms-xy').textContent = fmtLL(map.getCenter()); });
    info.querySelector('#st-h').onchange = e => { settings.hoverCoords = e.target.checked; if (!settings.hoverCoords) status.querySelector('#ms-xy').textContent = 'Cursor coordinates off'; };
  }
  /* ───────── panel helper and click wiring ───────── */
  function panel(title, icon, body) { return `<div class="tool-head"><i class="fas ${icon}"></i>${title}</div>${body}`; }
  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-t]'); if (!b || b.disabled) return;
    const k = b.dataset.t;
    if (KIND[k] === 1) { setMode(k); return; }
    ({
      home: () => map.fitBounds(M.fullBounds(), { padding: [30, 30], maxZoom: 11 }),
      zsel: () => selected ? map.fitBounds(boundsOf(selected), { padding: [60, 60], maxZoom: 13 }) : hint('Select a feature first: click it on the map'),
      prev: () => go(-1), next: () => go(1),
      ov: () => toggleOverview(!ov),
      grat: () => { gratOn = !gratOn; pressed('grat', gratOn); gratOn ? gratLayer.addTo(map) : map.removeLayer(gratLayer); drawGrat(); },
      search: searchPanel,
      clearsel: () => { highlight(null); selLayer.clearLayers(); found = []; map.closePopup(); M.showInfo(idle); },
      clearmeas: () => { measLayer.clearLayers(); stopDrawing(); },
      table: () => toggleTable(!drawer),
      print, set: settingsPanel
    }[k] || (() => {}))();
  });
  navState();
  setMode('identify');
  return { setMode };
};
