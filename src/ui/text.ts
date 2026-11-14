export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Escape text, then turn bare links (github.com/..., name@mail.com) into anchors. */
export function linkify(text: string): string {
  return escapeHtml(text)
    .replace(/\b([\w.+-]+@[\w-]+\.[\w.]+[a-z])\b/gi, '<a href="mailto:$1">$1</a>')
    .replace(
      /(?<![\w@/.])((?:github\.com|linkedin\.com|codeforces\.com|ieeexplore\.ieee\.org)\/[^\s,;]*[^\s,;.])/g,
      '<a href="https://$1" target="_blank" rel="noopener">$1</a>',
    );
}
