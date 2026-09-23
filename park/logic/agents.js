/** Ambient guests. They stay in the land plazas. They do not use the spine as a street. */
import { occupiesSpine, inStadium } from '../lock.js';

export const AGENT_CAP = 28;

const LOOPS = [
  [{ x: -150, z: 30 }, { x: -132, z: 8 }, { x: -158, z: -18 }, { x: -174, z: 16 }],
  [{ x: 148, z: 42 }, { x: 176, z: 22 }, { x: 168, z: 52 }, { x: 142, z: 28 }],
  [{ x: -72, z: -150 }, { x: -48, z: -162 }, { x: -40, z: -138 }, { x: -84, z: -156 }],
  [{ x: 72, z: 148 }, { x: 88, z: 156 }, { x: 102, z: 132 }, { x: 78, z: 138 }],
];

const agents = [];

export function resetAgents() {
  agents.length = 0;
}

export function bootAgents(n = AGENT_CAP) {
  agents.length = 0;
  const count = Math.max(0, Math.min(AGENT_CAP, n));
  for (let i = 0; i < count; i++) {
    const loop = LOOPS[i % LOOPS.length];
    const p = loop[i % loop.length];
    agents.push({
      id: 'agent-' + i,
      x: p.x,
      z: p.z,
      loop,
      leg: (i + 1) % loop.length,
      mode: 'walk',
      ride: null,
      yaw: 0,
    });
  }
  return agents;
}

export function agentList() {
  return agents;
}

export function stepAgents(dt) {
  const speed = 1.35;
  const stepDt = Math.max(0, Math.min(0.12, dt || 0));
  for (const agent of agents) {
    if (agent.mode !== 'walk') continue;
    const target = agent.loop[agent.leg];
    const dx = target.x - agent.x;
    const dz = target.z - agent.z;
    const dist = Math.hypot(dx, dz) || 1;
    const step = Math.min(dist, speed * stepDt);
    const nx = agent.x + (dx / dist) * step;
    const nz = agent.z + (dz / dist) * step;
    if (!Number.isFinite(nx) || !Number.isFinite(nz) || occupiesSpine(nx, nz, 0.45) || !inStadium(nx, nz)) {
      agent.leg = (agent.leg + 1) % agent.loop.length;
      continue;
    }
    agent.x = nx;
    agent.z = nz;
    agent.yaw = Math.atan2(dx, dz);
    if (dist < 0.7) agent.leg = (agent.leg + 1) % agent.loop.length;
  }
  return agents;
}

export function spineHits() {
  let hits = 0;
  for (const agent of agents) {
    if (occupiesSpine(agent.x, agent.z, 0.45)) hits += 1;
  }
  return hits;
}
