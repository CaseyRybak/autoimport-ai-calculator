# MVP QA Checklist

Use this checklist before release handoffs, Vercel deploy verification and major demo
reviews. It focuses on the current MVP surface: public calculator, Vehicle Catalog,
Supabase leads, admin leads, admin catalog, CSV import/export and production deployment.

## Pre-commit checks

Run before committing code changes:

```bash
npm test
npm run typecheck
npm run build
```

For markdown-only documentation changes, these checks may be skipped when the change cannot
affect runtime behavior.

## Local smoke test

- [ ] Start the local app with `npm run dev`.
- [ ] Open `/`.
- [ ] Verify the calculator loads without runtime errors.
- [ ] Select country -> brand -> model -> year -> engine -> volume.
- [ ] Verify the selected catalog vehicle price is applied automatically.
- [ ] Switch display currency between USD, RUB, EUR and CNY.
- [ ] Verify totals and breakdown update after currency, budget or option changes.
- [ ] Submit a lead from the public form.
- [ ] Open `/admin`.
- [ ] Pass the admin password gate when `ADMIN_DEMO_PASSWORD` is configured.
- [ ] Verify the lead list loads real Supabase leads when service-role env is configured,
      or demo fallback when admin env is missing.
- [ ] Verify `/admin` status filter, search, sorting and 10/50/100 pagination update the
      URL query params and visible lead list.
- [ ] Open a lead detail card from `/admin`.
- [ ] Verify the detail page shows client contacts, selected vehicle, budget, total,
      calculation breakdown, selected services and client comment.
- [ ] Change lead status and verify the saved status remains after reload.
- [ ] Add a manager comment and verify it appears in newest-first history after reload.

## Production smoke test

- [ ] After Vercel deploy, open `/` on the production URL.
- [ ] Verify the deployed UI reflects the new commit, not an older build.
- [ ] Complete the main calculator flow in production.
- [ ] Submit a production smoke-test lead.
- [ ] Open `/admin`.
- [ ] Verify the admin password gate and lead list behavior.
- [ ] Verify CRM filters/search/sort and 10/50/100 pagination work on the production
      lead list.
- [ ] Open `/admin/catalog`.
- [ ] Verify catalog filters, pagination and row cards load.
- [ ] Open `/admin/catalog/import`.
- [ ] Verify the CSV import screen loads after admin access.
- [ ] Verify the deployed commit SHA or visible change matches the commit being released.

## Supabase checks

- [ ] Submitted leads are saved in `public.leads` through service-role creation when
      `SUPABASE_SERVICE_ROLE_KEY`, insert/select grants and sequence grants are
      configured.
- [ ] Anon lead insert fallback works only when public Supabase env vars and insert-only
      lead permissions are configured.
- [ ] Do not enable anon `SELECT` on `public.leads`.
- [ ] Server-side service-role lead read works for `/admin` and lead detail routes.
- [ ] Server-side service-role status update works for `public.leads.status`.
- [ ] Server-side service-role comment insert/read works for `public.lead_comments`.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is configured only as a server-side env var.
- [ ] n8n lead intake works when `N8N_NEW_LEAD_WEBHOOK_URL` and `N8N_SHARED_SECRET` are
      configured: webhook receives the lead and `/api/n8n/leads` status/count reads pass
      with the shared secret.
- [ ] Telegram routing is correct when automation is enabled: new lead and reminders go
      to `TELEGRAM_LEADS_CHAT_ID`; RED ALERT and owner report go to
      `TELEGRAM_OWNER_CHAT_ID`.
- [ ] Direct Telegram lead notification works only as fallback when n8n is not configured
      or the n8n webhook fails.
- [ ] Lead submission still succeeds when Telegram env vars are missing or Telegram API
      delivery fails.
- [ ] Vehicle Catalog counts are available:

```sql
select count(*) from public.vehicle_brands;
select count(*) from public.vehicle_models;
select count(*) from public.vehicle_variants;
```

- [ ] Demo seed counts match expectations when the demo seed is used:
      15 brands, 60 models and 180 variants.

## Vehicle Catalog checks

- [ ] Public calculator reads active Vehicle Catalog data or shows the local fallback state.
- [ ] Country selection limits available brands.
- [ ] Brand selection limits available models.
- [ ] Model selection limits available years, engine types and engine volumes.
- [ ] Inactive-only brands/models do not appear in the public calculator.
- [ ] `source_price_usd` is used as the catalog base price.
- [ ] The public calculator does not allow manual editing of the selected catalog price.
- [ ] Admin `/admin/catalog` supports country, brand, model, activity and search filters.
- [ ] Admin `/admin/catalog` supports 10, 50 and 100 cards per page.
- [ ] Row save updates `source_price_usd`, `source_name`, `source_url` and
      `last_checked_at` through server-side service-role logic.
- [ ] Activate/deactivate changes `vehicle_variants.is_active` without hard delete.

## CSV import/export checks

- [ ] CSV template/import columns are:
      `country,brand,model,year,engine_type,engine_volume_liters,source_market,source_price_usd,source_name,source_url,last_checked_at,is_active`.
- [ ] Uploading CSV shows validation preview without writing data.
- [ ] Preview reports blocking row errors before confirm.
- [ ] Confirm import is available only when there are no blocking validation errors.
- [ ] Confirm import writes valid data through server-side service-role upsert.
- [ ] Re-importing the same rows is repeatable and does not create duplicate brand/model/
      variant records.
- [ ] Export downloads the filtered dataset for the current `/admin/catalog` country,
      brand, model, activity and search filters.
- [ ] Export uses the same columns as the import template and does not include display
      currency.

## Known MVP limitations

- Production auth is not implemented; admin access uses the current password gate.
- Supabase Free does not provide automatic backups; export or database backup strategy is
      required before production data matters.
- The calculation is preliminary and is not a real customs calculation.
- Catalog prices require real sources before production/commercial use.
- Demo seed prices are placeholders and must not be presented as market prices.
- Calculation settings are read-only demo controls.
- n8n reminder/report settings are currently workflow-level values, not editable from the
      app UI.
- AI-assisted text generation is roadmap-only and not connected.
