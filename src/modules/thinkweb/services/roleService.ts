// TODO: replace with ThinkWeb admin API

import { supabase } from '../integrations/supabase/client';
import { logAuditEvent } from './auditService';

export type AppRole = 'admin' | 'editor' | 'viewer' | 'owner';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  workspace_id?: string;
  granted_by?: string;
  created_at: string;
}

export const assignRole = async (
  userId: string,
  role: AppRole,
  workspaceId?: string
): Promise<UserRole> => {
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role,
      workspace_id: workspaceId,
      granted_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;

  await logAuditEvent('ASSIGN_ROLE', 'user_role', data.id, { 
    user_id: userId, 
    role, 
    workspace_id: workspaceId 
  });

  return data;
};

export const checkUserRole = async (
  userId: string,
  role: AppRole,
  workspaceId?: string
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: role,
    _workspace_id: workspaceId
  });

  if (error) throw error;
  return data || false;
};

export const getUserRoles = async (userId?: string): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id);

  if (error) throw error;
  return data || [];
};
