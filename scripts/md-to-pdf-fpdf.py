#!/usr/bin/env python3
"""Markdown → PDF（fpdf2 + Arial Unicode，纯文本排版，无需浏览器）"""
import re
import sys
from pathlib import Path

from fpdf import FPDF

FONT = "/Library/Fonts/Arial Unicode.ttf"
if not Path(FONT).exists():
    FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"


def strip_md(md: str) -> list:
    md = re.sub(r"^---[\s\S]*?---\n", "", md, count=1)
    md = md.replace("\\newpage", "\n\n")
    blocks = []
    in_code = False
    buf = []
    for line in md.split("\n"):
        if line.strip().startswith("```"):
            if in_code:
                blocks.append(("code", "\n".join(buf)))
                buf = []
                in_code = False
            else:
                in_code = True
            continue
        if in_code:
            buf.append(line)
            continue
        if line.startswith("# "):
            blocks.append(("h1", line[2:].strip()))
        elif line.startswith("## "):
            blocks.append(("h2", line[3:].strip()))
        elif line.startswith("### "):
            blocks.append(("h3", line[4:].strip()))
        elif line.startswith("#### "):
            blocks.append(("h4", line[5:].strip()))
        elif line.startswith("|") and "---" not in line:
            cells = [c.strip() for c in line.strip("|").split("|")]
            blocks.append(("text", " | ".join(cells)))
        elif line.startswith("- "):
            blocks.append(("text", "• " + line[2:].strip()))
        elif line.strip() in ("---", ""):
            if line.strip() == "---":
                blocks.append(("hr", ""))
        else:
            t = line.strip()
            if t:
                t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
                t = re.sub(r"`([^`]+)`", r"\1", t)
                t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
                blocks.append(("text", t))
    return blocks


def main():
    if len(sys.argv) < 2:
        print("用法: python3 scripts/md-to-pdf-fpdf.py <file.md>")
        sys.exit(1)
    src = Path(sys.argv[1]).resolve()
    pdf_path = src.with_suffix(".pdf")
    blocks = strip_md(src.read_text(encoding="utf-8"))

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_font("Uni", "", FONT)
    pdf.add_page()

    sizes = {"h1": 18, "h2": 14, "h3": 12, "h4": 11, "text": 10, "code": 9}
    for kind, text in blocks:
        if kind == "hr":
            pdf.ln(4)
            continue
        size = sizes.get(kind, 10)
        pdf.set_font("Uni", size=size)
        if kind.startswith("h"):
            pdf.ln(6 if kind == "h1" else 4)
        lh = size * 0.55
        if kind == "code":
            pdf.set_fill_color(245, 247, 250)
            pdf.multi_cell(0, lh, text, fill=True)
        else:
            pdf.multi_cell(0, lh, text)
        pdf.ln(2)

    pdf.output(str(pdf_path))
    print("PDF:", pdf_path, f"({pdf_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
