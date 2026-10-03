// TODO: replace with ThinkWeb admin API

import { supabase } from '../integrations/supabase/client';
import { logAuditEvent } from './auditService';

export interface AutomationWorkflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_config: any;
  action_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_data?: any;
  output_data?: any;
  error_message?: string;
  executed_at: string;
}

export const createWorkflow = async (workflow: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { data, error } = await supabase
    .from('automation_workflows')
    .insert({
      user_id: user.id,
      name: workflow.name || 'New Workflow',
      description: workflow.description,
      trigger_config: workflow.trigger_config || {},
      action_config: workflow.action_config || {},
      is_active: workflow.is_active ?? true
    })
    .select()
    .single();

  if (error) throw error;

  await logAuditEvent('CREATE', 'workflow', data.id, { name: data.name });
  return data;
};

export const updateWorkflow = async (id: string, updates: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> => {
  const { data, error } = await supabase
    .from('automation_workflows')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAuditEvent('UPDATE', 'workflow', id, updates);
  return data;
};

export const deleteWorkflow = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('automation_workflows')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await logAuditEvent('DELETE', 'workflow', id);
};

export const getWorkflows = async (): Promise<AutomationWorkflow[]> => {
  const { data, error } = await supabase
    .from('automation_workflows')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const executeWorkflow = async (workflowId: string, inputData?: any): Promise<WorkflowExecution> => {
  const { data, error } = await supabase
    .from('workflow_executions')
    .insert({
      workflow_id: workflowId,
      status: 'running',
      input_data: inputData,
      executed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Simulate workflow execution
  setTimeout(async () => {
    await supabase
      .from('workflow_executions')
      .update({
        status: 'completed',
        output_data: { result: 'success' }
      })
      .eq('id', data.id);
  }, 1000);

  await logAuditEvent('EXECUTE', 'workflow', workflowId, { execution_id: data.id });
  
  // Transform the data to match our interface
  return {
    ...data,
    status: data.status as 'pending' | 'running' | 'completed' | 'failed'
  } as WorkflowExecution;
};
