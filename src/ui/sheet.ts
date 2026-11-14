// Detail card that slides up when an item on the graph is tapped.

import type { Card } from '../chat/rank';
import { linkify } from './text';

export function createSheet(host: HTMLElement) {
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.hidden = true;

  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'sheet-title');
  sheet.innerHTML = `
    <div class="sheet-head">
      <p class="sheet-category" id="sheet-category"></p>
      <button type="button" class="sheet-close" aria-label="Close">✕</button>
    </div>
    <h3 id="sheet-title"></h3>
    <p class="sheet-body" id="sheet-body"></p>`;
  backdrop.append(sheet);
  host.append(backdrop);

  const title = sheet.querySelector<HTMLElement>('#sheet-title')!;
  const category = sheet.querySelector<HTMLElement>('#sheet-category')!;
  const body = sheet.querySelector<HTMLElement>('#sheet-body')!;
  const closeBtn = sheet.querySelector<HTMLButtonElement>('.sheet-close')!;
  let returnFocus: HTMLElement | null = null;

  function open(card: Card) {
    returnFocus = document.activeElement as HTMLElement | null;
    category.textContent = card.category.toLowerCase();
    title.textContent = card.title.replace(/\s*\((done|in progress)\)$/i, '');
    body.innerHTML = linkify(card.answer);
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('open'));
    closeBtn.focus();
  }

  function close() {
    backdrop.classList.remove('open');
    setTimeout(() => (backdrop.hidden = true), 250);
    returnFocus?.focus();
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop.hidden) close();
  });

  return { open, close };
}
