# EstateFlow

EstateFlow is a real estate management dashboard for tracking properties, deals, payments, agents, and analytics in one place. It uses a dark, glassy interface and is structured as a single-page app with route-based views.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Supabase
- Lucide React icons

## Features

- Landing page with quick navigation into the app
- Dashboard, Properties, Deals, Payments, Agents, and Analytics pages
- Responsive sidebar navigation with a mobile drawer
- Toast notifications and modal-based UI patterns
- Supabase-ready data layer for backend integration

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run the App

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

## Project Structure

```text
src/
  components/   Reusable UI components such as the sidebar, modal, and toast system
  lib/          Shared utilities, including the Supabase client
  pages/        Route-level screens for the app
  App.tsx       Application routes and layout shell
  main.tsx      React entry point
  index.css     Global styles and theme variables
supabase/       SQL scripts for schema, seed data, and cleanup helpers
```

## Supabase Setup

The `supabase/` folder contains SQL files for the database schema and supporting data scripts. Apply the schema first, then seed data if needed, and keep the cleanup/repair scripts for maintenance tasks.
