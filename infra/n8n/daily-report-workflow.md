# n8n Daily Report Workflow Setup

## Overview
This workflow triggers daily report generation for all active clients at 6:00 AM every day.

## Workflow Structure

```
Cron Trigger (6:00 AM daily)
  ↓
HTTP Request (POST to webhook)
  ↓
[Success] → Log completion
[Failure] → Send alert to Slack/Email
```

## Step-by-Step Setup

### 1. Create New Workflow

1. Log into n8n
2. Click "Add Workflow"
3. Name: "ClearSight Ops - Daily Report Generation"

### 2. Add Cron Trigger Node

- **Node Type**: Schedule Trigger
- **Trigger Times**: `0 6 * * *` (6:00 AM daily)
- **Timezone**: Your business timezone (e.g., America/New_York)

### 3. Add HTTP Request Node

- **Node Name**: "Generate Daily Reports"
- **Method**: POST
- **URL**: `https://your-app.vercel.app/api/webhooks/n8n/daily-report`
- **Authentication**: Generic Credential Type
  - **Header Auth**: Yes
  - **Name**: `authorization`
  - **Value**: `Bearer YOUR_WEBHOOK_SECRET`
- **Options**:
  - **Timeout**: 300000 (5 minutes)
  - **Retry On Fail**: Yes
  - **Max Retries**: 2

### 4. Add Success Handler (Optional)

- **Node Type**: Slack / Email / Webhook
- **Condition**: Only if HTTP request succeeds
- **Message**: 
  ```
  ✅ Daily reports generated successfully
  Processed: {{$json["processed"]}} clients
  Successful: {{$json["successful"]}}
  Failed: {{$json["failed"]}}
  ```

### 5. Add Error Handler (Required)

- **Node Type**: Slack / Email (for critical alerts)
- **Condition**: Only if HTTP request fails
- **Message**:
  ```
  🚨 ALERT: Daily report generation failed
  Error: {{$json["error"]}}
  Time: {{$now}}
  
  Please investigate immediately.
  ```

## Configuration

### Environment Variables Required

In your Next.js app (Vercel):

```bash
N8N_WEBHOOK_SECRET=your-secure-random-string-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### Test the Workflow

1. **Manual Test**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/webhooks/n8n/daily-report \
     -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
     -H "Content-Type: application/json"
   ```

2. **Expected Response**:
   ```json
   {
     "ok": true,
     "processed": 10,
     "successful": 10,
     "failed": 0,
     "results": {
       "success": ["client-id-1", "client-id-2", ...],
       "failed": []
     }
   }
   ```

3. **Test in n8n**:
   - Click "Execute Workflow" in n8n
   - Check logs for successful execution
   - Verify reports were generated in dashboard

## Monitoring

### Success Indicators
- ✅ HTTP 200 response
- ✅ All clients processed
- ✅ Emails sent to all client contact emails
- ✅ Reports visible in dashboard

### Failure Indicators
- ❌ HTTP 500/401/403 response
- ❌ Some clients failed to process
- ❌ Timeout errors
- ❌ Authentication errors

### Common Issues

1. **401 Unauthorized**
   - Check N8N_WEBHOOK_SECRET matches in both n8n and Vercel
   - Verify authorization header format: `Bearer SECRET`

2. **Timeout Errors**
   - Increase timeout in n8n HTTP node
   - Increase maxDuration in webhook route
   - Check OpenAI API response times

3. **No Clients Processed**
   - Verify clients have `active = true` in database
   - Check client_id foreign key relationships

4. **Email Not Sent**
   - Verify RESEND_API_KEY is configured
   - Check client.contact_email is set
   - Review email logs in Resend dashboard

## Advanced Options

### Retry Failed Clients

Add a follow-up workflow that runs 1 hour later:

```
Cron Trigger (7:00 AM)
  ↓
Query failed reports from previous hour
  ↓
Retry generation for those clients
  ↓
Alert if still failing
```

### Custom Schedules Per Client

Store custom schedule in `clients` table:

```sql
ALTER TABLE clients ADD COLUMN report_schedule TEXT DEFAULT '0 6 * * *';
```

Then create separate workflows for different schedules.

### Slack Integration

Add Slack webhook to send daily summary:

```
Daily Report Complete
━━━━━━━━━━━━━━━━━━━━
📊 Processed: 50 clients
✅ Success: 48
❌ Failed: 2
⏱️ Duration: 2m 34s
```

## Deployment Checklist

- [ ] n8n workflow created and tested
- [ ] Webhook secret configured in both n8n and Vercel
- [ ] Cron schedule set correctly for your timezone
- [ ] Error alerts configured (Slack/email)
- [ ] Test run successful
- [ ] Monitor for 3-5 days to ensure stability

## Support

If you encounter issues:
1. Check n8n execution logs
2. Check Vercel function logs
3. Check OpenAI API status
4. Contact support@clearsightops.com
