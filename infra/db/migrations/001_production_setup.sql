-- ClearSight Ops Production Database Setup
-- Run this after initial schema.sql

-- ============================================================================
-- PART 1: Enhance existing tables with auth integration
-- ============================================================================

-- Add user_id to clients table for auth integration
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'enterprise'));

-- Add role to auth.users metadata (handled via Supabase dashboard or trigger)
-- We'll read role from user metadata: user.user_metadata.role

-- ============================================================================
-- PART 2: Create CSV uploads table
-- ============================================================================

CREATE TABLE IF NOT EXISTS csv_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  data_type TEXT CHECK (data_type IN ('sales', 'warehouse', 'staff', 'support', 'finance', 'mixed')),
  row_count INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  error_message TEXT,
  processed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_csv_uploads_client_status ON csv_uploads(client_id, status);
CREATE INDEX idx_csv_uploads_created_at ON csv_uploads(created_at DESC);

-- ============================================================================
-- PART 3: Row Level Security Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLIENTS TABLE POLICIES
-- ============================================================================

-- Clients can view their own client record
CREATE POLICY "Users can view own client"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all clients
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- Admins can insert clients
CREATE POLICY "Admins can insert clients"
  ON clients FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- Admins can update clients
CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- ============================================================================
-- REPORTS TABLE POLICIES
-- ============================================================================

-- Clients can view their own reports
CREATE POLICY "Clients can view own reports"
  ON reports FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- System can insert reports (service role)
CREATE POLICY "Service role can insert reports"
  ON reports FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- ISSUES TABLE POLICIES
-- ============================================================================

-- Clients can view their own issues
CREATE POLICY "Clients can view own issues"
  ON issues FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Admins can view all issues
CREATE POLICY "Admins can view all issues"
  ON issues FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- System can insert issues
CREATE POLICY "Service role can insert issues"
  ON issues FOR INSERT
  WITH CHECK (true);

-- Clients can update their own issue status
CREATE POLICY "Clients can update own issue status"
  ON issues FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- ACTIONS TABLE POLICIES
-- ============================================================================

-- Clients can view their own actions
CREATE POLICY "Clients can view own actions"
  ON actions FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Admins can view all actions
CREATE POLICY "Admins can view all actions"
  ON actions FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- System can insert actions
CREATE POLICY "Service role can insert actions"
  ON actions FOR INSERT
  WITH CHECK (true);

-- Clients can update their own actions
CREATE POLICY "Clients can update own actions"
  ON actions FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- CSV UPLOADS TABLE POLICIES
-- ============================================================================

-- Clients can view their own uploads
CREATE POLICY "Clients can view own uploads"
  ON csv_uploads FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Clients can insert their own uploads
CREATE POLICY "Clients can insert own uploads"
  ON csv_uploads FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Admins can view all uploads
CREATE POLICY "Admins can view all uploads"
  ON csv_uploads FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- ============================================================================
-- KPI DEFINITIONS & SNAPSHOTS POLICIES
-- ============================================================================

-- Clients can view their own KPI definitions
CREATE POLICY "Clients can view own kpi_definitions"
  ON kpi_definitions FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Clients can view their own KPI snapshots
CREATE POLICY "Clients can view own kpi_snapshots"
  ON kpi_snapshots FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- System can insert KPI data
CREATE POLICY "Service role can insert kpi_snapshots"
  ON kpi_snapshots FOR INSERT
  WITH CHECK (true);

-- Admins can manage all KPIs
CREATE POLICY "Admins can manage kpi_definitions"
  ON kpi_definitions FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- ============================================================================
-- CLIENT INTEGRATIONS POLICIES
-- ============================================================================

-- Clients can view their own integrations
CREATE POLICY "Clients can view own integrations"
  ON client_integrations FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Clients can manage their own integrations
CREATE POLICY "Clients can manage own integrations"
  ON client_integrations FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Admins can view all integrations
CREATE POLICY "Admins can view all integrations"
  ON client_integrations FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- ============================================================================
-- SUPPORT TICKETS & FEEDBACK POLICIES (similar pattern)
-- ============================================================================

CREATE POLICY "Clients view own support_tickets" ON support_tickets FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Admins view all support_tickets" ON support_tickets FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin'));

CREATE POLICY "Service role insert support_tickets" ON support_tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clients view own feedback" ON feedback FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Admins view all feedback" ON feedback FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin'));

CREATE POLICY "Clients insert own feedback" ON feedback FOR INSERT
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- ============================================================================
-- SALES LEADS POLICIES (Admin only)
-- ============================================================================

CREATE POLICY "Admins manage sales_leads" ON sales_leads FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- ============================================================================
-- PART 4: Helper Functions
-- ============================================================================

-- Function to get client_id from authenticated user
CREATE OR REPLACE FUNCTION get_client_id_for_user()
RETURNS UUID AS $$
  SELECT id FROM clients WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin'),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- PART 5: Create Storage Bucket for CSV Uploads
-- ============================================================================

-- Run this via Supabase Dashboard or API:
-- Storage bucket: "csv-uploads"
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: text/csv, application/vnd.ms-excel

-- Storage policies will be:
-- - Authenticated users can upload to their client folder
-- - Users can only read their own client's files
-- - Admins can read all files
