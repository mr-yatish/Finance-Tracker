export type Role = 'ADMIN' | 'USER';
export type Permission = 'DELETE_USER' | 'EDIT_USER' | 'VIEW_LOGS' | 'MANAGE_BANKS' | 'VIEW_ANALYTICS';

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    ADMIN: ['DELETE_USER', 'EDIT_USER', 'VIEW_LOGS', 'MANAGE_BANKS', 'VIEW_ANALYTICS'],
    USER: []
};
