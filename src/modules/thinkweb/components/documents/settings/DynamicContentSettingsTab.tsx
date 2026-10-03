
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Variable, Code, Database, Zap } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';

interface DynamicContentSettingsTabProps {
  dynamicContentMode: string;
  setDynamicContentMode: (value: string) => void;
}

const DynamicContentSettingsTab = ({
  dynamicContentMode,
  setDynamicContentMode
}: DynamicContentSettingsTabProps) => {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    console.log("Saving dynamic content settings:", {
      dynamicContentMode
    });
    
    toast({
      title: "Settings updated",
      description: "Dynamic content settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Dynamic Content Mode</Label>
        <RadioGroup 
          defaultValue="variables" 
          value={dynamicContentMode} 
          onValueChange={(value) => {
            console.log("Changing dynamicContentMode to:", value);
            setDynamicContentMode(value);
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="variables" id="variables" />
            <Label htmlFor="variables" className="flex items-center">
              <Variable className="h-4 w-4 mr-1" />
              Variables
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="code" id="code" />
            <Label htmlFor="code" className="flex items-center">
              <Code className="h-4 w-4 mr-1" />
              Code Blocks
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="database" id="database" />
            <Label htmlFor="database" className="flex items-center">
              <Database className="h-4 w-4 mr-1" />
              Data Connections
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="api" id="api" />
            <Label htmlFor="api" className="flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              API Integrations
            </Label>
          </div>
        </RadioGroup>
      </div>
      <p className="text-sm text-gray-500">
        Choose how dynamic content is handled on this page.
      </p>
      
      <div className="mt-6">
        <Button onClick={handleSaveSettings}>Save Changes</Button>
      </div>
    </div>
  );
};

export default DynamicContentSettingsTab;
