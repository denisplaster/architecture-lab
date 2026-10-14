/**
 * Markdown-lite parser used for all prose content.
 *
 * Supported: paragraphs separated by blank lines, `- ` bullet lists,
 * **bold**, `inline code`, and fenced ``` code blocks. Deliberately nothing
 * else, so content stays portable and the renderer stays tiny.
 */

export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "code"; text: string };

export type Block =
  | { type: "p"; inlines: Inline[] }
  | { type: "ul"; items: Inline[][] }
  | { type: "code"; lang?: string; code: string };

const INLINE_TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ type: "text", text: text.slice(last, idx) });
    const tok = m[0];
    if (tok.startsWith("**"))
      out.push({ type: "strong", text: tok.slice(2, -2) });
    else out.push({ type: "code", text: tok.slice(1, -1) });
    last = idx + tok.length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", inlines: parseInline(para.join(" ").trim()) });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({
        type: "ul",
        items: list.map((item) => parseInline(item.trim())),
      });
      list = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^```(\w+)?\s*$/.exec(line);
    if (fence) {
      flushPara();
      flushList();
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang: fence[1], code: code.join("\n") });
      continue;
    }
    if (/^\s*$/.test(line)) {
      flushPara();
      flushList();
      continue;
    }
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushPara();
      (list ??= []).push(bullet[1]);
      continue;
    }
    if (list) {
      // Continuation line of the previous bullet.
      list[list.length - 1] += " " + line.trim();
      continue;
    }
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return blocks;
}

/** Plain-text rendering, used for word counts and search. */
export function toPlainText(src: string): string {
  return parseMarkdown(src)
    .map((b) => {
      if (b.type === "code") return b.code;
      const inl = b.type === "p" ? [b.inlines] : b.items;
      return inl.map((line) => line.map((i) => i.text).join("")).join("\n");
    })
    .join("\n");
}

export function wordCount(src: string): number {
  return toPlainText(src).split(/\s+/).filter(Boolean).length;
}
