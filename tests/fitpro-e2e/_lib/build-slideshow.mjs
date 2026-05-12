/**
 * Build slideshow HTML từ manifest.json
 *
 * Usage: node tests/fitpro-e2e/_lib/build-slideshow.mjs <role>
 *        node tests/fitpro-e2e/_lib/build-slideshow.mjs --all   (build cả 4 + index.html)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_OUT = path.join(__dirname, "..", "output");

function htmlEscape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function renderRoleHtml(manifest) {
  const slides = manifest.steps.map((s) => `
  <div class="slide" data-idx="${s.idx}">
    <div class="slide-img-wrap">
      <img src="${htmlEscape(s.file)}" alt="Slide ${s.idx}" />
    </div>
    <div class="slide-caption">
      <div class="caption-head">
        <span class="step-no">${String(s.idx).padStart(2, "0")}</span>
        <code class="step-url">${htmlEscape(s.url || "")}</code>
      </div>
      <div class="caption-body">${htmlEscape(s.caption)}</div>
    </div>
  </div>`).join("\n");

  const videoBlock = manifest.video ? `
  <section class="video-section">
    <h2>🎬 Video hành trình end-to-end</h2>
    <video controls src="${htmlEscape(manifest.video)}" style="width:100%;max-width:1024px;border-radius:12px;background:#000"></video>
    <p style="font-size:13px;color:#6B8A85;margin-top:8px">File gốc: <code>${htmlEscape(manifest.video)}</code></p>
  </section>` : `
  <section class="video-section">
    <p style="color:#E8473B">⚠️ Chưa có video. Đảm bảo Playwright recordVideo bật và browser close đúng cách.</p>
  </section>`;

  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${htmlEscape(manifest.title)} — FitPro E2E</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:#F5F9F8;color:#0B2E2A;line-height:1.55}
  header{padding:24px 32px;background:linear-gradient(90deg,#0B2E2A 0%,#114A43 100%);color:#fff}
  header h1{margin:0 0 4px 0;font-size:22px}
  header p{margin:0;font-size:13px;opacity:.85}
  header .meta{margin-top:10px;font-size:11px;opacity:.7}
  main{max-width:1200px;margin:0 auto;padding:24px 32px}
  .toc{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
  .toc a{padding:5px 10px;background:#fff;border:1px solid #d9e0de;border-radius:14px;font-size:11px;color:#0B2E2A;text-decoration:none}
  .toc a:hover{background:#E4F7F3;border-color:#00C9A7}
  .video-section{margin:20px 0 32px;padding:18px;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(11,46,42,.06)}
  .video-section h2{margin:0 0 12px;font-size:17px}
  .slide{display:grid;grid-template-columns:1fr 360px;gap:18px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(11,46,42,.06);margin-bottom:18px}
  .slide-img-wrap{background:#0B2E2A;display:flex;align-items:center;justify-content:center}
  .slide-img-wrap img{display:block;width:100%;height:auto;max-height:560px;object-fit:contain}
  .slide-caption{padding:16px 18px;display:flex;flex-direction:column;justify-content:flex-start}
  .caption-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}
  .step-no{display:inline-block;width:30px;height:30px;line-height:30px;text-align:center;background:#00C9A7;color:#fff;border-radius:50%;font-weight:700;font-size:13px}
  .step-url{font-size:10px;background:#F5F9F8;padding:3px 6px;border-radius:4px;color:#6B8A85;word-break:break-all}
  .caption-body{font-size:13.5px;color:#1F3A36}
  footer{padding:18px 32px;font-size:11px;color:#6B8A85;text-align:center}
  @media (max-width: 900px){.slide{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <h1>${htmlEscape(manifest.title)}</h1>
  <p>FitPro E2E hành trình — ${manifest.steps.length} slide · click slide để zoom · video bên dưới</p>
  <div class="meta">Generated ${htmlEscape(manifest.generated_at)} · base ${htmlEscape(manifest.base_url)}</div>
</header>
<main>
  <div class="toc">
    ${manifest.steps.map((s) => `<a href="#s${s.idx}">${String(s.idx).padStart(2, "0")}</a>`).join("")}
  </div>
  ${videoBlock}
  ${slides.replace(/data-idx="(\d+)"/g, (_, n) => `id="s${n}" data-idx="${n}"`)}
</main>
<footer>FitPro 2027 · prototype slideshow · Reborn JSC</footer>
<script>
  // Click ảnh để mở full
  document.querySelectorAll(".slide-img-wrap img").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => window.open(img.src, "_blank"));
  });
</script>
</body>
</html>`;
}

function renderIndexHtml(roles) {
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>FitPro E2E — 4 vai trò</title>
<style>
  body{font-family:system-ui,sans-serif;background:#F5F9F8;color:#0B2E2A;margin:0;padding:32px;max-width:920px;margin-inline:auto}
  h1{margin:0 0 6px 0}
  .sub{color:#6B8A85;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
  .card{background:#fff;border-radius:12px;padding:18px;box-shadow:0 2px 12px rgba(11,46,42,.06);text-decoration:none;color:inherit;border-top:4px solid #00C9A7}
  .card:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(11,46,42,.12)}
  .card h3{margin:0 0 4px}
  .card p{margin:0 0 8px;color:#6B8A85;font-size:13px}
  .card .meta{font-size:11px;color:#8E9BAE}
</style></head>
<body>
<h1>🏃 FitPro E2E — 4 vai trò</h1>
<p class="sub">Mỗi role là 1 flow end-to-end với video MP4/WEBM + slideshow caption tiếng Việt. Click 1 thẻ để xem.</p>
<div class="grid">
${roles.map((r) => `
  <a class="card" href="${r.role}/index.html">
    <h3>${htmlEscape(r.title)}</h3>
    <p>${r.steps_count} slide · ${r.has_video ? "kèm video" : "không có video"}</p>
    <div class="meta">${htmlEscape(r.role)}/</div>
  </a>`).join("")}
</div>
<p class="sub" style="margin-top:32px;font-size:12px">📄 Storyboard gốc: <a href="../STORYBOARD.md">tests/fitpro-e2e/STORYBOARD.md</a></p>
</body></html>`;
}

function build(role) {
  const dir = path.join(ROOT_OUT, role);
  const manifestPath = path.join(dir, "manifest.json");
  if (!fs.existsSync(manifestPath)) { console.warn(`[skip] ${role}: thiếu manifest.json`); return null; }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const html = renderRoleHtml(manifest);
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(`  ✓ ${role}: ${dir}/index.html`);
  return { role, title: manifest.title, steps_count: manifest.steps.length, has_video: !!manifest.video };
}

const args = process.argv.slice(2);
if (args[0] === "--all") {
  const roles = ["customer", "master", "coach", "admin"];
  const built = roles.map((r) => build(r)).filter(Boolean);
  fs.writeFileSync(path.join(ROOT_OUT, "index.html"), renderIndexHtml(built));
  console.log(`\n✅ Index: ${path.join(ROOT_OUT, "index.html")}`);
} else if (args[0]) {
  build(args[0]);
} else {
  console.log("Usage: node build-slideshow.mjs <role> | --all");
}
