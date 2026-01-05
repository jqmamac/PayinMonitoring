// src/lib/audit.js
import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';

/**
 * Log an audit trail entry
 * @param {Object} params
 * @param {string} params.userId - The ID of the user performing the action
 * @param {string} params.userName - The name of the user performing the action
 * @param {string} params.action - Action type: 'CREATE', 'UPDATE', 'DELETE'
 * @param {string} params.entity - Entity type: 'USER', 'PAYIN', 'ROLE', etc.
 * @param {string} params.entityId - ID of the entity being acted upon
 * @param {string} params.details - Detailed description of the action
 * @param {Object} params.changes - Optional: Object containing old/new values for updates
 */
export const logAudit = async ({ 
  userId, 
  userName, 
  action, 
  entity, 
  entityId, 
  details, 
  changes = null 
}) => {
  try {
    const auditRef = ref(db, 'audits');
    const newAuditRef = push(auditRef);
    
    const auditEntry = {
      userId,
      user: userName,
      action,
      entity,
      entityId,
      details,
      timestamp: Date.now(),
      ...(changes && { changes })
    };
    
    await set(newAuditRef, auditEntry);
    return true;
  } catch (error) {
    console.error('Failed to log audit:', error);
    return false;
  }
};

/**
 * Generate descriptive details for user actions
 */
const getActionDetails = (currentUser, action, targetUser, changes) => {
  const userName = targetUser?.name || 'Unknown User';
  const currentUserName = currentUser.name || 'Unknown';
  
  switch (action) {
    case 'CREATE':
      return `${currentUserName} created new user "${userName}" with role ${targetUser?.roleId || 'unknown'}`;
    
    case 'UPDATE':
      if (!changes) return `${currentUserName} updated user "${userName}"`;
      
      const changeList = [];
      if (changes.old?.name !== changes.new?.name) {
        changeList.push(`name: "${changes.old?.name}" → "${changes.new?.name}"`);
      }
      if (changes.old?.username !== changes.new?.username) {
        changeList.push(`username: "${changes.old?.username}" → "${changes.new?.username}"`);
      }
      if (changes.old?.roleId !== changes.new?.roleId) {
        changeList.push(`role: "${changes.old?.roleId}" → "${changes.new?.roleId}"`);
      }
      
      // Check for password change
      if (changes.new?.password) {
        changeList.push('password: [CHANGED]');
      }
      
      return `${currentUserName} updated user "${userName}": ${changeList.join(', ')}`;
    
    case 'DELETE':
      return `${currentUserName} deleted user "${userName}"`;
    
    default:
      return `${currentUserName} performed action on user "${userName}"`;
  }
};

/**
 * Log user-related actions
 * @param {Object} currentUser - Current user performing the action
 * @param {string} action - 'CREATE', 'UPDATE', or 'DELETE'
 * @param {Object} targetUser - User being acted upon
 * @param {Object} changes - Optional: Changes made during update
 */
export const logUserAudit = async (currentUser, action, targetUser, changes = null) => {
  const details = getActionDetails(currentUser, action, targetUser, changes);
  
  return await logAudit({
    userId: currentUser.id,
    userName: currentUser.name || 'Unknown',
    action,
    entity: 'USER',
    entityId: targetUser?.id || 'new',
    details,
    changes
  });
};

// Quick audit helper for common user operations
export const auditHelpers = {
  async logUserCreate(currentUser, newUser) {
    return await logUserAudit(currentUser, 'CREATE', newUser);
  },
  
  async logUserUpdate(currentUser, oldUser, newUser) {
    const changes = {
      old: oldUser,
      new: newUser
    };
    return await logUserAudit(currentUser, 'UPDATE', newUser, changes);
  },
  
  async logUserDelete(currentUser, deletedUser) {
    return await logUserAudit(currentUser, 'DELETE', deletedUser);
  }
};