// Renders the profile images (dark and light) from HTML with headless Chrome. No dependencies:
//   node profile/src/render.mjs
// Design tokens, mark and line art follow www.klein.business (repo klein-business-web).
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(fileURLToPath(import.meta.url), "..");
const OUT = resolve(SRC, "../assets");
const CHROME =
  process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const THEMES = {
  dark: { bg: "#0c0d0e", card: "#16181a", text: "#f4f5f6", muted: "#a3a9b0", line: "rgb(255 255 255 / .12)", signal: "#3fd0d8", stem: "#ffffff" },
  light: { bg: "#ffffff", card: "#f3f4f5", text: "#0c0d0e", muted: "#5b6168", line: "#e2e4e7", signal: "#0a7c86", stem: "#0c0d0e" },
};

const mark = (t) =>
  `<svg viewBox="0 0 40 40"><path fill="#7d868e" d="M21.4 19 33.5 34h-7l-8.6-11.2z"/><path fill="${t.stem}" d="M8 6h6v28H8z"/><path fill="${t.signal}" d="M14 19.5 26.5 6h7L14 27z"/></svg>`;

// The isometric building block with sight lines, as on the website hero.
const art = (t) => {
  const [cx, cy] = [600, 300];
  const at = (r, d) => [cx + r * Math.cos((d * Math.PI) / 180), cy + r * Math.sin((d * Math.PI) / 180)];
  const pt = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const hex = (r) => [-90, -30, 30, 90, 150, 210].map((d) => at(r, d));
  const [top, tr, br, b, bl, tl] = hex(150);
  const rays = Array.from({ length: 24 }, (_, i) => `M${pt(at(190, i * 15 - 90))}L${pt(at(1600, i * 15 - 90))}`).join("");
  return `<svg class="art" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice"><path d="${rays}" stroke="${t.line}" fill="none"/><path d="M${hex(250).map(pt).join("L")}Z" stroke="${t.line}" stroke-dasharray="4 6" fill="none"/><path d="M${pt(top)}L${pt(tr)}L${cx} ${cy}L${pt(tl)}Z" fill="${t.signal}" fill-opacity=".14"/><path d="M${[top, tr, br, b, bl, tl].map(pt).join("L")}ZM${cx} ${cy}L${pt(tl)}M${cx} ${cy}L${pt(tr)}M${cx} ${cy}L${pt(b)}" stroke="${t.signal}" stroke-width="1.6" fill="none"/></svg>`;
};

const lockup = (t, size = 22) =>
  `<div class="lockup"><span class="mk" style="width:${size * 1.7}px;height:${size * 1.7}px">${mark(t)}</span><span class="wm"><b style="font-size:${size}px">klein</b><span style="font-size:${size * 0.53}px">business</span></span></div>`;

const page = (t, w, h, body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"IBM Plex Sans";src:url(${join(SRC, "plex-sans-var.woff2")}) format("woff2");font-weight:100 700}
*{box-sizing:border-box}html,body{margin:0}
body{width:${w}px;height:${h}px;overflow:hidden;background:${t.bg};color:${t.text};font-family:"IBM Plex Sans";position:relative;-webkit-font-smoothing:antialiased}
.art{position:absolute;inset:0;width:100%;height:100%}
.lockup{display:flex;align-items:center;gap:10px}.mk svg{width:100%;height:100%;display:block}
.wm{display:flex;flex-direction:column;line-height:1;text-transform:uppercase}.wm b{font-weight:600;letter-spacing:.215em}.wm span{margin-top:4px;font-weight:500;letter-spacing:.415em;color:${t.muted}}
.eyebrow{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${t.signal};margin:0}
h1,h2,h3{font-weight:400;margin:0;letter-spacing:-.02em}
</style></head><body>${body}</body></html>`;

const IMAGES = {
  hero: [800, 300, (t) => `${art(t)}<div style="position:absolute;inset:0;background:linear-gradient(90deg,${t.bg} 38%,transparent 75%)"></div>
    <div style="position:relative;padding:34px 40px;height:100%;display:flex;flex-direction:column;justify-content:space-between">
      ${lockup(t, 15)}
      <div><p class="eyebrow">IT consulting · Engineering · Product development</p>
      <h1 style="font-size:46px;line-height:1.05;margin-top:12px">Think big.<br>Start Klein.</h1></div>
      <p style="margin:0;font-size:12px;color:${t.muted}">Munich, Germany · since 2017 · www.klein.business</p></div>`],
  figures: [800, 150, (t) => `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:26px 40px;border-top:1px solid ${t.line};border-bottom:1px solid ${t.line};height:100%">
    ${[["2017", "founded – working for enterprises and mid-sized companies ever since"], ["5", "DAX companies among our references"], ["8", "industries, from automotive to private equity"], ["1", "team for the whole way: strategy, delivery, operations"]]
      .map(([v, l]) => `<div><div style="font-size:54px;font-weight:300;line-height:1;letter-spacing:-.04em">${v}</div><div style="margin-top:10px;font-size:11.5px;line-height:1.45;color:${t.muted}">${l}</div></div>`)
      .join("")}</div>`],
  capabilities: [800, 300, (t) => `<div style="padding:28px 40px"><p class="eyebrow">Services</p><h2 style="font-size:24px;margin:8px 0 20px">Consulting, engineering and operations from a single source</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${[
      ["Strategy & governance", ["IT strategy & due diligence", "Project & programme management", "Compliance & data protection", "Digital presence, SEO & GEO"]],
      ["Architecture & engineering", ["Cloud & solution architecture", "Software & product development", "AI agents & automation", "Data & integration"]],
      ["Modernisation & operations", ["Legacy & mainframe modernisation", "Platform engineering & DevOps", "Quality assurance & testing", "IT security & audits"]],
    ].map(([h, items]) => `<div style="background:${t.card};padding:16px 18px"><h3 style="font-size:15px;margin-bottom:8px">${h}</h3>${items.map((i) => `<div style="font-size:11.5px;color:${t.muted};padding:6px 0;border-bottom:1px solid ${t.line}">${i}</div>`).join("")}</div>`).join("")}</div></div>`],
  "oss-legal-text-mcp-de": [390, 150, (t) => card(t, "legal-text-mcp-de", "MCP server, HTTP API & CLI for German federal and state legal texts – canonical IDs and cite-grade source provenance.", "Python · MCP")],
  "oss-portable-agent-workflows": [390, 150, (t) => card(t, "portable-agent-workflows", "Harness-agnostic agent workflows with shared skills, durable artifacts and review gates for Codex, Claude Code, Cursor and OpenCode.", "JavaScript · Agents")],
  contact: [800, 120, (t) => `<div style="height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 40px;background:${t.card}">
    <div><p class="eyebrow">Contact</p><h2 style="font-size:26px;margin-top:6px">Let's talk about your next platform.</h2></div>
    <div style="text-align:right;font-size:13px;line-height:1.7"><div>www.klein.business</div><div style="color:${t.muted}">contact@klein.business</div></div></div>`],
};

function card(t, name, desc, tag) {
  return `<div style="height:100%;padding:20px 22px;background:${t.card};border-top:3px solid ${t.signal};display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><h3 style="font-size:17px;font-weight:500">${name}</h3><span style="color:${t.signal};font-size:16px">↗</span></div>
    <p style="margin:8px 0 0;font-size:11.5px;line-height:1.5;color:${t.muted}">${desc}</p>
    <p class="eyebrow" style="margin-top:auto">${tag}</p></div>`;
}

const work = mkdtempSync(join(tmpdir(), "kb-profile-"));
for (const [name, [w, h, body]] of Object.entries(IMAGES)) {
  for (const [theme, t] of Object.entries(THEMES)) {
    const html = join(work, `${name}-${theme}.html`);
    writeFileSync(html, page(t, w, h, body(t)));
    const png = join(OUT, `${name}-${theme}.png`);
    rmSync(png, { force: true });
    spawnSync(CHROME, [`--user-data-dir=${join(work, `chrome-${name}-${theme}`)}`, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--force-device-scale-factor=2", "--virtual-time-budget=1500", `--window-size=${w},${h}`, `--screenshot=${join(OUT, `${name}-${theme}.png`)}`, `file://${html}`], { stdio: "ignore" });
    // Headless Chrome may exit non-zero on macOS display warnings; the written file is what counts.
    if (!existsSync(png)) throw new Error(`Chrome did not render ${png}`);
  }
}
console.log(`rendered ${Object.keys(IMAGES).length * 2} images into ${OUT}`);
