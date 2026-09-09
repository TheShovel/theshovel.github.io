#!/usr/bin/env python3
"""Refresh data/kofiGoal.json from the public Ko-fi page.

Ko-fi sends no CORS headers, so the static site can't pull the goal
live from the browser. Instead this runs server-side (GitHub Actions
cron) where CORS doesn't apply, and commits the result.

Only stdlib is used so it runs on a stock runners image with no setup.

Usage:
    python3 scripts/fetch-kofi-goal.py [--url URL] [--out PATH] [--check]
    --check exits 1 when the file would change (dry run, no write).
"""

import argparse
import datetime
import html
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_URL = "https://ko-fi.com/theshovel"
DEFAULT_OUT = ROOT / "data" / "kofiGoal.json"
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read().decode("utf-8", errors="replace")


def clean(text):
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_goal(page):
    """Pull the first goal widget out of the Ko-fi profile HTML."""
    m = re.search(r'id="profileGoalTitle"[^>]*>(.*?)</div>', page, re.S)
    if not m:
        raise ValueError("goal title not found (page layout changed?)")
    title = clean(m.group(1))

    m = re.search(
        r'class="progress-bar"[^>]*aria-valuenow="([\d.]+)"', page
    )
    if m:
        percent = float(m.group(1))
    else:
        m = re.search(
            r'<span class="kfds-font-bold">([\d.]+)%\s*</span>'
            r'\s*<span[^>]*id="profileGoalTotal"',
            page,
        )
        if not m:
            raise ValueError("goal percent not found")
        percent = float(m.group(1))

    m = re.search(r'id="profileGoalTotal"[^>]*>(.*?)</span>', page, re.S)
    if not m:
        raise ValueError("goal total not found")
    # e.g. "of €200 goal" / "of $1,200 goal"
    total_txt = clean(m.group(1))
    m2 = re.match(r"^of\s+(.+?)\s+goal$", total_txt, re.I)
    if not m2:
        raise ValueError(f"unexpected goal total format: {total_txt!r}")
    amount_txt = m2.group(1)
    m3 = re.match(r"^([^\d.,]*)([\d.,]+)([^\d.,]*)$", amount_txt)
    if not m3:
        raise ValueError(f"unexpected goal amount format: {amount_txt!r}")
    currency = (m3.group(1) or m3.group(3)).strip()
    target = float(m3.group(2).replace(",", ""))
    raised = round(percent / 100 * target, 2)
    if raised == int(raised):
        raised = int(raised)
    if target == int(target):
        target = int(target)

    m = re.search(
        r'<p class="goal-description[^"]*">(.*?)</p>', page, re.S
    )
    description = clean(m.group(1)) if m else ""

    return {
        "title": title,
        "raised": raised,
        "target": target,
        "currency": currency,
        "description": description,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    out = Path(args.out)
    try:
        old = json.loads(out.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        old = {}

    goal = parse_goal(fetch(args.url))
    goal = {
        "title": goal["title"],
        "raised": goal["raised"],
        "target": goal["target"],
        "currency": goal["currency"],
        "url": old.get("url", args.url),
        "description": goal["description"],
        "updated": datetime.datetime.now(datetime.timezone.utc).date().isoformat(),
    }

    new_text = json.dumps(goal, ensure_ascii=False, indent=2) + "\n"
    old_text = json.dumps(old, ensure_ascii=False, indent=2) + "\n" if old else None

    if new_text == old_text:
        print("kofiGoal.json already up to date.")
        return 0

    if args.check:
        print("kofiGoal.json would change.")
        return 1

    out.write_text(new_text, encoding="utf-8")
    print(f"wrote {out} ({goal['currency']}{goal['raised']} of "
          f"{goal['currency']}{goal['target']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
