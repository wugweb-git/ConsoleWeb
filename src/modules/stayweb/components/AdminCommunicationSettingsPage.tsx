import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Smartphone, 
  Save, 
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  AlertCircle,
  Loader2,
  Send,
  Trash2,
  Clock,
  CreditCard,
  Phone,
  Info
} from 'lucide-react';
import { EmailNotificationSettings } from './EmailNotificationSettings';
import { AdminPageHeader } from './ui/AdminPageHeader';
import { AlertBanner } from './ui/AlertBanner';
import { api } from '../contexts/PropertyDataContext';

interface BrevoSMSConfig {
  senderId: string;
  enabled: boolean;
  defaultCountryCode: string;
  updatedAt?: string;
}

interface WhatsAppConfig {
  provider: 'twilio' | 'meta';
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  enabled: boolean;
}

interface SMSLogEntry {
  id: string;
  recipient: string;
  sender: string;
  content: string;
  type: 'test' | 'auto';
  status: string;
  messageId: number;
  smsCount: number;
  usedCredits: number;
  remainingCredits: number;
  sentAt: string;
}

const defaultSmsConfig: BrevoSMSConfig = {
  senderId: 'STAYWB',
  enabled: false,
  defaultCountryCode: '+91',
};

const defaultWhatsappConfig: WhatsAppConfig = {
  provider: 'meta',
  phoneNumberId: '',
  accessToken: '',
  businessAccountId: '',
  enabled: false
};

export function AdminCommunicationSettingsPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [showSecrets, setShowSecrets] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [smsConfig, setSmsConfig] = useState<BrevoSMSConfig>(defaultSmsConfig);
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>(defaultWhatsappConfig);

  // SMS test send state
  const [testPhone, setTestPhone] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // SMS delivery log
  const [smsLog, setSmsLog] = useState<SMSLogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);

  // Brevo API status
  const [brevoConfigured, setBrevoConfigured] = useState<boolean | null>(null);
  const [brevoKeyValid, setBrevoKeyValid] = useState<boolean | null>(null);
  const [brevoAccountEmail, setBrevoAccountEmail] = useState('');
  const [brevoKeyError, setBrevoKeyError] = useState('');

  // Load saved configs from backend on mount
  useEffect(() => {
    const loadConfigs = async () => {
      setLoadingConfig(true);
      setLoadError(null);
      try {
        const [smsData, waData, statusData] = await Promise.all([
          api.fetch<BrevoSMSConfig>('/brevo/sms/config').catch(() => null),
          api.fetch<WhatsAppConfig>('/communication/whatsapp').catch(() => null),
          api.fetch<{ configured: boolean }>('/brevo/status').catch(() => null),
        ]);
        if (smsData && Object.keys(smsData).length > 0) {
          setSmsConfig({ ...defaultSmsConfig, ...smsData });
        }
        if (waData && Object.keys(waData).length > 0) {
          setWhatsappConfig({ ...defaultWhatsappConfig, ...waData });
        }
        if (statusData) {
          setBrevoConfigured((statusData as any).configured);
          setBrevoKeyValid((statusData as any).keyValid ?? null);
          setBrevoAccountEmail((statusData as any).accountEmail || '');
          setBrevoKeyError((statusData as any).keyError || '');
        }
      } catch (e: any) {
        console.error('[Communication] Failed to load configs:', e);
        setLoadError(e.message || 'Failed to load communication settings');
      } finally {
        setLoadingConfig(false);
      }
    };
    loadConfigs();
  }, []);

  // Load SMS log when SMS tab is active
  useEffect(() => {
    if (activeTab === 'sms') {
      loadSmsLog();
    }
  }, [activeTab]);

  const loadSmsLog = async () => {
    setLoadingLog(true);
    try {
      const data = await api.fetch<SMSLogEntry[]>('/brevo/sms/log');
      setSmsLog(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[SMS] Failed to load delivery log:', e);
    } finally {
      setLoadingLog(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      if (activeTab === 'sms') {
        await api.fetch('/brevo/sms/config', {
          method: 'PUT',
          body: JSON.stringify(smsConfig),
        });
      } else if (activeTab === 'whatsapp') {
        await api.fetch('/communication/whatsapp', {
          method: 'PUT',
          body: JSON.stringify(whatsappConfig),
        });
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) {
      console.error('[Communication] Save failed:', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone.trim()) return;
    setTestSending(true);
    setTestResult(null);
    try {
      // Normalize phone number — ensure E.164 format
      let recipient = testPhone.trim();
      if (!recipient.startsWith('+')) {
        recipient = (smsConfig.defaultCountryCode || '+91') + recipient;
      }

      const data = await api.fetch<{ messageId: number; smsCount: number; remainingCredits: number }>('/brevo/sms/test-send', {
        method: 'POST',
        body: JSON.stringify({
          recipient,
          sender: smsConfig.senderId || 'STAYWB',
        }),
      });
      setTestResult({
        success: true,
        message: `SMS sent (ID: ${data.messageId}, Credits remaining: ${data.remainingCredits})`,
      });
      loadSmsLog(); // Refresh log
    } catch (e: any) {
      console.error('[SMS] Test send failed:', e);
      setTestResult({
        success: false,
        message: e.message || 'Failed to send test SMS',
      });
    } finally {
      setTestSending(false);
    }
  };

  const handleClearLog = async () => {
    try {
      await api.fetch('/brevo/sms/log', { method: 'DELETE' });
      setSmsLog([]);
    } catch (e) {
      console.error('[SMS] Failed to clear log:', e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <AdminPageHeader
        title="Communication Settings"
        description="Configure Email, SMS and WhatsApp integrations for guest notifications"
        icon={MessageSquare}
        badge="System Config"
      />
      
      <div className="flex-1 overflow-auto p-6 space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Tabs */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('email')}
              className={`p-6 rounded-[var(--radius-xl)] border transition-all flex flex-col items-center gap-3 group ${
                activeTab === 'email'
                  ? 'bg-info-bg border-info-border text-info-foreground shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:border-info-border/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center transition-colors ${activeTab === 'email' ? 'bg-info-bg text-info-foreground' : 'bg-muted group-hover:bg-info-bg/50'}`}>
                <Mail className="w-6 h-6" />
              </div>
              <span className="font-[var(--font-weight-semibold)] tracking-tight">Email Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`p-6 rounded-[var(--radius-xl)] border transition-all flex flex-col items-center gap-3 group ${
                activeTab === 'sms'
                  ? 'bg-primary/10 border-primary/30 text-foreground shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center transition-colors ${activeTab === 'sms' ? 'bg-primary/10 text-primary' : 'bg-muted group-hover:bg-primary/10'}`}>
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="font-[var(--font-weight-semibold)] tracking-tight">SMS Integration</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`p-6 rounded-[var(--radius-xl)] border transition-all flex flex-col items-center gap-3 group ${
                activeTab === 'whatsapp'
                  ? 'bg-success-bg border-success-border text-success-foreground shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:border-success-border/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center transition-colors ${activeTab === 'whatsapp' ? 'bg-success-bg text-success-foreground' : 'bg-muted group-hover:bg-success-bg/50'}`}>
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="font-[var(--font-weight-semibold)] tracking-tight">WhatsApp Integration</span>
            </button>
          </div>

          {/* Loading state */}
          {loadingConfig && activeTab !== 'email' && (
            <div className="bg-card border border-border rounded-[var(--radius-xl)] p-12 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground text-[length:var(--text-sm)]">Loading configuration...</p>
            </div>
          )}

          {/* Error state */}
          {loadError && activeTab !== 'email' && !loadingConfig && (
            <AlertBanner
              variant="warning"
              title="Could not load saved configuration"
              description={`${loadError}. You can still edit and save new settings.`}
            />
          )}

          {/* Content Area */}
          {(!loadingConfig || activeTab === 'email') && (
            <div className={`transition-all ${activeTab !== 'email' ? "bg-card border border-border rounded-[var(--radius-xl)] p-8 shadow-sm animate-fade-in" : ""}`}>
              {activeTab === 'email' ? (
                <div className="animate-fade-in">
                  <EmailNotificationSettings />
                </div>
              ) : activeTab === 'sms' ? (
                <div className="space-y-8 animate-fade-in">
                  {/* Header with enable toggle */}
                  <div className="flex items-center justify-between pb-6 border-b border-border">
                    <div>
                      <h4>Brevo SMS Configuration</h4>
                      <p className="text-muted-foreground">Send transactional SMS via Brevo using your existing API key</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={smsConfig.enabled}
                        onChange={(e) => setSmsConfig({ ...smsConfig, enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Brevo API Status */}
                  {brevoConfigured !== null && (
                    <div className={`flex items-start gap-3 p-4 rounded-[var(--radius-md)] border ${
                      brevoConfigured && brevoKeyValid
                        ? 'bg-success-bg border-success-border text-success-foreground'
                        : brevoConfigured && !brevoKeyValid
                          ? 'bg-warning-bg border-warning-border text-warning-foreground'
                          : 'bg-error-bg border-error-border text-error-foreground'
                    }`}>
                      {brevoConfigured && brevoKeyValid ? (
                        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] block">
                          {!brevoConfigured
                            ? 'BREVO_API_KEY is not configured. SMS and Email will not work until the key is set.'
                            : brevoKeyValid
                              ? `BREVO_API_KEY is valid — connected to ${brevoAccountEmail || 'Brevo account'}`
                              : 'BREVO_API_KEY is set but invalid or expired. SMS/Email calls will fail.'}
                        </span>
                        {brevoKeyError && (
                          <span className="text-[length:var(--text-xs)] mt-1 block opacity-80">
                            Brevo error: {brevoKeyError}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Config Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">Sender ID</label>
                        <input
                          type="text"
                          value={smsConfig.senderId}
                          onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. STAYWB"
                          maxLength={11}
                        />
                        <p className="mt-2 text-[length:var(--text-xs)] text-muted-foreground">
                          For India: 6-character alphabetic DLT-registered sender ID. International: up to 11 characters.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">Default Country Code</label>
                        <select
                          value={smsConfig.defaultCountryCode}
                          onChange={(e) => setSmsConfig({ ...smsConfig, defaultCountryCode: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="+91">+91 (India)</option>
                          <option value="+1">+1 (USA/Canada)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+971">+971 (UAE)</option>
                          <option value="+65">+65 (Singapore)</option>
                          <option value="+66">+66 (Thailand)</option>
                          <option value="+62">+62 (Indonesia)</option>
                          <option value="+84">+84 (Vietnam)</option>
                        </select>
                      </div>
                    </div>

                    {/* Test Send */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Test SMS
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="tel"
                              value={testPhone}
                              onChange={(e) => setTestPhone(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="9876543210"
                            />
                          </div>
                          <button
                            onClick={handleTestSMS}
                            disabled={testSending || !testPhone.trim()}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-[var(--radius-md)] font-[var(--font-weight-semibold)] hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
                          >
                            {testSending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Send
                          </button>
                        </div>
                        <p className="mt-2 text-[length:var(--text-xs)] text-muted-foreground">
                          Enter phone number without country code — default prefix ({smsConfig.defaultCountryCode}) will be added automatically.
                        </p>
                      </div>

                      {/* Test Result */}
                      {testResult && (
                        <div className={`flex items-start gap-3 p-4 rounded-[var(--radius-md)] border animate-fade-in ${
                          testResult.success
                            ? 'bg-success-bg border-success-border text-success-foreground'
                            : 'bg-error-bg border-error-border text-error-foreground'
                        }`}>
                          {testResult.success ? (
                            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          )}
                          <span className="text-[length:var(--text-sm)]">{testResult.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <AlertBanner 
                    variant="info"
                    title="India DLT Compliance"
                    description="Sender ID and templates must be DLT-registered with your telecom operator (Jio/VI/Airtel) for Indian delivery."
                  />

                  {/* SMS Delivery Log */}
                  <div className="border-t border-border pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <h4 className="text-[length:var(--text-base)] font-[var(--font-weight-semibold)]">SMS Delivery Log</h4>
                        <span className="bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-[length:var(--text-xs)] font-[var(--font-weight-medium)]">
                          {smsLog.length}
                        </span>
                      </div>
                      {smsLog.length > 0 && (
                        <button
                          onClick={handleClearLog}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[length:var(--text-xs)] text-muted-foreground hover:text-destructive border border-border rounded-[var(--radius-md)] hover:border-destructive/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Clear Log
                        </button>
                      )}
                    </div>

                    {loadingLog ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      </div>
                    ) : smsLog.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <Smartphone className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="text-[length:var(--text-sm)]">No SMS sent yet. Use the test send above to verify your setup.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {smsLog.map((entry) => (
                          <div key={entry.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-[var(--radius-md)] border border-border/50">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              entry.status === 'delivered' ? 'bg-success' : 'bg-error'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] truncate">{entry.recipient}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[length:var(--text-xs)] font-[var(--font-weight-medium)] ${
                                  entry.type === 'test' 
                                    ? 'bg-primary/10 text-foreground' 
                                    : 'bg-info-bg text-info-foreground'
                                }`}>
                                  {entry.type}
                                </span>
                              </div>
                              <p className="text-[length:var(--text-xs)] text-muted-foreground truncate mt-0.5">{entry.content}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1 text-[length:var(--text-xs)] text-muted-foreground">
                                <CreditCard className="w-3 h-3" />
                                <span>{entry.remainingCredits} credits left</span>
                              </div>
                              <p className="text-[length:var(--text-xs)] text-muted-foreground mt-0.5">
                                {new Date(entry.sentAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-border">
                    <div>
                      <h4>WhatsApp Configuration</h4>
                      <p className="text-muted-foreground">Automated guest communication via WhatsApp Business API</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={whatsappConfig.enabled}
                        onChange={(e) => setWhatsappConfig({ ...whatsappConfig, enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-success rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">Official Provider</label>
                        <select
                          value={whatsappConfig.provider}
                          onChange={(e) => setWhatsappConfig({ ...whatsappConfig, provider: e.target.value as any })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-success"
                        >
                          <option value="meta">Meta Cloud API (Official)</option>
                          <option value="twilio">Twilio for WhatsApp</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">Phone Number ID</label>
                        <input
                          type="text"
                          value={whatsappConfig.phoneNumberId}
                          onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-success font-mono"
                          placeholder="e.g. 106512345678901"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">Business Account ID</label>
                        <input
                          type="text"
                          value={whatsappConfig.businessAccountId}
                          onChange={(e) => setWhatsappConfig({ ...whatsappConfig, businessAccountId: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-success font-mono"
                          placeholder="e.g. 102345678901234"
                        />
                      </div>

                      <div>
                        <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">Permanent Access Token</label>
                        <div className="relative">
                          <input
                            type={showSecrets ? 'text' : 'password'}
                            value={whatsappConfig.accessToken}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })}
                            className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-success font-mono"
                            placeholder="EAABw..."
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                          >
                            {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AlertBanner 
                    variant="warning"
                    title="Meta Verification Required"
                    description="Your WhatsApp Business Account must be verified by Meta before you can send messages to non-test numbers."
                  />
                </div>
              )}

              {/* Actions */}
              {activeTab !== 'email' && (
                <div className="mt-10 pt-8 border-t border-border flex justify-end items-center gap-6">
                  {saveStatus === 'error' && (
                    <div className="flex items-center gap-2 text-destructive text-[length:var(--text-sm)]">
                      <AlertCircle className="w-4 h-4" />
                      <span>Save failed. Please try again.</span>
                    </div>
                  )}
                  <p className="text-[length:var(--text-xs)] text-muted-foreground italic">Last synchronized: {new Date().toLocaleTimeString()}</p>
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-[var(--radius-md)] font-[var(--font-weight-bold)] hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving to Vault...
                      </>
                    ) : saveStatus === 'saved' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Changes Applied
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}