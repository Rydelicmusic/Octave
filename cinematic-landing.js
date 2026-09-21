/* Octave cinematic landing overlay.
   Skin only. Does not touch park/LAYOUT.md or park/index.html. */
(function () {
  if (window.__OCTAVE_CINE__) return;
  window.__OCTAVE_CINE__ = true;

  const css = `
  .cine-letter{position:fixed;left:0;right:0;height:18px;z-index:50;pointer-events:none;
    background:linear-gradient(#050403,#05040300);opacity:.55}
  .cine-letter.top{top:0}
  .cine-letter.bot{bottom:0;height:22px;background:linear-gradient(#05040300,#050403)}
  .cine-hair{position:fixed;top:0;left:50%;width:0;height:1px;z-index:51;pointer-events:none;
    background:linear-gradient(90deg,transparent,rgba(201,180,138,.85),transparent);
    transform:translateX(-50%);animation:cineHair 1.8s var(--ease,cubic-bezier(.2,.7,.2,1)) forwards}
  @keyframes cineHair{to{width:min(420px,46vw)}}
  .cine-veil{position:fixed;inset:0;z-index:35;pointer-events:none;
    background:radial-gradient(ellipse at 50% 38%,transparent 18%,rgba(8,7,6,.55) 100%);
    opacity:1;animation:cineVeil 2.4s ease forwards}
  @keyframes cineVeil{to{opacity:.72}}
  .cine-follow{position:fixed;width:42vw;height:42vw;max-width:540px;max-height:540px;
    border-radius:50%;pointer-events:none;z-index:1;mix-blend-mode:screen;
    background:radial-gradient(circle,rgba(201,180,138,.14),transparent 68%);
    transform:translate(-50%,-50%);opacity:.55}
  .cine-lands{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);
    z-index:45;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;
    width:min(720px,calc(100% - 28px));pointer-events:auto}
  .cine-chip{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    font-size:10px;letter-spacing:.22em;text-transform:uppercase;
    color:#ead9b2;padding:8px 12px;border-radius:999px;
    background:rgba(18,16,14,.45);border:1px solid rgba(201,180,138,.28);
    backdrop-filter:blur(16px) saturate(160%);
    -webkit-backdrop-filter:blur(16px) saturate(160%);
    transition:transform .35s ease,border-color .35s ease,background .35s ease}
  .cine-chip:hover{transform:translateY(-2px);border-color:rgba(234,217,178,.7);background:rgba(18,16,14,.7)}
  .cine-chip b{font-weight:600;letter-spacing:.18em}
  .cine-chip span{display:block;opacity:.55;letter-spacing:.16em;font-size:8px;margin-top:2px}
  body.cine-on .bg{animation:cineDrift 48s ease-in-out infinite alternate;filter:saturate(1.08) contrast(1.06)}
  @keyframes cineDrift{from{transform:scale(1.05) translate3d(0,0,0)}to{transform:scale(1.12) translate3d(-1.4%,.8%,0)}}
  body.cine-on .grain{opacity:.16}
  body.cine-on .stage-inner{animation:cineRise 1.15s cubic-bezier(.2,.7,.2,1) both}
  @keyframes cineRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){
    .cine-hair,.cine-veil,body.cine-on .bg,body.cine-on .stage-inner{animation:none}
    .cine-follow{display:none}
  }
  @media (max-width:640px){
    .cine-lands{bottom:14px;gap:6px}
    .cine-chip{padding:7px 10px;font-size:9px}
    .cine-letter{height:10px}
  }
  `;

  const style = document.createElement("style");
  style.id = "octave-cine";
  style.textContent = css;
  document.head.appendChild(style);
  document.body.classList.add("cine-on");

  const wrap = document.createElement("div");
  wrap.id = "cineSkin";
  wrap.innerHTML = `
    <div class="cine-letter top" aria-hidden="true"></div>
    <div class="cine-letter bot" aria-hidden="true"></div>
    <div class="cine-hair" aria-hidden="true"></div>
    <div class="cine-veil" aria-hidden="true"></div>
    <div class="cine-follow" id="cineFollow" aria-hidden="true"></div>
    <nav class="cine-lands" aria-label="Park lands">
      <a class="cine-chip" href="park/"><b>The Block</b><span>−X · origin</span></a>
      <a class="cine-chip" href="park/"><b>After Hours</b><span>−Z · late</span></a>
      <a class="cine-chip" href="park/"><b>The Board</b><span>+X · deal</span></a>
      <a class="cine-chip" href="park/"><b>The Pocket</b><span>+Z · gate</span></a>
    </nav>
  `;
  document.body.appendChild(wrap);

  const follow = document.getElementById("cineFollow");
  let fx = innerWidth / 2, fy = innerHeight * 0.32, tx = fx, ty = fy;
  window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function tick() {
    fx += (tx - fx) * 0.06;
    fy += (ty - fy) * 0.06;
    if (follow) follow.style.transform = "translate(" + fx + "px," + fy + "px) translate(-50%,-50%)";
    requestAnimationFrame(tick);
  })();
})();
