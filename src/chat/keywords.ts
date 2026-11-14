// Keyword side of the search: a small BM25 over the cards.
// Meaning (embeddings) catches paraphrases; keywords catch exact names like
// "RabbitMQ" or "ICPC" that a small model can blur.

const STOPWORDS = new Set(
  ('a an the and or of to in on at for with by from is are was were be been do does did ' +
    'you your he his him she her they them i me my we our it its this that what which who ' +
    'how when where why can could would should have has had any about tell show give please')
    .split(' '),
);

/** Lowercase, keep tech names intact (c#, .net), drop stopwords, light plural strip. */
export function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/c#/g, ' csharp ')
    .replace(/\.net/g, ' dotnet ')
    .replace(/[^a-z0-9]+/g, ' ');
  return normalized
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => (t.length > 4 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t));
}

export interface Bm25Index {
  docs: Map<string, number>[]; // term counts per card
  lengths: number[];
  avgLength: number;
  df: Map<string, number>; // how many cards contain each term
}

export function buildBm25(texts: string[]): Bm25Index {
  const docs = texts.map((text) => {
    const counts = new Map<string, number>();
    for (const t of tokenize(text)) counts.set(t, (counts.get(t) ?? 0) + 1);
    return counts;
  });
  const lengths = docs.map((d) => [...d.values()].reduce((a, b) => a + b, 0));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / Math.max(docs.length, 1);
  return { docs, lengths, avgLength, df };
}

/** BM25 score of the query against every card (same order as the texts). */
export function bm25Scores(index: Bm25Index, query: string, k1 = 1.2, b = 0.75): number[] {
  const terms = [...new Set(tokenize(query))];
  const n = index.docs.length;
  return index.docs.map((doc, i) => {
    let score = 0;
    for (const t of terms) {
      const tf = doc.get(t);
      if (!tf) continue;
      const df = index.df.get(t) ?? 0;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * index.lengths[i]) / index.avgLength));
    }
    return score;
  });
}
