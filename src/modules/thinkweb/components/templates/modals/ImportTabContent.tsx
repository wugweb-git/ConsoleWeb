
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { File, Link, FileText, Table, Presentation } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { googleIntegrationService } from '../../../services/googleIntegrationService';

const ImportTabContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showGoogleImport, setShowGoogleImport] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    // Simulate file processing
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "File imported",
        description: `Successfully imported ${file.name}`,
      });
    }, 1500);
  };

  const handleUrlImport = () => {
    if (!importUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate URL import processing
    setTimeout(() => {
      setIsLoading(false);
      setImportUrl('');
      setShowUrlInput(false);
      toast({
        title: "Content imported",
        description: `Successfully imported content from URL`,
      });
    }, 1500);
  };

  const handleGoogleConnect = async () => {
    setIsLoading(true);
    try {
      const success = await googleIntegrationService.signIn();
      if (success) {
        setShowGoogleImport(true);
        toast({
          title: "Connected to Google",
          description: "You can now import from Google Workspace"
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Failed to connect to Google. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "Please configure Google integration in Settings first",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center py-10">
      <h3 className="text-lg font-medium mb-1">Import content</h3>
      <p className="text-gray-500 mb-4">Import from various sources to get started quickly.</p>
      
      <div className="space-y-4">
        {/* File Upload */}
        <div className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            disabled={isLoading}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.docx,.doc,.txt,.md,.pdf';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                  handleFileUpload({ target } as React.ChangeEvent<HTMLInputElement>);
                }
              };
              input.click();
            }}
          >
            <File className="h-4 w-4 mr-2" />
            Upload file
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={isLoading}
          >
            <Link className="h-4 w-4 mr-2" />
            URL
          </Button>
        </div>

        {/* Google Workspace Import */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3 text-gray-700">Import from Google Workspace</h4>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGoogleConnect}
              disabled={isLoading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Google Docs
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGoogleConnect}
              disabled={isLoading}
            >
              <Table className="h-4 w-4 mr-2" />
              Google Sheets
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGoogleConnect}
              disabled={isLoading}
            >
              <Presentation className="h-4 w-4 mr-2" />
              Google Slides
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Connect to Google in Settings to enable import from Google Workspace
          </p>
        </div>

        {showUrlInput && (
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Enter URL to import content"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <Button 
                size="sm" 
                onClick={handleUrlImport}
                disabled={isLoading}
              >
                Import
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: Google Docs, Medium, WordPress, etc.
            </p>
          </div>
        )}
        
        {isLoading && (
          <div className="mt-4">
            <div className="animate-pulse flex items-center justify-center">
              <div className="h-2 w-24 bg-gray-300 rounded"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Processing import...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportTabContent;
