// Renders the lesson to a standalone page served by the site
// (public/workshops/scaffold-clean-structure.html) and to a fragment for
// hosts that add their own document skeleton (dist/, not committed).
// Content is complete without JavaScript; the script only adds the
// switches, the class clock, copy buttons and the tour quiz.
//
// Run: npm run build:workshops
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildContent } from "./content.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
// Every code file shown on the page is read from the tested reference solution.
const kit = path.join(here, "solution");
const C = buildContent(kit);
const TRACKS = ["full", "react", "dotnet"];

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
function fmt(s) {
  return String(s)
    .split(/(`[^`]+`)/g)
    .map((p) =>
      p.length > 1 && p.startsWith("`") && p.endsWith("`")
        ? `<code>${esc(p.slice(1, -1))}</code>`
        : esc(p)
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(
              /(https?:\/\/localhost:\d+[^\s,.):]*)/g,
              '<a href="$1" target="_blank" rel="noopener">$1</a>',
            ),
    )
    .join("");
}
const stackAttr = (s) => (s ? ` data-stack="${s}"` : "");
const stackTag = (s) =>
  s
    ? `<span class="stack-tag" data-s="${s}">${s === "dotnet" ? ".NET" : "React"}</span>`
    : "";

/** One element per distinct text across tracks; identical text renders once. */
function variants(tag, cls, base, vars, render = fmt) {
  const groups = new Map();
  for (const t of TRACKS) {
    const v = vars && vars[t] !== undefined ? vars[t] : base;
    if (v === undefined) continue;
    if (!groups.has(v)) groups.set(v, []);
    groups.get(v).push(t);
  }
  const c = cls ? ` class="${cls}"` : "";
  if (groups.size === 1 && [...groups.values()][0].length === 3)
    return `<${tag}${c}>${render([...groups.keys()][0])}</${tag}>`;
  return [...groups]
    .map(
      ([v, ts]) =>
        `<${tag}${c} data-variant="${ts.join(" ")}">${render(v)}</${tag}>`,
    )
    .join("");
}

function term(block) {
  const label = block.label
    ? variants("span", "", block.label, block.labelVariants, esc)
    : `<span data-shell-only="ps">PowerShell</span><span data-shell-only="sh">Terminal</span>`;
  const lines = block.lines
    .map(
      (l) =>
        `<span class="ln"${l.stack ? ` data-stack="${l.stack}"` : ""}${l.shell ? ` data-shell-only="${l.shell}"` : ""}>${esc(l.t)}</span>`,
    )
    .join("");
  return `<div class="term"${stackAttr(block.stack)}><div class="term-bar"><span class="term-label">${label}</span><button type="button" class="copy">Copy</button></div><pre><code>${lines}</code></pre></div>`;
}

const KIND = {
  new: "New file",
  replace: "Replace file",
  edit: "Edit one line",
};
function fileBlock(f) {
  if (f.kind === "edit") {
    return `<div class="file"><div class="file-bar"><span class="kind kind-edit">${KIND.edit}</span><code class="file-path">${esc(f.path)}</code><button type="button" class="copy" data-text="${esc(f.replace)}">Copy new line</button></div><div class="edit-body"><div class="edit-hint">Find the first line, change it to the second.</div><div class="edit-row old"><span>−</span><code>${esc(f.find)}</code></div><div class="edit-row new"><span>+</span><code>${esc(f.replace)}</code></div></div></div>`;
  }
  const one = (code) =>
    `<div class="file-bar"><span class="kind kind-${f.kind}">${KIND[f.kind]}</span><code class="file-path">${esc(f.path)}</code><button type="button" class="copy">Copy</button></div><pre><code class="block">${esc(code)}</code></pre>`;
  if (f.variants) return variants("div", "file", undefined, f.variants, one);
  return `<div class="file">${one(f.code)}</div>`;
}

function step(s) {
  const text =
    s.text || s.textVariants
      ? variants("p", "step-text", s.text, s.textVariants)
      : "";
  const cmds = (s.cmds || []).map(term).join("");
  const files = s.files
    ? `<div class="files">${s.files.map(fileBlock).join("")}</div>`
    : "";
  const note = s.note
    ? `<p class="note"${stackAttr(s.note.stack)}>${fmt(s.note.text)}</p>`
    : "";
  return `<li class="step"${stackAttr(s.stack)} id="step-${s.id}"><div class="step-head"><label class="tick"><input type="checkbox" id="chk-${s.id}" data-check="${s.id}"><span class="box" aria-hidden="true"></span><span class="step-title">${esc(s.title)}</span></label>${stackTag(s.stack)}</div>${text}${cmds}${files}${note}</li>`;
}

function teacher(t) {
  if (!t) return "";
  const list = (items) =>
    items.length === 1
      ? fmt(items[0])
      : `<ul>${items.map((i) => `<li>${fmt(i)}</li>`).join("")}</ul>`;
  const rows = [];
  if (t.say) rows.push(["Say", list(t.say)]);
  if (t.ask) rows.push(["Ask", fmt(t.ask)]);
  if (t.point) rows.push(["Point out", fmt(t.point)]);
  if (t.watch) rows.push(["Watch for", list(t.watch)]);
  if (t.ifBehind) rows.push(["If you're behind", fmt(t.ifBehind)]);
  return `<aside class="teacher teacher-panel" aria-label="Teacher notes"><div class="tlabel">Teacher notes</div><dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></aside>`;
}

function tour() {
  let html = `<div class="tour" id="tour-quiz"><div class="tour-tools"><button type="button" class="btn" id="tour-check">Check my answers</button><button type="button" class="btn ghost" id="tour-reset">Start over</button><span class="tour-score" id="tour-score" aria-live="polite"></span></div>`;
  let area = null;
  C.tour.forEach((it, i) => {
    if (it.area !== area) {
      if (area !== null) html += `</ul>`;
      area = it.area;
      const s = C.tour.find((x) => x.area === area).stack;
      html += `<h3 class="tour-area"${stackAttr(s)}>${esc(area)}</h3><ul class="tour-list"${stackAttr(s)}>`;
    }
    const id = `t${i}`;
    const choices = ["keep", "change", "delete", "ignore"]
      .map(
        (c) =>
          `<button type="button" data-choice="${c}"${c === it.answer ? ' class="answer"' : ""} aria-pressed="false">${c[0].toUpperCase() + c.slice(1)}</button>`,
      )
      .join("");
    html += `<li class="tour-item"${stackAttr(it.stack)} data-id="${id}" data-answer="${it.answer}"><div><div class="tour-path"><code>${esc(it.path)}</code></div><p class="tour-what">${fmt(it.what)}</p></div><div class="choices" role="group" aria-label="What to do with ${esc(it.path)}">${choices}</div><p class="tour-why"><b>${it.answer}.</b> ${fmt(it.why)}</p></li>`;
  });
  return html + `</ul></div>`;
}

function treeFig(t, stack) {
  const rows = t.rows
    .map(
      (r) =>
        `<span class="tn">${esc(r.name)}</span><span class="tc">${esc(r.note)}</span>`,
    )
    .join("");
  return `<figure class="tree" data-stack="${stack}"><figcaption>${esc(t.title)}</figcaption><div class="tree-rows">${rows}</div></figure>`;
}

function box(x, y, label, sub, core = false) {
  return `<rect class="${core ? "dg-core" : "dg-box"}" x="${x}" y="${y}" width="160" height="48" rx="6"/><text class="dg-label" x="${x + 80}" y="${y + 21}" text-anchor="middle">${esc(label)}</text><text class="dg-sub" x="${x + 80}" y="${y + 37}" text-anchor="middle">${esc(sub)}</text>`;
}
const DOTNET_SVG = `<svg viewBox="0 0 600 312" role="img" aria-label="Project references in the large .NET structure. Api references Application and Infrastructure. Infrastructure references Application. UnitTests references Application. Application references Domain. Domain references nothing.">
<defs><marker id="ah-net" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="dg-edge dashed" d="M200,44 H398" marker-end="url(#ah-net)"/><text class="dg-elabel" x="300" y="36" text-anchor="middle">wires up in Program.cs</text>
<path class="dg-edge" d="M120,68 V104 H270 V134" marker-end="url(#ah-net)"/><text class="dg-elabel" x="195" y="96" text-anchor="middle">calls use cases</text>
<path class="dg-edge" d="M480,68 V104 H330 V134" marker-end="url(#ah-net)"/><text class="dg-elabel" x="405" y="96" text-anchor="middle">implements interfaces</text>
<path class="dg-edge" d="M160,160 H218" marker-end="url(#ah-net)"/><text class="dg-elabel" x="189" y="152" text-anchor="middle">tests</text>
<path class="dg-edge" d="M300,184 V250" marker-end="url(#ah-net)"/><text class="dg-elabel" x="308" y="222">uses Course</text>
${box(40, 20, "Api", "endpoints, Program.cs")}${box(400, 20, "Infrastructure", "in-memory repository")}${box(0, 136, "UnitTests", "fake repository")}${box(220, 136, "Application", "use cases, interfaces")}${box(220, 252, "Domain", "references nothing", true)}
</svg>`;
const REACT_SVG = `<svg viewBox="0 0 600 300" role="img" aria-label="Allowed imports in the large React structure. app imports each feature through its index.ts. Features import shared. features/courses never imports features/students, and the other way round.">
<defs><marker id="ah-web" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker><marker id="ah-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="dg-head bad" d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="dg-edge" d="M270,68 V96 H120 V122" marker-end="url(#ah-web)"/><text class="dg-elabel" x="195" y="88" text-anchor="middle">imports index.ts</text>
<path class="dg-edge" d="M330,68 V96 H480 V122" marker-end="url(#ah-web)"/><text class="dg-elabel" x="405" y="88" text-anchor="middle">imports index.ts</text>
<path class="dg-edge" d="M120,172 V256 H218" marker-end="url(#ah-web)"/><text class="dg-elabel" x="170" y="248" text-anchor="middle">imports</text>
<path class="dg-edge" d="M480,172 V256 H382" marker-end="url(#ah-web)"/><text class="dg-elabel" x="430" y="248" text-anchor="middle">imports</text>
<path class="dg-edge bad" d="M202,148 H398" marker-start="url(#ah-bad)" marker-end="url(#ah-bad)"/><text class="dg-elabel bad" x="300" y="140" text-anchor="middle">never</text><path class="dg-edge bad" style="stroke-dasharray:none;stroke-width:2" d="M293,141 L307,155 M307,141 L293,155"/>
${box(220, 20, "app/", "App.tsx")}${box(40, 124, "features/courses", "index.ts is the door")}${box(400, 124, "features/students", "the next feature")}${box(220, 232, "shared/", "lib, ui")}
</svg>`;

function concept(kind) {
  const t = C.trees[kind];
  const rules = `<ul class="rules">${t.rules.map((r) => `<li${stackAttr(r.stack)}>${fmt(r.text)}</li>`).join("")}</ul>`;
  const diagrams =
    kind === "large"
      ? `<div class="diagrams"><figure class="diagram" data-stack="dotnet">${DOTNET_SVG}<figcaption>Arrows point at what each project references. Every path ends at Domain, and Domain points at nothing, so business rules never depend on the database or the web.</figcaption></figure><figure class="diagram" data-stack="react">${REACT_SVG}<figcaption>Arrows point at what a folder may import. Features talk to the shell and to shared/, never to each other.</figcaption></figure></div>`
      : "";
  return `<div class="concept"><div class="trees">${treeFig(t.dotnet, "dotnet")}${treeFig(t.react, "react")}</div>${rules}${diagrams}</div>`;
}

function signals() {
  return `<div class="signals"><h3>Switch from small to large when…</h3><ul>${C.signals.map((s) => `<li>${fmt(s)}</li>`).join("")}</ul><p>Until then, stay small: fewer projects and folders means faster changes.</p></div>`;
}
function exitTicket(items) {
  return `<div class="exit"><h3>Exit ticket</h3><ol>${items.map((e) => `<li${stackAttr(e.stack)}>${fmt(e.q)}<div class="teacher">Answer: ${fmt(e.a)}</div></li>`).join("")}</ol></div>`;
}

const full = C.tracks.full.minutes;
let startMin = 0;
const sections = C.segments
  .map((s, i) => {
    const win = `0:${String(startMin).padStart(2, "0")}–0:${String(startMin + full[i]).padStart(2, "0")}`;
    startMin += full[i];
    const n = String(i + 1).padStart(2, "0");
    const intro = variants("p", "intro", s.intro, s.introVariants);
    const goals = s.goals
      ? `<ul class="goals">${s.goals.map((g) => (g.variants ? variants("li", "", undefined, g.variants) : `<li>${fmt(g.text)}</li>`)).join("")}</ul>`
      : "";
    const body = [
      s.concept ? concept(s.concept) : "",
      s.tour ? tour() : "",
      s.steps ? `<ol class="steps">${s.steps.map(step).join("")}</ol>` : "",
      s.signals ? signals() : "",
      s.exit ? exitTicket(s.exit) : "",
    ].join("");
    return `<section class="seg" id="${s.id}" data-index="${i}" style="--segn:'${i + 1}'"><header class="seg-head"><div class="seg-num">${n}</div><div><h2>${esc(s.title)}</h2><div class="seg-time"><span data-win="${i}">${win}</span> · <span data-mins="${i}">${full[i]} min</span></div></div></header>${intro}${goals}${teacher(s.teacher)}${body}</section>`;
  })
  .join("");

startMin = 0;
const outline = C.segments
  .map((s, i) => {
    const win = `0:${String(startMin).padStart(2, "0")}–0:${String(startMin + full[i]).padStart(2, "0")}`;
    startMin += full[i];
    return `<li data-index="${i}"><a href="#${s.id}"><span class="n">${String(i + 1).padStart(2, "0")}</span><span>${esc(s.title)}<span class="w" data-win="${i}">${win}</span></span></a></li>`;
  })
  .join("");

const prep = `<section class="teacher teacher-panel prep" id="prep" aria-label="Before class"><div class="tlabel">Teacher notes</div><h2>Before class</h2><ul>${C.prep
  .map(
    (p) =>
      `<li${stackAttr(p.stack)}>${p.variants ? variants("span", "", p.text, p.variants) : fmt(p.text)}${
        p.cmd
          ? term({
              label: p.stack === "react" ? "PowerShell" : "Terminal",
              lines: p.cmd.map((t) => ({ t })),
            })
          : ""
      }</li>`,
  )
  .join("")}</ul></section>`;

const trouble = `<details class="trouble" id="trouble"><summary>Troubleshooting</summary><dl>${C.trouble
  .map(
    (t) =>
      `<div${stackAttr(t.stack)}><dt>${fmt(t.p)}</dt><dd>${fmt(t.fix)}</dd></div>`,
  )
  .join("")}</dl></details>`;

const lede = variants(
  "p",
  "lede",
  "Create an ASP.NET Core Web API and a React app from the official templates, strip them to what matters, then organize the same code for a small project and a large one.",
  {
    react:
      "Create a React app from the official Vite template, strip it to what matters, then organize the same code for a small project and a large one.",
    dotnet:
      "Create an ASP.NET Core Web API from the official template, strip it to what matters, then organize the same code for a small project and a large one.",
  },
);
const facts = `<dl class="facts">
<div><dt>You build</dt>${variants("dd", "", "One repo, `classroom-app`, with an ASP.NET Core API and a React app that lists courses.", { react: "One repo, `classroom-app`, with a React app that lists courses.", dotnet: "One repo, `classroom-app`, with an ASP.NET Core API that serves courses." })}</div>
<div><dt>You leave with</dt><dd>Three Git branches: <code>main</code> (clean template), <code>small</code> and <code>large</code>.</dd></div>
<div><dt>You need</dt>${variants("dd", "", ".NET 10 SDK, Node.js 20.19 or newer, Git, VS Code.", { react: "Node.js 20.19 or newer, Git, VS Code.", dotnet: ".NET 10 SDK, Git, VS Code." })}</div>
</dl>`;

const bootstrap = `<script>(function(){var r=document.documentElement;function g(k,d){try{var v=localStorage.getItem("scs:"+k);return v==null?d:JSON.parse(v)}catch(e){return d}}var p=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||navigator.userAgent||"";r.setAttribute("data-track",g("track","full"));r.setAttribute("data-shell",g("shell",/win/i.test(p)?"ps":"sh"));r.setAttribute("data-teacher",location.hash==="#teacher"?"on":g("teacher","off"));})();</script>`;

const data = JSON.stringify({
  tracks: C.tracks,
  titles: C.segments.map((s) => s.title),
}).replace(/</g, "\\u003c");
const css = readFileSync(path.join(here, "styles.css"), "utf8");
const js = readFileSync(path.join(here, "app.js"), "utf8");

const fragment = `<title>Scaffold, Clean, Structure</title>
<meta name="description" content="A 45-minute hands-on class: create an ASP.NET Core API and a React app from templates, clean them up, and organize the code for small and large projects.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">
<style>
${css}
</style>
${bootstrap}
<div class="wrap">
<header class="mast">
<div class="eyebrow">Architecture Lab · Workshop 01 · 45-minute class</div>
<h1>Scaffold<span class="comma">,</span> Clean<span class="comma">,</span> Structure</h1>
${lede}
${facts}
</header>
<div class="bar" role="region" aria-label="Class settings">
<div class="ctl"><span class="ctl-label">Track</span><div class="seg-ctl" role="group" aria-label="Track"><button type="button" data-set="track" data-value="full">Full stack</button><button type="button" data-set="track" data-value="react">React only</button><button type="button" data-set="track" data-value="dotnet">.NET only</button></div></div>
<div class="ctl"><span class="ctl-label">Shell</span><div class="seg-ctl" role="group" aria-label="Shell"><button type="button" data-set="shell" data-value="ps">PowerShell</button><button type="button" data-set="shell" data-value="sh">macOS / Linux</button></div></div>
<button type="button" class="switch" id="teacher-toggle" aria-pressed="false"><span class="knob" aria-hidden="true"></span>Teacher notes</button>
<div class="clock"><button type="button" class="clock-btn" id="clock-btn">Start class</button><div class="clock-read"><div class="clock-time"><span id="clock-elapsed">0:00</span> <span class="of">/ 45:00</span></div><div class="clock-now" id="clock-now" aria-live="off">Press Start when class begins</div><div class="clock-track" id="clock-track" aria-hidden="true"></div></div><button type="button" class="clock-reset" id="clock-reset">Reset</button></div>
</div>
<div class="layout">
<nav class="outline" aria-label="Lesson outline"><ol>${outline}</ol><ol class="extra"><li class="teacher"><a href="#prep"><span class="n">·</span><span>Before class</span></a></li><li><a href="#trouble"><span class="n">·</span><span>Troubleshooting</span></a></li></ol></nav>
<main>
${prep}
${sections}
${trouble}
<p class="foot">Every command and file on this page was run on the .NET 10.0.113 SDK, Node.js 22, create-vite 9.3.1 with Vite 8.3 and React 19.3, and PowerShell 7.6, in October 2026. Newer template versions may differ in small ways.</p>
</main>
</div>
</div>
<script type="application/json" id="lesson-data">${data}</script>
<script>
${js}
</script>
`;

const doc = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${fragment.replace(/<div class="wrap">[\s\S]*$/, "")}</head>\n<body>\n${fragment.slice(fragment.indexOf('<div class="wrap">'))}</body>\n</html>\n`;

const page = path.resolve(
  here,
  "../../public/workshops/scaffold-clean-structure.html",
);
mkdirSync(path.dirname(page), { recursive: true });
writeFileSync(page, doc);
mkdirSync(path.join(here, "dist"), { recursive: true });
writeFileSync(
  path.join(here, "dist", "scaffold-clean-structure.html"),
  fragment,
);
console.log(
  `${path.relative(process.cwd(), page)} ${Math.round(doc.length / 1024)} KB · ${C.segments.length} segments · ${C.tour.length} tour items`,
);
