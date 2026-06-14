import base64
import io
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

BRAND_DARK = (34, 34, 31, 255)  # #22221f
BRAND_LIGHT = (255, 251, 240, 255)  # #fffbf0


def load_lotus(src_path: Path) -> Image.Image:
    src = Image.open(src_path).convert("RGBA")
    pixels = src.load()
    out = Image.new("RGBA", src.size, (0, 0, 0, 0))
    out_pixels = out.load()

    for y in range(src.height):
        for x in range(src.width):
            r, g, b, a = pixels[x, y]
            if a < 12 and max(r, g, b) < 20:
                continue
            strength = max(a, max(r, g, b))
            alpha = min(255, int(strength * 7.5))
            out_pixels[x, y] = (
                BRAND_DARK[0],
                BRAND_DARK[1],
                BRAND_DARK[2],
                alpha,
            )

    bbox = out.getbbox()
    if not bbox:
        raise RuntimeError("Could not detect lotus shape in source image")
    return out.crop(bbox)


def fit_square(icon: Image.Image, size: int, padding_ratio: float = 0.12) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = int(size * padding_ratio)
    inner = size - pad * 2
    scale = min(inner / icon.width, inner / icon.height)
    nw = max(1, int(icon.width * scale))
    nh = max(1, int(icon.height * scale))
    resized = icon.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def on_light_bg(icon: Image.Image, size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BRAND_LIGHT)
    square = fit_square(icon, size, 0.18)
    canvas.alpha_composite(square)
    return canvas.convert("RGB")


def main() -> None:
    src_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    lotus = load_lotus(src_path)
    lotus = ImageEnhance.Sharpness(lotus).enhance(1.35)
    lotus = lotus.filter(ImageFilter.MinFilter(3))

    icon_512 = fit_square(lotus, 512, 0.1)
    icon_32 = fit_square(lotus, 32, 0.08)
    apple = on_light_bg(lotus, 180)

    icon_32.save(out_dir / "favicon-32.png", optimize=True)
    apple.save(out_dir / "apple-touch-icon.png", optimize=True)
    icon_512.save(out_dir / "favicon-source-512.png", optimize=True)

    buf = io.BytesIO()
    icon_512.save(buf, format="PNG")
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
        f'<image href="data:image/png;base64,{encoded}" width="512" height="512"/>'
        "</svg>"
    )
    (out_dir / "favicon.svg").write_text(svg, encoding="utf-8")

    print("Wrote favicon.svg, favicon-32.png, apple-touch-icon.png")


if __name__ == "__main__":
    main()
