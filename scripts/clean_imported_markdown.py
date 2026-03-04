#!/usr/bin/env python3
"""Clean imported markdown posts for blog rendering quality.

Fixes applied:
- Remove redundant H1 that duplicates front matter title
- Demote extra H1 headings to H2 to keep heading hierarchy stable
- Normalize malformed code fence language markers (e.g. ```sq; -> ```sql)
- Remove empty markdown table rows
- Trim trailing spaces and collapse excessive blank lines
- Apply a few safe textual normalizations for import noise
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

SAFE_REPLACEMENTS = {
    "UNIONALL": "UNION ALL",
    "```sq;": "```sql",
    "```sql ": "```sql",
    "```c ": "```c",
}

KNOWN_FENCE_LANG_MAP = {
    "sq": "sql",
    "sq;": "sql",
    "sql;": "sql",
    "bash;": "bash",
    "sh;": "sh",
    "c;": "c",
    "cpp;": "cpp",
}


def normalize_heading(text: str) -> str:
    t = text.strip().lower()
    t = re.sub(r"\s+", "", t)
    return t


def split_front_matter(content: str) -> tuple[str, str]:
    if not content.startswith("---\n"):
        return "", content
    end = content.find("\n---\n", 4)
    if end == -1:
        return "", content
    front = content[: end + 5]
    body = content[end + 5 :]
    return front, body


def extract_title(front_matter: str) -> str:
    if not front_matter:
        return ""
    m = re.search(r'(?m)^title:\s*"([^"]+)"\s*$', front_matter)
    if m:
        return m.group(1).strip()
    m = re.search(r"(?m)^title:\s*(.+)\s*$", front_matter)
    return m.group(1).strip() if m else ""


def fix_code_fence(line: str) -> str:
    m = re.match(r"^```\s*(.*)$", line)
    if not m:
        return line
    lang = m.group(1).strip()
    if not lang:
        return "```"
    lang = KNOWN_FENCE_LANG_MAP.get(lang, lang)
    if lang.endswith(";"):
        lang = lang[:-1]
    return f"```{lang}"


def is_empty_table_row(line: str) -> bool:
    s = line.strip()
    if not (s.startswith("|") and s.endswith("|")):
        return False
    cells = [c.strip() for c in s.split("|")[1:-1]]
    if not cells:
        return False
    # keep separator rows like | --- | ---- |
    if all(re.fullmatch(r":?-{3,}:?", c) for c in cells if c):
        return False
    return all(c == "" for c in cells)


def clean_body(body: str, title: str) -> str:
    for old, new in SAFE_REPLACEMENTS.items():
        body = body.replace(old, new)

    out: list[str] = []
    seen_title_h1 = False
    seen_non_title_h1 = False
    title_norm = normalize_heading(title)

    for raw_line in body.splitlines():
        line = raw_line.rstrip()
        line = fix_code_fence(line)

        if is_empty_table_row(line):
            continue

        if line.startswith("# "):
            h = line[2:].strip()
            h_norm = normalize_heading(h)
            if title_norm and h_norm == title_norm and not seen_title_h1:
                seen_title_h1 = True
                continue
            if seen_non_title_h1 or seen_title_h1:
                line = "## " + h
            seen_non_title_h1 = True

        out.append(line)

    text = "\n".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def clean_file(path: Path) -> None:
    content = path.read_text(encoding="utf-8", errors="ignore")
    front, body = split_front_matter(content)
    title = extract_title(front)
    new_body = clean_body(body, title)
    new_content = front + new_body if front else new_body
    path.write_text(new_content, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean imported markdown files")
    parser.add_argument("files", nargs="+", help="Markdown files to clean")
    args = parser.parse_args()

    for f in args.files:
        p = Path(f)
        if p.exists() and p.is_file():
            clean_file(p)
            print(f"cleaned {p}")
        else:
            print(f"skip missing {p}")


if __name__ == "__main__":
    main()
