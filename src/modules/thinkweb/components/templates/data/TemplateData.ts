import { DocumentTemplate } from '../types/TemplateTypes';

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'blank',
    name: 'Blank doc',
    description: 'Create an empty doc to start simple.',
    category: 'basics',
    icon: '📄',
    popularityScore: 100,
    content: {
      title: 'Untitled',
      sections: []
    }
  },
  {
    id: 'content-calendar',
    name: 'Content calendar',
    description: 'Plan and schedule your content across channels.',
    category: 'marketing',
    icon: '📅',
    popularityScore: 92,
    content: {
      title: 'Content Calendar',
      sections: [
        {
          title: 'Monthly Theme',
          content: 'Set your content theme for each month to maintain consistency across channels.'
        },
        {
          title: 'Content Schedule',
          content: 'Date | Topic | Content Type | Platform | Status | Owner | Publish Date | Link\n' +
                   '--- | --- | --- | --- | --- | --- | --- | ---\n' +
                   'May 1 | Product Launch | Blog Post | Website | Draft | Jane | May 10 | [Link]()\n' +
                   'May 3 | User Tutorial | Video | YouTube | Scheduled | Sam | May 15 | [Link]()\n' +
                   'May 5 | Product Feature | Social | LinkedIn | Published | Mark | May 5 | [Link]()\n' +
                   'May 8 | Industry Insights | Newsletter | Email | In Review | Lisa | May 20 | [Link]()'
        },
        {
          title: 'Content Ideas Bank',
          content: 'Keep a list of content ideas for future use:\n\n' +
                   '- Customer success stories\n' +
                   '- Product comparison guides\n' +
                   '- Industry trend analysis\n' +
                   '- Tips and tricks series'
        },
        {
          title: 'Performance Metrics',
          content: 'Track key performance indicators for your published content:\n\n' +
                   'Content | Views | Engagement | Conversions | ROI\n' +
                   '--- | --- | --- | --- | ---\n' +
                   'April Blog | 1,245 | 3.2% | 15 | $1,200\n' +
                   'Email Campaign | 5,678 | 2.8% | 42 | $3,600'
        }
      ]
    }
  },
  {
    id: 'todo',
    name: 'To-do list',
    description: 'Organize and prioritize tasks for yourself or your team.',
    category: 'productivity',
    icon: '📝',
    popularityScore: 95,
    content: {
      title: 'To-do List',
      sections: [
        {
          title: 'Active Tasks',
          content: 'Task | Due Date | Priority | Status | Assignee\n' +
                   '--- | --- | --- | --- | ---\n' +
                   'Finalize project proposal | May 15, 2025 | High | In Progress | Me\n' +
                   'Review marketing materials | May 18, 2025 | Medium | Not Started | Me\n' +
                   'Schedule team meeting | May 10, 2025 | High | Not Started | Me\n' +
                   'Research new vendors | May 25, 2025 | Low | Not Started | Team Member'
        },
        {
          title: 'Project Tasks',
          content: '### Website Redesign\n\n' +
                   'Task | Due Date | Priority | Status | Assignee\n' +
                   '--- | --- | --- | --- | ---\n' +
                   'Create wireframes | May 12, 2025 | High | In Progress | Designer\n' +
                   'Content audit | May 10, 2025 | Medium | Completed | Content Manager\n' +
                   'Development setup | May 15, 2025 | High | Not Started | Developer\n\n' +
                   
                   '### Product Launch\n\n' +
                   'Task | Due Date | Priority | Status | Assignee\n' +
                   '--- | --- | --- | --- | ---\n' +
                   'Finalize pricing | May 18, 2025 | High | In Progress | Product Manager\n' +
                   'Create launch materials | May 22, 2025 | Medium | Not Started | Marketing\n' +
                   'Customer communications | May 25, 2025 | Medium | Not Started | Customer Success'
        },
        {
          title: 'Completed Tasks',
          content: 'Task | Completion Date | Assignee\n' +
                   '--- | --- | ---\n' +
                   'Initial research | May 1, 2025 | Me\n' +
                   'Stakeholder interviews | May 3, 2025 | Team\n' +
                   'Budget approval | May 5, 2025 | Finance'
        }
      ]
    }
  },
  {
    id: 'smart-goals',
    name: 'SMART goals',
    description: 'Set specific, measurable, achievable, relevant, and time-based goals.',
    category: 'productivity',
    icon: '🎯',
    popularityScore: 85,
    content: {
      title: 'SMART Goals',
      sections: [
        {
          title: 'SMART framework overview',
          content: 'Use this template to draft your team\'s goals, then check your work with the SMART questions laid out in each column.'
        },
        {
          title: 'Personal SMART Goals',
          content: '### Goal 1: Increase Professional Skills\n\n' +
                   '**Specific:** Complete advanced certification in project management\n' +
                   '**Measurable:** Pass certification exam with score of 85% or higher\n' +
                   '**Achievable:** Allocate 5 hours per week for study over 3 months\n' +
                   '**Relevant:** Will enhance career opportunities and current job performance\n' +
                   '**Time-bound:** Complete by September 30, 2025\n\n' +
                   
                   '### Goal 2: Improve Health & Wellness\n\n' +
                   '**Specific:** Establish regular exercise routine\n' +
                   '**Measurable:** Exercise 30 minutes, 4 times per week\n' +
                   '**Achievable:** Schedule workouts in calendar, join fitness class\n' +
                   '**Relevant:** Will increase energy and reduce stress\n' +
                   '**Time-bound:** Begin immediately, evaluate progress monthly'
        },
        {
          title: 'Team SMART Goals',
          content: 'Goal | Specific | Measurable | Achievable | Relevant | Time-bound\n' +
                   '--- | --- | --- | --- | --- | ---\n' +
                   'Increase Customer Satisfaction | Improve customer support response time | Reduce average response time from 24 hours to 4 hours | Implement new ticketing system and hire one additional support staff | Aligns with company objective to improve customer experience | By end of Q2 2025\n' +
                   'Launch New Product Feature | Develop and release mobile app version | App available in both iOS and Android app stores with core functionality | Development team has mobile expertise and timeline is realistic | Meets customer demand for mobile access | October 15, 2025\n' +
                   'Reduce Operating Costs | Optimize cloud infrastructure spending | Decrease monthly cloud costs by 20% | Review current usage patterns and implement resource scheduling | Supports company financial goals | End of Q3 2025'
        }
      ]
    }
  },
  {
    id: 'meeting-notes',
    name: 'Meeting notes',
    description: 'Keep track of discussions, decisions, and action items.',
    category: 'meetings',
    icon: '📊',
    popularityScore: 90,
    content: {
      title: 'Meeting Notes',
      sections: [
        {
          title: 'Meeting Details',
          content: '**Meeting Title:** [Project Kickoff]\n' +
                   '**Date:** May 10, 2025\n' +
                   '**Time:** 10:00 AM - 11:30 AM\n' +
                   '**Location:** Conference Room A / Zoom Link\n\n' +
                   '**Attendees:**\n' +
                   '- Jane Smith (Product Manager)\n' +
                   '- John Doe (Engineering)\n' +
                   '- Lisa Johnson (Design)\n' +
                   '- Michael Brown (Marketing)\n\n' +
                   '**Agenda:**\n' +
                   '1. Project overview and goals\n' +
                   '2. Timeline and milestones\n' +
                   '3. Team roles and responsibilities\n' +
                   '4. Next steps'
        },
        {
          title: 'Discussion',
          content: '### 1. Project Overview\n' +
                   '- New product feature aims to increase user engagement by 25%\n' +
                   '- Initial research shows strong market demand\n' +
                   '- Budget approved for Q2 and Q3 development\n\n' +
                   
                   '### 2. Timeline\n' +
                   '- Design phase: May 15 - June 1\n' +
                   '- Development: June 1 - July 15\n' +
                   '- Testing: July 15 - July 31\n' +
                   '- Launch: August 15\n\n' +
                   
                   '### 3. Team Roles\n' +
                   '- Jane: Overall project management and stakeholder communication\n' +
                   '- John: Technical architecture and development team leadership\n' +
                   '- Lisa: UI/UX design and user testing\n' +
                   '- Michael: Launch strategy and marketing materials'
        },
        {
          title: 'Decisions Made',
          content: '1. Project scope will focus on core functionality for initial release\n' +
                   '2. Weekly status updates to be shared via email\n' +
                   '3. User testing to include both current customers and potential users\n' +
                   '4. Go/no-go decision point scheduled for July 10'
        },
        {
          title: 'Action Items',
          content: 'Task | Owner | Deadline | Status\n' +
                   '--- | --- | --- | ---\n' +
                   'Create detailed project plan | Jane | May 15 | Pending\n' +
                   'Draft technical requirements | John | May 20 | Pending\n' +
                   'Develop initial wireframes | Lisa | May 25 | Pending\n' +
                   'Prepare communication plan | Michael | May 18 | Pending'
        }
      ]
    }
  },
  {
    id: 'product-team-hub',
    name: 'Product team hub',
    description: 'Keep your team moving in lockstep—by organizing projects, tasks, and resources.',
    category: 'teams',
    icon: '🏠',
    popularityScore: 88,
    content: {
      title: 'Product Team Hub',
      sections: [
        {
          title: 'Team Directory',
          content: 'Name | Role | Contact | Focus Area | Skills\n' +
                   '--- | --- | --- | --- | ---\n' +
                   'Sarah Chen | Product Manager | sarah@company.com | Mobile App | Strategy, Roadmapping, User Research\n' +
                   'Marcus Johnson | Senior Developer | marcus@company.com | Backend | Python, AWS, Database Design\n' +
                   'Priya Patel | UX Designer | priya@company.com | User Experience | Wireframing, Prototyping, User Testing\n' +
                   'David Kim | QA Engineer | david@company.com | Quality Assurance | Test Automation, Performance Testing\n' +
                   'Sophia Williams | Product Marketing | sophia@company.com | Go-to-Market | Content Strategy, Analytics, Campaigns'
        },
        {
          title: 'Current Projects Overview',
          content: '### Project Status Dashboard\n\n' +
                   'Project | Status | Owner | Target Release | Progress\n' +
                   '--- | --- | --- | --- | ---\n' +
                   'Mobile App Redesign | In Progress | Sarah | July 15, 2025 | 60%\n' +
                   'API Performance Optimization | Planning | Marcus | August 30, 2025 | 10%\n' +
                   'New User Onboarding Flow | In Review | Priya | May 25, 2025 | 90%\n' +
                   'Automated Testing Framework | In Progress | David | June 10, 2025 | 45%\n\n' +
                   
                   '### Key Project Links\n\n' +
                   '- [Product Roadmap]()\n' +
                   '- [Design System]()\n' +
                   '- [Development Repository]()\n' +
                   '- [QA Test Plans]()'
        },
        {
          title: 'Backlog',
          content: '### Prioritized Features\n\n' +
                   'Feature | Priority | Effort | Value | Status\n' +
                   '--- | --- | --- | --- | ---\n' +
                   'Single Sign-On Integration | High | Medium | High | Planned for Q3\n' +
                   'Advanced Analytics Dashboard | Medium | Large | High | Under Evaluation\n' +
                   'Mobile Offline Mode | High | Large | Medium | Planned for Q4\n' +
                   'Personalization Engine | Medium | Large | High | Conceptual\n\n' +
                   
                   '### User Stories Ready for Development\n\n' +
                   '1. As a user, I want to save my preferences so that I don\'t have to reset them each session\n' +
                   '2. As an admin, I want to view user activity logs so that I can troubleshoot issues\n' +
                   '3. As a user, I want to share content directly to social media so that I can engage my network'
        },
        {
          title: 'Meeting Notes',
          content: '### Recent Meetings\n\n' +
                   '- [Sprint Planning - May 2]()\n' +
                   '- [Product Review - April 28]()\n' +
                   '- [Retrospective - April 26]()\n' +
                   '- [Stakeholder Update - April 20]()\n\n' +
                   
                   '### Upcoming Meetings\n\n' +
                   '- Sprint Review - May 16, 10:00 AM\n' +
                   '- Product Roadmap Planning - May 20, 1:00 PM\n' +
                   '- User Testing Results Discussion - May 22, 11:00 AM'
        },
        {
          title: 'Resource Library',
          content: '### Documentation\n\n' +
                   '- [Product Requirements Document]()\n' +
                   '- [Technical Specifications]()\n' +
                   '- [User Research Findings]()\n' +
                   '- [Competitive Analysis]()\n\n' +
                   
                   '### Design Assets\n\n' +
                   '- [Brand Guidelines]()\n' +
                   '- [UI Component Library]()\n' +
                   '- [User Flow Diagrams]()\n' +
                   '- [Prototype Links]()\n\n' +
                   
                   '### Learning Resources\n\n' +
                   '- [Product Management Best Practices]()\n' +
                   '- [Technical Tutorial Library]()\n' +
                   '- [Industry Reports and Trends]()'
        }
      ]
    }
  },
  {
    id: 'decision-doc',
    name: 'Decision doc',
    description: 'Structured approach to making and documenting important decisions.',
    category: 'documentation',
    icon: '🧠',
    popularityScore: 86,
    content: {
      title: 'Decision Document',
      sections: [
        {
          title: 'Decision to be Made',
          content: '**Decision Title:** [Select a New CRM Platform]\n\n' +
                   '**Decision Owner:** Marketing Operations Team\n\n' +
                   '**Decision Deadline:** June 15, 2025\n\n' +
                   '**Decision Type:** [Technology Selection / Strategic / Process Change / Resource Allocation]\n\n' +
                   '**Decision Statement:** We need to select a new CRM platform that will better serve our growing sales team, integrate with our marketing automation tools, and provide enhanced reporting capabilities.'
        },
        {
          title: 'Background Context',
          content: '### Current Situation\n\n' +
                   'Our existing CRM system was implemented 5 years ago when the company was much smaller. We now face the following challenges:\n\n' +
                   '- Limited scalability for our growing team (now 50+ sales reps)\n' +
                   '- Poor integration with newer marketing tools\n' +
                   '- Inadequate mobile experience\n' +
                   '- Limited reporting and analytics capabilities\n' +
                   '- Increasing maintenance costs\n\n' +
                   
                   '### Impact of This Decision\n\n' +
                   'This decision will affect:\n' +
                   '- All sales team members and their daily workflows\n' +
                   '- Marketing-to-sales lead handoff processes\n' +
                   '- Executive reporting and forecasting\n' +
                   '- Customer data management and security\n' +
                   '- IT support and integration requirements'
        },
        {
          title: 'Options Considered',
          content: '### Option 1: Upgrade Current CRM\n\n' +
                   '**Description:** Implement the enterprise tier of our current CRM provider\n\n' +
                   '**Pros:**\n' +
                   '- Minimal retraining required\n' +
                   '- Shorter implementation timeline\n' +
                   '- Lower initial cost ($65,000 vs. $110,000+)\n' +
                   '- Familiar vendor relationship\n\n' +
                   '**Cons:**\n' +
                   '- Still limited integration capabilities\n' +
                   '- UI/UX remains outdated\n' +
                   '- Missing some advanced features we need\n' +
                   '- Higher 3-year TCO due to customization needs\n\n' +
                   
                   '### Option 2: Switch to Industry Leader CRM\n\n' +
                   '**Description:** Implement the industry-leading CRM platform with full features\n\n' +
                   '**Pros:**\n' +
                   '- Comprehensive feature set\n' +
                   '- Strong ecosystem of integrations\n' +
                   '- Advanced analytics and AI capabilities\n' +
                   '- Modern, intuitive interface\n' +
                   '- Strong mobile experience\n\n' +
                   '**Cons:**\n' +
                   '- Higher initial cost ($110,000 implementation)\n' +
                   '- Longer implementation timeline (4-5 months)\n' +
                   '- Steeper learning curve\n' +
                   '- Higher per-seat licensing costs\n\n' +
                   
                   '### Option 3: Implement Mid-Market Specialized CRM\n\n' +
                   '**Description:** Choose an industry-specific CRM designed for our vertical\n\n' +
                   '**Pros:**\n' +
                   '- Features tailored to our industry\n' +
                   '- Moderate cost ($85,000 implementation)\n' +
                   '- Good balance of features and usability\n' +
                   '- Specialized support for our use cases\n\n' +
                   '**Cons:**\n' +
                   '- Smaller vendor with less established track record\n' +
                   '- More limited third-party integrations\n' +
                   '- Less frequent product updates\n' +
                   '- Smaller community for support and resources'
        },
        {
          title: 'Recommended Decision',
          content: '**Recommendation:** Option 2: Switch to Industry Leader CRM\n\n' +
                   '**Rationale:**\n' +
                   'While this option requires a larger initial investment of time and resources, it provides the best long-term solution for our growing needs. The robust integration capabilities, advanced analytics, and modern user experience align with our strategic goals. The 3-year TCO analysis shows that despite higher initial costs, this option becomes more economical by year 3 due to reduced customization needs and efficiency gains.\n\n' +
                   
                   '**Implementation Considerations:**\n' +
                   '- Phase the rollout by department over 4 months\n' +
                   '- Allocate additional resources for training and change management\n' +
                   '- Establish clear data migration protocols\n' +
                   '- Set up a cross-functional implementation team'
        },
        {
          title: 'Stakeholder Input',
          content: 'Name | Role | Comment/Vote | Date\n' +
                   '--- | --- | --- | ---\n' +
                   'Jennifer Lopez | Sales Director | Strongly support Option 2. Our team needs better mobile capabilities. | May 3, 2025\n' +
                   'Michael Chen | IT Director | Support Option 2, but concerned about integration timeline. Recommend phased approach. | May 4, 2025\n' +
                   'Sarah Williams | CFO | Initially favored Option 1 due to cost, but convinced by TCO analysis for Option 2. | May 5, 2025\n' +
                   'David Johnson | Marketing Director | Strongly support Option 2. Current integration issues are costing us leads and analytics capability. | May 3, 2025\n' +
                   'Robert Smith | Customer Success Manager | Support Option 2, but need to ensure customer data migration is seamless. | May 6, 2025'
        }
      ]
    }
  },
  {
    id: 'meeting-forum',
    name: 'Meeting forum',
    description: 'Structured framework for reviewing decisions before, during, and after meetings.',
    category: 'meetings',
    icon: '🗣️',
    popularityScore: 85,
    content: {
      title: 'Meeting Forum',
      sections: [
        {
          title: 'Topics for Review',
          content: 'Topic | Description | Owner | Status\n' +
                   '--- | --- | --- | ---\n' +
                   'Q3 Marketing Campaign Budget | Review and approve budget allocation for Q3 campaigns | Emma Rodriguez | Requires Decision\n' +
                   'New Product Feature Prioritization | Determine priority order for next sprint features | James Chen | Discussion Required\n' +
                   'Customer Support Process Changes | Proposal to revise customer escalation workflow | Sophia Williams | Requires Decision\n' +
                   'Team Restructure Proposal | Discussion of proposed changes to team organization | Marcus Johnson | Initial Review\n' +
                   'Sales Performance Review | Analysis of Q2 sales results vs. targets | David Wilson | Information Only'
        },
        {
          title: 'Pre-Meeting Comments',
          content: 'Topic | Commenter | Comment | Date\n' +
                   '--- | --- | --- | ---\n' +
                   'Q3 Marketing Campaign Budget | Lisa Taylor (Finance) | The proposed budget exceeds quarterly allocation by 15%. Need justification for the overage or areas to reduce. | May 3, 2025\n' +
                   'Q3 Marketing Campaign Budget | Emma Rodriguez | Added ROI projections document to show expected return on increased budget allocation. | May 4, 2025\n' +
                   'New Product Feature Prioritization | Carlos Mendez (Engineering) | Feature B has technical dependencies that would make it challenging to implement before Feature A. | May 5, 2025\n' +
                   'New Product Feature Prioritization | Sarah Johnson (Product) | Customer feedback strongly supports prioritizing Feature C, as it addresses a significant pain point. | May 5, 2025\n' +
                   'Customer Support Process Changes | Thomas Wright (Support Team) | The new process could increase resolution time initially while teams adjust. Recommend phased implementation. | May 5, 2025'
        },
        {
          title: 'Live Discussion Notes',
          content: '### Q3 Marketing Campaign Budget\n\n' +
                   '- Emma presented ROI projections showing 2.5x return on the additional investment\n' +
                   '- Finance agreed to approve full budget based on strong Q2 performance and compelling ROI data\n' +
                   '- Marketing will provide bi-weekly performance updates against projections\n' +
                   '- Contingency plan discussed if initial campaign results don\'t meet projections\n\n' +
                   
                   '### New Product Feature Prioritization\n\n' +
                   '- Group discussed technical constraints raised by engineering\n' +
                   '- Customer feedback data reviewed and acknowledged as high priority\n' +
                   '- Decision made to begin technical groundwork for Feature B while implementing Feature C first\n' +
                   '- Feature A moved to secondary priority queue\n\n' +
                   
                   '### Customer Support Process Changes\n\n' +
                   '- Reviewed current escalation metrics and pain points\n' +
                   '- Team agreed with phased implementation approach\n' +
                   '- Discussed need for additional training on new workflow\n' +
                   '- Established success metrics for evaluating process effectiveness'
        },
        {
          title: 'Decisions & Action Items',
          content: 'Decision/Action | Owner | Deadline | Status\n' +
                   '--- | --- | --- | ---\n' +
                   'DECISION: Approve full Q3 marketing budget with bi-weekly performance reviews | Team | Completed | Approved\n' +
                   'Update campaign tracking dashboard to include ROI metrics | Emma | May 15, 2025 | Pending\n' +
                   'DECISION: Implement Feature C first, begin technical groundwork for Feature B | Team | Completed | Approved\n' +
                   'Create revised sprint plan reflecting new priorities | James | May 12, 2025 | In Progress\n' +
                   'DECISION: Implement customer support process changes in phased approach | Team | Completed | Approved\n' +
                   'Develop training materials for new escalation process | Sophia | May 20, 2025 | Pending\n' +
                   'Schedule follow-up meeting to review initial implementation results | Marcus | June 15, 2025 | Pending'
        }
      ]
    }
  },
  {
    id: 'sales-team-hub',
    name: 'Sales team hub',
    description: 'Central location to track sales activities, metrics, and resources.',
    category: 'sales',
    icon: '💼',
    popularityScore: 89,
    content: {
      title: 'Sales Team Hub',
      sections: [
        {
          title: 'Team Directory',
          content: 'Name | Territory | Contact | Quota\n' +
                   '--- | --- | --- | ---\n' +
                   'Alexander Garcia | West Region | alex@company.com / (555) 123-4567 | $850,000\n' +
                   'Samantha Jones | East Region | sam@company.com / (555) 234-5678 | $900,000\n' +
                   'Ryan Thompson | Central Region | ryan@company.com / (555) 345-6789 | $750,000\n' +
                   'Jennifer Lee | South Region | jen@company.com / (555) 456-7890 | $800,000\n' +
                   'Michael Wilson | Enterprise | michael@company.com / (555) 567-8901 | $1,200,000\n' +
                   'Emily Davis | Strategic Accounts | emily@company.com / (555) 678-9012 | $1,000,000'
        },
        {
          title: 'Key Metrics',
          content: '### Q2 2025 Performance Dashboard\n\n' +
                   'Metric | Current | Target | Status\n' +
                   '--- | --- | --- | ---\n' +
                   'Pipeline Value | $5.2M | $4.8M | ✅ Above Target\n' +
                   'Win Rate | 23% | 25% | 🟡 Slightly Below\n' +
                   'Average Deal Size | $42,500 | $40,000 | ✅ Above Target\n' +
                   'Quota Attainment | 78% | 80% | 🟡 Slightly Below\n' +
                   'Sales Cycle (days) | 48 | 45 | 🟡 Slightly Above\n\n' +
                   
                   '### Monthly Trending\n\n' +
                   'Month | Closed Revenue | New Opportunities | Win Rate\n' +
                   '--- | --- | --- | ---\n' +
                   'January | $420,000 | 28 | 22%\n' +
                   'February | $385,000 | 31 | 20%\n' +
                   'March | $512,000 | 35 | 24%\n' +
                   'April | $640,000 | 42 | 26%'
        },
        {
          title: 'Active Deals',
          content: 'Company | Contact | Deal Value | Stage | Next Steps | Expected Close\n' +
                   '--- | --- | --- | --- | --- | ---\n' +
                   'Acme Corporation | John Smith | $85,000 | Proposal | Schedule final presentation | May 18, 2025\n' +
                   'TechGrowth Inc. | Maria Lopez | $120,000 | Negotiation | Send updated pricing terms | May 15, 2025\n' +
                   'Global Enterprises | Robert Johnson | $250,000 | Discovery | Complete needs assessment | June 10, 2025\n' +
                   'Innovative Solutions | Sarah Miller | $75,000 | Demo | Follow up on technical questions | May 25, 2025\n' +
                   'Summit Partners | David Chen | $180,000 | Qualification | Schedule product demo | June 5, 2025\n' +
                   'Horizon Group | Michelle Taylor | $95,000 | Closing | Process contract paperwork | May 12, 2025'
        },
        {
          title: 'Sales Resources',
          content: '### Sales Playbooks\n\n' +
                   '- [Enterprise Sales Playbook]()\n' +
                   '- [Mid-Market Strategy Guide]()\n' +
                   '- [New Customer Acquisition Process]()\n' +
                   '- [Renewal and Expansion Playbook]()\n\n' +
                   
                   '### Competitive Battle Cards\n\n' +
                   '- [Competitor A: Key Differentiators]()\n' +
                   '- [Competitor B: Strength/Weakness Analysis]()\n' +
                   '- [Competitor C: Pricing Comparison]()\n' +
                   '- [Industry Positioning Guide]()\n\n' +
                   
                   '### Prospecting Resources\n\n' +
                   '- [Ideal Customer Profile Documentation]()\n' +
                   '- [Email Templates]()\n' +
                   '- [Call Scripts]()\n' +
                   '- [LinkedIn Outreach Strategies]()'
        },
        {
          title: 'Sales Calendar',
          content: '### Key Dates\n\n' +
                   'Event | Date | Details\n' +
                   '--- | --- | ---\n' +
                   'Q2 Business Review | May 15, 2025 | 1:00 PM - 3:00 PM, Conference Room A\n' +
                   'Product Training: New Features | May 18, 2025 | 10:00 AM - 12:00 PM, Virtual\n' +
                   'Industry Conference | May 22-24, 2025 | Regional Convention Center, Booth #412\n' +
                   'Sales Team Offsite | June 5-6, 2025 | Mountain View Resort\n' +
                   'Q3 Planning Session | June 15, 2025 | 9:00 AM - 3:00 PM, Conference Room B\n' +
                   'Sales Certification Deadline | June 30, 2025 | All team members must complete certification\n\n' +
                   
                   '### Weekly Schedule\n\n' +
                   '- Monday 9:00 AM: Team Pipeline Review\n' +
                   '- Wednesday 2:00 PM: Deal Strategy Session\n' +
                   '- Friday 11:00 AM: Weekly Sales Recap'
        }
      ]
    }
  },
  {
    id: 'account-hub',
    name: 'Account hub',
    description: 'Comprehensive view of a sales account for better planning and relationship building.',
    category: 'sales',
    icon: '👥',
    popularityScore: 85,
    content: {
      title: 'Account Hub',
      sections: [
        {
          title: 'Key Contacts',
          content: 'Name | Title | Contact Info | Relationship Status | Notes\n' +
                   '--- | --- | --- | --- | ---\n' +
                   'Jennifer Martinez | CTO | jmartinez@acmecorp.com / (555) 123-4567 | Champion | Strong advocate for our solution, worked together on previous implementation\n' +
                   'Michael Thompson | Director of IT | mthompson@acmecorp.com / (555) 234-5678 | Technical Evaluator | Concerned about integration complexity, need to address specific technical questions\n' +
                   'Sarah Johnson | CFO | sjohnson@acmecorp.com / (555) 345-6789 | Economic Buyer | Focused on ROI and cost justification, needs detailed financial analysis\n' +
                   'David Wilson | IT Manager | dwilson@acmecorp.com / (555) 456-7890 | Influencer | Daily user of current system, important to address usability concerns\n' +
                   'Lisa Brown | CEO | lbrown@acmecorp.com / (555) 567-8901 | Ultimate Decision Maker | Limited involvement so far, Jennifer will facilitate introduction'
        },
        {
          title: 'Account Overview',
          content: '### Company Information\n\n' +
                   '**Company Name:** Acme Corporation\n\n' +
                   '**Industry:** Manufacturing\n\n' +
                   '**Size:** 1,200 employees, $250M annual revenue\n\n'
        }
      ]
    }
  }
];
