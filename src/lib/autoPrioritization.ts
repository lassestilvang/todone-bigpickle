import type { Task, Priority } from '../types';

export interface PriorityRule {
  id: string;
  name: string;
  description: string;
  condition: PriorityCondition;
  action: PriorityAction;
  isActive: boolean;
  priority: number; // Rule priority (higher = more important)
  createdAt: Date;
  updatedAt: Date;
}

export interface PriorityCondition {
  type: 'due_date' | 'project' | 'label' | 'duration' | 'workload' | 'dependency' | 'complex';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'less_than' | 'greater_than' | 'before' | 'after' | 'within';
  value: string | number | Date | string[];
  weight?: number; // Importance factor for this condition
}

export interface PriorityAction {
  type: 'set_priority' | 'adjust_priority' | 'escalate' | 'de_escalate';
  value: Priority | number; // Priority or adjustment amount
  reason?: string;
}

export interface PriorityAnalysis {
  taskId: string;
  currentPriority: Priority;
  suggestedPriority: Priority;
  confidence: number; // 0-1
  factors: PriorityFactor[];
  reasoning: string;
}

export interface PriorityFactor {
  type: string;
  weight: number;
  value: number;
  description: string;
}

export class AutoPrioritization {
  private static instance: AutoPrioritization;
  private rules: PriorityRule[] = [];
  private defaultRules: PriorityRule[] = [];

  private constructor() {
    this.initializeDefaultRules();
  }

  static getInstance(): AutoPrioritization {
    if (!AutoPrioritization.instance) {
      AutoPrioritization.instance = new AutoPrioritization();
    }
    return AutoPrioritization.instance;
  }

  /**
   * Initialize default priority rules
   */
  private initializeDefaultRules(): void {
    this.defaultRules = [
      {
        id: 'overdue-urgent',
        name: 'Overdue Tasks',
        description: 'Automatically set overdue tasks to P1',
        condition: {
          type: 'due_date',
          operator: 'before',
          value: new Date(),
          weight: 0.9
        },
        action: {
          type: 'set_priority',
          value: 'p1',
          reason: 'Task is overdue'
        },
        isActive: true,
        priority: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'due-today-high',
        name: 'Due Today',
        description: 'Set tasks due today to P2',
        condition: {
          type: 'due_date',
          operator: 'within',
          value: 1, // Within 1 day
          weight: 0.7
        },
        action: {
          type: 'set_priority',
          value: 'p2',
          reason: 'Task is due today'
        },
        isActive: true,
        priority: 90,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'due-soon-medium',
        name: 'Due Soon',
        description: 'Set tasks due within 3 days to P3',
        condition: {
          type: 'due_date',
          operator: 'within',
          value: 3, // Within 3 days
          weight: 0.5
        },
        action: {
          type: 'set_priority',
          value: 'p3',
          reason: 'Task is due soon'
        },
        isActive: true,
        priority: 80,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'blocking-tasks-urgent',
        name: 'Blocking Tasks',
        description: 'Escalate priority of tasks that block other tasks',
        condition: {
          type: 'dependency',
          operator: 'contains',
          value: 'blocking',
          weight: 0.8
        },
        action: {
          type: 'escalate',
          value: 1, // Escalate by 1 level
          reason: 'Task blocks other tasks'
        },
        isActive: true,
        priority: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'urgent-labels',
        name: 'Urgent Labels',
        description: 'Set tasks with urgent labels to P1',
        condition: {
          type: 'label',
          operator: 'contains',
          value: ['urgent', 'critical', 'emergency'],
          weight: 0.9
        },
        action: {
          type: 'set_priority',
          value: 'p1',
          reason: 'Task has urgent label'
        },
        isActive: true,
        priority: 95,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'work-projects',
        name: 'Work Projects',
        description: 'Prioritize work-related tasks during business hours',
        condition: {
          type: 'project',
          operator: 'contains',
          value: 'work',
          weight: 0.3
        },
        action: {
          type: 'adjust_priority',
          value: 1, // Increase priority by 1 level
          reason: 'Work-related task during business hours'
        },
        isActive: true,
        priority: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'long-duration',
        name: 'Long Duration Tasks',
        description: 'Increase priority for tasks that require significant time',
        condition: {
          type: 'duration',
          operator: 'greater_than',
          value: 120, // More than 2 hours
          weight: 0.4
        },
        action: {
          type: 'adjust_priority',
          value: 1,
          reason: 'Task requires significant time investment'
        },
        isActive: true,
        priority: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.rules = [...this.defaultRules];
  }

  /**
   * Analyze and suggest priority for a task
   */
  analyzeTask(task: Task, allTasks: Task[] = []): PriorityAnalysis {
    const factors: PriorityFactor[] = [];
    let totalWeight = 0;
    let weightedScore = 0;

    // Apply all active rules
    const activeRules = this.rules
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of activeRules) {
      if (this.evaluateCondition(rule.condition, task, allTasks)) {
        const factor = this.createFactor(rule);
        factors.push(factor);
        totalWeight += factor.weight;
        weightedScore += this.priorityToNumber(rule.action.value as Priority) * factor.weight;
      }
    }

    // Add contextual factors
    const contextualFactors = this.getContextualFactors(task, allTasks);
    factors.push(...contextualFactors);
    contextualFactors.forEach(factor => {
      totalWeight += factor.weight;
      weightedScore += factor.value * factor.weight;
    });

    // Calculate suggested priority
    const suggestedScore = totalWeight > 0 ? weightedScore / totalWeight : this.priorityToNumber(task.priority);
    const suggestedPriority = this.numberToPriority(Math.round(suggestedScore));

    // Calculate confidence based on number of matching factors
    const confidence = Math.min(0.95, factors.length * 0.15 + 0.2);

    return {
      taskId: task.id,
      currentPriority: task.priority,
      suggestedPriority,
      confidence,
      factors,
      reasoning: this.generateReasoning(factors, suggestedPriority)
    };
  }

  /**
   * Auto-prioritize a task based on analysis
   */
  async autoPrioritizeTask(task: Task, allTasks: Task[] = []): Promise<{
    task: Task;
    analysis: PriorityAnalysis;
    changed: boolean;
  }> {
    const analysis = this.analyzeTask(task, allTasks);
    
    // Only change priority if confidence is high enough and priority is different
    const shouldChange = analysis.confidence >= 0.6 && analysis.suggestedPriority !== task.priority;
    
    if (shouldChange) {
      const updatedTask = {
        ...task,
        priority: analysis.suggestedPriority,
        updatedAt: new Date()
      };

      return {
        task: updatedTask,
        analysis,
        changed: true
      };
    }

    return {
      task,
      analysis,
      changed: false
    };
  }

  /**
   * Batch auto-prioritize multiple tasks
   */
  async autoPrioritizeTasks(tasks: Task[]): Promise<{
    results: Array<{ task: Task; analysis: PriorityAnalysis; changed: boolean }>;
    summary: { total: number; changed: number; unchanged: number };
  }> {
    const results = await Promise.all(
      tasks.map(task => this.autoPrioritizeTask(task, tasks))
    );

    const summary = {
      total: tasks.length,
      changed: results.filter(r => r.changed).length,
      unchanged: results.filter(r => !r.changed).length
    };

    return { results, summary };
  }

  /**
   * Add a custom priority rule
   */
  addRule(rule: Omit<PriorityRule, 'id' | 'createdAt' | 'updatedAt'>): PriorityRule {
    const newRule: PriorityRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rules.push(newRule);
    return newRule;
  }

  /**
   * Update an existing priority rule
   */
  updateRule(ruleId: string, updates: Partial<PriorityRule>): PriorityRule | null {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return null;

    this.rules[ruleIndex] = {
      ...this.rules[ruleIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.rules[ruleIndex];
  }

  /**
   * Delete a priority rule
   */
  deleteRule(ruleId: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== ruleId);
    return this.rules.length < initialLength;
  }

  /**
   * Get all rules
   */
  getRules(): PriorityRule[] {
    return [...this.rules];
  }

  /**
   * Get active rules
   */
  getActiveRules(): PriorityRule[] {
    return this.rules.filter(rule => rule.isActive);
  }

  /**
   * Evaluate if a condition matches a task
   */
  private evaluateCondition(condition: PriorityCondition, task: Task, allTasks: Task[]): boolean {
    switch (condition.type) {
      case 'due_date':
        return this.evaluateDueDateCondition(condition, task);
      case 'project':
        return this.evaluateProjectCondition(condition, task);
      case 'label':
        return this.evaluateLabelCondition(condition, task);
      case 'duration':
        return this.evaluateDurationCondition(condition, task);
      case 'workload':
        return this.evaluateWorkloadCondition(condition, task, allTasks);
      case 'dependency':
        return this.evaluateDependencyCondition(condition, task, allTasks);
      case 'complex':
        return this.evaluateComplexCondition();
      default:
        return false;
    }
  }

  /**
   * Evaluate due date conditions
   */
  private evaluateDueDateCondition(condition: PriorityCondition, task: Task): boolean {
    if (!task.dueDate) return false;

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    switch (condition.operator) {
      case 'before':
        return dueDate < (condition.value as Date);
      case 'after':
        return dueDate > (condition.value as Date);
      case 'within':
        return daysUntilDue <= (condition.value as number) && daysUntilDue >= 0;
      case 'greater_than':
        return daysUntilDue > (condition.value as number);
      case 'less_than':
        return daysUntilDue < (condition.value as number);
      default:
        return false;
    }
  }

  /**
   * Evaluate project conditions
   */
  private evaluateProjectCondition(condition: PriorityCondition, task: Task): boolean {
    if (!task.projectId) return false;

    const projectValue = task.projectId.toLowerCase();
    const conditionValue = (condition.value as string).toLowerCase();

    switch (condition.operator) {
      case 'equals':
        return projectValue === conditionValue;
      case 'not_equals':
        return projectValue !== conditionValue;
      case 'contains':
        return projectValue.includes(conditionValue);
      case 'not_contains':
        return !projectValue.includes(conditionValue);
      default:
        return false;
    }
  }

  /**
   * Evaluate label conditions
   */
  private evaluateLabelCondition(condition: PriorityCondition, task: Task): boolean {
    const taskLabels = task.labels.map(l => l.toLowerCase());
    const conditionValues = Array.isArray(condition.value) 
      ? (condition.value as string[]).map(v => v.toLowerCase())
      : [(condition.value as string).toLowerCase()];

    switch (condition.operator) {
      case 'contains':
        return conditionValues.some(v => taskLabels.includes(v));
      case 'not_contains':
        return !conditionValues.some(v => taskLabels.includes(v));
      default:
        return false;
    }
  }

  /**
   * Evaluate duration conditions
   */
  private evaluateDurationCondition(condition: PriorityCondition, task: Task): boolean {
    const duration = task.duration || 0;

    switch (condition.operator) {
      case 'greater_than':
        return duration > (condition.value as number);
      case 'less_than':
        return duration < (condition.value as number);
      case 'equals':
        return duration === (condition.value as number);
      default:
        return false;
    }
  }

  /**
   * Evaluate workload conditions
   */
  private evaluateWorkloadCondition(condition: PriorityCondition, _task: Task, allTasks: Task[]): boolean {
    const activeTasksCount = allTasks.filter(t => !t.isCompleted).length;

    switch (condition.operator) {
      case 'greater_than':
        return activeTasksCount > (condition.value as number);
      case 'less_than':
        return activeTasksCount < (condition.value as number);
      default:
        return false;
    }
  }

  /**
   * Evaluate dependency conditions
   */
  private evaluateDependencyCondition(_condition: PriorityCondition, _task: Task, _allTasks: Task[]): boolean {
    // Check if this task blocks other tasks
    const blockingTasks = _allTasks.filter(t => 
      t.dependencies?.includes(_task.id) && !t.isCompleted
    );

    const isBlocking = blockingTasks.length > 0;

    switch (_condition.operator) {
      case 'contains':
        return _condition.value === 'blocking' ? isBlocking : false;
      default:
        return false;
    }
  }

  /**
   * Evaluate complex conditions
   */
  private evaluateComplexCondition(): boolean {
    // Simplified complex evaluation
    return false;
  }

  /**
   * Get contextual factors for priority analysis
   */
  private getContextualFactors(_task: Task, _allTasks: Task[]): PriorityFactor[] {
    const factors: PriorityFactor[] = [];
    const now = new Date();

    // Time of day factor
    const hour = now.getHours();
    if (hour >= 9 && hour <= 17) {
      // Business hours - slightly increase priority
      factors.push({
        type: 'time_of_day',
        weight: 0.1,
        value: 0.2,
        description: 'Business hours'
      });
    }

    // Day of week factor
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 1) { // Monday
      factors.push({
        type: 'day_of_week',
        weight: 0.1,
        value: 0.1,
        description: 'Monday planning'
      });
    } else if (dayOfWeek === 5) { // Friday
      factors.push({
        type: 'day_of_week',
        weight: 0.1,
        value: -0.1,
        description: 'Friday wrap-up'
      });
    }

    // Workload factor
    const activeTasks = _allTasks.filter((t: Task) => !t.isCompleted).length;
    if (activeTasks > 10) {
      factors.push({
        type: 'workload',
        weight: 0.2,
        value: -0.2,
        description: 'High workload - deprioritize non-urgent tasks'
      });
    }

    return factors;
  }

  /**
   * Create a priority factor from a rule
   */
  private createFactor(rule: PriorityRule): PriorityFactor {
    return {
      type: rule.condition.type,
      weight: rule.condition.weight || 0.5,
      value: this.priorityToNumber(rule.action.value as Priority),
      description: rule.action.reason || rule.name
    };
  }

  /**
   * Generate reasoning for priority suggestion
   */
  private generateReasoning(_factors: PriorityFactor[], suggestedPriority: Priority): string {
    if (_factors.length === 0) {
      return 'No specific factors identified - maintaining current priority';
    }

    const topFactors = _factors
      .sort((a: PriorityFactor, b: PriorityFactor) => b.weight - a.weight)
      .slice(0, 3)
      .map((f: PriorityFactor) => f.description)
      .join(', ');

    return `Priority set to ${suggestedPriority.toUpperCase()} based on: ${topFactors}`;
  }

  /**
   * Convert priority to number for calculations
   */
  private priorityToNumber(_priority: Priority): number {
    switch (_priority) {
      case 'p1': return 4;
      case 'p2': return 3;
      case 'p3': return 2;
      case 'p4': return 1;
      default: return 2;
    }
  }

  /**
   * Convert number to priority
   */
  private numberToPriority(_num: number): Priority {
    if (_num >= 3.5) return 'p1';
    if (_num >= 2.5) return 'p2';
    if (_num >= 1.5) return 'p3';
    return 'p4';
  }
}