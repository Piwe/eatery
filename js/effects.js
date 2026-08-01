/**
 * Canvas effects over the table: ambient steam, and a burst of
 * spice dust in the kitchen's colour whenever a dish is added.
 *
 * Rules this file follows, because decoration is not an excuse:
 *   - nothing runs if the viewer asked for reduced motion;
 *   - nothing runs while the table is scrolled out of view;
 *   - nothing runs while the tab is hidden;
 *   - the canvas is aria-hidden and carries no information that
 *     is not already in the DOM as text.
 */

window.Eatery = window.Eatery || {};

(function (ns) {
'use strict';

const SPICE = { ouma: [226, 115, 74], teta: [111, 174, 142], nonna: [207, 114, 134] };
const STEAM_MAX = 26;
const BURST = 18;

const rand = (min, max) => min + Math.random() * (max - min);

class Particle {
  constructor({ x, y, vx, vy, life, size, rgb, alpha }) {
    Object.assign(this, { x, y, vx, vy, life, age: 0, size, rgb, alpha });
  }
  get dead() { return this.age >= this.life; }
  step(dt) {
    this.age += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy -= 0.00002 * dt;          // heat keeps lifting it
  }
  draw(ctx) {
    const t = this.age / this.life;
    const fade = Math.sin(Math.PI * t);   // in and out, never a hard pop
    const r = this.size * (0.6 + t * 1.4);
    ctx.globalAlpha = this.alpha * fade;
    ctx.fillStyle = `rgb(${this.rgb.join(' ')})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

ns.initEffects = function initEffects() {
  const canvas = document.querySelector('[data-steam]');
  const stage = canvas?.closest('.plate__stage');
  if (!canvas || !stage) return { burst() {} };

  const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const ctx = canvas.getContext('2d', { alpha: true });
  const particles = [];
  let width = 0;
  let height = 0;
  let onscreen = false;
  let frame = null;
  let last = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = stage.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function emitSteam() {
    if (particles.length >= STEAM_MAX) return;
    particles.push(new Particle({
      x: rand(width * 0.25, width * 0.75),
      y: height * rand(0.55, 0.75),
      vx: rand(-0.008, 0.008),
      vy: rand(-0.02, -0.045),
      life: rand(2200, 3800),
      size: rand(3, 9),
      rgb: [255, 246, 232],
      alpha: 0.22,
    }));
  }

  /** A dish has just landed: throw its kitchen's colour into the air. */
  function burst(kitchen) {
    if (!motionOK.matches) return;
    const rgb = SPICE[kitchen] ?? SPICE.ouma;
    for (let i = 0; i < BURST; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.03, 0.13);
      particles.push(new Particle({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6,
        life: rand(700, 1500),
        size: rand(1, 3),
        rgb,
        alpha: 0.85,
      }));
    }
    start();
  }

  function tick(now) {
    const dt = Math.min(now - last, 48);   // a backgrounded tab must not fast-forward
    last = now;

    if (Math.random() < 0.04) emitSteam();

    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.step(dt);
      if (p.dead || p.y < -20) particles.splice(i, 1);
      else p.draw(ctx);
    }
    ctx.globalAlpha = 1;

    frame = onscreen && motionOK.matches ? requestAnimationFrame(tick) : null;
    if (!frame) ctx.clearRect(0, 0, width, height);
  }

  function start() {
    if (frame || !onscreen || !motionOK.matches) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    particles.length = 0;
    ctx.clearRect(0, 0, width, height);
  }

  new IntersectionObserver(([entry]) => {
    onscreen = entry.isIntersecting;
    onscreen ? start() : stop();
  }, { threshold: 0.15 }).observe(stage);

  new ResizeObserver(resize).observe(stage);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  motionOK.addEventListener('change', () => (motionOK.matches ? start() : stop()));

  resize();
  return { burst };
};

}(window.Eatery));
