
import { DocumentTemplate } from '../types/TemplateTypes';

// Curated high-quality templates focused on essential use cases
export const curatedTemplates: DocumentTemplate[] = [
  // BASICS CATEGORY
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structure your meetings with agenda, notes, and action items',
    category: 'basics',
    icon: '📝',
    previewImage: '/lovable-uploads/b08e0a5f-c890-4541-ad8e-e2f8e45c78bf.png',
    tags: ['meetings', 'notes', 'agenda'],
    difficulty: 'Beginner',
    estimatedTime: '10 minutes',
    popularityScore: 95,
    content: {
      title: 'Meeting Notes Template',
      sections: [
        {
          title: 'Meeting Details',
          content: 'Date: [DATE]\nTime: [TIME]\nAttendees: [NAMES]\nMeeting Purpose: [PURPOSE]'
        },
        {
          title: 'Agenda',
          content: '1. Opening remarks\n2. Review of previous action items\n3. Main discussion topics\n4. Next steps\n5. Q&A'
        },
        {
          title: 'Notes',
          content: '[Take detailed notes here during the meeting]'
        },
        {
          title: 'Action Items',
          content: '□ [Action item 1] - Assigned to: [NAME] - Due: [DATE]\n□ [Action item 2] - Assigned to: [NAME] - Due: [DATE]'
        }
      ]
    }
  },
  {
    id: 'project-brief',
    name: 'Project Brief',
    description: 'Define project scope, goals, timeline, and deliverables',
    category: 'basics',
    icon: '📋',
    previewImage: '/lovable-uploads/c7b578e2-c226-48bb-9064-62019c1a8fef.png',
    tags: ['project', 'planning', 'brief'],
    difficulty: 'Beginner',
    estimatedTime: '30 minutes',
    popularityScore: 92,
    content: {
      title: 'Project Brief',
      sections: [
        {
          title: 'Project Overview',
          content: 'Project Name: [NAME]\nProject Owner: [OWNER]\nStart Date: [DATE]\nExpected Completion: [DATE]'
        },
        {
          title: 'Objectives',
          content: 'Primary Goal: [GOAL]\nSuccess Metrics: [METRICS]\nKey Performance Indicators: [KPIS]'
        },
        {
          title: 'Scope & Deliverables',
          content: 'In Scope:\n• [Item 1]\n• [Item 2]\n\nOut of Scope:\n• [Item 1]\n• [Item 2]\n\nDeliverables:\n• [Deliverable 1]\n• [Deliverable 2]'
        },
        {
          title: 'Timeline & Milestones',
          content: 'Phase 1: [DESCRIPTION] - [DATE]\nPhase 2: [DESCRIPTION] - [DATE]\nPhase 3: [DESCRIPTION] - [DATE]'
        }
      ]
    }
  },
  {
    id: 'simple-notes',
    name: 'Simple Notes',
    description: 'Clean, minimal note-taking template for any purpose',
    category: 'basics',
    icon: '📄',
    tags: ['notes', 'general', 'simple'],
    difficulty: 'Beginner',
    estimatedTime: '5 minutes',
    popularityScore: 88,
    content: {
      title: 'Notes',
      sections: [
        {
          title: 'Main Notes',
          content: 'Use this space for your notes...'
        }
      ]
    }
  },

  // BUSINESS CATEGORY
  {
    id: 'business-plan',
    name: 'Business Plan',
    description: 'Comprehensive business plan template for startups and new ventures',
    category: 'business',
    icon: '💼',
    tags: ['business', 'startup', 'planning'],
    difficulty: 'Advanced',
    estimatedTime: '3-5 hours',
    popularityScore: 85,
    content: {
      title: 'Business Plan',
      sections: [
        {
          title: 'Executive Summary',
          content: 'Business Name: [NAME]\nMission Statement: [MISSION]\nValue Proposition: [VALUE_PROP]\nFunding Requirements: [AMOUNT]'
        },
        {
          title: 'Market Analysis',
          content: 'Target Market: [MARKET]\nMarket Size: [SIZE]\nCompetitor Analysis: [COMPETITORS]\nMarket Trends: [TRENDS]'
        },
        {
          title: 'Products & Services',
          content: 'Core Offerings:\n• [Product/Service 1]\n• [Product/Service 2]\nPricing Strategy: [STRATEGY]\nRevenue Streams: [STREAMS]'
        },
        {
          title: 'Financial Projections',
          content: 'Year 1 Revenue: [AMOUNT]\nYear 2 Revenue: [AMOUNT]\nYear 3 Revenue: [AMOUNT]\nBreak-even Point: [DATE]'
        }
      ]
    }
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns with clear objectives and tactics',
    category: 'business',
    icon: '📈',
    tags: ['marketing', 'campaign', 'strategy'],
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    popularityScore: 82,
    content: {
      title: 'Marketing Campaign Plan',
      sections: [
        {
          title: 'Campaign Overview',
          content: 'Campaign Name: [NAME]\nObjective: [OBJECTIVE]\nTarget Audience: [AUDIENCE]\nBudget: [BUDGET]\nTimeline: [DATES]'
        },
        {
          title: 'Strategy & Tactics',
          content: 'Key Messages: [MESSAGES]\nChannels:\n• Social Media\n• Email Marketing\n• Content Marketing\n• Paid Advertising'
        },
        {
          title: 'Success Metrics',
          content: 'Primary KPIs:\n• [Metric 1]\n• [Metric 2]\nTracking Methods: [METHODS]\nReporting Schedule: [SCHEDULE]'
        }
      ]
    }
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Track income, expenses, and financial goals',
    category: 'business',
    icon: '💰',
    tags: ['budget', 'finance', 'tracking'],
    difficulty: 'Intermediate',
    estimatedTime: '1 hour',
    popularityScore: 78,
    content: {
      title: 'Budget Tracker',
      sections: [
        {
          title: 'Monthly Budget',
          content: 'Income:\n• Salary: $[AMOUNT]\n• Other: $[AMOUNT]\nTotal Income: $[TOTAL]\n\nExpenses:\n• Housing: $[AMOUNT]\n• Food: $[AMOUNT]\n• Transportation: $[AMOUNT]\n• Utilities: $[AMOUNT]\n• Other: $[AMOUNT]\nTotal Expenses: $[TOTAL]'
        },
        {
          title: 'Financial Goals',
          content: 'Short-term Goals (1 year):\n• [Goal 1]: $[AMOUNT]\n• [Goal 2]: $[AMOUNT]\n\nLong-term Goals (5+ years):\n• [Goal 1]: $[AMOUNT]\n• [Goal 2]: $[AMOUNT]'
        }
      ]
    }
  },

  // PERSONAL CATEGORY
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Reflect on your day with structured journaling prompts',
    category: 'personal',
    icon: '📖',
    tags: ['journal', 'reflection', 'daily'],
    difficulty: 'Beginner',
    estimatedTime: '15 minutes',
    popularityScore: 90,
    content: {
      title: 'Daily Journal Entry',
      sections: [
        {
          title: 'Today\'s Date',
          content: 'Date: [DATE]\nWeather: [WEATHER]\nMood: [MOOD]'
        },
        {
          title: 'Daily Reflection',
          content: 'What went well today?\n[RESPONSE]\n\nWhat could have gone better?\n[RESPONSE]\n\nWhat am I grateful for?\n[RESPONSE]'
        },
        {
          title: 'Tomorrow\'s Goals',
          content: 'Top 3 priorities for tomorrow:\n1. [PRIORITY 1]\n2. [PRIORITY 2]\n3. [PRIORITY 3]'
        }
      ]
    }
  },
  {
    id: 'goal-setting',
    name: 'Goal Setting',
    description: 'Set and track personal and professional goals using SMART criteria',
    category: 'personal',
    icon: '🎯',
    tags: ['goals', 'planning', 'smart'],
    difficulty: 'Intermediate',
    estimatedTime: '45 minutes',
    popularityScore: 87,
    content: {
      title: 'Goal Setting Worksheet',
      sections: [
        {
          title: 'Goal Definition',
          content: 'Goal: [GOAL_STATEMENT]\n\nSMART Criteria:\n• Specific: [SPECIFIC_DETAILS]\n• Measurable: [HOW_TO_MEASURE]\n• Achievable: [WHY_ACHIEVABLE]\n• Relevant: [WHY_IMPORTANT]\n• Time-bound: [DEADLINE]'
        },
        {
          title: 'Action Plan',
          content: 'Steps to achieve this goal:\n1. [STEP 1] - Due: [DATE]\n2. [STEP 2] - Due: [DATE]\n3. [STEP 3] - Due: [DATE]'
        },
        {
          title: 'Progress Tracking',
          content: 'Weekly Check-ins:\nWeek 1: [PROGRESS]\nWeek 2: [PROGRESS]\nWeek 3: [PROGRESS]\nWeek 4: [PROGRESS]'
        }
      ]
    }
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Build and maintain positive habits with daily tracking',
    category: 'personal',
    icon: '✅',
    tags: ['habits', 'tracking', 'wellness'],
    difficulty: 'Beginner',
    estimatedTime: '20 minutes',
    popularityScore: 83,
    content: {
      title: 'Habit Tracker',
      sections: [
        {
          title: 'Monthly Habits',
          content: 'Habit 1: [HABIT_NAME]\n□ Day 1 □ Day 2 □ Day 3 □ Day 4 □ Day 5\n\nHabit 2: [HABIT_NAME]\n□ Day 1 □ Day 2 □ Day 3 □ Day 4 □ Day 5\n\nHabit 3: [HABIT_NAME]\n□ Day 1 □ Day 2 □ Day 3 □ Day 4 □ Day 5'
        },
        {
          title: 'Weekly Review',
          content: 'This week I successfully:\n• [ACHIEVEMENT 1]\n• [ACHIEVEMENT 2]\n\nNext week I will focus on:\n• [FOCUS 1]\n• [FOCUS 2]'
        }
      ]
    }
  },

  // TEAMS CATEGORY
  {
    id: 'team-retrospective',
    name: 'Team Retrospective',
    description: 'Improve team performance with structured retrospective meetings',
    category: 'teams',
    icon: '👥',
    tags: ['retrospective', 'team', 'improvement'],
    difficulty: 'Intermediate',
    estimatedTime: '1 hour',
    popularityScore: 89,
    content: {
      title: 'Team Retrospective',
      sections: [
        {
          title: 'Meeting Info',
          content: 'Date: [DATE]\nSprint/Period: [PERIOD]\nTeam Members: [MEMBERS]\nFacilitator: [FACILITATOR]'
        },
        {
          title: 'What Went Well?',
          content: '• [Success 1]\n• [Success 2]\n• [Success 3]'
        },
        {
          title: 'What Could Be Improved?',
          content: '• [Challenge 1]\n• [Challenge 2]\n• [Challenge 3]'
        },
        {
          title: 'Action Items',
          content: '□ [Action 1] - Owner: [NAME] - Due: [DATE]\n□ [Action 2] - Owner: [NAME] - Due: [DATE]\n□ [Action 3] - Owner: [NAME] - Due: [DATE]'
        }
      ]
    }
  },
  {
    id: 'project-status',
    name: 'Project Status Report',
    description: 'Keep stakeholders informed with regular project updates',
    category: 'teams',
    icon: '📊',
    tags: ['status', 'project', 'reporting'],
    difficulty: 'Intermediate',
    estimatedTime: '30 minutes',
    popularityScore: 86,
    content: {
      title: 'Project Status Report',
      sections: [
        {
          title: 'Project Overview',
          content: 'Project: [PROJECT_NAME]\nReport Date: [DATE]\nProject Manager: [NAME]\nOverall Status: [STATUS]'
        },
        {
          title: 'Progress Summary',
          content: 'Completed This Period:\n• [Task 1]\n• [Task 2]\n\nUpcoming Next Period:\n• [Task 1]\n• [Task 2]\n\nProgress: [X]% Complete'
        },
        {
          title: 'Issues & Risks',
          content: 'Current Issues:\n• [Issue 1] - Impact: [IMPACT]\n• [Issue 2] - Impact: [IMPACT]\n\nRisk Mitigation:\n• [Risk 1] - Mitigation: [PLAN]'
        }
      ]
    }
  },
  {
    id: 'onboarding-checklist',
    name: 'Employee Onboarding',
    description: 'Ensure smooth onboarding with comprehensive checklist',
    category: 'teams',
    icon: '📝',
    tags: ['onboarding', 'hr', 'checklist'],
    difficulty: 'Intermediate',
    estimatedTime: '45 minutes',
    popularityScore: 81,
    content: {
      title: 'Employee Onboarding Checklist',
      sections: [
        {
          title: 'Employee Information',
          content: 'Name: [NAME]\nPosition: [POSITION]\nStart Date: [DATE]\nManager: [MANAGER]\nBuddy/Mentor: [BUDDY]'
        },
        {
          title: 'Pre-Arrival (Manager)',
          content: '□ Prepare workspace\n□ Set up IT equipment\n□ Create email account\n□ Prepare welcome package\n□ Schedule first-day meetings'
        },
        {
          title: 'First Day',
          content: '□ Welcome & office tour\n□ IT setup & system access\n□ Review job description\n□ Meet team members\n□ Lunch with buddy/mentor'
        },
        {
          title: 'First Week',
          content: '□ Company overview training\n□ Department orientation\n□ Initial project assignment\n□ Check-in with manager\n□ Complete required forms'
        }
      ]
    }
  }
];

// Helper functions
export const getTemplatesByCategory = (category: string): DocumentTemplate[] => {
  return curatedTemplates.filter(template => 
    template.category.toLowerCase() === category.toLowerCase()
  );
};

export const getAllTemplateCategories = (): { id: string; name: string; count: number }[] => {
  const categories = [
    { id: 'basics', name: 'Basics' },
    { id: 'business', name: 'Business' },
    { id: 'personal', name: 'Personal' },
    { id: 'teams', name: 'Teams' }
  ];
  
  return categories.map(category => ({
    ...category,
    count: getTemplatesByCategory(category.id).length
  }));
};

export const getPopularTemplates = (limit: number = 6): DocumentTemplate[] => {
  return curatedTemplates
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit);
};

export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return curatedTemplates.find(template => template.id === id);
};

export const searchTemplates = (query: string): DocumentTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return curatedTemplates.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
