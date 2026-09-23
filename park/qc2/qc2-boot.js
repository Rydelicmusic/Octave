/** Boot and export audit for the terrain / water / NPC stack. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const parkDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

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
      if (!bit) continue;
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
      found.push({ imported: bit.split(/\s+as\s+/)[0].trim(), spec: m[2] });
    }
  }
  return found;
}

function walkJs(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'backup-version' || name === 'node_modules') continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walkJs(full, out);
    else if (name.endsWith('.js')) out.push(full);
  }
}

export function bootRows() {
  const rows = [];
  const files = [];
  for (const dir of ['rides', 'logic', 'qc', 'qc2', 'terrain', 'water', 'npc', 'alive']) {
    walkJs(path.join(parkDir, dir), files);
  }
  const missing = [];
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    for (const item of namedImports(src)) {
      const base = path.resolve(path.dirname(file), item.spec);
      const target = base.endsWith('.js') ? base : base + '.js';
      if (!fs.existsSync(target)) {
        missing.push(path.basename(file) + ' missing ' + item.spec);
        continue;
      }
      if (!namedExports(fs.readFileSync(target, 'utf8')).has(item.imported)) {
        missing.push(path.basename(file) + ' imports ' + item.imported + ' from ' + path.basename(target));
      }
    }
  }
  rows.push(row('named import matches export', missing.length ? 'FAIL' : 'PASS', missing.length ? missing.slice(0, 5).join('; ') : files.length + ' files'));

  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const cameras = index.includes('Walk') && index.includes('3rd') && index.includes('Drone');
  rows.push(row('Walk 3rd Drone remain', cameras ? 'PASS' : 'FAIL', ''));
  const scene = index.includes('new THREE.Scene') || index.includes('THREE.Scene');
  const canvas = index.includes('canvas') && index.includes('renderer');
  rows.push(row('index still builds a scene', scene && canvas ? 'PASS' : 'FAIL', ''));
  const hook = index.includes('window.__tickRides') && index.includes('seed-rides');
  rows.push(row('ride hook and seed still wired', hook ? 'PASS' : 'FAIL', ''));
  return rows;
}
