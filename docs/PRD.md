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
- Форма заявки с сохранением в Supabase при настроенных env-переменных и правах:
  service-role creation как основной путь и anon insert как fallback.
- Neutral fallback: если Supabase/env недоступны, форма показывает нейтральное
  подтверждение без технических деталей в клиентском UI.
- Админка: список заявок, карточка заявки и настройки.
- `/admin` читает реальные заявки server-side через `SUPABASE_SERVICE_ROLE_KEY` после
  password gate, с mock fallback для локального режима.
- CSV import для bulk-обновления Vehicle Catalog через admin UI.
- Admin Vehicle Catalog management на уровне вариантов: просмотр, фильтры, поиск,
  экспорт CSV, редактирование цены/источника/даты проверки и активация/деактивация.
- Persisted admin lead statuses and manager comments.
- Admin lead detail updates status/comment state without reload through protected polling.
- n8n automation for production lead intake: Google Sheets append, Telegram routing,
  employee reminders, Telegram status buttons/callbacks, owner RED ALERT and daily owner
  status report.
- Supabase-backed структура без реальных ключей в репозитории.
- Архитектурные точки расширения для будущих AI-интеграций без реальных AI-запросов.

## Не входит в MVP

- Реальные таможенные формулы.
- Production-авторизация админки.
- Structural catalog editor для добавления/редактирования brand/model/year/engine fields
  напрямую в row editor.
- Production price enrichment с проверенными source URLs, датами проверки и методами
  обновления цен.
- Реальные AI-запросы.
- Full production CRM workflows beyond the current n8n lead intake/reminder/report
  automation and Telegram status callbacks.

## Текущий MVP-статус

- Lead persistence уже входит в текущий MVP: `createLead()` предпочитает server-side
  insert через `SUPABASE_SERVICE_ROLE_KEY`, чтобы получить `id` и `lead_number` для
  админских ссылок и уведомлений. Если service-role env недоступен, остается anon insert
  fallback при настроенных `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` и
  insert-only правах.
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
- Admin status/comment persistence уже входит в текущий MVP: статус заявки сохраняется
  в `public.leads.status`, а комментарии менеджера сохраняются в `public.lead_comments`.
- Admin lead detail polling уже входит в текущий MVP: открытая карточка заявки
  обновляет статус и комментарии через защищенный compact snapshot без ручного reload.
- n8n automation уже входит в текущий MVP: новая заявка передается в n8n после
  Supabase insert, пишется в Google Sheet, отправляет Telegram-сообщение с кнопками в
  группу сотрудников, делает reminders, обрабатывает Telegram status callbacks, убирает
  использованные кнопки, отправляет group confirmation, RED ALERT владельцу и ежедневный
  owner report.
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
- Внешние изменения статуса/комментариев, например из Telegram callback, появляются в
  открытой карточке заявки без ручного reload.

Текущий MVP покрывает эти критерии для CRM-minimum через server actions и protected
polling endpoint.

n8n automation считается готовой для текущего MVP, когда:

- Новая Supabase-заявка вызывает n8n production webhook.
- Заявка добавляется в Google Sheet `AutoImport Leads`.
- Новая заявка и reminders уходят в employee Telegram group.
- RED ALERT и ежедневный owner report уходят в owner Telegram chat.
- `/api/n8n/leads` защищен shared secret и возвращает status/count data для n8n.
- Telegram status buttons update lead status through protected `POST /api/n8n/leads`,
  remove the clicked message buttons and post a group status-change confirmation.

Текущий MVP покрывает эти критерии, но настройки reminder/report пока hardcoded в n8n
workflow и требуют отдельной editable settings phase.
