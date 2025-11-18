# SOP: AI Sales SDR Agent

**Owner**: Sales Team
**Frequency**: Daily batches + on-demand
**Last Updated**: 2025-01-15

## Purpose

Automate personalized sales outreach using AI to engage qualified leads, book discovery calls, and move prospects through the pipeline.

## Scope

- Lead research and enrichment
- Personalized email generation
- Follow-up sequences
- Meeting booking
- CRM updates

## Workflow

### Phase 1: Lead Sourcing

**Manual (Initial)**:
1. Export leads from Apollo, LinkedIn Sales Navigator, or CSV
2. Upload to Google Sheet or Supabase `sales_leads` table

**Required fields**:
- Company name
- Contact name
- Email
- Industry
- Employee count (optional)
- Current tools/pain points (if known)

### Phase 2: Lead Enrichment

**AI enriches each lead**:
```json
{
  "company": "Acme Logistics",
  "contact": "Jane Smith",
  "role": "Operations Manager",
  "industry": "Logistics",
  "employee_count": "50-200",
  "pain_points": ["manual reporting", "overtime tracking"],
  "current_tools": ["Shopify", "QuickBooks"]
}
```

**AI generates**:
- Personalized angle
- Relevant use case
- Value proposition

### Phase 3: Email Personalization

**Input**:
```javascript
{
  lead: {
    company: "Acme Logistics",
    contact: "Jane Smith",
    industry: "Logistics"
  },
  template: "cold_email_v1"
}
```

**AI generates**:
```
Subject: Automate Daily Ops for Acme Logistics

Hi Jane,

I noticed Acme Logistics is growing fast in the Chicago area. As your team scales, manual reporting and overtime tracking likely eat up 10-15 hours of management time each week.

ClearSight Ops automates that work. Our AI monitors your operations 24/7 and sends you a daily report with:
• KPIs (orders, accuracy, overtime)
• Issue detection (stuck shipments, staffing risks)
• Recommended fixes

Most logistics teams save 20+ hours/week and catch problems before they cost money.

Would a 15-minute demo make sense for Acme?

Best,
[Your Name]
```

### Phase 4: Outreach Execution

**Daily batch process** (n8n workflow):

1. Query leads where `status = 'new'` LIMIT 20
2. For each lead:
   - Call `/api/sales/personalize-outreach`
   - Generate email
   - Send via Gmail/SendGrid
   - Update lead status to `contacted`
   - Wait 2 seconds (rate limit)

**Timing**:
- Run daily at 9 AM EST
- Send max 20 emails/day initially
- Scale to 50-100 as confidence increases

### Phase 5: Follow-Up Sequence

**Sequence timeline**:

**Day 0**: Initial outreach
**Day 3**: Follow-up #1 (if no reply)
**Day 7**: Follow-up #2 (if no reply)
**Day 14**: Follow-up #3 (if no reply)
**Day 21**: Mark as "not interested" and pause

**Follow-up templates**:

**Day 3**:
```
Subject: Quick follow-up

Hi Jane,

Just wanted to make sure you saw my note about automating Acme's daily ops reporting.

Would a 10-minute call this week work?

Best,
[Name]
```

**Day 7**:
```
Subject: Example report for Acme Logistics

Hi Jane,

I put together a sample daily ops report based on what a logistics team like yours typically tracks.

[Attach PDF or screenshot]

Does this look useful? Happy to customize for Acme.

Best,
[Name]
```

**Day 14** (breakup email):
```
Subject: Closing the loop

Hi Jane,

I don't want to keep bothering you, so this will be my last note.

If daily ops automation becomes a priority for Acme down the line, feel free to reach out.

Best of luck!

[Name]
```

### Phase 6: Reply Handling

**When lead replies**:

1. n8n detects reply (Gmail trigger)
2. Classifies intent:
   - `interested` → Update status to `qualified`, notify sales rep
   - `not_interested` → Update status to `lost`
   - `ask_question` → Generate AI response or escalate

**Interested reply flow**:
```
[Gmail: Reply detected]
    ↓
[AI: Classify intent = "interested"]
    ↓
[Supabase: UPDATE status = 'qualified']
    ↓
[Slack: Notify sales rep]
    "@john New qualified lead: Jane Smith @ Acme Logistics"
    ↓
[Calendly: Send meeting link]
```

### Phase 7: Meeting Booking

**Auto-send Calendly link**:
```
Hi Jane,

Great! Here's a link to book 15 minutes on my calendar:

[Calendly link]

Looking forward to showing you what ClearSight Ops can do for Acme.

Best,
[Name]
```

**Update CRM**:
```sql
UPDATE sales_leads
SET status = 'demo_scheduled',
    notes = jsonb_set(notes, '{meeting_link}', '"[calendly_url]"')
WHERE email = 'jane@acmelogistics.com';
```

### Phase 8: Post-Demo Follow-Up

**After demo**:
1. AI generates personalized follow-up
2. Includes:
   - Recap of their needs
   - Proposed plan & pricing
   - Next steps

**Example**:
```
Subject: ClearSight Ops for Acme Logistics

Hi Jane,

Great talking with you today! Based on our conversation, here's what ClearSight Ops would do for Acme:

✅ Automate daily KPI reporting (saves 15 hrs/week)
✅ Monitor overtime & staffing issues
✅ Track pick/pack accuracy
✅ Integrate with your Shopify + WMS

Proposed Plan: Pro ($3,500/month)
Start Date: Feb 1, 2025

Ready to move forward? I'll send over the agreement.

Best,
[Name]
```

## AI Training & Improvement

**Weekly review**:
- Analyze open rates (target: >40%)
- Analyze reply rates (target: >5%)
- Review AI-generated emails
- Update prompts based on what works

**Monthly**:
- A/B test subject lines
- Try new angles/hooks
- Refine industry-specific messaging

## Metrics

| Metric | Target |
|--------|--------|
| Emails sent per day | 20-50 |
| Open rate | >40% |
| Reply rate | >5% |
| Qualified rate | >2% |
| Demo booking rate | >50% of qualified |

## Best Practices

**Do**:
- Personalize every email (company name, industry, pain point)
- Keep emails short (<150 words)
- Clear call to action
- Send from a real person's email

**Don't**:
- Send generic templates
- Use spam trigger words ("free", "guarantee")
- Send >50 emails/day from one email address
- Skip follow-ups

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Low open rate | Test new subject lines, check spam score |
| Low reply rate | Add more personalization, test different CTAs |
| Emails in spam | Warm up sending domain, reduce volume |
| AI too generic | Provide more lead context, refine prompts |

## Related SOPs

- SOP: Lead Qualification
- SOP: Demo Call Script
- SOP: Proposal & Closing
