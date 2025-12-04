import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Task, TimeSession } from '../../types';
import { 
  Play, 
  Pause, 
  Clock, 
  Plus, 
  Check
} from 'lucide-react';

interface TimeTrackingProps {
  task: Task;
}

export const TimeTracking: React.FC<TimeTrackingProps> = ({ task }) => {
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  
  const { 
    startTimeTracking, 
    stopTimeTracking, 
    addTimeSession,
    getTaskTimeTracking 
  } = useAppStore();
  
  const timeTracking = getTaskTimeTracking(task.id);

  // Update current time when tracking
  useEffect(() => {
    let interval: number;
    
    if (timeTracking?.isTracking && timeTracking.currentSessionStart) {
      interval = setInterval(() => {
        setCurrentTime(Math.round((Date.now() - timeTracking.currentSessionStart!.getTime()) / (1000 * 60)));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeTracking]);

  const handleStartTracking = () => {
    startTimeTracking(task.id);
  };

  const handleStopTracking = () => {
    stopTimeTracking(task.id);
  };

  const handleAddSession = () => {
    if (!sessionDuration.trim()) return;
    
    const minutes = parseInt(sessionDuration);
    if (isNaN(minutes) || minutes <= 0) return;
    
    addTimeSession({
      taskId: task.id,
      startTime: new Date(),
      endTime: new Date(),
      duration: minutes,
      description: sessionDescription.trim()
    });
    
    setSessionDescription('');
    setSessionDuration('');
    setIsAddingSession(false);
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const formatSessionTime = (session: TimeSession) => {
    const startTime = session.startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    if (session.endTime) {
      const endTime = session.endTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      return `${startTime} - ${endTime}`;
    }
    
    return startTime;
  };

  const totalTime = timeTracking?.totalTime || 0;
  const displayTime = timeTracking?.isTracking ? currentTime : totalTime;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      {/* Current Time Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-500" />
          <div>
            <div className="text-2xl font-semibold text-gray-900">
              {formatMinutes(displayTime)}
            </div>
            <div className="text-xs text-gray-500">
              {timeTracking?.isTracking ? 'Currently tracking' : 'Total time'}
            </div>
          </div>
        </div>
        
        {/* Tracking Controls */}
        <div className="flex items-center gap-2">
          {timeTracking?.isTracking ? (
            <button
              onClick={handleStopTracking}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <Pause className="h-4 w-4" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleStartTracking}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Play className="h-4 w-4" />
              Start
            </button>
          )}
          
          <button
            onClick={() => setIsAddingSession(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Time
          </button>
        </div>
      </div>

      {/* Add Time Session */}
      {isAddingSession && (
        <div className="bg-white border border-gray-200 rounded-md p-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(e.target.value)}
              placeholder="Minutes"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
            <input
              type="text"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder="Description (optional)"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setIsAddingSession(false);
                setSessionDescription('');
                setSessionDuration('');
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSession}
              className="flex items-center gap-1 px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              <Check className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Time Sessions */}
      {timeTracking?.sessions && timeTracking.sessions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Time History</h4>
          <div className="space-y-1">
            {timeTracking.sessions
              .slice()
              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatMinutes(session.duration || 0)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatSessionTime(session)}
                      </span>
                    </div>
                    {session.description && (
                      <div className="text-xs text-gray-600 mt-1">
                        {session.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};