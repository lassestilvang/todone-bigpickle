import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Comment, Task } from '../../types';
import { MessageSquare, Send, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

interface CommentsProps {
  task: Task;
  onClose: () => void;
}

export const Comments: React.FC<CommentsProps> = ({ task }) => {
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  
  const { 
    user, 
    getTaskComments, 
    createComment, 
    updateComment, 
    deleteComment 
  } = useAppStore();
  
  const comments = getTaskComments(task.id);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await createComment({
        taskId: task.id,
        userId: user.id,
        content: newComment.trim(),
        attachments: []
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(commentId, { content: editContent.trim() });
      setIsEditing(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setShowMenu(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const startEdit = (comment: Comment) => {
    setIsEditing(comment.id);
    setEditContent(comment.content);
    setShowMenu(null);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              Press Cmd+Enter to send
            </span>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="btn btn-primary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Send className="h-3 w-3" />
              Comment
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Be the first to share your thoughts</p>
          </div>
        ) : (
          comments.map((comment: Comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                  {comment.updatedAt && comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>

                {isEditing === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="btn btn-primary px-3 py-1 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(null);
                          setEditContent('');
                        }}
                        className="btn btn-ghost px-3 py-1 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowMenu(showMenu === comment.id ? null : comment.id)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-3 w-3 text-gray-500" />
                      </button>

                      {showMenu === comment.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => startEdit(comment)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};