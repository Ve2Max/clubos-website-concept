import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Pages: home (index.html), team, manifesto, journal and clubs.
export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        team: resolve(import.meta.dirname, 'team.html'),
        manifesto: resolve(import.meta.dirname, 'manifesto.html'),
        journal: resolve(import.meta.dirname, 'journal.html'),
        clubs: resolve(import.meta.dirname, 'clubs.html'),
      },
    },
  },
});
