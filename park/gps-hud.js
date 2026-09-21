/** Glass GPS HUD — top right. Wire from index.html: import { mountGpsHud } from './gps-hud.js'; mountGpsHud(() => player);
 *  CRS: park/CRS.md
 */
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

export function mountGpsHud(getPos) {
  if (document.getElementById('rydelic-gps')) return;
  const el = document.createElement('div');
  el.id = 'rydelic-gps';
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
    'letter-spacing:0.02em', 'pointer-events:none',
  ].join(';');
  el.innerHTML = `<div style="opacity:.62;font-size:10px;text-transform:uppercase;letter-spacing:.14em">Location</div>
<div id="rydelic-gps-cell" style="font-size:15px;font-weight:600;margin-top:2px">G0,0</div>
<div id="rydelic-gps-m" style="opacity:.88">x 0.0  z 0.0  y 0.0</div>
<div id="rydelic-gps-ll" style="opacity:.72;font-variant-numeric:tabular-nums">29.973000, -95.694000</div>`;
  document.body.appendChild(el);
  const cell = el.querySelector('#rydelic-gps-cell');
  const m = el.querySelector('#rydelic-gps-m');
  const ll = el.querySelector('#rydelic-gps-ll');
  function tick() {
    const p = typeof getPos === 'function' ? getPos() : getPos;
    const x = p?.x ?? p?.position?.x ?? 0;
    const y = p?.y ?? p?.position?.y ?? 0;
    const z = p?.z ?? p?.position?.z ?? 0;
    const g = parkToGeo(x, z);
    cell.textContent = g.cell;
    m.textContent = `x ${x.toFixed(1)}  z ${z.toFixed(1)}  y ${y.toFixed(1)}`;
    ll.textContent = `${g.lat.toFixed(6)}, ${g.lng.toFixed(6)}`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return el;
}
