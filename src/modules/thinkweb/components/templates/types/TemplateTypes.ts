
// Template types and interfaces
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  popularityScore: number;
  tags?: string[];
  difficulty?: string;
  estimatedTime?: string;
  previewImage?: string;
  content?: {
    title: string;
    sections: {
      title: string;
      content: string;
    }[];
  };
}

// Export so it can be imported by other files
export type TemplateCategory = string;

// Interface for template with expanded capabilities
export interface EnhancedTemplate extends DocumentTemplate {
  createdBy?: string;
  lastModified?: Date;
  usageCount?: number;
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  estimatedCompletionTime?: string; // e.g. "30 minutes"
}
