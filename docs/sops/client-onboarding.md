# SOP: Client Onboarding

**Owner**: Sales & Operations Team
**Duration**: 2-5 business days
**Last Updated**: 2025-01-15

## Purpose

Systematically onboard new clients to ClearSight Ops, ensuring proper integration setup, KPI configuration, and successful first report delivery.

## Prerequisites

- Signed contract
- Payment method on file
- Primary contact identified
- Integration access granted

## Procedure

### Phase 1: Kickoff (Day 1)

**1. Send Welcome Email**
```
Subject: Welcome to ClearSight Ops!
Body:
- Thank you for choosing ClearSight Ops
- Link to onboarding form
- Schedule 30-min kickoff call
- Provide integration checklist
```

**2. Schedule Kickoff Call**
- Confirm primary contact
- Review integration requirements
- Set expectations
- Answer questions

**3. Create Client Record**
```sql
INSERT INTO clients (name, contact_name, contact_email)
VALUES ('[Company]', '[Name]', '[Email]');
```

### Phase 2: Integration Setup (Days 1-3)

**1. Collect Integration Credentials**

Use secure form to collect:
- Shopify store URL + API key (if applicable)
- WMS access or CSV upload process
- Email/Slack webhooks
- Payroll system access
- Financial system access

**2. Test Each Integration**

For each system:
```bash
# Test data pull
curl -X POST /api/test-integration \
  -d '{"client_id": "xxx", "type": "shopify"}'

# Verify data format
# Confirm data accuracy
```

**3. Create Integration Records**
```sql
INSERT INTO client_integrations (client_id, type, config)
VALUES ('[client-id]', 'shopify', '{"api_key": "...", "store": "..."}');
```

### Phase 3: KPI Configuration (Day 2)

**1. Discovery Questions**

Ask client:
- What metrics matter most?
- What are your current targets?
- What problems need daily monitoring?
- What alerts do you want?

**2. Create KPI Definitions**

Example for e-commerce:
```sql
INSERT INTO kpi_definitions (client_id, key, label, target, unit) VALUES
('[id]', 'sales', 'Daily Sales', 10000, '$'),
('[id]', 'orders', 'Orders', 300, 'orders'),
('[id]', 'pick_accuracy', 'Pick Accuracy', 99.5, '%'),
('[id]', 'cph', 'Cases Per Hour', 30, 'cases'),
('[id]', 'overtime_hours', 'Overtime', 8, 'hours');
```

**3. Customize Report Template**

Adjust report sections based on:
- Industry
- Team size
- Priority metrics

### Phase 4: Testing (Day 3)

**1. Run Test Report**
```bash
# Generate sample report with real data
curl -X POST /api/generate-daily-report \
  -d '{"clientId": "[id]", "date": "2025-01-15"}'
```

**2. Review with Client**

On call:
- Walk through sample report
- Confirm accuracy
- Adjust KPIs if needed
- Refine action recommendations

**3. Make Adjustments**

Common tweaks:
- Add/remove KPIs
- Change targets
- Adjust alert thresholds
- Customize report format

### Phase 5: Go Live (Day 4-5)

**1. Activate Client**
```sql
UPDATE clients SET active = true WHERE id = '[id]';
```

**2. Enable Automation**

In n8n:
- Confirm client in workflow
- Test email delivery
- Verify Slack integration

**3. Send Go-Live Email**
```
Subject: You're Live on ClearSight Ops!
Body:
- First report arriving tomorrow at 6 AM
- How to read the report
- Support contact info
- Feedback form
```

**4. Schedule Check-in**

Book 15-min call for:
- Day 3 after go-live
- Review first reports
- Gather feedback
- Make final adjustments

## Quality Checklist

Before go-live, confirm:

- [ ] All integrations tested and working
- [ ] At least 5 KPIs configured
- [ ] Test report generated successfully
- [ ] Client reviewed and approved
- [ ] Email/Slack delivery tested
- [ ] Client marked active in database
- [ ] n8n workflow includes client
- [ ] Support team notified

## Common Issues

| Issue | Solution |
|-------|----------|
| Missing API access | Provide step-by-step guide for granting access |
| Data format mismatch | Write custom parser or ask for CSV export |
| Unclear KPIs | Schedule discovery call with ops manager |
| Integration failure | Fall back to manual CSV upload temporarily |

## Post-Onboarding

**Week 1**:
- Monitor first 5 reports
- Respond to feedback within 4 hours
- Make adjustments as needed

**Week 2**:
- Check-in call
- Gather satisfaction score
- Identify upsell opportunities

**Month 1**:
- Full performance review
- Optimize AI prompts
- Propose additional integrations

## Success Metrics

- Time to first report: < 5 days
- Integration success rate: > 95%
- Client satisfaction: > 4.5/5
- Retention after month 1: > 90%

## Related SOPs

- SOP: Daily Report Generation
- SOP: Integration Management
- SOP: Support Ticket Handling
