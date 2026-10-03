// TODO: replace with ThinkWeb admin API

import { supabase } from '../integrations/supabase/client';
import { DocumentTemplate } from '../components/templates/types/TemplateTypes';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: any;
  template_id?: string;
  type: 'doc' | 'blank' | 'project' | 'prd';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShareDocument {
  document_id: string;
  shared_with_email: string;
  permission: 'view' | 'edit';
}

export const createDocument = async (document: Partial<Document>): Promise<Document> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title: document.title || 'Untitled Document',
      content: document.content || {},
      template_id: document.template_id,
      type: document.type || 'doc',
      is_public: document.is_public || false
    })
    .select()
    .single();

  if (error) throw error;
  return data as Document;
};

export const updateDocument = async (id: string, updates: Partial<Document>): Promise<Document> => {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Document;
};

export const deleteDocument = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getDocument = async (id: string): Promise<Document | null> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Document | null;
};

export const getDocuments = async (): Promise<Document[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Document[];
};

export const getUserDocuments = async (): Promise<Document[]> => {
  return getDocuments();
};

export const shareDocument = async (share: ShareDocument): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { error } = await supabase
    .from('shared_documents')
    .insert({
      document_id: share.document_id,
      shared_with_email: share.shared_with_email,
      permission: share.permission,
      shared_by: user.id
    });

  if (error) throw error;
};

export const getSharedDocuments = async (): Promise<Document[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('shared_documents')
    .select(`
      documents (*)
    `)
    .eq('shared_with_email', user.email);

  if (error) throw error;
  return (data?.map(item => item.documents).filter(Boolean) || []) as Document[];
};

export const duplicateDocument = async (id: string): Promise<Document> => {
  const original = await getDocument(id);
  if (!original) throw new Error('Document not found');

  return createDocument({
    title: `${original.title} (Copy)`,
    content: original.content,
    template_id: original.template_id,
    type: original.type,
    is_public: false
  });
};
