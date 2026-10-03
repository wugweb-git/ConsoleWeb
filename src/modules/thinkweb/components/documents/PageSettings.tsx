
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { X, Settings } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

// Import the refactored tab components
import GeneralSettingsTab from './settings/GeneralSettingsTab';
import SharingSettingsTab from './settings/SharingSettingsTab';
import DynamicContentSettingsTab from './settings/DynamicContentSettingsTab';
import AISettingsTab from './settings/AISettingsTab';

interface PageSettingsProps {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
}

const PageSettings = ({ open, onClose, onShare }: PageSettingsProps) => {
  // State management
  const [isLocked, setIsLocked] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [dynamicContentMode, setDynamicContentMode] = useState('variables');
  const [pageTitle, setPageTitle] = useState('My Awesome Page');
  const [theme, setTheme] = useState('Default');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(true);
  const [enableAI, setEnableAI] = useState(true);
  const [trackAIChanges, setTrackAIChanges] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();

  useEffect(() => {
    console.log("PageSettings component rendered, open:", open);
    if (open) {
      // Log the initial state when dialog opens
      console.log("Settings state:", {
        isLocked,
        isPublic,
        showComments,
        dynamicContentMode,
        pageTitle,
        theme,
        isFullWidth,
        showTableOfContents,
        enableAI,
        trackAIChanges
      });
    }
  }, [open, isLocked, isPublic, showComments, dynamicContentMode, pageTitle, theme, isFullWidth, showTableOfContents, enableAI, trackAIChanges]);

  const handleClose = () => {
    // Reset active tab when closing
    setActiveTab('general');
    onClose();
  };

  const handlePublicStateChange = (newIsPublic: boolean) => {
    setIsPublic(newIsPublic);
    console.log("Public state changed in PageSettings:", newIsPublic);
  };

  const handleShareFromSettings = () => {
    // Close settings and open share modal
    handleClose();
    onShare();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between pb-2">
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Page Settings
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="sharing">Sharing</TabsTrigger>
              <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto py-4">
              <TabsContent value="general" className="mt-0">
                <GeneralSettingsTab 
                  pageTitle={pageTitle}
                  setPageTitle={setPageTitle}
                  isLocked={isLocked}
                  setIsLocked={setIsLocked}
                  showComments={showComments}
                  setShowComments={setShowComments}
                  theme={theme}
                  setTheme={setTheme}
                />
              </TabsContent>

              <TabsContent value="sharing" className="mt-0">
                <SharingSettingsTab 
                  isPublic={isPublic}
                  setIsPublic={handlePublicStateChange}
                  onShare={handleShareFromSettings}
                />
              </TabsContent>

              <TabsContent value="dynamic" className="mt-0">
                <DynamicContentSettingsTab 
                  dynamicContentMode={dynamicContentMode}
                  setDynamicContentMode={setDynamicContentMode}
                />
              </TabsContent>

              <TabsContent value="ai" className="mt-0">
                <AISettingsTab 
                  enableAI={enableAI}
                  setEnableAI={setEnableAI}
                  trackAIChanges={trackAIChanges}
                  setTrackAIChanges={setTrackAIChanges}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageSettings;
