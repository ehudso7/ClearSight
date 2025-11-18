# Database Setup

## Quick Start with Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Run the SQL
5. Copy your connection details to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Local Development with Docker

```bash
# Start Postgres locally
docker run --name clearsight-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=clearsight \
  -p 5432:5432 \
  -d postgres:15

# Run schema
psql -h localhost -U postgres -d clearsight -f schema.sql
```

## Tables Overview

- **clients** - Companies using ClearSight Ops
- **client_integrations** - Connected systems (Shopify, Stripe, etc.)
- **kpi_definitions** - Custom KPIs per client
- **kpi_snapshots** - Historical KPI data
- **issues** - Detected operational problems
- **reports** - Generated daily/weekly/monthly reports
- **actions** - Recommended actions for clients
- **feedback** - Client feedback on AI performance
- **support_tickets** - Customer support queue
- **sales_leads** - Sales pipeline
