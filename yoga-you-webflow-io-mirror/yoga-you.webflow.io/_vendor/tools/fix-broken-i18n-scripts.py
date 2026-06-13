"""Fix malformed i18n script tags injected by patch-i18n-site.py."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

BROKEN = re.compile(
    r'<script src="<script src="((?:\.\./)*)_vendor/i18n/text-map\.js" defer></script>'
    r'((?:\.\./)*)_vendor/js/i18n\.js" defer></script>'
)


def fix_scripts(text: str) -> tuple[str, int]:
    def repl(match: re.Match[str]) -> str:
        prefix = match.group(1) or match.group(2) or ""
        return (
            f'<script src="{prefix}_vendor/i18n/text-map.js" defer></script>'
            f'<script src="{prefix}_vendor/js/i18n.js" defer></script>'
        )

    return BROKEN.subn(repl, text)


def main() -> None:
    fixed = 0
    for path in ROOT.rglob("*.html"):
        if "_vendor" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        new_text, n = fix_scripts(text)
        if n:
            path.write_text(new_text, encoding="utf-8")
            fixed += 1
            print(path.relative_to(ROOT), n)
    print(f"fixed {fixed} file(s)")


if __name__ == "__main__":
    main()
