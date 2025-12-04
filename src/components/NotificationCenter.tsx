import React, { useState, useEffect } from 'react';
import { notificationService, type Notification } from '../lib/notificationService';
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  Clock, 
  AlertTriangle, 
  Trophy
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Get current permission status on mount only
  const permissionStatus = notificationService.getPermissionStatus();
  const [permission, setPermission] = useState<NotificationPermission>(permissionStatus);

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    return unsubscribe;
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
    }
  };

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const removeNotification = (notificationId: string) => {
    notificationService.removeNotification(notificationId);
  };

  const clearAll = () => {
    notificationService.clearAll();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return Clock;
      case 'overdue':
        return AlertTriangle;
      case 'completed':
        return Check;
      case 'achievement':
        return Trophy;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return 'text-blue-600 bg-blue-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'achievement':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost p-2 relative"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full">
            {unreadCount > 1 && (
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {permission === 'default' && (
                <button
                  onClick={requestPermission}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Enable
                </button>
              )}
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Permission Request */}
          {permission === 'default' && (
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Enable browser notifications
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Get notified about due tasks and reminders even when the tab is closed
                  </p>
                  <button
                    onClick={requestPermission}
                    className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mb-2" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">
                  We'll notify you about upcoming tasks
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50 bg-opacity-30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 rounded hover:bg-gray-200"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3 text-gray-500" />
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="p-1 rounded hover:bg-gray-200"
                            title="Remove"
                          >
                            <X className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 flex justify-between">
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};