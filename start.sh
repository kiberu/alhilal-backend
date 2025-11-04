#!/bin/bash
set -e

echo "Starting Django application..."

# Change to backend directory
cd backend

echo "Running collectstatic..."
python3 manage.py collectstatic --noinput

echo "Running database migrations..."
python3 manage.py migrate --noinput

echo "Starting Gunicorn server..."
exec python3 -m gunicorn alhilal.wsgi --bind 0.0.0.0:$PORT --workers 4 --timeout 120

