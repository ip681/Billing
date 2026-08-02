# Архитектура

## Структура на репозиторито (предложение)

```
/backend
  /app
    /models        # SQLAlchemy модели
    /schemas        # Pydantic схеми (request/response)
    /routers        # FastAPI endpoints
    /services       # бизнес логика (напр. генериране на номер на фактура)
    /db.py          # database connection / session
    main.py
  /alembic          # миграции
  alembic.ini
  requirements.txt

/frontend
  /src
    /components
    /pages
    /api            # клиенти за FastAPI endpoints
    /types           # TypeScript типове
  vite.config.ts
  package.json

/docs
  ARCHITECTURE.md
  DATA_MODEL.md
  ROADMAP.md
```

## SQLite → PostgreSQL: правила за мигрируемост

За да остане преходът безболезнен, спазваме следните правила от самото начало:

1. **Никакви SQLite-специфични типове или функции** в модела на данните. Всичко се дефинира през SQLAlchemy типове (`Integer`, `String`, `Numeric`, `DateTime`, `Boolean`), не през суров SQL.
2. **Парични суми** — `Numeric` (decimal) тип, никога `Float`. SQLite няма истински decimal тип, но SQLAlchemy се грижи за коректното представяне при четене/запис.
3. **Дати** — `DateTime`/`Date` тип през SQLAlchemy, не текстови полета.
4. **Foreign keys** — да са изрично дефинирани в модела; при SQLite трябва изрично да се активира `PRAGMA foreign_keys=ON` при connection (SQLite ги пази изключени по подразбиране).
5. **Миграции само през Alembic** — никога ръчна промяна на схемата директно в базата. Всяка промяна на модел -> нова Alembic migration.
6. **Connection string през environment variable** (`DATABASE_URL`), не hardcoded в кода — превключването SQLite/PostgreSQL става само чрез смяна на тази стойност.
7. **Избягваме SQLite-специфични raw SQL заявки** (напр. `PRAGMA` извиквания извън connection setup, `sqlite_master` заявки и т.н.) в бизнес логиката.

## Concurrency бележка
SQLite позволява само един writer наведнъж (file-level lock). За текущия мащаб на приложението (малък брой едновременни потребители) това не е проблем. При реален production deploy с повече потребители, преминаването към PostgreSQL решава това нативно.

## Hosting (за по-нататък, при production deploy)
- SQLite не е подходящ за повечето PaaS platforms заради ефимерна файлова система при redeploy — преди production deploy се минава на PostgreSQL.
- Кандидати за hosting: Railway / Render (managed PostgreSQL, лесен deploy) или Hetzner VPS (по-евтино дългосрочно, повече ръчна конфигурация). Предпочитание за EU дейта център заради GDPR (фактури съдържат лични/фирмени данни).

## API комуникация
- Frontend говори с backend изключително през REST API (JSON), няма server-side rendering на HTML от FastAPI.
- CORS се конфигурира изрично за development (localhost) и production домейн.
