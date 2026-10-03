
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { curatedTemplates } from './data/CuratedTemplates';
import TemplatePreview from './TemplatePreview';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Grid, List, ExternalLink } from 'lucide-react';

const TemplateTestView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredTemplates = searchQuery
    ? curatedTemplates.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : curatedTemplates;

  const categories = [...new Set(curatedTemplates.map(t => t.category))];

  const handleUseTemplate = (templateId: string) => {
    const template = curatedTemplates.find(t => t.id === templateId);
    if (template) {
      toast({
        title: "Template Applied",
        description: `${template.name} template has been loaded successfully.`,
      });
      console.log("Template applied:", template);
    }
  };

  const handlePreviewTemplate = (template: any) => {
    navigate(`/template/${template.id}`);
  };

  const renderTemplateCard = (template: any) => (
    <Card key={template.id} className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{template.icon}</div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
          <Badge variant="secondary">{template.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">
            {template.content?.sections?.length || 0} sections • {template.popularityScore}% popularity
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => handleUseTemplate(template.id)}
          >
            Use Template
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handlePreviewTemplate(template)}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Library Test</h1>
          <p className="text-gray-600 mt-2">
            Testing all {curatedTemplates.length} pre-designed templates with full layouts and content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{curatedTemplates.length}</div>
            <div className="text-sm text-gray-600">Total Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {curatedTemplates.reduce((acc, t) => acc + (t.content?.sections?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Sections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{filteredTemplates.length}</div>
            <div className="text-sm text-gray-600">Filtered Results</div>
          </CardContent>
        </Card>
      </div>

      {/* Templates by Category */}
      <Tabs defaultValue="all">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md">
                  <div className="flex p-4">
                    <div className="text-2xl mr-4 pt-1">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{template.name}</h3>
                      <p className="text-gray-500 text-sm">{template.description}</p>
                      <div className="flex mt-2 items-center justify-between">
                        <Badge variant="outline">{template.category}</Badge>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleUseTemplate(template.id)}
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {categories.map(category => (
          <TabsContent key={category} value={category}>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates
                  .filter(template => template.category === category)
                  .map(renderTemplateCard)}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates
                  .filter(template => template.category === category)
                  .map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md">
                      <div className="flex p-4">
                        <div className="text-2xl mr-4 pt-1">{template.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{template.name}</h3>
                          <p className="text-gray-500 text-sm">{template.description}</p>
                          <div className="flex mt-2 items-center justify-between">
                            <Badge variant="outline">{template.category}</Badge>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePreviewTemplate(template)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleUseTemplate(template.id)}
                              >
                                Use
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TemplateTestView;
