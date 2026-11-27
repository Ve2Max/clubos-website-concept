// Page cover: every page starts hidden under a flat cover in the page colour (--cover on <html>, else the grey), which fades away only once
// everything on the first screen is ready (web fonts, the images and canvases already in the page, a couple
// of painted frames so the scripted parts have drawn), so nothing pops in piece by piece. Following a link
// to another page of the site fades the cover back in first, so pages cross through the same colour.
// Loaded as a plain, blocking script at the top of <head>, so the cover is there before the first paint.
(function () {
  var root = document.documentElement;
  // Pages with their own background colour (the rest are the grey): the cover takes the page's colour on arrival,
  // and the destination's colour on the way out, so the crossing never flashes another colour
  var COVERS = { '/manifesto.html': '#8fc5ff', '/manifesto': '#8fc5ff' };
  var coverFor = function (path) { return COVERS[path] || '#d9d9d9'; };
  root.style.setProperty('--cover', coverFor(location.pathname));
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FADE = reduced ? 0 : 450, LEAVE = reduced ? 0 : 280, MAX_WAIT = 3000;

  var css = document.createElement('style');
  css.textContent =
    'html::before{content:"";position:fixed;inset:0;z-index:2147483600;background:var(--cover,#d9d9d9);pointer-events:none;' +
    'opacity:1;transition:opacity ' + FADE + 'ms cubic-bezier(.2,.7,.2,1)}' +
    'html.pc-ready::before{opacity:0}' +
    'html.pc-leaving::before{opacity:1;transition-duration:' + LEAVE + 'ms}';
  document.head.appendChild(css);

  var shown = false;
  function reveal() {
    if (shown) return; shown = true;
    // two frames: let the page's scripts paint their first frame under the cover before it lifts
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('pc-ready'); }); });
  }
  var loaded = new Promise(function (res) {
    if (document.readyState === 'complete') res(); else addEventListener('load', res, { once: true });
  });
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.all([loaded, fonts]).then(reveal, reveal);
  setTimeout(reveal, MAX_WAIT); // never keep a page hidden for long, whatever is still loading

  // Coming back with the browser's back/forward cache: show straight away
  addEventListener('pageshow', function (e) { if (e.persisted) { root.style.setProperty('--cover', coverFor(location.pathname)); root.classList.remove('pc-leaving'); root.classList.add('pc-ready'); } });

  // Leaving for another page of the site: fade the cover in, then go
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download') || a.dataset.yt) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page (#anchors)
    e.preventDefault();
    root.style.setProperty('--cover', coverFor(url.pathname)); // fade into where we're going
    root.classList.add('pc-leaving');
    setTimeout(function () { location.href = url.href; }, LEAVE);
  });
})();
