/** Phone Walk. The existing pad is the stick. Coarse pointers also get BOARD and EXIT. */
import { resumeScore } from '../audio/ride-score.js';

export function wantsPhone(env) {
  if (!env) return false;
  if (env.coarse || env.pointer === 'coarse') return true;
  return (env.width || 1200) <= 820;
}

export function phoneLayout(env) {
  const on = wantsPhone(env);
  return {
    stick: on,
    look: on,
    board: on,
    exit: on,
    stickId: 'pad',
    lookTarget: 'canvas',
    boardId: 'phone-board',
    exitId: 'phone-exit',
  };
}

export function iosGuards() {
  return { touchAction: 'none', height: '100dvh', overscroll: 'none' };
}

/** Cheap mode shortens the crowd and the ripple. The hero, the score, and boarding stay. */
export function cheapPolicy(reason) {
  return { npcs: 16, water: 'flat', coaster: true, score: true, board: true, reason: reason || 'phone' };
}

export function detectPhone(doc) {
  const view = doc && doc.defaultView;
  const width = view && view.innerWidth ? view.innerWidth : 1280;
  let coarse = false;
  if (view && typeof view.matchMedia === 'function') coarse = !!view.matchMedia('(pointer: coarse)').matches;
  return { coarse, width };
}

function applyIos(doc) {
  const guards = iosGuards();
  const html = doc && doc.documentElement;
  const body = doc && doc.body;
  if (html && html.style) {
    html.style.height = guards.height;
    html.style.touchAction = guards.touchAction;
  }
  if (body && body.style) {
    body.style.height = guards.height;
    body.style.touchAction = guards.touchAction;
    body.style.overscrollBehavior = guards.overscroll;
  }
}

function ensureButtons(doc) {
  if (!doc || !doc.body || doc.getElementById('phone-board')) return;
  const bar = doc.createElement('div');
  bar.id = 'phone-actions';
  bar.style.cssText = 'position:fixed;left:12px;top:132px;z-index:5;display:flex;gap:8px;touch-action:none';
  const board = doc.createElement('button');
  board.id = 'phone-board';
  board.type = 'button';
  board.textContent = 'BOARD';
  board.style.cssText = 'appearance:none;border:1px solid rgba(201,180,138,.55);background:rgba(90,40,24,.88);color:#f4efe6;padding:12px 16px;border-radius:999px;font:12px sans-serif;letter-spacing:.14em';
  board.addEventListener('click', () => {
    resumeScore();
    if (typeof window !== 'undefined' && window.__octaveBoard) window.__octaveBoard();
  });
  const exit = doc.createElement('button');
  exit.id = 'phone-exit';
  exit.type = 'button';
  exit.textContent = 'EXIT';
  exit.style.cssText = 'appearance:none;border:1px solid rgba(201,180,138,.55);background:rgba(40,32,24,.88);color:#f4efe6;padding:12px 16px;border-radius:999px;font:12px sans-serif;letter-spacing:.14em';
  exit.addEventListener('click', () => {
    if (typeof window !== 'undefined' && window.__octaveExit) window.__octaveExit();
  });
  bar.appendChild(board);
  bar.appendChild(exit);
  doc.body.appendChild(bar);
}

export function mountMobile(doc, env) {
  const layout = phoneLayout(env || detectPhone(doc));
  if (doc) applyIos(doc);
  if (!layout.stick || !doc) return layout;
  const pad = doc.getElementById('pad');
  if (pad) pad.dataset.phoneStick = '1';
  ensureButtons(doc);
  return layout;
}

export function watchPerformance(onCheap, nowFn) {
  if (typeof requestAnimationFrame !== 'function' || typeof onCheap !== 'function') return;
  const now = nowFn || ((t) => t);
  let last = 0;
  let slow = 0;
  let fired = false;
  const frame = (t) => {
    const stamp = now(t);
    if (last) {
      const fps = 1000 / Math.max(1, stamp - last);
      slow = fps < 30 ? slow + 1 : 0;
      if (!fired && slow >= 20) {
        fired = true;
        onCheap(cheapPolicy('fps'));
      }
    }
    last = stamp;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
