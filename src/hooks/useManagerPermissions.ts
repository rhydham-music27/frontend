import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { USER_ROLES } from '../constants';

export interface ManagerPermissions {
  canViewSiteLeads?: boolean;
  canVerifyTutors?: boolean;
  canCreateLeads?: boolean;
  canManagePayments?: boolean;
}

/**
 * Hook to check if the current user (manager) has specific permissions
 */
export const useManagerPermissions = () => {
  const user = useSelector(selectCurrentUser);
  
  // Return null if not a manager
  if (!user || user.role !== USER_ROLES.MANAGER) {
    return null;
  }

  // Type guard: managers should have permissions field
  const managerUser = user as typeof user & { permissions?: ManagerPermissions };
  
  const permissions: ManagerPermissions = managerUser.permissions || {
    canViewSiteLeads: false,
    canVerifyTutors: false,
    canCreateLeads: false,
    canManagePayments: false,
  };

  return {
    permissions,
    canViewSiteLeads: permissions.canViewSiteLeads ?? false,
    canVerifyTutors: permissions.canVerifyTutors ?? false,
    canCreateLeads: permissions.canCreateLeads ?? false,
    canManagePayments: permissions.canManagePayments ?? false,
    isManager: true,
  };
};

/**
 * Hook to check any permission and provide error handling
 */
export const usePermissionCheck = (requiredPermission: keyof ManagerPermissions) => {
  const user = useSelector(selectCurrentUser);
  const managerPerms = useManagerPermissions();

  // Admins always have all permissions
  if (user?.role === USER_ROLES.ADMIN) {
    return {
      hasPermission: true,
      isAuthorized: true,
      errorMessage: null,
    };
  }

  // Non-managers don't use this permission system
  if (!managerPerms) {
    return {
      hasPermission: false,
      isAuthorized: false,
      errorMessage: 'This feature requires manager permissions.',
    };
  }

  const hasPermission = managerPerms[requiredPermission];

  return {
    hasPermission,
    isAuthorized: hasPermission,
    errorMessage: hasPermission 
      ? null 
      : `You do not have permission to ${getPermissionDescription(requiredPermission)}. Please contact your administrator.`,
  };
};

function getPermissionDescription(permission: keyof ManagerPermissions): string {
  const descriptions: Record<keyof ManagerPermissions, string> = {
    canViewSiteLeads: 'view and manage admin-created leads',
    canVerifyTutors: 'verify tutor profiles',
    canCreateLeads: 'create new class leads',
    canManagePayments: 'manage payments',
  };
  return descriptions[permission] || 'perform this action';
}

export default useManagerPermissions;
