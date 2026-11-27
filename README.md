# ClubOS website

The ClubOS marketing site: home, manifesto, journal, clubs and team pages. Plain HTML, CSS and JavaScript, built with [Vite](https://vite.dev).

```
npm install
npm run dev       # local dev server, http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve the built site
```

## Pages

| Page | HTML | Script | Styles |
|---|---|---|---|
| Home | `index.html` | `src/hero.js` | `src/styles.css`, `src/hero-b.css`, `src/home-sections.css`, `src/newsletter.css`, `src/journal.css` |
| Manifesto | `manifesto.html` | `src/manifesto.js`, `src/manifesto-loom.js` | `src/manifesto.css` |
| Journal | `journal.html` | `src/journal.js` | `src/journal.css` |
| Clubs | `clubs.html` | `src/clubs.js` | `src/clubs.css` |
| Team | `team.html` | `src/team.js` | `src/team.css` |

Shared on every page: the top menu (`src/nav.css`, `src/ui/nav.js`), the footer (`src/footer.css`) and the page cover that fades each page in once it has loaded (`public/page-cover.js`).

## Where things live

- **Home hero** (`src/hero/heroB.js`, `src/hero-b.css`): a full-screen image (swap the `<img class="hb-media">` for a `<video class="hb-media" muted loop playsinline autoplay>` to use a film) painted through the ClubOS transition loom and played backwards as you scroll, folding down into the ClubOS mark.
- **Transition loom** (`public/transition-loom.js`): the canvas animation from the ClubOS mark to the loom, shared by the home hero and the manifesto.
- **Roles** (`src/roles/`): the role switcher and bento grid under the hero. `views.js` holds each role's cards, `roles.js` the benefits and behaviour.
- **Home sections** (`src/home-sections.js`): connected departments, calendar, decision rooms and FAQ.
- **Glass** (`src/glass/`): the WebGL glass on the Book a Demo buttons, the role pill and the newsletter field. Its look is set in `src/glass/settings.js`.
- **Assets** (`src/assets/`): photos, club crests and fonts.

## Notes

- The fonts in `src/assets/fonts` (Denim, Aeonik Condensed Pro) are licensed to ClubOS.
- Book a Demo and case study links are placeholders (`#`), and the newsletter form isn't connected to a mailing service yet.
