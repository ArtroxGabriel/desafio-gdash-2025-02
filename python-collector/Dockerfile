# Use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Setup a non-root user
RUN groupadd --system --gid 999 nonroot \
    && useradd --system --gid 999 --uid 999 --create-home nonroot

WORKDIR /app

# Enable bytecode compilation
# Copy from the cache instead of linking since it's a mounted volume
# Omit development dependencies
# Ensure installed tools can be executed out of the box
# Place executables in the environment at the front of the path
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \ 
    UV_NO_DEV=1 \
    UV_TOOL_BIN_DIR=/usr/local/bin \
    PATH="/app/.venv/bin:$PATH"

# Install the project's dependencies using the lockfile and settings
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project

# Then, add the rest of the project source code and install it
# Installing separately from its dependencies allows optimal layer caching
COPY  . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked

# Use the non-root user to run our application
USER nonroot

CMD ["weather-collector"]

