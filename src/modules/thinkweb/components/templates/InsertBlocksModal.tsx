import { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Search, Plus } from 'lucide-react';
import { buildingBlocks, searchBlocks, logBlockSelection } from './utils/BuildingBlockUtils';
import { documentTemplates } from './data/TemplateData';
import { useToast } from '../../hooks/use-toast';
import type { DocumentTemplate } from './types/TemplateTypes';

// Import refactored tab content components
import TemplatesTabContent from './modals/TemplatesTabContent';
import BuildingBlocksTabContent from './modals/BuildingBlocksTabContent';
import DynamicContentTabContent from './modals/DynamicContentTabContent';
import AIFeaturesTabContent from './modals/AIFeaturesTabContent';
import ImportTabContent from './modals/ImportTabContent';

interface InsertBlocksModalProps {
  open: boolean;
  onClose: () => void;
  onSelectBlock: (blockId: string) => void;
  onSelectTemplate: (templateId: string) => void;
  onSelectDynamicContent?: () => void;  
  onSelectAIAssistant?: () => void;     
}

const InsertBlocksModal = ({ 
  open, 
  onClose, 
  onSelectBlock, 
  onSelectTemplate,
  onSelectDynamicContent,
  onSelectAIAssistant 
}: InsertBlocksModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const { toast } = useToast();

  // Search functionality
  const filteredBlocks = searchQuery
    ? searchBlocks(searchQuery)
    : [];

  const filteredTemplates = searchQuery
    ? documentTemplates.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Event handlers
  const handleSelectBlock = useCallback((blockId: string) => {
    console.log("Block selected in modal:", blockId);
    logBlockSelection(blockId);
    
    toast({
      title: "Block selected",
      description: `Block ID: ${blockId}`,
    });
    
    onSelectBlock(blockId);
  }, [onSelectBlock, toast]);
  
  const handleSelectTemplate = useCallback((template: DocumentTemplate) => {
    console.log("Template selected:", template.id);
    
    toast({
      title: "Template selected",
      description: `Template: ${template.name}`,
    });
    
    onSelectTemplate(template.id);
  }, [onSelectTemplate, toast]);
  
  const handleDynamicContentClick = useCallback(() => {
    console.log("Dynamic content selected");
    toast({
      title: "Dynamic Content",
      description: "Opening dynamic content editor",
    });
    
    if (onSelectDynamicContent) {
      onSelectDynamicContent();
    }
  }, [onSelectDynamicContent, toast]);
  
  const handleAIAssistantClick = useCallback(() => {
    console.log("AI Assistant selected");
    toast({
      title: "AI Assistant",
      description: "Opening AI Assistant configuration",
    });
    
    if (onSelectAIAssistant) {
      onSelectAIAssistant();
    }
  }, [onSelectAIAssistant, toast]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="py-2">
          <h2 className="text-3xl font-bold mb-6">Insert</h2>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Try typing 'project tracker'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Create in <span className="font-medium">Wugweb</span> &gt; <span className="text-blue-500">My docs</span></p>
            <Button variant="outline" className="w-full justify-start text-gray-700" onClick={() => handleSelectBlock('blank')}>
              <Plus className="h-4 w-4 mr-2" />
              Start blank doc
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="building">Building blocks</TabsTrigger>
              <TabsTrigger value="dynamic">Dynamic content</TabsTrigger>
              <TabsTrigger value="ai-features">AI Features</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates">
              <TemplatesTabContent
                onSelectTemplate={handleSelectTemplate}
              />
            </TabsContent>
            
            <TabsContent value="building">
              <BuildingBlocksTabContent 
                handleSelectBlock={handleSelectBlock}
              />
            </TabsContent>
            
            <TabsContent value="dynamic">
              <DynamicContentTabContent 
                handleDynamicContentClick={handleDynamicContentClick}
                handleAIAssistantClick={handleAIAssistantClick}
              />
            </TabsContent>
            
            <TabsContent value="ai-features">
              <AIFeaturesTabContent 
                handleAIAssistantClick={handleAIAssistantClick}
                onSelectAIAssistant={onSelectAIAssistant}
              />
            </TabsContent>
            
            <TabsContent value="import">
              <ImportTabContent />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsertBlocksModal;
