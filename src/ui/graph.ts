// The map, drawn like a message-broker topology.
// Start view: "Samiul" is an exchange (hexagon) with the topics around it.
// Topic view: the topic becomes an exchange on the left and its items are queues
// stacked on the right. Messages (yellow dots) travel along the lines when you tap.

import { TOPICS, ROOT_CARD, type GraphItem } from '../data/graph';

const NS = 'http://www.w3.org/2000/svg';
const W = 360;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface GraphOptions {
  onOpenCard: (cardId: string) => void;
  /** depth 0 = start view; 1 = a topic; 2 = a group inside a topic */
  onViewChange?: (depth: number) => void;
}

interface Group {
  label: string;
  items: GraphItem[];
}

/** Number of cards under an item (a leaf counts as 1). */
const leafCount = (items: GraphItem[]): number =>
  items.reduce((n, it) => n + (it.children ? leafCount(it.children) : 1), 0);
const plural = (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function textEl(attrs: Record<string, string | number>, content: string) {
  const t = el('text', attrs);
  t.textContent = content;
  return t;
}

function hexagon(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return el('polygon', { points: pts.join(' '), class: 'exchange-shape' });
}

function hexagonMarker(cx: number, cy: number, r: number) {
  const h = hexagon(cx, cy, r);
  h.setAttribute('class', 'group-marker');
  return h;
}

/** Break a long single-line label into two lines for the hexagon. */
function wrap(label: string) {
  if (label.includes('\n') || label.length <= 12) return label;
  const mid = label.lastIndexOf(' ', Math.ceil(label.length / 2) + 2);
  return mid > 0 ? `${label.slice(0, mid)}\n${label.slice(mid + 1)}` : label;
}

function multiline(x: number, y: number, label: string, cls: string, size: number) {
  const lines = label.split('\n');
  const t = el('text', { x, y, class: cls, 'font-size': size, 'text-anchor': 'middle' });
  lines.forEach((ln, i) => {
    const s = el('tspan', { x, dy: i === 0 ? `${(-(lines.length - 1) * 1.2) / 2 + 0.35}em` : '1.2em' });
    s.textContent = ln;
    t.append(s);
  });
  return t;
}

/** Make an SVG group act like a button (click + Enter/Space). */
function asButton(g: SVGGElement, label: string, onSelect: () => void) {
  g.setAttribute('role', 'button');
  g.setAttribute('tabindex', '0');
  g.setAttribute('aria-label', label);
  g.addEventListener('click', onSelect);
  g.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  });
}

export function createGraph(host: HTMLElement, opts: GraphOptions) {
  const svg = el('svg', { class: 'topology', role: 'group' });
  host.append(svg);
  let busy = false;
  const stack: Group[] = []; // groups opened so far, for "Back"

  /** Send a message dot along a path. Resolves when it arrives. */
  function sendMessage(path: SVGPathElement, delay = 0, duration = 420): Promise<void> {
    if (reduceMotion()) return Promise.resolve();
    const len = path.getTotalLength();
    const dot = el('circle', { r: 4.5, class: 'message' });
    dot.style.opacity = '0';
    svg.append(dot);
    return new Promise((resolve) => {
      const start = performance.now() + delay;
      const tick = (now: number) => {
        const t = Math.min(Math.max((now - start) / duration, 0), 1);
        const p = path.getPointAtLength(len * (1 - Math.pow(1 - t, 2)));
        dot.setAttribute('cx', String(p.x));
        dot.setAttribute('cy', String(p.y));
        dot.style.opacity = now < start ? '0' : '1';
        if (t < 1) requestAnimationFrame(tick);
        else {
          dot.remove();
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  // ---------- Start view: exchange in the middle, topics around it ----------
  function showRoot() {
    stack.length = 0;
    svg.replaceChildren();
    const H = 360;
    const C = { x: W / 2, y: H / 2 };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('aria-label', 'Map of my work. Tap a topic to open it.');

    const edges = el('g', { class: 'edges' });
    const nodes = el('g');
    svg.append(edges, nodes);

    const boxW = 100;
    const boxH = 46;
    TOPICS.forEach((topic, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / TOPICS.length;
      const x = C.x + 128 * Math.cos(a);
      const y = C.y + 130 * Math.sin(a);
      const path = el('path', { d: `M${C.x},${C.y} L${x},${y}`, class: 'edge' });
      edges.append(path);

      const twoLines = topic.label.includes('\n');
      const count = plural(leafCount(topic.items));
      const g = el('g', { class: 'topic' });
      g.append(
        el('rect', { x: x - boxW / 2, y: y - boxH / 2, width: boxW, height: boxH, class: 'topic-shape' }),
        multiline(x, twoLines ? y - 9 : y - 4, topic.label, 'topic-label', 11.5),
        textEl({ x, y: y + boxH / 2 - 6, class: 'count', 'font-size': 8.5, 'text-anchor': 'middle' }, count),
      );
      asButton(g, `${topic.label.replace('\n', ' ')}, ${count}`, async () => {
        if (busy) return;
        busy = true;
        g.classList.add('active');
        await sendMessage(path);
        busy = false;
        openGroup({ label: topic.label, items: topic.items });
      });
      nodes.append(g);
    });

    const centre = el('g', { class: 'exchange root' });
    centre.append(hexagon(C.x, C.y, 44), multiline(C.x, C.y, 'Samiul', 'exchange-label', 15));
    asButton(centre, 'About me', () => opts.onOpenCard(ROOT_CARD));
    nodes.append(centre);

    opts.onViewChange?.(0);
  }

  // ---------- Group view: exchange on the left, queues stacked on the right ----------
  function openGroup(group: Group) {
    stack.push(group);
    drawGroup(group);
  }

  function back() {
    stack.pop();
    const prev = stack.pop();
    if (prev) openGroup(prev);
    else showRoot();
  }

  function drawGroup(group: Group) {
    svg.replaceChildren();
    const n = group.items.length;
    const rowH = 44;
    const top = 12;
    const H = Math.max(180, top * 2 + n * rowH);
    const ex = { x: 58, y: H / 2 };
    const qx = 160; // left edge of the queues
    const qW = 192;
    const qH = 34;
    const name = group.label.replace('\n', ' ');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('aria-label', `${name}. Tap an item to open it.`);

    const edges = el('g', { class: 'edges' });
    const nodes = el('g');
    svg.append(edges, nodes);

    const paths: SVGPathElement[] = [];
    group.items.forEach((item, i) => {
      const y = n === 1 ? H / 2 : top + rowH * i + rowH / 2;
      const sx = ex.x + 42;
      const midX = (sx + qx) / 2;
      const path = el('path', { d: `M${sx},${ex.y} C${midX},${ex.y} ${midX},${y} ${qx},${y}`, class: 'edge' });
      edges.append(path);
      paths.push(path);

      const label = item.label.replace('\n', ' ');
      const isGroup = !!item.children;
      const sub = isGroup ? plural(leafCount(item.children!)) : item.inProgress ? 'in progress' : '';
      const g = el('g', { class: `queue${isGroup ? ' group' : ''}${item.inProgress ? ' in-progress' : ''}` });
      g.append(el('rect', { x: qx, y: y - qH / 2, width: qW, height: qH, class: 'queue-shape' }));
      if (isGroup) {
        // A group is a small exchange of its own: hexagon marker on the right.
        g.append(hexagonMarker(qx + qW - 16, y, 8));
      } else {
        // Message slots at the right end make it read as a queue.
        for (let s = 0; s < 3; s++) {
          const lx = qx + qW - 10 - s * 7;
          g.append(el('line', { x1: lx, y1: y - qH / 2 + 8, x2: lx, y2: y + qH / 2 - 8, class: 'slot' }));
        }
      }
      g.append(textEl({ x: qx + 10, y: y + (sub ? -2 : 4), class: 'queue-label', 'font-size': 12 }, label));
      if (sub) g.append(textEl({ x: qx + 10, y: y + 11, class: 'count', 'font-size': 8.5 }, sub));

      const a11y = `${label}${sub ? `, ${sub}` : ''}`;
      asButton(g, a11y, async () => {
        if (isGroup) {
          if (busy) return;
          busy = true;
          g.classList.add('active');
          await sendMessage(path);
          busy = false;
          openGroup({ label: item.label, items: item.children! });
        } else if (item.card) {
          opts.onOpenCard(item.card);
        }
      });
      nodes.append(g);
    });

    const centre = el('g', { class: 'exchange' });
    const fontSize = name.length > 12 ? 10.5 : 12;
    centre.append(hexagon(ex.x, ex.y, 44), multiline(ex.x, ex.y, wrap(group.label), 'exchange-label', fontSize));
    asButton(centre, 'Go back', back);
    nodes.append(centre);

    // One orchestrated moment: the exchange fans a message out to every queue.
    paths.forEach((p, i) => sendMessage(p, i * 45, 380));
    opts.onViewChange?.(stack.length);
  }

  showRoot();
  return { showRoot, back };
}
