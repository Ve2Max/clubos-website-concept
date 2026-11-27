// Scroll motion for the team-style pages (team.html, clubs.html; styles: team.css):
// the heading drifts slower than the page, the hero frame grows slightly as you scroll (with the hero
// photo panning inside it, if there is one: on the clubs page the frame holds the map), and the
// cards' photos drift inside their frames. Off with reduced motion.
export function initPageMotion() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // ── Parallax ──────────────────────────────────────────────────────────────
  // Each element moves by (its distance from the viewport centre) × speed. Distances come from
  // layout positions (offsetTop), which transforms don't change, so there's no feedback jitter.
  const head = document.querySelector('.tm-head');
  const heroImg = document.querySelector('.tm-hero-img');
  const heroFrame = document.querySelector('.tm-hero-frame');
  const cards = [...document.querySelectorAll('.tm-card')];
  const HERO_FROM = 1;    // hero photo starts at its laid-out size…
  const HERO_TO = 1.05;   // …and grows slightly past it as you scroll
  const PORTRAIT_SHIFT = 5;   // % of photo height the portraits drift inside their frames
  const COL_SPEED = [0, 0, 0]; // column parallax switched off: the grid scrolls as one (set e.g. [0, -0.07, 0.035] to stagger)

  let items = [];
  function docTop(el) { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; }
  function measure() {
    const cols = getComputedStyle(document.querySelector('.tm-grid')).gridTemplateColumns.split(' ').length;
    items = cards.map((el, i) => {
      const ph = el.querySelector('.tm-ph');
      return { el, top: docTop(el), h: el.offsetHeight, speed: cols === 3 ? COL_SPEED[i % 3] : 0,
        photo: ph?.querySelector('.tm-photo'), phTop: ph ? docTop(ph) : 0, phH: ph?.offsetHeight || 0 };
    });
  }
  function frame() {
    const y = scrollY, mid = y + innerHeight / 2;
    if (head) head.style.transform = `translate3d(0, ${(y * 0.18).toFixed(1)}px, 0)`;
    if (heroFrame) {
      const c = docTop(heroFrame) + heroFrame.offsetHeight / 2;
      const p = Math.max(-1, Math.min(1, (mid - c) / innerHeight)); // -1 … 1 as it crosses the screen
      if (heroImg) heroImg.style.transform = `translate3d(0, ${(p * -5).toFixed(2)}%, 0) scale(1.12)`;
      // Grow: the frame scales linearly from HERO_FROM to HERO_TO over the whole time it's on screen
      // (from the top of the page until its bottom edge leaves the top of the viewport), so it never
      // visibly stops growing. Anchored at the bottom (the caption stays attached); the corner radius
      // is divided by the scale so it stays 24 px on screen.
      const reach = Math.max(1, docTop(heroFrame) + heroFrame.offsetHeight);
      const t = Math.min(1, Math.max(0, y / reach));
      const s = HERO_FROM + (HERO_TO - HERO_FROM) * t;
      heroFrame.style.transform = `scale(${s.toFixed(4)})`;
      heroFrame.style.borderRadius = `${(24 / s).toFixed(2)}px`;
    }
    for (const it of items) {
      it.el.style.transform = it.speed ? `translate3d(0, ${((it.top + it.h / 2 - mid) * it.speed).toFixed(1)}px, 0)` : '';
      // Portrait parallax: the photo drifts inside its frame as the card crosses the screen
      if (it.photo) {
        const p = Math.max(-1, Math.min(1, (mid - (it.phTop + it.phH / 2)) / innerHeight));
        it.photo.style.translate = `0 ${(p * -PORTRAIT_SHIFT).toFixed(2)}%`;
      }
    }
  }
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } };
  function setup() {
    removeEventListener('scroll', onScroll);
    if (reduce.matches) {
      [head, heroImg, heroFrame, ...cards].forEach(el => el && (el.style.transform = ''));
      if (heroFrame) heroFrame.style.borderRadius = '';
      cards.forEach(c => { const ph = c.querySelector('.tm-photo'); if (ph) ph.style.translate = ''; });
      return;
    }
    measure(); frame();
    addEventListener('scroll', onScroll, { passive: true });
  }
  addEventListener('resize', () => { measure(); frame(); });
  addEventListener('load', setup);
  reduce.addEventListener('change', setup);
  setup();

}
