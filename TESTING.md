# Testing Guide for ClearSight Ops

## Test Structure (Future Implementation)

This document outlines the testing strategy for production-ready ClearSight Ops.

## Unit Tests

### Setup

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Example Tests

**`lib/__tests__/csvParser.test.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { parseOperationalCSV } from '../csvParser';

describe('CSV Parser', () => {
  it('should parse sales data correctly', async () => {
    const mockFile = new File(['sales,orders,returns\n1000,50,2'], 'test.csv', { type: 'text/csv' });
    const result = await parseOperationalCSV(mockFile, 'sales');
    
    expect(result.success).toBe(true);
    expect(result.data?.sales.salesToday).toBe(1000);
    expect(result.data?.sales.orders).toBe(50);
  });

  it('should reject invalid CSV', async () => {
    const mockFile = new File([''], 'empty.csv', { type: 'text/csv' });
    const result = await parseOperationalCSV(mockFile, 'sales');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
```

**`lib/__tests__/validation.test.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { validateRequest, generateReportSchema } from '../validation';

describe('Validation', () => {
  it('should validate correct report request', async () => {
    const result = await validateRequest(generateReportSchema, {
      clientId: '123e4567-e89b-12d3-a456-426614174000',
      date: '2025-01-15'
    });
    
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', async () => {
    const result = await validateRequest(generateReportSchema, {
      clientId: 'invalid-uuid',
      date: '2025-01-15'
    });
    
    expect(result.success).toBe(false);
  });
});
```

## Integration Tests

### API Route Tests

**`app/api/__tests__/generate-daily-report.test.ts`**
```typescript
import { describe, it, expect, beforeAll } from 'vitest';

describe('POST /api/generate-daily-report', () => {
  let clientId: string;

  beforeAll(async () => {
    // Set up test client in database
    // Upload test CSV data
  });

  it('should generate report successfully', async () => {
    const response = await fetch('/api/generate-daily-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        date: '2025-01-15'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.markdown).toBeTruthy();
  });

  it('should reject missing parameters', async () => {
    const response = await fetch('/api/generate-daily-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    expect(response.status).toBe(400);
  });
});
```

## E2E Tests

### Playwright Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Critical Flow Test

**`tests/e2e/daily-report-flow.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Daily Report Generation Flow', () => {
  test('complete flow: login → upload CSV → generate report → view report', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'testpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // 2. Upload CSV
    await page.goto('/dashboard/uploads');
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('./infra/sample-data/mixed-example.csv');
    await page.selectOption('select[name="dataType"]', 'mixed');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=processed')).toBeVisible();

    // 3. Generate Report (via API)
    // In real test, would trigger report generation
    
    // 4. View Report
    await page.goto('/dashboard');
    await page.click('text=Daily Ops Report');
    await expect(page.locator('h1')).toContainText('Daily Ops Report');
    await expect(page.locator('text=Key Metrics')).toBeVisible();
  });
});
```

## Manual Testing Checklist

### Pre-Launch Testing

#### Authentication
- [ ] Signup with valid email
- [ ] Login with correct credentials
- [ ] Login fails with wrong password
- [ ] Logout works correctly
- [ ] Protected routes redirect to login
- [ ] Session persists across page refresh

#### CSV Upload
- [ ] Upload valid CSV file
- [ ] Reject non-CSV file
- [ ] Reject file >50MB
- [ ] Parse sales data correctly
- [ ] Parse warehouse data correctly
- [ ] Parse mixed data correctly
- [ ] Show upload history
- [ ] Handle upload errors gracefully

#### Report Generation
- [ ] Generate report with CSV data
- [ ] Generate report with demo data
- [ ] Report shows all KPIs
- [ ] Issues are detected correctly
- [ ] Actions are generated
- [ ] Report saves to database
- [ ] Report appears in dashboard

#### Email Delivery
- [ ] Email sends successfully
- [ ] HTML renders correctly
- [ ] Links work in email
- [ ] Plain text fallback works
- [ ] Report marked as sent

#### Dashboard
- [ ] Dashboard shows stats
- [ ] Reports list displays correctly
- [ ] Report detail page works
- [ ] Issues page shows active issues
- [ ] Actions page shows pending actions
- [ ] Pagination works (if >20 items)

#### Admin Panel
- [ ] Only admins can access /admin
- [ ] View all clients
- [ ] Create new client
- [ ] View system stats
- [ ] Non-admins redirected

#### n8n Webhook
- [ ] Webhook requires authentication
- [ ] Processes all active clients
- [ ] Sends emails to all clients
- [ ] Returns correct status
- [ ] Handles errors gracefully

### Performance Testing

#### Load Test Report Generation
```bash
# Using Apache Bench
ab -n 10 -c 2 -p report-payload.json -T application/json \
  https://your-app.vercel.app/api/generate-daily-report
```

Expected:
- 95th percentile <60 seconds
- No timeouts
- All requests succeed

#### Database Query Performance
```sql
-- Check slow queries in Supabase
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

Target:
- All queries <100ms
- No N+1 query patterns
- Indexes used correctly

### Security Testing

#### Authentication
- [ ] Cannot access API without auth
- [ ] Cannot access other clients' data
- [ ] RLS policies enforced
- [ ] Service role key not exposed

#### Rate Limiting
- [ ] Rate limits enforced on public endpoints
- [ ] Authenticated users get higher limits
- [ ] Rate limit headers returned
- [ ] Graceful error messages

#### Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Invalid UUIDs rejected
- [ ] Malformed JSON rejected

## CI/CD Pipeline (GitHub Actions)

**`.github/workflows/test.yml`**
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run test
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - run: npm run build
```

## Monitoring in Production

### Key Metrics

1. **Report Generation Success Rate**
   - Target: >99%
   - Alert if <95%

2. **API Response Times**
   - /api/generate-daily-report: <60s
   - Other endpoints: <500ms
   - Alert if p95 exceeds targets

3. **Email Delivery Rate**
   - Target: >98%
   - Monitor Resend dashboard

4. **Error Rate**
   - Target: <1%
   - Monitor Sentry dashboard

5. **OpenAI API Costs**
   - Track daily spend
   - Alert if >$50/day unexpected

### Health Checks

```bash
# API Health
curl https://your-app.vercel.app/api/webhooks/n8n/daily-report

# Expected: 200 OK with timestamp

# Database Health (via Supabase dashboard)
# Check: Active connections, CPU usage, disk space
```

## Bug Reporting Template

When reporting bugs, include:

```markdown
## Bug Description
[Clear description of the issue]

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser/Client: 
- User Role: 
- Client ID: 
- Timestamp: 

## Logs/Screenshots
[Attach relevant logs or screenshots]

## Severity
- [ ] Critical (system down)
- [ ] High (blocking feature)
- [ ] Medium (degraded experience)
- [ ] Low (minor issue)
```

---

## Testing Status

### Current Coverage

- ✅ Manual testing checklist complete
- ⚠️ Unit tests: Not implemented (add in future sprint)
- ⚠️ Integration tests: Not implemented (add in future sprint)
- ⚠️ E2E tests: Not implemented (add in future sprint)

### Next Steps

1. Set up Vitest and write unit tests for critical functions
2. Add integration tests for API routes
3. Implement Playwright E2E tests
4. Set up CI/CD with GitHub Actions
5. Add test coverage reporting

**Estimated effort**: 1-2 weeks for comprehensive test suite

---

**Production Launch Recommendation**: 

✅ Current manual testing is sufficient for MVP launch with 5-10 pilot clients.

⚠️ Automated test suite should be implemented before scaling to 50+ clients.
