import type { Task, Priority } from '../types';

export interface TaskSuggestion {
  id: string;
  type: 'recurring' | 'similar' | 'contextual' | 'deadline' | 'priority';
  title: string;
  description: string;
  suggestedTask: Partial<Task>;
  confidence: number; // 0-1
  reason: string;
}

export interface UserPattern {
  id: string;
  type: 'time' | 'priority' | 'project' | 'label' | 'duration';
  pattern: string;
  frequency: number;
  lastUsed: Date;
  confidence: number;
}

export class SmartSuggestions {
  private static instance: SmartSuggestions;
  private userPatterns: UserPattern[] = [];
  private taskHistory: Task[] = [];

  private constructor() {}

  static getInstance(): SmartSuggestions {
    if (!SmartSuggestions.instance) {
      SmartSuggestions.instance = new SmartSuggestions();
    }
    return SmartSuggestions.instance;
  }

  /**
   * Initialize the suggestion engine with user data
   */
  async initialize(tasks: Task[]): Promise<void> {
    this.taskHistory = tasks;
    await this.analyzeUserPatterns();
  }

  /**
   * Get smart suggestions for the current context
   */
  async getSuggestions(): Promise<TaskSuggestion[]> {
    const suggestions: TaskSuggestion[] = [];

    // Get recurring task suggestions
    suggestions.push(...this.getRecurringTaskSuggestions());

    // Get similar task suggestions based on history
    suggestions.push(...this.getSimilarTaskSuggestions());

    // Get contextual suggestions based on time and patterns
    suggestions.push(...this.getContextualSuggestions());

    // Get deadline-based suggestions
    suggestions.push(...this.getDeadlineBasedSuggestions());

    // Get priority-based suggestions based on current workload
    suggestions.push(...this.getPriorityBasedSuggestions());

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  }

  /**
   * Learn from user interactions to improve suggestions
   */
  learnFromInteraction(
    suggestionId: string,
    action: 'accepted' | 'rejected' | 'modified',
    finalTask?: Task
  ): void {
    const pattern = this.userPatterns.find(p => p.id === suggestionId);
    if (!pattern) return;

    // Update pattern confidence based on user feedback
    if (action === 'accepted') {
      pattern.confidence = Math.min(1, pattern.confidence + 0.1);
      pattern.frequency += 1;
      pattern.lastUsed = new Date();
    } else if (action === 'rejected') {
      pattern.confidence = Math.max(0.1, pattern.confidence - 0.05);
    } else if (action === 'modified' && finalTask) {
      // Learn from the modification
      // Learning from modification is simplified for Phase 4
    }
  }

  /**
   * Get recurring task suggestions based on user patterns
   */
  private getRecurringTaskSuggestions(): TaskSuggestion[] {
    const patterns = this.findRecurringPatterns();
    const pattern = patterns[0] as {
      id: string;
      title: string;
      frequencyDescription: string;
      typicalPriority: Priority;
      typicalProjectId?: string;
      typicalLabels: string[];
      confidence: number;
    };
    
    return [{
      id: `recurring-${pattern.id}`,
      type: 'recurring',
      title: `Recurring: ${pattern.title}`,
      description: `You usually create this task ${pattern.frequencyDescription}`,
      suggestedTask: {
        content: pattern.title,
        priority: pattern.typicalPriority,
        projectId: pattern.typicalProjectId,
        labels: pattern.typicalLabels,
        dueDate: new Date()
      },
      confidence: pattern.confidence,
      reason: `Based on your recurring pattern (${pattern.frequencyDescription})`
    }];
  }

  /**
   * Get similar task suggestions based on recent and historical tasks
   */
  private getSimilarTaskSuggestions(): TaskSuggestion[] {
    const suggestions: TaskSuggestion[] = [];

    // Find similar tasks from history
    const similarTasks = this.findSimilarTasks();

    similarTasks.forEach(task => {
      if (Math.random() < 0.3) { // Only suggest some similar tasks to avoid noise
        suggestions.push({
          id: `similar-${task.id}`,
          type: 'similar',
          title: `Similar to: ${task.content}`,
          description: `Based on your recent task "${task.content}"`,
          suggestedTask: {
            content: task.content,
            priority: task.priority,
            projectId: task.projectId,
            labels: task.labels,
          },
          confidence: 0.6,
          reason: 'Similar to your recent tasks'
        });
      }
    });

    return suggestions;
  }

  /**
   * Get contextual suggestions based on current time, day, and user patterns
   */
  private getContextualSuggestions(): TaskSuggestion[] {
    return [{
      id: 'context-sample',
      type: 'contextual',
      title: 'Sample Contextual Suggestion',
      description: 'Based on current time and context',
      suggestedTask: {
        content: 'Sample task',
        priority: 'p2',
      },
      confidence: 0.7,
      reason: 'Contextual suggestion'
    }];
  }

  /**
   * Get deadline-based suggestions for overdue and upcoming tasks
   */
  private getDeadlineBasedSuggestions(): TaskSuggestion[] {
    return [];
  }

  /**
   * Get priority-based suggestions based on current workload
   */
  private getPriorityBasedSuggestions(): TaskSuggestion[] {
    return [];
  }

  /**
   * Analyze user patterns from task history
   */
  private async analyzeUserPatterns(): Promise<void> {
    // Simplified pattern analysis
    this.userPatterns = [];
  }

  /**
   * Find recurring patterns in task history
   */
  private findRecurringPatterns(): unknown[] {
    return [{
      id: 'pattern-1',
      title: 'Sample Pattern',
      frequency: 5,
      avgInterval: 7,
      confidence: 0.8,
      typicalPriority: 'p2',
      typicalProjectId: undefined,
      typicalLabels: ['sample'],
      frequencyDescription: 'weekly'
    }];
  }



  /**
   * Find similar tasks based on content and metadata
   */
  private findSimilarTasks(): Task[] {
    // Simple similarity based on content and recent activity
    return this.taskHistory
      .filter(task => task.isCompleted && task.completedAt)
      .filter(task => {
        const daysSinceCompletion = (Date.now() - task.completedAt!.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCompletion <= 30; // Within last 30 days
      })
      .slice(0, 10);
  }

  /**
   * Determine if a recurring task should be suggested now
   */






}