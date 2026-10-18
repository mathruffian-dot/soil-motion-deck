// SOIL × motion deck helpers (PptxGenJS 3.12+, LAYOUT_WIDE 13.333 x 7.5 in).
// Sandwich structure: dark cover / action / ending, light content pages; animations sit in a dark
// "player window" so the film's three-color theme reads as a screen inside a light page.
//
//   const pptxgen = require("pptxgenjs");
//   const { makeDeck } = require("./deck_helpers");
//   const pptx = new pptxgen(); pptx.layout = "LAYOUT_WIDE";
//   const D = makeDeck(pptx, { theme: { bg: "121212", fg: "F2F0EA", accent: "FF7A1A" }, mediaDir: __dirname + "/media" });
//   const s = D.lightSlide("流程・動畫"); D.title(s, "為什麼一定成立？"); D.video(s, "p06", 0.6, 2.0, 8.0);
//   D.save(path.join(__dirname, "單元名稱.pptx"));   // not pptx.writeFile: see save() below
const fs = require("fs");
const path = require("path");

function makeDeck(pptx, opts = {}) {
  const t = opts.theme || {};
  const C = Object.assign({
    dark: t.bg || "121212", darkInk: t.fg || "F2F0EA", accent: t.accent || "FF7A1A",
    light: "F7F5F0", ink: "1F1F1F", sub: "5A5A5A", line: "D9D4C7", panel: "ECE7DC",
  }, opts.colors || {});
  const H = (opts.fonts && opts.fonts.head) || "GenSekiGothic2 TW H"; // titles, badges, emphasis
  const M = (opts.fonts && opts.fonts.body) || "GenSekiGothic2 TW M"; // body text
  const mediaDir = opts.mediaDir || path.join(process.cwd(), "media");
  const playHint = opts.playHint === undefined ? "▶ 點一下播放（靜音動畫，老師邊播邊講）" : opts.playHint;

  function badge(s, text, onDark) {
    s.addText(text, { x: 0.6, y: 0.35, w: 2.4, h: 0.45, fontFace: H, fontSize: 16, bold: true,
      color: onDark ? C.dark : "FFFFFF", fill: { color: onDark ? C.accent : C.ink }, align: "center", valign: "middle" });
  }
  function title(s, text, o = {}) {
    s.addText(text, { x: 0.6, y: 0.95, w: 12.1, h: 1.0, fontFace: H, fontSize: o.size || 40, bold: true,
      color: o.color || C.ink, valign: "top", margin: 0 });
  }
  function lightSlide(role) {
    const s = pptx.addSlide();
    s.background = { color: C.light };
    if (role) badge(s, role, false);
    return s;
  }
  function darkSlide(role) {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    if (role) badge(s, role, true);
    return s;
  }
  // Embed media/<name>.mp4 at (x, y), width w, 16:9, inside a dark frame; poster = media/<name>.png.
  // Missing clip -> a placeholder, so the deck can be laid out before the film is rendered.
  function video(s, name, x, y, w) {
    const h = w * 9 / 16;
    const mp4 = path.join(mediaDir, `${name}.mp4`);
    const png = path.join(mediaDir, `${name}.png`);
    s.addShape(pptx.ShapeType.rect, { x: x - 0.06, y: y - 0.06, w: w + 0.12, h: h + 0.12,
      fill: { color: C.dark }, line: { color: C.dark } });
    if (fs.existsSync(mp4)) {
      // PptxGenJS expects the cover as "image/png;base64,..." (no "data:" prefix).
      const cover = fs.existsSync(png) ? "image/png;base64," + fs.readFileSync(png).toString("base64") : undefined;
      s.addMedia({ type: "video", path: mp4, x, y, w, h, cover });
    } else {
      s.addText(`［動畫 ${name}.mp4 尚未產生］`, { x, y, w, h, fontFace: M, fontSize: 18, color: C.darkInk, align: "center" });
    }
    if (playHint) s.addText(playHint, { x, y: y + h + 0.12, w, h: 0.35, fontFace: M, fontSize: 13, color: C.sub });
    return { x, y, w, h };
  }
  function card(s, x, y, w, h, head, body, color) {
    s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: C.panel }, line: { color: color || C.line, width: 1.5 } });
    s.addText(head, { x: x + 0.25, y: y + 0.18, w: w - 0.5, h: 0.6, fontFace: H, fontSize: 24, color: color || C.ink });
    s.addText(body, { x: x + 0.25, y: y + 0.8, w: w - 0.5, h: h - 0.95, fontFace: M, fontSize: 18, color: C.ink, valign: "top" });
  }
  // Write the deck, dropping the charset / pitchFamily hints PptxGenJS puts on every font tag.
  // Without this, PowerPoint's editing view shows Chinese text in TABLE cells as tofu boxes when the font
  // does not claim GB2312 (GenSeki TW claims only Big5): the run says charset GB2312, the cell's
  // end-of-paragraph says ANSI. Text boxes and exported PNGs look fine, so thumbnails do not catch it.
  // Same fix as scripts/fix_cjk_fonts.py (use that for decks written any other way).
  async function save(fileName) {
    const JSZip = require("jszip");
    const zip = await JSZip.loadAsync(await pptx.write({ outputType: "nodebuffer" }));
    for (const name of Object.keys(zip.files)) {
      if (!/^ppt\/.*\.xml$/.test(name)) continue;
      const xml = await zip.file(name).async("string");
      const fixed = xml.replace(/<a:(?:latin|ea|cs|sym)\b[^>]*>/g, (tag) => tag.replace(/\s+(?:pitchFamily|charset)="[^"]*"/g, ""));
      if (fixed !== xml) zip.file(name, fixed);
    }
    fs.writeFileSync(fileName, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
    console.log("wrote", fileName);
    return fileName;
  }
  return { C, H, M, badge, title, lightSlide, darkSlide, video, card, save };
}

module.exports = { makeDeck };
