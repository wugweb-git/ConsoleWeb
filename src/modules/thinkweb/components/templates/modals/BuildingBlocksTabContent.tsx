
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { BuildingBlock } from '../types/PackTypes';
import { getBlocksByCategory } from '../utils/BuildingBlockUtils';

interface BuildingBlocksTabContentProps {
  handleSelectBlock: (blockId: string) => void;
}

const BuildingBlocksTabContent = ({ handleSelectBlock }: BuildingBlocksTabContentProps) => {
  const [activeCategoryBuilding, setActiveCategoryBuilding] = useState('text-media');
  
  const textMediaBlocks = getBlocksByCategory('text-media');
  const tableViewsBlocks = getBlocksByCategory('table-views');
  const chartsBlocks = getBlocksByCategory('charts');
  const controlsBlocks = getBlocksByCategory('controls');
  const layoutBlocks = getBlocksByCategory('layout');
  const interactiveBlocks = getBlocksByCategory('interactive');
  
  const handleCategoryChange = (value: string) => {
    console.log("Category changed to:", value);
    setActiveCategoryBuilding(value);
  };
  
  const renderBlockItem = (block: BuildingBlock) => (
    <div 
      key={block.id}
      className="flex items-center px-3 py-3 hover:bg-gray-100 rounded-md cursor-pointer transition"
      onClick={() => handleSelectBlock(block.id)}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md mr-4">
        <div className="text-xl">{block.icon}</div>
      </div>
      <span>{block.name}</span>
      {block.isNew && (
        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
          New
        </span>
      )}
    </div>
  );

  return (
    <Tabs value={activeCategoryBuilding} onValueChange={handleCategoryChange}>
      <TabsList className="mb-4 flex flex-wrap gap-2">
        <TabsTrigger value="text-media" className="rounded-full px-4">Text & media</TabsTrigger>
        <TabsTrigger value="table-views" className="rounded-full px-4">Table & views</TabsTrigger>
        <TabsTrigger value="charts" className="rounded-full px-4">Charts</TabsTrigger>
        <TabsTrigger value="controls" className="rounded-full px-4">Controls</TabsTrigger>
        <TabsTrigger value="layout" className="rounded-full px-4">Layout</TabsTrigger>
        <TabsTrigger value="interactive" className="rounded-full px-4">Interactive</TabsTrigger>
      </TabsList>
      
      <TabsContent value="text-media">
        <div className="space-y-1">
          {textMediaBlocks.map(renderBlockItem)}
        </div>
      </TabsContent>
      
      <TabsContent value="table-views">
        <div className="space-y-1">
          {tableViewsBlocks.map(renderBlockItem)}
        </div>
      </TabsContent>
      
      <TabsContent value="charts">
        <div className="space-y-1">
          {chartsBlocks.map(renderBlockItem)}
        </div>
      </TabsContent>
      
      <TabsContent value="controls">
        <div className="space-y-1">
          {controlsBlocks.map(renderBlockItem)}
        </div>
      </TabsContent>
      
      <TabsContent value="layout">
        <div className="space-y-1">
          {layoutBlocks.map(renderBlockItem)}
        </div>
      </TabsContent>
      
      <TabsContent value="interactive">
        <div className="space-y-1">
          {interactiveBlocks.map(renderBlockItem)}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BuildingBlocksTabContent;
