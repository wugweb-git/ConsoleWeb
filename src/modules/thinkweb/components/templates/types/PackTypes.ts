
// Define types for template packs and building blocks
export interface TemplatePack {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  popularity: number;
  blocks: string[];
  provider?: string;
}

// Building block types for better organization
export type BlockCategory = 
  | 'text-media' 
  | 'table-views' 
  | 'charts' 
  | 'controls' 
  | 'layout' 
  | 'interactive'
  | 'external';

export interface BuildingBlock {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: BlockCategory;
  isNew?: boolean;
  isPopular?: boolean;
}
