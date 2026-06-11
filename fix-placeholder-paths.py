import os
from pathlib import Path

SITE = Path(r"c:\users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io")
PLACEHOLDER = SITE / "plugins/Basic/assets/placeholder.60f9b1840c.svg"
OLD = "plugins/Basic/assets/placeholder.60f9b1840c.svg"

for html in SITE.rglob("*.html"):
    text = html.read_text(encoding="utf-8", errors="replace")
    if OLD not in text:
        continue
    rel = os.path.relpath(PLACEHOLDER, html.parent).replace("\\", "/")
    new = text.replace(OLD, rel)
    if new != text:
        html.write_text(new, encoding="utf-8")
        print(f"fixed placeholder in {html.relative_to(SITE)} -> {rel}")
