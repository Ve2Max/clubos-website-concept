/*
 * Transition Loom: a canvas animation from the ClubOS mark to the loom crop.
 *
 * Both ends come from the Figma file "logo transition":
 *   Frame 1     the mark: two concentric ellipses on a 797 × 498 frame, 61 px wide.
 *               A  30.5 × 5.25 (semi-axes), level
 *               B  29.17 × 8.13, major axis tilted 45.29° up to the right
 *   Last frame  the centre of the loom crop at 1:1, i.e. the Radial Loom with
 *               30 ellipses (216 × 950) on a radius of 164, span 46.7°, seen
 *               through a 797 × 498 window centred 51.4 units below the rotation centre.
 *
 * How it moves (all driven by one progress value, 0..1):
 *   The 30 ellipses start stacked on the mark: 15 on A, 15 on B. With the even-odd
 *   fill a stack of an odd number of identical ellipses draws as one, so progress 0
 *   is exactly the mark. As progress grows each copy turns towards its place in the
 *   fan, its size and proportion move to the loom ellipse, and the copies slide out
 *   from the shared centre onto the 164-unit radius: the "echoes" unfold.
 *   Meanwhile the camera zooms (geometrically, so the speed feels even) from the
 *   mark into the pinch of the fan, ~83× closer.
 *
 * Units: world units = generator units (the loom ellipse is 216 × 950). The mark is
 * scaled so that A's long axis matches the loom ellipse's (475 semi-axis).
 *
 * No dependencies. Plain script (works from file://): exposes window.TransitionLoom,
 * window.mountTransitionLoom and window.TRANSITION_LOOM_DEFAULTS.
 */
(function (global) {
'use strict';

const DEG = Math.PI / 180;

const DEFAULTS = {
  // ── end state: the Radial Loom (same as the Pinch Loom) ──
  count: 30,          // even, so that half can stack on each ellipse of the mark
  shapeWidth: 216,    // ellipse size along the radius
  shapeHeight: 950,   // ellipse size across the radius
  radius: 164,        // rotation centre -> ellipse centres
  span: 46.7,         // fan span, degrees

  // ── start state: the mark (Figma frame 1, px) ──
  mark: [
    { rx: 30.5, ry: 5.2527 },     // A
    { rx: 29.1696, ry: 8.1266 },  // B
  ],

  // ── rotation of the two main ellipses, degrees (canvas angles: positive = clockwise) ──
  // start: the mark's own tilt. end: the centre of that ellipse's half of the fan
  // (null = the Figma fan, i.e. ±span/4-ish). Values past ±180 add whole turns on the way.
  startA: 0,         // A: level
  startB: -45.29,    // B: tilted up to the right
  endA: null,        // A's echoes end clockwise of horizontal (+12.1° with the Figma fan)
  endB: null,        // B's echoes end anticlockwise of horizontal (−12.1°)

  // ── camera (reference frame = the 797 × 498 Figma frames, covered onto the canvas) ──
  frameW: 797,
  frameH: 498,
  zoomStart: 61 / 950,     // frame px per world unit at progress 0 (mark is 61 px wide)
  zoomEnd: 5.301,          // frame px per world unit at progress 1 (fitted to the Figma last frame)
  focusX: -1.82,           // where the camera ends, units right of the rotation centre (fitted to Figma)
  focusY: 51.4,            // where the camera ends, units below the rotation centre

  // ── timing: which part of the progress each motion uses (0..1) ──
  unfoldFrom: 0.0,  unfoldTo: 0.8,   // echoes fan out, grow and move onto the radius
  zoomFrom: 0.0,    zoomTo: 1.0,     // camera zooms into the pinch
  zoomEase: 0.5,                     // 0 = constant zoom speed, 1 = slow start and finish

  // ── ending: 'loom' = zoom into the loom crop (Figma last frame)
  //            'dark' = the echoes burst outward one after another, past the edges of the
  //                     screen. Every outline that sweeps over the screen flips the even-odd
  //                     parity of what it leaves inside it; one echo (the core) shrinks back
  //                     into the centre instead, so 29 (odd) end up covering every pixel and
  //                     the frame settles on flat dark: made by the overlaps alone ──
  ending: 'loom',
  burstSpan: 150,          // dark: fan span the echoes burst to, degrees
  burstScale: 75,          // dark: how much the echoes grow (×), past the edges of the screen
  growFrom: 0.1,           // dark: progress where the first echo starts to grow
  growTo: 0.92,            //       and where the last one is past the screen; after it, quiet
  stagger: 0.4,            // dark: share of the growth window spent between the first and last echo
                           //       (0 = all together; higher = one after another, more sweeps)
  burstRadius: 40,         // dark: offset of the echoes from the centre at the end (before growth), units
  burstZoom: 1.6,          // dark: camera zoom at the end (× the mark's framing)
  dark: '#0b0c0f',         // dark: the colour of the quiet end (also the shapes' colour in this mode)

  background: '#ffffff',   // null = transparent canvas (only the shapes are painted)
  foreground: '#000000',
  smoothing: 1,            // scroll inertia per 60fps frame, 0..1 (1 = none: locked to the scroll)
  maxDpr: 2,
  onDraw: null,
};

const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const phase = (p, from, to) => clamp01((p - from) / Math.max(to - from, 1e-6));

class TransitionLoom {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.o = { ...DEFAULTS, ...options };
    this.ctx = canvas.getContext('2d', { alpha: !this.o.background });
    this.scrollTarget = 0;
    this.scroll = 0;
    this._raf = 0;
    this._last = 0;
    this._visible = true;

    this._tick = this._tick.bind(this);
    this._resize();
    this._ro = new ResizeObserver(() => { this._resize(); this._draw(); });
    this._ro.observe(canvas);
    this._io = new IntersectionObserver(([e]) => {
      this._visible = e.isIntersecting;
      if (this._visible) this._kick();
    });
    this._io.observe(canvas);
    this._draw();
  }

  /* ---------- public ---------- */

  /** Progress 0..1 (mark -> loom crop). */
  setScroll(p) { this.scrollTarget = clamp01(p); this._kick(); }

  /** Jump to a state without smoothing (stills, testing). */
  seek(p) { this.scroll = this.scrollTarget = clamp01(p); this._draw(); }

  set(options) { Object.assign(this.o, options); this._draw(); }

  /** End rotations of A and B with the Figma fan (what endA / endB = null resolve to). */
  fanCentres() {
    const span = this._span(), N = this.o.count, half = Math.ceil(N / 2), at = t => -span / 2 + t * span;
    const d = Math.max(N - 1, 1);
    return { A: at((half + N - 1) / 2 / d), B: at((half - 1) / 2 / d) };
  }

  _span() { return this.o.ending === 'dark' ? this.o.burstSpan : this.o.span; }

  /** Readout for tuning: unfold and zoom progress (0..1) and the current zoom factor vs the mark. */
  state() {
    const o = this.o, p = this.scroll;
    const u = easeInOutSine(phase(p, o.unfoldFrom, o.unfoldTo));
    const zt = phase(p, o.zoomFrom, o.zoomTo), z = lerp(zt, easeInOutSine(zt), o.zoomEase);
    const zoomEnd = o.ending === 'dark' ? o.zoomStart * o.burstZoom : o.zoomEnd;
    const grow = o.ending === 'dark' ? phase(p, o.growFrom, o.growTo) : 0;
    return { progress: p, unfold: u, zoom: z, grow, zoomEnd, magnification: Math.pow(zoomEnd / o.zoomStart, z) };
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    this._ro.disconnect();
    this._io.disconnect();
  }

  /* ---------- loop ---------- */

  _kick() {
    if (!this._raf) { this._last = performance.now(); this._raf = requestAnimationFrame(this._tick); }
  }

  _tick(now) {
    this._raf = 0;
    const dt = Math.min(Math.max(now - this._last, 0), 100);
    this._last = now;
    let busy = false;
    const d = this.scrollTarget - this.scroll;
    if (this.o.smoothing >= 1 || Math.abs(d) <= 2e-4) {
      this.scroll = this.scrollTarget;
    } else {
      this.scroll += d * (1 - Math.pow(1 - this.o.smoothing, dt / 16.667));
      busy = true;
    }
    if (this._visible) this._draw();
    if (busy) this._raf = requestAnimationFrame(this._tick);
  }

  /* ---------- render ---------- */

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.o.maxDpr);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
  }

  _draw() {
    const { ctx, canvas, o } = this;
    const W = canvas.width, H = canvas.height;
    const { unfold: u, zoom: zp, zoomEnd } = this.state();
    const dark = o.ending === 'dark';
    const focusX = dark ? 0 : o.focusX, focusY = dark ? 0 : o.focusY;

    // Camera. The reference frame covers the canvas; the zoom is geometric between the
    // two ends. The focus point's offset from the screen centre shrinks linearly with the
    // zoom progress, so the camera lands on it exactly without a late lurch.
    const cover = Math.max(W / o.frameW, H / o.frameH);
    const z = o.zoomStart * Math.pow(zoomEnd / o.zoomStart, zp);
    const s = z * cover;                                       // canvas px per world unit
    const back = o.zoomStart * (1 - zp) / z;                // focus offset still to cover, in world units per unit of offset
    const camX = focusX - focusX * back;
    const camY = focusY - focusY * back;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (o.background) { ctx.fillStyle = o.background; ctx.fillRect(0, 0, W, H); }
    else ctx.clearRect(0, 0, W, H);
    ctx.setTransform(s, 0, 0, s, W / 2 - camX * s, H / 2 - camY * s);
    ctx.fillStyle = dark ? o.dark : o.foreground;

    // Mark, in world units: scaled so A's long semi-axis is the loom's (shapeHeight / 2).
    const N = o.count, half = Math.ceil(N / 2);
    const majEnd = o.shapeHeight / 2, minEnd = o.shapeWidth / 2;
    const k0 = majEnd / o.mark[0].rx;
    const fan = this.fanCentres();
    const shiftA = o.endA == null ? 0 : o.endA - fan.A;   // turns A's whole half of the fan
    const shiftB = o.endB == null ? 0 : o.endB - fan.B;
    const span = this._span();
    const radius = dark ? o.burstRadius : o.radius;
    // dark: each echo has its own growth window, the middle of the fan first and the outer
    // edges last, so the outlines sweep over the screen one after another. Growth is
    // geometric, so every echo expands at an even pace. The core echo (the one nearest the
    // middle of the fan) shrinks away instead: that leaves an odd number covering the screen.
    const p = this.scroll;
    const core = half;
    const win = Math.max(o.growTo - o.growFrom, 1e-6), st = Math.min(Math.max(o.stagger, 0), 0.95);
    const growOf = k => {
      if (!dark) return 1;
      const t = N <= 1 ? 0.5 : k / (N - 1);
      const x = Math.abs(t - 0.5) * 2, x0 = 1 / Math.max(N - 1, 1);
      const order = clamp01((x - x0) / Math.max(1 - x0, 1e-6)); // 0 = middle pair, 1 = outer pair
      const a = o.growFrom + order * st * win, len = (1 - st) * win;
      const e = easeInOutSine(phase(p, a, a + len));
      return k === core ? 1 - e : Math.pow(o.burstScale, e);
    };

    // One even-odd fill over every ellipse = stacked difference blends of one colour
    // (parity of overlaps), and coincident outlines cancel exactly.
    ctx.beginPath();
    for (let k = 0; k < N; k++) {
      // end: fanned on the arc; the copies on the counter-clockwise half start on B
      const t = N <= 1 ? 0.5 : k / (N - 1);
      const onB = k < half;
      const endAngle = (-span / 2 + t * span + (onB ? shiftB : shiftA)) * DEG;  // major-axis tilt
      const m = o.mark[onB ? 1 : 0];
      const startAngle = (onB ? o.startB : o.startA) * DEG;

      const ang = lerp(startAngle, endAngle, u);
      const grow = growOf(k);
      const maj = lerp(m.rx * k0, majEnd, u) * grow;
      const min = lerp(m.ry * k0, minEnd, u) * grow;
      const R = radius * u * grow;
      // centre sits on the radius, perpendicular to the major axis (below the rotation centre)
      const cx = -R * Math.sin(ang), cy = R * Math.cos(ang);

      ctx.moveTo(cx + maj * Math.cos(ang), cy + maj * Math.sin(ang));
      ctx.ellipse(cx, cy, maj, min, ang, 0, Math.PI * 2);
    }
    ctx.fill('evenodd');
    if (o.onDraw) o.onDraw();
  }
}

/**
 * Wiring for a page: the scroll position of `section` drives the whole animation.
 *   mode 'pinned':  0 when the section's top reaches the viewport top, 1 when its
 *                   bottom reaches the viewport bottom (pair with a sticky canvas).
 *   mode 'through': 0 when the section enters at the bottom, 1 when it leaves at the top.
 */
function mountTransitionLoom(canvas, options = {}) {
  const { section = canvas.parentElement, mode = 'pinned', ...rest } = options;
  const loom = new TransitionLoom(canvas, rest);
  const measure = () => {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    loom.setScroll(mode === 'pinned'
      ? -r.top / Math.max(r.height - vh, 1)
      : (vh - r.top) / (r.height + vh));
  };
  loom.seek(0);
  measure();
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure);
  const destroy = loom.destroy.bind(loom);
  loom.destroy = () => {
    window.removeEventListener('scroll', measure);
    window.removeEventListener('resize', measure);
    destroy();
  };
  return loom;
}

global.TransitionLoom = TransitionLoom;
global.mountTransitionLoom = mountTransitionLoom;
global.TRANSITION_LOOM_DEFAULTS = DEFAULTS;
})(typeof window !== 'undefined' ? window : globalThis);
