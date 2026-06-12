#!/usr/bin/env python3
"""Télécharge les images Unsplash pour Studio Pilates Narbonne."""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Installation de Pillow…")
    import subprocess

    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
    from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / "_vendor" / "media"
MANIFEST = ROOT / "_vendor" / "content" / "unsplash-manifest.json"
CREDITS = ROOT / "_vendor" / "content" / "unsplash-credits.json"

ENV_PATHS = [
    Path(__file__).resolve().parents[4] / ".env",
    Path(r"C:\Users\recca\.cursor\mcp-servers\unsplash-mcp-server\.env"),
]


def load_access_key() -> str:
    for env_path in ENV_PATHS:
        if env_path.is_file():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                if line.startswith("UNSPLASH_ACCESS_KEY="):
                    return line.split("=", 1)[1].strip()
    key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if key:
        return key
    raise SystemExit("UNSPLASH_ACCESS_KEY introuvable (.env ou variable d'environnement)")


def api_get(url: str, access_key: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Client-ID {access_key}",
            "Accept-Version": "v1",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def trigger_download(download_location: str, access_key: str) -> None:
    api_get(download_location, access_key)


def download_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "StudioPilatesNarbonne/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def search_photo(query: str, orientation: str, access_key: str, used_ids: set[str], page: int = 1) -> dict:
    params = urllib.parse.urlencode(
        {
            "query": query,
            "orientation": orientation,
            "per_page": 10,
            "page": page,
        }
    )
    data = api_get(f"https://api.unsplash.com/search/photos?{params}", access_key)
    for photo in data.get("results", []):
        if photo["id"] not in used_ids:
            return photo
    if page < 3 and data.get("total_pages", 0) > page:
        return search_photo(query, orientation, access_key, used_ids, page + 1)
    raise RuntimeError(f"Aucune photo disponible pour: {query}")


def save_variants(master_path: Path, variants: list[int]) -> None:
    with Image.open(master_path) as img:
        rgb = img.convert("RGB")
        for width in variants:
            ratio = width / rgb.width
            height = max(1, int(rgb.height * ratio))
            resized = rgb.resize((width, height), Image.Resampling.LANCZOS)
            stem = master_path.stem
            variant_path = master_path.parent / f"{stem}-{width}.jpg"
            resized.save(variant_path, "JPEG", quality=85, optimize=True)


def main() -> None:
    access_key = load_access_key()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    used_ids: set[str] = set()
    credits: list[dict] = []

    MEDIA.mkdir(parents=True, exist_ok=True)

    for asset in manifest["assets"]:
        rel = asset["path"]
        dest = MEDIA / rel
        if dest.is_file() and dest.stat().st_size > 5000:
            print(f"  skip (existe) {rel}")
            continue

        dest.parent.mkdir(parents=True, exist_ok=True)
        print(f"  fetch {rel} …")

        photo = search_photo(asset["query"], asset.get("orientation", "landscape"), access_key, used_ids)
        used_ids.add(photo["id"])
        trigger_download(photo["links"]["download_location"], access_key)

        url = photo["urls"].get("regular") or photo["urls"]["full"]
        data = download_bytes(url)
        dest.write_bytes(data)

        with Image.open(dest) as img:
            rgb = img.convert("RGB")
            rgb.save(dest, "JPEG", quality=88, optimize=True)

        variants = asset.get("variants") or []
        if variants:
            save_variants(dest, variants)

        user = photo["user"]
        credits.append(
            {
                "file": rel,
                "photoId": photo["id"],
                "photographer": user["name"],
                "profile": user["links"]["html"],
                "unsplash": photo["links"]["html"],
            }
        )
        time.sleep(0.4)

    CREDITS.write_text(json.dumps(credits, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n{len(credits)} image(s) telechargee(s). Credits -> {CREDITS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
