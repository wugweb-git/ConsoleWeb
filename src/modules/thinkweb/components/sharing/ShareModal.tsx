
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { shareDocument } from '../../services/documentService';
import { Copy, Mail, Users } from 'lucide-react';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

const ShareModal = ({ open, onClose, documentId, documentTitle }: ShareModalProps) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    try {
      await shareDocument({
        document_id: documentId,
        shared_with_email: email,
        permission
      });
      
      toast({
        title: "Document shared",
        description: `Document shared with ${email} with ${permission} access`
      });
      
      setEmail('');
      setPermission('view');
      onClose();
    } catch (error) {
      console.error('Error sharing document:', error);
      toast({
        title: "Error",
        description: "Failed to share document",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/doc/${documentId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "Document link copied to clipboard"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share "{documentTitle}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick copy link */}
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={`${window.location.origin}/doc/${documentId}`}
                readOnly
                className="h-9"
              />
            </div>
            <Button type="button" size="sm" className="px-3" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Share with specific person */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Invite specific people
              </h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="permission">Permission</Label>
                  <Select value={permission} onValueChange={(value: 'view' | 'edit') => setPermission(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">Can view</SelectItem>
                      <SelectItem value="edit">Can edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleShare} 
                  disabled={isSharing || !email}
                  className="w-full"
                >
                  {isSharing ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
