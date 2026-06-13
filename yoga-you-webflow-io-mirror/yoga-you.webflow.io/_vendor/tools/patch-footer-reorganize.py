"""Remove hidden pages from footer and reorganize link columns."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[2]

HIDDEN_LINK_RE = re.compile(
    r'<a href="(?:\.\./)?(?:expertises|blog)\.html"[^>]*>[^<]*</a>\s*',
    re.IGNORECASE,
)

MOVE_PRICING_RE = re.compile(
    r'(<a href="(?:\.\./)?planning\.html"[^>]*class="footer-link"[^>]*>Planning</a>)'
    r'(<a href="(?:\.\./)?contact\.html"[^>]*class="footer-link"[^>]*>)',
    re.IGNORECASE,
)

PRICING_IN_INFO_RE = re.compile(
    r'(<a href="(?:\.\./)?pricing\.html"([^>]*)>[^<]*</a>\s*)',
    re.IGNORECASE,
)


def patch_text(text: str) -> str:
    updated = HIDDEN_LINK_RE.sub("", text)

    if "pricing.html" not in updated:
        return updated

    info_start = updated.find('heading-footer-links">Informations')
    if info_start == -1:
        return updated

    info_end = updated.find("</div></div>", info_start)
    if info_end == -1:
        return updated

    info_block = updated[info_start:info_end]
    pricing_match = PRICING_IN_INFO_RE.search(info_block)
    if not pricing_match:
        return updated

    pricing_attrs = pricing_match.group(2)
    is_current = 'aria-current="page"' in pricing_attrs or "w--current" in pricing_attrs

    def insert_pricing(match: re.Match[str]) -> str:
        href = re.search(r'href="((?:\.\./)?)', match.group(1))
        prefix = href.group(1) if href else ""
        if is_current:
            pricing = (
                f'<a href="{prefix}pricing.html" aria-current="page" '
                f'class="footer-link w--current" data-i18n="nav.pricing">Tarifs</a>'
            )
        else:
            pricing = (
                f'<a href="{prefix}pricing.html" class="footer-link" '
                f'data-i18n="nav.pricing">Tarifs</a>'
            )
        return match.group(1) + pricing + match.group(2)

    if not MOVE_PRICING_RE.search(updated):
        return updated

    updated = MOVE_PRICING_RE.sub(insert_pricing, updated, count=1)
    info_start = updated.find('heading-footer-links">Informations')
    info_end = updated.find("</div></div>", info_start)
    info_block = updated[info_start:info_end]
    cleaned_info = PRICING_IN_INFO_RE.sub("", info_block)
    updated = updated[:info_start] + cleaned_info + updated[info_end:]
    return updated


def main() -> None:
    updated_files = []
    for p in root.rglob("*.html"):
        if "65939d1f139e1daa37da455f" in p.parts:
            continue
        original = p.read_text(encoding="utf-8")
        patched = patch_text(original)
        if patched != original:
            p.write_text(patched, encoding="utf-8")
            updated_files.append(str(p.relative_to(root)))
    print(f"Updated {len(updated_files)} file(s)")
    for f in updated_files:
        print(f"  {f}")


if __name__ == "__main__":
    main()
