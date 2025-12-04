import type { User, Task, KarmaLevel } from '../types';

export interface KarmaEvent {
  id: string;
  type: 'task_completed' | 'task_created' | 'streak_maintained' | 'goal_achieved' | 'bonus';
  points: number;
  description: string;
  timestamp: Date;
  taskId?: string;
}

export interface ProductivityStats {
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  averageTasksPerDay: number;
  currentStreak: number;
  longestStreak: number;
  productivityScore: number;
  focusTime: number; // in minutes
}

export class KarmaService {
  private static readonly POINTS_CONFIG = {
    task_completed: {
      p1: 50,  // High priority
      p2: 30,  // Medium priority
      p3: 20,  // Normal priority
      p4: 10,  // Low priority
    },
    task_created: 5,
    streak_maintained: 25,
    daily_goal_achieved: 50,
    weekly_goal_achieved: 100,
    bonus_early_completion: 20,
    bonus_on_time_completion: 15,
    bonus_recurring_task: 10,
  };

  private static readonly LEVEL_THRESHOLDS: Record<KarmaLevel, number> = {
    beginner: 0,
    novice: 1000,
    intermediate: 2500,
    advanced: 5000,
    professional: 10000,
    expert: 20000,
    master: 50000,
    grandmaster: 100000,
    enlightened: 250000,
  };

  /**
   * Calculate karma points for completing a task
   */
  static calculateTaskCompletionPoints(task: Task): number {
    let points = this.POINTS_CONFIG.task_completed[task.priority] || 10;

    // Bonus for on-time completion
    if (task.dueDate && task.completedAt) {
      const dueTime = new Date(task.dueDate);
      const completedTime = new Date(task.completedAt);
      
      if (completedTime <= dueTime) {
        points += this.POINTS_CONFIG.bonus_on_time_completion;
      }
      
      // Bonus for early completion (more than 24 hours before due)
      if (dueTime.getTime() - completedTime.getTime() > 24 * 60 * 60 * 1000) {
        points += this.POINTS_CONFIG.bonus_early_completion;
      }
    }

    // Bonus for recurring tasks
    if (task.recurringPattern) {
      points += this.POINTS_CONFIG.bonus_recurring_task;
    }

    return points;
  }

  /**
   * Get user's current karma level
   */
  static getKarmaLevel(points: number): KarmaLevel {
    const levels = Object.entries(this.LEVEL_THRESHOLDS)
      .sort(([, a], [, b]) => b - a) as [KarmaLevel, number][];

    for (const [level, threshold] of levels) {
      if (points >= threshold) {
        return level;
      }
    }

    return 'beginner';
  }

  /**
   * Get progress to next level
   */
  static getLevelProgress(points: number): { current: number; next: number; progress: number } {
    const currentLevel = this.getKarmaLevel(points);
    const currentThreshold = this.LEVEL_THRESHOLDS[currentLevel];
    
    const levels = Object.entries(this.LEVEL_THRESHOLDS)
      .sort(([, a], [, b]) => a - b) as [KarmaLevel, number][];
    
    const currentIndex = levels.findIndex(([level]) => level === currentLevel);
    const nextLevel = levels[currentIndex + 1];
    
    if (!nextLevel) {
      return { current: currentThreshold, next: currentThreshold, progress: 100 };
    }

    const nextThreshold = nextLevel[1];
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

    return {
      current: currentThreshold,
      next: nextThreshold,
      progress: Math.min(100, Math.max(0, progress))
    };
  }

  /**
   * Update user karma stats
   */
  static updateKarmaStats(user: User, event: KarmaEvent): User {
    const newPoints = user.karma.points + event.points;
    const newLevel = this.getKarmaLevel(newPoints);
    const levelProgress = this.getLevelProgress(newPoints);

    return {
      ...user,
      karma: {
        ...user.karma,
        points: newPoints,
        level: newLevel,
        currentLevelPoints: levelProgress.current,
        nextLevelPoints: levelProgress.next,
      },
      updatedAt: new Date(),
    };
  }

  /**
   * Calculate productivity stats for a user
   */
  static calculateProductivityStats(
    tasks: Task[],
    _userId: string,
    timeframe: 'today' | 'week' | 'month' = 'today'
  ): ProductivityStats {
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const now = new Date();
    
    let startDate: Date;

    switch (timeframe) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - today.getDay());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const tasksInPeriod = tasks.filter(task => 
      task.completedAt && 
      new Date(task.completedAt) >= startDate &&
      new Date(task.completedAt) <= now
    );

    // Calculate streak
    const streak = this.calculateStreak(tasks);

    // Calculate productivity score (0-100)
    const productivityScore = this.calculateProductivityScore(tasksInPeriod, timeframe);

    return {
      tasksCompletedToday: tasks.filter(task => 
        task.completedAt && 
        new Date(task.completedAt) >= today
      ).length,
      tasksCompletedThisWeek: tasks.filter(task => 
        task.completedAt && 
        new Date(task.completedAt) >= new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))
      ).length,
      tasksCompletedThisMonth: tasks.filter(task => 
        task.completedAt && 
        new Date(task.completedAt) >= new Date(today.getFullYear(), today.getMonth(), 1)
      ).length,
      averageTasksPerDay: this.calculateAverageTasksPerDay(tasks),
      currentStreak: streak.current,
      longestStreak: streak.longest,
      productivityScore,
      focusTime: this.calculateFocusTime(tasksInPeriod),
    };
  }

  /**
   * Calculate task completion streak
   */
  static calculateStreak(tasks: Task[]): { current: number; longest: number } {
    const completedTasks = tasks
      .filter(task => task.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    if (completedTasks.length === 0) {
      return { current: 0, longest: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    // Check if there are completed tasks today
    const hasTaskToday = completedTasks.some(task => {
      const taskDate = new Date(task.completedAt!);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    if (!hasTaskToday) {
      // Check if there are tasks yesterday to continue streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const hasTaskYesterday = completedTasks.some(task => {
        const taskDate = new Date(task.completedAt!);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === yesterday.getTime();
      });

      if (!hasTaskYesterday) {
        return { current: 0, longest: 0 };
      }
    }

    // Calculate streaks
    const uniqueDays = new Set(
      completedTasks.map(task => {
        const date = new Date(task.completedAt!);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

    for (let i = 0; i < sortedDays.length; i++) {
      const currentDay = sortedDays[i];
      const expectedDay = i === 0 ? today.getTime() : sortedDays[i - 1] - 24 * 60 * 60 * 1000;

      if (currentDay === expectedDay || (i === 0 && currentDay === today.getTime())) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  /**
   * Calculate average tasks per day
   */
  static calculateAverageTasksPerDay(tasks: Task[]): number {
    const completedTasks = tasks.filter(task => task.completedAt);
    if (completedTasks.length === 0) return 0;

    const firstTask = completedTasks.reduce((earliest, task) => {
      return new Date(task.completedAt!) < new Date(earliest.completedAt!) ? task : earliest;
    });

    const daysSinceFirst = Math.max(1, Math.ceil(
      (Date.now() - new Date(firstTask.completedAt!).getTime()) / (24 * 60 * 60 * 1000)
    ));

    return Math.round((completedTasks.length / daysSinceFirst) * 10) / 10;
  }

  /**
   * Calculate productivity score (0-100)
   */
  static calculateProductivityScore(tasks: Task[], timeframe: 'today' | 'week' | 'month'): number {
    if (tasks.length === 0) return 0;

    let score = 0;

    // Base score from completed tasks
    score += Math.min(40, tasks.length * 5);

    // Priority bonus
    const priorityBonus = tasks.reduce((total, task) => {
      switch (task.priority) {
        case 'p1': return total + 10;
        case 'p2': return total + 5;
        case 'p3': return total + 2;
        default: return total;
      }
    }, 0);
    score += Math.min(30, priorityBonus);

    // On-time completion bonus
    const onTimeTasks = tasks.filter(task => 
      task.dueDate && task.completedAt && 
      new Date(task.completedAt) <= new Date(task.dueDate)
    );
    score += Math.min(20, (onTimeTasks.length / tasks.length) * 20);

    // Consistency bonus (based on daily completion)
    const uniqueDays = new Set(
      tasks.map(task => {
        const date = new Date(task.completedAt!);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    ).size;

    let expectedDays = 1;
    if (timeframe === 'week') expectedDays = 7;
    if (timeframe === 'month') expectedDays = 30;

    score += Math.min(10, (uniqueDays / expectedDays) * 10);

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate focus time (sum of task durations)
   */
  static calculateFocusTime(tasks: Task[]): number {
    return tasks.reduce((total, task) => total + (task.duration || 0), 0);
  }

  /**
   * Get karma events for a user
   */
  static getKarmaEvents(): KarmaEvent[] {
    // In a real implementation, this would fetch from a database
    // For now, return empty array
    return [];
  }

  /**
   * Check if user achieved daily goal
   */
  static checkDailyGoal(user: User, tasksCompletedToday: number): boolean {
    return tasksCompletedToday >= user.karma.dailyGoal;
  }

  /**
   * Check if user achieved weekly goal
   */
  static checkWeeklyGoal(user: User, tasksCompletedThisWeek: number): boolean {
    return tasksCompletedThisWeek >= user.karma.weeklyGoal;
  }

  /**
   * Get level badge color
   */
  static getLevelColor(level: KarmaLevel): string {
    const colors = {
      beginner: 'bg-gray-500',
      novice: 'bg-green-500',
      intermediate: 'bg-blue-500',
      advanced: 'bg-purple-500',
      professional: 'bg-orange-500',
      expert: 'bg-red-500',
      master: 'bg-yellow-500',
      grandmaster: 'bg-pink-500',
      enlightened: 'bg-gradient-to-r from-purple-500 to-pink-500',
    };
    return colors[level];
  }

  /**
   * Get level display name
   */
  static getLevelDisplayName(level: KarmaLevel): string {
    const names = {
      beginner: 'Beginner',
      novice: 'Novice',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      professional: 'Professional',
      expert: 'Expert',
      master: 'Master',
      grandmaster: 'Grandmaster',
      enlightened: 'Enlightened',
    };
    return names[level];
  }
}