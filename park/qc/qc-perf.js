/** Agent cap and a 60 s soak. Headless, so mesh totals are not faked. */
import { AGENT_CAP, bootAgents, stepAgents, agentList, resetAgents, spineHits } from '../logic/agents.js';
import { getClock, setDayScale, resetClock, stepClock } from '../logic/clock.js';
import { allPaths } from '../rides/coaster-paths.js';

function row(name, status, detail) {
  return { area: 'perf', name, status, detail: detail || '' };
}

export function perfRows() {
  const rows = [];
  resetAgents();
  const crowd = bootAgents(80);
  rows.push(row('agent cap', crowd.length === AGENT_CAP && AGENT_CAP <= 40 && AGENT_CAP >= 20 ? 'PASS' : 'FAIL', 'cap ' + AGENT_CAP + ' booted ' + crowd.length));

  const t0 = Date.now();
  let nan = false;
  resetClock();
  setDayScale(1);
  for (let t = 0; t < 60; t += 0.1) {
    stepAgents(0.1);
    stepClock(0.1);
    for (const agent of agentList()) {
      if (!Number.isFinite(agent.x) || !Number.isFinite(agent.z)) nan = true;
    }
    if (!Number.isFinite(getClock().minutes)) nan = true;
  }
  const ms = Date.now() - t0;
  rows.push(row('60 s soak has no NaN', !nan && spineHits() === 0 ? 'PASS' : 'FAIL', 'ms ' + ms + ' hits ' + spineHits()));
  rows.push(row('soak stays interactive', ms < 3000 ? 'PASS' : 'FAIL', ms + ' ms for 60 s sim'));

  let samples = 0;
  for (const pack of allPaths()) samples += pack.samples.length;
  rows.push(row('path sample budget', samples > 0 && samples < 12000 ? 'PASS' : 'FAIL', 'samples ' + samples));
  rows.push(row('live mesh count', 'SKIP', 'headless run does not mount THREE; live check is the browser'));
  resetClock();
  resetAgents();
  return rows;
}
