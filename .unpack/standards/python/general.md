# Python — General Standards

> **Status**: seeded
> **Applies to**: Any Python project (library, CLI, API, script)
> **Depends on**: `universal/file-length.md` for file length rules

## Project structure

Use the `src/` layout. Always.

```
project-name/
├── pyproject.toml          # ALL project + tool config (single file)
├── poetry.lock             # Committed to version control
├── .python-version         # Python version (e.g., "3.11")
├── .env.example            # Template for required env vars
├── Dockerfile
├── src/
│   └── project_name/       # Main package (snake_case, matches import name)
│       ├── __init__.py
│       ├── main.py         # Entry point
│       ├── config.py       # Settings via pydantic-settings
│       ├── exceptions.py   # Custom exception hierarchy
│       ├── api/
│       │   ├── __init__.py
│       │   ├── routes/     # FastAPI routers
│       │   └── dependencies.py
│       ├── services/       # Business logic
│       ├── models/         # Data models (Pydantic, SQLAlchemy)
│       └── utils/          # Shared utilities (domain-specific, not a dumping ground)
├── tests/
│   ├── __init__.py
│   ├── conftest.py         # Project-wide fixtures
│   ├── unit/
│   └── integration/
└── scripts/                # One-off scripts, migrations
```

**Rules:**
- All source code under `src/project_name/`. Never flat layout
- Package name is `snake_case` matching the import name
- `tests/` at project root, NOT inside `src/` — tests are not shipped
- `__init__.py` in every package directory — use for re-exports (barrel pattern)
- `__all__` required in every `__init__.py` to make the public API explicit
- No `setup.py`, no `setup.cfg`, no `requirements.txt` — everything in `pyproject.toml`

## Naming conventions

- **Files and modules**: `snake_case.py`
- **Packages (directories)**: `snake_case`
- **Functions and methods**: `snake_case`
- **Variables**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`, defined at module level
- **Private**: single underscore prefix `_private_thing`. Never double underscore (`__thing`) unless avoiding subclass collisions (rare)
- **Type variables**: single uppercase letter for simple cases (`T`, `K`, `V`), descriptive PascalCase with suffix for complex (`ResponseT`, `ModelT`)
- **Boolean variables/params**: prefix with `is_`, `has_`, `should_`, `can_`

## File patterns

- **Max file length**: 400 lines. See [universal/file-length.md](../universal/file-length.md)
- **One primary concept per file**: one class, one set of closely related functions, or one route group
- **`__init__.py`**: only re-exports, never logic. Under 30 lines
- **Split large modules into packages**: `services/user_service.py` (450 lines) → `services/user/` directory with sub-modules + `__init__.py` re-exports

## Import patterns

**Ordering** (enforced by ruff `I` rule, blank line between groups):

1. Standard library (`import os`, `from pathlib import Path`)
2. Third-party (`import httpx`, `from pydantic import BaseModel`)
3. Local/project (`from project_name.models import User`)

**Rules:**
- **Absolute imports always**. No relative imports (`from .thing import X`) except in `__init__.py` re-exports
- **`from module import Name`** for classes and functions. `import module` for namespaced access when module name adds clarity (`import json` → `json.dumps()`)
- **Never `from module import *`**
- **`TYPE_CHECKING` blocks** for imports only needed by the type checker (avoids circular imports, reduces startup time):
  ```python
  from __future__ import annotations
  from typing import TYPE_CHECKING

  if TYPE_CHECKING:
      from project_name.models.user import User
  ```

## Typing

**Type hints on every function signature and class attribute. No exceptions.**

**mypy strict mode, always:**

```toml
[tool.mypy]
strict = true
warn_unreachable = true
enable_error_code = ["ignore-without-code", "redundant-cast", "truthy-bool"]
```

**Modern patterns (3.11+):**
- `X | None` instead of `Optional[X]` — `Optional` is legacy
- Built-in generics: `list[str]`, `dict[str, int]`, `tuple[int, ...]` — never `List`, `Dict`, `Tuple` from `typing`
- `TypeAlias` for type aliases: `UserId: TypeAlias = int`
- `Protocol` for structural subtyping (duck typing with type safety) — prefer over `ABC` when you only need method signatures
- `TypedDict` for dicts with known string keys. `dataclass` for internal data containers. Pydantic `BaseModel` for validated external data
- `from __future__ import annotations` for forward reference support
- Never use `Any` unless interfacing with untyped third-party code — add `# type: ignore[<code>]` with specific error code

## Tooling

| Purpose | Tool | Notes |
|---------|------|-------|
| Dependency management | **poetry** | Replaces pip, pip-tools, pipenv |
| Linting | **ruff** | Replaces flake8, isort, pyupgrade, and plugins |
| Formatting | **ruff format** | Replaces black. Same output, 100x faster |
| Type checking | **mypy** (strict) | CI standard |
| Testing | **pytest** | No unittest, no nose |
| Logging | **structlog** | Structured key-value logging |
| Config | **pydantic-settings** | Env var validation at startup |

**All configuration in `pyproject.toml`**. No `.flake8`, `.isort.cfg`, `mypy.ini`, `pytest.ini` — every tool config in one file.

**Ruff configuration:**

```toml
[tool.ruff]
target-version = "py311"
line-length = 88
src = ["src"]

[tool.ruff.lint]
select = [
    "E", "W",   # pycodestyle
    "F",         # pyflakes
    "I",         # isort
    "UP",        # pyupgrade
    "B",         # flake8-bugbear
    "SIM",       # flake8-simplify
    "C4",        # flake8-comprehensions
    "PTH",       # flake8-use-pathlib
    "RUF",       # ruff-specific
    "S",         # flake8-bandit (security)
    "T20",       # flake8-print (no print statements)
    "RET",       # flake8-return
    "TCH",       # flake8-type-checking
    "ARG",       # flake8-unused-arguments
    "PERF",      # perflint
]
ignore = ["E501"]  # line length handled by formatter

[tool.ruff.lint.isort]
known-first-party = ["project_name"]
```

**Poetry commands:**

```bash
poetry new project-name       # scaffold new project
poetry add httpx pydantic     # add runtime dependencies
poetry add --group dev pytest ruff mypy  # add dev dependencies
poetry lock                   # generate/update lockfile
poetry install                # install from lockfile
poetry run pytest             # run in virtual environment
```

## Configuration

Use `pydantic-settings` for all configuration. No `os.getenv()` scattered through code.

```python
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Required — app crashes on startup if missing
    database_url: str
    secret_key: str

    # Optional with defaults
    debug: bool = False
    log_json: bool = False
    port: int = 8000


from functools import lru_cache

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
```

**Rules:**
- All env vars validated at startup — missing required vars crash immediately with clear Pydantic error
- Never read `os.environ` directly in application code — always through `Settings`
- `@lru_cache` on settings factory so `.env` is read once
- `.env` for local dev, real env vars in production. Never commit `.env`

## Error handling

Build a custom exception hierarchy:

```python
class ProjectError(Exception):
    def __init__(self, message: str, *, context: dict[str, object] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.context = context or {}

class ValidationError(ProjectError): ...
class NotFoundError(ProjectError): ...
class ConflictError(ProjectError): ...
class ExternalServiceError(ProjectError): ...
```

**Rules:**
- Never bare `except:` or `except Exception:` as a silencing mechanism
- Catch the most specific exception possible
- Always chain exceptions: `raise AppError("msg") from original_exception`
- For FastAPI: map exception classes to HTTP status codes in a single exception handler

**Structured logging with structlog:**

```python
import structlog
logger = structlog.get_logger()

# Log events, not sentences. Use snake_case event names + structured context
logger.info("user_created", user_id=user.id, email=user.email)
logger.error("payment_failed", order_id=order.id, reason=str(exc))
```

- Use `structlog` — not stdlib `logging` directly
- JSON output in production, pretty console in development
- Never f-strings in log messages (defeats lazy evaluation)
- Use `logger.exception()` inside except blocks (captures traceback)

## Testing

**pytest is the only test framework.** No `unittest.TestCase`.

```
tests/
├── __init__.py
├── conftest.py             # Project-wide fixtures
├── unit/
│   ├── __init__.py
│   ├── conftest.py         # Unit-specific fixtures
│   └── test_user_service.py
└── integration/
    ├── __init__.py
    ├── conftest.py         # Integration fixtures (DB, etc.)
    └── test_user_routes.py
```

**Naming:**
- Files: `test_<module_name>.py`
- Functions: `test_<behavior_being_tested>` — describe the scenario, not the method name
- No test classes unless grouping related tests. Plain functions by default

**Fixtures:**
- Use `conftest.py` at the appropriate directory level (auto-discovered by pytest)
- Factory fixtures for objects that need variation
- Scope fixtures appropriately: `session` for expensive setup (DB), `function` (default) for isolation
- Use `tmp_path` (built-in) for file system tests

**Parametrize** for testing multiple inputs:

```python
@pytest.mark.parametrize("email,is_valid", [
    ("user@example.com", True),
    ("invalid", False),
    ("", False),
])
def test_email_validation(email: str, is_valid: bool) -> None:
    assert validate_email(email) == is_valid
```

**Async tests** with `pytest-asyncio`:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

**Coverage**: 80% line coverage minimum. `pytest-cov` with `--cov-fail-under=80`. Don't chase 100%.

## Async patterns

- All FastAPI route handlers that perform I/O must be `async def`
- Never call blocking functions inside `async def` — use async equivalents
- `httpx.AsyncClient` instead of `requests`
- `asyncio.sleep` instead of `time.sleep`
- `aiofiles.open()` instead of `open()`
- `asyncio.TaskGroup` (3.11+) for structured concurrency
- `pathlib.Path` for all file system operations (never `os.path`)

## Anti-patterns

- **No bare `except:`** — always catch specific exceptions
- **No `from module import *`** — ever
- **No mutable default arguments** (`def f(items=[])`) — use `None` + create inside body
- **No `os.path`** — use `pathlib.Path`
- **No `print()`** for logging — use `structlog`. ruff `T20` catches this
- **No `requests` in async code** — use `httpx`
- **No untyped dicts** where `TypedDict`/`dataclass`/`BaseModel` fits — model your data
- **No deep inheritance** (max 2 levels) — prefer composition and `Protocol`
- **No circular imports** — restructure modules, use `TYPE_CHECKING` blocks
- **No hardcoded config** — everything through `pydantic-settings`
- **No tests that depend on execution order** — every test must be independent
- **No god functions** (>50 lines) — extract helpers
