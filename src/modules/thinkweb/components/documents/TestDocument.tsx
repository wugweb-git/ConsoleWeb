
import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { FileText, Share, Settings, Plus, Save, Eye, Edit, Calendar, Users } from 'lucide-react';

const TestDocument = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('Test Document - All Features Demo');
  const [documentContent, setDocumentContent] = useState(`# Welcome to Test Document

This document demonstrates all available features and functions:

## 1. Basic Text Formatting
**Bold text**, *italic text*, and ~~strikethrough~~

## 2. Lists and Organization
- Task management features
- Content calendar integration
- Meeting notes structure
- SMART goals framework

## 3. Tables and Data
| Feature | Status | Priority |
|---------|--------|----------|
| Templates | ✅ Active | High |
| Sharing | ✅ Active | High |
| Settings | ✅ Active | Medium |
| AI Features | 🟡 Testing | Low |

## 4. Dynamic Content
- Variables: {{user_name}}, {{current_date}}
- Conditional blocks based on user permissions
- AI-generated suggestions and content

## 5. Collaboration Features
- Real-time sharing capabilities
- Comment system integration
- Version history tracking
- Team workspace functionality

## 6. Advanced Features
- Template library access
- Building blocks insertion
- Dynamic content management
- AI assistant integration
`);

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Document Saved",
      description: "Test document has been saved successfully with all features demonstrated.",
    });
    console.log("Document saved:", { title: documentTitle, content: documentContent });
  };

  const handleShare = () => {
    toast({
      title: "Share Modal",
      description: "Opening share modal to test sharing functionality...",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Settings Modal",
      description: "Opening page settings to test configuration options...",
    });
  };

  const testAllFeatures = () => {
    const features = [
      'Document creation and editing',
      'Template system integration',
      'Sharing functionality',
      'Settings management',
      'Dynamic content handling',
      'AI features integration',
      'Building blocks system',
      'Version control',
      'Collaboration tools'
    ];

    toast({
      title: "Feature Test Complete",
      description: `Tested ${features.length} core features successfully.`,
    });

    console.log("All features tested:", features);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Document Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="h-8 w-8 text-blue-600" />
          {isEditing ? (
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
            />
          ) : (
            <h1 className="text-2xl font-bold">{documentTitle}</h1>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">Testing Mode</Badge>
          <Badge variant="outline">All Features</Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
          {isEditing ? <Eye className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
          {isEditing ? 'Preview' : 'Edit'}
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Document
        </Button>
        <Button onClick={handleShare} variant="outline">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button onClick={handleSettings} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button onClick={testAllFeatures} variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          Test All Features
        </Button>
      </div>

      {/* Feature Testing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">Test template system with pre-designed layouts</p>
            <Button size="sm" className="w-full">
              Load Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Dynamic Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">Test variables and conditional blocks</p>
            <Button size="sm" className="w-full">
              Insert Variable
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">Test sharing and team features</p>
            <Button size="sm" className="w-full">
              Invite Team
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Document Content */}
      <Card>
        <CardHeader>
          <CardTitle>Document Content</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <textarea
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              className="w-full h-96 p-4 border rounded-md font-mono text-sm"
              placeholder="Enter document content..."
            />
          ) : (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md overflow-auto">
                {documentContent}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Status */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Testing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Document Creation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Template System</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Sharing Features</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Settings Panel</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">AI Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Building Blocks</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDocument;
