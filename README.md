# EstateFlow — simplified property workspace

React + Vite, JavaScript/JSX, native HTML elements, custom CSS, and Supabase. The primary pages are Dashboard and Properties; deal and payment information is summarized on the dashboard.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Leave the Supabase values blank to use preview data. To connect the existing Supabase project, fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`, then restart Vite.

## Existing database

The app uses the current `supabase/schema.sql` table names and relationships: `properties`, `property_categories`, `agents`, `clients`, `deals`, and `payments`. It does not require a schema reset. Property creation and status changes use the existing properties table.

## Security note

The existing schema includes permissive `Allow all for anon` row-level security policies. Review and replace those policies with authenticated, role-scoped rules before storing real client, owner, deal, or payment data. Never put a Supabase service-role key in a browser app.

## Included

- Portfolio metrics and recent deal activity.
- Inventory search and status filtering.
- Add-property form and listing status updates.
- Responsive light dashboard layout.
- Preview data when Supabase is not configured.
- No UI component library, icon package, or router.
