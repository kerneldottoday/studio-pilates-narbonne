from pathlib import Path
import re

t = Path(__file__).resolve().parents[2].joinpath("homepage.html").read_text(encoding="utf-8")
start = t.find("inside-moving-text")
end = t.find("inside-moving-text", start + 1)
if end == -1:
    end = start + 2500
print(t[start:start+2500])
