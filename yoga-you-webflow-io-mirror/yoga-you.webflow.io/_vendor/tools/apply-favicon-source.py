"""Generate favicon assets from a complete square source image (e.g. Higgsfield output)."""
import base64
import io
import sys
from pathlib import Path

from PIL import Image


def resize_square(im: Image.Image, size: int) -> Image.Image:
    return im.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    src_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    img = Image.open(src_path).convert("RGB")

    icon_512 = resize_square(img, 512)
    icon_32 = resize_square(img, 32)
    apple = resize_square(img, 180)

    icon_512.save(out_dir / "favicon-source-512.png", optimize=True)
    icon_32.save(out_dir / "favicon-32.png", optimize=True)
    apple.save(out_dir / "apple-touch-icon.png", optimize=True)

    buf = io.BytesIO()
    icon_512.save(buf, format="PNG")
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
        f'<image href="data:image/png;base64,{encoded}" width="512" height="512"/>'
        "</svg>"
    )
    (out_dir / "favicon.svg").write_text(svg, encoding="utf-8")
    print("Wrote favicon.svg, favicon-32.png, apple-touch-icon.png, favicon-source-512.png")


if __name__ == "__main__":
    main()
