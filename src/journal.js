// Journal page (journal.html): shared menu, newsletter form and the in-page video player.
import { initNav } from './ui/nav.js';
import { createGlassLayer } from './glass/GlassLayer.js';
import { loadSaved as loadGlass, applyCssVars as applyGlassCss } from './glass/settings.js';
import { initNewsletter } from './ui/newsletter.js';
import { initVideoPlayer } from './ui/videoPlayer.js';

initNav();
initNewsletter();

// In-page player (shared with the home page's stories)
initVideoPlayer();

// Glass: the menu's Book a Demo button (same plain glass as on the home page), and the
// glass controls (▭ button / G), on every page like the dev menu.
const glassSettings = loadGlass();
applyGlassCss(glassSettings);
const glass = createGlassLayer({ chart: null, settings: glassSettings, stage: null });
glass?.add(document.querySelector('.nav-cta'), { group: 'buttons' });
