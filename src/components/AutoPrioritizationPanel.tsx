import React, { useState, useEffect } from 'react';
import { Brain, Settings, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import type { PriorityAnalysis, PriorityRule } from '../lib/autoPrioritization';
import { useAppStore } from '../store/appStore';
import { AutoPrioritization } from '../lib/autoPrioritization';

interface AutoPrioritizationPanelProps {
  onTaskUpdate?: (taskId: string, updates: Record<string, unknown>) => void;
}

export const AutoPrioritizationPanel: React.FC<AutoPrioritizationPanelProps> = ({
  onTaskUpdate
}) => {
  const { tasks } = useAppStore();
  const [analyses, setAnalyses] = useState<PriorityAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rules, setRules] = useState<PriorityRule[]>([]);
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);

  const autoPrioritization = AutoPrioritization.getInstance();

  useEffect(() => {
    const loadRules = () => {
      setRules(autoPrioritization.getRules());
    };

    const analyzeTasks = async () => {
      setIsAnalyzing(true);
      try {
        const results = await Promise.all(
          tasks.map(task => autoPrioritization.analyzeTask(task, tasks))
        );
        setAnalyses(results);
      } catch (error) {
        console.error('Error analyzing tasks:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    loadRules();
    if (tasks.length > 0) {
      analyzeTasks();
    }
  }, [tasks, autoPrioritization]);

  const handleAutoPrioritizeAll = async () => {
    setIsAnalyzing(true);
    try {
      const { results } = await autoPrioritization.autoPrioritizeTasks(tasks);
      
      // Apply updates to tasks that changed
      results.forEach(result => {
        if (result.changed && onTaskUpdate) {
          onTaskUpdate(result.task.id, {
            priority: result.task.priority,
            updatedAt: result.task.updatedAt
          });
        }
      });

      // Re-analyze after updates
      setTimeout(() => {
        const analyzeTasks = async () => {
          const results = await Promise.all(
            tasks.map(task => autoPrioritization.analyzeTask(task, tasks))
          );
          setAnalyses(results);
        };
        analyzeTasks();
      }, 100);
    } catch (error) {
      console.error('Error auto-prioritizing tasks:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = async (taskId: string, suggestedPriority: string) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskId, {
        priority: suggestedPriority,
        updatedAt: new Date()
      });
    }
    
    // Re-analyze after update
    setTimeout(() => {
      const analyzeTasks = async () => {
        const results = await Promise.all(
          tasks.map(task => autoPrioritization.analyzeTask(task, tasks))
        );
        setAnalyses(results);
      };
      analyzeTasks();
    }, 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1': return 'text-red-600 bg-red-50 border-red-200';
      case 'p2': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'p3': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'p4': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);

  const changedAnalyses = analyses.filter(a => a.suggestedPriority !== a.currentPriority);
  const highConfidenceChanges = changedAnalyses.filter(a => a.confidence >= 0.7);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-gray-900">Auto-Prioritization</h3>
            {changedAnalyses.length > 0 && (
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                {changedAnalyses.length} suggestions
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRules(!showRules)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{changedAnalyses.length}</div>
            <div className="text-xs text-gray-500">Suggestions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{highConfidenceChanges.length}</div>
            <div className="text-xs text-gray-500">High Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{rules.filter(r => r.isActive).length}</div>
            <div className="text-xs text-gray-500">Active Rules</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={handleAutoPrioritizeAll}
            disabled={isAnalyzing || changedAnalyses.length === 0}
            className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>{isAnalyzing ? 'Processing...' : 'Apply All Suggestions'}</span>
          </button>
        </div>

        {/* Priority Suggestions */}
        {changedAnalyses.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Priority Suggestions</div>
            {changedAnalyses
              .sort((a, b) => b.confidence - a.confidence)
              .slice(0, 5)
              .map(analysis => {
                const task = getTaskById(analysis.taskId);
                if (!task) return null;

                return (
                  <div
                    key={analysis.taskId}
                    className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {task.content}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(analysis.currentPriority)}`}>
                            {analysis.currentPriority.toUpperCase()}
                          </span>
                          <TrendingUp className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(analysis.suggestedPriority)}`}>
                            {analysis.suggestedPriority.toUpperCase()}
                          </span>
                          <span className={`text-xs ${getConfidenceColor(analysis.confidence)}`}>
                            {Math.round(analysis.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApplySuggestion(analysis.taskId, analysis.suggestedPriority)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    
                    {analysis.reasoning && (
                      <div className="text-xs text-gray-600 mt-2">
                        <strong>Reason:</strong> {analysis.reasoning}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <div className="text-sm text-gray-600">All tasks are optimally prioritized</div>
            <div className="text-xs text-gray-500 mt-1">No priority suggestions available</div>
          </div>
        )}

        {/* Rules Management */}
        {showRules && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Priority Rules</h4>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoApplyEnabled}
                  onChange={(e) => setAutoApplyEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700">Auto-apply high confidence</span>
              </label>
            </div>
            
            <div className="space-y-2">
              {rules
                .sort((a, b) => b.priority - a.priority)
                .map(rule => (
                  <div
                    key={rule.id}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      rule.isActive 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {rule.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {rule.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Priority: {rule.priority}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};