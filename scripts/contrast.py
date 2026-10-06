#!/usr/bin/env python3
"""UI OS contrast gate. Checks colour roles against WCAG 2.2 thresholds.

Usage:  python3 contrast.py tokens.json
Pair kinds: body (>=7.0, AAA), large (>=4.5), ui (>=3.0), text-min (>=4.5)
Exit code 1 if any pair fails, so it can gate a build.
"""
import json
import sys

REQUIRED = {"body": 7.0, "text-min": 4.5, "large": 4.5, "ui": 3.0}


def _lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_colour):
    h = hex_colour.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def check(tokens):
    roles = tokens["roles"]
    failed = 0
    for fg, bg, kind in tokens["pairs"]:
        need = REQUIRED[kind]
        got = ratio(roles[fg], roles[bg])
        ok = got >= need
        failed += 0 if ok else 1
        print(f"{'PASS' if ok else 'FAIL'}  {fg:>14} on {bg:<12} {got:5.2f}:1  need {need:.1f} ({kind})")
    print(f"\n{len(tokens['pairs']) - failed}/{len(tokens['pairs'])} pairs pass")
    return failed


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: contrast.py tokens.json")
    with open(sys.argv[1], encoding="utf-8") as f:
        sys.exit(1 if check(json.load(f)) else 0)
