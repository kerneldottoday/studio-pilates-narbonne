from pathlib import Path
import re

t = Path(
    r"C:\Users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io\homepage.html"
).read_text(encoding="utf-8")

for label in ["Jessica", "Suspendisse", "Kelly", "Phasellus", "In dui magna", "Yoga You", "Get started", "Start class", "Breathwork"]:
    print(label, t.count(label))

print("--- tabs ---")
for m in re.finditer(r'<div data-w-tab="Tab \d"[^>]*>.*?<h3 class="no-margins">([^<]+)</h3>', t):
    print(m.group(1))
