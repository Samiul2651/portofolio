// Radial mind map in plain SVG.
// Root view: "Samiul" in the centre, topics in a ring.
// Topic view: the topic moves to the centre and its items fan out in a ring.

import { TOPICS, ROOT_CARD, type GraphTopic } from '../data/graph';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = 360; // viewBox is SIZE x SIZE, so it is 1:1 on a 360px-wide phone
const C = SIZE / 2;

interface NodeSpec {
  key: string;
  label: string;
  r: number;
  x: number;
  y: number;
  kind: 'centre' | 'topic' | 'item';
  inProgress?: boolean;
  onSelect: () => void;
}

export interface GraphOptions {
  onOpenCard: (cardId: string) => void;
  onViewChange?: (topic: GraphTopic | null) => void;
}

export function createGraph(host: HTMLElement, opts: GraphOptions) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute('class', 'graph');
  svg.setAttribute('role', 'group');
  host.append(svg);

  const edges = document.createElementNS(SVG_NS, 'g');
  const nodes = document.createElementNS(SVG_NS, 'g');
  svg.append(edges, nodes);

  function ring(count: number, radius: number, i: number) {
    // Start at the top and go clockwise.
    const a = -Math.PI / 2 + (2 * Math.PI * i) / count;
    return { x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) };
  }

  function showRoot() {
    const specs: NodeSpec[] = [
      { key: 'root', label: 'Samiul', r: 46, x: C, y: C, kind: 'centre', onSelect: () => opts.onOpenCard(ROOT_CARD) },
      ...TOPICS.map((t, i) => ({
        key: t.id,
        label: t.label,
        r: 38,
        ...ring(TOPICS.length, 126, i),
        kind: 'topic' as const,
        onSelect: () => showTopic(t),
      })),
    ];
    svg.setAttribute('aria-label', 'Mind map of Samiul. Tap a topic to open it.');
    draw(specs);
    opts.onViewChange?.(null);
  }

  function showTopic(topic: GraphTopic) {
    const n = topic.items.length;
    // Bigger rings for more items so labels don't collide; 1 item sits above the centre.
    const radius = n === 1 ? 110 : Math.min(130, Math.max(105, (n * 66) / (2 * Math.PI)));
    const itemR = n > 8 ? 29 : 33;
    const specs: NodeSpec[] = [
      { key: topic.id, label: topic.label, r: 46, x: C, y: C, kind: 'centre', onSelect: showRoot },
      ...topic.items.map((item, i) => ({
        key: item.card,
        label: item.label,
        r: itemR,
        ...ring(n, radius, i),
        kind: 'item' as const,
        inProgress: item.inProgress,
        onSelect: () => opts.onOpenCard(item.card),
      })),
    ];
    svg.setAttribute('aria-label', `${topic.label.replace('\n', ' ')}. Tap an item to read more.`);
    draw(specs);
    opts.onViewChange?.(topic);
  }

  function draw(specs: NodeSpec[]) {
    edges.replaceChildren();
    nodes.replaceChildren();
    const [centre, ...outer] = specs;

    for (const s of outer) {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(centre.x));
      line.setAttribute('y1', String(centre.y));
      line.setAttribute('x2', String(s.x));
      line.setAttribute('y2', String(s.y));
      line.setAttribute('class', 'edge');
      edges.append(line);
    }

    for (const s of specs) {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', `node node-${s.kind}${s.inProgress ? ' in-progress' : ''}`);
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      const name = s.label.replace(/\n/g, ' ');
      g.setAttribute(
        'aria-label',
        s.kind === 'centre' && s.key !== 'root' ? `Back to Samiul (now showing ${name})` : name + (s.inProgress ? ', in progress' : ''),
      );
      // Start at the centre, then move out: gives the "fan out" animation.
      g.style.transform = `translate(${C}px, ${C}px)`;

      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('r', String(s.r));
      g.append(circle);

      const lines = s.label.split('\n');
      const fontSize = s.kind === 'item' ? (s.r < 31 ? 9.5 : 10.5) : s.kind === 'topic' ? 11.5 : 14;
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', String(fontSize));
      lines.forEach((ln, i) => {
        const tspan = document.createElementNS(SVG_NS, 'tspan');
        tspan.setAttribute('x', '0');
        tspan.setAttribute('dy', i === 0 ? `${(-(lines.length - 1) * 1.15) / 2 + 0.35}em` : '1.15em');
        tspan.textContent = ln;
        text.append(tspan);
      });
      g.append(text);

      if (s.inProgress) {
        const tag = document.createElementNS(SVG_NS, 'text');
        tag.setAttribute('class', 'tag');
        tag.setAttribute('text-anchor', 'middle');
        tag.setAttribute('font-size', '8.5');
        tag.setAttribute('y', String(s.r + 11));
        tag.textContent = 'in progress';
        g.append(tag);
      }

      const select = () => s.onSelect();
      g.addEventListener('click', select);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }
      });
      nodes.append(g);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          g.style.transform = `translate(${s.x}px, ${s.y}px)`;
          g.classList.add('shown');
        }),
      );
    }
    requestAnimationFrame(() => edges.classList.add('shown'));
    edges.classList.remove('shown');
  }

  showRoot();
  return { showRoot, showTopic };
}
