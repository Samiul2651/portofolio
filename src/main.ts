import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import './style.css';
import cardsJson from './data/cards.json';
import type { Card } from './chat/rank';
import { PUBLIC_EMAIL } from './chat/engine';
import { createGraph } from './ui/graph';
import { createSheet } from './ui/sheet';
import { createAsk } from './ui/ask';

const cards = new Map((cardsJson as Card[]).map((c) => [c.id, c]));
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header class="hero">
    <h1>Ishtiaq Samiul</h1>
    <p class="headline">I build event-driven backend systems in C# and .NET.</p>
    <p class="muted">Based in Dhaka, Bangladesh. Open to relocation and remote work.</p>
    <nav class="links" aria-label="Contact">
      <a href="mailto:${PUBLIC_EMAIL}">Email</a>
      <a href="https://linkedin.com/in/samiul2651" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://github.com/Samiul2651" target="_blank" rel="noopener">GitHub</a>
      <a href="https://codeforces.com/profile/Samiul2651" target="_blank" rel="noopener">Codeforces</a>
    </nav>
  </header>

  <main class="layout">
    <section class="map" aria-labelledby="map-title">
      <div class="map-head">
        <h2 id="map-title">Explore</h2>
        <button type="button" class="back" hidden>Back to Samiul</button>
      </div>
      <p class="muted small" id="map-hint">Tap a topic to open it.</p>
      <div id="graph-host"></div>
    </section>

    <section class="ask" id="ask-host" aria-label="Ask Samiul chatbot"></section>
  </main>

  <footer class="muted small">Built with Vite, TypeScript and Transformers.js. Hosted on GitHub Pages.</footer>
`;

const sheet = createSheet(document.body);
const backBtn = app.querySelector<HTMLButtonElement>('.back')!;
const hint = app.querySelector<HTMLParagraphElement>('#map-hint')!;

const graph = createGraph(app.querySelector('#graph-host')!, {
  onOpenCard: (id) => {
    const card = cards.get(id);
    if (card) sheet.open(card);
  },
  onViewChange: (topic) => {
    backBtn.hidden = !topic;
    hint.textContent = topic ? 'Tap an item to read it.' : 'Tap a topic to open it.';
  },
});
backBtn.addEventListener('click', () => graph.showRoot());

createAsk(app.querySelector('#ask-host')!);
