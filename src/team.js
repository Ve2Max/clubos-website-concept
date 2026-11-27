// Team page (team.html): the shared menu, scroll parallax and the newsletter form.
import { initNav } from './ui/nav.js';
import { initPageMotion } from './ui/pageMotion.js';
import { createGlassLayer } from './glass/GlassLayer.js';
import { loadSaved as loadGlass, applyCssVars as applyGlassCss } from './glass/settings.js';
import { initNewsletter } from './ui/newsletter.js';

initNav();

// Heading drift, hero growth and portrait parallax: shared with the clubs page (ui/pageMotion.js)
initPageMotion();

initNewsletter();

// Glass: the menu's Book a Demo button (same plain glass as on the home page), and the
// glass controls (▭ button / G), on every page like the dev menu.
const glassSettings = loadGlass();
applyGlassCss(glassSettings);
const glass = createGlassLayer({ chart: null, settings: glassSettings, stage: null });
glass?.add(document.querySelector('.nav-cta'), { group: 'buttons' });
