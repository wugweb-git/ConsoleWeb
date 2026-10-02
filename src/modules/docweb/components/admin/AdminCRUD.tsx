import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Database, Loader2, RefreshCw } from 'lucide-react';
import { useQuery } from '../../lib/useQuery';
import {
  fetchDocuments, fetchCredentials, fetchUsers, fetchOrganizations,
  fetchApiKeys,
} from '../../lib/queries';
import {
  mockDocuments,
  mockCertificates,
  mockUsers,
  mockOrganizations,
  mockApiKeys,
  mockOrganizationMembers
} from '../../data/mockData';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

type TableType = 'documents' | 'certificates' | 'users' | 'organizations' | 'api_keys' | 'members';

export function AdminCRUD() {
  const [selectedTable, setSelectedTable] = useState<TableType>('documents');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Use query layer — falls back to mockData when DB not connected
  const { data: documents, loading: loadingDocs, error: errorDocs, refetch: refetchDocs } = useQuery(fetchDocuments);
  const { data: credentials, loading: loadingCreds, error: errorCreds, refetch: refetchCreds } = useQuery(fetchCredentials);
  const { data: users, loading: loadingUsers, error: errorUsers, refetch: refetchUsers } = useQuery(fetchUsers);
  const { data: orgs, loading: loadingOrgs, error: errorOrgs, refetch: refetchOrgs } = useQuery(fetchOrganizations);
  const { data: apiKeys, loading: loadingKeys, error: errorKeys, refetch: refetchKeys } = useQuery(fetchApiKeys);

  const dataSets: Record<TableType, { data: any[]; loading: boolean; error: string | null; refetch: () => void }> = {
    documents: { data: (documents as any[]) || mockDocuments, loading: loadingDocs, error: errorDocs, refetch: refetchDocs },
    certificates: { data: (credentials as any[]) || mockCertificates, loading: loadingCreds, error: errorCreds, refetch: refetchCreds },
    users: { data: (users as any[]) || mockUsers, loading: loadingUsers, error: errorUsers, refetch: refetchUsers },
    organizations: { data: (orgs as any[]) || mockOrganizations, loading: loadingOrgs, error: errorOrgs, refetch: refetchOrgs },
    api_keys: { data: (apiKeys as any[]) || mockApiKeys, loading: loadingKeys, error: errorKeys, refetch: refetchKeys },
    members: { data: mockOrganizationMembers, loading: false, error: null, refetch: () => {} },
  };

  const tables = [
    { id: 'documents' as const, label: 'Documents', count: dataSets.documents.data.length },
    { id: 'certificates' as const, label: 'Credentials', count: dataSets.certificates.data.length },
    { id: 'users' as const, label: 'Users', count: dataSets.users.data.length },
    { id: 'organizations' as const, label: 'Organizations', count: dataSets.organizations.data.length },
    { id: 'api_keys' as const, label: 'API Keys', count: dataSets.api_keys.data.length },
    { id: 'members' as const, label: 'Members', count: dataSets.members.data.length },
  ];

  const current = dataSets[selectedTable];
  const data = current.data;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}
          >
            <Database className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <div>
            <h2 style={{ color: 'var(--foreground)' }}>Data Explorer</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Browse, create, edit, and delete records across all tables
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      {/* Table Selector */}
      <div 
        className="rounded-lg p-6 border"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <h3 className="mb-4">Select Table</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id as TableType)}
              className="p-4 rounded-lg border transition-all text-left"
              style={{
                backgroundColor: selectedTable === table.id ? 'var(--accent)' : 'var(--background)',
                borderColor: selectedTable === table.id ? 'var(--accent)' : 'var(--border)',
                color: selectedTable === table.id ? 'var(--accent-foreground)' : 'var(--foreground)',
              }}
            >
              <p className="mb-1">{table.label}</p>
              <p style={{ opacity: 0.7 }}>{table.count} records</p>
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Loading / Error / Empty guards */}
        {current.loading ? (
          <LoadingState title={`Loading ${selectedTable}...`} description="Fetching records from the database" />
        ) : current.error ? (
          <ErrorState
            title={`Failed to load ${selectedTable}`}
            description={current.error}
            onRetry={current.refetch}
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Database}
            title={`No ${selectedTable} found`}
            description={`This table has no records yet. Create your first ${selectedTable.replace('_', ' ')} record.`}
            action={{ label: 'Create New', onClick: () => setIsCreating(true), icon: Plus }}
          />
        ) : (
        <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left p-4" style={{ color: 'var(--muted-foreground)' }}>ID</th>
                <th className="text-left p-4" style={{ color: 'var(--muted-foreground)' }}>Data</th>
                <th className="text-left p-4" style={{ color: 'var(--muted-foreground)' }}>Created At</th>
                <th className="text-right p-4" style={{ color: 'var(--muted-foreground)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item: any, index) => (
                <tr 
                  key={item.id}
                  style={{ borderBottom: index < 9 ? '1px solid var(--border)' : 'none' }}
                >
                  <td className="p-4">
                    <code 
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                    >
                      {item.id.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {Object.keys(item).slice(1, 4).map(key => (
                        <div key={key}>
                          <span style={{ color: 'var(--muted-foreground)' }}>{key}: </span>
                          <span>{String(item[key]).slice(0, 40)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        style={{ color: 'var(--destructive)' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div 
          className="p-4 text-center"
          style={{ 
            borderTop: '1px solid var(--border)',
            color: 'var(--muted-foreground)' 
          }}
        >
          Showing 10 of {data.length} records
        </div>
        </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingId) && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-lg p-6 max-w-2xl w-full mx-4"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2>{isCreating ? 'Create New Record' : 'Edit Record'}</h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2">Table</label>
                <input
                  type="text"
                  value={selectedTable}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                    color: 'var(--muted-foreground)'
                  }}
                />
              </div>

              <div>
                <label className="block mb-2">JSON Data</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border h-64"
                  style={{ 
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                    fontFamily: 'monospace'
                  }}
                  placeholder='{"key": "value"}'
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded-lg border transition-colors hover:bg-muted"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                <Save className="w-4 h-4" />
                {isCreating ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}