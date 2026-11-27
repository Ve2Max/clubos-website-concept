// Below the hero: "Built for every role at your club": a draggable row of roles drives what
// that role sees in ClubOS (three UI blocks on a glass panel, views.js) and its benefit cards below it.
// Mounted in a shadow root so its styles (.card, h1, …) and the site's never mix. Picking a role
// doesn't touch the page address (a role in the address on arrival, e.g. /#players, is picked first).
import css from './roles.css?inline';
import { VIEWS, viewCards } from './views.js';
import { stagger, whenSeen } from '../ui/uiMotion.js';

const MARKUP = `<div class="wrap">
  <div class="top">
    <h1 class="page-title">ClubOS is built for<br>every role at your club</h1>
    <p class="top-sub">ClubOS gives every role at the club its own dedicated tools, built around the work that person actually does.</p>
    <div class="rs" id="rs" role="tablist" aria-label="Roles"><div class="rs-pill" id="rs-pill" aria-hidden="true"></div></div>
  </div>
  <main id="view" aria-live="polite"></main>
</div>`;

export function mountRoles(mountEl, { invalidate, beforeFrame, title, sub = true } = {}) {
  const root = mountEl.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${css}</style>${MARKUP}`;
  if (title) root.querySelector('.page-title').innerHTML = title; // another heading
  if (!sub) root.querySelector('.top-sub')?.remove(); // no line under the heading

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const initials = n => n.replace(/&/g, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  /* ---------- Benefits and quotes, per role (VIEWS[].benefits picks the benefit cards) ---------- */
  const ROLES = [
    { id: 'coaches', name: 'Coaches', intro: 'Head coaches and academy coaches who plan sessions, pick teams and develop players.',
      benefits: [
        ['Every player’s history follows them', 'Injuries, minutes and development notes move up the age groups with the player, so no coach starts from zero.'],
        ['Know who’s available before you plan', 'Availability from medical and performance in one place, ready when you sit down to plan the week.'],
        ['Build a session in a few clicks', 'Pick drills from the club’s own library and the session is ready to share with your staff.'],
        ['Walk into player reviews with the facts', 'Minutes, attendance and development progress are ready, so the conversation backs up what you see.'],
        ['Data that makes sense on the pitch', 'See the numbers in football terms, shaped around how you coach.']
      ],
      quotes: [
        ['He had this knee injury three years ago.', 'Joep Breimer', 'Head of Youth Development, Excelsior', 'On the history that never reaches the next coach'],
        ['Klik, en hij heeft zijn training.', 'Jesse de Boer', 'Academy coaching, Almere City', '“Click, and he’s got his session.”'],
        ['Even though we have the data, the coaches say: we can’t see it on the pitch.', 'Jason Cyrus', 'Head of Recruitment, FC Volendam']
      ] },
    { id: 'team-managers', name: 'Team managers', intro: 'The people who make sure the squad is in the right place, at the right time, with the right kit.',
      benefits: [
        ['Everyone knows where to be and when', 'Matchday and travel timings go out to players, and each player confirms they’ve seen them.'],
        ['Know who’s coming', 'Every RSVP counted in one view, and a “no” always comes with a reason.'],
        ['One schedule for the whole team', 'Changes reach everyone at once, with no copies drifting apart in group chats.']
      ],
      quotes: [] },
    { id: 'performance', name: 'Performance staff', intro: 'Sports scientists and strength & conditioning coaches who keep players fit to train and play.',
      benefits: [
        ['Know who needs attention today, and why', 'Each morning you see which players to look at, with the reasons behind every readiness call.'],
        ['Spend your time on players, not spreadsheets', 'Data from every provider arrives on its own and lands on the right player.'],
        ['Trust what you show a coach', 'If there’s no data, it says “no data”. Never a false green, never a red built on nothing.'],
        ['Work to your own method', 'Your tests, your benchmarks, your load model and your alerts, set up the way you work.'],
        ['Push young players safely', 'Growth-phase flags show when a player can be loaded and when to hold back.'],
        ['Give coaches what they need', 'You choose what coaches see, so they get the useful part rather than everything.'],
        ['The data keeps flowing when you’re away', 'Nothing depends on one person being in the building.']
      ],
      quotes: [
        ['Right now I am the system. If I leave tomorrow, the club loses everything.', 'Job Everink', 'Academy performance, Almere City'],
        ['A player jogging 3.2km requires entirely different recovery than a player sprinting 3.2km.', 'Jeroen de Bruijn', 'U23 physical performance coach, Almere City'],
        ['Other tools bring all this data together and just throw it at you.', 'Benno & Chiel', 'Almere City']
      ] },
    { id: 'medical', name: 'Medical staff', intro: 'Physios and doctors who look after injured players and decide who is fit to play.',
      benefits: [
        ['One morning round for everyone', 'Medical, performance and coaches share one round, and everyone leaves with the same picture.'],
        ['Clear players on evidence, not feel', 'Return-to-play decisions backed by test results you can show a coach, a player or a parent.'],
        ['A medical file that follows the player', 'The full history stays with the player from team to team and season to season.'],
        ['Spot injury patterns early', 'See how and where players get hurt, based on the way you already log injuries.'],
        ['Every team’s availability at a glance', 'Know the fit-to-play share for each team without asking around.'],
        ['Plan individual rehab programmes', 'Build each player’s route back to full training and track it step by step.', true]
      ],
      quotes: [
        ['My ‘fit to play’ decisions are largely subjective.', 'Physio', 'Customer research, name not recorded']
      ] },
    { id: 'recruitment', name: 'Scouts & recruitment', intro: 'Heads of recruitment, scouts and analysts who find the next player.',
      benefits: [
        ['Everything the club knows about a player, in one place', 'Every report, note and viewing on one record, whoever filed it and whenever.'],
        ['Find a player from a phrase you half-remember', 'Search the words in old reports, not just names and fields.'],
        ['Your reports stay with the club', 'What you file keeps counting after you’ve moved on, and nothing is overwritten.'],
        ['See how every signing was decided', 'A clear trail from first viewing to signature, so a flop can be understood rather than argued over.']
      ],
      quotes: [
        ['We record everything. We just don’t have it in one place.', 'Jason Cyrus', 'Head of Recruitment, FC Volendam'],
        ['It has to be club information. If I leave tomorrow, the club still has to have everything.', 'Jason Cyrus', 'Head of Recruitment, FC Volendam']
      ] },
    { id: 'admins', name: 'Club admins', intro: 'Club secretaries, contract and HR administrators who keep the club compliant and running.',
      benefits: [
        ['Never miss a contract deadline', 'Every date is flagged ahead of time, along with what happens if it’s missed.'],
        ['Get registrations right the first time', 'A checklist catches what the federation portal would reject, before you submit.'],
        ['Credentials renewed on time', 'Coaching badges, safeguarding checks and work permits are tracked with reminders before they lapse.'],
        ['The club decides who sees what', 'Contracts and sensitive records reach only the people who need them.'],
        ['One current version of the squad', 'Everyone works from the same squad list, not the latest of many slide decks.']
      ],
      quotes: [
        ['In the last few months I received about 60 PowerPoint versions of our new teams.', 'Almere City', 'Squad-planning session'],
        ['We as a club decide who has the rights.', 'Almere City', 'Squad-planning session'],
        ['Unless we can guarantee not a single person who shouldn’t see it can, they won’t enter any information.', 'Carlos', 'Real Madrid academy (advisory)', 'On contracts']
      ] },
    { id: 'players', name: 'Players', intro: 'First-team and academy players, from the U13s to the senior squad.',
      benefits: [
        ['Your whole club life in one app', 'Schedule, to-dos and deadlines in one place, instead of group chats and printed sheets.'],
        ['Watch your own clips', 'Your match and training footage, and the right clips every time.'],
        ['Talk to staff directly', 'Message the staff and ask for a one-to-one when you need it.'],
        ['Log your gym sessions', 'Follow your programme and record what you did, right after you’ve done it.']
      ],
      quotes: [] },
    { id: 'everyone', name: 'Everyone at the club', intro: 'What every role gets, from the boardroom to the training ground.',
      benefits: [
        ['What one person knows reaches the people who need it', 'Notes on players are shared with the right colleagues and stay when someone leaves.'],
        ['Works in your language', 'Five languages, including the player app.']
      ],
      quotes: [
        ['You use it when you trust what you’re going to find in it.', 'Carlos', 'Real Madrid academy (advisory)'],
        ['In this we trust, because it’s our own data.', 'Benno & Chiel', 'Almere City']
      ] }
  ];

  const view = root.getElementById('view');

  // The picker, then the role's view: its three blocks in an app window
  view.innerHTML = `
      <div class="sections">
        <div id="top-slot"></div>
        <section class="sec" aria-label="See it in action">
        <div class="sv-roles" id="sv-roles"><div class="sv-cards" id="sv-cards"></div></div></section>
      </div>`;
  const svEl = root.getElementById('sv-cards');
  // Roles shown as a bento, and which of their benefits (ROLES[].benefits) fill the extra blocks
  // keyed by the view's id; the numbers pick from the benefits of the role its `benefits` points to
  const BENTO = { coaches: [0, 1, 2], physios: [0, 1, 2], performance: [0, 1, 2], scouts: [0, 1, 2],
    analysts: [0, 1], players: [0, 1, 2], 'technical-directors': [0, 1, 3] };
  root.getElementById('top-slot').replaceWith(root.querySelector('.top'));

  // The role's view comes in like the other UI windows (ui/uiMotion.js): the three blocks one after
  // another, then what's inside them (rows, columns, steps), with bars growing and squares popping in
  let seenView = false;
  function animateView() {
    // In the bento, the blocks come in as a wave from the top left: ordered by distance from that corner
    const pos = (c) => { const r = c.getBoundingClientRect(); return r.top + r.left; };
    const cards = [...svEl.querySelectorAll('.sv-card')].map(c => [c, pos(c)]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
    stagger(cards, { step: 110 });
    cards.forEach((c, i) => {
      const d = 250 + i * 110;
      stagger(c.querySelectorAll('.rv-tl-row, .rv-li, .rv-col, .rv-step, .rv-tr, .rv-hb, .rv-ph-box'), { step: 60, delay: d });
      stagger(c.querySelectorAll('.rv-hb-f'), { step: 60, delay: d + 120, name: 'ui-grow', dur: 700 });
      stagger(c.querySelectorAll('.rv-dot'), { step: 18, delay: d, name: 'ui-pop', dur: 400 });
      stagger(c.querySelectorAll('.rv-phone'), { delay: d, dur: 700, name: 'ui-in-phone' });
    });
  }
  whenSeen(svEl, () => { seenView = true; animateView(); });
  // Bento cards tilt very gently towards the cursor, like a solid card pressed lightly where it points: it
  // turns about its centre (that side sinks, the opposite one rises), shrinks a hair, and its shadow shifts.
  // Every frame each card eases towards its target (a smooth follow, no CSS transitions restarting on every
  // mouse move), and back to flat when the cursor leaves. Uses the individual `rotate`/`scale` properties,
  // so it never fights the entrance animation (which owns `transform`). Mouse only.
  const TILT = 5.5, PRESS = 0, EASE = 0.045; // max degrees per axis, how much smaller when pressed (none: it only tilts), follow speed (lower = softer)
  const tilt = new Map(); // card -> { x, y, p (current), tx, ty, tp (target) }
  let tiltRaf = 0;
  const tiltFrame = () => {
    tiltRaf = 0;
    for (const [card, t] of tilt) {
      t.x += (t.tx - t.x) * EASE; t.y += (t.ty - t.y) * EASE; t.p += (t.tp - t.p) * EASE;
      const mag = Math.hypot(t.x, t.y);
      const done = !t.tp && mag < 0.005 && t.p < 0.0005;
      if (done || !card.isConnected) {
        card.style.rotate = card.style.scale = card.style.boxShadow = '';
        tilt.delete(card); continue;
      }
      card.style.rotate = mag < 1e-4 ? '' : `${(t.x / mag).toFixed(4)} ${(t.y / mag).toFixed(4)} 0 ${mag.toFixed(3)}deg`;
      card.style.scale = (1 - PRESS * t.p).toFixed(5);
      // the shadow falls out from under the side that rises (away from the cursor), a touch stronger pressed
      const k = Math.min(1, mag / TILT);
      card.style.boxShadow = `${(t.y * -1.6).toFixed(2)}px ${(4 + t.x * 1.6).toFixed(2)}px ${(12 + 2 * t.p).toFixed(2)}px rgba(0,0,0,${(0.05 + 0.02 * k).toFixed(3)})`;
    }
    if (tilt.size) tiltRaf = requestAnimationFrame(tiltFrame);
  };
  const tiltTo = (card, tx, ty, tp) => {
    const t = tilt.get(card) || { x: 0, y: 0, p: 0 };
    Object.assign(t, { tx, ty, tp }); tilt.set(card, t);
    if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltFrame);
  };
  let tilted = null;
  const untilt = () => { if (tilted) { tiltTo(tilted, 0, 0, 0); tilted = null; } };
  svEl.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = e.target.closest('.sv-card');
    if (card !== tilted) untilt();
    if (!card) return;
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5; // −.5 … .5
    tiltTo(card, -ny * 2 * TILT, nx * 2 * TILT, 1); // rotate x / y: the side nearest the cursor goes back
    tilted = card;
  });
  svEl.addEventListener('pointerleave', untilt);
  function render(id) {
    const v = VIEWS.find(x => x.id === id) || VIEWS[0];
    // Bento (Player first): the UI blocks plus up to three benefit blocks, title + description
    const role = ROLES.find(r => r.id === v.benefits), pick = BENTO[v.id];
    const ben = pick && role ? pick.map(k => role.benefits[k]).filter(Boolean).slice(0, 3) : [];
    svEl.classList.toggle('bento', ben.length > 0);
    svEl.classList.toggle('bento-2', ben.length === 2);
    svEl.innerHTML = viewCards(v) + ben.map(([t, d], k) => `<div class="sv-card sv-ben sv-ben${k + 1}">
      <b class="sv-ben-t">${t}</b><span class="sv-ben-d">${d}</span></div>`).join('');
    if (seenView) animateView();
  }
  // Role switcher: a full-width, looping row of roles you drag, click or tap; the picked one glides to the
  // centre, onto a glass pill. Items further from the centre are squeezed horizontally and fade out (wabi.ai style):
  // an item d px from the centre (in the unsqueezed row) is drawn at K·(1 − e^(−|d|/K)) and scaled
  // e^(−|d|/K) wide, so the row compresses smoothly towards both edges.
  const rs = root.getElementById('rs'), pill = root.getElementById('rs-pill');
  // The row loops: three copies of the roles side by side; each is drawn at its position wrapped into
  // ±1.5 rows of the centre, so the seam is always far out at the squeezed, faded edges.
  const N = VIEWS.length, COPIES = 3;
  const items = Array.from({ length: N * COPIES }, (_, k) => {
    const i = k % N, v = VIEWS[i], b = document.createElement('button');
    b.type = 'button'; b.className = 'rs-item'; b.dataset.i = i;
    if (k < N) b.setAttribute('role', 'tab'); else { b.setAttribute('aria-hidden', 'true'); b.tabIndex = -1; }
    b.innerHTML = `${v.icon}<span>${esc(v.label)}</span>`;
    rs.appendChild(b); return b;
  });
  const GAP = 16; // between role boxes (each has ~20px padding inside, so ~56px between labels)
  let centres = [], widths = [], L = 1, cx = 0, target = 0, sel = -1;
  let mid = 0, K = 260; // page centre within the row, squeeze length: measured on layout changes, not per frame
  const wrap = (d, P) => ((d + P / 2) % P + P) % P - P / 2; // into [−P/2, P/2)
  let pillW = 0;
  const nearest = (at) => { let best = 0; centres.forEach((c, i) => { if (Math.abs(wrap(c - at, L)) < Math.abs(wrap(centres[best] - at, L))) best = i; }); return best; };
  const measureRow = () => {
    // each role at its own width, the same gap between all of them; the pill is as wide as the widest
    items.forEach(b => { b.style.width = ''; });
    widths = items.slice(0, N).map(b => b.offsetWidth);
    centres = []; widths.forEach((w, i) => centres.push(i ? centres[i - 1] + widths[i - 1] / 2 + GAP + w / 2 : 0));
    L = centres[N - 1] + widths[N - 1] / 2 + GAP + widths[0] / 2; // one full row, to the next copy's first role
    pillW = Math.max(...widths);
    pill.style.width = pillW + 'px';
    // centred on the page (its visible width, without a scrollbar), whatever the row's own box is
    const W = document.documentElement.clientWidth;
    mid = W / 2 - rs.getBoundingClientRect().left;
    rs.style.setProperty('--mid', mid.toFixed(1) + 'px');
    K = Math.max(260, W * (W < 600 ? 1.4 : 1.5)); // squeeze length: gentle, so the roles' text isn't squashed much
  };
  const draw = () => {
    invalidate?.(250); // the glass pill refracts the row: redraw it while the row moves
    // The pill is wider than most roles: the roles either side are pushed out by the difference, so
    // they clear its edges (eased in by distance, so the row stays continuous while it moves)
    const near = nearest(cx), E = Math.max(0, (pillW - widths[near]) / 2);
    items.forEach((b, k) => {
      const i = k % N, copy = Math.floor(k / N) - 1;
      let d = wrap(centres[i] + copy * L - cx, COPIES * L);
      d += Math.sign(d) * E * Math.min(1, Math.abs(d) / (widths[near] / 2 + GAP + widths[i] / 2));
      const e = Math.exp(-Math.abs(d) / K), x = Math.sign(d) * K * (1 - e);
      b.style.transform = `translate(${(mid + x - widths[i] / 2).toFixed(1)}px, -50%) scale(${e.toFixed(3)}, 1)`;
      b.style.opacity = Math.max(0.15, 1 - (1 - e) * 1.2).toFixed(3);
    });
  };
  // Motion: one tick per frame, run by the glass layer just before it draws (so the row and its
  // refraction in the pill move in the same frame), or by requestAnimationFrame without glass.
  // Dragging follows the pointer; otherwise the row eases to its target at a frame-rate-independent pace.
  const nextFrame = beforeFrame || requestAnimationFrame;
  let ticking = false, gliding = false, dragTo = null, last = 0;
  const kick = () => { if (!ticking) { ticking = true; nextFrame(tick); } };
  const tick = (now) => {
    ticking = false;
    const dt = last ? Math.min(64, now - last) : 16.7; last = now;
    if (dragTo !== null) { cx = dragTo; dragTo = null; draw(); }
    else if (gliding) {
      const dx = target - cx;
      cx = Math.abs(dx) < 0.3 || matchMedia('(prefers-reduced-motion: reduce)').matches ? target : cx + dx * (1 - Math.pow(0.84, dt / 16.7)); // ≈ 16% of the way per 60 Hz frame
      if (cx === target) { cx = target = ((cx % L) + L) % L; gliding = false; } // settle back into one row's range
      draw();
    }
    if (gliding) kick(); else last = 0;
  };
  const glide = () => { gliding = true; kick(); };
  const stop = () => { gliding = false; };
  function select(i, { focus = false, instant = false, from = cx } = {}) {
    i = ((i % N) + N) % N;
    const changed = i !== sel; sel = i;
    target = from + wrap(centres[i] - from, L); // the closest copy of that role
    items.forEach((b, k) => { const on = k % N === i; b.classList.toggle('on', on); if (k < N) { b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; } });
    if (instant) { cx = target; draw(); } else glide();
    if (focus) items[i].focus({ preventScroll: true });
    if (changed) { render(VIEWS[i].id); invalidate?.(600); } // the page address stays as it is
  }
  // drag (mouse, pen, touch); a press that barely moves is a click on the item under it
  let drag = null;
  rs.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    stop();
    drag = { x: e.clientX, cx, moved: false, t: performance.now(), v: 0, lx: e.clientX, item: e.target.closest('.rs-item') };
    rs.setPointerCapture(e.pointerId);
  });
  rs.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) { drag.moved = true; rs.classList.add('is-drag'); }
    if (!drag.moved) return;
    const now = performance.now();
    drag.v = (e.clientX - drag.lx) / Math.max(1, now - drag.t); drag.lx = e.clientX; drag.t = now;
    dragTo = drag.cx - dx; kick(); // drawn once per frame, however many pointer events arrive
  });
  const release = () => {
    if (!drag) return;
    const d = drag; drag = null; rs.classList.remove('is-drag');
    if (dragTo !== null) { cx = dragTo; dragTo = null; }
    if (!d.moved) { if (d.item) select(+d.item.dataset.i); else glide(); return; }
    const aim = cx - d.v * 180; // a flick carries on a little
    select(nearest(aim), { from: aim });
  };
  rs.addEventListener('pointerup', release);
  rs.addEventListener('pointercancel', release);
  rs.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const dir = e.key === 'ArrowRight' ? 1 : -1; select(sel + dir, { focus: true, from: target + dir * 1e-3 }); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); select(e.key === 'Home' ? 0 : N - 1, { focus: true }); }
  });
  const relayout = () => { measureRow(); if (sel >= 0) { cx = target = centres[sel]; draw(); } };
  addEventListener('resize', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);
  // A role named in the address on arrival (e.g. /#players) is picked first; otherwise the first role. Picking a
  // role never changes the address, and jumping to other anchors on the page (#faq, …) leaves the pick alone.
  const fromHash = () => Math.max(0, VIEWS.findIndex(v => v.id === (location.hash || '').slice(1)));
  measureRow(); select(fromHash(), { instant: true });

  // For the page's WebGL glass layer (hero.js): the pill over the picked role, and the row it refracts
  return { glassPill: pill, rowItems: items };
}
