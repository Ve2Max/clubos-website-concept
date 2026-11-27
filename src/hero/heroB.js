// Hero B: the manifesto's transition loom (public/transition-loom.js, dark ending) played backwards
// over a full-screen film. At the top of the page the loom is at its end, where the burst echoes cover every
// pixel; scrolling runs it back to the start, so the cover breaks into sweeping outlines and folds down into the
// ClubOS mark. The loom's shapes are the mask: the film (an image for now) is painted only inside them, and
// turns into the mark's ink over the last stretch.

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const INK = '#12120f';
// Media → ink: the mark takes the ClubOS ink between these points of the (forward) loom progress
const INK_FROM = 0.04, INK_TO = 0.2;
// The transition is done (the mark exactly as the manifesto's starting point) at MARK_AT of the pinned scroll;
// the rest holds the finished mark in place before the stage scrolls away
const MARK_AT = 0.75;

export function initHeroB({ glass } = {}) {
  const section = document.querySelector('.hero-b');
  const canvas = section?.querySelector('.hb-canvas');
  const media = section?.querySelector('.hb-media');
  if (!canvas || !window.TransitionLoom) return;

  const D = window.TRANSITION_LOOM_DEFAULTS; // the transition at its defaults, dark ending (as on the manifesto)
  const opts = {};

  const ready = () => media && (media.tagName === 'VIDEO' ? media.readyState >= 2 : media.complete && media.naturalWidth);
  const size = () => media.tagName === 'VIDEO' ? [media.videoWidth, media.videoHeight] : [media.naturalWidth, media.naturalHeight];

  let loom;
  // After the loom has drawn its shapes (even-odd, one colour), paint the film into them only ('source-in'),
  // covering the canvas, with a soft wash so the white headline reads; near the mark, fade over to the ink.
  const onDraw = () => {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    const p = loom ? loom.state().progress : 1;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    const a = smooth(INK_FROM, INK_TO, p);
    if (ready() && a > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = a;
      const [mw, mh] = size(), k = Math.max(W / mw, H / mh);
      ctx.drawImage(media, (W - mw * k) / 2, (H - mh * k) / 2, mw * k, mh * k);
      const g = ctx.createLinearGradient(0, 0, 0, H); // the wash: darker towards the bottom, where the text is
      g.addColorStop(0, 'rgb(12 12 10 / .15)'); g.addColorStop(0.55, 'rgb(12 12 10 / .25)'); g.addColorStop(1, 'rgb(12 12 10 / .6)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    glass?.invalidate(150); // the Book a Demo glass refracts what's drawn here
  };

  loom = new window.TransitionLoom(canvas, {
    ...opts,
    ending: 'dark',
    background: null,
    foreground: INK,
    dark: INK,
    smoothing: 1, // locked to the scroll
    onDraw,
  });

  // Scroll → progress, backwards: 1 (covered) with the section's top at the window's top, 0 (the mark) once the
  // pinned stretch has scrolled by
  const fwd = () => clamp01(-section.getBoundingClientRect().top / Math.max(section.offsetHeight - innerHeight, 1));
  const update = () => {
    const f = fwd();
    loom.seek(1 - clamp01(f / MARK_AT));
  };
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);

  // The roles section comes up under the mark: its heading ends up GAP px below the mark's bottom edge. The mark
  // is Figma's 61 × 43 in a 797 × 498 frame covered onto the stage, centred; the roles are pulled up over the end
  // of the pinned stretch by what's left (they're transparent there, so the mark stays visible above them).
  const GAP = 100;
  const rolesEl = document.querySelector('.roles');
  const placeRoles = () => {
    const head = rolesEl?.shadowRoot?.querySelector('.page-title');
    if (!head) return;
    const stage = canvas.getBoundingClientRect();
    const cover = Math.max(stage.width / D.frameW, stage.height / D.frameH);
    const markBottom = stage.height / 2 + (43 / 2) * cover; // from the stage's top
    rolesEl.style.marginTop = '0px';
    const headOffset = head.getBoundingClientRect().top - rolesEl.getBoundingClientRect().top;
    rolesEl.style.marginTop = `${Math.round(markBottom + GAP - headOffset - stage.height)}px`;
  };
  placeRoles();
  addEventListener('resize', placeRoles);
  document.fonts?.ready.then(placeRoles);

  if (!media) return;
  if (media.tagName === 'VIDEO') {
    // a film: redraw every frame while it plays and the hero is on screen
    let on = true;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(section);
    const frame = () => { if (on && !media.paused) update(); (media.requestVideoFrameCallback ? media.requestVideoFrameCallback(frame) : requestAnimationFrame(frame)); };
    media.requestVideoFrameCallback ? media.requestVideoFrameCallback(frame) : requestAnimationFrame(frame);
    media.play?.().catch(() => {});
  } else if (!ready()) {
    media.addEventListener('load', update, { once: true });
  }
}
