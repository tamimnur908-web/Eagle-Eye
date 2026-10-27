// 🔴 [INSERT FIREBASE WEB SDK CONFIGURATION HERE] — centralized src/lib/firebase.ts.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Centralized Firebase initialization
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔴 [CONNECT FIREBASE AUTHENTICATION HERE] — login, registration, reset password, and session state.
export const auth = getAuth(app);

// 🔴 [CONNECT FIRESTORE DATABASE HERE] — data-access modules and collection queries.
export const db = getFirestore(app);

// 🔴 [CONNECT FIREBASE STORAGE HERE] — public images and protected digital files.
export const storage = getStorage(app);

// 🔴 [CONFIGURE AUTHORIZED ADMIN UID OR CUSTOM CLAIM HERE] — trusted admin authorization.
export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || 'cOpR7FgKjGeBkeWwIysygHvswwv1';
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '01836126791';
export const BUSINESS_EMAIL = import.meta.env.VITE_BUSINESS_EMAIL || 'Tamimnur908@gmail.com';
