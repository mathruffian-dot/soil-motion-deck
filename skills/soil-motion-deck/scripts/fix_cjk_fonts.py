"""Strip the charset / pitchFamily hints from every font tag in a .pptx, so CJK text in tables shows.

PptxGenJS writes each run's East Asian font as <a:ea typeface="..." charset="-122"> (GB2312), and in
table cells it also writes an end-of-paragraph <a:endParaRPr> whose fonts say charset="0" (ANSI).
With a font that does not claim GB2312 in its OS/2 code pages (GenSeki Gothic TW / 源石黑體 TW only
claims Big5), PowerPoint's editing view draws every Chinese character in such a table as a tofu box.
Text boxes are unaffected, and "Save as PNG" / thumbs.py render the table correctly, so the review
thumbnails do not show it. Both attributes are optional in DrawingML; without them PowerPoint picks the
face by name, which is what we want.

deck_helpers.js `D.save()` already does this. Run this script on any deck written another way
(pptx.writeFile, or a later patch step that rewrites the slide XML) — always as the LAST step.

  python fix_cjk_fonts.py deck.pptx [more.pptx ...]   # fix in place
  python fix_cjk_fonts.py deck.pptx --check           # report only; exit 1 if any hint is left
"""
import argparse
import os
import re
import sys
import tempfile
import zipfile
from pathlib import Path
sys.stdout.reconfigure(errors="replace")  # never crash printing Chinese file names on a non-UTF-8 console

FONT_TAG = re.compile(r"<a:(?:latin|ea|cs|sym)\b[^>]*>")
HINT = re.compile(r'\s+(?:pitchFamily|charset)="[^"]*"')


def clean(xml):
    """xml with every font tag's pitchFamily / charset removed, and how many tags changed."""
    n = 0

    def fix(m):
        nonlocal n
        tag = HINT.sub("", m.group(0))
        n += tag != m.group(0)
        return tag
    return FONT_TAG.sub(fix, xml), n


def process(path, check):
    path = Path(path)
    changed, total = {}, 0
    with zipfile.ZipFile(path) as zin:
        items = [(info, zin.read(info.filename)) for info in zin.infolist()]
    out = []
    for info, data in items:
        if info.filename.startswith("ppt/") and info.filename.endswith(".xml"):
            xml, n = clean(data.decode("utf-8"))
            if n:
                changed[info.filename] = n
                total += n
                data = xml.encode("utf-8")
        out.append((info, data))
    if check or not total:
        return changed, total
    fd, tmp = tempfile.mkstemp(suffix=".pptx", dir=path.parent)
    os.close(fd)
    try:
        with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
            for info, data in out:
                zout.writestr(info, data)
        os.replace(tmp, path)
    except PermissionError:
        os.remove(tmp)
        sys.exit(f"cannot write {path}: close it in PowerPoint first")
    return changed, total


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pptx", nargs="+")
    ap.add_argument("--check", action="store_true", help="only report; exit 1 if any font tag still has a hint")
    a = ap.parse_args()
    left = 0
    for p in a.pptx:
        changed, total = process(p, a.check)
        slides = sorted(int(m.group(1)) for f in changed if (m := re.fullmatch(r"ppt/slides/slide(\d+)\.xml", f)))
        verb = "would fix" if a.check else "fixed"
        print(f"{p}: {verb} {total} font tag(s) in {len(changed)} part(s)" + (f"; slides {slides}" if slides else ""))
        left += total
    if a.check and left:
        sys.exit(1)


if __name__ == "__main__":
    main()
