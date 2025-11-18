# ClearSight Ops n8n Workflows

This directory contains workflow definitions for automating ClearSight Ops operations using n8n.

## Installation

1. Install n8n: `npm install -g n8n`
2. Start n8n: `n8n start`
3. Access at: `http://localhost:5678`
4. Import workflows from this directory

## Workflows Overview

### 1. Daily Report Generator

**Trigger**: Cron (Every day at 06:00)

**Flow**:
```
[Cron Trigger: 0 6 * * *]
    ↓
[Supabase: Get Active Clients]
    SELECT id, name, contact_email FROM clients WHERE active = true
    ↓
[Split In Batches: 1 client at a time]
    ↓
[HTTP Request: Generate Report]
    POST https://your-app.vercel.app/api/generate-daily-report
    Body: {"clientId": "={{$json.id}}", "date": "={{$now}}"}
    ↓
[Email: Send Report]
    To: ={{$item(0).contact_email}}
    Subject: Daily Ops Report – {{$now}}
    Body: {{$json.markdown}} (rendered as HTML)
    ↓
[Slack: Post Notification]
    Webhook: SLACK_WEBHOOK_URL
    Message: "✅ Daily report sent to {{$item(0).name}}"
    ↓
[Loop back to Split In Batches]
```

### 2. Realtime Issue Monitor

**Trigger**: Cron (Every 15 minutes) OR Webhook

**Flow**:
```
[Cron Trigger: */15 * * * *]
    ↓
[Supabase: Get Active Clients]
    ↓
[Split In Batches]
    ↓
[HTTP Request: Run Issue Detector]
    POST https://your-app.vercel.app/api/run-issue-detector
    Body: {"clientId": "={{$json.id}}", "date": "={{$now}}"}
    ↓
[Filter: Critical Issues Only]
    Condition: {{$json.issues}} contains severity: "high" or "critical"
    ↓
[IF: Has Critical Issues]
    ├─ [Email: Alert]
    │   To: ={{$item(0).contact_email}}
    │   Subject: 🚨 Critical Issue Detected
    │
    ├─ [Slack: Alert]
    │   Webhook: SLACK_WEBHOOK_URL
    │   Message: "@channel Critical issue for {{$item(0).name}}: {{$json.issues[0].title}}"
    │
    └─ [Supabase: Insert Issues]
        Table: issues
        Data: ={{$json.issues}}
```

### 3. Support Autoreply

**Trigger**: Email (IMAP) OR Webhook from Gmail

**Flow**:
```
[Email Trigger: New Email]
    Mailbox: support@yourdomain.com
    ↓
[Extract: Parse Email]
    Extract: subject, from, body
    ↓
[HTTP Request: Generate Auto Reply]
    POST https://your-app.vercel.app/api/support/auto-reply
    Body: {
      "subject": "={{$json.subject}}",
      "body": "={{$json.body}}",
      "history": "",
      "clientConfig": {}
    }
    ↓
[IF: Needs Human Review]
    ├─ [Slack: Notify Team]
    │   Message: "🎫 New support ticket needs review: {{$json.subject}}"
    │
    └─ [Supabase: Create Ticket]
        Table: support_tickets
        Data: {
          "subject": "={{$json.subject}}",
          "classification": "={{$json.classification}}",
          "needs_human_review": true
        }

[ELSE: Auto-respond]
    ├─ [Gmail: Send Reply]
    │   To: ={{$json.from}}
    │   Subject: Re: {{$json.subject}}
    │   Body: {{$json.reply}}
    │
    └─ [Supabase: Log Ticket]
        Table: support_tickets
        Data: {
          "status": "auto_resolved",
          "ai_reply": "={{$json.reply}}"
        }
```

### 4. Sales Outreach Automation

**Trigger**: Manual OR Cron (daily batch)

**Flow**:
```
[Trigger: Manual/Schedule]
    ↓
[Supabase: Get New Leads]
    SELECT * FROM sales_leads WHERE status = 'new' LIMIT 10
    ↓
[Split In Batches: 1 lead at a time]
    ↓
[HTTP Request: Personalize Outreach]
    POST https://your-app.vercel.app/api/sales/personalize-outreach
    Body: {
      "lead": "={{$json}}",
      "template": "default_cold_email"
    }
    ↓
[Gmail/SendGrid: Send Email]
    To: ={{$item(0).contact_email}}
    Subject: ={{$json.subject}}
    Body: ={{$json.body}}
    ↓
[Supabase: Update Lead]
    UPDATE sales_leads
    SET status = 'contacted',
        outreach_count = outreach_count + 1,
        last_outreach_at = NOW()
    WHERE id = ={{$item(0).id}}
    ↓
[Wait: 2 seconds] (Rate limiting)
    ↓
[Loop back]
```

## Setup Instructions

### Environment Variables in n8n

Set these in n8n Settings → Credentials:

```bash
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx

# API
API_BASE_URL=https://your-app.vercel.app

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@email.com
SMTP_PASSWORD=xxx

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

### Creating a Workflow

1. Open n8n UI
2. Click "New Workflow"
3. Add nodes according to the flow diagrams above
4. Configure each node with your credentials
5. Activate the workflow
6. Test with "Execute Workflow"

## Best Practices

- **Error Handling**: Add "Error Trigger" nodes to catch failures
- **Rate Limiting**: Add delays between API calls (2-5 seconds)
- **Logging**: Use "Function" nodes to log important events
- **Testing**: Always test with 1-2 records before full batch
- **Monitoring**: Set up Slack alerts for workflow failures

## Troubleshooting

**Workflow not triggering?**
- Check cron syntax
- Verify workflow is activated
- Check n8n logs: `~/.n8n/logs`

**API errors?**
- Verify API_BASE_URL is correct
- Check OpenAI API key is set
- Review API logs in Vercel

**Email not sending?**
- Verify SMTP credentials
- Check spam folder
- Enable "Less secure apps" for Gmail

## Advanced: Webhook Triggers

For real-time triggers from external systems:

```bash
# In n8n, create webhook node
# Copy webhook URL (e.g., http://localhost:5678/webhook/xxx)

# Trigger from Shopify/Stripe/etc:
curl -X POST http://localhost:5678/webhook/xxx \
  -H "Content-Type: application/json" \
  -d '{"event": "order.created", "data": {...}}'
```
