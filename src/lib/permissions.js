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
  // Fallback for legacy data or superadmin override
  if (user.role === 'superadmin' || user.roleId === 'superadmin') return true;
  
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

export const DEFAULT_ROLES = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    permissions: Object.values(PERMISSIONS)
  },
  {
    id: 'guest',
    name: 'Guest',
    permissions: [PERMISSIONS.VIEW_ANALYTICS] // Guests can view analytics and read-only data
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