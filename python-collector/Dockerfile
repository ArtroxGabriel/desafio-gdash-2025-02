FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install uv CLI and minimal OS deps, then clean the layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && mv /root/.local/bin/uv /usr/local/bin/uv \
    && apt-get purge -y curl \
    && rm -rf /var/lib/apt/lists/*

# Optional: keep uv from creating symlinks in system installs
ENV UV_LINK_MODE=copy

# Copy project files
COPY pyproject.toml mise.toml README.md ./
COPY src/ ./src/

# Install app and dependencies into the system interpreter using uv
RUN uv pip install --system --no-cache-dir --upgrade pip \
    && uv pip install --system --no-cache-dir .

# Non-root user for runtime
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app
USER appuser

CMD ["uv", "run", "weather-collector"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD pgrep -f "apscheduler" || exit 1
