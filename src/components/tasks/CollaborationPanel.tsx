import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { CollaborationService } from '../../lib/collaborationService';
import { 
  Share2, 
  Users, 
  Mail, 
  Link, 
  Copy, 
  Shield, 
  Eye, 
  Edit, 
  Crown,
  UserPlus,
  Settings
} from 'lucide-react';

interface CollaborationPanelProps {
  projectId: string;
  onClose: () => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  projectId,
  onClose
}) => {
  const { projects, user } = useAppStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor' | 'admin'>('editor');
  const [shareLink, setShareLink] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return null;
  }

  const isOwner = project.ownerId === user?.id;

  const handleGenerateInvite = () => {
    const link = CollaborationService.generateShareLink(projectId);
    setShareLink(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    // Show toast notification
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;

    const invite = CollaborationService.createInvite(
      projectId,
      user?.id || '',
      inviteEmail,
      selectedRole
    );

    // In a real implementation, send this to your backend
    console.log('Sending invite:', invite);
    
    setInviteEmail('');
    setShowInviteForm(false);
  };

  const getRoleIcon = (role: 'viewer' | 'editor' | 'admin') => {
    switch (role) {
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'admin':
        return <Crown className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Collaboration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Project Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: project.color }}
              ></div>
              <span className="font-medium text-gray-900">{project.name}</span>
            </div>
            <div className="text-sm text-gray-600">
              {isOwner ? 'You are the owner' : `Shared by ${project.ownerId}`}
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Share Link</span>
            </div>
            
            {!shareLink ? (
              <button
                onClick={handleGenerateInvite}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Generate Share Link
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Anyone with this link can join as a {selectedRole}
                </p>
              </div>
            )}
          </div>

          {/* Invite by Email */}
          {isOwner && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Invite by Email</span>
                </div>
                <button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showInviteForm ? 'Cancel' : 'Add'}
                </button>
              </div>

              {showInviteForm && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Role:</label>
                    <div className="space-y-2">
                      {(['viewer', 'editor', 'admin'] as const).map(role => (
                        <label
                          key={role}
                          className="flex items-center gap-3 p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={selectedRole === role}
                            onChange={(e) => setSelectedRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                            className="text-blue-600"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {getRoleIcon(role)}
                            <div>
                              <div className="font-medium text-gray-900">
                                {CollaborationService.getRoleName(role)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {CollaborationService.getRolePermissions(role)[0]}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSendInvite}
                    disabled={!inviteEmail.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Send Invite
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Role Permissions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Role Permissions</span>
            </div>
            
            <div className="space-y-2">
              {(['viewer', 'editor', 'admin'] as const).map(role => (
                <div key={role} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(role)}
                    <span className="font-medium text-gray-900">
                      {CollaborationService.getRoleName(role)}
                    </span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {CollaborationService.getRolePermissions(role).map((permission, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Members</span>
            </div>
            
            <div className="space-y-2">
              {/* Owner */}
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">Owner</div>
                </div>
                <Crown className="h-4 w-4 text-yellow-500" />
              </div>
              
              {/* In a real implementation, show other members here */}
              <div className="text-center py-4 text-gray-500 text-sm">
                No other members yet
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
          >
            Close
          </button>
          {isOwner && (
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-sm transition-colors flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};