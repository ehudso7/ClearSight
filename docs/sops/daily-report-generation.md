# SOP: Daily Operations Report Generation

**Owner**: ClearSight Ops AI System
**Frequency**: Daily at 6:00 AM
**Duration**: ~15-30 minutes for all clients

## Purpose

Automatically generate comprehensive daily operations reports for all active clients, providing insights into KPIs, issues, and recommended actions.

## Prerequisites

- All client integrations active and configured
- n8n workflow running
- API endpoints operational
- Database accessible

## Procedure

### 1. Data Collection (Automated)

At 06:00 daily, the system:

1. Queries database for all active clients
2. For each client:
   - Pulls data from connected systems (Shopify, WMS, etc.)
   - Retrieves yesterday's KPI baseline
   - Collects staff scheduling data
   - Fetches support ticket summaries

### 2. Analysis (AI Worker Agents)

The system runs parallel analysis:

**Worker B - KPI Analyzer**
- Calculates current vs. target metrics
- Identifies trends (up/down/flat)
- Compares to previous periods

**Worker C - Issue Detector**
- Scans for operational anomalies
- Classifies severity (low/medium/high/critical)
- Identifies root causes

**Worker D - Strategist**
- Generates 3-7 action recommendations
- Scores impact (1-10)
- Calculates confidence level (0-100%)

### 3. Report Generation (Worker E)

Creates structured markdown report containing:
- Executive summary
- KPI dashboard
- Issues with severity tags
- Prioritized action items
- Tomorrow's forecast

### 4. Quality Check (Guardrail Agent)

Validates:
- Data accuracy
- No hallucinations
- Calculations correct
- Proper formatting
- Safe to send

### 5. Delivery

If validation passes:
1. Save report to database
2. Send email to client contact
3. Post summary to Slack channel
4. Log completion

If validation fails:
1. Flag for human review
2. Send alert to operations team
3. Retry with corrected data

## Success Criteria

- ✅ Report generated within 30 minutes
- ✅ All KPIs populated
- ✅ Issues accurately identified
- ✅ Actions are actionable
- ✅ Email delivered successfully

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Integration timeout | Retry with exponential backoff |
| Missing data | Use previous day + flag as estimate |
| AI error | Fall back to template with raw data |
| Email bounce | Log error, notify admin |
| Database unavailable | Queue report for later delivery |

## Escalation

Critical failures escalate to:
1. Slack alert to @ops-team
2. Email to operations manager
3. PagerDuty (if configured)

## Maintenance

**Weekly**:
- Review failed reports
- Update AI prompts based on feedback
- Check integration health

**Monthly**:
- Audit report accuracy
- Gather client feedback
- Optimize performance

## Related SOPs

- SOP: Client Onboarding
- SOP: Issue Escalation
- SOP: Integration Management
