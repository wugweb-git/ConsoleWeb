
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'grok' | 'mistral';

interface AIContextType {
  activeProvider: AIProvider | null;
  setActiveProvider: (provider: AIProvider) => void;
  providers: Record<AIProvider, {
    connected: boolean;
    model: string;
  }>;
  saveProviderKey: (provider: AIProvider, key: string, model: string) => void;
  isGenerating: boolean;
  setIsGenerating: (state: boolean) => void;
  aiGeneratedContent: Record<string, string>;
  setAIGeneratedContent: (id: string, content: string) => void;
  generateText: (prompt: string, options?: any) => Promise<string>;
  getVersionSnapshot: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<AIProvider | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [providers, setProviders] = useState<Record<AIProvider, { connected: boolean; model: string }>>({
    openai: { connected: false, model: 'gpt-4o' },
    gemini: { connected: false, model: 'gemini-2.0-flash-exp' },
    anthropic: { connected: false, model: 'claude-opus-4-20250514' },
    grok: { connected: false, model: 'grok-2-1212' },
    mistral: { connected: false, model: 'mistral-large-2411' },
  });
  const [aiGeneratedContent, setAIGeneratedContentState] = useState<Record<string, string>>({});

  // Load saved API keys and provider configuration from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem('activeAIProvider');
    if (savedProvider) {
      setActiveProvider(savedProvider as AIProvider);
    }
    
    const savedProviders = localStorage.getItem('aiProviders');
    if (savedProviders) {
      setProviders(JSON.parse(savedProviders));
    }
  }, []);

  const saveProviderKey = (provider: AIProvider, key: string, model: string) => {
    // In a real application, store the key securely using something like
    // window.crypto or a secure storage solution
    localStorage.setItem(`${provider}_key`, key);
    
    const updatedProviders = {
      ...providers,
      [provider]: {
        connected: true,
        model
      }
    };
    
    setProviders(updatedProviders);
    localStorage.setItem('activeAIProvider', provider);
    localStorage.setItem('aiProviders', JSON.stringify(updatedProviders));
  };
  
  const setAIGeneratedContent = (id: string, content: string) => {
    setAIGeneratedContentState(prev => ({
      ...prev,
      [id]: content
    }));
    
    // Take a version snapshot after AI-generated content is added
    getVersionSnapshot();
  };
  
  const generateText = async (prompt: string, options = {}): Promise<string> => {
    if (!activeProvider) {
      throw new Error("No AI provider selected");
    }
    
    const apiKey = localStorage.getItem(`${activeProvider}_key`);
    if (!apiKey) {
      throw new Error("API key not found for the selected provider");
    }
    
    setIsGenerating(true);
    
    try {
      // This is a simplified implementation
      // In a real app, you would make an actual API call to the selected provider
      let response = "";
      
      switch (activeProvider) {
        case 'openai':
          response = await mockOpenAICall(apiKey, prompt, providers.openai.model);
          break;
        case 'gemini':
          response = await mockGeminiCall(apiKey, prompt, providers.gemini.model);
          break;
        case 'anthropic':
          response = await mockAnthropicCall(apiKey, prompt, providers.anthropic.model);
          break;
        case 'grok':
          response = await mockGrokCall(apiKey, prompt, providers.grok.model);
          break;
        case 'mistral':
          response = await mockMistralCall(apiKey, prompt, providers.mistral.model);
          break;
        default:
          throw new Error("Unsupported AI provider");
      }
      
      return response;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Mock API calls (replace with actual implementations in a real app)
  const mockOpenAICall = async (apiKey: string, prompt: string, model: string): Promise<string> => {
    console.log(`Mock OpenAI API call with ${model}: ${prompt.substring(0, 50)}...`);
    return `This is a simulated response from OpenAI's ${model} for: "${prompt.substring(0, 20)}..."`;
  };
  
  const mockGeminiCall = async (apiKey: string, prompt: string, model: string): Promise<string> => {
    console.log(`Mock Gemini API call with ${model}: ${prompt.substring(0, 50)}...`);
    return `This is a simulated response from Google's ${model} for: "${prompt.substring(0, 20)}..."`;
  };
  
  const mockAnthropicCall = async (apiKey: string, prompt: string, model: string): Promise<string> => {
    console.log(`Mock Anthropic API call with ${model}: ${prompt.substring(0, 50)}...`);
    return `This is a simulated response from Anthropic's ${model} for: "${prompt.substring(0, 20)}..."`;
  };
  
  const mockGrokCall = async (apiKey: string, prompt: string, model: string): Promise<string> => {
    console.log(`Mock Grok API call with ${model}: ${prompt.substring(0, 50)}...`);
    return `This is a simulated response from ${model} for: "${prompt.substring(0, 20)}..."`;
  };
  
  const mockMistralCall = async (apiKey: string, prompt: string, model: string): Promise<string> => {
    console.log(`Mock Mistral API call with ${model}: ${prompt.substring(0, 50)}...`);
    return `This is a simulated response from Mistral's ${model} for: "${prompt.substring(0, 20)}..."`;
  };
  
  // Version control related functions
  const getVersionSnapshot = async () => {
    // In a real implementation, this would:
    // 1. Create a snapshot of the current document state
    // 2. Store it in a version history system
    // 3. Allow for comparison and reverting
    console.log("Creating version snapshot after AI-generated content added");
    
    // Mock implementation
    const timestamp = new Date().toISOString();
    const versionHistory = JSON.parse(localStorage.getItem('versionHistory') || '[]');
    versionHistory.push({
      timestamp,
      type: 'ai_modification',
      aiProvider: activeProvider
    });
    localStorage.setItem('versionHistory', JSON.stringify(versionHistory));
  };

  return (
    <AIContext.Provider value={{
      activeProvider,
      setActiveProvider,
      providers,
      saveProviderKey,
      isGenerating,
      setIsGenerating,
      aiGeneratedContent,
      setAIGeneratedContent,
      generateText,
      getVersionSnapshot
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};
