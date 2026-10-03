
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../hooks/use-toast';
import { AIProvider, useAIContext } from '../../hooks/use-ai';
import { Brain, Key, Lock, Shield, BrainCircuit, Settings } from 'lucide-react';

interface AIProviderModalProps {
  open: boolean;
  onClose: () => void;
}

const AIProviderModal = ({ open, onClose }: AIProviderModalProps) => {
  const { toast } = useToast();
  const { activeProvider, setActiveProvider, providers, saveProviderKey } = useAIContext();
  const [selectedTab, setSelectedTab] = useState<string>(activeProvider || 'openai');
  const [apiKey, setApiKey] = useState<string>('');
  const [modelSelection, setModelSelection] = useState<string>('gpt-4o');
  const [rememberKey, setRememberKey] = useState<boolean>(true);
  
  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key for this provider.",
        variant: "destructive",
      });
      return;
    }
    
    saveProviderKey(selectedTab as AIProvider, apiKey, modelSelection);
    setActiveProvider(selectedTab as AIProvider);
    
    toast({
      title: "AI Provider Connected",
      description: `Successfully connected to ${selectedTab.toUpperCase()}.`,
    });
    
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BrainCircuit className="w-6 h-6 mr-2" />
            Connect AI Provider
          </DialogTitle>
          <DialogDescription>
            Enter your API key to connect your preferred AI provider for document assistance.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={selectedTab} value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="openai" className="flex flex-col items-center py-3">
              <div className="text-xl mb-1">🤖</div>
              <span className="text-xs">OpenAI</span>
            </TabsTrigger>
            <TabsTrigger value="gemini" className="flex flex-col items-center py-3">
              <div className="text-xl mb-1">🌟</div>
              <span className="text-xs">Gemini</span>
            </TabsTrigger>
            <TabsTrigger value="anthropic" className="flex flex-col items-center py-3">
              <div className="text-xl mb-1">🔬</div>
              <span className="text-xs">Claude</span>
            </TabsTrigger>
            <TabsTrigger value="grok" className="flex flex-col items-center py-3">
              <div className="text-xl mb-1">⚡</div>
              <span className="text-xs">Grok</span>
            </TabsTrigger>
            <TabsTrigger value="mistral" className="flex flex-col items-center py-3">
              <div className="text-xl mb-1">🌀</div>
              <span className="text-xs">Mistral</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="openai" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="flex items-center">
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Key className="ml-2 text-gray-400 w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500">Find your API key in the <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI dashboard</a>.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="openai-model">Model</Label>
              <Select defaultValue={modelSelection} onValueChange={setModelSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Latest)</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="o1-preview">o1-preview</SelectItem>
                  <SelectItem value="o1-mini">o1-mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="gemini" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Google Gemini API Key</Label>
              <div className="flex items-center">
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Key className="ml-2 text-gray-400 w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500">Find your API key in the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gemini-model">Model</Label>
              <Select defaultValue="gemini-2.0-flash-exp" onValueChange={setModelSelection}>
                <SelectTrigger id="gemini-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Latest)</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="anthropic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anthropic-key">Anthropic API Key</Label>
              <div className="flex items-center">
                <Input
                  id="anthropic-key"
                  type="password"
                  placeholder="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Key className="ml-2 text-gray-400 w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500">Find your API key in the <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Anthropic Console</a>.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="anthropic-model">Model</Label>
              <Select defaultValue="claude-opus-4-20250514" onValueChange={setModelSelection}>
                <SelectTrigger id="anthropic-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-opus-4-20250514">Claude 4 Opus (Latest)</SelectItem>
                  <SelectItem value="claude-sonnet-4-20250514">Claude 4 Sonnet</SelectItem>
                  <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                  <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="grok" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grok-key">Grok API Key</Label>
              <div className="flex items-center">
                <Input
                  id="grok-key"
                  type="password"
                  placeholder="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Key className="ml-2 text-gray-400 w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500">Enter your Grok API key from X.AI platform.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grok-model">Model</Label>
              <Select defaultValue="grok-2-1212" onValueChange={setModelSelection}>
                <SelectTrigger id="grok-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grok-2-1212">Grok-2 1212 (Latest)</SelectItem>
                  <SelectItem value="grok-2-vision-1212">Grok-2 Vision 1212</SelectItem>
                  <SelectItem value="grok-2-public">Grok-2 Public</SelectItem>
                  <SelectItem value="grok-1">Grok-1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="mistral" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mistral-key">Mistral API Key</Label>
              <div className="flex items-center">
                <Input
                  id="mistral-key"
                  type="password"
                  placeholder="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Key className="ml-2 text-gray-400 w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500">Find your API key in the <a href="https://console.mistral.ai/api-keys/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mistral AI Platform</a>.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mistral-model">Model</Label>
              <Select defaultValue="mistral-large-2411" onValueChange={setModelSelection}>
                <SelectTrigger id="mistral-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mistral-large-2411">Mistral Large 2411 (Latest)</SelectItem>
                  <SelectItem value="pixtral-large-2411">Pixtral Large 2411</SelectItem>
                  <SelectItem value="mistral-small-2409">Mistral Small 2409</SelectItem>
                  <SelectItem value="codestral-2405">Codestral 2405</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center space-x-2 mt-2">
          <Switch 
            id="remember-key" 
            checked={rememberKey} 
            onCheckedChange={setRememberKey}
          />
          <Label htmlFor="remember-key" className="flex items-center cursor-pointer">
            <Lock className="h-4 w-4 mr-2" />
            Remember API key securely in browser storage
          </Label>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Your API key is stored securely in your browser and is never sent to our servers. 
              All AI requests are made directly from your browser to the provider's API.
            </p>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Connect Provider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIProviderModal;
