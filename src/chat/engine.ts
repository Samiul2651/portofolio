// Browser side: load the model and vectors on first use, embed the question, rank.

import cardsJson from '../data/cards.json';
import { buildRankIndex, canAnswer, rank, type Card, type CardVectors, type Ranked, type RankIndex } from './rank';

export const PUBLIC_EMAIL = 'ishtiak.samiul.2651@gmail.com';

interface VectorsFile {
  model: string;
  dtype: string;
  dims: number;
  cards: CardVectors[];
}

export interface Reply {
  answered: boolean;
  text: string;
  top: Ranked[]; // for the "Show retrieval" view
  mailto?: string; // only when not answered
}

type Embedder = (text: string, opts: object) => Promise<{ tolist(): number[][] }>;

interface Ready {
  index: RankIndex;
  embed: Embedder;
}

let ready: Promise<Ready> | null = null;

/** Starts loading (~23 MB model + vectors). Safe to call many times. */
export function warmUp(onProgress?: (percent: number) => void): Promise<Ready> {
  ready ??= (async () => {
    const res = await fetch(`${import.meta.env.BASE_URL}vectors.json`);
    if (!res.ok) throw new Error('Could not load vectors.json');
    const vectors = (await res.json()) as VectorsFile;

    const { pipeline } = await import('@huggingface/transformers');
    const extractor = await pipeline('feature-extraction', vectors.model, {
      dtype: vectors.dtype as 'q8',
      progress_callback: (p: { status: string; progress?: number }) => {
        if (p.status === 'progress' && p.progress != null) onProgress?.(Math.round(p.progress));
      },
    });

    return {
      index: buildRankIndex(cardsJson as Card[], vectors.cards),
      embed: extractor as unknown as Embedder,
    };
  })();
  ready.catch(() => (ready = null)); // allow a retry after a network error
  return ready;
}

export function mailtoFor(question: string): string {
  const subject = encodeURIComponent('Question from your portfolio');
  const body = encodeURIComponent(`Hi Samiul,\n\nYour site's chatbot couldn't answer this:\n\n"${question}"\n\n`);
  return `mailto:${PUBLIC_EMAIL}?subject=${subject}&body=${body}`;
}

export async function ask(question: string): Promise<Reply> {
  const { index, embed } = await warmUp();
  const tensor = await embed(question, { pooling: 'mean', normalize: true });
  const top = rank(index, question, tensor.tolist()[0]).slice(0, 3);

  if (canAnswer(top[0])) return { answered: true, text: top[0].card.answer, top };
  return {
    answered: false,
    text: "Samiul hasn't written an answer to that yet. Email him the question and he'll reply.",
    top,
    mailto: mailtoFor(question),
  };
}
