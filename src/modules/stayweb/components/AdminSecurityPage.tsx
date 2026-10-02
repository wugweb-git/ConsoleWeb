import { SecuritySettingsPanel } from './SecuritySettingsPanel';
import { Shield, ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from './ui/AdminPageHeader';

interface AdminSecurityPageProps {
  onBack?: () => void;
}

export function AdminSecurityPage({ onBack }: AdminSecurityPageProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <AdminPageHeader
        title="Security Settings"
        description="Manage security policies and access controls"
        icon={Shield}
        badge="Admin Only"
      />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto p-8">
          <SecuritySettingsPanel />
        </div>
      </div>
    </div>
  );
}