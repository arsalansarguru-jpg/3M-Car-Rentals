-- Enterprise Audit Logs Schema Migration Script
-- Project: 3M Car Rentals Next-Generation Web Platform
-- Focus: Centralised administrative logging indexes and trails

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email text NOT NULL,
    user_role text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id uuid NOT NULL,
    old_value jsonb DEFAULT null,
    new_value jsonb DEFAULT null,
    timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address text DEFAULT null,
    session_id text DEFAULT null,
    correlation_id text DEFAULT null
);

-- RLS Configuration
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow administrative roles to view audit logs"
ON public.audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.roles r ON u.role_id = r.id
        WHERE u.auth_user_id = auth.uid() 
          AND r.name IN ('admin', 'super_admin', 'manager', 'staff')
    )
);

-- Performance Tuning: low-latency indices mapping lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id ON public.audit_logs(correlation_id);
