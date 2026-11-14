// "Ask Samiul": input, suggested-question bubbles, answers, retrieval view.

import { ask, warmUp, type Reply } from '../chat/engine';
import { SUGGESTED_QUESTIONS } from '../data/graph';
import { escapeHtml, linkify } from './text';

export function createAsk(host: HTMLElement) {
  host.innerHTML = `
    <div class="ask-head">
      <h2 id="ask-title">Ask Samiul</h2>
      <label class="toggle"><input type="checkbox" id="show-retrieval" /> Show matches</label>
    </div>
    <p class="muted small">Finds the closest answer I've written. It runs in your browser, with no AI model behind it.</p>
    <form id="ask-form">
      <input id="q" autocomplete="off" placeholder="Ask about my work, projects or skills" aria-labelledby="ask-title" />
      <button type="submit">Ask</button>
    </form>
    <div class="bubbles" role="list" aria-label="Suggested questions">
      ${SUGGESTED_QUESTIONS.map((q) => `<button type="button" class="bubble" role="listitem">${escapeHtml(q)}</button>`).join('')}
    </div>
    <p id="status" class="muted small" aria-live="polite"></p>
    <div id="log" aria-live="polite"></div>`;

  const form = host.querySelector<HTMLFormElement>('#ask-form')!;
  const input = host.querySelector<HTMLInputElement>('#q')!;
  const status = host.querySelector<HTMLParagraphElement>('#status')!;
  const log = host.querySelector<HTMLDivElement>('#log')!;
  const showRetrieval = host.querySelector<HTMLInputElement>('#show-retrieval')!;

  // The ~23 MB model downloads only once the visitor shows interest.
  let warming = false;
  function startWarmUp() {
    if (warming) return;
    warming = true;
    status.textContent = 'Loading the chatbot…';
    warmUp((p) => (status.textContent = `Loading the chatbot… ${p}%`))
      .then(() => (status.textContent = ''))
      .catch(() => {
        warming = false;
        status.textContent = 'Could not load the chatbot. Check your connection and try again.';
      });
  }
  input.addEventListener('focus', startWarmUp);

  function render(question: string, reply: Reply) {
    const retrieval = reply.top
      .map(
        (r) =>
          `<li><span class="m-title">${escapeHtml(r.card.title)}</span><span class="m-score">${r.score.toFixed(2)}</span><span class="m-detail">meaning ${r.meaning.toFixed(2)}, keywords ${r.keywords.toFixed(2)}</span></li>`,
      )
      .join('');
    const mail = reply.mailto
      ? `<a class="mail-btn" href="${reply.mailto}">Email me this question</a>
         <p class="muted small">Opens your email app with the question filled in.</p>`
      : '';
    const turn = document.createElement('div');
    turn.className = `turn ${reply.answered ? 'answered' : 'unanswered'}`;
    turn.innerHTML = `
      <p class="msg-q">${escapeHtml(question)}</p>
      <div class="msg-a">
        <p>${linkify(reply.text)}</p>
        ${mail}
      </div>
      <ol class="retrieval" ${showRetrieval.checked ? '' : 'hidden'}>${retrieval}</ol>`;
    log.prepend(turn);
  }

  async function submit(question: string) {
    question = question.trim();
    if (!question) return;
    startWarmUp();
    input.value = '';
    status.textContent = 'Looking for an answer…';
    try {
      render(question, await ask(question));
      status.textContent = '';
    } catch {
      status.textContent = 'Something went wrong loading the chatbot. Please try again.';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit(input.value);
  });
  host.querySelectorAll<HTMLButtonElement>('.bubble').forEach((b) =>
    b.addEventListener('click', () => submit(b.textContent ?? '')),
  );
  showRetrieval.addEventListener('change', () => {
    log.querySelectorAll<HTMLElement>('.retrieval').forEach((el) => (el.hidden = !showRetrieval.checked));
  });
}
