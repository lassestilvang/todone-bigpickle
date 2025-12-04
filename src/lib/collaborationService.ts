import type { 
  User, 
  Project, 
  Task, 
  CollaborationInvite, 
  ProjectMember, 
  ActivityLog 
} from '../types';

export class CollaborationService {
  /**
   * Generate invite token for project collaboration
   */
  static generateInviteToken(): string {
    return btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }

  /**
   * Create collaboration invite
   */
  static createInvite(
    projectId: string,
    inviterId: string,
    inviteeEmail: string,
    role: 'viewer' | 'editor' | 'admin'
  ): CollaborationInvite {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      id: `invite-${Date.now()}`,
      projectId,
      inviterId,
      inviteeEmail,
      role,
      status: 'pending',
      token: this.generateInviteToken(),
      createdAt: now,
      expiresAt,
    };
  }

  /**
   * Validate invite token
   */
  static validateInvite(invite: CollaborationInvite): boolean {
    if (invite.status !== 'pending') {
      return false;
    }

    if (new Date() > invite.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Accept collaboration invite
   */
  static acceptInvite(
    invite: CollaborationInvite,
    userId: string
  ): ProjectMember {
    return {
      id: `member-${Date.now()}`,
      projectId: invite.projectId,
      userId,
      role: invite.role,
      joinedAt: new Date(),
      invitedBy: invite.inviterId,
    };
  }

  /**
   * Check user permissions for project
   */
  static hasPermission(
    user: User,
    project: Project,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _requiredRole: 'viewer' | 'editor' | 'admin'
  ): boolean {
    // Owner has all permissions
    if (project.ownerId === user.id) {
      return true;
    }

    // In a real implementation, you would check ProjectMember table
    // For now, return false for non-owners
    return false;
  }

  /**
   * Log activity
   */
  static logActivity(
    entityType: 'task' | 'project' | 'comment',
    entityId: string,
    action: 'created' | 'updated' | 'deleted' | 'completed' | 'assigned',
    userId: string,
    details: Record<string, unknown> = {}
  ): ActivityLog {
    return {
      id: `activity-${Date.now()}`,
      entityType,
      entityId,
      action,
      userId,
      details,
      createdAt: new Date(),
    };
  }

  /**
   * Get activity description
   */
  static getActivityDescription(activity: ActivityLog, user?: User): string {
    const userName = user?.name || 'Someone';
    
    switch (activity.action) {
      case 'created':
        return `${userName} created this ${activity.entityType}`;
      case 'updated':
        return `${userName} updated this ${activity.entityType}`;
      case 'deleted':
        return `${userName} deleted this ${activity.entityType}`;
      case 'completed':
        return `${userName} completed this ${activity.entityType}`;
      case 'assigned': {
        const assignedTo = (activity.details as { assignedToName?: string }).assignedToName || 'someone';
        return `${userName} assigned this ${activity.entityType} to ${assignedTo}`;
      }
      default:
        return `${userName} performed an action on this ${activity.entityType}`;
    }
  }

  /**
   * Generate share link for project
   */
  static generateShareLink(_projectId: string, baseUrl: string = window.location.origin): string {
    const token = this.generateInviteToken();
    return `${baseUrl}/invite/${token}`;
  }

  /**
   * Get user-friendly role name
   */
  static getRoleName(role: 'viewer' | 'editor' | 'admin'): string {
    switch (role) {
      case 'viewer':
        return 'Viewer';
      case 'editor':
        return 'Editor';
      case 'admin':
        return 'Admin';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get role permissions description
   */
  static getRolePermissions(role: 'viewer' | 'editor' | 'admin'): string[] {
    switch (role) {
      case 'viewer':
        return [
          'View tasks and project details',
          'Add comments',
          'Receive notifications'
        ];
      case 'editor':
        return [
          'All viewer permissions',
          'Create and edit tasks',
          'Mark tasks complete',
          'Manage labels and filters'
        ];
      case 'admin':
        return [
          'All editor permissions',
          'Manage project settings',
          'Invite and remove members',
          'Delete project'
        ];
      default:
        return [];
    }
  }

  /**
   * Check if user can perform action on task
   */
  static canPerformTaskAction(
    user: User,
    task: Task,
    project: Project,
    action: 'view' | 'edit' | 'delete' | 'complete' | 'assign'
  ): boolean {
    // Owner can do everything
    if (project.ownerId === user.id) {
      return true;
    }

    // Task assignee can complete and edit their own tasks
    if (task.assigneeId === user.id) {
      return ['view', 'edit', 'complete'].includes(action);
    }

    // In a real implementation, check project member role
    // For now, only allow basic viewing
    return action === 'view';
  }

  /**
   * Format activity time
   */
  static formatActivityTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 7 * 24 * 60) {
      const days = Math.floor(diffInMinutes / (24 * 60));
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get notification message for activity
   */
  static getNotificationMessage(activity: ActivityLog, actorName: string, entityName?: string): string {
    const entity = entityName || activity.entityType;
    
    switch (activity.action) {
      case 'created':
        return `${actorName} created a new ${entity}`;
      case 'updated':
        return `${actorName} updated ${entity}`;
      case 'completed':
        return `${actorName} completed ${entity}`;
      case 'assigned': {
        const assignedTo = (activity.details as { assignedToName?: string }).assignedToName || 'someone';
        return `${actorName} assigned ${entity} to ${assignedTo}`;
      }
      case 'deleted':
        return `${actorName} deleted ${entity}`;
      default:
        return `${actorName} performed an action on ${entity}`;
    }
  }
}