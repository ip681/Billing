# Фактуриращо бизнес приложение

Уеб приложение за издаване на фактури и управление на свързаните данни — контрагенти, продукти/услуги, справки. Поддържа множество фирми/акаунти (multi-tenant), всяка със собствени данни.

## Основни функционалности

- Регистрация с автоматично създаване на фирма (или присъединяване към съществуваща по покана от собственик)
- Издаване на фактури с автоматична последователна номерация
- "Снимане" (denormalization) на данни за фирма/контрагент/продукт в самата фактура при издаване — веднъж издадена фактура не се редактира ретроактивно
- PDF export на фактура, с възможност за качване на лого на фирмата
- Управление на контрагенти (клиенти/доставчици) и продукти/услуги
- Справки за оборот по период и по контрагент
- Управление на екип — собственик (owner) може да добавя други регистрирани акаунти (member) към фирмата си

## Технологичен стек

**Backend:** Python 3.11+, FastAPI, SQLAlchemy, Alembic, Pydantic, JWT автентикация (bcrypt + PyJWT)

**База данни:** SQLite за локална разработка, с цел преход към PostgreSQL за production. Схемата се пише и мигрира през SQLAlchemy + Alembic по начин, агностичен към конкретния database engine.

**Frontend:** React + TypeScript + Vite, комуникация с backend-а през REST API (JSON)

## Структура на проекта

```
/backend    — FastAPI приложение (app/), Alembic миграции (alembic/)
/frontend   — React + TypeScript + Vite приложение (src/)
/docs       — архитектура, модел на данните, roadmap
```

Виж [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) и [`docs/ROADMAP.md`](docs/ROADMAP.md) за повече детайли.

## Локално стартиране

### Backend

```
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
copy .env.example .env     # и попълни JWT_SECRET
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Frontend-ът очаква backend на `http://localhost:8000` (конфигурируемо през `VITE_API_BASE_URL`).

## Ключови бизнес правила

- Паричните суми винаги се обработват като `Decimal`, никога като `float`
- Номерът на фактурата е последователен и уникален в рамките на фирмата, без прекъсвания и без дублиране
- Ако фирмата не е регистрирана по ДДС, фактурата съдържа текстово основание за неначисляване на ДДС
- Всяка промяна в модела на данните минава през Alembic migration
