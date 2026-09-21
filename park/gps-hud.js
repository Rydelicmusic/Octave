/** Glass GPS HUD — live cell / meters / lat-lng. CRS: park/CRS.md */
const LAT0 = 29.973;
const LNG0 = -95.694;
const M_LAT = 111320;
const M_LNG = 111320 * Math.cos((LAT0 * Math.PI) / 180);

export function parkToGeo(x, z) {
  return {
    lat: LAT0 - z / M_LAT,
    lng: LNG0 + x / M_LNG,
    cell: `G${Math.floor(x / 25)},${Math.floor(z / 25)}`,
  };
}

function readVec(p) {
  if (!p) return { x: 0, y: 0, z: 0 };
  if (typeof p.x === 'number') return { x: p.x, y: p.y ?? 0, z: p.z ?? 0 };
  const q = p.position || {};
  return { x: q.x ?? 0, y: q.y ?? 0, z: q.z ?? 0 };
}

export function mountGpsHud(getPos) {
  let existing = document.getElementById('rydelic-gps');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'rydelic-gps';
  el.title = 'click to copy cell + meters + lat/lng';
  el.style.cssText = [
    'position:fixed', 'top:14px', 'right:14px', 'z-index:40',
    'min-width:196px', 'padding:10px 12px',
    'border-radius:16px',
    'background:rgba(18,16,14,0.38)',
    'border:1px solid rgba(255,255,255,0.22)',
    'box-shadow:0 8px 32px rgba(0,0,0,0.28)',
    'backdrop-filter:blur(16px) saturate(1.2)',
    '-webkit-backdrop-filter:blur(16px) saturate(1.2)',
    'color:#f4efe6', 'font:12px/1.35 ui-sans-serif,system-ui,sans-serif',
    'letter-spacing:0.02em', 'pointer-events:auto', 'cursor:pointer',
  ].join(';');
  el.innerHTML = `<div style="opacity:.62;font-size:10px;text-transform:uppercase;letter-spacing:.14em">Location</div>
<div id="rydelic-gps-cell" style="font-size:15px;font-weight:600;margin-top:2px">G0,0</div>
<div id="rydelic-gps-m" style="opacity:.88">x 0.0  z 0.0  y 0.0</div>
<div id="rydelic-gps-ll" style="opacity:.72;font-variant-numeric:tabular-nums">29.973000, -95.694000</div>`;
  document.body.appendChild(el);
  const cell = el.querySelector('#rydelic-gps-cell');
  const m = el.querySelector('#rydelic-gps-m');
  const ll = el.querySelector('#rydelic-gps-ll');
  let last = { x: 0, y: 0, z: 0, cell: 'G0,0', lat: LAT0, lng: LNG0 };
  function tick() {
    const fn = window.__parkGpsGet || getPos;
    const p = readVec(typeof fn === 'function' ? fn() : fn);
    const g = parkToGeo(p.x, p.z);
    last = { ...p, ...g };
    cell.textContent = g.cell;
    m.textContent = `x ${p.x.toFixed(1)}  z ${p.z.toFixed(1)}  y ${p.y.toFixed(1)}`;
    ll.textContent = `${g.lat.toFixed(6)}, ${g.lng.toFixed(6)}`;
    requestAnimationFrame(tick);
  }
  el.addEventListener('click', () => {
    const t = `${last.cell} / x ${last.x.toFixed(1)} z ${last.z.toFixed(1)} y ${last.y.toFixed(1)} / ${last.lat.toFixed(6)}, ${last.lng.toFixed(6)}`;
    navigator.clipboard.writeText(t).catch(() => {});
  });
  requestAnimationFrame(tick);
  return el;
}
