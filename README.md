# Fresh Market — Local Farmers Shop

Web application for a local farmers market: Django REST API + React (Bootstrap) frontend.

## Stack

- **Backend:** Django 5, DRF, SimpleJWT, SQLite (dev) or MySQL 8 (docker)
- **Frontend:** React 18, Vite, react-bootstrap, i18n (ru/en)
- **Infra:** docker-compose (MySQL + Redis)

## Quick start (local)

### 1. Start database (optional — SQLite used by default)

```bash
# Copy env and use MySQL instead of SQLite:
# cp .env.example .env
# Set DB_ENGINE=mysql and start containers:
docker compose up -d mysql redis
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

API: http://localhost:8000/api/  
Docs: http://localhost:8000/api/docs/

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Demo accounts

| Role   | Username | Password      |
|--------|----------|---------------|
| Admin  | admin    | password123   |
| Buyer  | buyer    | password123   |
| Seller | seller1  | password123   |
| Seller | seller2  | password123   |

## Tests

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

## Manual test checklist

- [ ] **Buyer:** Browse catalog → filter/sort → add to cart → checkout (card + cash) → view order history
- [ ] **Seller:** Add/edit product → view orders → change status → view statistics chart
- [ ] **Admin:** Block/unblock user → moderate pending product/seller → export CSV/XLSX

## API overview

| Endpoint | Description |
|----------|-------------|
| `GET /api/health/` | Health check |
| `POST /api/auth/register/` | Register buyer/seller |
| `POST /api/auth/login/` | JWT login |
| `GET /api/products/` | Catalog (filter, sort, paginate) |
| `POST /api/orders/checkout/` | Place order (buyer) |
| `GET /api/seller/products/` | Seller product CRUD |
| `GET /api/admin/users/` | Admin user management |
| `GET /api/admin/analytics/` | Admin analytics + export |

## Project structure

```
fresh-market/
├── backend/          # Django REST API
├── frontend/         # React + Vite
├── docker-compose.yml
└── .env.example
```

## Browser support

Chrome ≥ 60, Firefox ≥ 55, Edge ≥ 79, Safari ≥ 12. IE11 shows an unsupported-browser message.

## Production notes

- Set `DJANGO_DEBUG=False`, strong `DJANGO_SECRET_KEY`, `DB_ENGINE=mysql`
- Enable HTTPS (`SECURE_SSL_REDIRECT`)
- Configure real email/SMS providers in `api/orders/notifications.py`
- Optional: Sentry via `SENTRY_DSN`
