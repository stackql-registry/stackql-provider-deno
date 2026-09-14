"""
Tier 1 smoke tests, parametrised from tier1.yaml.

To add a query: edit tier1.yaml. To add an assertion primitive: edit this file.
The intent is to keep the test file small enough that the YAML is the
human-readable contract.

Extensions over the shared archetype:
  - a session-scoped sweep deletes stackql-smoke-* apps, layers and domains
    left behind by an earlier aborted run before the cases start
  - `${TEST_SINCE}` / `${TEST_UNTIL}` are computed at import time (a three
    hour window ending now, RFC 3339) for the analytics and runtime-log cases
  - a per-case `poll` block re-runs the SQL until a predicate holds (used to
    wait for a revision build to finish)
  - a per-case `capture` block stores values from the result set into the
    substitution environment for later cases (the revision id created by
    the deploy, the app id)
"""

from __future__ import annotations

import os
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import pytest
import yaml

TIER1 = Path(__file__).resolve().parent / "tier1.yaml"
SMOKE_PREFIX = "stackql-smoke"

_VAR_RE = re.compile(r"\$\{([A-Z_][A-Z0-9_]*)\}")

_SESSION_START = datetime.now(timezone.utc).replace(microsecond=0)


def _rfc3339(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


# Computed at substitution time: TEST_SINCE is fixed three hours before the
# session started, TEST_UNTIL is "now" so cases that run after the deploy
# still cover the revision's runtime logs.
_DYNAMIC_ENV = {
    "TEST_SINCE": lambda: _rfc3339(_SESSION_START - timedelta(hours=3)),
    "TEST_UNTIL": lambda: _rfc3339(datetime.now(timezone.utc).replace(microsecond=0)),
}


def _substitute(template: str, env: dict[str, str]) -> str:
    def repl(match: re.Match[str]) -> str:
        name = match.group(1)
        if name in env:
            return env[name]
        if name in _DYNAMIC_ENV:
            return _DYNAMIC_ENV[name]()
        if name in os.environ:
            return os.environ[name]
        raise KeyError(f"tier1.yaml references ${{{name}}} but it is not set")
    return _VAR_RE.sub(repl, template)


def _load_cases() -> list[dict[str, Any]]:
    with TIER1.open() as f:
        return list(yaml.safe_load(f))


_PREDICATE_BUILTINS = {
    "all": all, "any": any, "len": len, "int": int, "float": float,
    "str": str, "bool": bool, "isinstance": isinstance, "abs": abs,
    "min": min, "max": max, "sum": sum, "range": range, "next": next,
    "sorted": sorted, "set": set, "list": list, "dict": dict, "tuple": tuple,
}


def _evaluate(expr: str, rows: list[dict[str, Any]]) -> Any:
    """Expressions have `rows` (full result) and `r` (rows[0] if any) in scope.
    They are author-controlled YAML, not user input - eval is fine here."""
    scope = {"rows": rows, "r": rows[0] if rows else None}
    return eval(expr, {"__builtins__": _PREDICATE_BUILTINS}, scope)


@pytest.fixture(scope="session")
def sweep(runner, test_env: dict[str, str], provider_config) -> None:
    """Delete stackql-smoke-* objects left by an earlier aborted run so the
    lifecycle cases start from a clean slate. Apps are detached from layers
    first (a referenced layer cannot be deleted)."""
    p = provider_config.provider_name
    apps = [r for r in runner.run(f"SELECT id, slug FROM {p}.apps.apps") if str(r.get("slug", "")).startswith(SMOKE_PREFIX)]
    for r in apps:
        runner.run(f"UPDATE {p}.apps.apps SET layers = '[]' WHERE app = '{r['slug']}'")
        runner.run(f"DELETE FROM {p}.apps.apps WHERE app = '{r['slug']}'")
    for r in runner.run(f"SELECT id, slug FROM {p}.layers.layers"):
        if str(r.get("slug", "")).startswith(SMOKE_PREFIX):
            runner.run(f"DELETE FROM {p}.layers.layers WHERE layer = '{r['slug']}'")
    for r in runner.run(f"SELECT id, domain FROM {p}.domains.domains"):
        if str(r.get("domain", "")).startswith(SMOKE_PREFIX):
            runner.run(f"DELETE FROM {p}.domains.domains WHERE domain = '{r['domain']}'")


@pytest.mark.parametrize("case", _load_cases(), ids=lambda c: c["name"])
def test_tier1(case: dict[str, Any], runner, mode: str, test_env: dict[str, str], derived_env: dict[str, str], sweep: None) -> None:
    # Optional per-case `xfail` block in tier1.yaml flags known provider/binary
    # bugs without losing visibility. Shape:
    #   xfail:
    #     reason: "..."           # required, surfaced in pytest output
    #     modes: [pgwire]         # optional - if omitted, applies to all modes
    xfail = case.get("xfail")
    if xfail and (xfail.get("modes") is None or mode in xfail["modes"]):
        pytest.xfail(xfail.get("reason", "known issue"))

    sql = _substitute(case["sql"], test_env)
    rows = runner.run(sql)

    # Optional `poll` block: re-run until `until` holds (or time out).
    #   poll:
    #     until: "r is not None and r['status'] in ('succeeded', 'failed')"
    #     timeout_s: 180
    #     interval_s: 5
    poll = case.get("poll")
    if poll:
        until = _substitute(poll["until"], test_env)
        deadline = time.monotonic() + float(poll.get("timeout_s", 180))
        interval = float(poll.get("interval_s", 5))
        while not _evaluate(until, rows):
            if time.monotonic() > deadline:
                pytest.fail(f"poll timed out waiting for: {until}\nlast rows: {rows!r}\nSQL:\n{sql}")
            time.sleep(interval)
            rows = runner.run(sql)

    assertions = case.get("assertions", {})

    min_rows = assertions.get("min_rows", 1)
    assert len(rows) >= min_rows, (
        f"expected at least {min_rows} row(s), got {len(rows)}\nSQL:\n{sql}"
    )

    required_columns = assertions.get("required_columns", [])
    for col in required_columns:
        for i, row in enumerate(rows):
            assert col in row, (
                f"row {i} missing required column '{col}'. "
                f"present columns: {sorted(row)}\nSQL:\n{sql}"
            )

    for expr in assertions.get("row_predicates", []):
        substituted = _substitute(expr, test_env)
        assert bool(_evaluate(substituted, rows)), (
            f"row_predicate failed: {substituted}\nrows: {rows!r}\nSQL:\n{sql}"
        )

    # Optional `capture` block: VAR -> expression over rows / r, stored for
    # later cases (and exported so subprocesses see it too).
    for name, expr in (case.get("capture") or {}).items():
        value = str(_evaluate(_substitute(expr, test_env), rows))
        test_env[name] = value
        os.environ[name] = value
