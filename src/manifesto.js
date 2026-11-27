// Manifesto page (manifesto.html): just the shared menu; the page itself is static markup.
import { initNav } from './ui/nav.js';
import { createGlassLayer } from './glass/GlassLayer.js';
import { loadSaved as loadGlass, applyCssVars as applyGlassCss } from './glass/settings.js';

initNav();

// Glass: the menu's Book a Demo button (same plain glass as on the home page), and the
// glass controls (▭ button / G), on every page like the dev menu.
const glassSettings = loadGlass();
applyGlassCss(glassSettings);
const glass = createGlassLayer({ chart: null, settings: glassSettings, stage: null });
glass?.add(document.querySelector('.nav-cta'), { group: 'buttons' });
document.querySelectorAll('.mf-cta').forEach((b) => glass?.add(b, { group: 'buttons' })); // Book a Demo under the closing line
