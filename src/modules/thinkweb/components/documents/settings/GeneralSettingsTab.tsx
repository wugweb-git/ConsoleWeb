
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Separator } from '../../../components/ui/separator';
import { useToast } from '../../../hooks/use-toast';
import { Lock } from 'lucide-react';

interface GeneralSettingsTabProps {
  pageTitle: string;
  setPageTitle: (value: string) => void;
  isLocked: boolean;
  setIsLocked: (value: boolean) => void;
  showComments: boolean;
  setShowComments: (value: boolean) => void;
  theme: string;
  setTheme: (value: string) => void;
}

const GeneralSettingsTab = ({
  pageTitle,
  setPageTitle,
  isLocked,
  setIsLocked,
  showComments,
  setShowComments,
  theme,
  setTheme
}: GeneralSettingsTabProps) => {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    console.log("Saving general settings:", {
      pageTitle,
      isLocked,
      showComments,
      theme
    });
    
    toast({
      title: "Settings updated",
      description: "General settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="page-title">Page Title</Label>
        <Input 
          type="text" 
          id="page-title" 
          placeholder="My Awesome Page" 
          value={pageTitle}
          onChange={(e) => {
            console.log("Changing page title to:", e.target.value);
            setPageTitle(e.target.value);
          }}
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Label htmlFor="lock-page" className="flex items-center">
          <Lock className="h-4 w-4 mr-2" /> Lock Page
        </Label>
        <Switch 
          id="lock-page" 
          checked={isLocked} 
          onCheckedChange={(checked) => {
            console.log("Changing isLocked to:", checked);
            setIsLocked(checked);
          }} 
        />
      </div>
      <p className="text-sm text-gray-500">
        Locking the page prevents others from making changes.
      </p>
      
      <Separator />
      <div className="flex items-center justify-between">
        <Label htmlFor="show-comments">Show Comments</Label>
        <Switch 
          id="show-comments" 
          checked={showComments} 
          onCheckedChange={(checked) => {
            console.log("Changing showComments to:", checked);
            setShowComments(checked);
          }} 
        />
      </div>
      <p className="text-sm text-gray-500">
        Enable or disable comments on this page.
      </p>

      <Separator />
      <div className="space-y-2">
        <Label htmlFor="theme-select">Theme</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger id="theme-select">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Default">Default</SelectItem>
            <SelectItem value="Modern">Modern</SelectItem>
            <SelectItem value="Minimalist">Minimalist</SelectItem>
            <SelectItem value="Classic">Classic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-6">
        <Button onClick={handleSaveSettings}>Save Changes</Button>
      </div>
    </div>
  );
};

export default GeneralSettingsTab;
