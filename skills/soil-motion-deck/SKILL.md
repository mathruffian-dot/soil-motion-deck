---
name: soil-motion-deck
description: 動畫教學簡報：把 SOIL Teaching Deck（教學簡報六引擎）和 motion-explainer（解說動畫）接在一起，一次做出兩樣東西。A 是一份 .pptx 教學簡報，關鍵頁嵌入會動的解說動畫；B 是同一份內容的配音字幕解說影片（MP4）。使用者說「做有動畫的教學簡報」、「簡報的關鍵頁加動畫」、「SOIL 簡報加解說動畫」、「把這個單元做成簡報和動畫影片」、「投影片裡放動畫講解」，或手上已有 SOIL 簡報想把某幾頁換成動畫時，就要使用此技能。
---

# SOIL 動畫教學簡報：一次製作，兩份成品

| 成品 | 內容 | 給誰用 |
|---|---|---|
| **A 簡報**（.pptx） | SOIL 六引擎做出的教學簡報。2–4 個 🎬 動畫頁嵌入動畫片段，片段**靜音、沒有字幕**，老師邊播邊講 | 上課投影 |
| **B 影片**（MP4） | 同一份內容的完整解說片：配音、字幕、三色主題 | 預習、補課、上傳 |

兩份成品共用同一套動畫：先做 B，再從 B 的「靜音孿生版」把 🎬 頁的那幾格剪出來，嵌進 A。所以動畫只要做一次，兩邊秒數完全一致。

這個技能只負責「接起來」。做法以兩個上游技能為準：

- **`soil-teaching-deck`**（[mathruffian-dot/soil-teaching-deck](https://github.com/mathruffian-dot/soil-teaching-deck)）：六顆引擎、頁面角色、visual 版型、三明治結構、F-0 字型安裝。
- **`motion-explainer`**（[mathruffian-dot/claude-motion-explainer](https://github.com/mathruffian-dot/claude-motion-explainer)），以及它帶的 `motion-design`、`review-loop` 和 HyperFrames 官方 skills：腳本、旁白、分格製作、字幕、三色主題、審查、輸出。

## 0. 環境與路徑

本文用三個代號，開工前先找出它們的實際位置：

| 代號 | 是什麼 | 常見位置 |
|---|---|---|
| `<smd>` | 本技能資料夾 | `~/.claude/skills/soil-motion-deck`（Claude Code）、`~/.agents/skills/soil-motion-deck`（Codex） |
| `<me>` | motion-explainer 技能資料夾 | 同上，資料夾名 `motion-explainer` |
| `<soil>` | SOIL 技能資料夾 | 同上，資料夾名 `soil-teaching-deck` |

```bash
ls -d ~/.claude/skills/{soil-motion-deck,motion-explainer,soil-teaching-deck,review-loop} ~/.agents/skills/{soil-motion-deck,motion-explainer,soil-teaching-deck,review-loop} 2>/dev/null
```

PowerShell（Windows 沒有 bash 時）：

```powershell
Get-ChildItem "$HOME\.claude\skills","$HOME\.agents\skills" -Directory -ErrorAction SilentlyContinue | Select-Object FullName
```

其他 agent（例如 Gemini CLI）：在它的 skills 資料夾裡找同名資料夾。

少了哪一個，就請使用者照該 repo 的 README 安裝（每個 repo 都是把 `skills/` 或 `skill/` 底下的資料夾複製到 agent 的 skills 資料夾）。SOIL 的 `install.py` 只會裝到它找到的第一個資料夾，而且會等使用者按 Enter。agent 自己裝的話，直接複製：`cp -r soil-teaching-deck/skill <skills 資料夾>/soil-teaching-deck`。

其他需求：

- 上游兩個技能的需求：Node.js 22+、ffmpeg、Python 3、HyperFrames，以及一個 TTS：**edge-tts（預設）**，不需要 GPU，大多數人用這個；或 Breeze TTS 2（進階，需要 NVIDIA GPU，只限研究與非商業用途，使用者要求時才照 `motion-explainer/references/tts-setup.md` 引導安裝）。
- 簡報：PptxGenJS 3.12.0（用本技能的 `templates/package.json` 安裝，見 §5），源石黑體 H／B／M（照 SOIL 的 F-0 安裝）。
- 縮圖：Windows 有 PowerPoint 最好（`thumbs.py` 會直接用 PowerPoint 輸出，字型和影片封面跟上課時一模一樣）。沒有的話用 LibreOffice + poppler，只能檢查版面，不一定看得到影片封面。
- 測試過的版本：HyperFrames 0.8.168、PptxGenJS 3.12.0。

**沒有 sub-agent 的 agent**（例如某些 Codex、Gemini 設定）：motion-explainer 說「每格派一個 sub-agent 平行做」的地方，改成自己照順序一格一格做，每格讀的檔案和順序都一樣。

## 1. 開場訪談（一次問完）

1. 科目、單元、對象、上課時間（SOIL 的補問）。
2. 要哪幾份成品：**A+B（預設）**、只要 A、只要 B。只要 A 也照樣先做 B：旁白決定每一格的節奏，動畫才會自然。只是不交 B，旁白不必讓使用者試聽。
3. 配色。預設是「影片三色 + SOIL 三明治」：
   - 影片（以及簡報裡的動畫視窗）用 motion-explainer 的三色，預設黑底 `#121212`、白字 `#F2F0EA`、橘色重點 `#FF7A1A`。
   - 簡報的封面、行動頁、結語是深色頁，用影片的三色；內容頁是淺色頁，動畫放在深色的「播放視窗」裡。
4. 旁白聲音：照 motion-explainer 的規則。

motion-explainer 自己的開場訪談（平台、長度、聲音、三色）在這裡已經問過，**不要再問一次**。片長也不受它「60–90 秒」的建議限制：片長等於旁白長度，通常是每個 🎬 頁 15–25 秒，加上前後幾格。

## 2. SOIL 引擎一～三，標出 🎬 動畫頁

照 `soil-teaching-deck` 跑引擎一（概念定位）、引擎二（脈絡定位）、引擎三（頁面架構），每顆引擎跑完都給使用者確認。在引擎三的頁面角色表，替要做動畫的頁加上 `animate` 欄位。用 🎬 標記，不要用 ★（SOIL 的 ★ 是「關鍵頁」，意思不同）：

```
第 6 頁：為什麼一定成立？面積拼圖 🎬
- 頁面角色：流程頁
- 唯一主重點：大正方形與三角形都沒變，所以空出來的面積相等
- animate: { frame: 04-proof, poster: last }
```

`frame` 是這一頁在影片裡那一格的檔名（不含 `.html`），在 §3 寫分鏡時就固定下來：`STORYBOARD.md` 裡那一格的 `src` 是 `compositions/frames/04-proof.html`，這裡就寫 `04-proof`。每段的長度由旁白決定，不是在這裡指定。

**哪些頁值得做動畫**（全份 2–4 頁，每段 15–25 秒）：「隨時間改變」本身就是重點的頁。

| 適合 | 例子 |
|---|---|
| 推導、證明、過程 | 拼圖證明、反應進行、光的路徑 |
| 數量累加或比較 | 數方格 9 + 16 = 25、長條成長 |
| 迷思翻轉 | 錯誤說法 → 打叉 → 翻成正確說法 |
| 空間關係 | 旋轉、平移、展開圖、斜放的正方形 |

**不適合**：定義、表格、練習題、總結，這些頁用 SOIL 的 visual 版型就好。

## 3. 從簡報流程寫影片腳本（交接）

影片的分格順著簡報的流程走。先在影片專案的 `BRIEF.md` 寫一張對照表，檔名在這裡就決定：

| 簡報頁 | 影片格（檔名） | 旁白要講什麼 | 用途 |
|---|---|---|---|
| 2 問題引入 | `01-ladder` | 引擎一的情境問題 | 只在影片裡用 |
| 🎬 3 | `02-squares` | 這一頁的唯一主重點 | 剪成 `p03` |
| 4–5 概念 | `03-names` | 總概念＋名詞 | 只在影片裡用 |
| 🎬 6 | `04-proof` | 這一頁的唯一主重點 | 剪成 `p06` |
| … | … | … | … |
| 13 總結 | `07-takeaway` | 引擎一的「帶走一句話」 | 只在影片裡用 |

剪片段的名稱用 `p` + 兩位數頁碼（`p03`、`p06`），和 `build_deck.js` 裡 `video(s, "p06", …)` 的名稱一致。

接著照 motion-explainer 的格式寫 `SCRIPT.md`（每格一句 `## Line N`）和 `STORYBOARD.md`（每格的 `src` 用上表的檔名）。旁白的素材直接拿 SOIL 的產出：

- 引擎一的「三個常見誤解」→ 迷思翻轉那一格的三段旁白。
- 引擎一的「帶走一句話」→ 最後一格的旁白，一字不改，簡報的總結頁也用同一句。
- 每個 🎬 頁的「唯一主重點」→ 那一格旁白的最後一句。
- 長度用每秒 4–4.5 個中文字估算。🎬 那一格的旁白約 70–100 字（15–25 秒）。

🎬 格交給 worker 時，`_dispatch_context.md` 要多寫這四條（它們會被單獨拿出來，在沒有聲音、沒有字幕的情況下播放）：

1. **只看畫面也看得懂**：關鍵的數字、標籤、結論都要寫在畫面上，不能只靠旁白。
2. **從空白開始，最後停在結論**：最後一個狀態要完整、靜止至少 1 秒，因為它就是投影片上的封面。
3. **重要內容不要放在字幕區**（y > 896 px）：影片的字幕會蓋住它，簡報裡雖然沒有字幕，但同一格要兩邊都能用。
4. 前後格的銜接（同一個梯子、同一個三角形）照常做；剪片時會自動去掉轉場重疊的部分。

接下來完全照 `motion-explainer` 的流程：旁白 → 鏡頭 → 每一格（有 sub-agent 就平行，沒有就依序）→ 組裝、字幕、配色 → draft 審查 → 輸出 B。

## 4. 靜音孿生版 → 剪出 🎬 片段

用絕對路徑或從同一個資料夾執行，下面以 `$FILM` 代表影片專案的完整路徑：

```bash
python <smd>/scripts/make_silent.py --project "$FILM"            # 建立 $FILM-silent：拿掉所有 audio 軌和字幕
(cd "$FILM-silent" && npx hyperframes render --quality high --output renders/silent.mp4)
python <smd>/scripts/cut_clips.py --project "$FILM" --video "$FILM-silent/renders/silent.mp4" \
    --map p03=02-squares p06=04-proof p09=06-myths@first --out "$FILM/deck/media"
```

- `cut_clips.py` 讀 `index.html` 裡每一格的開始和長度，從「和前一格重疊的部分結束」剪到「和下一格重疊的部分開始」。不管轉場是 crossfade、push-slide 還是 zoom-through，都不會混到前後格。它會印出每段長度，把長度寫進講者備註。
- 封面圖預設是最後一格（停在結論）。要逐段指定的話，在 `--map` 後面加 `@first` 或 `@秒數`（例如 `p09=06-myths@2.5`）。迷思頁不想提前洩漏答案，就用 `@first`。
- **影片有任何修改**（任何一格、配色、長度）：重跑 `make_silent.py`、輸出、`cut_clips.py`。孿生版是一份快照，不會自動跟著改。

## 5. 做簡報（SOIL 引擎四～六）

1. 引擎四（認知編修）、引擎五（風格）照 SOIL 的規則做。引擎五的配色採用第 1 步選好的方案。
2. 建立簡報資料夾。**一定要用本技能的 `package.json`**：HyperFrames 專案根目錄的 `package.json` 是 `"type": "module"`，沒有自己的 `package.json` 的話，`require` 會失敗。

```bash
mkdir -p "$FILM/deck" && cp <smd>/templates/package.json <smd>/templates/deck_helpers.js "$FILM/deck/"
cp <smd>/templates/example_pythagoras.js "$FILM/deck/build_deck.js"     # 從範例改起
(cd "$FILM/deck" && npm install)
```

3. 改寫 `build_deck.js`。開頭固定這樣寫。**版面一律用 `LAYOUT_WIDE`（13.333 × 7.5 吋）**：SOIL 的 PptxGenJS 速查用的是 `LAYOUT_16x9`（10 吋寬）和微軟正黑體，在這裡不要照抄，`deck_helpers.js` 的座標都是照 13.333 吋寬設計的。字型照 SOIL 的規則：標題 `GenSekiGothic2 TW H`、內文 `GenSekiGothic2 TW M`。

```js
const path = require("path");
const pptxgen = require("pptxgenjs");
const { makeDeck } = require("./deck_helpers");
const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
const D = makeDeck(pptx, { theme: { bg: "121212", fg: "F2F0EA", accent: "FF7A1A" }, mediaDir: path.join(__dirname, "media") });
const s = D.lightSlide("流程・動畫");
D.title(s, "為什麼一定成立？面積拼圖");
D.video(s, "p06", 0.6, 2.0, 8.0);   // 左側 8 吋寬的播放視窗（16:9），下方有「點一下播放」提示
// 右側 x = 9.0、寬 3.9 吋：放動畫的步驟摘要或重點，讓沒播放時這一頁也看得懂
D.save(path.join(__dirname, "單元名稱.pptx"));   // 不要用 pptx.writeFile，原因見下面第 7 點
```

4. 🎬 頁的版面：左邊放動畫（8.0 × 4.5 吋），右邊放 2–3 行步驟或結論。講者備註寫：片長、在哪幾個地方停下來問學生、預期的答案。
5. 其他頁照 SOIL 的頁面角色和 visual 版型做。練習題的答案寫在講者備註，不放在投影片上。
6. `node build_deck.js`。片段還沒剪好時，`video()` 會先放一個佔位框，可以先排版。
7. **存檔一律用 `D.save()`，不要用 `pptx.writeFile()`。** PptxGenJS 在每個字型標籤上都寫了字元集提示（東亞字型寫成簡中 GB2312），表格格子的段落結尾又寫成 ANSI；源石黑體 TW 只宣告支援繁中 Big5，結果 PowerPoint **編輯畫面**裡的表格中文全部變成方框（文字框不受影響）。`D.save()` 存檔時會拿掉這些提示。用其他方式寫出、或之後又有程式改寫投影片 XML（例如把圖形換成自由曲線）的簡報，最後一步一律跑 `python <smd>/scripts/fix_cjk_fonts.py <簡報>.pptx`；它也能修已經交出去的舊簡報。

**使用者已經有一份 SOIL 簡報**：PptxGenJS 不能修改現有的 .pptx。照 SOIL 的「診斷修改模式」讀出每一頁的內容（`python -m markitdown <檔案>.pptx`，沒有 markitdown 就請使用者貼文字），把要保留的頁照原樣寫進 `build_deck.js`，選定的頁改成 🎬 版面，整份重新產生。交付時說明這是重建的新檔案，原檔沒有被改動。

## 6. 審查

```bash
python <smd>/scripts/thumbs.py "$FILM/deck/<簡報>.pptx" --out "$FILM/deck/thumbs"   # 每頁一張 PNG + 總覽圖 deck-*.png
```

SOIL 文件裡提到的 `thumbnail.py`（pptx 技能）不必另外找，用這個 `thumbs.py` 就好。逐張看總覽圖，對照下面的清單：

```bash
python <smd>/scripts/fix_cjk_fonts.py "$FILM/deck/<簡報>.pptx" --check   # 必須是 0：表格中文在編輯畫面才不會變方框
```


- [ ] 🎬 頁的封面是動畫的那一格，不是黑框或佔位文字
- [ ] 動畫視窗沒有被其他文字或圖形蓋到；下方的播放提示看得到
- [ ] 每頁只有一個主重點；三明治結構（深色封面、行動、結語，淺色內容頁）
- [ ] 簡報和影片的強調色是同一個色系（淺色頁上可以用深一階的同色，例如 `#E8601A` 配影片的 `#FF7A1A`），數字和用語兩邊一致
- [ ] 講者備註有片長、停下來提問的地方、答案
- [ ] 練習題的答案自己算過一次
- [ ] `fix_cjk_fonts.py --check` 回報 0 個字型標籤（縮圖是用「另存圖片」輸出的，看不出表格方框亂碼，只有這個檢查抓得到）
- [ ] B 影片的審查照 `review-loop` 做完（每個子句截一格，逐張看）

## 7. 交付

交出 .pptx 和 MP4 的路徑，並說明：

- 🎬 頁是哪幾頁、各幾秒、封面用了哪一格。
- 播放那台電腦要先裝好源石黑體（.pptx 不內嵌字型；沒裝會退回系統字型）。
- 影片已經嵌進 .pptx，PowerPoint 和 Keynote 都能直接播放。Google 簡報匯入時可能不會保留嵌入的影片；要用 Google 簡報的話，把 `media/*.mp4` 上傳到雲端硬碟，再插入影片。
- 旁白發音請使用者用耳朵聽一遍（ASR 聽不出聲調）。唸錯的字用 motion-explainer 的 `fix_voice.py` 修；修完要重剪片段、重建簡報。

`references/lessons.md` 是第一次實作（〈畢氏定理〉，13 頁、3 段動畫、110 秒影片）時踩過的坑。
