// Home page, before the newsletter: Connected departments, Meeting transcripts & calendar,
// Intelligent Decision Rooms and the FAQ. Content from the ClubOS homepage design (Main.dc.html),
// restyled in the site's own type, colours and cards; no icons. Rendered into the empty
// <section data-hs="…"> placeholders in index.html.

import { stagger, whenSeen } from './ui/uiMotion.js';
// Module tags, exactly as in the Figma file (node 99:208 "module tag")
import tagCoaching from './assets/tags/coaching.svg';
import tagMedical from './assets/tags/medical.svg';
import tagPlayer from './assets/tags/player.svg';
import tagRecruitment from './assets/tags/recruitment.svg';
import tagAdmin from './assets/tags/admin.svg';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = (k, h, sub) => `<header class="hs-head">${k ? `<p class="hs-k">${k}</p>` : ''}<h2 class="hs-title">${h}</h2>${sub ? `<p class="hs-sub">${sub}</p>` : ''}</header>`;

/* ── Connected departments ─────────────────────────────────────────────── */
const CNX = [{"d": "pl", "dn": "Player App", "when": "Tue 07:12", "h": "Morning check-in", "screen": "Check-in", "to": [{"a": "Medical", "tm": "07:15", "k": "adds", "who": "Physio", "say": "sees Daan’s sore hamstring and checks him before training."}, {"a": "Coaching", "tm": "07:40", "k": "reads", "who": "Head coach", "say": "is told Daan is sore and adapts his session."}, {"a": "Performance", "tm": "07:50", "k": "adds", "who": "Performance coach", "say": "lowers Daan’s running target for today."}]}, {"d": "rec", "dn": "Recruitment", "when": "Tue 09:10", "h": "Trial booked", "screen": "Trials", "to": [{"a": "Coaching", "tm": "09:12", "k": "reads", "who": "Head coach", "say": "gets informed that a trial player, Jesper Smit, joins Thursday’s training."}, {"a": "Performance", "tm": "09:20", "k": "reads", "who": "Performance coach", "say": "is asked to analyse Jesper’s data after the session."}, {"a": "Medical", "tm": "09:40", "k": "adds", "who": "Physio", "say": "books Jesper’s medical screening before he trains."}]}, {"d": "med", "dn": "Medical", "when": "Wed 11:30", "h": "Small injury", "screen": "Assessment", "to": [{"a": "Coaching", "tm": "11:31", "k": "reads", "who": "Head coach", "say": "learns Daan is doubtful for Saturday’s match."}, {"a": "Performance", "tm": "11:45", "k": "adds", "who": "Performance coach", "say": "lowers Daan’s load for the rest of the week."}, {"a": "Player App", "tm": "12:00", "k": "reads", "who": "Daan", "say": "gets his rehab plan on his phone."}]}, {"d": "coach", "dn": "Coaching", "when": "Thu 16:20", "h": "Squad named", "screen": "Matchday squad", "to": [{"a": "Player App", "tm": "16:21", "k": "reads", "who": "Every player", "say": "sees if he is in the squad and what time to meet."}, {"a": "Admin", "tm": "16:45", "k": "reads", "who": "Team manager", "say": "checks every name in the squad is registered and eligible."}, {"a": "Medical", "tm": "17:10", "k": "adds", "who": "Physio", "say": "plans the treatment list for Saturday."}]}, {"d": "adm", "dn": "Admin", "when": "Fri 14:05", "h": "Contract alert", "screen": "Contracts", "to": [{"a": "Decision Rooms", "tm": "14:20", "k": "adds", "who": "Technical director", "say": "sees Daan has 7 months left and puts his renewal on the agenda."}, {"a": "Coaching", "tm": "15:00", "k": "reads", "who": "Head coach", "say": "is asked for his view on Daan’s renewal."}, {"a": "Recruitment", "tm": "16:30", "k": "adds", "who": "Scout", "say": "starts a shortlist of right wingers, just in case."}]}, {"d": "dr", "dn": "Decision Rooms", "when": "Sat 10:15", "h": "Decision made", "screen": "Contract renewals", "to": [{"a": "Admin", "tm": "10:30", "k": "adds", "who": "Contract manager", "say": "prepares the new offer for the talks with Daan’s agent."}, {"a": "Coaching", "tm": "10:40", "k": "reads", "who": "Head coach", "say": "knows Daan is part of next season’s plans."}, {"a": "Recruitment", "tm": "11:00", "k": "adds", "who": "Scout", "say": "pauses the right-winger shortlist."}]}];
const WHO = { rec: ['Head scout', 'booked a trial'], pl: ['Daan de Wit', 'sent his check-in'], med: ['Physio', 'logged a small injury'],
  coach: ['Head coach', 'named the squad'], adm: ['Contract manager', 'sent an alert'], dr: ['Technical director', 'decided'] };
// What the source department logged (the design's source card per event)
const SRC = {
  rec: { player: ['Jesper Smit', 'Left-back · 19 · Trialist'], pill: ['Trial booked', 'b'], key: ['Trial', 'Thu 10:30, first-team session'], chip: ['Four-corner 4 · 4 · 3 · 4', 'n'] },
  med: { player: ['Daan de Wit', 'Right winger · 28 · First team'], pill: ['Limited', 'a'], key: ['Finding', 'Small hamstring strain, right'], chip: ['Nordic −15% on the right', 'r'] },
  adm: { player: ['Daan de Wit', 'Right winger · 28 · First team'], pill: ['7 months left', 'a'], key: ['Contract', 'Ends June 2027, club option for one year'], chip: ['Renewal not started', 'a'] },
  coach: { room: 'Sat vs Example FC, 14:30', key: ['Squad', '20 players, 9 on the bench'], chip: ['Meet Sat 12:15', 'n'] },
  dr: { room: 'Contract renewal: Daan de Wit', key: ['Decision', 'New terms, decided by the technical director'], chip: ['Next: talks with his agent', 'n'] },
};
// The player's check-in reaches three people (as in the design)
const PL_TO = [
  { a: 'Medical', tm: '09:05', k: 'adds', who: 'Physio', say: 'books a hamstring check before training.', chip: ['Check 09:15', 'a'] },
  { a: 'Performance', tm: '09:06', k: 'reads', who: 'Performance coach', say: 'sees Daan’s readiness drop to 41 and lowers his running target.', chip: ['Readiness 41 · Adapt', 'r'] },
  { a: 'Coaching', tm: '09:30', k: 'reads', who: 'Head coach', say: 'sees it and adapts Daan’s session.', chip: ['Session adapted', 'n'] },
];

function connected(el) {
  el.innerHTML = head('Connected departments', 'Every update reaches the people it affects in seconds',
    'Something happens in one department. Everyone it affects knows straight away in ClubOS.') + `
    <div class="cn-tabs" role="tablist" aria-label="Updates this week">
      ${CNX.map((e, i) => `<button type="button" role="tab" class="cn-ev" data-i="${i}"><b>${esc(e.h)}</b><small>${esc(e.dn)} · ${esc(e.when)}</small></button>`).join('')}
    </div>
    <div class="cn-win">
      <div class="win-bar win-bar--abs" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="cn-main" role="tabpanel" aria-live="polite"></div>
    </div>`;
  const main = el.querySelector('.cn-main'), evs = [...el.querySelectorAll('.cn-ev')];
  const chip = ([t, k]) => `<span class="chip" data-t="${k}">${esc(t)}</span>`;
  const show = (i) => {
    const e = CNX[i], [role, act] = WHO[e.d], s = SRC[e.d];
    evs.forEach((b, k) => b.setAttribute('aria-selected', k === i));
    const src = e.d === 'pl' ? `
      <div class="cn-src cn-checkin">
        <div class="cn-src-h"><b>Player App</b><span>Check-in · 10 Nov</span></div>
        <p class="ci-q">How are you today?</p>
        <div class="ci-row"><span>Sleep</span><em>7 h 40</em><span class="segs">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= 4 ? 'on' : ''}"></i>`).join('')}</span></div>
        <div class="ci-row"><span>Sore</span><em>Hamstring, right</em><span class="segs">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= 4 ? 'on r' : ''}"></i>`).join('')}</span></div>
        <p class="ci-note">“Right hamstring tight after yesterday”</p>
        <p class="ci-sent">Sent to your staff</p>
      </div>` : `
      <div class="cn-src">
        <div class="cn-src-h"><b>${esc(e.dn)}</b><span>${esc(e.screen)}</span><em class="new">New entry</em></div>
        ${s.player ? `<div class="cn-player"><span class="av">${(([f, ...r]) => f[0] + r.at(-1)[0])(s.player[0].split(' '))}</span><div><b>${esc(s.player[0])}</b><small>${esc(s.player[1])}</small></div>${chip(s.pill)}</div>` : `<p class="cn-room">${esc(s.room)}</p>`}
        <p class="cn-key"><span>${esc(s.key[0])}</span>${esc(s.key[1])}</p>
        <div class="chips">${chip(s.chip)}</div>
      </div>`;
    const to = e.d === 'pl' ? PL_TO : e.to;
    main.innerHTML = `
      <p class="cn-who"><b>${esc(role)}</b> ${esc(act)} <em>${esc(e.when)}</em></p>
      ${src}
      <p class="cn-reach">Reaches the people it affects</p>
      <ol class="cn-to">${to.map((p) => `<li class="cn-card"><div class="cn-card-h"><b>${esc(p.a)}</b><span>${esc(p.tm)} · <em data-k="${p.k}">${esc(p.k)}</em></span>${p.chip ? chip(p.chip) : ''}</div><p><b>${esc(p.who)}</b> ${esc(p.say)}</p></li>`).join('')}</ol>`;
    if (seen) animate();
  };
  // who did it, what was logged, then the people it reaches, one after another
  const animate = () => stagger([main.querySelector('.cn-who'), main.querySelector('.cn-src'), main.querySelector('.cn-reach'), ...main.querySelectorAll('.cn-card')], { step: 90 });
  // Plays through the week on its own while it's on screen, until someone picks an update
  let cur = 0, timer = 0, seen = false, picked = false;
  const play = () => { clearInterval(timer); if (!picked) timer = setInterval(() => show(cur = (cur + 1) % CNX.length), 6000); };
  evs.forEach((b) => b.addEventListener('click', () => { picked = true; clearInterval(timer); show(cur = +b.dataset.i); }));
  show(0);
  whenSeen(el.querySelector('.cn-win'), () => { seen = true; animate(); play(); }, { repeat: true, onLeave: () => clearInterval(timer) });
}

/* ── Meeting transcripts & calendar ───────────────────────────────────── */
function calendar(el) {
  const days = [['Mon', 9], ['Tue', 10], ['Wed', 11], ['Thu', 12], ['Fri', 13], ['Sat', 14], ['Sun', 15]];
  // [day, start hour, hours, title, detail, source, flags] (flags: new = from the meeting, rec = recorded)
  const EV = [
    [0, 13, 1, 'Staff meeting', '13:00 · Week plan', 'Hub', 'rec'],
    [1, 9, 0.75, 'Hamstring check', '09:00 · Daan · Physio', 'Medical', 'new'],
    [1, 10.5, 1.5, 'Training', '10:30 · Intensive', 'Coaching'],
    [2, 9, 1, 'Physio checks', '09:00 · 6 players', 'Medical'],
    [2, 10.5, 1.5, 'Training', '10:30 · Pressing', 'Coaching'],
    [3, 9, 0.75, 'Light session · Daan', '09:00 · Coach', 'Coaching', 'new'],
    [3, 10.5, 1.5, 'Training', '10:30 · Possession · Pitch 2', 'Coaching'],
    [4, 10.5, 1.5, 'Training', '10:30 · Set pieces', 'Coaching'],
    [5, 12, 1, 'Meet', '12:00 · Hotel lobby', 'Operations'],
    [5, 14.5, 1.75, 'Match', '14:30 · vs Example FC', 'Operations'],
    [6, 10, 1, 'Recovery', '10:00 · Starters', 'Performance'],
  ];
  const T0 = 8, T1 = 17;
  el.innerHTML = head('Meeting transcripts &amp; calendar', 'From meeting transcripts to calendar and profile',
    'Staff meetings are recorded and turned into next steps. Each one lands in the right calendar or player profile.') + `
    <div class="cal-win">
    <div class="win-bar win-bar--abs" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="cal-grid">
      <div class="cal-recap card">
        <div class="recap-h"><b>Staff meeting · Week plan</b><span class="rec">Recorded</span><small>Mon 13:00–14:00 · 5 staff · 58:12</small></div>
        <p class="lab">Transcript</p>
        <ul class="tx">
          <li><b>Coach</b><time>13:04</time><span>How’s Daan after Saturday?</span></li>
          <li><b>Physio</b><time>13:05</time><span>Hamstring’s tight. <mark>Check Tuesday.</mark></span></li>
          <li><b>Coach</b><time>13:06</time><span>Then he <mark>trains light Thursday.</mark></span></li>
          <li><b>Analyst</b><time>13:21</time><span>Their 9 drops deep every game.</span></li>
          <li><b>Coach</b><time>13:22</time><span>Third this season. <mark>Note it on his profile.</mark></span></li>
        </ul>
        <p class="lab">Next steps</p>
        <ul class="steps">
          <li><div><b>Hamstring check · Daan</b><small>Physio · Tue 09:00</small></div><span class="chip" data-t="b">In calendar</span></li>
          <li><div><b>Light session · Daan</b><small>Coach · Thu 09:00</small></div><span class="chip" data-t="b">In calendar</span></li>
          <li><div><b>Note on Daan’s profile</b><small>Coach · hamstring pattern</small></div><span class="chip" data-t="b">On profile</span></li>
        </ul>
      </div>
      <div class="cal-week card">
        <div class="week-h"><b>November 2026</b><small>Week 46</small><em>Synced with Google &amp; Outlook</em></div>
        <div class="week" style="--rows:${(T1 - T0) * 2}">
          <div class="week-days">${days.map(([d, n]) => `<span><b>${d}</b>${n}</span>`).join('')}</div>
          <div class="week-body">
            ${[8, 10, 12, 14, 16].map((h) => `<span class="hr" style="--r:${(h - T0) * 2 + 1}">${String(h).padStart(2, '0')}:00</span>`).join('')}
            ${EV.map(([d, s, len, t, sub, src, f]) => `<div class="ev${f ? ' ' + f : ''}" style="--c:${d + 2};--r0:${Math.round((s - T0) * 2) + 1};--r1:${Math.round((s - T0 + len) * 2) + 1}"><b>${esc(t)}</b><small>${esc(sub)}</small>${f === 'new' ? '<em>From the meeting</em>' : ''}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="cal-profile card">
        <div class="pf-h"><span class="av">DW</span><div><b>Daan de Wit</b><small>Right winger · 28 · First team</small></div></div>
        <div class="chips"><span class="chip" data-t="a">Limited</span><span class="chip">Hamstring, right</span><span class="chip">Contract to June 2027</span></div>
        <p class="lab">Notes</p>
        <ul class="notes">
          <li class="new"><span class="chip" data-t="b">New</span><p>Third hamstring issue this season, every time after two games in a week. Rotate him in busy weeks.</p><small>Coach · from the staff meeting, Mon 13:22</small></li>
          <li><p>Strong week in training, sharp in 1v1s.</p><small>Coach · Fri 6 Nov</small></li>
          <li><p>Sleep below 7 hours three nights in a row. Talked it through.</p><small>Performance coach · Wed 4 Nov</small></li>
        </ul>
      </div>
    </div>
    </div>`;
  // The meeting plays out each time the window comes into view: the transcript line by line (its key
  // phrases highlighting), the next steps, then the new events drop into the week and the note lands
  // on Daan's profile.
  const win = el.querySelector('.cal-win'), q = (sel) => [...win.querySelectorAll(sel)];
  let timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const play = () => {
    timers.forEach(clearTimeout); timers = [];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { win.classList.remove('is-pre'); q('mark').forEach((m) => m.classList.add('lit')); return; }
    win.classList.add('is-pre'); q('mark').forEach((m) => m.classList.remove('lit'));
    void win.offsetWidth; win.classList.remove('is-pre');
    const lines = q('.tx li'), STEP = 420;
    stagger(lines, { step: STEP, delay: 150 });
    lines.forEach((li, i) => li.querySelectorAll('mark').forEach((m) => at(150 + i * STEP + 450, () => m.classList.add('lit'))));
    const t1 = 150 + lines.length * STEP + 250;
    stagger(q('.steps li'), { step: 160, delay: t1 });
    const t2 = t1 + 3 * 160 + 300;
    stagger(q('.ev.new'), { step: 220, delay: t2, name: 'ui-pop', dur: 550 });
    stagger(q('.notes li.new'), { delay: t2 + 500 });
  };
  win.classList.add('is-pre');
  whenSeen(win, play, { repeat: true, threshold: 0.35 });
}

/* ── Intelligent Decision Rooms ───────────────────────────────────────── */
const DR = [{"t": "Contract renewal", "s": "Daan de Wit", "q": "Should we renew Daan de Wit’s contract?", "facts": "Right winger, 28 · contract ends June 2027 · agent asks +30%", "ins": [{"d": "Medical", "items": ["Hamstring twice this season", "41 days out"]}, {"d": "Coaching", "items": ["First-choice right winger", "19 starts, 9 goals"]}, {"d": "Contracts", "items": ["Contract ends June 2027", "Agent asks +30%"]}, {"d": "Academy", "items": ["Noah Bakker, 18", "Plays the same position"]}], "opts": [{"b": "Renew now", "say": "He stays fit and keeps scoring.", "out": [["g", "Squad", "Keeps scoring"], ["o", "Budget", "High wage, but it pays off"], ["o", "Academy", "Noah waits"]]}, {"b": "Wait until January", "say": "He stays fit, and you renew on facts in January.", "out": [["g", "Squad", "Fit and scoring"], ["o", "Budget", "His price may rise"], ["g", "Academy", "Noah gets a look"]]}, {"b": "Let it run", "say": "Noah steps up, and Daan’s wage pays for cover.", "out": [["g", "Squad", "A homegrown winger"], ["g", "Budget", "Wage freed up"], ["g", "Academy", "A clear pathway"]]}], "when": "If it goes well"}, {"t": "Squad planning", "s": "Right-back", "q": "Who plays right-back next season?", "facts": "One natural right-back, aged 32 · his contract ends June 2027 · budget for one signing", "ins": [{"d": "Scouting", "items": ["3 right-backs on the shortlist", "All fit our profile"]}, {"d": "Contracts", "items": ["Kerr, our only right-back, 32", "Deal ends June 2027"]}, {"d": "Academy", "items": ["Sem Visser, 18", "Right-back in the U19s"]}, {"d": "Coaching", "items": ["Head coach wants an attacking right-back"]}], "opts": [{"b": "Sign a right-back", "say": "The new right-back settles fast and the defence holds.", "out": [["g", "Squad", "A starter from day one"], ["o", "Budget", "Most of the budget"], ["o", "Academy", "Sem waits"]]}, {"b": "Promote from the academy", "say": "Sem grows into the role next to Kerr.", "out": [["g", "Squad", "A right-back for years"], ["g", "Budget", "No fee"], ["g", "Academy", "A clear pathway"]]}, {"b": "Loan one in", "say": "The loan does a solid job while Sem grows.", "out": [["g", "Squad", "Solid cover"], ["g", "Budget", "No long contract"], ["g", "Academy", "Sem ready next summer"]]}], "when": "If it goes well"}];
// Each department's input carries its module's tag (Figma 99:208): scouting is Recruitment,
// contracts Admin, the academy Player
const TAG = { Medical: ['Medical', tagMedical], Coaching: ['Coaching', tagCoaching], Scouting: ['Recruitment', tagRecruitment],
  Contracts: ['Admin', tagAdmin], Academy: ['Player', tagPlayer] };
function rooms(el) {
  // One black block: the heading, the room in a subtle box, then the toggle between the example rooms below it
  el.innerHTML = `<div class="dr-block">` + head('Intelligent Decision Rooms', 'Integrated scenario planning for every important decision',
    'One decision can affect the squad, budget and academy. In ClubOS, you see each scenario before you choose.') + `
    <div class="dr-stage">
      <div class="dr-main" role="tabpanel"></div>
    </div>
    <div class="dr-tabs" role="tablist" aria-label="Example decisions"><i class="dr-thumb" aria-hidden="true"></i>
      ${DR.map((r, i) => `<button type="button" role="tab" class="dr-room" data-i="${i}"><b>${esc(r.t)}</b></button>`).join('')}
    </div>
  </div>`;
  const main = el.querySelector('.dr-main'), roomsEl = [...el.querySelectorAll('.dr-room')];
  let ri = 0, oi = 0;
  main.classList.add('is-pre'); // hidden until it first comes into view and plays its entrance
  const draw = () => {
    roomsEl.forEach((b, k) => b.setAttribute('aria-selected', k === ri));
    place();
    main.innerHTML = roomHTML(ri, oi);
    main.querySelectorAll('.dr-opt').forEach((b) => b.addEventListener('click', () => pick(+b.dataset.k)));
  };
  // Picking a scenario only updates the selection and the outcomes (the rest stays put, so the
  // highlight can fade from one scenario to the next)
  const outsHTML = (o) => o.out.map(([c, k, t]) => `<li data-c="${c}"><span class="dot">${c === 'g' ? '+' : '−'}</span><div><small>${esc(k)}</small><b>${esc(t)}</b></div></li>`).join('');
  const pick = (k) => {
    if (k === oi) return;
    oi = k;
    main.querySelectorAll('.dr-opt').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.k === oi));
    main.querySelector('.dr-outs').innerHTML = outsHTML(DR[ri].opts[oi]);
  };
  // The room keeps the height of the tallest room/option, and the scenario block the height of the tallest
  // one, so switching never moves anything (the toggle below stays put)
  const settle = () => {
    main.style.minHeight = ''; main.style.removeProperty('--opts-h');
    let max = 0, opts = 0;
    DR.forEach((r, i) => r.opts.forEach((_, k) => {
      main.innerHTML = roomHTML(i, k);
      max = Math.max(max, main.offsetHeight);
      opts = Math.max(opts, main.querySelector('.dr-opts').offsetHeight);
    }));
    main.style.minHeight = max + 'px';
    main.style.setProperty('--opts-h', opts + 'px'); // the scenario block: the same height in every room
    draw();
  };
  // Wires, as on the story page: a connector dot on each input box and one on the scenario block, a
  // fine line from each input to the scenarios (and from the picked scenario on to the outcomes), and a soft white light that runs along them towards
  // the scenarios, then pauses (story: config.chart.pulse). Geometry is re-read every frame, so the
  // wires follow the boxes as they animate in. Hidden when the columns stack (phones).
  const NS = 'http://www.w3.org/2000/svg', PULSE = { travel: 0.9, pause: 1.2, length: 70, layers: 6 };
  let wiresOn = false, wireRaf = 0, revealAt = Infinity; // wires stay hidden until the room's first entrance
  const DRIFT = [0.07, 0, -0.06]; // inputs, scenarios, outcomes: scroll-speed offsets
  const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };
  function wireFrame(now) {
    wireRaf = requestAnimationFrame(wireFrame);
    const flow = main.querySelector('.dr-flow'), svg = flow?.querySelector('.dr-wires');
    if (!svg) return;
    const stacked = getComputedStyle(flow).display !== 'grid' || flow.querySelector('.dr-opts').getBoundingClientRect().top > flow.querySelector('.dr-col').getBoundingClientRect().bottom - 1;
    svg.style.display = stacked ? 'none' : '';
    // The three columns drift at slightly different speeds as the page scrolls (offset = distance of
    // the room's centre from the viewport's centre × speed); the wires follow, as they read the boxes'
    // positions each frame. Uses `translate`, which the entrance animations (transform) don't touch.
    const cols = [flow.querySelector('.dr-col'), flow.querySelector('.dr-opts'), flow.querySelector('.dr-col--outs')];
    const still = stacked || matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fr = flow.getBoundingClientRect(), dist = innerHeight / 2 - (fr.top + fr.height / 2);
    cols.forEach((c, i) => { if (c) c.style.translate = still ? '' : `0 ${(dist * DRIFT[i]).toFixed(1)}px`; });
    if (stacked) return;
    const F = flow.getBoundingClientRect(), opts = flow.querySelector('.dr-opts').getBoundingClientRect();
    const P = (x, y) => ({ x: x - F.left, y: y - F.top });
    const ins = [...flow.querySelectorAll('.dr-ins > li')];
    const sel = flow.querySelector('.dr-opt[aria-pressed="true"]'), outs = flow.querySelector('.dr-col--outs .dr-outs');
    const delayOf = (el) => (parseFloat(el?.style.animationDelay) || 0) * (/ms/.test(el?.style.animationDelay || '') ? 1 : 1000);
    const end = P(opts.left, opts.top + opts.height / 2);
    // Segments: each input box → the scenario block (one shared end dot), then the picked scenario →
    // the outcomes. Each: start/end points, which dots it draws (and their ring colour), its reveal delay.
    const segs = ins.map((li, i) => { const r = li.getBoundingClientRect();
      return { a: P(r.right, r.top + r.height / 2), b: end, dotA: 'box', dotB: i === 0 ? 'box' : null, delay: delayOf(li) + 150 }; });
    if (sel && outs) {
      const r = sel.getBoundingClientRect(), o = outs.getBoundingClientRect();
      segs.push({ a: P(r.right, r.top + r.height / 2), b: P(o.left, o.top + o.height / 2), dotA: 'blue', dotB: 'box', delay: delayOf(sel.closest('.dr-opt-w')) + 250 });
    }
    if (svg.querySelectorAll('g.w').length !== segs.length) { // (re)build: rings (under the lines), lines + pulse layers, dots (over them)
      svg.replaceChildren();
      const rings = mk('g', { class: 'w-rings' }, svg);
      segs.forEach(() => { mk('circle', { class: 'w-ring' }, rings); mk('circle', { class: 'w-ring' }, rings); });
      segs.forEach(() => {
        const g = mk('g', { class: 'w' }, svg);
        mk('path', { class: 'w-line' }, g);
        for (let i = 0; i < PULSE.layers; i++) mk('path', { class: 'w-pulse' }, g);
      });
      const dotsG = mk('g', { class: 'w-dots' }, svg);
      segs.forEach(() => { mk('circle', { class: 'w-dot' }, dotsG); mk('circle', { class: 'w-dot' }, dotsG); });
    }
    // Each line keeps its own rhythm: its own travel time, pause and starting offset (fixed per line,
    // so the pattern feels natural but never jitters)
    const rhythm = (i) => ({ travel: PULSE.travel * (0.8 + ((i * 37) % 5) * 0.12), pause: PULSE.pause * (0.7 + ((i * 53) % 7) * 0.13), offset: (i * 0.613) % 1.7 });
    const localOf = (i) => { const r = rhythm(i); return (((now / 1000 + r.offset) % (r.travel + r.pause)) / r.travel); }; // 0…1 while travelling
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const groups = svg.querySelectorAll('g.w'), rings = svg.querySelectorAll('.w-ring'), dots = svg.querySelectorAll('.w-dot');
    const place = (c, p, on, kind) => { c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.style.display = on ? '' : 'none'; if (kind) c.dataset.ring = kind; };
    segs.forEach((sg, i) => {
      const { a, b } = sg, mx = (a.x + b.x) / 2;
      const d = `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
      const g = groups[i], paths = g.querySelectorAll('path'), line = paths[0];
      // appears with its box (same delay as the box's own stagger), fading in over its entrance
      const k = revealAt ? Math.min(1, Math.max(0, (now - revealAt - sg.delay) / 450)) : 1;
      g.style.opacity = k;
      [rings[i * 2], dots[i * 2]].forEach((c) => { place(c, a, !!sg.dotA, sg.dotA); c.style.opacity = k; });
      [rings[i * 2 + 1], dots[i * 2 + 1]].forEach((c) => { place(c, b, !!sg.dotB, sg.dotB); c.style.opacity = k; });
      paths.forEach((p) => p.setAttribute('d', d));
      const local = localOf(i), L = line.getTotalLength(), len = PULSE.length, head = local * (L + len);
      for (let j = 1; j < paths.length; j++) {
        const lj = len * (1 - (j - 1) / PULSE.layers), from = head - lj;
        paths[j].style.opacity = !reduce && local <= 1 ? '' : '0';
        paths[j].style.strokeDasharray = `${Math.max(0, head - Math.max(0, from))} ${L + len * 2}`;
        paths[j].style.strokeDashoffset = `${-Math.max(0, from)}`;
      }
    });
  }
  whenSeen(el.querySelector('.dr-stage'), () => { if (!wiresOn) { wiresOn = true; wireRaf = requestAnimationFrame(wireFrame); } }, { repeat: true, onLeave: () => { wiresOn = false; cancelAnimationFrame(wireRaf); } });

  function roomHTML(ri, oi) {
    const r = DR[ri], o = r.opts[oi];
    return `
      <div class="dr-flow"><svg class="dr-wires" aria-hidden="true"></svg>
        <div class="dr-col"><p class="dr-h">Input from departments</p><ul class="dr-ins">${r.ins.map((x) => `<li><p class="dr-from"><img class="mtag" src="${TAG[x.d][1]}" alt="${TAG[x.d][0]}"></p><ul>${x.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></li>`).join('')}</ul></div>
        <div class="dr-opts"><div class="dr-q"><h3>${esc(r.q)}</h3></div>${r.opts.map((x, k) => `<div class="dr-opt-w"><p class="dr-opt-k">Scenario ${k + 1}</p><button type="button" class="dr-opt" data-k="${k}" aria-pressed="${k === oi}"><span><b>${esc(x.b)}</b><small>${esc(x.say)}</small></span><svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>`).join('')}</div>
        <div class="dr-col dr-col--outs"><p class="dr-h">Possible outcomes</p><ul class="dr-outs">${outsHTML(o)}</ul></div>
      </div>`;
  }
  // a room comes in: the question, then each column with its items
  const animate = () => {
    // the scenario block first, then the inputs one by one (with their wires), then the outcomes
    const inCol = main.querySelector('.dr-col');
    stagger([main.querySelector('.dr-opts'), inCol.querySelector('.dr-h'), ...main.querySelectorAll('.dr-ins > li'), main.querySelector('.dr-col--outs')], { step: 80 });
    revealAt = performance.now(); // the wires come in with their input boxes (wireFrame)
    main.classList.remove('is-pre');
  };
  roomsEl.forEach((b) => b.addEventListener('click', () => { ri = +b.dataset.i; oi = 0; draw(); animate(); }));
  whenSeen(main, animate);
  // The light pill slides under the picked room (positioned from that button's box)
  function place() {
    const b = roomsEl[ri], thumb = el.querySelector('.dr-thumb');
    thumb.style.width = b.offsetWidth + 'px';
    thumb.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  let rt; addEventListener('resize', () => { place(); clearTimeout(rt); rt = setTimeout(settle, 150); });
  document.fonts?.ready.then(settle);
  settle();
  requestAnimationFrame(() => el.querySelector('.dr-tabs').classList.add('is-ready')); // no slide on first paint
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */
const FAQ = [{"id": "most", "label": "Most asked", "items": [{"q": "Which zones are live?", "a": "Hub, Recruitment & Scouting, Club Administration, Performance, Coaching, Players and Medical are live today. Analysis, People Operations, Marketing and Commercial are coming soon. New zones are switched on for your club as they become available."}, {"q": "Will it fit how our club already works?", "a": "Yes. We set ClubOS up around your club: your teams, your staff roles, your season and your own templates for things like scouting reports and evaluations. Every department works in its own space, on the same player records."}, {"q": "Why choose ClubOS instead of building something in-house?", "a": "Building your own system means hiring developers and maintaining it for years, while staff keep working around the gaps. ClubOS is built and improved full-time, shaped by interviews with more than 150 club professionals. It connects to systems like STATSports, Catapult and VALD, and new features come at no extra cost."}, {"q": "Do we have to replace the tools we already use?", "a": "No. ClubOS works with the systems you already pay for. Data from STATSports, Catapult and VALD comes straight onto the player’s record, so you keep your tools and stop copying numbers between them."}, {"q": "Who owns our data?", "a": "Your club does. ClubOS only processes your data to run the platform for you. Reports and templates your staff create stay club property, and your data stays exportable if you ever decide to leave."}, {"q": "How is ClubOS priced?", "a": "Per club, with unlimited users. The price depends on whether you use ClubOS for your academy, your first team or both, and on your country, your league and your position in that league. New features in your products are included."}]}, {"id": "start", "label": "Getting started", "items": [{"q": "Who is ClubOS for?", "a": "Everyone who works with players: coaching, performance, medical, recruitment, the academy, administration and management, and the players themselves. Each person sees what matters to their role."}, {"q": "What does getting started involve?", "a": "A first conversation about how your club works. Then we set up ClubOS for your first department, bring in your existing data and onboard your staff together with you."}, {"q": "Can we try ClubOS before we commit?", "a": "Yes. We can set you up with a test account in the role you care about, for example head of recruitment or physio, so you can see your own working day in ClubOS before you decide."}, {"q": "Can we start with one department?", "a": "Yes. Start where the need is biggest and add departments when you’re ready. FC Dordrecht started with recruitment in its youth academy."}, {"q": "Who helps us during onboarding?", "a": "The ClubOS team, directly. We configure your templates, import your data and stay in close contact with your staff in the first weeks, often through a shared group chat, so questions reach the people building ClubOS."}, {"q": "Do you listen to feedback from clubs?", "a": "Yes, it shapes what we build. Feedback from the clubs using ClubOS goes straight to the product team, and partner clubs help decide what comes next."}]}, {"id": "tools", "label": "Tools and integrations", "items": [{"q": "Do we have to replace the tools we already use?", "a": "No. ClubOS works with the systems you already pay for. Data from STATSports, Catapult and VALD comes straight onto the player’s record, so you keep your tools and stop copying numbers between them."}, {"q": "Which systems does ClubOS connect to?", "a": "STATSports, Catapult and VALD today, with Wyscout next. Using something else? Tell us. Adding a new data provider usually takes a couple of weeks, not months."}, {"q": "Can we bring in our spreadsheets and existing data?", "a": "Yes. As part of onboarding we import your player lists, reports and spreadsheets in bulk, so your history is in ClubOS from the first day."}, {"q": "Does Recruitment need a paid data feed?", "a": "No. Recruitment starts from what your scouts already know: their reports, lists, shortlists and trial notes, on your own report templates."}, {"q": "Does it work on a phone, or at grounds with no signal?", "a": "Staff use ClubOS in the browser on a laptop, tablet or phone. The Player App for daily check-ins is close to release, and a scout app for reports at the ground is in development. Until then, scouts can upload notes and photos from their phone."}]}, {"id": "data", "label": "Data, privacy and access", "items": [{"q": "Who owns our data?", "a": "Your club does. ClubOS only processes your data to run the platform for you. Reports and templates your staff create stay club property, and your data stays exportable if you ever decide to leave."}, {"q": "How does ClubOS handle GDPR?", "a": "Your club stays in control of its data and ClubOS processes it on your behalf. We sign a data processing agreement with every club before any data moves, and walk you through how personal data is handled."}, {"q": "Who can see what?", "a": "Access follows each person’s role. A technical director can see who is available without opening medical notes, and a scout only sees the players assigned to them. Before go-live we agree with your club who sees what."}, {"q": "Can medical information stay with the medical staff?", "a": "Before go-live we agree with your medical staff what they share and with whom, and show you exactly how ClubOS handles medical information today."}, {"q": "How does ClubOS handle data on minor players?", "a": "Before any data on minor players is imported, we agree with your club how consent is handled, in line with the rules in your country."}, {"q": "Can players see their own data?", "a": "Players get their own account with limited access, and your club decides what they see, such as their own check-ins, schedule and feedback."}]}, {"id": "price", "label": "Pricing and contracts", "items": [{"q": "How is ClubOS priced?", "a": "Per club, with unlimited users. The price depends on whether you use ClubOS for your academy, your first team or both, and on your country, your league and your position in that league. New features in your products are included."}, {"q": "Do we pay per user?", "a": "No. Users are unlimited, from the first team to the academy staff, so nobody has to share a login."}, {"q": "What do new features cost?", "a": "Nothing extra. New features within the products you use are included as ClubOS grows, without a price change."}, {"q": "How long is a contract?", "a": "Licences run per season or per year. We go through the options that suit your club in the first conversation."}, {"q": "Are there terms for early partner clubs?", "a": "Yes. Clubs that join early and help shape ClubOS get partner terms. Ask us what is available for your club."}]}];
function faq(el) {
  el.innerHTML = `
    <div class="faq-grid">
      <div class="faq-l"><h2 class="hs-title">Questions clubs ask us</h2>
        <nav class="faq-cats" aria-label="FAQ topics">${FAQ.map((c, i) => `<button type="button" class="faq-cat" data-i="${i}">${esc(c.label)}</button>`).join('')}</nav>
        <p class="faq-more">Something else? <a href="#">Ask us directly</a></p>
      </div>
      <div class="faq-r"><div class="faq-list"></div></div>
    </div>`;
  const cats = [...el.querySelectorAll('.faq-cat')], list = el.querySelector('.faq-list');
  const draw = (ci) => {
    const c = FAQ[ci];
    cats.forEach((b, k) => b.setAttribute('aria-pressed', k === ci));
    list.innerHTML = c.items.map((it, k) => `
      <div class="faq-item"><h3><button type="button" aria-expanded="false" aria-controls="faq-a-${ci}-${k}" id="faq-q-${ci}-${k}"><span>${esc(it.q)}</span><i aria-hidden="true"></i></button></h3>
        <div class="faq-a" id="faq-a-${ci}-${k}" role="region" aria-labelledby="faq-q-${ci}-${k}" inert><div><p>${esc(it.a)}</p></div></div></div>`).join('');
    list.querySelectorAll('.faq-item button').forEach((b) => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      // one open at a time; the answer slides open/closed (CSS: .faq-item.is-open); inert keeps a closed answer out of tab order
      list.querySelectorAll('.faq-item').forEach((it) => { it.classList.remove('is-open'); it.querySelector('button').setAttribute('aria-expanded', 'false'); it.querySelector('.faq-a').inert = true; });
      const item = b.closest('.faq-item');
      item.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open); item.querySelector('.faq-a').inert = !open;
    }));
  };
  cats.forEach((b) => b.addEventListener('click', () => draw(+b.dataset.i)));
  draw(0);
}

export function initHomeSections(root = document) {
  const run = { connected, calendar, rooms, faq };
  root.querySelectorAll('[data-hs]').forEach((el) => run[el.dataset.hs]?.(el));
}
