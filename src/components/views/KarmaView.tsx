import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { KarmaService, type ProductivityStats } from '../../lib/karmaService';
import { 
  Trophy, 
  Flame, 
  Target, 
  Calendar,
  Clock,
  Award,
  Star,
  Zap,
  BarChart3
} from 'lucide-react';

export const KarmaDashboard: React.FC = () => {
  const { user, tasks } = useAppStore();
  const [stats, setStats] = useState<ProductivityStats | null>(null);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && tasks) {
        const productivityStats = KarmaService.calculateProductivityStats(tasks, user.id, timeframe);
        setStats(productivityStats);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, tasks, timeframe]);

  if (!user || !stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const levelProgress = KarmaService.getLevelProgress(user.karma.points);
  const levelColor = KarmaService.getLevelColor(user.karma.level);
  const levelName = KarmaService.getLevelDisplayName(user.karma.level);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productivity Dashboard</h1>
          <p className="text-gray-600">Track your progress and achievements</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'today' | 'week' | 'month')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${levelColor} flex items-center justify-center`}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{levelName}</h2>
              <p className="text-sm text-gray-600">{user.karma.points.toLocaleString()} karma points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.productivityScore}</div>
            <div className="text-sm text-gray-600">Productivity Score</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Level Progress</span>
            <span className="text-gray-900">
              {user.karma.points - levelProgress.current} / {levelProgress.next - levelProgress.current}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${levelProgress.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Completed */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">
              {timeframe === 'today' ? 'Today' : timeframe === 'week' ? 'This Week' : 'This Month'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {timeframe === 'today' ? stats.tasksCompletedToday : 
             timeframe === 'week' ? stats.tasksCompletedThisWeek : 
             stats.tasksCompletedThisMonth}
          </div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500">Days</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">Days</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.longestStreak}</div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>

        {/* Focus Time */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">Hours</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(stats.focusTime / 60 * 10) / 10}
          </div>
          <div className="text-sm text-gray-600">Focus Time</div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Goal */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Goal</h3>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.tasksCompletedToday} / {user.karma.dailyGoal} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.tasksCompletedToday >= user.karma.dailyGoal 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (stats.tasksCompletedToday / user.karma.dailyGoal) * 100)}%` 
                }}
              ></div>
            </div>
            {stats.tasksCompletedToday >= user.karma.dailyGoal && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Zap className="w-4 h-4" />
                Daily goal achieved! +50 karma points
              </div>
            )}
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Goal</h3>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.tasksCompletedThisWeek} / {user.karma.weeklyGoal} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.tasksCompletedThisWeek >= user.karma.weeklyGoal 
                    ? 'bg-green-500' 
                    : 'bg-blue-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (stats.tasksCompletedThisWeek / user.karma.weeklyGoal) * 100)}%` 
                }}
              ></div>
            </div>
            {stats.tasksCompletedThisWeek >= user.karma.weeklyGoal && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Trophy className="w-4 h-4" />
                Weekly goal achieved! +100 karma points
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Productivity Trends */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Productivity Trends</h3>
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.averageTasksPerDay}</div>
            <div className="text-sm text-gray-600">Avg. Tasks per Day</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.productivityScore}%</div>
            <div className="text-sm text-gray-600">Productivity Score</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{user.karma.points.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Karma Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};