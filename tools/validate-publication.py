#!/usr/bin/env python3
"""Validate the public tree with Python's standard library; never opens maps."""
from __future__ import annotations

import hashlib
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "ra3-map-create"
FORBIDDEN = {".map", ".big", ".mix", ".exe", ".dll", ".pdb", ".ra3replay"}
TEXT = {".md", ".json", ".yaml", ".cjs", ".py", ".html", ".svg"}
PRIVATE = re.compile(r"(?<!\w)[A-Za-z]:[\\/]|/Users/|/home/")
SECRET = re.compile(
    r"sk-[A-Za-z0-9_-]{18,}|gh[pousr]_[A-Za-z0-9]{20,}|"
    r"github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----"
)


class Links(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.targets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if key in {"href", "src"} and value:
                self.targets.append(value)


def main() -> None:
    issues: list[str] = []
    checked_links = 0
    files = sorted(p for p in ROOT.rglob("*") if p.is_file() and ".git" not in p.parts)
    manifest = json.loads((ROOT / "SOURCE_MANIFEST.json").read_text("utf-8"))
    for item in manifest["files"]:
        p = SKILL / item["path"]
        data = p.read_bytes()
        if len(data) != item["bytes"] or hashlib.sha256(data).hexdigest() != item["sha256"]:
            issues.append("Original source mismatch: " + item["path"])
    for p in files:
        rel = p.relative_to(ROOT).as_posix()
        if p.suffix.lower() in FORBIDDEN:
            issues.append("Forbidden raw asset or binary: " + rel)
        if p.stat().st_size >= 100 * 1024 * 1024:
            issues.append("File reaches GitHub's 100 MiB limit: " + rel)
        if p.suffix.lower() not in TEXT:
            continue
        text = p.read_text("utf-8-sig")
        if p.suffix == ".json":
            json.loads(text)
        # This checker contains the pattern definitions rather than real paths/keys.
        if p != Path(__file__).resolve() and (PRIVATE.search(text) or SECRET.search(text)):
            issues.append("Review possible private path or credential: " + rel)
        targets: list[str] = []
        if p.suffix == ".md":
            targets += re.findall(r"!?\[[^\]]*\]\(([^\n]+?)\)", text)
        if p.suffix in {".html", ".svg"}:
            parsed = Links()
            parsed.feed(text)
            targets += parsed.targets
        for target in targets:
            target = html.unescape(target.strip().strip("<>"))
            parsed_url = urlsplit(target)
            if parsed_url.scheme or parsed_url.netloc or not parsed_url.path:
                continue
            local = (p.parent / unquote(parsed_url.path)).resolve()
            if not local.is_relative_to(ROOT) or not local.exists():
                issues.append(f"Broken or escaping link: {rel} -> {target}")
            checked_links += 1
    for name in ("LICENSE", "NOTICE.md", "NON_COMMERCIAL_REQUEST.md"):
        if (ROOT / name).read_bytes() != (SKILL / name).read_bytes():
            issues.append("Installed legal file differs: " + name)
    images = [p for p in files if p.suffix.lower() in {".jpg", ".png"}]
    report = {
        "status": "PASS" if not issues else "FAIL",
        "files": len(files),
        "originalFilesPreserved": len(manifest["files"]),
        "referenceImages": len(images),
        "checkedLocalLinks": checked_links,
        "bytes": sum(p.stat().st_size for p in files),
        "largest": max(({"path": p.relative_to(ROOT).as_posix(), "bytes": p.stat().st_size} for p in files), key=lambda x: x["bytes"]),
        "issues": issues,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(bool(issues))


if __name__ == "__main__":
    main()
