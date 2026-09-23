/** Import graph. Every relative named import must have a matching export. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const parkDir = path.dirname(here);

function row(name, status, detail) {
  return { area: 'boot', name, status, detail: detail || '' };
}

function namedExports(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:const|let|class)\s+(\w+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const bit = part.trim();
      if (!bit || bit.startsWith('type ')) continue;
      const alias = bit.split(/\s+as\s+/);
      names.add((alias[1] || alias[0]).trim());
    }
  }
  return names;
}

function namedImports(src) {
  const found = [];
  const re = /import\s*\{([^}]+)\}\s*from\s*['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    for (const part of m[1].split(',')) {
      const bit = part.trim();
      if (!bit) continue;
      const alias = bit.split(/\s+as\s+/);
      found.push({ imported: alias[0].trim(), spec: m[2] });
    }
  }
  return found;
}

function resolveSpec(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  return base.endsWith('.js') ? base : base + '.js';
}

function walkJs(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'backup-version' || name === 'node_modules') continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkJs(full, out);
    else if (name.endsWith('.js')) out.push(full);
  }
}

export function bootRows() {
  const rows = [];
  const files = [];
  walkJs(path.join(parkDir, 'rides'), files);
  walkJs(path.join(parkDir, 'logic'), files);
  walkJs(path.join(parkDir, 'qc'), files);
  for (const extra of ['park-kit.js', 'gate-icon.js', 'land-beds.js', 'halloween/haunt-scene.js']) {
    const full = path.join(parkDir, extra);
    if (fs.existsSync(full)) files.push(full);
  }
  const missing = [];
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    for (const item of namedImports(src)) {
      const target = resolveSpec(file, item.spec);
      if (!fs.existsSync(target)) {
        missing.push(path.basename(file) + ' -> missing ' + item.spec);
        continue;
      }
      const exports = namedExports(fs.readFileSync(target, 'utf8'));
      if (!exports.has(item.imported)) {
        missing.push(path.basename(file) + ' imports ' + item.imported + ' from ' + path.basename(target));
      }
    }
  }
  rows.push(row(
    'named import matches named export',
    missing.length ? 'FAIL' : 'PASS',
    missing.length ? missing.slice(0, 6).join('; ') : files.length + ' files',
  ));

  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const dry = index.includes('window.__PARK_DRY=true');
  const hook = index.includes('window.__tickRides') && index.includes('window.__applyRideCam');
  const seed = index.includes("from './rides/seed-rides.js'") || index.includes('from "./rides/seed-rides.js"');
  rows.push(row('index boots seed and ride hook', dry && hook && seed ? 'PASS' : 'FAIL', 'dry ' + dry + ' hook ' + hook + ' seed ' + seed));

  const haunt = fs.readFileSync(path.join(parkDir, 'rides/haunt-boot.js'), 'utf8');
  const staticTick = /import\s*\{[^}]*\btickMotion\b[^}]*\}\s*from/.test(haunt);
  const scene = fs.readFileSync(path.join(parkDir, 'halloween/haunt-scene.js'), 'utf8');
  const hauntExport = /export\s+function\s+mountHaunt/.test(scene) || /export\s+function\s+addHauntScene/.test(scene);
  rows.push(row(
    'haunt-boot does not static-import a missing tick',
    !staticTick && hauntExport ? 'PASS' : 'FAIL',
    staticTick ? 'static tickMotion import' : 'dynamic mountHaunt',
  ));

  const cameras = index.includes('Walk') && index.includes('3rd') && index.includes('Drone');
  rows.push(row('Walk 3rd Drone remain in index', cameras ? 'PASS' : 'FAIL', ''));
  return rows;
}
