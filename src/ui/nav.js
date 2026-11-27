// Module tags from the Figma file (node 99:208), shown on each module's preview image
import tagCoaching from '../assets/tags/coaching.svg';
import tagMedical from '../assets/tags/medical.svg';
import tagAnalysis from '../assets/tags/analysis.svg';
import tagPlayer from '../assets/tags/player.svg';
import tagPerformance from '../assets/tags/performance.svg';
import tagRecruitment from '../assets/tags/recruitment.svg';
import tagAdmin from '../assets/tags/admin.svg';
import tagCommercial from '../assets/tags/commercial.svg';
import tagMarketing from '../assets/tags/marketing.svg';
// each tag's colour (its fill in the Figma SVG): the preview image takes a slightly darker shade of it
const TAG_COLOUR = { coaching: '#B769FF', medical: '#FE4050', analysis: '#0BE3E4', players: '#8891F3', performance: '#FF7000',
  recruitment: '#D6D202', admin: '#02CC5A', commercial: '#C771A7', marketing: '#FF8282' };
const MODULE_TAG = { coaching: tagCoaching, medical: tagMedical, analysis: tagAnalysis, players: tagPlayer, performance: tagPerformance,
  recruitment: tagRecruitment, admin: tagAdmin, commercial: tagCommercial, marketing: tagMarketing };

// Top menu (index.html, styles in src/nav.css). Platform opens the megamenu: on hover with a
// mouse (with a short grace period when leaving), on click or Enter/Space otherwise; Escape,
// a click outside or the scrim closes it. Below 860px the burger opens a full-screen menu,
// where Platform expands in place.
// Megamenu: a line on each module, shown with its preview on hover (text from the ClubOS homepage design)
const MODULE_TEXT = {
  hub: 'Your working day at the club in one place: what’s on, what’s owed, and who said what. It shows you the whole club without letting you run other people’s departments from it.',
  recruitment: 'Every player the club has ever watched, held as the club’s own record rather than anyone’s personal notes. Reports, watchlists and the pipeline from first sighting to signing stay with the club, whoever filed them.',
  admin: 'The record every other module reads from: who’s who and how the club is structured, kept by the club rather than a supplier.',
  performance: 'Load, readiness and availability as one connected picture, so the staff plan the week around how players actually are and see an absence coming instead of discovering it on the morning.',
  medical: 'The medical staff’s assessments, treatment and availability on the same player record, so when the physio sets a player to Modified, the coaches and performance staff see it straight away.',
  coaching: 'The coach’s week end to end. Periodisation, session delivery, selection and match review, all tied to the club’s playing philosophy rather than living in a folder of documents.',
  players: 'Where a player runs their club life: their day, their body, their development and their paperwork. It’s also where they give the staff planning around them an honest signal back.',
  analysis: 'Turns what the specialist tools already produce into the opponent picture, the match review and the football data the whole club acts on, without replacing the tools your analysts already know.',
  marketing: 'Turn what happens on the pitch into content and campaigns, with the season calendar, the club’s media and the audience you’re lawfully allowed to contact in one working surface.',
  commercial: 'Partnerships, hospitality, ticketing and retail tracked against the sporting plan, so commercial commitments and football decisions stop being made in separate rooms.',
};

export function initNav(nav = document.querySelector('.nav')) {
  if (!nav) return;
  const trigger = nav.querySelector('.nav-trigger');
  const mega = nav.querySelector('.nav-mega');
  const burger = nav.querySelector('.nav-burger');
  const scrim = nav.nextElementSibling?.classList.contains('nav-scrim') ? nav.nextElementSibling : null;
  const narrow = matchMedia('(max-width: 860px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let closeTimer = 0;

  const alignMega = () => nav.style.setProperty('--mega-x', `${trigger.getBoundingClientRect().left + 12}px`);
  const setMega = (open) => {
    clearTimeout(closeTimer);
    if (open) alignMega();
    nav.classList.toggle('is-mega', open);
    trigger.setAttribute('aria-expanded', open);
  };
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (!open) setMega(false);
  };

  trigger.addEventListener('click', () => setMega(!nav.classList.contains('is-mega')));
  // Hover (desktop mouse only): open on entering the trigger, close shortly after leaving the menu
  trigger.addEventListener('pointerenter', () => { if (hover.matches && !narrow.matches) setMega(true); });
  const leave = () => { if (hover.matches && !narrow.matches) closeTimer = setTimeout(() => setMega(false), 160); };
  const stay = () => clearTimeout(closeTimer);
  for (const el of [trigger, mega]) { el.addEventListener('pointerleave', leave); el.addEventListener('pointerenter', stay); }
  // Other links close it when the mouse moves onto them
  nav.querySelectorAll('.nav-links > .nav-link, .nav-cta, .nav-logo').forEach((el) =>
    el.addEventListener('pointerenter', () => { if (hover.matches && !narrow.matches) setMega(false); }));

  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  scrim?.addEventListener('click', () => setMega(false));
  document.addEventListener('click', (e) => { if (!narrow.matches && !nav.contains(e.target)) setMega(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('is-mega')) { setMega(false); trigger.focus(); }
    else if (nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  // Keyboard: leaving the menu with Tab closes the megamenu
  nav.addEventListener('focusout', (e) => { if (!narrow.matches && !nav.contains(e.relatedTarget)) setMega(false); });
  narrow.addEventListener('change', () => { setMenu(false); setMega(false); });

  // Module previews: hovering or focusing a module shows its image beside the list. The last one
  // stays up while the pointer is elsewhere in the menu; closing the menu clears it.
  const imgs = new Map([...mega.querySelectorAll('.nav-mega-img')].map((el) => [el.dataset.for, el]));
  // the module's tag replaces its name on the placeholder (Hub and People Operations have no tag: name stays)
  imgs.forEach((el, key) => {
    if (TAG_COLOUR[key]) el.style.setProperty('--a', `color-mix(in srgb, ${TAG_COLOUR[key]} 78%, #12120f)`);
    const src = MODULE_TAG[key], name = el.querySelector('span');
    if (!src || !name) return;
    const tag = Object.assign(document.createElement('img'), { className: 'nav-mega-tag', src, alt: name.textContent });
    name.replaceWith(tag);
  });
  // Each module's short description, shown under its image
  const side = document.createElement('div');
  side.className = 'nav-mega-side';
  const previewEl = mega.querySelector('.nav-mega-preview');
  const desc = Object.assign(document.createElement('p'), { className: 'nav-mega-desc' });
  if (previewEl) { previewEl.replaceWith(side); side.append(previewEl, desc); }
  const preview = (key) => {
    if (!imgs.has(key) || mega.dataset.preview === key) return;
    mega.dataset.preview = key;
    imgs.forEach((el, k) => el.classList.toggle('is-on', k === key));
    desc.textContent = MODULE_TEXT[key] || '';
  };
  mega.querySelectorAll('[data-preview]').forEach((el) => {
    el.addEventListener('pointerenter', () => preview(el.dataset.preview));
    el.addEventListener('focus', () => preview(el.dataset.preview));
  });
  new MutationObserver(() => {
    if (nav.classList.contains('is-mega')) return;
    setTimeout(() => {
      if (nav.classList.contains('is-mega')) return;
      delete mega.dataset.preview;
      desc.textContent = '';
      imgs.forEach((el) => el.classList.remove('is-on'));
    }, 400); // after the close transition
  }).observe(nav, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', () => { if (nav.classList.contains('is-mega')) alignMega(); });
}
