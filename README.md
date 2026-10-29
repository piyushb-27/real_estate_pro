# EstateFlow — simplified property workspace

React + Vite using JavaScript/JSX, semantic HTML, and custom CSS. The primary pages are Dashboard and Properties; deal and payment information is summarized on the dashboard.

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Leave the Supabase values blank to use sample preview data. To connect the existing Supabase project, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`, then restart Vite.

## Database compatibility

The frontend uses the existing table names and columns in `supabase/schema.sql`: `properties`, `property_categories`, `agents`, `clients`, `deals`, and `payments`. It does not require a schema reset. Property creation and status changes write to the existing `properties` table.

## Security note

The current schema includes permissive `Allow all for anon` row-level security policies. These are unsuitable for real customer, owner, deal, or payment data. Replace them with authenticated, role-scoped policies before production use. Never expose a Supabase service-role key in browser code.

## Included

- Responsive light dashboard and property inventory.
- Search by title, city, locality, or owner; filter by listing status.
- Add a property and update listing status.
- Dashboard summaries for deals, closed deal value, and payment-derived commission.
- Sample preview data when Supabase is not configured.
- No Tailwind, component library, icon package, TypeScript build step, or router dependency.
