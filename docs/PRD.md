# AutoImport AI Calculator PRD

## Цель

Создать рабочий MVP веб-сервиса для бизнеса по импорту авто: публичный калькулятор
стоимости под ключ, форма заявки и админка для обработки лидов.

## Пользователи

- Клиент: хочет быстро понять примерный бюджет импорта автомобиля.
- Менеджер: просматривает заявки, видит расчет, меняет статус и готовит ответ клиенту.
- Владелец/команда: оценивает архитектуру, UI, чистоту логики и готовность к развитию.

## MVP-функции

- Публичный калькулятор с предварительными формулами.
- Vehicle Catalog dropdown: выбор страны, бренда, модели, года, двигателя и объема из
  Supabase-каталога с зависимыми списками.
- Расчет breakdown и статуса бюджета.
- Форма заявки с сохранением в Supabase при настроенных env-переменных и правах.
- Neutral fallback: если Supabase/env недоступны, форма показывает нейтральное
  подтверждение без технических деталей в клиентском UI.
- Админка: список заявок, карточка заявки и настройки.
- `/admin` читает реальные заявки server-side через `SUPABASE_SERVICE_ROLE_KEY` после
  password gate, с mock fallback для локального режима.
- CSV import для bulk-обновления Vehicle Catalog через admin UI.
- Admin Vehicle Catalog management на уровне вариантов: просмотр, фильтры, поиск,
  экспорт CSV, редактирование цены/источника/даты проверки и активация/деактивация.
- Supabase-backed структура без реальных ключей в репозитории.
- Структура для будущих AI-интеграций без реальных ключей.

## Не входит в MVP

- Реальные таможенные формулы.
- Production-авторизация админки.
- Structural catalog editor для добавления/редактирования brand/model/year/engine fields
  напрямую в row editor.
- Production price enrichment с проверенными source URLs, датами проверки и методами
  обновления цен.
- Реальные AI-запросы.
- Production CRM workflows.
- Persist admin status changes и manager comments.

## Текущий MVP-статус

- Lead persistence уже входит в текущий MVP: `createLead()` делает insert в
  `public.leads`, если заданы `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` и Supabase разрешает anon insert.
- Admin real lead read уже входит в текущий MVP: admin routes читают `public.leads`
  через server-side service-role helper после `ADMIN_DEMO_PASSWORD`.
- Vehicle Catalog dropdown уже входит в текущий MVP: калькулятор читает активные строки
  каталога и строит зависимые dropdown.
- Human-readable lead numbers уже входят в текущий MVP: UUID остается technical id и URL
  key, `lead_number` отображается как `AIC-000001`.
- CSV import MVP уже входит в текущий MVP: `/admin/catalog/import` валидирует CSV,
  показывает preview и пишет в Supabase только после confirm.
- Admin catalog management уже входит в текущий MVP на уровне вариантов:
  `/admin/catalog` фильтрует, пагинирует, экспортирует CSV, обновляет
  `source_price_usd`, `source_name`, `source_url`, `last_checked_at` и управляет
  `is_active`.
- Structural editing для brand/model/year/engine fields остается next phase.

## Acceptance Criteria для следующих фаз

CSV import считается готовым, когда:

- CSV загружается через admin UI.
- Импорт валидирует brand/model/variant/year/engine/source price rows до записи.
- Admin видит preview с ошибками и изменениями.
- Confirm записывает валидные строки в Supabase Vehicle Catalog через server-side
  service_role flow.
- Import не делает CSV/Excel основным хранилищем; каталог сайта остается в Supabase.

Текущий MVP CSV import покрывает эти критерии для bulk import без ручного catalog editor.

Admin catalog management MVP считается готовым, когда:

- Через admin UI можно обновлять `source_price_usd`, `source_name`, `source_url`,
  `last_checked_at` и `is_active`.
- Изменения пишутся в Supabase server-side и отражаются в calculator dropdown.
- Seed prices не маркируются как реальные рыночные цены.

Текущий MVP покрывает эти критерии для variant-level управления без structural editor.

Structural catalog editing считается готовым, когда:

- Через admin UI можно добавлять brand/model/variant без CSV.
- Через admin UI можно менять brand/model/year/engine fields с учетом relationships и
  unique constraints.
- Structural changes проходят server-side validation и не ломают public dropdown.

Status/comment persistence считается готовым, когда:

- Изменение статуса заявки сохраняется в Supabase и видно после reload.
- Комментарий менеджера сохраняется в Supabase и связан с lead UUID.
- Admin UI показывает persisted status/comment state без временных обещаний.
