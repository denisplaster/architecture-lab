/**
 * Inline the Vite build into one HTML file so the app can be opened from a
 * single file, attached to a message, or published as a hosted page.
 *
 * Produces:
 *   dist/arch-lab.html   full standalone document
 *   dist/artifact.html   the same page as a fragment (title, styles, root,
 *                        script) for hosts that wrap pages in their own skeleton
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const html = await readFile(path.join(dist, "index.html"), "utf8");

let styles = "";
let scripts = "";

const cssLinks = [
  ...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g),
];
for (const m of cssLinks) {
  const css = await readFile(
    path.join(dist, m[1].replace(/^\.\//, "")),
    "utf8",
  );
  styles += `<style>${css}</style>\n`;
}
const scriptTags = [
  ...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g),
];
for (const m of scriptTags) {
  const js = await readFile(path.join(dist, m[1].replace(/^\.\//, "")), "utf8");
  scripts += `<script type="module">${js.replace(/<\/script/g, "<\\/script")}</script>\n`;
}

let out = html;
for (const m of cssLinks) out = out.replace(m[0], "");
for (const m of scriptTags) out = out.replace(m[0], "");
out = out
  .replace("</head>", `${styles}</head>`)
  .replace("</body>", `${scripts}</body>`);
await writeFile(path.join(dist, "arch-lab.html"), out);

const title =
  /<title>[^<]*<\/title>/.exec(html)?.[0] ?? "<title>Architecture Lab</title>";
const fonts = [...html.matchAll(/<link[^>]*fonts\.googleapis\.com[^>]*>/g)]
  .map((m) => m[0])
  .join("\n");
const fragment = `${title}\n${fonts}\n${styles}<div id="root"></div>\n${scripts}`;
await writeFile(path.join(dist, "artifact.html"), fragment);

const kb = (s) => `${Math.round(Buffer.byteLength(s) / 1024)} KB`;
console.log(
  `dist/arch-lab.html ${kb(out)} · dist/artifact.html ${kb(fragment)}`,
);
