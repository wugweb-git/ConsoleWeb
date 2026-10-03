
import { BuildingBlock, BlockCategory } from '../types/PackTypes';
import { buildingBlocks } from '../data/BuildingBlocks';

export { buildingBlocks };

/**
 * Get blocks by category
 */
export const getBlocksByCategory = (category: BlockCategory): BuildingBlock[] => {
  console.log(`Getting blocks for category: ${category}`);
  const blocks = buildingBlocks.filter(block => block.category === category);
  console.log(`Found ${blocks.length} blocks for category ${category}`);
  return blocks;
};

/**
 * Get popular blocks
 */
export const getPopularBlocks = (limit: number = 6): BuildingBlock[] => {
  console.log(`Getting popular blocks, limit: ${limit}`);
  const popular = buildingBlocks.filter(block => block.isPopular);
  console.log(`Found ${popular.length} popular blocks`);
  return popular.slice(0, limit);
};

/**
 * Get new blocks
 */
export const getNewBlocks = (): BuildingBlock[] => {
  console.log("Getting new blocks");
  const newBlocks = buildingBlocks.filter(block => block.isNew || false);
  console.log(`Found ${newBlocks.length} new blocks`);
  return newBlocks;
};

/**
 * Search blocks by query
 */
export const searchBlocks = (query: string): BuildingBlock[] => {
  console.log(`Searching blocks with query: ${query}`);
  if (!query || query.trim() === '') {
    return [];
  }
  
  const searchTerm = query.toLowerCase();
  const results = buildingBlocks.filter(block => 
    block.name.toLowerCase().includes(searchTerm) || 
    block.description.toLowerCase().includes(searchTerm)
  );
  
  console.log(`Found ${results.length} blocks matching search query: "${query}"`);
  return results;
};

/**
 * Get a block by id
 */
export const getBlockById = (id: string): BuildingBlock | undefined => {
  console.log(`Getting block by ID: ${id}`);
  const block = buildingBlocks.find(block => block.id === id);
  if (block) {
    console.log("Block found:", block.name);
  } else {
    console.log(`Block with ID ${id} not found`);
  }
  return block;
};

/**
 * Get blocks by usage
 */
export const getBlocksByUsage = (usageType: 'popular' | 'new' | 'recent'): BuildingBlock[] => {
  console.log(`Getting blocks by usage type: ${usageType}`);
  
  switch (usageType) {
    case 'popular':
      return getPopularBlocks();
    case 'new':
      return getNewBlocks();
    case 'recent':
      // This would typically pull from user history in a real app
      return buildingBlocks.slice(0, 5);
    default:
      return [];
  }
};

/**
 * Get blocks by multiple categories
 */
export const getBlocksByCategories = (categories: BlockCategory[]): BuildingBlock[] => {
  console.log(`Getting blocks for categories: ${categories.join(', ')}`);
  
  const results = buildingBlocks.filter(block => categories.includes(block.category));
  console.log(`Found ${results.length} blocks across specified categories`);
  
  return results;
};

/**
 * Debug function to log block selection
 */
export const logBlockSelection = (blockId: string): void => {
  console.log("Block selected:", blockId);
  const block = getBlockById(blockId);
  console.log("Block details:", block);
};
