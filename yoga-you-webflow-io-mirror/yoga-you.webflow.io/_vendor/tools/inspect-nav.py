from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

def validate_divs(fragment, label):
    stack = []
    for m in re.finditer(r"<(/?)div(?:\s|>|/)", fragment, re.I):
        closing = m.group(1) == "/"
        if closing:
            if not stack:
                print(label, "EXTRA CLOSE at", m.start())
            else:
                stack.pop()
        else:
            stack.append(m.start())
    print(label, "unclosed opens:", len(stack), stack[:5])
    print(label, "div opens/closes:", fragment.count("<div"), fragment.count("</div>"))

for name in ["homepage.html", "contact.html", "classes/yoga-for-focus.html"]:
    t = ROOT.joinpath(name).read_text(encoding="utf-8")
    start = t.index('<div data-animation="default" class="navbar w-nav"')
    end = t.index("<section", start)
    validate_divs(t[start:end], name)
