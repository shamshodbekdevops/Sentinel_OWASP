# Sentinel-OWASP Backend

Minimal Django backend scaffold for the Sentinel-OWASP prompt.

## What is included

- SQLite3 database setup
- Built-in Django `User` model
- `ScanModel` with `URLField`, `score`, `risk_data`, `findings`, and `status`
- Thread-based scanning flow without Celery or Redis
- JSON API endpoints for scan start, status polling, and dashboard data
- Global stats context processor for template integration

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## API endpoints

- `POST /scan/start/`
- `GET /scan/status/<id>/`
- `GET /dashboard/data/`
