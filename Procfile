release: cd backend && python3 manage.py migrate --noinput && python3 manage.py collectstatic --noinput
web: cd backend && python3 -m gunicorn alhilal.wsgi --bind 0.0.0.0:$PORT --workers 4 --timeout 120

