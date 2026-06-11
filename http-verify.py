import re
import urllib.request
from pathlib import Path

BASE = "http://localhost:8000/"
SITE = Path(r"c:\users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io")

pages = ["homepage.html", "index.html", "classes/yoga-for-focus.html"]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "verify"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return r.status, r.read().decode("utf-8", errors="replace")


errors = []
for page in pages:
    status, html = fetch(BASE + page)
    print(f"{page}: HTTP {status}")
    refs = set()
    for m in re.finditer(r'(?:href|src)="([^"]+)"', html):
        ref = m.group(1)
        if ref.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:")):
            continue
        if ref.endswith(".html") or ".html#" in ref:
            continue
        refs.add(ref)
    for m in re.finditer(r'srcset="([^"]+)"', html):
        for part in m.group(1).split(","):
            refs.add(part.strip().split(" ")[0])

    page_dir = SITE / Path(page).parent
    for ref in sorted(refs):
        url = BASE + Path(page).parent.as_posix()
        if url.endswith("/.") :
            url = BASE
        elif not url.endswith("/"):
            url += "/"
        full = urllib.parse.urljoin(BASE + page, ref) if False else None
        import urllib.parse

        full = urllib.parse.urljoin(BASE + page.replace("\\", "/"), ref)
        try:
            s, _ = fetch(full)
            if s != 200:
                errors.append((page, ref, s))
        except Exception as e:
            errors.append((page, ref, str(e)))

print("\nBroken resources:")
for e in errors[:30]:
    print(" ", e)
print(f"\nTotal broken: {len(errors)}")
