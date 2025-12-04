import React, { useState, useEffect } from 'react';
import { Lightbulb, X, Plus, Clock, Target, Calendar, AlertTriangle } from 'lucide-react';
import type { TaskSuggestion } from '../lib/smartSuggestions';
import { useAppStore } from '../store/appStore';
import { SmartSuggestions } from '../lib/smartSuggestions';

interface SmartSuggestionsPanelProps {
  onAcceptSuggestion: (suggestion: TaskSuggestion) => void;
  onClose?: () => void;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  onAcceptSuggestion,
  onClose
}) => {
  const { tasks, projects, labels } = useAppStore();
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoading(true);
      try {
        const suggestionEngine = SmartSuggestions.getInstance();
        await suggestionEngine.initialize(tasks);
        
        const currentSuggestions = await suggestionEngine.getSuggestions();

        const filteredSuggestions = currentSuggestions.filter(
          suggestion => !dismissedSuggestions.has(suggestion.id)
        );

        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [tasks, projects, labels, dismissedSuggestions]);

  const handleAcceptSuggestion = (suggestion: TaskSuggestion) => {
    onAcceptSuggestion(suggestion);
    
    const suggestionEngine = SmartSuggestions.getInstance();
    suggestionEngine.learnFromInteraction(suggestion.id, 'accepted');
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    
    const suggestionEngine = SmartSuggestions.getInstance();
    suggestionEngine.learnFromInteraction(suggestionId, 'rejected');
  };

  const getSuggestionIcon = (type: TaskSuggestion['type']) => {
    switch (type) {
      case 'recurring':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'similar':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'contextual':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'deadline':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'priority':
        return <Target className="w-4 h-4 text-orange-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-medium text-gray-900">Smart Suggestions</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-medium text-gray-900">Smart Suggestions</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-gray-500 text-sm">No suggestions at the moment. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-medium text-gray-900">Smart Suggestions</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {suggestions.length}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1">
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {suggestion.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
                  />
                  <span className="text-xs text-gray-500">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {suggestion.reason}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleDismissSuggestion(suggestion.id)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleAcceptSuggestion(suggestion)}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};