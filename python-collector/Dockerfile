FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    procps \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml mise.toml README.md ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system --no-cache-dir .

COPY src/ ./src/

RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system --no-cache-dir .

RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app

USER appuser

CMD ["weather-collector"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD pgrep -f "weather-collector" || exit 1
