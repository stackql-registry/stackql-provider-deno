"""
Pytest fixtures for tier 1 / UAT smoke tests.

Provides a `runner` fixture that executes SQL against the local stackql build
in one of two modes, selected via `--mode={exec,pgwire}`:

  exec   - shells out to `stackql exec --output json ...` for each query.
           No long-lived process. Simplest, matches how end users invoke stackql.

  pgwire - starts `stackql srv` once per session on a random port, connects
           via psycopg, runs queries through the Postgres wire protocol.
           Closer to how applications consume stackql.

By default queries run against the locally generated provider (the file
registry under provider.yaml:registry_root). Pass `--live` to run the same
suite against the PUBLISHED provider from the public StackQL registry instead
(`REGISTRY PULL <provider>` is issued once at session start) - this is the
post-publish verification.

The same tier1.yaml runs under both modes - parity across the two transports
is part of what we're verifying.

Designed to be reused as-is across providers. The only per-provider files are
provider.yaml (this directory) and tier1.yaml (this directory).
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pytest
import yaml

TEST_DIR = Path(__file__).resolve().parent
REPO_ROOT = TEST_DIR.parent.parent
BINARY = TEST_DIR / ".bin" / "stackql"


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--mode",
        action="store",
        default="exec",
        choices=("exec", "pgwire", "both"),
        help="How to run stackql: exec (one-shot), pgwire (server), or both.",
    )
    parser.addoption(
        "--live",
        action="store_true",
        default=False,
        help="Use the published provider from the public registry instead of the local build.",
    )


def pytest_generate_tests(metafunc: pytest.Metafunc) -> None:
    if "mode" in metafunc.fixturenames:
        chosen = metafunc.config.getoption("--mode")
        modes = ("exec", "pgwire") if chosen == "both" else (chosen,)
        metafunc.parametrize("mode", modes, scope="session")


@dataclass(frozen=True)
class ProviderConfig:
    provider_name: str
    registry_root: Path
    required_env: list[str]
    test_env_defaults: dict[str, str]
    derived_env: dict[str, str]


@pytest.fixture(scope="session")
def provider_config() -> ProviderConfig:
    with (TEST_DIR / "provider.yaml").open() as f:
        data = yaml.safe_load(f)
    registry_root = (REPO_ROOT / data["registry_root"]).resolve()
    return ProviderConfig(
        provider_name=data["provider_name"],
        registry_root=registry_root,
        required_env=list(data.get("required_env", [])),
        test_env_defaults=dict(data.get("test_env_defaults", {})),
        derived_env=dict(data.get("derived_env", {})),
    )


@pytest.fixture(scope="session")
def test_env(provider_config: ProviderConfig) -> dict[str, str]:
    """Validates required auth env vars and applies test_env_defaults for
    substitution inside tier1.yaml SQL strings."""
    missing = [v for v in provider_config.required_env if not os.environ.get(v)]
    if missing:
        pytest.exit(
            f"Required env vars not set: {', '.join(missing)}. "
            f"Source the repo-root .env (or set them) before running tests.",
            returncode=2,
        )
    # .strip() defends against CRLF in .env files sourced from WSL - a trailing
    # \r in an auth header silently breaks API calls.
    env = {k: os.environ[k].strip() for k in provider_config.required_env}
    for key, default in provider_config.test_env_defaults.items():
        env[key] = os.environ.get(key, default).strip()
    # Re-export the cleaned values so subprocesses (stackql exec/srv) see them.
    for k, v in env.items():
        os.environ[k] = v
    return env


@pytest.fixture(scope="session")
def stackql_binary() -> Path:
    if not BINARY.exists():
        pytest.exit(
            f"stackql binary not found at {BINARY}. "
            f"Run `bash provider-dev/test/bootstrap.sh` first.",
            returncode=2,
        )
    return BINARY


@pytest.fixture(scope="session")
def live_mode(request: pytest.FixtureRequest) -> bool:
    return bool(request.config.getoption("--live"))


@pytest.fixture(scope="session")
def registry_arg(provider_config: ProviderConfig, live_mode: bool) -> str | None:
    """Registry JSON for the local build, or None for the public registry
    (stackql's default when --registry is omitted)."""
    if live_mode:
        return None
    cfg = {
        "url": f"file://{provider_config.registry_root.as_posix()}",
        "localDocRoot": provider_config.registry_root.as_posix(),
        "verifyConfig": {"nopVerify": True},
    }
    return json.dumps(cfg)


def _registry_flags(registry_arg: str | None) -> list[str]:
    return ["--registry", registry_arg] if registry_arg else []


@pytest.fixture(scope="session")
def provider_pulled(stackql_binary: Path, registry_arg: str | None, provider_config: ProviderConfig, live_mode: bool) -> None:
    """In --live mode pull the published provider once per session so both
    transports resolve it from the local provider cache."""
    if not live_mode:
        return
    proc = subprocess.run(
        [str(stackql_binary), "exec", *_registry_flags(registry_arg), f"REGISTRY PULL {provider_config.provider_name};"],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if proc.returncode != 0:
        pytest.exit(f"REGISTRY PULL {provider_config.provider_name} failed: {proc.stderr.strip()}", returncode=2)


class StackqlRunner:
    """Common interface both backends implement."""

    def run(self, sql: str) -> list[dict[str, Any]]:
        raise NotImplementedError


class ExecRunner(StackqlRunner):
    def __init__(self, binary: Path, registry_arg: str | None) -> None:
        self.binary = binary
        self.registry_arg = registry_arg

    def run(self, sql: str) -> list[dict[str, Any]]:
        proc = subprocess.run(
            [
                str(self.binary),
                "exec",
                *_registry_flags(self.registry_arg),
                "--output", "json",
                sql,
            ],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if proc.returncode != 0:
            raise RuntimeError(
                f"stackql exec failed (rc={proc.returncode})\n"
                f"stderr: {proc.stderr.strip()}\n"
                f"stdout: {proc.stdout.strip()}"
            )
        stdout = proc.stdout.strip()
        if not stdout:
            return []
        try:
            data = json.loads(stdout)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"non-JSON output from stackql exec: {e}\n{stdout!r}")
        # an empty result set is emitted as the JSON literal `null`
        if data is None:
            return []
        return data if isinstance(data, list) else [data]


class PgwireRunner(StackqlRunner):
    def __init__(self, conn) -> None:  # noqa: ANN001 - psycopg.Connection
        self.conn = conn

    def run(self, sql: str) -> list[dict[str, Any]]:
        with self.conn.cursor() as cur:
            cur.execute(sql)
            if cur.description is None:
                return []
            cols = [d.name for d in cur.description]
            return [dict(zip(cols, row)) for row in cur.fetchall()]


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _wait_for_port(host: str, port: int, timeout: float = 15.0) -> None:
    deadline = time.monotonic() + timeout
    last_err: Exception | None = None
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1.0):
                return
        except OSError as e:
            last_err = e
            time.sleep(0.2)
    raise RuntimeError(f"stackql pgwire server did not accept connections on {host}:{port}: {last_err}")


@pytest.fixture(scope="session")
def pgwire_server(stackql_binary: Path, registry_arg: str | None, test_env: dict[str, str], provider_pulled: None):
    """Starts stackql srv on a random port. Yields (host, port). Tears down on session end."""
    import psycopg  # noqa: F401 - import here so exec-only runs don't need it installed

    port = _free_port()
    log_path = TEST_DIR / ".bin" / f"stackql-server-{port}.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)

    env = {**os.environ}  # auth env vars must be visible to the server process
    cmd = [
        str(stackql_binary),
        "srv",
        *_registry_flags(registry_arg),
        f"--pgsrv.port={port}",
    ]
    with log_path.open("w") as logf:
        proc = subprocess.Popen(cmd, stdout=logf, stderr=subprocess.STDOUT, env=env)
    try:
        _wait_for_port("127.0.0.1", port)
        yield ("127.0.0.1", port)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


@pytest.fixture(scope="session")
def derived_env(runner: "StackqlRunner", test_env: dict[str, str], provider_config: ProviderConfig) -> dict[str, str]:
    """Resolves provider.yaml:derived_env - ${VAR}: <single-value SQL> - by
    running each query through the session runner, unless the variable is
    already set in the environment. Lets tier1.yaml reference ids (site id,
    team id, ...) that differ per account without hard-coding them."""
    import re

    var_re = re.compile(r"\$\{([A-Z_][A-Z0-9_]*)\}")
    for name, sql in provider_config.derived_env.items():
        if os.environ.get(name):
            test_env[name] = os.environ[name].strip()
            continue
        resolved = var_re.sub(lambda m: test_env[m.group(1)], sql)
        rows = runner.run(resolved)
        if not rows:
            pytest.exit(f"derived_env {name}: query returned no rows: {resolved}", returncode=2)
        value = str(next(iter(rows[0].values())))
        test_env[name] = value
        os.environ[name] = value
    return test_env


@pytest.fixture(scope="session")
def runner(
    mode: str,
    stackql_binary: Path,
    registry_arg: str | None,
    test_env: dict[str, str],
    provider_pulled: None,
    request: pytest.FixtureRequest,
) -> StackqlRunner:
    if mode == "exec":
        return ExecRunner(stackql_binary, registry_arg)

    import psycopg

    host, port = request.getfixturevalue("pgwire_server")
    conn = psycopg.connect(
        host=host,
        port=port,
        user="stackql",
        dbname="stackql",
        autocommit=True,
    )
    request.addfinalizer(conn.close)
    return PgwireRunner(conn)
