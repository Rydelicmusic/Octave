/** Blueprint draw layer. Wire: import { mountDraw } from './draw.js'; mountDraw({ svg, toX, toY, CX, CY }); */

const LAT0 = 29.973;
const LNG0 = -95.694;
const M_LAT = 111320;
const M_LNG = 111320 * Math.cos((LAT0 * Math.PI) / 180);

function cellOf(x, z) {
  return `G${Math.floor(x / 25)},${Math.floor(z / 25)}`;
}
function geoOf(x, z) {
  return { lat: LAT0 - z / M_LAT, lng: LNG0 + x / M_LNG };
}
function uid() {
  return 's' + Math.random().toString(36).slice(2, 8);
}

export function mountDraw({ svg, toX, toY, CX, CY }) {
  if (!svg || document.getElementById('rydelic-draw')) return;

  const fromX = (sx) => sx - CX;
  const fromZ = (sy) => sy - CY;

  const state = {
    on: false,
    tool: 'building',
    sku: 'building',
    note: '',
    shapes: [],
    draft: null,
  };

  const bar = document.createElement('div');
  bar.id = 'rydelic-draw';
  bar.innerHTML = `
    <button data-act="toggle">Draw</button>
    <select data-act="tool">
      <option value="building">Building</option>
      <option value="path">Path</option>
      <option value="free">Freehand</option>
    </select>
    <select data-act="sku">
      <option value="kiosk">kiosk (song)</option>
      <option value="pavilion">pavilion (EP)</option>
      <option value="building" selected>building (album)</option>
    </select>
    <input data-act="note" placeholder="name / note" />
    <button data-act="undo">Undo</button>
    <button data-act="clear">Clear</button>
    <button data-act="save">Save JSON</button>
    <button data-act="brief">Copy Build brief</button>
    <span data-act="stat">off</span>
  `;
  Object.assign(bar.style, {
    position: 'fixed', top: '8px', right: '8px', zIndex: '50',
    display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center',
    padding: '8px 10px', borderRadius: '14px',
    background: 'rgba(18,16,14,0.55)', border: '1px solid rgba(255,255,255,0.22)',
    backdropFilter: 'blur(14px)', webkitBackdropFilter: 'blur(14px)',
    color: '#f4efe6', font: '12px/1.2 ui-sans-serif,system-ui,sans-serif',
  });
  bar.querySelectorAll('button,select,input,span').forEach((n) => {
    n.style.font = 'inherit';
    n.style.color = '#f4efe6';
    n.style.background = 'rgba(0,0,0,0.25)';
    n.style.border = '1px solid rgba(255,255,255,0.18)';
    n.style.borderRadius = '8px';
    n.style.padding = '4px 8px';
  });
  document.body.appendChild(bar);

  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  layer.setAttribute('id', 'sketch-layer');
  svg.appendChild(layer);

  const stat = bar.querySelector('[data-act="stat"]');

  function payload() {
    return {
      crs: 'park/CRS.md',
      kind: 'sketch',
      updated: new Date().toISOString(),
      shapes: state.shapes.map((s) => {
        const g = geoOf(s.x, s.z);
        return { ...s, cell: cellOf(s.x, s.z), lat: +g.lat.toFixed(6), lng: +g.lng.toFixed(6) };
      }),
    };
  }

  function briefText() {
    const p = payload();
    const lines = p.shapes.map((s) => {
      if (s.type === 'building') {
        return `- ${s.sku} "${s.note || s.id}" at ${s.cell} / x ${s.x.toFixed(1)} z ${s.z.toFixed(1)} / ${s.w.toFixed(1)} × ${s.d.toFixed(1)} m`;
      }
      if (s.type === 'path' || s.type === 'free') {
        const n = (s.pts || []).length;
        return `- ${s.type} "${s.note || s.id}" ${n} pts, start ${s.cell} / x ${s.x.toFixed(1)} z ${s.z.toFixed(1)}`;
      }
      return `- ${s.type} ${s.id}`;
    });
    return [
      'Read park/SKETCH.md and park/sketches/latest.json.',
      'You are Grok Build. Chat is not the worker.',
      'LOCKED: LAYOUT.md XZ. No water. No hotel. No lock.js rewrite.',
      'GOAL: turn EACH sketch shape into ONE 3D massing / path at the exact meters.',
      'CHANGES only — park/sketch-mass.js + one wire in index.html.',
      '',
      'SHAPES:',
      ...(lines.length ? lines : ['(empty sketch)']),
      '',
      'SHIP GATES: hub still 0,0; spine 14 m; footprints unmoved.',
    ].join('\n');
  }

  function paint() {
    layer.replaceChildren();
    for (const s of state.shapes) {
      if (s.type === 'building') {
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('x', toX(s.x - s.w / 2));
        r.setAttribute('y', toY(s.z - s.d / 2));
        r.setAttribute('width', s.w);
        r.setAttribute('height', s.d);
        r.setAttribute('fill', s.sku === 'kiosk' ? '#c9b48acc' : s.sku === 'pavilion' ? '#b08960cc' : '#8a5a3acc');
        r.setAttribute('stroke', '#3d3428');
        r.setAttribute('stroke-width', '1.4');
        layer.appendChild(r);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', toX(s.x));
        t.setAttribute('y', toY(s.z) + 4);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '10');
        t.setAttribute('fill', '#1a1610');
        t.textContent = `${s.note || s.sku} ${cellOf(s.x, s.z)}`;
        layer.appendChild(t);
      } else if (s.pts && s.pts.length) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = s.pts.map((p, i) => `${i ? 'L' : 'M'} ${toX(p[0])} ${toY(p[1])}`).join(' ');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#8a4030');
        path.setAttribute('stroke-width', '2.4');
        layer.appendChild(path);
      }
    }
    if (state.draft?.pts?.length) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = state.draft.pts.map((p, i) => `${i ? 'L' : 'M'} ${toX(p[0])} ${toY(p[1])}`).join(' ');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#b33');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-dasharray', '4 3');
      layer.appendChild(path);
    }
    stat.textContent = state.on ? `${state.shapes.length} shapes` : 'off';
  }

  function svgPoint(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: fromX(p.x), z: fromZ(p.y) };
  }

  svg.addEventListener('pointerdown', (e) => {
    if (!state.on) return;
    const p = svgPoint(e);
    if (state.tool === 'building') {
      state.draft = { type: 'building', x0: p.x, z0: p.z, x: p.x, z: p.z, w: 1, d: 1 };
    } else if (state.tool === 'path') {
      if (!state.draft) state.draft = { type: 'path', pts: [[p.x, p.z]] };
      else state.draft.pts.push([p.x, p.z]);
      paint();
    } else {
      state.draft = { type: 'free', pts: [[p.x, p.z]] };
    }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!state.on || !state.draft) return;
    const p = svgPoint(e);
    if (state.draft.type === 'building') {
      const x0 = state.draft.x0, z0 = state.draft.z0;
      state.draft.w = Math.max(2, Math.abs(p.x - x0));
      state.draft.d = Math.max(2, Math.abs(p.z - z0));
      state.draft.x = (p.x + x0) / 2;
      state.draft.z = (p.z + z0) / 2;
    } else if (state.draft.type === 'free') {
      state.draft.pts.push([p.x, p.z]);
    }
    paint();
  });
  svg.addEventListener('pointerup', () => {
    if (!state.on || !state.draft) return;
    if (state.draft.type === 'building') {
      state.shapes.push({
        id: uid(), type: 'building', sku: state.sku, note: state.note,
        x: state.draft.x, z: state.draft.z, w: state.draft.w, d: state.draft.d, yaw: 0,
      });
      state.draft = null;
      paint();
    } else if (state.draft.type === 'free') {
      const pts = state.draft.pts;
      state.shapes.push({
        id: uid(), type: 'free', sku: state.sku, note: state.note,
        pts, x: pts[0][0], z: pts[0][1], w: 0, d: 0,
      });
      state.draft = null;
      paint();
    }
  });
  svg.addEventListener('dblclick', () => {
    if (!state.on || state.tool !== 'path' || !state.draft) return;
    const pts = state.draft.pts;
    state.shapes.push({
      id: uid(), type: 'path', sku: state.sku, note: state.note,
      pts, x: pts[0][0], z: pts[0][1], w: 0, d: 0,
    });
    state.draft = null;
    paint();
  });

  bar.addEventListener('click', (e) => {
    const act = e.target?.dataset?.act;
    if (act === 'toggle') {
      state.on = !state.on;
      e.target.textContent = state.on ? 'Draw ON' : 'Draw';
      svg.style.cursor = state.on ? 'crosshair' : '';
    }
    if (act === 'undo') { state.shapes.pop(); state.draft = null; }
    if (act === 'clear') { state.shapes = []; state.draft = null; }
    if (act === 'save') {
      const blob = new Blob([JSON.stringify(payload(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'latest.json';
      a.click();
    }
    if (act === 'brief') {
      navigator.clipboard.writeText(briefText()).catch(() => {});
      stat.textContent = 'brief copied';
      return;
    }
    paint();
  });
  bar.querySelector('[data-act="tool"]').addEventListener('change', (e) => { state.tool = e.target.value; });
  bar.querySelector('[data-act="sku"]').addEventListener('change', (e) => { state.sku = e.target.value; });
  bar.querySelector('[data-act="note"]').addEventListener('input', (e) => { state.note = e.target.value; });

  paint();
  return state;
}
