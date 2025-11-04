# Multi-stage Dockerfile for Django backend

# Base stage - common dependencies
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Development stage
FROM base as development

# Copy development dependencies
COPY requirements-dev.txt .
RUN pip install -r requirements-dev.txt

# Copy project files
COPY . .

# Create directories for static and media files
RUN mkdir -p /app/staticfiles /app/media

# Expose port
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production stage
FROM base as production

# Copy project files
COPY . .

# Create non-root user
RUN useradd -m -u 1000 alhilal && \
    chown -R alhilal:alhilal /app

# Create directories for static and media files
RUN mkdir -p /app/staticfiles /app/media && \
    chown -R alhilal:alhilal /app/staticfiles /app/media

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Switch to non-root user
USER alhilal

# Expose port
EXPOSE 8000

# Run gunicorn
WORKDIR /app/backend
CMD ["gunicorn", "alhilal.wsgi:application", "--bind", "0.0.0.0:8000"]

