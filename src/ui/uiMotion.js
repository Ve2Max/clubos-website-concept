// One motion language for the UI windows on the home page (roles view, updates, calendar, rooms):
// content rises and fades in with a short stagger when a window first comes into view and whenever
// it switches (role, update, room). Data visuals grow (bars) or pop (squares, events). The keyframes
// live in each stylesheet that hosts a window (home-sections.css, roles/roles.css: ui-in, ui-grow, ui-pop).
// Off with reduced motion.

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.2, .7, .2, 1)';

/** Replay an entrance on each element, one after another (ms between them). */
export function stagger(els, { step = 60, delay = 0, name = 'ui-in', dur = 500 } = {}) {
  if (reduced()) return;
  const list = [...els].filter(Boolean);
  if (!list.length) return;
  list.forEach((el) => { el.style.animation = 'none'; });
  void list[0].offsetWidth; // restart them all with one reflow, not one per element
  list.forEach((el, i) => { el.style.animation = `${name} ${dur}ms ${EASE} ${delay + i * step}ms both`; });
}

/** Call fn when el comes into view (once, or every time it comes back with repeat). */
export function whenSeen(el, fn, { repeat = false, threshold = 0.3, onLeave } = {}) {
  if (!('IntersectionObserver' in window)) { fn(); return; }
  let inView = false;
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (e.isIntersecting && !inView) { inView = true; fn(); if (!repeat) io.disconnect(); }
      else if (!e.isIntersecting && inView) { inView = false; onLeave?.(); }
    }
  }, { threshold });
  io.observe(el);
}
