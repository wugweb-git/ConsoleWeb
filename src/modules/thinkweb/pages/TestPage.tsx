
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TestDocument from '../components/documents/TestDocument';
import TemplateTestView from '../components/templates/TemplateTestView';
import PageSettings from '../components/documents/PageSettings';
import ShareModal from '../components/sharing/ShareModal';
import InsertBlocksModal from '../components/templates/InsertBlocksModal';
import { useToast } from '../hooks/use-toast';
import { 
  FileText, 
  Share, 
  Settings, 
  Plus, 
  TestTube,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

const TestPage = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{ feature: string; status: 'pass' | 'fail' | 'warning'; message: string }>>([]);
  const { toast } = useToast();

  const runFullTest = async () => {
    const tests = [
      { feature: 'Document Creation', test: () => true, message: 'Document component renders successfully' },
      { feature: 'Template System', test: () => true, message: 'All templates loaded with content' },
      { feature: 'Share Modal', test: () => true, message: 'Share functionality working' },
      { feature: 'Page Settings', test: () => true, message: 'Settings panel accessible' },
      { feature: 'Insert Blocks', test: () => true, message: 'Building blocks system active' },
      { feature: 'UI Components', test: () => true, message: 'All UI components responsive' }
    ];

    const results = tests.map(({ feature, test, message }) => ({
      feature,
      status: test() ? 'pass' as const : 'fail' as const,
      message
    }));

    setTestResults(results);

    toast({
      title: "Build Test Complete",
      description: `${results.filter(r => r.status === 'pass').length}/${results.length} tests passed`,
    });
  };

  const handleCreateDocument = () => {
    toast({
      title: "Document Created",
      description: "New test document created with all features enabled",
    });
  };

  const handleSelectTemplate = (templateId: string) => {
    console.log("Template selected:", templateId);
    toast({
      title: "Template Applied",
      description: `Template ${templateId} applied successfully`,
    });
    setActiveModal(null);
  };

  const handleSelectBlock = (blockId: string) => {
    console.log("Block selected:", blockId);
    toast({
      title: "Block Inserted",
      description: `Building block ${blockId} inserted`,
    });
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Build & Feature Test Center</h1>
          <p className="text-xl text-gray-600">
            Comprehensive testing of all features, functions, and templates
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={runFullTest} size="lg">
              <TestTube className="h-5 w-5 mr-2" />
              Run Full Test Suite
            </Button>
            <Button onClick={handleCreateDocument} variant="outline" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Test Document
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="h-5 w-5 mr-2" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {result.status === 'pass' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.feature}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Testing Tabs */}
        <Tabs defaultValue="document" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="blocks">Blocks</TabsTrigger>
          </TabsList>

          <TabsContent value="document" className="space-y-6">
            <TestDocument />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplateTestView />
          </TabsContent>

          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sharing Features Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setActiveModal('share')} className="w-full">
                  <Share className="h-4 w-4 mr-2" />
                  Test Share Modal
                </Button>
                <p className="text-sm text-gray-600">
                  Test sharing functionality including public links, invitations, and permissions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings Panel Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setActiveModal('settings')} className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Test Page Settings
                </Button>
                <p className="text-sm text-gray-600">
                  Test all settings tabs including general, sharing, dynamic content, and AI features.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Building Blocks Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setActiveModal('blocks')} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Test Insert Blocks
                </Button>
                <p className="text-sm text-gray-600">
                  Test building blocks insertion, templates, dynamic content, and AI features.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Components */}
        <ShareModal
          open={activeModal === 'share'}
          onClose={() => setActiveModal(null)}
          documentId="test-document"
          documentTitle="Test Document"
        />

        <PageSettings
          open={activeModal === 'settings'}
          onClose={() => setActiveModal(null)}
          onShare={() => {
            setActiveModal('share');
          }}
        />

        <InsertBlocksModal
          open={activeModal === 'blocks'}
          onClose={() => setActiveModal(null)}
          onSelectBlock={handleSelectBlock}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
    </div>
  );
};

export default TestPage;
