import './style.css';
import { ask, warmUp, type Reply } from './chat/engine';

// TEMPORARY test chat for step 4. Step 6 replaces this whole page with the mockup design.
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <main class="layout">
    <section class="intro">
      <h1>Ishtiaq Samiul</h1>
      <p>Backend Software Engineer — Event-Driven Systems · C#/.NET</p>
      <p class="muted">Site under construction. Try the chatbot below.</p>
    </section>
    <section class="test-chat">
      <h2>Ask Samiul</h2>
      <p class="muted small">Retrieval only · runs in your browser · no LLM</p>
      <form id="ask-form">
        <input id="q" autocomplete="off" placeholder="e.g. Have you worked with RabbitMQ?" aria-label="Your question" />
        <button type="submit">Ask</button>
      </form>
      <label class="small"><input type="checkbox" id="show-retrieval" checked /> Show retrieval</label>
      <p id="status" class="muted small"></p>
      <div id="log"></div>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#ask-form')!;
const input = document.querySelector<HTMLInputElement>('#q')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const log = document.querySelector<HTMLDivElement>('#log')!;
const showRetrieval = document.querySelector<HTMLInputElement>('#show-retrieval')!;

const escape = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// Start the download as soon as the visitor shows interest.
input.addEventListener('focus', () => {
  status.textContent = 'Loading model…';
  warmUp((p) => (status.textContent = `Loading model… ${p}%`))
    .then(() => (status.textContent = 'Ready.'))
    .catch(() => (status.textContent = 'Could not load the model. Check your connection and try again.'));
}, { once: true });

function render(question: string, reply: Reply) {
  const retrieval = reply.top
    .map((r) => `<li>${escape(r.card.title)} — score ${r.score.toFixed(2)} (meaning ${r.meaning.toFixed(2)}, keywords ${r.keywords.toFixed(2)})</li>`)
    .join('');
  const mail = reply.mailto
    ? `<p><a class="mail-btn" href="${reply.mailto}">Email Samiul this question</a></p>
       <p class="muted small">This opens your email app with the question filled in.</p>`
    : '';
  const block = document.createElement('div');
  block.className = 'turn';
  block.innerHTML = `
    <p class="q">${escape(question)}</p>
    <p class="a">${escape(reply.text)}</p>
    ${mail}
    <ol class="retrieval small muted" ${showRetrieval.checked ? '' : 'hidden'}>${retrieval}</ol>`;
  log.prepend(block);
}

showRetrieval.addEventListener('change', () => {
  log.querySelectorAll<HTMLElement>('.retrieval').forEach((el) => (el.hidden = !showRetrieval.checked));
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  input.value = '';
  status.textContent = 'Thinking…';
  try {
    render(question, await ask(question));
    status.textContent = '';
  } catch {
    status.textContent = 'Something went wrong loading the chatbot. Please try again.';
  }
});
