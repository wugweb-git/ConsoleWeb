
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { DocumentTemplate } from './types/TemplateTypes';
import { Eye, FileText, Users, Calendar, Target } from 'lucide-react';

interface TemplatePreviewProps {
  template: DocumentTemplate;
  onUse: (templateId: string) => void;
  onPreview?: (template: DocumentTemplate) => void;
}

const TemplatePreview = ({ template, onUse, onPreview }: TemplatePreviewProps) => {
  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'meetings':
        return <Users className="h-5 w-5" />;
      case 'marketing':
        return <Calendar className="h-5 w-5" />;
      case 'productivity':
        return <Target className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const previewContent = template.content?.sections?.slice(0, 2).map(section => ({
    title: section.title,
    preview: section.content.substring(0, 100) + (section.content.length > 100 ? '...' : '')
  })) || [];

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getIconForCategory(template.category)}
            </div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
          <Badge variant="secondary">{template.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Template Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-3">Preview Content:</h4>
          {previewContent.length > 0 ? (
            <div className="space-y-2">
              {previewContent.map((section, index) => (
                <div key={index} className="text-xs">
                  <div className="font-medium text-gray-800">{section.title}</div>
                  <div className="text-gray-600 mt-1">{section.preview}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Basic template structure with customizable content sections.
            </div>
          )}
        </div>

        {/* Template Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Popularity: {template.popularityScore}/100</span>
          <span>{template.content?.sections?.length || 0} sections</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onUse(template.id)}
          >
            Use Template
          </Button>
          {onPreview && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onPreview(template)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;
