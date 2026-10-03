
import { Button } from '../../../components/ui/button';
import { BrainCircuit, FileText, BarChart, MessageCircle, SplitSquareVertical } from 'lucide-react';

interface AIFeaturesTabContentProps {
  handleAIAssistantClick: () => void;
  onSelectAIAssistant: (() => void) | undefined;
}

const AIFeaturesTabContent = ({
  handleAIAssistantClick,
  onSelectAIAssistant
}: AIFeaturesTabContentProps) => {
  const aiFeatures = [
    {
      id: 'summarize',
      name: 'Smart Summarization',
      icon: <FileText className="h-4 w-4" />,
      description: 'Automatically generate summaries of your content with AI'
    },
    {
      id: 'chart-generator',
      name: 'Data Visualization',
      icon: <BarChart className="h-4 w-4" />,
      description: 'Create charts and graphs from your data with AI assistance'
    },
    {
      id: 'content-enhancer',
      name: 'Content Enhancement',
      icon: <MessageCircle className="h-4 w-4" />,
      description: 'Improve your writing with AI-powered suggestions'
    },
    {
      id: 'structure-generator',
      name: 'Structure Generator',
      icon: <SplitSquareVertical className="h-4 w-4" />,
      description: 'Generate document structures and outlines using AI'
    }
  ];

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">AI-Powered Document Features</h3>
        <p className="text-gray-600 text-sm mb-4">
          Enhance your document with intelligent features powered by your connected AI assistant.
          All changes made by AI are automatically tracked in your document's version history.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {aiFeatures.map((feature) => (
            <div 
              key={feature.id}
              className="border rounded-md p-4 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
              onClick={handleAIAssistantClick}
            >
              <div className="flex items-center mb-2">
                <div className="bg-purple-100 p-2 rounded-md text-purple-700 mr-3">
                  {feature.icon}
                </div>
                <h3 className="font-medium">{feature.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
        <div className="flex items-start">
          <BrainCircuit className="h-5 w-5 text-purple-700 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-800">Your AI Assistant</h4>
            <p className="text-sm text-purple-700 mt-1">
              {!onSelectAIAssistant ? 
                "Connect your AI assistant to unlock all AI-powered features and capabilities." :
                "Your AI assistant is ready to help enhance your document with intelligent features."
              }
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-2 bg-purple-100 hover:bg-purple-200 border border-purple-300"
              onClick={handleAIAssistantClick}
            >
              {!onSelectAIAssistant ? 
                "Connect AI Assistant" :
                "Manage AI Assistant Settings"
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIFeaturesTabContent;
