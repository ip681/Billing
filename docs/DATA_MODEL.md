# Модел на данните (концептуален)

Този документ описва таблиците концептуално — конкретните SQLAlchemy модели и точните типове на колоните се дефинират в кода, но структурата тук е отправна точка.

## company_settings
Настройки на фирмата, която ползва приложението. Вероятно една единствена активна конфигурация (или таблица с история, ако фирмени данни могат да се сменят с времето).

| Поле | Тип | Бележка |
|---|---|---|
| id | int, PK | |
| name | string | име на фирмата |
| eik | string | ЕИК/БУЛСТАТ |
| address | string | |
| is_vat_registered | boolean | дали е по ДДС |
| vat_exempt_reason | string, nullable | основание за неначисляване на ДДС, ако `is_vat_registered = false` |
| invoice_number_prefix | string, nullable | напр. "INV-" |
| next_invoice_number | int | следващ пореден номер |
| created_at / updated_at | datetime | |

## counterparties (контрагенти)
| Поле | Тип | Бележка |
|---|---|---|
| id | int, PK | |
| name | string | |
| eik | string | ЕИК/БУЛСТАТ на контрагента |
| vat_number | string, nullable | ДДС номер, ако е приложимо |
| address | string | |
| mol | string, nullable | МОЛ (материално отговорно лице) |
| email / phone | string, nullable | |
| created_at / updated_at | datetime | |

## products (продукти/услуги)
| Поле | Тип | Бележка |
|---|---|---|
| id | int, PK | |
| name | string | |
| unit | string | мерна единица (бр., час, кг...) |
| unit_price | numeric | |
| vat_rate | numeric, nullable | ставка ДДС, ако е приложимо |
| created_at / updated_at | datetime | |

## invoices (фактури)
| Поле | Тип | Бележка |
|---|---|---|
| id | int, PK | |
| invoice_number | string, unique | генериран последователно |
| issue_date | date | |
| counterparty_id | FK -> counterparties | |
| — снимка на данни на контрагента към момента на издаване (name, eik, address...) | | важно: не разчитаме само на FK, защото контрагентът може да се редактира по-късно |
| — снимка на данни на фирмата (name, eik, is_vat_registered, vat_exempt_reason) | | същата логика |
| subtotal | numeric | сума без ДДС |
| vat_amount | numeric | |
| total | numeric | |
| status | enum/string | напр. draft / issued / paid / cancelled |
| created_at / updated_at | datetime | |

## invoice_items (редове на фактура)
| Поле | Тип | Бележка |
|---|---|---|
| id | int, PK | |
| invoice_id | FK -> invoices | |
| product_id | FK -> products, nullable | nullable ако продуктът после бъде изтрит |
| — снимка на продуктови данни (name, unit, unit_price, vat_rate) | | |
| quantity | numeric | |
| line_subtotal | numeric | |
| line_vat | numeric | |
| line_total | numeric | |

## Важен принцип: "снимане" (denormalization) на данни
Фактурата, веднъж издадена, е правен/счетоводен документ — не бива да се променя ретроактивно, ако по-късно се редактират настройките на фирмата, данните на контрагента или цената на продукт. Затова `invoices` и `invoice_items` пазят собствено копие на relevantните данни към момента на издаване, а не разчитат единствено на FK връзки към текущото състояние на `company_settings`, `counterparties`, `products`.

## Отворени въпроси за по-нататък
- Трябва ли `invoices.status` да включва и "сторно" фактури (кредитно известие)?
- Multi-currency поддръжка ли е нужна, или само BGN?
- Потребители/роли (`users` таблица) — дори ако в момента приложението ще го ползва само собственикът, добре е схемата да го предвиди отсега.
