FROM python:3.12-slim AS base
WORKDIR /app
RUN pip install --no-cache-dir poetry

# Builder stage to install dependencies
FROM base AS builder
WORKDIR /app
COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false && \
    poetry config installer.parallel false && \
    poetry install --no-root

# Runtime stage
FROM python:3.12-slim AS runtime
WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy application files
COPY . .

# Expose server port
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
