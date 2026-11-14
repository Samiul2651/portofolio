import { describe, expect, it } from 'vitest';
import { bm25Scores, buildBm25, tokenize } from '../src/chat/keywords';
import { buildRankIndex, canAnswer, rank, type Card } from '../src/chat/rank';
import { mailtoFor, PUBLIC_EMAIL } from '../src/chat/engine';
import cards from '../src/data/cards.json';

const card = (id: string, title: string, answer: string, questions: string[] = []): Card => ({
  id, category: 'Test', title, answer, questions,
});

// 3-dim unit vectors stand in for real embeddings.
const X = [1, 0, 0];
const Y = [0, 1, 0];
const Z = [0, 0, 1];

describe('tokenize', () => {
  it('keeps tech names and drops stopwords', () => {
    expect(tokenize('Do you know C# and .NET?')).toEqual(['know', 'csharp', 'dotnet']);
  });
  it('strips simple plurals but not "ss" words', () => {
    expect(tokenize('projects class')).toEqual(['project', 'class']);
  });
});

describe('bm25', () => {
  it('ranks the card with the exact term first', () => {
    const idx = buildBm25(['RabbitMQ MassTransit sagas', 'Angular TypeScript', 'ICPC contest']);
    const s = bm25Scores(idx, 'rabbitmq experience?');
    expect(s[0]).toBeGreaterThan(0);
    expect(s[1]).toBe(0);
    expect(s[2]).toBe(0);
  });
});

describe('rank', () => {
  const testCards = [
    card('mq', 'Messaging', 'RabbitMQ and MassTransit'),
    card('cp', 'Contests', 'ICPC and Codeforces'),
    card('edu', 'Education', 'BRAC University'),
  ];
  const index = buildRankIndex(testCards, [
    { id: 'mq', vectors: [X] },
    { id: 'cp', vectors: [Y] },
    { id: 'edu', vectors: [Z, X] }, // a card can have several vectors
  ]);

  it('meaning picks the closest card', () => {
    const top = rank(index, 'something unrelated', Y)[0];
    expect(top.card.id).toBe('cp');
    expect(top.meaning).toBeCloseTo(1);
  });

  it('uses the best of a card\'s vectors', () => {
    const r = rank(index, 'x', Z);
    expect(r[0].card.id).toBe('edu');
  });

  it('keywords break a meaning tie', () => {
    // Query vector equally close to mq and edu (both have X); keyword "rabbitmq" decides.
    const r = rank(index, 'rabbitmq', X);
    expect(r[0].card.id).toBe('mq');
  });

  it('refuses to answer when nothing is close', () => {
    const far = [0.2, 0.2, 0.2]; // low cosine to everything
    const r = rank(index, 'pizza recipe', far);
    expect(canAnswer(r[0])).toBe(false);
  });

  it('answers a strong match', () => {
    expect(canAnswer(rank(index, 'icpc', Y)[0])).toBe(true);
  });
});

describe('cards.json', () => {
  it('has unique ids and every card has questions', () => {
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of cards) expect(c.questions.length).toBeGreaterThan(0);
  });

  it('shows only the main email publicly', () => {
    const text = JSON.stringify(cards);
    expect(text).toContain(PUBLIC_EMAIL);
    expect(text).not.toMatch(/istiaqsamiul@/);
  });
});

describe('mailto', () => {
  it('goes to the main email with the question filled in', () => {
    const link = mailtoFor('Do you like cricket?');
    expect(link.startsWith(`mailto:${PUBLIC_EMAIL}?`)).toBe(true);
    expect(decodeURIComponent(link)).toContain('"Do you like cricket?"');
  });
});

describe('graph', async () => {
  const { TOPICS, ROOT_CARD } = await import('../src/data/graph');
  const ids = new Set(cards.map((c) => c.id));

  it('every graph item points to a real card', () => {
    expect(ids.has(ROOT_CARD)).toBe(true);
    for (const t of TOPICS) for (const item of t.items) expect(ids.has(item.card), item.card).toBe(true);
  });
});

describe('linkify', async () => {
  const { linkify } = await import('../src/ui/text');
  it('links github paths and emails, and escapes HTML', () => {
    const html = linkify('Code: github.com/Samiul2651/EcommerceFullProject. Mail a@b.com <b>');
    expect(html).toContain('<a href="https://github.com/Samiul2651/EcommerceFullProject"');
    expect(html).toContain('<a href="mailto:a@b.com">');
    expect(html).toContain('&lt;b&gt;');
  });
});
