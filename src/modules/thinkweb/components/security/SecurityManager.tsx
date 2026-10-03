
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Shield, 
  Key, 
  Eye, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Settings,
  Activity
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface SecuritySettings {
  sessionTimeout: boolean;
  ipWhitelist: boolean;
  auditLogging: boolean;
  passwordPolicy: boolean;
  encryption: boolean;
}

interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

const SecurityManager = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    sessionTimeout: true,
    ipWhitelist: false,
    auditLogging: true,
    passwordPolicy: true,
    encryption: true
  });
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [securityScore, setSecurityScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    calculateSecurityScore();
    loadSecurityThreats();
  }, [settings]);

  const calculateSecurityScore = () => {
    const enabledFeatures = Object.values(settings).filter(Boolean).length;
    const totalFeatures = Object.keys(settings).length;
    const score = Math.round((enabledFeatures / totalFeatures) * 100);
    setSecurityScore(score);
  };

  const loadSecurityThreats = () => {
    // Simulate security threats
    const mockThreats: SecurityThreat[] = [
      {
        id: '1',
        type: 'Failed Login Attempts',
        severity: 'medium',
        description: 'Multiple failed login attempts detected from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '2',
        type: 'Suspicious API Usage',
        severity: 'high',
        description: 'Unusual API request pattern detected',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '3',
        type: 'Password Policy Violation',
        severity: 'low',
        description: 'User attempted to set weak password',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        resolved: true
      }
    ];
    setThreats(mockThreats);
  };

  const handleSettingChange = (setting: keyof SecuritySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));

    toast({
      title: "Security Setting Updated",
      description: `${setting} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const resolveThreat = (threatId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === threatId ? { ...threat, resolved: true } : threat
    ));

    toast({
      title: "Threat Resolved",
      description: "Security threat has been marked as resolved",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Manager</h2>
          <p className="text-gray-600">Monitor and configure security settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}%
            </div>
            <div className="text-sm text-gray-500">Security Score</div>
          </div>
          <Shield className={`h-8 w-8 ${getScoreColor(securityScore)}`} />
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {threats.filter(t => !t.resolved).length}
            </div>
            <p className="text-xs text-muted-foreground">Unresolved issues</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Features</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(settings).filter(Boolean).length}/6
            </div>
            <p className="text-xs text-muted-foreground">Features enabled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m ago</div>
            <p className="text-xs text-muted-foreground">Security scan</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">GDPR</div>
            <p className="text-xs text-muted-foreground">Compliant</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Session Timeout</Label>
                  <div className="text-sm text-gray-500">
                    Automatically log out inactive users
                  </div>
                </div>
                <Switch
                  checked={settings.sessionTimeout}
                  onCheckedChange={(value) => handleSettingChange('sessionTimeout', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">IP Whitelist</Label>
                  <div className="text-sm text-gray-500">
                    Restrict access to approved IP addresses
                  </div>
                </div>
                <Switch
                  checked={settings.ipWhitelist}
                  onCheckedChange={(value) => handleSettingChange('ipWhitelist', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Audit Logging</Label>
                  <div className="text-sm text-gray-500">
                    Log all user actions and system events
                  </div>
                </div>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(value) => handleSettingChange('auditLogging', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Password Policy</Label>
                  <div className="text-sm text-gray-500">
                    Enforce strong password requirements
                  </div>
                </div>
                <Switch
                  checked={settings.passwordPolicy}
                  onCheckedChange={(value) => handleSettingChange('passwordPolicy', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Data Encryption</Label>
                  <div className="text-sm text-gray-500">
                    Encrypt sensitive data at rest and in transit
                  </div>
                </div>
                <Switch
                  checked={settings.encryption}
                  onCheckedChange={(value) => handleSettingChange('encryption', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.map(threat => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{threat.type}</h4>
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        {threat.resolved && (
                          <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{threat.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(threat.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!threat.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveThreat(threat.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Security policies help maintain compliance and protect your data. Review and update these regularly.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Minimum 8 characters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">At least one uppercase letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">At least one number</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">At least one special character</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AES-256 encryption for data at rest</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">TLS 1.3 for data in transit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Regular security backups</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityManager;
