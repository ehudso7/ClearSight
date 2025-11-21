# ClearSight Ops - Production Deployment Guide

## 🚀 Quick Start Checklist

- [ ] Supabase project created
- [ ] Database schema and RLS policies applied
- [ ] Vercel project connected
- [ ] All environment variables configured
- [ ] n8n workflow deployed
- [ ] Email delivery tested
- [ ] First client created
- [ ] Daily report tested end-to-end

---

## 1. Supabase Setup

### Create Project

1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and region (closest to your users)
4. Set database password (save securely!)
5. Wait for project to provision (~2 minutes)

### Run Database Migrations

1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `infra/db/schema.sql`
3. Execute the SQL
4. Copy contents of `infra/db/migrations/001_production_setup.sql`
5. Execute the SQL

### Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Click "New Bucket"
3. Name: `csv-uploads`
4. Public: **NO** (private)
5. File size limit: 50 MB
6. Allowed MIME types: `text/csv, application/vnd.ms-excel`

### Configure RLS Policies (Already in Migration)

✅ RLS is automatically enabled by the migration script

### Get API Keys

1. Go to Settings → API
2. Copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) ⚠️ Keep secret!

---

## 2. OpenAI Setup

1. Go to https://platform.openai.com
2. Create API key
3. Set billing limits ($100/month recommended for MVP)
4. Copy key (`OPENAI_API_KEY`)

**Cost Estimates:**
- $0.25-0.35 per report with GPT-4o
- 10 clients × 30 days = ~$90/month
- 50 clients × 30 days = ~$450/month

---

## 3. Resend Setup (Email)

1. Go to https://resend.com
2. Sign up (free: 100 emails/day, 3,000/month)
3. Add domain or use `onboarding.resend.dev` for testing
4. Create API key
5. Copy key (`RESEND_API_KEY`)

**Domain Setup (Production):**
1. Go to Domains → Add Domain
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain
4. Update `from` address in `lib/email.ts`

---

## 4. Upstash Redis (Rate Limiting)

1. Go to https://upstash.com
2. Create database
3. Choose region closest to your Vercel deployment
4. Copy REST URL and token
5. Add to environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**Optional but Recommended** for production rate limiting

---

## 5. Sentry (Error Monitoring)

1. Go to https://sentry.io
2. Create project (Next.js)
3. Copy DSN
4. Add to environment variables: `NEXT_PUBLIC_SENTRY_DSN`

**Optional but Strongly Recommended** for production

---

## 6. Vercel Deployment

### Connect GitHub Repository

1. Push code to GitHub
2. Go to https://vercel.com
3. Import project from GitHub
4. Framework preset: Next.js (auto-detected)
5. Root directory: `apps/web`
6. Build command: `npm run build`
7. Install command: `npm install`

### Environment Variables

Add all required variables in Vercel dashboard:

```bash
# OpenAI (Required)
OPENAI_API_KEY=sk-...

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Email Delivery (Required)
RESEND_API_KEY=re_...

# Application URL (Required)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# n8n Webhook Secret (Required for automation)
N8N_WEBHOOK_SECRET=your-secure-random-string-here

# Demo Mode (Set to false in production)
CLEARSIGHT_DEMO_MODE=false

# Rate Limiting (Optional but recommended)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Error Monitoring (Optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

**Generate Webhook Secret:**
```bash
openssl rand -base64 32
```

### Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL
4. Verify homepage loads

---

## 7. n8n Workflow Setup

### Option A: n8n Cloud (Recommended)

1. Go to https://n8n.io
2. Sign up for n8n Cloud ($20/month)
3. Create new workflow
4. Follow instructions in `infra/n8n/daily-report-workflow.md`

### Option B: Self-Hosted

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Then follow setup instructions in `infra/n8n/daily-report-workflow.md`

---

## 8. Create First Admin User

### Via Supabase Dashboard

1. Go to Authentication → Users
2. Click "Add User"
3. Email: your-admin@company.com
4. Password: (strong password)
5. Click "Create User"

### Set Admin Role

```sql
-- In Supabase SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-admin@company.com';
```

---

## 9. Create First Client

### Via Admin Panel

1. Log in as admin
2. Go to `/admin`
3. Click "Add Client"
4. Fill in:
   - Company Name
   - Contact Name
   - Contact Email (where reports will be sent)
   - Subscription Tier
5. Click "Create Client"

### Link User to Client

```sql
-- In Supabase SQL Editor
UPDATE clients
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'client@company.com'
)
WHERE id = 'client-uuid-here';
```

---

## 10. Test End-to-End Flow

### Test 1: CSV Upload

1. Log in as client user
2. Go to Dashboard → Upload Data
3. Download sample CSV from `infra/sample-data/mixed-example.csv` (create this if needed)
4. Upload CSV
5. Verify upload shows as "processed"

### Test 2: Generate Report

```bash
curl -X POST https://your-app.vercel.app/api/generate-daily-report \
  -H "Content-Type: application/json" \
  -d '{"clientId": "client-uuid", "date": "2025-01-15"}'
```

Verify:
- Report appears in dashboard
- KPIs, issues, and actions are generated
- No errors in Vercel logs

### Test 3: Email Delivery

```bash
curl -X POST https://your-app.vercel.app/api/send-report-email \
  -H "Content-Type: application/json" \
  -d '{"reportId": "report-uuid", "clientId": "client-uuid"}'
```

Verify:
- Email received at client contact email
- Email looks good (HTML rendering)
- Links work correctly

### Test 4: n8n Webhook

```bash
curl -X POST https://your-app.vercel.app/api/webhooks/n8n/daily-report \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

Verify:
- All active clients processed
- Reports generated
- Emails sent
- No errors

---

## 11. Monitoring & Observability

### Vercel Logs

- Go to Vercel dashboard → Logs
- Monitor for errors
- Set up log drains if needed

### Sentry Dashboard

- Monitor error rate
- Set up alerts for critical errors
- Create issues for recurring errors

### Uptime Monitoring

Use BetterStack or similar:
1. Monitor homepage: `/`
2. Monitor API health: `/api/webhooks/n8n/daily-report` (GET)
3. Alert if down >5 minutes

### Database Monitoring

Supabase dashboard shows:
- Active connections
- Database size
- Query performance
- RLS policy coverage

---

## 12. Post-Launch Checklist

### Week 1

- [ ] Daily check of n8n workflow execution
- [ ] Monitor error logs in Sentry
- [ ] Verify all clients receiving reports
- [ ] Check OpenAI API usage and costs
- [ ] Gather feedback from pilot clients

### Week 2

- [ ] Review report quality and accuracy
- [ ] Optimize slow queries (if any)
- [ ] Add missing KPIs based on feedback
- [ ] Document any manual processes

### Week 3

- [ ] Set up automated backups (Supabase Pro)
- [ ] Create runbook for common issues
- [ ] Train support team on admin panel
- [ ] Scale testing (stress test with 50+ clients)

### Week 4

- [ ] Launch publicly or expand pilot
- [ ] Set up billing/subscription management
- [ ] Create self-service onboarding flow
- [ ] Build integrations (Shopify, etc.)

---

## 13. Scaling Considerations

### 10-50 Clients

**Current Setup Works Fine**
- Free/Hobby tiers sufficient
- ~$100-500/month total cost

### 50-100 Clients

**Upgrade Required:**
- Vercel Pro ($20/month)
- Supabase Pro ($25/month)
- Upstash paid tier ($10/month)
- OpenAI costs: ~$750-1500/month

**Infrastructure cost: ~$55/month + AI costs**

### 100-500 Clients

**Additional Scaling:**
- Consider Redis caching for client configs
- Implement queue system (BullMQ/InngestJS)
- Add read replicas for database
- Set up CDN for assets
- Consider dedicated OpenAI account for volume pricing

---

## 14. Backup & Disaster Recovery

### Database Backups

Supabase Pro includes:
- Daily automatic backups (7 days retention)
- Point-in-time recovery
- Manual backup: Settings → Backups

### Manual Backup Script

```bash
# Export all data
npx supabase db dump > backup-$(date +%Y%m%d).sql

# Upload to S3 or similar
aws s3 cp backup-*.sql s3://your-backup-bucket/
```

### Recovery Process

1. Create new Supabase project
2. Restore from backup
3. Update environment variables
4. Redeploy Vercel
5. Update n8n webhook URL

**Recovery Time Objective (RTO): <1 hour**

---

## 15. Security Checklist

- [x] RLS enabled on all tables
- [x] API routes check authentication
- [x] Webhook endpoints use secret auth
- [x] Service role key never exposed to client
- [x] Rate limiting on public endpoints
- [x] Input validation on all API routes
- [x] HTTPS enforced (Vercel default)
- [x] CORS configured correctly
- [x] Error messages don't leak sensitive data
- [x] Sentry scrubs sensitive headers

---

## 16. Common Issues & Solutions

### "Unauthorized" on API calls
- Check Supabase RLS policies
- Verify user session is valid
- Check client_id matches user_id

### Reports not generating
- Check OpenAI API key
- Verify CSV uploads exist
- Check Vercel function timeout (increase if needed)

### Emails not sending
- Verify Resend API key
- Check domain verification
- Review Resend dashboard logs

### n8n workflow fails
- Check webhook secret matches
- Verify Vercel URL is correct
- Check execution logs in n8n

---

## 17. Support & Resources

**Documentation:**
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- OpenAI: https://platform.openai.com/docs
- Resend: https://resend.com/docs

**Community:**
- GitHub Issues: (your repo)
- Email: support@clearsightops.com

---

## ✅ Launch Complete!

Your ClearSight Ops production environment is now live and ready for real clients.

**Next Steps:**
1. Onboard pilot customers
2. Monitor performance and costs
3. Iterate based on feedback
4. Scale infrastructure as needed

Good luck! 🚀
