import { useState } from 'react';
import { Shield, Lock, Key, Eye, EyeOff, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { 
  encryptPII, 
  decryptPII, 
  maskEmail, 
  encryptAPIKey,
  SecureStorage,
} from '../utils/encryption';
import { ConfirmDialog } from './ConfirmDialog';
import { StatCard } from './ui/StatCard';
import { AlertBanner } from './ui/AlertBanner';

export function SecuritySettingsPanel() {
  const [testEmail, setTestEmail] = useState('john.doe@example.com');
  const [encryptedEmail, setEncryptedEmail] = useState('');
  const [decryptedEmail, setDecryptedEmail] = useState('');
  const [showDecrypted, setShowDecrypted] = useState(false);
  
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [testAPIKey, setTestAPIKey] = useState('sk_live_demo_key_3');
  const [encryptedAPIKey, setEncryptedAPIKey] = useState('');

  const [piiEncryptionEnabled, setPIIEncryptionEnabled] = useState(true);
  const [apiKeyEncryptionEnabled, setAPIKeyEncryptionEnabled] = useState(true);
  const [autoEncryptOnSave, setAutoEncryptOnSave] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleEncryptEmail = async () => {
    try {
      const encrypted = await encryptPII(testEmail);
      setEncryptedEmail(encrypted);
      setDecryptedEmail('');
      setShowDecrypted(false);
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  const handleDecryptEmail = async () => {
    try {
      const decrypted = await decryptPII(encryptedEmail);
      setDecryptedEmail(decrypted);
      setShowDecrypted(true);
    } catch (error) {
      console.error('Decryption failed:', error);
    }
  };

  const handleEncryptAPIKey = async () => {
    try {
      const encrypted = await encryptAPIKey(testAPIKey);
      setEncryptedAPIKey(encrypted);
    } catch (error) {
      console.error('API key encryption failed:', error);
    }
  };

  const handleClearSecureStorage = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    SecureStorage.clearAll();
    setEncryptedEmail('');
    setEncryptedAPIKey('');
    setDecryptedEmail('');
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-10">
      {/* Header & Status Summary */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-[var(--radius-lg)] flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3>Security & Encryption</h3>
            <p className="text-muted-foreground">End-to-end client-side data protection for sensitive information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="PII Protection" 
            value={piiEncryptionEnabled ? "Active" : "Disabled"} 
            icon={Shield} 
            valueColor={piiEncryptionEnabled ? "text-success-foreground" : "text-error-foreground"}
          />
          <StatCard 
            label="API Key Vault" 
            value={apiKeyEncryptionEnabled ? "Encrypted" : "Plaintext"} 
            icon={Key} 
            valueColor={apiKeyEncryptionEnabled ? "text-success-foreground" : "text-error-foreground"}
          />
          <StatCard 
            label="Auto-Armor" 
            value={autoEncryptOnSave ? "On" : "Off"} 
            icon={Lock} 
            valueColor={autoEncryptOnSave ? "text-success-foreground" : "text-warning-foreground"}
          />
        </div>
      </div>

      {/* Settings Controls */}
      <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6">
        <h4 className="mb-6">Privacy Policies</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
             <label className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-[var(--radius-lg)] cursor-pointer hover:bg-muted/50 transition-colors">
               <input
                 type="checkbox"
                 checked={piiEncryptionEnabled}
                 onChange={(e) => setPIIEncryptionEnabled(e.target.checked)}
                 className="w-5 h-5 accent-primary rounded-[var(--radius-sm)]"
               />
               <div>
                 <p className="font-[var(--font-weight-semibold)] text-sm">PII Encryption</p>
                 <p className="text-xs text-muted-foreground">Protect Guest Emails/Phones</p>
               </div>
             </label>
          </div>
          <div className="space-y-3">
             <label className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-[var(--radius-lg)] cursor-pointer hover:bg-muted/50 transition-colors">
               <input
                 type="checkbox"
                 checked={apiKeyEncryptionEnabled}
                 onChange={(e) => setAPIKeyEncryptionEnabled(e.target.checked)}
                 className="w-5 h-5 accent-primary rounded-[var(--radius-sm)]"
               />
               <div>
                 <p className="font-[var(--font-weight-semibold)] text-sm">Vault Credentials</p>
                 <p className="text-xs text-muted-foreground">Secure OTA/Payment Keys</p>
               </div>
             </label>
          </div>
          <div className="space-y-3">
             <label className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-[var(--radius-lg)] cursor-pointer hover:bg-muted/50 transition-colors">
               <input
                 type="checkbox"
                 checked={autoEncryptOnSave}
                 onChange={(e) => setAutoEncryptOnSave(e.target.checked)}
                 className="w-5 h-5 accent-primary rounded-[var(--radius-sm)]"
               />
               <div>
                 <p className="font-[var(--font-weight-semibold)] text-sm">Instant Armor</p>
                 <p className="text-xs text-muted-foreground">Auto-encrypt on persistence</p>
               </div>
             </label>
          </div>
        </div>
      </div>

      {/* PII Encryption Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 space-y-6 flex flex-col">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h4>PII Data Demonstration</h4>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider mb-2 block">Guest Email (Input)</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="email@example.com"
                />
                <button
                  onClick={handleEncryptEmail}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:opacity-90 transition-all flex items-center gap-2 font-[var(--font-weight-semibold)]"
                >
                  <Lock className="w-4 h-4" />
                  Armor
                </button>
              </div>
            </div>

            {testEmail && (
              <div className="bg-muted border border-border rounded-[var(--radius-md)] p-4">
                <p className="text-xs text-muted-foreground font-[var(--font-weight-bold)] uppercase mb-2">Masked UI Preview:</p>
                <p className="text-lg font-mono text-foreground tracking-tight">{maskEmail(testEmail)}</p>
              </div>
            )}

            {encryptedEmail && (
              <div className="space-y-4">
                <div className="p-4 bg-muted border border-border rounded-[var(--radius-md)]">
                  <p className="text-xs text-muted-foreground font-[var(--font-weight-bold)] uppercase mb-2">Stored Hash (AES-256):</p>
                  <code className="text-xs text-muted-foreground break-all bg-background p-2 block rounded border border-border">
                    {encryptedEmail.substring(0, 120)}...
                  </code>
                </div>
                {!showDecrypted && (
                  <button
                    onClick={handleDecryptEmail}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:opacity-90 transition-all flex items-center justify-center gap-2 font-[var(--font-weight-bold)]"
                  >
                    <Eye className="w-4 h-4" />
                    Vault Access Check
                  </button>
                )}
              </div>
            )}

            {showDecrypted && decryptedEmail && (
              <div className="p-4 bg-success-bg border border-success-border rounded-[var(--radius-md)] animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-[var(--font-weight-bold)] text-success-foreground uppercase">Vault Decrypted Result:</p>
                  <button onClick={() => setShowDecrypted(false)} className="p-1 hover:bg-success/10 rounded">
                    <EyeOff className="w-4 h-4 text-success-foreground" />
                  </button>
                </div>
                <p className="text-xl font-[var(--font-weight-bold)] text-foreground">{decryptedEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* API Key Encryption Demo */}
        <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 space-y-6 flex flex-col">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h4>API Key Vault Demo</h4>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider mb-2 block">Third-party API Secret</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={apiKeyVisible ? 'text' : 'password'}
                    value={testAPIKey}
                    onChange={(e) => setTestAPIKey(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-12 font-mono"
                    placeholder="sk_live_..."
                  />
                  <button
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded transition-colors"
                  >
                    {apiKeyVisible ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleEncryptAPIKey}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:opacity-90 transition-all flex items-center gap-2 font-[var(--font-weight-semibold)]"
                >
                  <Lock className="w-4 h-4" />
                  Vault
                </button>
              </div>
            </div>

            {encryptedAPIKey && (
              <div className="p-4 bg-success-bg border border-success-border rounded-[var(--radius-md)] animate-slide-up">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-success-foreground" />
                  <p className="text-sm font-[var(--font-weight-bold)] text-success-foreground uppercase">Securely Vaulted</p>
                </div>
                <code className="text-xs text-muted-foreground break-all bg-background p-3 block rounded border border-border">
                  {encryptedAPIKey.substring(0, 160)}...
                </code>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <AlertBanner 
              variant="info" 
              title="Encryption Strategy"
              description="Credentials are salted and encrypted using AES-GCM before reaching the server, ensuring zero-knowledge storage for high-stakes keys."
            />
          </div>
        </div>
      </div>

      {/* Security Best Practices & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h4 className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Security Compliance Checklist
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "PII (Email, Phone) AES-256-GCM Encrypted",
              "One-Way SHA-256 Password Salting",
              "Session-Based Ephemeral Key Rotation",
              "Client-Side Zero-Knowledge Verification",
              "XSS-Protected Secure Storage Context",
              "Sanitized SQL/NoSQL KV Parameters"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/20 border border-border rounded-[var(--radius-md)]">
                <Check className="w-4 h-4 text-success-foreground mt-0.5 shrink-0" />
                <span className="text-sm font-[var(--font-weight-medium)]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-error-bg/30 border border-error-border rounded-[var(--radius-xl)] p-6">
             <h4 className="text-error-foreground mb-2">Danger Zone</h4>
             <p className="text-xs text-muted-foreground mb-6">Irreversible administrative actions for system maintenance.</p>
             <button
              onClick={handleClearSecureStorage}
              className="w-full py-3 bg-error text-error-foreground rounded-[var(--radius-md)] hover:opacity-90 transition-all flex items-center justify-center gap-2 font-[var(--font-weight-bold)] shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Wipe Local Vault
            </button>
          </div>
        </div>
      </div>

      <AlertBanner
        variant="warning"
        title="Production Deployment Note"
        description="This panel operates in Demonstration Mode. For live deployments, ensure HTTPS is enforced globally and backend CORS policies are restricted to your specific Netlify/Vercel domain."
      />

      {/* Confirm Clear Dialog */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Encrypted Storage"
        description="Are you sure you want to clear all encrypted data from secure storage? This action cannot be undone and will logout the current session."
        confirmLabel="Wipe Storage"
        variant="destructive"
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}