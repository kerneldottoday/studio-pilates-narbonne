from pathlib import Path

t = Path(__file__).resolve().parents[2].joinpath("homepage.html").read_text(encoding="utf-8")
for key in ["moving-banner-mobile", "google.com/maps", "@lahissou", "studiopilatesnarbonne", ">Template<", ">template<"]:
    print(key, key.lower() in t.lower() if "template" in key.lower() else key in t)
