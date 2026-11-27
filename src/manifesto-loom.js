// Manifesto page: the transition loom after the body text (public/transition-loom.js, a plain
// script loaded before this one: window.TransitionLoom / TRANSITION_LOOM_DEFAULTS), and the closing line that
// fades in after the transition.

const section = document.getElementById('tl');
const loom = new window.TransitionLoom(document.getElementById('tl-canvas'), {
  background: null,      // transparent: the shapes straight on the page's grey
  foreground: '#12120f', // the ClubOS ink
});
// Scroll → progress. The animation starts while the mark is still coming up the screen (before the canvas
// pins): at 0 when the section's top is LEAD × the window height below the window's top (the mark, at the
// middle of the canvas, is then that much lower than where it pins), and reaches 1 when the pinned stretch ends.
const LEAD = 0.35;
const lead = () => LEAD * innerHeight;
const span = () => lead() + Math.max(section.offsetHeight - innerHeight, 1);
const progressAt = () => (lead() - section.getBoundingClientRect().top) / span();
const scrollFor = (p) => section.offsetTop - lead() + Math.min(Math.max(p, 0), 1) * span();
const measure = () => loom.setScroll(progressAt());
loom.seek(Math.min(Math.max(progressAt(), 0), 1));
addEventListener('scroll', measure, { passive: true });
addEventListener('resize', measure);

// Closing line: fades up once it comes into view after the transition
const end = document.querySelector('.mf-end');
new IntersectionObserver(([e]) => { if (e.isIntersecting) end.classList.add('is-in'); }, { threshold: 0.5 }).observe(end);

// Dark ending: the closing line appears in the middle of the screen as the transition nears its end, letter by
// letter, scrubbed by the scroll: from LINE_FROM to LINE_TO of the progress, each letter fading in a little after
// the one before. Letters are grouped per word so lines only break between words.
const LINE_FROM = 0.8, LINE_TO = 0.97, LINE_SPREAD = 0.7; // spread: share of the window between first and last letter
const line = document.getElementById('tl-line');
const cta = document.getElementById('tl-cta');
line.setAttribute('aria-label', line.textContent.replace(/\u00a0/g, ' '));
// each <br>-separated line of the markup keeps its break; within a line, words → letter spans
const tmp = document.createElement('div');
line.innerHTML = line.innerHTML.split(/<br\s*\/?>/i).map((part) => {
  tmp.innerHTML = part;
  return tmp.textContent.trim().split(' ').map((w) => `<span class="tl-w" aria-hidden="true">${[...w].map((c) => `<span class="tl-l">${c === '\u00a0' ? '&nbsp;' : c}</span>`).join('')}</span>`).join(' ');
}).join('<br>');
const letters = [...line.querySelectorAll('.tl-l')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const stage = section.querySelector('.tl-stage');
const NAV_FROM = 0.4, NAV_TO = 0.6; // where in the transition the menu bar blends to black
const drawLine = () => {
  // once the dark has settled, the stage itself is filled dark too: the canvas's anti-aliased edge rows otherwise
  // let a hairline of the page grey through where it meets the footer
  const settled = document.documentElement.dataset.ending === 'dark' && loom.state().progress > 0.85;
  stage.classList.toggle('is-dark', settled);
  // …and painted into the glass's scene, so the Book a Demo glass over it refracts the dark, not the page's blue
  stage.toggleAttribute('data-scene-fill', settled);
  // the menu bar turns black too, following the scroll: it blends from the page grey to the transition's black
  // between NAV_FROM and NAV_TO of the progress (centred on half way), and stays black over the dark footer
  const dark = document.documentElement.dataset.ending === 'dark';
  const nd = dark ? Math.min(Math.max((loom.state().progress - NAV_FROM) / (NAV_TO - NAV_FROM), 0), 1) : 0;
  document.documentElement.style.setProperty('--nd', nd.toFixed(3));
  document.documentElement.classList.toggle('nav-dark', nd > 0);
  // the text can't follow the same blend (it would pass through the bar's own grey half way and vanish), so it
  // flips light/dark at the middle of the blend, with a short fade
  document.documentElement.classList.toggle('nav-dark-ink', nd >= 0.5);
  if (document.documentElement.dataset.ending !== 'dark') return;
  // past the end the canvas scrolls away to the footer, but the line stays put in the middle of the window
  const fixed = section.getBoundingClientRect().bottom < innerHeight;
  line.classList.toggle('is-fixed', fixed); cta.classList.toggle('is-fixed', fixed);
  const q = Math.min(Math.max((loom.state().progress - LINE_FROM) / (LINE_TO - LINE_FROM), 0), 1);
  const n = letters.length, each = 1 - LINE_SPREAD;
  // the Book a Demo button fades in once the line has come in
  const c = reduced.matches ? (q >= 1 ? 1 : 0) : Math.min(Math.max((q - 0.85) / 0.15, 0), 1);
  cta.style.opacity = c.toFixed(3); cta.style.pointerEvents = c > 0.5 ? 'auto' : 'none';
  letters.forEach((l, i) => {
    const a = reduced.matches ? (q > 0 ? 1 : 0) : Math.min(Math.max((q - (i / Math.max(n - 1, 1)) * LINE_SPREAD) / each, 0), 1);
    l.style.opacity = a.toFixed(3);
  });
};
addEventListener('scroll', () => requestAnimationFrame(drawLine), { passive: true });
addEventListener('resize', drawLine);

// The look: the dark ending, with the transition's other settings at their defaults (transition-loom.js);
// the pinned stretch is LENGTH × the window's height
const LENGTH = 500;
document.documentElement.dataset.ending = 'dark';
section.style.height = LENGTH + 'vh';
loom.set({ ending: 'dark' });
measure();
drawLine();
