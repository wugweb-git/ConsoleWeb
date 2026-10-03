
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';
import { BrainCircuit, Settings, Plus } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import AIProviderModal from '../../../components/ai/AIProviderModal';

interface AISettingsTabProps {
  enableAI: boolean;
  setEnableAI: (value: boolean) => void;
  trackAIChanges: boolean;
  setTrackAIChanges: (value: boolean) => void;
}

const AISettingsTab = ({
  enableAI,
  setEnableAI,
  trackAIChanges,
  setTrackAIChanges
}: AISettingsTabProps) => {
  const { toast } = useToast();
  const [isAIProviderModalOpen, setIsAIProviderModalOpen] = useState(false);

  const handleSaveSettings = () => {
    console.log("Saving AI assistant settings:", {
      enableAI,
      trackAIChanges
    });
    
    toast({
      title: "Settings updated",
      description: "AI assistant settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">AI Assistant Configuration</Label>
          <p className="text-sm text-gray-500 mt-1">
            Configure AI assistance for dynamic content generation and document enhancement.
          </p>
        </div>
        
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-ai" className="font-medium">Enable AI assistance</Label>
              <p className="text-sm text-gray-500">Allow AI to help with document creation and editing</p>
            </div>
            <Switch 
              id="enable-ai" 
              checked={enableAI} 
              onCheckedChange={(checked) => {
                console.log("Changing enableAI to:", checked);
                setEnableAI(checked);
              }} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="track-ai-changes" className="font-medium">Track AI-driven changes</Label>
              <p className="text-sm text-gray-500">Keep history of AI-generated content modifications</p>
            </div>
            <Switch 
              id="track-ai-changes" 
              checked={trackAIChanges} 
              onCheckedChange={(checked) => {
                console.log("Changing trackAIChanges to:", checked);
                setTrackAIChanges(checked);
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">AI Providers</Label>
          <p className="text-sm text-gray-500 mt-1">
            Connect your preferred AI providers for enhanced capabilities.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="text-xl">🤖</div>
              <div>
                <h4 className="font-medium text-green-800">OpenAI GPT-4</h4>
                <p className="text-xs text-green-600">Active provider</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">Connected</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-center"
            onClick={() => setIsAIProviderModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add AI Provider
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSaveSettings}>Save AI Settings</Button>
      </div>
      
      <AIProviderModal 
        open={isAIProviderModalOpen}
        onClose={() => setIsAIProviderModalOpen(false)}
      />
    </div>
  );
};

export default AISettingsTab;
