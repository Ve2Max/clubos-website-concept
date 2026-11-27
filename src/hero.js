// Home page: the hero (src/hero/heroB.js: a full-screen film run through the ClubOS transition loom, folding
// down into the mark), then the roles, the home sections, the stories and the newsletter.

import { initHeroB } from './hero/heroB.js';
import { createGlassLayer } from './glass/GlassLayer.js';
import { loadSaved as loadGlass, applyCssVars as applyGlassCss } from './glass/settings.js';
import { mountRoles } from './roles/roles.js';
import { initNav } from './ui/nav.js';
import { initNewsletter } from './ui/newsletter.js';
import { initVideoPlayer } from './ui/videoPlayer.js';
import { initHomeSections } from './home-sections.js';
import newsPhotoUrl from './assets/newsletter block/staff-1.webp'; // the newsletter block's photo

// Glass on the hero's Book a Demo button, the menu's, and the newsletter's email field
const glassSettings = loadGlass();
applyGlassCss(glassSettings);
const glass = createGlassLayer({ chart: null, settings: glassSettings, stage: null });
glass?.add(document.querySelector('.hero-b .btn-demo'), { group: 'buttons' });
glass?.add(document.querySelector('.nav-cta'), { group: 'buttons' }); // the menu's Book a Demo, same glass
glass?.add(document.querySelector('.tm-news-form'), { group: 'newsletter' }); // the email field's pill

// The newsletter block's photo drifts inside its rounded frame, slower than the page: from 12% of the
// block's height higher (block entering at the bottom) to 12% lower (leaving at the top); 14% spare each side
const newsBlock = document.querySelector('.news-block'), newsBg = newsBlock?.querySelector('.news-bg');
// The photo is painted into a canvas (cover, focused 62% down, with the dark wash that keeps the text
// readable baked in), so the glass email field refracts exactly what's on screen
const newsPhoto = new Image();
const drawNewsPhoto = () => {
  if (!newsBg || !newsPhoto.naturalWidth) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(newsBg.clientWidth * dpr), h = Math.round(newsBg.clientHeight * dpr);
  if (!w || !h) return;
  newsBg.width = w; newsBg.height = h;
  const c = newsBg.getContext('2d');
  const k = Math.max(w / newsPhoto.naturalWidth, h / newsPhoto.naturalHeight);
  const dw = newsPhoto.naturalWidth * k, dh = newsPhoto.naturalHeight * k;
  c.drawImage(newsPhoto, (w - dw) / 2, (h - dh) * 0.62, dw, dh);
  // the wash, over the block's visible part (the canvas is 128% of the block: 14% spare each side)
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
  g.addColorStop(0, 'rgb(18 18 15 / .62)'); g.addColorStop(1, 'rgb(18 18 15 / .35)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  glass?.invalidate(200);
};
if (newsBg) { newsPhoto.onload = drawNewsPhoto; newsPhoto.src = newsPhotoUrl; addEventListener('resize', drawNewsPhoto); }
const newsParallax = () => {
  if (!newsBg || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = newsBlock.getBoundingClientRect();
  if (r.bottom < -200 || r.top > innerHeight + 200) return;
  const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2)));
  newsBg.style.transform = `translate3d(0, ${(-p * 0.12 * r.height).toFixed(1)}px, 0)`; // against the scroll: the photo lags behind the page
  glass?.invalidate(150); // the glass refracts the photo where it now is
};

let seen = '';
const loop = () => {
  const key = `${scrollY}|${innerWidth}|${innerHeight}`;
  if (key !== seen) { seen = key; newsParallax(); }
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);

// Top menu
initNav();
initNewsletter();
initHomeSections();
initVideoPlayer(); // the stories section's films play in the page, as on the Journal

// Below the hero: what ClubOS means for each role, introduced straight under the mark the hero ends on
const roles = mountRoles(document.querySelector('.roles'), { invalidate: (ms) => glass?.invalidate(ms), beforeFrame: glass?.beforeFrame,
  title: 'Introducing ClubOS.<br>A unified platform built for<br>every role at your club', sub: false });
initHeroB({ glass }); // after the roles: it places them under the hero's mark
glass?.add(roles.glassPill, { group: 'roles', fixed: { lens: 0 } }); // no magnify: the role stays pixel-sharp, // the glass pill over the picked role,
glass?.addScene(...roles.rowItems);                                        // refracting the row under it
