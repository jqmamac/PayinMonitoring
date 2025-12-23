// src/lib/permissions.js
export const PERMISSIONS = {
  PAYIN_ADD: 'payin_add',
  PAYIN_EDIT: 'payin_edit',
  PAYIN_DELETE: 'payin_delete',
  USER_ADD: 'user_add',
  USER_EDIT: 'user_edit',
  USER_DELETE: 'user_delete',
  ROLE_ADD: 'role_add',
  ROLE_EDIT: 'role_edit',
  ROLE_DELETE: 'role_delete',
  REFERROR_ADD: 'referror_add',
  REFERROR_EDIT: 'referror_edit',
  REFERROR_DELETE: 'referror_delete',
  MENTOR_ADD: 'mentor_add',
  MENTOR_EDIT: 'mentor_edit',
  MENTOR_DELETE: 'mentor_delete',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_AUDIT: 'view_audit',
};

// Updated signature to accept roles array or rely on pre-hydrated user permissions
export const hasPermission = (user, permission, roles = []) => {
  if (!user) return false;
  
  // Super Admin always has all permissions
  if (user.roleId === 'superadmin') return true;
  
  // If the user object already has the permissions array attached (preferred)
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }

  // Fallback: Check against the provided roles list
  if (roles.length > 0) {
    const userRole = roles.find(r => r.id === user.roleId);
    if (!userRole) return false;
    return userRole.permissions?.includes(permission);
  }
  
  return false;
};

// Get full role object for a user
export const getUserRole = (user, roles = []) => {
  if (!user || !roles.length) return null;
  return roles.find(r => r.id === user.roleId);
};

// Check if user has specific role
export const hasRole = (user, roleId) => {
  return user?.roleId === roleId;
};

// Check if user is Super Admin
export const isSuperAdmin = (user) => {
  return hasRole(user, 'superadmin');
};

// Check if user can edit a specific user
export const canEditUser = (currentUser, targetUserId, roles = []) => {
  // Super Admin can edit anyone
  if (isSuperAdmin(currentUser)) {
    return true;
  }
  
  // Users can edit their own profile
  if (currentUser.id === targetUserId) {
    return true;
  }
  
  // Check if user has USER_EDIT permission for other users
  return hasPermission(currentUser, PERMISSIONS.USER_EDIT, roles);
};

// Check if user can delete a specific user
export const canDeleteUser = (currentUser, targetUserId, roles = []) => {
  // Only users with USER_DELETE permission can delete
  if (!hasPermission(currentUser, PERMISSIONS.USER_DELETE, roles)) {
    return false;
  }
  
  // Cannot delete self (for safety)
  if (currentUser.id === targetUserId) {
    return false;
  }
  
  // Cannot delete Super Admin (id: '1' or role: 'superadmin')
  return true;
};

export const DEFAULT_ROLES = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    permissions: Object.values(PERMISSIONS) // All permissions
  },
  {
    id: 'admin',
    name: 'Admin',
    permissions: [
      PERMISSIONS.PAYIN_ADD,
      PERMISSIONS.PAYIN_EDIT,
      PERMISSIONS.PAYIN_DELETE,
      PERMISSIONS.USER_EDIT, // Can edit any user
      PERMISSIONS.REFERROR_ADD,
      PERMISSIONS.REFERROR_EDIT,
      PERMISSIONS.REFERROR_DELETE,
      PERMISSIONS.MENTOR_ADD,
      PERMISSIONS.MENTOR_EDIT,
      PERMISSIONS.MENTOR_DELETE,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_AUDIT,
    ]
  },
  {
    id: 'manager',
    name: 'Manager',
    permissions: [
      PERMISSIONS.PAYIN_ADD,
      PERMISSIONS.PAYIN_EDIT,
      PERMISSIONS.REFERROR_ADD,
      PERMISSIONS.REFERROR_EDIT,
      PERMISSIONS.MENTOR_ADD,
      PERMISSIONS.MENTOR_EDIT,
      PERMISSIONS.VIEW_ANALYTICS,
    ]
  },
  {
    id: 'user',
    name: 'User',
    permissions: [
      PERMISSIONS.PAYIN_ADD,
      PERMISSIONS.PAYIN_EDIT,
      PERMISSIONS.VIEW_ANALYTICS,
    ]
  },
  {
    id: 'guest',
    name: 'Guest',
    permissions: [PERMISSIONS.VIEW_ANALYTICS]
  }
];

export const DEFAULT_USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Super Admin',
    roleId: 'superadmin'
  }
];