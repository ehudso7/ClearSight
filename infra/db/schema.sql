-- ClearSight Ops Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients (companies using ClearSight Ops)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Integrations (which systems are connected)
CREATE TABLE client_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'shopify', 'stripe', 'wms', 'gmail', 'slack', etc
  config JSONB NOT NULL, -- tokens, store ids, etc (encrypted at app level)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI Definitions (what each client cares about)
CREATE TABLE kpi_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  key TEXT NOT NULL,           -- 'sales', 'orders', 'cph', 'overtime_hours'
  label TEXT NOT NULL,
  target NUMERIC,              -- goal (optional)
  unit TEXT,                   -- '$', 'orders', 'hours', '%', etc
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI Snapshots (time series data)
CREATE TABLE kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  kpi_key TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  snapshot_at TIMESTAMPTZ NOT NULL,
  meta JSONB,                  -- any extra tags
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues detected by agents
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (daily/weekly/monthly)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('daily','weekly','monthly')),
  report_date DATE NOT NULL,
  subject TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  kpi_summary JSONB,
  issues_summary JSONB,
  actions JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions / Tasks for clients
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 100),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Feedback from clients on reports / agents
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  source TEXT NOT NULL,        -- 'report','alert','ticket_reply', etc
  source_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets (for AI support agent)
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  classification TEXT,         -- 'faq', 'technical', 'billing', 'escalation'
  urgency TEXT CHECK (urgency IN ('low','medium','high','critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','pending_client','resolved','closed')),
  ai_reply TEXT,
  needs_human_review BOOLEAN DEFAULT FALSE,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Sales Leads (for AI sales agent)
CREATE TABLE sales_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  industry TEXT,
  employee_count TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','demo_scheduled','proposal_sent','won','lost')),
  outreach_count INTEGER DEFAULT 0,
  last_outreach_at TIMESTAMPTZ,
  notes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_kpi_snapshots_client_date ON kpi_snapshots(client_id, snapshot_at DESC);
CREATE INDEX idx_issues_client_status ON issues(client_id, status);
CREATE INDEX idx_reports_client_date ON reports(client_id, report_date DESC);
CREATE INDEX idx_actions_client_status ON actions(client_id, status);
CREATE INDEX idx_support_tickets_client_status ON support_tickets(client_id, status);
CREATE INDEX idx_sales_leads_status ON sales_leads(status);

-- Insert demo client
INSERT INTO clients (id, name, contact_name, contact_email, active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Company Inc.',
  'Demo User',
  'demo@example.com',
  true
);
