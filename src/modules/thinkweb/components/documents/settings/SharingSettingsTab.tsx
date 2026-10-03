
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge';
import { Share, Globe, Users, Shield, Link as LinkIcon, Eye, Lock, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useState } from 'react';

interface SharingSettingsTabProps {
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
  onShare: () => void;
}

const SharingSettingsTab = ({
  isPublic,
  setIsPublic,
  onShare
}: SharingSettingsTabProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleSaveSettings = () => {
    console.log("Saving sharing settings:", {
      isPublic
    });
    
    toast({
      title: "Settings updated",
      description: "Sharing settings have been saved successfully.",
    });
  };

  const handlePublicToggle = (checked: boolean) => {
    console.log("Changing isPublic to:", checked);
    setIsPublic(checked);
    
    if (checked) {
      toast({
        title: "Public access enabled",
        description: "Anyone with the link can now view this document",
      });
    } else {
      toast({
        title: "Public access disabled", 
        description: "This document is now private",
      });
    }
  };

  const handleCopyLink = async () => {
    if (!isPublic) {
      toast({
        title: "Public access required",
        description: "Enable public access first to copy the link",
        variant: "destructive"
      });
      return;
    }

    try {
      const shareUrl = `${window.location.origin}/doc/${window.location.pathname.split('/').pop()}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The document link has been copied to your clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Sharing Status</h3>
          <Badge variant={isPublic ? "default" : "secondary"} className="flex items-center">
            {isPublic ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Private
              </>
            )}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          {isPublic 
            ? 'This document can be accessed by anyone with the link'
            : 'This document is private and only accessible to invited users'
          }
        </p>
      </div>

      {/* Public Access Control */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Access Control
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Control who can access this document and how they can find it
          </p>
        </div>
        
        <div className="space-y-3">
          {/* Public Link Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              {isPublic ? (
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div>
                <Label htmlFor="public-access" className="font-medium cursor-pointer">
                  Public Link Access
                </Label>
                <p className="text-sm text-gray-500">
                  {isPublic 
                    ? 'Anyone with the link can view this document' 
                    : 'Only invited people can access this document'
                  }
                </p>
              </div>
            </div>
            <Switch 
              id="public-access" 
              checked={isPublic} 
              onCheckedChange={handlePublicToggle}
            />
          </div>

          {/* Link Preview */}
          {isPublic && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <LinkIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800 truncate font-mono">
                    {`${window.location.origin}/doc/${window.location.pathname.split('/').pop()}`}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyLink}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 ml-2"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Collaboration Tools
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Advanced sharing options and team collaboration features
          </p>
        </div>

        <div className="grid gap-3">
          <Button 
            variant="outline" 
            className="justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-200 transition-colors" 
            onClick={() => {
              console.log("Advanced share button clicked");
              onShare();
            }}
          >
            <div className="flex items-start space-x-3 w-full">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Share className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Advanced Sharing</div>
                <div className="text-sm text-gray-500 mt-1">
                  Invite people, manage permissions, create embed codes, and publish to web
                </div>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto p-4 hover:bg-gray-50 transition-colors"
            onClick={handleCopyLink}
            disabled={!isPublic}
          >
            <div className="flex items-start space-x-3 w-full">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isPublic ? 'bg-gray-100' : 'bg-gray-50'
              }`}>
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <LinkIcon className={`w-5 h-5 ${isPublic ? 'text-gray-600' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="text-left flex-1">
                <div className={`font-medium ${isPublic ? 'text-gray-900' : 'text-gray-500'}`}>
                  Quick Copy Link
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {isPublic ? 'Copy shareable link to clipboard' : 'Requires public access to be enabled'}
                </div>
              </div>
            </div>
          </Button>
        </div>
      </div>
      
      <Separator />

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="min-w-[120px]">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default SharingSettingsTab;
