// In-page video player (journal.html, index.html; styles: src/journal.css .jr-player). A film card's link
// points at YouTube (works without JS / in a new tab); a normal click on any a[data-yt] opens it here instead,
// in a youtube-nocookie embed, over the page, which dims and blurs like it does behind the megamenu. The
// iframe is removed on close so playback stops. The overlay markup is created if the page doesn't have it.
const MARKUP = `
  <div class="jr-player-box">
    <div class="jr-player-frame" id="jr-player-frame"></div>
    <div class="jr-player-bar">
      <p class="jr-player-title" id="jr-player-title"></p>
      <button type="button" class="jr-player-close" id="jr-player-close" aria-label="Close video"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
  </div>`;

export function initVideoPlayer() {
  let player = document.getElementById('jr-player');
  if (!player) {
    player = Object.assign(document.createElement('div'), { className: 'jr-player', id: 'jr-player', hidden: true, innerHTML: MARKUP });
    player.setAttribute('role', 'dialog'); player.setAttribute('aria-modal', 'true'); player.setAttribute('aria-labelledby', 'jr-player-title');
    document.body.append(player);
  }
  const frame = document.getElementById('jr-player-frame');
  const title = document.getElementById('jr-player-title');
  const closeBtn = document.getElementById('jr-player-close');
  let lastFocus = null;

  function open(id, name) {
    lastFocus = document.activeElement;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${name.replace(/"/g, '&quot;')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    title.textContent = name;
    player.hidden = false;
    document.documentElement.classList.add('jr-locked');
    requestAnimationFrame(() => player.classList.add('is-open'));
    closeBtn.focus();
  }
  function close() {
    player.classList.remove('is-open');
    document.documentElement.classList.remove('jr-locked');
    const done = () => { player.hidden = true; frame.innerHTML = ''; };
    matchMedia('(prefers-reduced-motion: reduce)').matches ? done() : setTimeout(done, 250);
    lastFocus?.focus();
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-yt]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let modified clicks open YouTube
    e.preventDefault();
    open(a.dataset.yt, a.dataset.title);
  });
  closeBtn.addEventListener('click', close);
  player.addEventListener('click', (e) => { if (!e.target.closest('.jr-player-frame, .jr-player-close')) close(); });
  document.addEventListener('keydown', (e) => {
    if (player.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // keep focus inside the dialog: the video and the close button
      const f = [frame.querySelector('iframe'), closeBtn].filter(Boolean);
      const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
}
