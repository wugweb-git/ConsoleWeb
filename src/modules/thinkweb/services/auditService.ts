// TODO: replace with ThinkWeb admin API

import { supabase } from '../integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const logAuditEvent = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_audit_event', {
      _action: action,
      _resource_type: resourceType,
      _resource_id: resourceId,
      _details: details || {}
    });

    if (error) {
      console.error('Audit logging error:', error);
    }
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  
  // Transform the data to match our interface
  return (data || []).map(log => ({
    ...log,
    ip_address: log.ip_address ? String(log.ip_address) : undefined,
    user_agent: log.user_agent || undefined,
    resource_id: log.resource_id || undefined
  })) as AuditLog[];
};
