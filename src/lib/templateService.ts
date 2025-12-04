import type { Task, TaskTemplate, TemplateCategory, Priority } from '../types';

export type { TaskTemplate, TemplateCategory } from '../types';

export class TemplateService {
  private static readonly BUILTIN_TEMPLATES: TaskTemplate[] = [
    {
      id: 'daily-planning',
      name: 'Daily Planning',
      description: 'Start your day with these essential tasks',
      category: 'productivity',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Review yesterday\'s completed tasks',
          priority: 'p3' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Set top 3 priorities for today',
          priority: 'p1' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Check calendar for appointments',
          priority: 'p2' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Review and organize inbox',
          priority: 'p3' as Priority,
          labels: [],
          order: 3,
        },
      ],
    },
    {
      id: 'weekly-review',
      name: 'Weekly Review',
      description: 'Comprehensive weekly review and planning',
      category: 'productivity',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Review completed tasks this week',
          priority: 'p2' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Analyze productivity metrics',
          priority: 'p3' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Plan goals for next week',
          priority: 'p1' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Schedule important meetings',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Clean up and organize projects',
          priority: 'p4' as Priority,
          labels: [],
          order: 4,
        },
      ],
    },
    {
      id: 'project-kickoff',
      name: 'Project Kickoff',
      description: 'Essential tasks for starting a new project',
      category: 'work',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Define project scope and objectives',
          priority: 'p1' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Identify key stakeholders',
          priority: 'p1' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Create project timeline',
          priority: 'p2' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Set up project documentation',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Schedule kickoff meeting',
          priority: 'p2' as Priority,
          labels: [],
          order: 4,
        },
        {
          content: 'Prepare presentation materials',
          priority: 'p3' as Priority,
          labels: [],
          order: 5,
        },
      ],
    },
    {
      id: 'meeting-prep',
      name: 'Meeting Preparation',
      description: 'Tasks to prepare for important meetings',
      category: 'work',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Review meeting agenda',
          priority: 'p1' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Prepare talking points',
          priority: 'p2' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Gather necessary documents',
          priority: 'p2' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Test presentation equipment',
          priority: 'p3' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Send meeting reminders',
          priority: 'p3' as Priority,
          labels: [],
          order: 4,
        },
      ],
    },
    {
      id: 'grocery-shopping',
      name: 'Grocery Shopping',
      description: 'Complete grocery shopping list',
      category: 'personal',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Check pantry and fridge inventory',
          priority: 'p1' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Make shopping list by category',
          priority: 'p2' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Clip digital coupons',
          priority: 'p3' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Go to grocery store',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Put away groceries',
          priority: 'p3' as Priority,
          labels: [],
          order: 4,
        },
      ],
    },
    {
      id: 'home-cleaning',
      name: 'Home Cleaning',
      description: 'Weekly home cleaning routine',
      category: 'personal',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Dust all surfaces',
          priority: 'p3' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Vacuum carpets and floors',
          priority: 'p3' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Clean bathrooms',
          priority: 'p2' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Wipe down kitchen counters',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Take out trash and recycling',
          priority: 'p3' as Priority,
          labels: [],
          order: 4,
        },
        {
          content: 'Organize living spaces',
          priority: 'p4' as Priority,
          labels: [],
          order: 5,
        },
      ],
    },
    {
      id: 'fitness-routine',
      name: 'Fitness Routine',
      description: 'Weekly fitness and wellness tasks',
      category: 'health',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Plan weekly workout schedule',
          priority: 'p2' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Meal prep for the week',
          priority: 'p2' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Schedule gym sessions',
          priority: 'p3' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Buy workout supplements',
          priority: 'p4' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Track progress and measurements',
          priority: 'p3' as Priority,
          labels: [],
          order: 4,
        },
      ],
    },
    {
      id: 'travel-prep',
      name: 'Travel Preparation',
      description: 'Essential tasks before traveling',
      category: 'travel',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Book flights and accommodation',
          priority: 'p1' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Check passport expiration',
          priority: 'p1' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Pack luggage',
          priority: 'p2' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Arrange pet care',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Set up email auto-responder',
          priority: 'p3' as Priority,
          labels: [],
          order: 4,
        },
        {
          content: 'Download travel apps',
          priority: 'p4' as Priority,
          labels: [],
          order: 5,
        },
      ],
    },
    {
      id: 'morning-routine',
      name: 'Morning Routine',
      description: 'Start your day with these productive habits',
      category: 'personal',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Drink a glass of water',
          priority: 'p3' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Morning meditation or exercise',
          priority: 'p2' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Review daily schedule',
          priority: 'p1' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Healthy breakfast',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
      ],
    },
    {
      id: 'content-creation',
      name: 'Content Creation',
      description: 'Blog post or content creation workflow',
      category: 'work',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Research topic and outline content',
          priority: 'p1' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Write first draft',
          priority: 'p1' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Edit and proofread',
          priority: 'p2' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Add visuals and formatting',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'SEO optimization',
          priority: 'p3' as Priority,
          labels: [],
          order: 4,
        },
        {
          content: 'Schedule publication',
          priority: 'p2' as Priority,
          labels: [],
          order: 5,
        },
      ],
    },
    {
      id: 'home-cleaning',
      name: 'Home Cleaning',
      description: 'Weekly home cleaning checklist',
      category: 'personal',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Dust all surfaces',
          priority: 'p2' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Vacuum carpets and floors',
          priority: 'p2' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Clean bathrooms',
          priority: 'p1' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Wipe down kitchen counters',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Take out trash and recycling',
          priority: 'p3' as Priority,
          labels: [],
          order: 4,
        },
        {
          content: 'Organize living spaces',
          priority: 'p3' as Priority,
          labels: [],
          order: 5,
        },
      ],
    },
    {
      id: 'study-session',
      name: 'Study Session',
      description: 'Focused study or learning session',
      category: 'learning',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Review previous material',
          priority: 'p2' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Set learning objectives for session',
          priority: 'p1' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Focus study block (45 min)',
          priority: 'p1' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Take short break (10 min)',
          priority: 'p3' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Practice problems or exercises',
          priority: 'p2' as Priority,
          labels: [],
          order: 4,
        },
        {
          content: 'Summarize key learnings',
          priority: 'p2' as Priority,
          labels: [],
          order: 5,
        },
      ],
    },
    {
      id: 'client-onboarding',
      name: 'Client Onboarding',
      description: 'Steps to onboard a new client',
      category: 'work',
      isPublic: true,
      isFavorite: false,
      usageCount: 0,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        {
          content: 'Send welcome email and documentation',
          priority: 'p1' as Priority,
          labels: [],
          order: 0,
        },
        {
          content: 'Schedule kickoff call',
          priority: 'p1' as Priority,
          labels: [],
          order: 1,
        },
        {
          content: 'Set up client accounts and access',
          priority: 'p2' as Priority,
          labels: [],
          order: 2,
        },
        {
          content: 'Create project timeline and milestones',
          priority: 'p2' as Priority,
          labels: [],
          order: 3,
        },
        {
          content: 'Introduce to team members',
          priority: 'p3' as Priority,
          labels: [],
          order: 4,
        },
        {
          content: 'Follow up after first week',
          priority: 'p3' as Priority,
          labels: [],
          order: 5,
        },
      ],
    },
  ];

  private static readonly TEMPLATE_CATEGORIES: TemplateCategory[] = [
    {
      id: 'productivity',
      name: 'Productivity',
      description: 'Templates for daily and weekly planning',
      icon: '📊',
      color: '#10b981',
      isPublic: true,
      ownerId: 'system',
      createdAt: new Date(),
    },
    {
      id: 'work',
      name: 'Work',
      description: 'Professional and business templates',
      icon: '💼',
      color: '#3b82f6',
      isPublic: true,
      ownerId: 'system',
      createdAt: new Date(),
    },
    {
      id: 'personal',
      name: 'Personal',
      description: 'Personal life and home management',
      icon: '🏠',
      color: '#f59e0b',
      isPublic: true,
      ownerId: 'system',
      createdAt: new Date(),
    },
    {
      id: 'health',
      name: 'Health & Fitness',
      description: 'Wellness and fitness routines',
      icon: '💪',
      color: '#ef4444',
      isPublic: true,
      ownerId: 'system',
      createdAt: new Date(),
    },
    {
      id: 'travel',
      name: 'Travel',
      description: 'Travel planning and preparation',
      icon: '✈️',
      color: '#8b5cf6',
      isPublic: true,
      ownerId: 'system',
      createdAt: new Date(),
    },
  ];

  /**
   * Get all built-in templates
   */
  static getBuiltinTemplates(): TaskTemplate[] {
    return this.BUILTIN_TEMPLATES;
  }

  /**
   * Get all template categories
   */
  static getTemplateCategories(): TemplateCategory[] {
    return this.TEMPLATE_CATEGORIES;
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: string): TaskTemplate[] {
    return this.BUILTIN_TEMPLATES.filter(template => template.category === category);
  }

  /**
   * Search templates
   */
  static searchTemplates(query: string): TaskTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.BUILTIN_TEMPLATES.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description?.toLowerCase().includes(lowercaseQuery) ||
      template.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get popular templates (by usage count)
   */
  static getPopularTemplates(): TaskTemplate[] {
    return [...this.BUILTIN_TEMPLATES]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  }

  /**
   * Get favorite templates
   */
  static getFavoriteTemplates(): TaskTemplate[] {
    return this.BUILTIN_TEMPLATES.filter(template => template.isFavorite);
  }

  /**
   * Convert template to tasks
   */
  static templateToTasks(template: TaskTemplate, projectId?: string): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] {
    return template.tasks.map((task, index) => ({
      ...task,
      projectId,
      order: index,
      isCompleted: false,
    }));
  }

  /**
   * Create a custom template from existing tasks
   */
  static createTemplateFromTasks(
    name: string,
    description: string,
    category: string,
    tasks: Task[],
    ownerId: string
  ): TaskTemplate {
    return {
      id: `template-${Date.now()}`,
      name,
      description,
      category,
      isPublic: false,
      isFavorite: false,
      usageCount: 0,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: tasks.map(task => ({
        content: task.content,
        description: task.description,
        priority: task.priority,
        labels: task.labels,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        duration: task.duration,
        recurringPattern: task.recurringPattern,
        projectId: task.projectId,
        sectionId: task.sectionId,
        assigneeId: task.assigneeId,
        parentTaskId: task.parentTaskId,
        order: task.order,
      })),
    };
  }

  /**
   * Validate template structure
   */
  static validateTemplate(template: Partial<TaskTemplate>): string[] {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.tasks || template.tasks.length === 0) {
      errors.push('Template must have at least one task');
    }

    if (template.tasks) {
      template.tasks.forEach((task, index) => {
        if (!task.content || task.content.trim().length === 0) {
          errors.push(`Task ${index + 1} must have content`);
        }
      });
    }

    if (!template.category) {
      errors.push('Template category is required');
    }

    return errors;
  }

  /**
   * Get template suggestions based on current tasks
   */
  static getTemplateSuggestions(tasks: Task[]): TaskTemplate[] {
    // Analyze current tasks to suggest relevant templates
    const taskContents = tasks.map(task => task.content.toLowerCase());
    
    const suggestions: TaskTemplate[] = [];

    // Check for planning-related tasks
    if (taskContents.some(content => content.includes('plan') || content.includes('review'))) {
      suggestions.push(...this.getTemplatesByCategory('productivity'));
    }

    // Check for work-related tasks
    if (taskContents.some(content => content.includes('meeting') || content.includes('project'))) {
      suggestions.push(...this.getTemplatesByCategory('work'));
    }

    // Check for personal tasks
    if (taskContents.some(content => content.includes('home') || content.includes('clean'))) {
      suggestions.push(...this.getTemplatesByCategory('personal'));
    }

    // Remove duplicates and limit to 5 suggestions
    return Array.from(new Set(suggestions)).slice(0, 5);
  }

  /**
   * Increment template usage count
   */
  static incrementUsageCount(templateId: string): TaskTemplate | null {
    const template = this.BUILTIN_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      template.usageCount++;
      template.updatedAt = new Date();
      return template;
    }
    return null;
  }
}