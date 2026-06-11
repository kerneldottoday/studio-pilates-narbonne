import urllib.parse
import urllib.request
from pathlib import Path

SITE = Path(r"c:\users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io")
CDN = "https://cdn.prod.website-files.com/"


def dl(url: str) -> None:
    rel = url.split("website-files.com/", 1)[1]
    dest = SITE / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        print("exists", dest.name)
        return
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://yoga-you.webflow.io/"})
    try:
        data = urllib.request.urlopen(req, timeout=120).read()
        dest.write_bytes(data)
        print("OK", dest.relative_to(SITE))
    except Exception as e:
        print("FAIL", url[:120], "->", e)


videos = [
    "65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221 (1080p)-transcode.mp4",
    "65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221 (1080p)-transcode.webm",
    "65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221-poster-00001.jpg",
]

for rel in videos:
    dl(CDN + urllib.parse.quote(rel, safe="/:%()"))

# License screenshots - decode over-encoded filenames
license_files = [
    "../65939d1f139e1daa37da455f/659629ac35301c962916e6ea_658d5663266d79f7b58757d1_656405dade4f2b82c163e560_6523e34df3671f2cf7b5ff35_64fe87ee6b910cb3c55ab8f5_64ca343c4134dcf0b72b8483_649c0e78c7223024c3985a35_648684516b026dd2380b7d63_646c3018b97e25fc8ebb57fd_64154ef7822687cc9179ec1d_63f037fb0314aa8f801574c6_63eb5518484b8fa8502fb96f_63e4de6daa9a4570b8a370e0_63cd89baf329eefe431d62c4_637ff2fbbfb191fe19a92ea3_6355c01915baa60f151445e8_62e53b0b86728d4935efc735_Zrzut%2525252525252525252525252525252520ekranu%25252525252525252525252525252525202022-07-30%2525252525252525252525252525252520o%252525252525252525252525252525252015.06.51.png",
]

# Read start-here.html and extract href/src for missing license images
html = (SITE / "template/start-here.html").read_text(encoding="utf-8")
import re

for m in re.finditer(r'(?:href|src)="(\.\./65939d1f139e1daa37da455f/659629[^"]+)"', html):
    rel = m.group(1).replace("../", "")
    while "%25" in rel:
        rel = urllib.parse.unquote(rel)
    dl(CDN + rel)

for rel in videos:
    pass

print("videos:")
for rel in videos:
    dl(CDN + rel.replace(" ", "%20"))
