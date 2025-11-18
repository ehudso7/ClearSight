# ClearSight Ops - Production Deployment Guide

This guide will help you deploy ClearSight Ops to production on Vercel with Supabase.

## Prerequisites

1. **Vercel Account** - https://vercel.com/signup
2. **Supabase Account** - https://supabase.com
3. **OpenAI API Key** - https://platform.openai.com/api-keys
4. **GitHub Repository** - Your code pushed to GitHub

---

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: clearsight-ops-prod
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
4. Wait for project to be created (2-3 minutes)

### 1.2 Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `infra/db/schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press `Ctrl/Cmd + Enter`
6. Verify success (should see "Success. No rows returned")

### 1.3 Get Database Credentials

1. Go to **Project Settings** > **API**
2. Copy these values:
   - **URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

---

## Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "ClearSight Ops Production"
4. Copy the key (starts with `sk-...`)
5. **⚠️ Save it securely - you won't see it again!**

---

## Step 3: Deploy to Vercel

### 3.1 Import Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `.next`

### 3.2 Add Environment Variables

In the "Environment Variables" section, add:

```bash
# REQUIRED
OPENAI_API_KEY=sk-...your-key-here...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deployment Mode
CLEARSIGHT_DEMO_MODE=false
NODE_ENV=production
```

### 3.3 Deploy

1. Click "Deploy"
2. Wait 2-5 minutes for build to complete
3. Your app will be live at `https://your-project.vercel.app`

---

## Step 4: Verify Deployment

### 4.1 Test Homepage

1. Visit `https://your-project.vercel.app`
2. You should see the ClearSight Ops marketing page

### 4.2 Test Demo

1. Go to `https://your-project.vercel.app/demo`
2. Click "Generate Demo Report"
3. You should see an AI-generated operations report
4. Check Supabase dashboard - you should see data in the `reports` table

---

## Step 5: Add Your First Real Client

### 5.1 Create Client in Database

1. In Supabase, go to **Table Editor**
2. Open the `clients` table
3. Click "Insert" > "Insert row"
4. Fill in:
   ```
   name: Your Company Name
   contact_name: John Doe
   contact_email: john@company.com
   active: true
   ```
5. Copy the generated `id` (UUID)

### 5.2 Test API with Client ID

```bash
curl -X POST https://your-project.vercel.app/api/generate-daily-report \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your-client-uuid-here",
    "date": "2025-01-18"
  }'
```

You should receive a JSON response with a generated report!

---

## Step 6: Optional - Configure Automation

### 6.1 Set Up n8n (Daily Reports)

1. Install n8n: `npm install -g n8n`
2. Start n8n: `n8n start`
3. Import workflow from `infra/n8n/example-daily-report.json`
4. Configure:
   - **API URL**: `https://your-project.vercel.app`
   - **Supabase credentials**
5. Activate workflow

### 6.2 Alternative: Vercel Cron Jobs

Create `apps/web/app/api/cron/daily-reports/route.ts`:

```typescript
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Trigger daily reports for all active clients
  // Implementation here...

  return new Response('OK');
}
```

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/daily-reports",
    "schedule": "0 6 * * *"
  }]
}
```

---

## Step 7: Monitoring & Maintenance

### 7.1 Monitor Logs

- **Vercel**: Dashboard > Your Project > Logs
- **Supabase**: Dashboard > Logs

### 7.2 Set Up Alerts

1. Vercel > Project Settings > Notifications
2. Enable email alerts for:
   - Deployment failures
   - High error rates
   - Quota warnings

### 7.3 Monitor Costs

- **OpenAI**: https://platform.openai.com/usage
- **Supabase**: Dashboard > Usage
- **Vercel**: Dashboard > Usage

---

## Troubleshooting

### Build Fails

**Error**: `Missing required environment variables`

**Solution**: Add all required env vars in Vercel dashboard

### API Returns 500 Error

**Error**: `Failed to save report: relation "reports" does not exist`

**Solution**: Run the database schema SQL in Supabase

### Demo Mode Still Active

**Error**: Reports not saving to database

**Solution**: Set `CLEARSIGHT_DEMO_MODE=false` in Vercel env vars and redeploy

### Rate Limit Errors

**Error**: `429 Too Many Requests`

**Solution**: This is normal - the app limits to 60 requests/minute per IP

---

## Security Best Practices

1. **Never commit** `.env` files to Git
2. **Rotate** API keys every 90 days
3. **Use** Vercel's environment variable secrets
4. **Enable** Supabase Row Level Security (RLS) policies
5. **Monitor** unusual API usage patterns
6. **Set up** API key authentication for production clients

---

## Next Steps

1. **Custom Domain**: Add in Vercel > Project > Domains
2. **Analytics**: Add Vercel Analytics or Google Analytics
3. **Error Tracking**: Integrate Sentry or similar
4. **Client Integrations**: Implement real data fetchers in `apps/web/lib/dataFetchers.ts`
5. **Email Notifications**: Configure Resend or SendGrid
6. **Slack Alerts**: Add webhook URL for critical issues

---

## Support

- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Email**: support@clearsightops.com

---

## Estimated Costs

**Monthly costs for 10 clients with daily reports:**

- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **OpenAI API**: ~$50-200/month (depends on usage)
- **Total**: ~$95-245/month

**Revenue potential**: 10 clients × $1,500/month = $15,000/month

**Gross margin**: 98-99%

---

**Deployment complete! 🎉**

Your ClearSight Ops platform is now live and ready to serve clients.
