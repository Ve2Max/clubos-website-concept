// Clubs page (clubs.html): the clubs running on ClubOS, as cards and as markers on a map.
// Club content from the ClubOS design (Clubs.dc.html). The map is Leaflet (loaded in clubs.html)
// on Esri's World Light Gray base (no labels, no key needed), toned to the site's greys in clubs.css.
// Hovering a card lights up its marker and the other way round; clicking a marker brings its card
// into view, and clicking a card's crest flies the map to the club.
import { initNav } from './ui/nav.js';
import { initPageMotion } from './ui/pageMotion.js';
import { createGlassLayer } from './glass/GlassLayer.js';
import { loadSaved as loadGlass, applyCssVars as applyGlassCss } from './glass/settings.js';

import almerePhoto from './assets/clubs/photos/almere-city.jpg';
import dordrechtPhoto from './assets/clubs/photos/fc-dordrecht.jpg';
import cascaisPhoto from './assets/clubs/photos/cascais.jpg';
import proPatriaPhoto from './assets/clubs/photos/pro-patria.jpg';
import almereCrest from './assets/clubs/almere-city.png';
import dordrechtCrest from './assets/clubs/fc-dordrecht.png';
import cascaisCrest from './assets/clubs/cascais-crest.png';
import proPatriaCrest from './assets/clubs/pro-patria.png';
import endPhotoUrl from './assets/newsletter block/sven-dude2.webp'; // the closing block's photo

const CLUBS = [
  { id: 'almere', name: 'Almere City FC', place: 'Almere, Netherlands', ll: [52.3757, 5.2199], nudge: [16, -16],
    photo: almerePhoto, pos: '50% 30%', crest: almereCrest,
    alt: 'Almere City FC players celebrating a goal at the Yanmar Stadion',
    text: 'Started in 2001 as FC Omniworld and reached the Eredivisie for the first time in 2023. ClubOS’s first design partner, using it in every football department since January 2026, from the U13s to the first team.',
    founded: '2001', stadium: 'Yanmar Stadion' },
  { id: 'dordrecht', name: 'FC Dordrecht', place: 'Dordrecht, Netherlands', ll: [51.8085, 4.6825], nudge: [-16, 16],
    photo: dordrechtPhoto, pos: '50% 25%', crest: dordrechtCrest,
    alt: 'FC Dordrecht players celebrating with their supporters after an away win at Jong PSV',
    text: 'Founded in 1883 as a cricket club, it took up football in 1891 and returned to the Eredivisie in 2014 after 19 years away. ClubOS’s second design partner, with the youth academy onboarding first.',
    founded: '1883', stadium: 'Stadion Krommedijk' },
  { id: 'cascais', name: 'Cascais SC', place: 'Cascais, Portugal', ll: [38.7008, -9.4185],
    photo: cascaisPhoto, pos: '50% 40%', crest: cascaisCrest,
    alt: 'Cascais players celebrating a goal',
    text: 'Founded in 1915 under the motto “Arte, Sport e Bem”. Its football club, part of the Estrella Football Group, is building a professional structure in Cascais to reach Liga 2 by 2030.',
    founded: '1915', stadium: 'Estádio Municipal Dramático de Cascais' },
  { id: 'propatria', name: 'Pro Patria Calcio', place: 'Busto Arsizio, Italy', ll: [45.6152, 8.8566],
    photo: proPatriaPhoto, pos: '50% 35%', crest: proPatriaCrest,
    alt: 'Pro Patria team photo at the Stadio Carlo Speroni',
    text: 'Founded in 1919 by Aurora’s former captain on his return from the war. I Tigrotti played 14 seasons in Serie A, the last in 1955–56, and now compete in Italy’s professional third tier.',
    founded: '1919', stadium: 'Stadio Carlo Speroni' },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Cards: photo on the left; on the right the name with the crest top right, the location / founded /
// stadium table under the name, and the short history at the foot, level with the bottom of the photo
const grid = document.getElementById('cl-grid');
grid.innerHTML = CLUBS.map((c) => `
  <li class="tm-card cl-card" id="club-${c.id}" data-id="${c.id}">
    <div class="tm-ph"><img class="tm-photo" src="${c.photo}" alt="${esc(c.alt)}" style="object-position:${c.pos}" loading="lazy" /></div>
    <div class="cl-info">
      <div class="cl-headrow">
        <h2 class="cl-name">${esc(c.name)}</h2>
        <button type="button" class="cl-crest" data-id="${c.id}" aria-label="Show ${esc(c.name)} on the map"><img src="${c.crest}" alt="" /></button>
      </div>
      <dl class="cl-meta">
        <div><dt>Location</dt><dd>${esc(c.place)}</dd></div>
        <div><dt>Founded</dt><dd>${esc(c.founded)}</dd></div>
        <div><dt>Stadium</dt><dd>${esc(c.stadium)}</dd></div>
      </dl>
      <p class="cl-text">${esc(c.text)}</p>
    </div>
  </li>`).join('');
const cardOf = (id) => grid.querySelector(`.cl-card[data-id="${id}"]`);

// Map
const mapEl = document.getElementById('cl-map');
const markers = new Map();
if (window.L) {
  const map = L.map(mapEl, { zoomControl: false, scrollWheelZoom: false, attributionControl: true, worldCopyJump: false, zoomSnap: 1 }); // whole zoom steps: tiles at 1:1, no hairline seams
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16, attribution: 'Tiles © <a href="https://www.esri.com">Esri</a>, HERE, Garmin, © OpenStreetMap contributors',
  }).addTo(map);
  const bounds = L.latLngBounds(CLUBS.map((c) => c.ll));
  const fit = () => map.fitBounds(bounds, { padding: innerWidth < 600 ? [40, 40] : [70, 70], maxZoom: 6 }); // tight on the four clubs
  fit();
  for (const c of CLUBS) {
    // nudge: a small pixel offset for clubs that sit on top of each other when zoomed out (Almere, Dordrecht)
    const [nx, ny] = c.nudge || [0, 0];
    const icon = L.divIcon({ className: 'cl-pin', iconSize: [52, 52], iconAnchor: [26 - nx, 26 - ny],
      html: `<span class="cl-pin-in"><img src="${c.crest}" alt="" /></span><span class="cl-pin-name">${esc(c.name)}</span>` });
    const m = L.marker(c.ll, { icon, title: c.name, keyboard: true, riseOnHover: true }).addTo(map);
    m.on('click', () => { cardOf(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); flash(c.id); });
    markers.set(c.id, m);
  }
  // Crest on a card: fly the map to that club
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.cl-crest'); if (!b) return;
    const c = CLUBS.find((x) => x.id === b.dataset.id);
    mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    map.flyTo(c.ll, 11, { duration: 1.2 });
    light(c.id, true); setTimeout(() => light(c.id, false), 2400);
  });
  mapEl.addEventListener('dblclick', fit);
  addEventListener('resize', () => map.invalidateSize());
  setTimeout(() => map.invalidateSize(), 0);
} else {
  mapEl.hidden = true; // no Leaflet (offline): the cards alone
}

// Card ↔ marker highlight
function light(id, on) {
  cardOf(id)?.classList.toggle('is-lit', on);
  markers.get(id)?.getElement()?.classList.toggle('is-lit', on);
}
function flash(id) { light(id, true); setTimeout(() => light(id, false), 1600); }
grid.querySelectorAll('.cl-card').forEach((card) => {
  card.addEventListener('mouseenter', () => markers.get(card.dataset.id)?.getElement()?.classList.add('is-lit'));
  card.addEventListener('mouseleave', () => markers.get(card.dataset.id)?.getElement()?.classList.remove('is-lit'));
});

initNav();
initPageMotion(); // heading drift, the map frame growing as you scroll, photo parallax (as on the team page)

// Glass: the menu's and the closing Book a Demo buttons, and the glass controls (▭ / G)
const glassSettings = loadGlass();
applyGlassCss(glassSettings);
const glass = createGlassLayer({ chart: null, settings: glassSettings, stage: null });
glass?.add(document.querySelector('.nav-cta'), { group: 'buttons' });
glass?.add(document.querySelector('.cl-end .btn-pill'), { group: 'buttons' });

// Closing block: the photo drifts inside its rounded frame, slower than the page (as the home newsletter): from
// 12% of the block's height higher (entering at the bottom) to 12% lower (leaving at the top); 14% spare each side.
// Painted into a canvas, cover, with a dark wash for the white heading, so the glass button refracts what's shown.
const endBlock = document.querySelector('.cl-end-block'), endBg = endBlock?.querySelector('.cl-end-bg');
const endPhoto = new Image();
const drawEndPhoto = () => {
  if (!endBg || !endPhoto.naturalWidth) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(endBg.clientWidth * dpr), h = Math.round(endBg.clientHeight * dpr);
  if (!w || !h) return;
  endBg.width = w; endBg.height = h;
  const c = endBg.getContext('2d');
  const k = Math.max(w / endPhoto.naturalWidth, h / endPhoto.naturalHeight);
  const dw = endPhoto.naturalWidth * k, dh = endPhoto.naturalHeight * k;
  c.drawImage(endPhoto, (w - dw) / 2, (h - dh) * 0.4, dw, dh);
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
  g.addColorStop(0, 'rgb(18 18 15 / .58)'); g.addColorStop(1, 'rgb(18 18 15 / .32)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  glass?.invalidate(200);
};
const endParallax = () => {
  if (!endBg || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = endBlock.getBoundingClientRect();
  if (r.bottom < -200 || r.top > innerHeight + 200) return;
  const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2)));
  endBg.style.transform = `translate3d(0, ${(-p * 0.12 * r.height).toFixed(1)}px, 0)`;
  glass?.invalidate(150);
};
if (endBg) {
  endPhoto.onload = () => { drawEndPhoto(); endParallax(); };
  endPhoto.src = endPhotoUrl;
  addEventListener('resize', () => { drawEndPhoto(); endParallax(); });
  addEventListener('scroll', () => requestAnimationFrame(endParallax), { passive: true });
}
