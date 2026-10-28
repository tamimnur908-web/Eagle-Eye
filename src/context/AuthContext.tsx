import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { auth, ADMIN_UID, BUSINESS_EMAIL } from '../lib/firebase';
import { AdminRole, AdminUser, AdminPermissions } from '../types';
import { getAdminByUidOrEmail, getDefaultRolePermissions } from '../services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  adminRole: AdminRole | null;
  adminProfile: AdminUser | null;
  permissions: AdminPermissions;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const defaultPermissions = getDefaultRolePermissions('viewer');

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  adminRole: null,
  adminProfile: null,
  permissions: defaultPermissions,
  loading: true,
  logout: async () => {},
  refreshAdminStatus: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions>(defaultPermissions);
  const [loading, setLoading] = useState<boolean>(true);

  const resolveAdminStatus = useCallback(async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      setAdminProfile(null);
      setPermissions(defaultPermissions);
      return;
    }

    try {
      const primaryEmail = (BUSINESS_EMAIL || 'Tamimnur908@gmail.com').toLowerCase();
      const userEmail = (user.email || '').toLowerCase();
      const isPrimaryOwner = user.uid === ADMIN_UID || userEmail === primaryEmail;

      // 1. Fetch admin record from Firestore 'admins' collection
      const adminRecord = await getAdminByUidOrEmail(user.uid, user.email);

      if (adminRecord) {
        if (adminRecord.status === 'suspended') {
          setIsAdmin(false);
          setAdminRole(null);
          setAdminProfile(adminRecord);
          setPermissions(defaultPermissions);
          return;
        }

        const role = adminRecord.role || 'editor';
        const rolePerms = adminRecord.permissions || getDefaultRolePermissions(role);
        setIsAdmin(true);
        setAdminRole(role);
        setAdminProfile(adminRecord);
        setPermissions(rolePerms);
        return;
      }

      // 2. Fallback check for custom token claim or primary owner UID
      const tokenResult = await user.getIdTokenResult();
      const hasAdminClaim = !!tokenResult.claims.admin;

      if (isPrimaryOwner || hasAdminClaim) {
        setIsAdmin(true);
        setAdminRole('owner');
        setAdminProfile({
          id: user.uid,
          uid: user.uid,
          email: user.email || primaryEmail,
          name: user.displayName || 'Super Admin',
          role: 'owner',
          status: 'active',
          permissions: getDefaultRolePermissions('owner'),
          createdAt: Date.now()
        });
        setPermissions(getDefaultRolePermissions('owner'));
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        setAdminProfile(null);
        setPermissions(defaultPermissions);
      }
    } catch (err) {
      console.error('Error resolving admin permissions:', err);
      // Emergency fallback for primary owner
      if (user.uid === ADMIN_UID || (user.email && user.email.toLowerCase() === (BUSINESS_EMAIL || 'tamimnur908@gmail.com').toLowerCase())) {
        setIsAdmin(true);
        setAdminRole('owner');
        setPermissions(getDefaultRolePermissions('owner'));
      } else {
        setIsAdmin(false);
        setAdminRole(null);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await resolveAdminStatus(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resolveAdminStatus]);

  const refreshAdminStatus = async () => {
    if (currentUser) {
      await resolveAdminStatus(currentUser);
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
    setIsAdmin(false);
    setAdminRole(null);
    setAdminProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        adminRole,
        adminProfile,
        permissions,
        loading,
        logout,
        refreshAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
