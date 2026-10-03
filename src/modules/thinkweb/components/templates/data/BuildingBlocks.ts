
import { BuildingBlock, BlockCategory } from '../types/PackTypes';

// Building blocks as shown in the reference
export const buildingBlocks: BuildingBlock[] = [
  // Text & Media
  {
    id: 'text',
    name: 'Text',
    icon: '📝',
    description: 'Regular text block with formatting options',
    category: 'text-media',
    isPopular: true
  },
  {
    id: 'callout',
    name: 'Callout',
    icon: '📢',
    description: 'Highlighted text with an icon',
    category: 'text-media'
  },
  {
    id: 'image',
    name: 'Image',
    icon: '🖼️',
    description: 'Upload or embed images',
    category: 'text-media',
    isPopular: true
  },
  {
    id: 'grid',
    name: 'Grid',
    icon: '📊',
    description: 'Arrange content in a grid layout',
    category: 'layout'
  },
  {
    id: 'columns-3',
    name: '3 columns',
    icon: '🔲',
    description: 'Three-column layout',
    category: 'layout'
  },
  {
    id: 'checklist',
    name: 'Checklist',
    icon: '✓',
    description: 'List with checkboxes',
    category: 'interactive',
    isPopular: true
  },
  {
    id: 'line-separator',
    name: 'Line separator',
    icon: '—',
    description: 'Visual divider between content',
    category: 'layout'
  },
  {
    id: 'block-quote',
    name: 'Block quote',
    icon: '❝',
    description: 'Formatted block quotation',
    category: 'text-media'
  },
  {
    id: 'pull-quote',
    name: 'Pull quote',
    icon: '❞',
    description: 'Highlighted quotation that stands out',
    category: 'text-media'
  },
  {
    id: 'code-block',
    name: 'Code block',
    icon: '</>',
    description: 'Display formatted code with syntax highlighting',
    category: 'text-media'
  },
  {
    id: 'link',
    name: 'Link',
    icon: '🔗',
    description: 'Insert hyperlink to other content',
    category: 'interactive'
  },
  {
    id: 'emoji',
    name: 'Emoji',
    icon: '😀',
    description: 'Insert emoji characters',
    category: 'text-media'
  },
  {
    id: 'mention',
    name: 'Mention',
    icon: '@',
    description: 'Tag people or documents',
    category: 'interactive'
  },
  // Table & Views
  {
    id: 'table',
    name: 'Table',
    icon: '📋',
    description: 'Organize information in rows and columns',
    category: 'table-views',
    isPopular: true
  },
  {
    id: 'kanban',
    name: 'Kanban',
    icon: '📌',
    description: 'Visual project management board',
    category: 'table-views',
    isPopular: true
  },
  {
    id: 'timeline',
    name: 'Timeline',
    icon: '⏱️',
    description: 'Visualize events along a time axis',
    category: 'table-views',
    isPopular: true
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: '📅',
    description: 'Display events on a calendar',
    category: 'table-views',
    isPopular: true
  },
  {
    id: 'gallery',
    name: 'Gallery',
    icon: '🖼️',
    description: 'Visual grid of cards or images',
    category: 'table-views'
  },
  // Charts
  {
    id: 'bar-chart',
    name: 'Bar chart',
    icon: '📊',
    description: 'Compare values across categories',
    category: 'charts',
    isPopular: true
  },
  {
    id: 'line-chart',
    name: 'Line chart',
    icon: '📈',
    description: 'Show trends over time',
    category: 'charts'
  },
  {
    id: 'pie-chart',
    name: 'Pie chart',
    icon: '🥧',
    description: 'Show proportion of a whole',
    category: 'charts'
  },
  {
    id: 'gauge',
    name: 'Gauge',
    icon: '🧮',
    description: 'Display a value within a range',
    category: 'charts',
    isNew: true
  },
  // Controls
  {
    id: 'button',
    name: 'Button',
    icon: '🔘',
    description: 'Interactive button for actions',
    category: 'controls'
  },
  {
    id: 'slider',
    name: 'Slider',
    icon: '⟷',
    description: 'Select a value from a range',
    category: 'controls'
  },
  {
    id: 'toggle',
    name: 'Toggle',
    icon: '⚙️',
    description: 'Switch between two states',
    category: 'controls'
  },
  {
    id: 'timer',
    name: 'Timer',
    icon: '⏱️',
    description: 'Count down or up from a set time',
    category: 'interactive'
  },
  // External
  {
    id: 'video',
    name: 'Video',
    icon: '🎬',
    description: 'Embed video content',
    category: 'external'
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: 'F',
    description: 'Embed Figma designs',
    category: 'external'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'G',
    description: 'Embed GitHub repositories or issues',
    category: 'external'
  }
];
