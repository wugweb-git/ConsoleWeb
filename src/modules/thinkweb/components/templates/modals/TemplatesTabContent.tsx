
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { curatedTemplates } from '../data/CuratedTemplates';
import { DocumentTemplate } from '../types/TemplateTypes';

interface TemplatesTabContentProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
}

const TemplatesTabContent = ({ onSelectTemplate }: TemplatesTabContentProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [...new Set(curatedTemplates.map(t => t.category))];

  const filteredTemplates = selectedCategory === 'all' 
    ? curatedTemplates 
    : curatedTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          size="sm"
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            size="sm"
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{template.icon}</span>
                  <div>
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <p className="text-xs text-gray-600">{template.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                size="sm"
                className="w-full"
                onClick={() => onSelectTemplate(template)}
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplatesTabContent;
