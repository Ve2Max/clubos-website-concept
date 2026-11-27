// WebGL glass for DOM elements (the step cards, the panel toggle).
//
// Each frame that something moves:
//   1. paintScene()  draws what's behind the glass into a viewport-sized 2D canvas:
//                    page colour, dot grid, hero/outro text, and a replica of the
//                    network chart read from the live SVG (GSAP's current values).
//   2. The scene is uploaded once and blurred for the face.
//   3. Every glass element on screen is drawn by the glass shader into one shared
//      WebGL canvas, then copied into a <canvas> that sits behind that element's
//      content. So the glass stacks like a normal background and text stays DOM.
//
// If WebGL isn't available, createGlassLayer returns null and the CSS glass stays.

import { VERTEX, BLUR, GLASS, TUBE, TUBE_LINES, TUBE_SAMPLES } from './shaders.js';

const LINE_WIDTH = 20; // px, glass lines
// Hover on glass buttons: light angle swings by `angle`°, sheen × (1 + sheen), highlight shifts
const HOVER = { sheen: 0.8, shift: 0.5 }; // hover: reflections slide sideways by `shift` (light units), sheen brightens
const UNIT_PX = 280; // shape width the prototype's depth/refraction values were tuned on
const SETTLE_MS = 900; // keep rendering this long after the last scroll/resize (theme scrub lag)
const TEXT_SOURCES = ['.hero-title', '.lede', '.outro h2'];

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export function createGlassLayer({ chart, settings, stage }) {
  let s = settings;
  const glCanvas = document.createElement('canvas');
  const gl = glCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, preserveDrawingBuffer: true });
  if (!gl) return null;

  let programs;
  try {
    programs = { glass: program(gl, GLASS), blur: program(gl, BLUR) };
  } catch (err) {
    console.warn('[glass] shader failed, keeping CSS glass', err);
    return null;
  }
  try {
    programs.tube = program(gl, TUBE);
  } catch (err) {
    console.warn('[glass] glass-lines shader failed; lines stay as plain strokes', err);
  }

  // ── GL resources ──
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const use = (p) => {
    gl.useProgram(p);
    const a = gl.getAttribLocation(p, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  };
  const U = Object.fromEntries(
    [...GLASS.matchAll(/uniform\s+(?:float|vec[234]|sampler2D)\s+([^;]+);/g)]
      .flatMap((m) => m[1].split(',').map((n) => n.trim()))
      .map((n) => [n, gl.getUniformLocation(programs.glass, n)]));
  const T = programs.tube && Object.fromEntries(
    ['u_background', 'u_screenBlur', 'u_viewport', 'u_light', 'u_box', 'u_px', 'u_p', 'u_c', 'u_half',
     'u_refraction', 'u_dispersion', 'u_reflection', 'u_tintAmount', 'u_lightAngle', 'u_tint']
      .map((n) => [n, gl.getUniformLocation(programs.tube, n)]));
  const blurDir = gl.getUniformLocation(programs.blur, 'u_direction');
  const blurImg = gl.getUniformLocation(programs.blur, 'u_image');
  const sceneTex = texture(gl);
  // Blur targets at half resolution: [scratch, frost, scratch, face]
  const targets = Array.from({ length: 4 }, () => {
    const t = texture(gl), f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { tex: t, fb: f };
  });
  let tw = 0, th = 0;
  const bind = (t, unit) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); };
  const blurPass = (from, to, dx, dy) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, to.fb);
    gl.viewport(0, 0, tw, th);
    bind(from, 0);
    gl.uniform1i(blurImg, 0);
    gl.uniform2f(blurDir, dx, dy);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // ── Scene (what the glass refracts) ──
  const scene = document.createElement('canvas');
  const sub = document.createElement('canvas'), subCtx = sub.getContext('2d'); // the repainted region, for partial uploads
  let sceneKey = ''; // size the scene texture was last fully uploaded at
  const sctx = scene.getContext('2d');
  let dot = { color: '', pattern: null };
  const words = new Map(); // element -> [{ range, text }]

  function wordsOf(el) {
    if (words.has(el)) return words.get(el);
    const list = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode());) {
      for (const m of node.data.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        list.push({ range, text: m[0], parent: node.parentElement });
      }
    }
    words.set(el, list);
    return list;
  }

  // Painted at the screen's pixel density (k), in CSS px coordinates: what's refracted (the role under
  // the role row's pill, text the glass passes over) stays as sharp as the page itself.
  // clip: repaint only this region (CSS px; the rest of the scene canvas is kept from earlier frames).
  // focus: where glass is (CSS px); scene elements elsewhere aren't refracted, so they're skipped.
  function paintScene(W, H, k = 1, clip = null, focus = null) {
    const pw = Math.round(W * k), ph = Math.round(H * k);
    if (scene.width !== pw || scene.height !== ph) { scene.width = pw; scene.height = ph; }
    const bodyCs = getComputedStyle(document.body);
    sctx.setTransform(k, 0, 0, k, 0, 0);
    sctx.globalAlpha = 1;
    sctx.save();
    if (clip) { sctx.beginPath(); sctx.rect(clip.x, clip.y, clip.w, clip.h); sctx.clip(); }
    sctx.fillStyle = bodyCs.backgroundColor;
    sctx.fillRect(0, 0, W, H);

    // Dot grid (body background: fixed, one dot centred in each --grid-size tile)
    const dotColor = bodyCs.getPropertyValue('--grid-dot').trim();
    const size = parseFloat(bodyCs.getPropertyValue('--grid-size')) || 24;
    if (dotColor !== dot.color || size !== dot.size) {
      const tile = document.createElement('canvas');
      tile.width = tile.height = size;
      const t = tile.getContext('2d');
      t.fillStyle = dotColor;
      t.beginPath(); t.arc(size / 2, size / 2, 1.2, 0, Math.PI * 2); t.fill();
      dot = { color: dotColor, size, pattern: sctx.createPattern(tile, 'repeat') };
    }
    sctx.fillStyle = dot.pattern;
    sctx.fillRect(0, 0, W, H);

    // Solid panels that glass sits on (marked data-scene-fill: the decision rooms' black block),
    // drawn in their background colour with their corner radius
    for (const el of document.querySelectorAll('[data-scene-fill]')) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.width < 1) continue;
      const cs = getComputedStyle(el);
      sctx.fillStyle = cs.backgroundColor;
      sctx.beginPath(); sctx.roundRect(r.left, r.top, r.width, r.height, parseFloat(cs.borderTopLeftRadius) || 0); sctx.fill();
    }

    // Images and canvases that glass passes over (marked data-scene: the hero stripes, the
    // showcase's player card). One inside a [data-scene-clip] box only shows within that box.
    for (const img of document.querySelectorAll('img[data-scene], canvas[data-scene]')) {
      if (img.tagName === 'IMG' ? !img.complete || !img.naturalWidth : !img.width) continue;
      const r = img.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.width < 1) continue;
      const clip = img.closest('[data-scene-clip]')?.getBoundingClientRect();
      if (clip && (clip.bottom < 0 || clip.top > H)) continue;
      sctx.save();
      if (clip) { sctx.beginPath(); sctx.rect(clip.left, clip.top, clip.width, clip.height); sctx.clip(); }
      if (img.tagName === 'IMG' && getComputedStyle(img).objectFit === 'cover') {
        // Same crop as CSS object-fit: cover (centred)
        const k = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
        const sw = r.width / k, sh = r.height / k;
        sctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, r.left, r.top, r.width, r.height);
      } else {
        // Whole-pixel position: glass samples the scene at whole pixels too (u_rect below), so
        // what's under a glass element stays locked to it while the page scrolls by fractions
        // of a pixel (Retina trackpads). Otherwise the image is resampled at a different
        // sub-pixel phase every frame and swims (the showcase's player card did).
        sctx.drawImage(img, Math.round(r.left), Math.round(r.top), r.width, r.height);
      }
      sctx.restore();
    }

    // Opaque bars that sit over everything (marked data-scene-cover: the fixed top menu), painted last in
    // their background colour, so glass inside them refracts the bar, not what scrolls underneath
    for (const el of document.querySelectorAll('[data-scene-cover]')) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.width < 1) continue;
      sctx.fillStyle = getComputedStyle(el).backgroundColor;
      sctx.fillRect(r.left, r.top, r.width, r.height);
    }

    // Page text that glass passes over
    for (const sel of TEXT_SOURCES) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > H) continue;
      const cs = getComputedStyle(el);
      sctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      sctx.fillStyle = cs.color;
      sctx.textBaseline = 'alphabetic';
      sctx.textAlign = 'left';
      sctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      const fs = parseFloat(cs.fontSize);
      for (const w of wordsOf(el)) {
        const r = w.range.getBoundingClientRect();
        if (r.bottom < 0 || r.top > H) continue;
        // baseline ≈ bottom of the glyph box minus the descent; colour of the word's own element
        if (w.parent !== el) sctx.fillStyle = (w.color ??= getComputedStyle(w.parent).color);
        else sctx.fillStyle = cs.color;
        sctx.fillText(w.text, r.left, r.top + (r.height + fs * 0.7) / 2);
      }
      sctx.letterSpacing = '0px';
    }

    // Elements added with addScene(): their words (squeezed like the element, if it's scaled) and
    // icons, so a glass element laid over them refracts them (the role row's pill). Works inside
    // shadow roots too, as the elements are handed over directly.
    const near = (b) => !focus || (b.right > focus.x && b.left < focus.x + focus.w && b.bottom > focus.y && b.top < focus.y + focus.h);
    for (const el of sceneEls) {
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > H || box.right < 0 || box.left > W || !near(box)) continue;
      const cs = getComputedStyle(el);
      sctx.globalAlpha = Math.min(1, parseFloat(cs.opacity) || 0);
      if (!sctx.globalAlpha) continue;
      for (const svgEl of el.querySelectorAll('svg')) {
        const r = svgEl.getBoundingClientRect(), img = svgImage(svgEl, getComputedStyle(svgEl).color);
        if (img) sctx.drawImage(img, r.left, r.top, r.width, r.height);
      }
      for (const w of wordsOf(el)) {
        const r = w.range.getBoundingClientRect(), pcs = getComputedStyle(w.parent), fs = parseFloat(pcs.fontSize);
        sctx.font = `${pcs.fontWeight} ${pcs.fontSize} ${pcs.fontFamily}`;
        sctx.letterSpacing = pcs.letterSpacing === 'normal' ? '0px' : pcs.letterSpacing;
        sctx.fillStyle = pcs.color;
        const sx = r.width / Math.max(1, sctx.measureText(w.text).width);
        sctx.setTransform(sx * k, 0, 0, k, r.left * k, 0);
        const y = r.top + (r.height + fs * 0.7) / 2;
        sctx.fillText(w.text, 0, y);
        // Canvas text is drawn with the system's heavier smoothing, while the page uses
        // -webkit-font-smoothing: antialiased; a hairline in the background colour round each
        // glyph takes it back to the page's weight.
        sctx.lineWidth = 0.25; sctx.lineJoin = 'round'; sctx.strokeStyle = bodyCs.backgroundColor;
        sctx.strokeText(w.text, 0, y);
        sctx.setTransform(k, 0, 0, k, 0, 0);
      }
      sctx.letterSpacing = '0px';
    }
    sctx.globalAlpha = 1;

    paintChart();
    sctx.restore();
  }

  // Inline SVG icons as images for the scene (currentColor resolved). Cached by markup and colour, so the
  // copies of an icon share one image; when an icon changes colour (a role turning current under the
  // pill), its last ready image is drawn until the new one has decoded, so it never blinks out.
  const svgCache = new WeakMap(); // icon element → { markup (serialised once), images by colour, last ready image }
  function svgImage(svgEl, color) {
    let c = svgCache.get(svgEl);
    if (!c) { c = { markup: new XMLSerializer().serializeToString(svgEl), byColor: new Map(), last: null }; svgCache.set(svgEl, c); }
    let img = c.byColor.get(color);
    if (!img) {
      img = new Image();
      img.onload = () => invalidate(200);
      const src = c.markup.replaceAll('currentColor', color);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src.includes('xmlns=') ? src : src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
      c.byColor.set(color, img);
    }
    if (img.complete && img.naturalWidth) { c.last = img; return img; }
    return c.last;
  }
  const sceneEls = new Set();

  function paintChart() {
    if (!chart) return; // pages without the network chart (the hero page)
    const box = chart.svg.getBoundingClientRect();
    if (box.bottom < 0 || box.top > scene.height) return;
    chart.paint(sctx);
  }

  // ── Elements ──
  // group: which panel switch controls it ('cards', 'cos'); ungrouped elements are always glass.
  const elements = new Map(); // el -> { canvas, ctx, group }
  const enabled = (item) => !item.group || s[`glass_${item.group}`] !== false;
  // tint / tintAmount: fixed per-element overrides of the panel's tint (e.g. the blue button).
  // keys: read some values from other settings, e.g. { lens: 'sc_lens' } for the showcase
  // panels, so they have their own panel controls (lens, refraction, dispersion).
  // when: optional () => boolean; the element is only drawn while it returns true.
  // fixed: per-element values that override the settings, e.g. { lens: 0.2 } (the role pill: a light
  // magnify, so the role under it still fits).
  function add(el, { group, tint, tintAmount, keys, when, fixed } = {}) {
    if (!el || elements.has(el)) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'glass-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    el.prepend(canvas);
    el.classList.add('has-glass');
    const item = { canvas, ctx: canvas.getContext('2d'), group, tint, tintAmount, keys, when, fixed, hover: 0, hoverTo: 0 };
    // Links/buttons: on hover the reflections slide sideways and the sheen brightens (eased in frame())
    if (el.matches('a, button')) {
      el.addEventListener('pointerenter', () => { item.hoverTo = 1; });
      el.addEventListener('pointerleave', () => { item.hoverTo = 0; });
      el.addEventListener('focus', () => { item.hoverTo = 1; });
      el.addEventListener('blur', () => { item.hoverTo = 0; });
    }
    elements.set(el, item);
    el.classList.toggle('is-glass', enabled(item));
    invalidate();
  }

  // Glass lines are drawn into one canvas in the stage, between the COS overlay and the SVG
  // (so tags and connector dots sit on top of the rods).
  const linesCanvas = document.createElement('canvas');
  linesCanvas.className = 'glass-lines-canvas';
  linesCanvas.setAttribute('aria-hidden', 'true');
  if (chart) stage?.insertBefore(linesCanvas, chart.svg);
  const linesCtx = linesCanvas.getContext('2d');
  const linesOn = () => !!(chart && programs.tube && stage && s.glass_lines);
  chart?.setGlassLines(linesOn());

  // ── Render ──
  const light = { x: 0, y: 0, tx: 0, ty: 0 };
  let dirtyUntil = 0, lastScroll = -1;

  // The element's own box on screen. Unrotated: its rect, snapped to whole pixels (matching
  // the scene images, so nothing swims on fractional scroll). Rotated (the showcase's curved
  // row): its unrotated size and centre, plus the angle, so the shader can sample under it.
  function geometry(el, r) {
    const t = getComputedStyle(el).transform;
    const m = t && t !== 'none' ? new DOMMatrixReadOnly(t) : null;
    if (!m || Math.abs(m.b) < 1e-5) {
      return { left: Math.round(r.left), top: Math.round(r.top), width: r.width, height: r.height, cos: 1, sin: 0 };
    }
    const sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d);
    const width = el.offsetWidth * sx, height = el.offsetHeight * sy;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    return { left: cx - width / 2, top: cy - height / 2, width, height, cos: m.a / sx, sin: m.b / sx };
  }

  function render() {
    const W = document.documentElement.clientWidth, H = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);

    // Which elements are on screen?
    const jobs = [];
    for (const [el, item] of elements) {
      if (!el.isConnected) { elements.delete(el); continue; } // re-rendered away (e.g. a decision room switched)
      if (!enabled(item) || (item.when && !item.when())) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
      jobs.push({ el, item, r, g: geometry(el, r) });
    }
    let lines = linesOn() ? chart.lines(TUBE_SAMPLES) : [];
    if (lines.length > TUBE_LINES) {
      console.warn(`[glass] only ${TUBE_LINES} glass lines can be drawn at once; extra lines skipped`);
      lines = lines.slice(0, TUBE_LINES);
    }
    // Region the rods cover (CSS px), clipped to the viewport
    let box = null;
    if (lines.length) {
      const pad = LINE_WIDTH / 2 + 2;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const l of lines) for (const p of l.pts) {
        x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
      }
      x0 = Math.max(0, Math.floor(x0 - pad)); y0 = Math.max(0, Math.floor(y0 - pad));
      x1 = Math.min(W, Math.ceil(x1 + pad)); y1 = Math.min(H, Math.ceil(y1 + pad));
      if (x1 - x0 > 1 && y1 - y0 > 1) box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    if (!box) linesCanvas.style.display = 'none';
    if (!jobs.length && !box) return;

    // Only the area around the glass matters (plus room for refraction and blur), so when that's a
    // small part of the screen (the role row's pill, a button) only it is repainted and re-uploaded;
    // the rest of the scene texture is kept. Full repaint on resize, with the chart's glass lines, or
    // when the glass covers much of the screen.
    let focus = null;
    if (jobs.length) {
      const m = 48 + (s.screenBlur || 0);
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const j of jobs) { x0 = Math.min(x0, j.r.left); y0 = Math.min(y0, j.r.top); x1 = Math.max(x1, j.r.right); y1 = Math.max(y1, j.r.bottom); }
      x0 = Math.max(0, Math.floor(x0 - m)); y0 = Math.max(0, Math.floor(y0 - m));
      x1 = Math.min(W, Math.ceil(x1 + m)); y1 = Math.min(H, Math.ceil(y1 + m));
      focus = { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
    }
    const sizeKey = `${W}x${H}@${dpr}`;
    const partial = focus && !box && sceneKey === sizeKey && focus.w * focus.h < W * H * 0.5;
    paintScene(W, H, dpr, partial ? focus : null, box ? null : focus);

    // Upload + blur the scene
    bind(sceneTex, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    if (partial) {
      const px = Math.floor(focus.x * dpr), py = Math.floor(focus.y * dpr);
      const pw = Math.min(scene.width - px, Math.ceil(focus.w * dpr)), ph = Math.min(scene.height - py, Math.ceil(focus.h * dpr));
      if (sub.width !== pw || sub.height !== ph) { sub.width = pw; sub.height = ph; }
      subCtx.clearRect(0, 0, pw, ph);
      subCtx.drawImage(scene, px, py, pw, ph, 0, 0, pw, ph);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, px, scene.height - (py + ph), gl.RGBA, gl.UNSIGNED_BYTE, sub); // (rows flipped: y from the bottom)
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene);
      sceneKey = sizeKey;
    }
    const bw = Math.max(1, Math.round(W / 2)), bh = Math.max(1, Math.round(H / 2));
    if (tw !== bw || th !== bh) {
      tw = bw; th = bh;
      for (const t of targets) {
        bind(t.tex, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
    }
    use(programs.blur);
    const frostPx = 0; // rim frost: no rim, so no frost pass
    const frosted = frostPx > 0.2, faceBlurred = s.screenBlur > 0.5;
    if (frosted) {
      blurPass(sceneTex, targets[0], frostPx / 2.5 / W, 0);
      blurPass(targets[0].tex, targets[1], 0, frostPx / 2.5 / H);
    }
    if (faceBlurred) {
      // Two rounds of half the radius each: smoother than one wide sparse kernel.
      const step = s.screenBlur / 2.5 / Math.SQRT2;
      blurPass(sceneTex, targets[2], step / W, 0);
      blurPass(targets[2].tex, targets[3], 0, step / H);
      blurPass(targets[3].tex, targets[2], step / W, 0);
      blurPass(targets[2].tex, targets[3], 0, step / H);
    }

    // Size the shared output canvas to fit the largest element
    const needW = Math.ceil(Math.max(box?.w ?? 0, ...jobs.map((j) => j.g.width)) * dpr);
    const needH = Math.ceil(Math.max(box?.h ?? 0, ...jobs.map((j) => j.g.height)) * dpr);
    if (glCanvas.width < needW || glCanvas.height < needH) {
      glCanvas.width = Math.max(glCanvas.width, needW);
      glCanvas.height = Math.max(glCanvas.height, needH);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    use(programs.glass);
    [['u_background', sceneTex], ['u_frameBlur', frosted ? targets[1].tex : sceneTex],
     ['u_screenBlur', faceBlurred ? targets[3].tex : sceneTex]].forEach(([name, t], unit) => {
      bind(t, unit); gl.uniform1i(U[name], unit);
    });
    const f1 = (name, v) => U[name] && gl.uniform1f(U[name], v);
    f1('u_refraction', s.refraction); f1('u_dispersion', s.dispersion);
    f1('u_reflection', s.reflection);
    f1('u_lightAngle', (s.lightAngle * Math.PI) / 180);
    f1('u_tintAmount', s.tintAmount); f1('u_transmission', s.transmission); f1('u_sheen', s.sheen);
    f1('u_clarity', s.clarity); f1('u_lens', s.lens);
    gl.uniform3fv(U.u_tint, hexToRgb(s.tint));
    gl.uniform2f(U.u_light, light.x, light.y);
    gl.clearColor(0, 0, 0, 0);

    for (const { item, g } of jobs) {
      const w = Math.round(g.width * dpr), h = Math.round(g.height * dpr);
      const aspect = g.height / g.width;
      // Corner radius from the element's CSS, scaled if the element is transformed (COS follows the camera)
      const css = parseFloat(getComputedStyle(item.canvas.parentElement).borderTopLeftRadius) || 0;
      const scale = g.width / (item.canvas.parentElement.offsetWidth || g.width);
      const radiusPx = Math.min(css * scale, g.height / 2, g.width / 2);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.u_resolution, w, h);
      // Where this element sits in the scene texture (UV, y up), and its rotation (CSS turns
      // clockwise with y down = counter-clockwise with y up, hence −sin)
      gl.uniform4f(U.u_rect, g.left / W, 1 - (g.top + g.height) / H, g.width / W, g.width / H);
      gl.uniform2f(U.u_rot, g.cos, -g.sin);
      f1('u_aspect', aspect);
      f1('u_radius', radiusPx / g.width);
      f1('u_rail', 0); // no rim
      f1('u_unit', UNIT_PX / g.width);
      gl.uniform3fv(U.u_tint, hexToRgb(item.tint ?? s.tint));
      // Hover: the reflections slide sideways a little and the sheen brightens. The shader also turns
      // the light by u_light.x × 0.34 rad, so the angle is offset by the same amount: no rotation.
      const hv = item.hover;
      f1('u_lightAngle', (s.lightAngle * Math.PI) / 180 - hv * HOVER.shift * 0.34);
      f1('u_sheen', s.sheen * (1 + hv * HOVER.sheen));
      gl.uniform2f(U.u_light, light.x + hv * HOVER.shift, light.y);
      f1('u_tintAmount', item.tintAmount ?? s.tintAmount);
      const v = (name) => item.fixed?.[name] ?? s[item.keys?.[name]] ?? s[name];
      f1('u_lens', v('lens'));
      f1('u_refraction', v('refraction'));
      f1('u_dispersion', v('dispersion'));
      // Edge band: at least `edgeWidth` CSS px wide at the sides and `edgeWidthTB` at top and bottom (the
      // shader's own band is 8% of the shorter side: thin on short pills; big panels keep theirs)
      const band = 0.08 * Math.min(g.width, g.height);
      f1('u_rimK', Math.max(1, (item.fixed?.edgeWidth ?? s.edgeWidth) / band));
      f1('u_rimKv', Math.max(1, (item.fixed?.edgeWidthTB ?? s.edgeWidthTB) / band));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      const { canvas, ctx } = item;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(glCanvas, 0, glCanvas.height - h, w, h, 0, 0, w, h);
    }

    if (box) drawLines(lines, box, W, H, dpr, faceBlurred ? targets[3].tex : sceneTex);
  }

  function drawLines(lines, box, W, H, dpr, blurTex) {
    const w = Math.round(box.w * dpr), h = Math.round(box.h * dpr);
    use(programs.tube);
    bind(sceneTex, 0); gl.uniform1i(T.u_background, 0);
    bind(blurTex, 1); gl.uniform1i(T.u_screenBlur, 1);
    const pts = new Float32Array(TUBE_LINES * TUBE_SAMPLES * 3);
    const cs = new Float32Array(TUBE_LINES * 3);
    lines.forEach((l, c) => {
      l.pts.forEach((p, i) => pts.set([p.x, p.y, p.s], (c * TUBE_SAMPLES + i) * 3));
      cs.set([l.from, l.to, l.opacity], c * 3);
    });
    gl.uniform3fv(T.u_p, pts);
    gl.uniform3fv(T.u_c, cs);
    gl.uniform2f(T.u_viewport, W, H);
    gl.uniform2f(T.u_light, light.x, light.y);
    gl.uniform4f(T.u_box, box.x, box.y, box.w, box.h);
    gl.uniform1f(T.u_px, dpr);
    gl.uniform1f(T.u_half, LINE_WIDTH / 2);
    gl.uniform1f(T.u_refraction, s.refraction);
    gl.uniform1f(T.u_dispersion, s.dispersion);
    gl.uniform1f(T.u_reflection, s.reflection);
    gl.uniform1f(T.u_tintAmount, s.tintAmount);
    gl.uniform1f(T.u_lightAngle, (s.lightAngle * Math.PI) / 180);
    gl.uniform3fv(T.u_tint, hexToRgb(s.tint));
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Place the canvas over that region (the stage may be shifted while it scrolls in)
    const sr = stage.getBoundingClientRect();
    if (linesCanvas.width !== w || linesCanvas.height !== h) { linesCanvas.width = w; linesCanvas.height = h; }
    Object.assign(linesCanvas.style, {
      display: 'block', left: `${box.x - sr.left}px`, top: `${box.y - sr.top}px`, width: `${box.w}px`, height: `${box.h}px`,
    });
    linesCtx.clearRect(0, 0, w, h);
    linesCtx.drawImage(glCanvas, 0, glCanvas.height - h, w, h, 0, 0, w, h);
  }

  // ── Loop: only render while something is changing ──
  function invalidate(ms = SETTLE_MS) { dirtyUntil = Math.max(dirtyUntil, performance.now() + ms); }
  // Callbacks run at the start of the next frame, before the glass is drawn: anything that
  // moves glass elements itself (the showcase carousel) moves them here, so the glass is drawn
  // where they are now, not where they were a frame ago.
  let before = [];
  function frame(now) {
    requestAnimationFrame(frame);
    if (before.length) { const fns = before; before = []; for (const fn of fns) fn(now); }
    if (gl.isContextLost()) return;
    if (scrollY !== lastScroll) { lastScroll = scrollY; invalidate(); }
    const k = reduced.matches ? 1 : 0.12;
    light.x += (light.tx - light.x) * k;
    light.y += (light.ty - light.y) * k;
    const lightMoving = Math.abs(light.tx - light.x) + Math.abs(light.ty - light.y) > 0.002;
    let hovering = false;
    for (const item of elements.values()) {
      if (Math.abs(item.hoverTo - item.hover) < 0.002) { item.hover = item.hoverTo; continue; }
      item.hover += (item.hoverTo - item.hover) * (reduced.matches ? 1 : 0.14);
      hovering = true;
    }
    if (now < dirtyUntil || lightMoving || hovering || chart?.tl?.isActive()) render();
  }
  requestAnimationFrame(frame);

  addEventListener('resize', () => invalidate(), { passive: true });
  addEventListener('pointermove', (e) => {
    if (!s.followPointer || reduced.matches) return;
    light.tx = (e.clientX / innerWidth) * 2 - 1;
    light.ty = 1 - (e.clientY / innerHeight) * 2;
  }, { passive: true });
  document.fonts?.ready.then(() => { words.clear(); invalidate(); });

  document.documentElement.classList.add('glass-webgl');

  return {
    add,
    invalidate,
    /** Elements whose text and icons glass refracts (painted into the scene behind the glass). */
    addScene: (...els) => { els.forEach((el) => el && sceneEls.add(el)); invalidate(); },
    /** The panel switch groups in use on this page (for the glass panel). */
    groups: () => [...new Set([...elements.values()].map((i) => i.group).filter(Boolean))],
    beforeFrame: (fn) => { before.push(fn); },
    setSettings(next) {
      s = next;
      for (const [el, item] of elements) el.classList.toggle('is-glass', enabled(item));
      chart?.setGlassLines(linesOn());
      if (!linesOn()) linesCanvas.style.display = 'none';
      if (!s.followPointer) { light.tx = 0; light.ty = 0; }
      invalidate(100);
    },
  };
}

function program(gl, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, fs]]) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    gl.attachShader(p, sh);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

function texture(gl) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}
