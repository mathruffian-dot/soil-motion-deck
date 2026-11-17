// 範例：SOIL Teaching Deck × motion-explainer — 國中數學〈畢氏定理〉（13 頁）
// 第 3、6、9 頁嵌入動畫（media/p03|p06|p09.mp4，封面＝最後畫面 PNG）。用法（見 SKILL.md §5）：
//   cp <本技能>/templates/{package.json,deck_helpers.js} <影片專案>/deck/
//   cp <本技能>/templates/example_pythagoras.js <影片專案>/deck/build_deck.js   # 再改成你的內容
//   cd <影片專案>/deck && npm install && node build_deck.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const { makeDeck } = require("./deck_helpers");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pptx.title = "畢氏定理：直角三角形的三邊秘密";

// ---- style (engine 5)：影片三色 = 深色頁三色；淺色內容頁另配角色色 ----
const D = makeDeck(pptx, {
  theme: { bg: "121212", fg: "F2F0EA", accent: "FF7A1A" },          // 與影片 theme.json 相同
  colors: { legA: "4D4D4D", legB: "9A9A9A", hyp: "E8601A" },        // structure_card 角色色（股 a／股 b／斜邊）
  mediaDir: path.join(__dirname, "media"),
});
const { C, H, M, title, lightSlide, darkSlide, video, card } = D;

// a right triangle drawn with lines: right angle at (x, y+hh), leg a up, leg b right
function triangle(s, x, y, ww, hh, labels) {
  const L = (x1, y1, x2, y2, color, wpt) => s.addShape(pptx.ShapeType.line,
    { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
      line: { color, width: wpt }, flipV: (y2 < y1) !== (x2 < x1) });
  L(x, y + hh, x, y, C.legA, 4);           // leg a (vertical)
  L(x, y + hh, x + ww, y + hh, C.legB, 4); // leg b (horizontal)
  L(x, y, x + ww, y + hh, C.hyp, 5);       // hypotenuse
  s.addShape(pptx.ShapeType.rect, { x, y: y + hh - 0.28, w: 0.28, h: 0.28, fill: { type: "none" }, line: { color: C.ink, width: 1.5 } });
  if (labels) {
    s.addText(labels[0], { x: x - 1.6, y: y + hh / 2 - 0.3, w: 1.45, h: 0.6, fontFace: H, fontSize: 22, color: C.legA, align: "right" });
    s.addText(labels[1], { x: x + ww / 2 - 1, y: y + hh + 0.08, w: 2, h: 0.5, fontFace: H, fontSize: 22, color: C.legB, align: "center" });
    s.addText(labels[2], { x: x + ww / 2 + 0.1, y: y + hh / 2 - 0.75, w: 2.6, h: 0.6, fontFace: H, fontSize: 22, color: C.hyp });
  }
}

// 1 封面
{
  const s = darkSlide(null);
  s.addText("國中數學・八年級", { x: 0.9, y: 1.6, w: 11.5, h: 0.5, fontFace: M, fontSize: 20, color: C.accent });
  s.addText("畢氏定理", { x: 0.9, y: 2.2, w: 11.5, h: 1.6, fontFace: H, fontSize: 84, color: C.darkInk, bold: true });
  s.addText("直角三角形的三邊秘密", { x: 0.9, y: 3.85, w: 11.5, h: 0.8, fontFace: H, fontSize: 32, color: C.darkInk });
  s.addText("a² + b² = c²", { x: 0.9, y: 5.2, w: 6, h: 0.8, fontFace: H, fontSize: 30, color: C.accent });
  s.addNotes("開場：先不說公式，直接進入梯子問題。");
}
// 2 問題引入
{
  const s = lightSlide("問題引入");
  title(s, "5 公尺的梯子，底部離牆 3 公尺，\n頂端能到牆上多高？", { size: 36 });
  // wall + ground + ladder
  s.addShape(pptx.ShapeType.line, { x: 8.2, y: 6.6, w: 3.6, h: 0.001, line: { color: C.ink, width: 3 } });
  s.addShape(pptx.ShapeType.line, { x: 11.8, y: 2.6, w: 0.001, h: 4.0, line: { color: C.ink, width: 3 } });
  s.addShape(pptx.ShapeType.line, { x: 9.4, y: 3.4, w: 2.4, h: 3.2, line: { color: C.legA, width: 6 }, flipH: true });
  s.addText("3 m", { x: 9.9, y: 6.65, w: 1.5, h: 0.45, fontFace: H, fontSize: 20, color: C.legB, align: "center" });
  s.addText("5 m", { x: 9.6, y: 4.4, w: 1.2, h: 0.5, fontFace: H, fontSize: 22, color: C.legA });
  s.addText("?", { x: 12.0, y: 4.3, w: 0.9, h: 1.0, fontFace: H, fontSize: 60, color: C.hyp, bold: true });
  s.addText("先猜一猜，再告訴旁邊的同學你的理由。", { x: 0.6, y: 3.4, w: 6.8, h: 0.6, fontFace: M, fontSize: 22, color: C.sub });
  s.addNotes("【引起動機】先讓學生猜，不急著算。答案（4 m）留到第 8 頁回扣。");
}
// 3 🎬 3-4-5 方格（動畫）
{
  const s = lightSlide("問題引入・動畫");
  title(s, "數數看：三邊上的正方形");
  video(s, "p03", 0.6, 2.0, 8.0);
  s.addText([{ text: "9", options: { color: C.legA } }, { text: " + " }, { text: "16", options: { color: C.legB } },
    { text: " = " }, { text: "25", options: { color: C.hyp } }],
    { x: 9.0, y: 2.6, w: 3.9, h: 1.2, fontFace: H, fontSize: 48, color: C.ink, align: "center" });
  s.addText("兩個小正方形的格數加起來，剛好等於大正方形。", { x: 9.0, y: 4.1, w: 3.9, h: 1.4, fontFace: M, fontSize: 20, color: C.ink });
  s.addNotes("播放動畫（約 18 秒，靜音）。邊播邊問：「哪兩個加起來會等於第三個？」");
}
// 4 總概念 structure_card
{
  const s = lightSlide("總概念");
  title(s, "畢氏定理");
  const parts = [["a²", "股 a 的平方", C.legA], ["+", "", null], ["b²", "股 b 的平方", C.legB], ["=", "", null], ["c²", "斜邊 c 的平方", C.hyp]];
  let x = 1.0;
  for (const [big, small, color] of parts) {
    if (color) {
      s.addShape(pptx.ShapeType.roundRect, { x, y: 2.5, w: 2.6, h: 2.0, rectRadius: 0.15, fill: { color }, line: { color } });
      s.addText(big, { x, y: 2.6, w: 2.6, h: 1.2, fontFace: H, fontSize: 60, color: "FFFFFF", align: "center" });
      s.addText(small, { x, y: 3.75, w: 2.6, h: 0.55, fontFace: M, fontSize: 18, color: "FFFFFF", align: "center" });
      x += 2.6;
    } else {
      s.addText(big, { x, y: 2.8, w: 1.0, h: 1.2, fontFace: H, fontSize: 54, color: C.ink, align: "center" });
      x += 1.0;
    }
  }
  s.addText("條件：直角三角形；c 是斜邊（直角對面、最長的邊）", { x: 1.0, y: 5.0, w: 11.5, h: 0.6, fontFace: M, fontSize: 22, color: C.ink });
  s.addNotes("帶走一句話先說一次：直角三角形，兩股的平方加起來，等於斜邊的平方。");
}
// 5 範例：認識三邊
{
  const s = lightSlide("範例");
  title(s, "認識直角三角形的三個邊");
  triangle(s, 2.2, 2.3, 4.0, 3.0, ["股 a", "股 b", "斜邊 c"]);
  card(s, 7.6, 2.1, 5.1, 1.4, "股", "夾著直角的兩個邊", C.legA);
  card(s, 7.6, 3.65, 5.1, 1.4, "斜邊", "直角對面的邊，也是最長的邊", C.hyp);
  card(s, 7.6, 5.2, 5.1, 1.4, "找斜邊的方法", "先找直角，再看它對面那條邊", C.ink);
  s.addNotes("請學生用手指出課本圖形中的斜邊，強調「直角對面」而不是「最後一個字母」。");
}
// 6 🎬 拼圖證明（動畫）
{
  const s = lightSlide("流程・動畫");
  title(s, "為什麼一定成立？面積拼圖");
  video(s, "p06", 0.6, 2.0, 8.0);
  const steps = ["① 四個一樣的直角三角形放進大正方形，空出 c²", "② 重新排列，空出 a² 和 b²", "③ 大正方形、三角形都沒變 → 空出來的面積相等"];
  steps.forEach((t, i) => s.addText(t, { x: 9.0, y: 2.2 + i * 1.35, w: 3.9, h: 1.2, fontFace: M, fontSize: 18, color: C.ink, valign: "top" }));
  s.addText("c² = a² + b²", { x: 9.0, y: 6.2, w: 3.9, h: 0.7, fontFace: H, fontSize: 30, color: C.hyp, align: "center" });
  s.addNotes("播放動畫（約 22 秒）。暫停在重排前後各問一次：「空出來的是什麼？」");
}
// 7 範例：求斜邊
{
  const s = lightSlide("範例");
  title(s, "已知兩股，求斜邊");
  triangle(s, 1.8, 2.4, 3.6, 2.4, ["5", "12", "c = ?"]);
  const rows = [["c² = 5² + 12²", C.ink], ["c² = 25 + 144 = 169", C.ink], ["c = √169 = 13", C.hyp]];
  rows.forEach(([t, col], i) => s.addText(t, { x: 7.0, y: 2.3 + i * 1.15, w: 5.8, h: 0.95, fontFace: H, fontSize: 34, color: col }));
  s.addNotes("步驟化：先寫公式、再代入、最後開根號。提醒單位。");
}
// 8 範例：解梯子
{
  const s = lightSlide("範例・回扣");
  title(s, "回到梯子：已知斜邊和一股，求另一股");
  const rows = [["高² = 5² − 3²", C.ink], ["= 25 − 9 = 16", C.ink], ["高 = √16 = 4 m", C.hyp]];
  rows.forEach(([t, col], i) => s.addText(t, { x: 0.9, y: 2.4 + i * 1.2, w: 7.0, h: 1.0, fontFace: H, fontSize: 36, color: col }));
  card(s, 8.4, 2.4, 4.4, 3.4, "求股的口訣", "斜邊的平方\n減另一股的平方\n再開根號", C.hyp);
  s.addNotes("回扣第 2 頁的猜測，請猜對的同學說說理由。");
}
// 9 🎬 三個誤解（動畫）
{
  const s = lightSlide("迷思澄清・動畫");
  title(s, "三個常見錯誤");
  video(s, "p09", 0.6, 2.0, 8.0);
  const items = [["❌ 3 + 4 = 5", "✅ 先平方再相加：9 + 16 = 25"], ["❌ 任何三角形都成立", "✅ 只有直角三角形"], ["❌ 隨便指定斜邊", "✅ 直角對面、最長的邊"]];
  items.forEach(([bad, good], i) => {
    s.addText(bad, { x: 9.0, y: 2.1 + i * 1.5, w: 3.9, h: 0.55, fontFace: M, fontSize: 18, color: C.sub });
    s.addText(good, { x: 9.0, y: 2.6 + i * 1.5, w: 3.9, h: 0.8, fontFace: H, fontSize: 18, color: C.ink });
  });
  s.addNotes("播放動畫（約 24 秒）。每張卡翻面前停一下，讓學生先判斷對錯。");
}
// 10 比較 compare_table
{
  const s = lightSlide("比較・延伸");
  title(s, "c 是最長邊時：比一比 c² 和 a² + b²");
  const head = { fill: { color: C.ink }, color: "FFFFFF", fontFace: H, fontSize: 20, bold: true, align: "center" };
  const cell = (t, emph) => ({ text: t, options: { fontFace: emph ? H : M, fontSize: 20, align: "center", color: emph ? C.hyp : C.ink, fill: { color: emph ? "FCE9DD" : "FFFFFF" } } });
  s.addTable([
    [{ text: "關係", options: head }, { text: "三角形", options: head }, { text: "例子", options: head }],
    [cell("c² < a² + b²"), cell("銳角三角形"), cell("4、5、6：36 < 41")],
    [cell("c² = a² + b²", true), cell("直角三角形", true), cell("3、4、5：25 = 25", true)],
    [cell("c² > a² + b²"), cell("鈍角三角形"), cell("2、3、4：16 > 13")],
  ], { x: 0.9, y: 2.3, w: 11.5, colW: [3.8, 3.4, 4.3], rowH: 0.9, border: { type: "solid", pt: 1, color: C.line } });
  s.addNotes("延伸（畢氏定理的逆敘述）：用最長邊判斷三角形種類。例子數字已驗算。");
}
// 11 數據：常見畢氏數 icon_grid
{
  const s = lightSlide("數據");
  title(s, "常見的畢氏數（整數三邊）");
  const sets = [["3、4、5", "9 + 16 = 25"], ["5、12、13", "25 + 144 = 169"], ["8、15、17", "64 + 225 = 289"], ["7、24、25", "49 + 576 = 625"]];
  sets.forEach(([a, b], i) => {
    const x = 0.9 + i * 3.05;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.4, w: 2.8, h: 2.6, rectRadius: 0.15, fill: { color: C.panel }, line: { color: C.line } });
    s.addText(a, { x, y: 2.6, w: 2.8, h: 1.1, fontFace: H, fontSize: 32, color: i === 0 ? C.hyp : C.ink, align: "center" });
    s.addText(b, { x, y: 3.8, w: 2.8, h: 0.8, fontFace: M, fontSize: 18, color: C.sub, align: "center" });
  });
  s.addText("倍數也成立：6、8、10（3、4、5 的 2 倍）", { x: 0.9, y: 5.4, w: 11.5, h: 0.6, fontFace: M, fontSize: 22, color: C.ink });
  s.addNotes("背幾組常見畢氏數，可以快速檢查答案。");
}
// 12 行動（深色）
{
  const s = darkSlide("行動");
  s.addText("動手試試看", { x: 0.9, y: 1.1, w: 11.5, h: 1.0, fontFace: H, fontSize: 44, color: C.darkInk });
  const qs = ["① 直角三角形兩股是 6 和 8，斜邊是多少？", "② 斜邊 13、一股 5，另一股是多少？", "③ 三邊 7、8、10，是銳角、直角還是鈍角三角形？"];
  qs.forEach((q, i) => s.addText(q, { x: 0.9, y: 2.5 + i * 1.2, w: 11.8, h: 0.9, fontFace: M, fontSize: 26, color: C.darkInk }));
  s.addNotes("答案：① 10（36 + 64 = 100）② 12（169 − 25 = 144）③ 銳角（10² = 100 < 7² + 8² = 113）");
}
// 13 總結（深色）
{
  const s = darkSlide("總結");
  s.addText("帶走一句話", { x: 0.9, y: 1.4, w: 11.5, h: 0.6, fontFace: M, fontSize: 22, color: C.accent });
  s.addText("直角三角形：", { x: 0.9, y: 2.1, w: 11.5, h: 1.0, fontFace: H, fontSize: 44, color: C.darkInk });
  s.addText([{ text: "兩股的平方加起來 = " }, { text: "斜邊的平方", options: { color: C.accent } }],
    { x: 0.9, y: 3.1, w: 11.8, h: 1.1, fontFace: H, fontSize: 44, color: C.darkInk });
  s.addText("a² + b² = c²", { x: 0.9, y: 5.0, w: 11.5, h: 0.9, fontFace: H, fontSize: 36, color: C.darkInk });
  s.addNotes("請學生不看螢幕，把這句話說一次。");
}

D.save(path.join(__dirname, "畢氏定理_SOIL動畫版.pptx"));
