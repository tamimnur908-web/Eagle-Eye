import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as fbSignOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, ADMIN_UID, BUSINESS_EMAIL } from '../lib/firebase';
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
  syncGoogleProfile: () => Promise<string | null>;
  updateUserAvatar: (photoUrl: string) => Promise<void>;
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
  syncGoogleProfile: async () => null,
  updateUserAvatar: async () => {},
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
      const userEmail = (user.email || '').toLowerCase().trim();
      const isPrimaryOwner = user.uid === ADMIN_UID || userEmail === primaryEmail;

      // 1. Fetch admin record from Firestore 'admins' collection
      const adminRecord = await getAdminByUidOrEmail(user.uid, user.email);

      // Check for photo synchronization
      let candidatePhoto = user.photoURL || null;

      // Check providerData for Google photo
      if (!candidatePhoto && user.providerData && user.providerData.length > 0) {
        const pPhoto = user.providerData.find((p) => p.photoURL)?.photoURL;
        if (pPhoto) candidatePhoto = pPhoto;
      }

      // Check localStorage for previously synced avatar
      if (!candidatePhoto && userEmail) {
        try {
          const cached = localStorage.getItem(`eed_avatar_${userEmail}`);
          if (cached) candidatePhoto = cached;
        } catch {}
      }

      // Check Firestore user doc
      if (!candidatePhoto) {
        try {
          const uSnap = await getDoc(doc(db, 'users', user.uid));
          if (uSnap.exists()) {
            const uData = uSnap.data();
            if (uData.photoURL || uData.avatarUrl) {
              candidatePhoto = uData.photoURL || uData.avatarUrl;
            }
          }
        } catch {}
      }

      // Check admin record for avatar
      if (!candidatePhoto && adminRecord && ((adminRecord as any).avatar || (adminRecord as any).photoURL)) {
        candidatePhoto = (adminRecord as any).avatar || (adminRecord as any).photoURL;
      }

      // If a candidate photo was found and user.photoURL is missing, sync to Firebase Auth user profile
      if (candidatePhoto && !user.photoURL) {
        try {
          await updateProfile(user, { photoURL: candidatePhoto });
        } catch {}
        if (userEmail) {
          try {
            localStorage.setItem(`eed_avatar_${userEmail}`, candidatePhoto);
          } catch {}
        }
      }

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

  const syncGoogleProfile = async (): Promise<string | null> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const photo = googleUser.photoURL || null;
      const email = (googleUser.email || '').toLowerCase().trim();

      if (photo) {
        await updateProfile(googleUser, { photoURL: photo });
        if (email) {
          localStorage.setItem(`eed_avatar_${email}`, photo);
        }
        localStorage.setItem('eed_user_avatar', photo);

        // Sync to Firestore users collection
        try {
          await setDoc(
            doc(db, 'users', googleUser.uid),
            {
              uid: googleUser.uid,
              email: googleUser.email,
              fullName: googleUser.displayName || 'Google User',
              photoURL: photo,
              avatarUrl: photo,
              updatedAt: Date.now()
            },
            { merge: true }
          );
        } catch {}

        // If admin record exists, sync avatar to admins collection
        try {
          const adminDoc = await getAdminByUidOrEmail(googleUser.uid, googleUser.email);
          if (adminDoc) {
            await setDoc(
              doc(db, 'admins', adminDoc.id),
              {
                avatar: photo,
                photoURL: photo,
                updatedAt: Date.now()
              },
              { merge: true }
            );
          }
        } catch {}

        setCurrentUser({ ...googleUser, photoURL: photo } as User);
        await resolveAdminStatus(googleUser);
      }

      return photo;
    } catch (err: any) {
      console.error('Error syncing Google profile:', err);
      throw err;
    }
  };

  const updateUserAvatar = async (photoUrl: string): Promise<void> => {
    if (!currentUser) return;
    const cleanUrl = photoUrl.trim();
    if (!cleanUrl) return;

    await updateProfile(currentUser, { photoURL: cleanUrl });
    const email = (currentUser.email || '').toLowerCase().trim();
    if (email) {
      localStorage.setItem(`eed_avatar_${email}`, cleanUrl);
    }
    localStorage.setItem('eed_user_avatar', cleanUrl);

    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          photoURL: cleanUrl,
          avatarUrl: cleanUrl,
          updatedAt: Date.now()
        },
        { merge: true }
      );
    } catch {}

    if (adminProfile) {
      try {
        await setDoc(
          doc(db, 'admins', adminProfile.id),
          {
            avatar: cleanUrl,
            photoURL: cleanUrl,
            updatedAt: Date.now()
          },
          { merge: true }
        );
      } catch {}
    }

    setCurrentUser({ ...currentUser, photoURL: cleanUrl } as User);
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
        refreshAdminStatus,
        syncGoogleProfile,
        updateUserAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
