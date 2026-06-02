#!/usr/bin/env python3
"""
LibreSearch site smoke test.

Hits a running instance and checks pages, static assets, the search/suggest
APIs, the ALTCHA proof-of-work challenge round-trip, rate limiting, the
honeypot, bang redirects, security headers, and broken local links.

Usage:
    # start the app first (npm run dev), then:
    python3 test_site.py
    python3 test_site.py --base-url http://localhost:5173
    python3 test_site.py --skip-ratelimit       # don't hammer the rate limiter
    python3 test_site.py --quiet                 # only show failures + summary

Dependencies: none (Python 3.8+ standard library only).
Exit code: 0 if all checks pass (warnings allowed), 1 if any check fails.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import http.client  # noqa: F401  (urllib uses it under the hood)
import json
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field

# ── tiny ANSI helpers ────────────────────────────────────────────────────────
_USE_COLOR = sys.stdout.isatty()


def _c(code: str, text: str) -> str:
    return f"\033[{code}m{text}\033[0m" if _USE_COLOR else text


GREEN = lambda s: _c("32", s)
RED = lambda s: _c("31", s)
YELLOW = lambda s: _c("33", s)
DIM = lambda s: _c("2", s)
BOLD = lambda s: _c("1", s)


# ── HTTP ─────────────────────────────────────────────────────────────────────
@dataclass
class Resp:
    status: int
    headers: dict
    body: bytes
    url: str

    def __post_init__(self):
        # Normalise header keys to lowercase so lookups are case-insensitive
        # (dev servers/HTTP2 often send lowercased header names).
        self.headers = {k.lower(): v for k, v in self.headers.items()}

    def header(self, name: str) -> str | None:
        return self.headers.get(name.lower())

    @property
    def text(self) -> str:
        return self.body.decode("utf-8", "replace")

    def json(self):
        return json.loads(self.body.decode("utf-8"))


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Capture redirects instead of following them."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


_opener_follow = urllib.request.build_opener()
_opener_noredirect = urllib.request.build_opener(_NoRedirect())


# All test traffic is attributed to a synthetic client IP via X-Forwarded-For
# so the abuse-tracking/verification state never touches your real browser.
# (getClientKey reads X-Forwarded-For first.)
DEFAULT_TEST_IP = "198.51.100.7"  # TEST-NET-2, reserved for documentation/tests


def request(
    base: str,
    path: str,
    *,
    method: str = "GET",
    data: bytes | None = None,
    headers: dict | None = None,
    follow_redirects: bool = True,
    timeout: float = 15.0,
    client_ip: str = DEFAULT_TEST_IP,
) -> Resp:
    url = base.rstrip("/") + path
    hdrs = {"X-Forwarded-For": client_ip, **(headers or {})}
    req = urllib.request.Request(url, data=data, method=method, headers=hdrs)
    opener = _opener_follow if follow_redirects else _opener_noredirect
    try:
        with opener.open(req, timeout=timeout) as r:
            return Resp(r.status, dict(r.headers), r.read(), r.geturl())
    except urllib.error.HTTPError as e:
        return Resp(e.code, dict(e.headers or {}), e.read() or b"", url)


# ── test runner ───────────────────────────────────────────────────────────────
@dataclass
class Runner:
    base: str
    quiet: bool = False
    passed: int = 0
    failed: int = 0
    warned: int = 0
    failures: list = field(default_factory=list)

    def _log(self, line: str):
        if not self.quiet:
            print(line)

    def ok(self, name: str, detail: str = ""):
        self.passed += 1
        self._log(f"  {GREEN('PASS')}  {name}" + (f"  {DIM(detail)}" if detail else ""))

    def fail(self, name: str, detail: str = ""):
        self.failed += 1
        self.failures.append(f"{name}: {detail}".strip())
        # failures always print, even in quiet mode
        print(f"  {RED('FAIL')}  {name}" + (f"  {detail}" if detail else ""))

    def warn(self, name: str, detail: str = ""):
        self.warned += 1
        self._log(f"  {YELLOW('WARN')}  {name}" + (f"  {DIM(detail)}" if detail else ""))

    def section(self, title: str):
        self._log("\n" + BOLD(title))

    def check(self, name: str, condition: bool, detail: str = ""):
        if condition:
            self.ok(name, detail)
        else:
            self.fail(name, detail)
        return condition


# ── ALTCHA solver (mirrors src/lib/server/altcha.ts) ──────────────────────────
def solve_altcha(challenge: dict) -> str:
    """Brute-force the proof-of-work and return the base64 solution payload."""
    salt = challenge["salt"]
    target = challenge["challenge"]
    maxnumber = int(challenge.get("maxnumber", 50000))
    number = None
    for n in range(maxnumber + 1):
        if hashlib.sha256(f"{salt}{n}".encode()).hexdigest() == target:
            number = n
            break
    if number is None:
        raise ValueError("no solution found within maxnumber")
    payload = {
        "algorithm": challenge.get("algorithm", "SHA-256"),
        "challenge": target,
        "number": number,
        "salt": salt,
        "signature": challenge["signature"],
    }
    return base64.b64encode(json.dumps(payload).encode()).decode()


# ── individual test groups ─────────────────────────────────────────────────────
ERROR_MARKERS = ("Internal Error", "500 Internal", "Cannot find module", "ReferenceError")

PAGES = ["/", "/about", "/privacy", "/press", "/design", "/terms", "/settings"]
ASSETS = [
    "/favicon.svg",
    "/icon-mark.svg",
    "/2.svg",
    "/logo_dark.svg",
    "/altcha.svg",
    "/background.jpg",
    "/og-image.png",
    "/opensearch.xml",
]


def test_pages(r: Runner):
    r.section("Pages")
    for path in PAGES:
        resp = request(r.base, path)
        if not r.check(f"GET {path} → 200", resp.status == 200, f"got {resp.status}"):
            continue
        marker = next((m for m in ERROR_MARKERS if m in resp.text), None)
        if marker:
            r.fail(f"{path} error page", f"found '{marker}' in body")
        elif "<html" not in resp.text.lower():
            r.warn(f"{path} looks like HTML", "no <html> tag found")


def test_noindex(r: Runner):
    r.section("Robots / noindex")
    for path in ["/search?q=test", "/settings"]:
        resp = request(r.base, path)
        has = "noindex" in resp.text.lower()
        r.check(f"{path} has noindex meta", has)


def test_assets(r: Runner):
    r.section("Static assets")
    for path in ASSETS:
        resp = request(r.base, path)
        r.check(f"GET {path} → 200", resp.status == 200, f"got {resp.status}")
    # opensearch sanity
    osd = request(r.base, "/opensearch.xml")
    if osd.status == 200:
        r.check("opensearch.xml is valid", "OpenSearchDescription" in osd.text)


def test_search_api(r: Runner):
    r.section("Search API")
    resp = request(r.base, "/api/search?q=" + urllib.parse.quote("hello world"))
    if not r.check("/api/search → 200", resp.status == 200, f"got {resp.status}"):
        return
    try:
        data = resp.json()
    except Exception as e:
        r.fail("/api/search returns JSON", str(e))
        return
    if data.get("error"):
        r.warn("/api/search results", f"backend error: {data['error']}")
    else:
        n = len(data.get("results", []))
        r.check("/api/search returns results", n > 0, f"{n} results")

    # empty query → 400
    bad = request(r.base, "/api/search?q=")
    r.check("/api/search empty query → 400", bad.status == 400, f"got {bad.status}")


def test_suggest(r: Runner):
    r.section("Suggest API")
    resp = request(r.base, "/api/suggest?q=" + urllib.parse.quote("weath"))
    if not r.check("/api/suggest → 200", resp.status == 200, f"got {resp.status}"):
        return
    try:
        data = resp.json()
        r.check("/api/suggest returns a list", isinstance(data, list), f"type={type(data).__name__}")
    except Exception as e:
        r.fail("/api/suggest returns JSON", str(e))


def test_honeypot(r: Runner):
    r.section("Honeypot")
    resp = request(r.base, "/api/search?website=bot&q=" + urllib.parse.quote("cats"))
    if r.check("honeypot request → 200", resp.status == 200, f"got {resp.status}"):
        try:
            data = resp.json()
            r.check("honeypot returns no results", data.get("results") == [], str(data.get("results")))
        except Exception as e:
            r.fail("honeypot returns JSON", str(e))


def test_bang(r: Runner):
    r.section("Bang redirect")
    resp = request(r.base, "/search?q=" + urllib.parse.quote("!g test"), follow_redirects=False)
    is_redirect = resp.status in (301, 302, 307, 308)
    loc = resp.header("Location") or ""
    r.check("!g bang redirects", is_redirect, f"status={resp.status} location={loc[:60]}")


def test_security_headers(r: Runner):
    r.section("Security headers")
    resp = request(r.base, "/")
    expect = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Content-Security-Policy": None,  # just presence
        "Referrer-Policy": None,
    }
    for header, value in expect.items():
        got = resp.header(header)
        if value is None:
            r.check(f"{header} present", got is not None)
        else:
            r.check(f"{header} == {value}", got == value, f"got {got!r}")


def test_404(r: Runner):
    r.section("Error handling")
    resp = request(r.base, "/this-page-does-not-exist-" + str(int(time.time())))
    r.check("unknown route → 404", resp.status == 404, f"got {resp.status}")


def test_altcha(r: Runner):
    r.section("ALTCHA challenge")
    ch = request(r.base, "/api/altcha/challenge")
    if not r.check("/api/altcha/challenge → 200", ch.status == 200, f"got {ch.status}"):
        return
    try:
        challenge = ch.json()
    except Exception as e:
        r.fail("challenge is JSON", str(e))
        return
    required = {"algorithm", "challenge", "salt", "signature", "maxnumber"}
    if not r.check("challenge has required fields", required <= challenge.keys(),
                   f"missing {required - challenge.keys()}"):
        return

    # bad payload → rejected
    bad = request(
        r.base, "/api/altcha/verify", method="POST",
        data=json.dumps({"payload": "bogus"}).encode(),
        headers={"content-type": "application/json"},
    )
    r.check("verify rejects bad payload", bad.status == 400, f"got {bad.status}")

    # solve and verify
    try:
        payload = solve_altcha(challenge)
    except Exception as e:
        r.fail("solve proof-of-work", str(e))
        return
    good = request(
        r.base, "/api/altcha/verify", method="POST",
        data=json.dumps({"payload": payload}).encode(),
        headers={"content-type": "application/json"},
    )
    ok = good.status == 200 and good.json().get("ok") is True
    r.check("solved challenge verifies", ok, f"status={good.status} body={good.text[:80]}")

    # replay should fail
    replay = request(
        r.base, "/api/altcha/verify", method="POST",
        data=json.dumps({"payload": payload}).encode(),
        headers={"content-type": "application/json"},
    )
    r.check("replayed solution is rejected", replay.status == 400, f"got {replay.status}")


def test_ratelimit_and_recovery(r: Runner):
    r.section("Rate limiting + ALTCHA recovery")
    # Fresh synthetic IP per run → a clean, unverified bucket every time, so the
    # limiter reliably triggers and this stays repeatable.
    probe_ip = "203.0.113." + str(random.randint(2, 254))  # TEST-NET-3
    hit_429 = False
    sent = 0
    for i in range(40):
        resp = request(r.base, f"/api/search?q=ratelimit-probe-{i}", client_ip=probe_ip)
        sent += 1
        if resp.status == 429:
            hit_429 = True
            break
    r.check("rate limiter triggers 429", hit_429, f"after {sent} requests (ip {probe_ip})")

    if not hit_429:
        return

    # The search page should now present a challenge instead of an error.
    page = request(r.base, "/search?q=" + urllib.parse.quote("after limit"), client_ip=probe_ip)
    # (server load returns challengeRequired → the page renders the ALTCHA card)
    r.check("search page stays 200 while flagged", page.status == 200, f"got {page.status}")

    # Recover by solving a challenge - proves a solved PoW clears the flag.
    ch = request(r.base, "/api/altcha/challenge", client_ip=probe_ip).json()
    payload = solve_altcha(ch)
    verify = request(
        r.base, "/api/altcha/verify", method="POST",
        data=json.dumps({"payload": payload}).encode(),
        headers={"content-type": "application/json"},
        client_ip=probe_ip,
    )
    recovered = verify.status == 200 and verify.json().get("ok") is True
    r.check("solving challenge clears the flag", recovered, f"status={verify.status}")


def test_broken_links(r: Runner):
    r.section("Broken local links/assets (home page)")
    home = request(r.base, "/")
    refs = set(re.findall(r'(?:href|src)="(/[^"#?]*)"', home.text))
    # ignore framework asset hashes and the root
    refs = {x for x in refs if x not in ("/",) and not x.startswith("/_app/")}
    if not refs:
        r.warn("found local refs to check", "none discovered")
        return
    broken = []
    for ref in sorted(refs):
        resp = request(r.base, ref)
        if resp.status >= 400:
            broken.append(f"{ref} ({resp.status})")
    r.check(f"all {len(refs)} local refs resolve", not broken, "; ".join(broken))


# ── main ───────────────────────────────────────────────────────────────────────
def main() -> int:
    ap = argparse.ArgumentParser(description="LibreSearch site smoke test")
    ap.add_argument("--base-url", default="http://localhost:5173", help="base URL of the running app")
    ap.add_argument("--skip-ratelimit", action="store_true", help="skip the rate-limit/recovery test")
    ap.add_argument("--quiet", action="store_true", help="only show failures and the summary")
    args = ap.parse_args()

    base = args.base_url.rstrip("/")
    print(BOLD(f"LibreSearch smoke test → {base}"))

    # reachability
    try:
        root = request(base, "/")
        if root.status >= 500:
            print(RED(f"\nServer responded {root.status} on '/'. Is it healthy?"))
    except Exception as e:
        print(RED(f"\nCould not reach {base} ({e}).\nStart the app first (e.g. `npm run dev`)."))
        return 1

    r = Runner(base=base, quiet=args.quiet)

    test_pages(r)
    test_noindex(r)
    test_assets(r)
    test_broken_links(r)
    test_suggest(r)
    test_search_api(r)
    test_honeypot(r)
    test_bang(r)
    test_security_headers(r)
    test_404(r)
    test_altcha(r)
    if not args.skip_ratelimit:
        test_ratelimit_and_recovery(r)
    else:
        r.section("Rate limiting + ALTCHA recovery")
        r.warn("rate-limit test", "skipped (--skip-ratelimit)")

    # summary
    total = r.passed + r.failed
    print("\n" + BOLD("Summary"))
    print(f"  {GREEN(str(r.passed) + ' passed')}, "
          f"{RED(str(r.failed) + ' failed')}, "
          f"{YELLOW(str(r.warned) + ' warnings')}  ({total} checks)")
    if r.failures:
        print(BOLD("\nFailures:"))
        for f in r.failures:
            print(f"  {RED('•')} {f}")
    return 1 if r.failed else 0


if __name__ == "__main__":
    sys.exit(main())
