import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Ensure local persistence for TV/Mobile
setPersistence(auth, browserLocalPersistence);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Auth helpers
export const loginWithGoogle = async () => {
  try {
    console.log('Attempting Google Login...');
    // Try popup first (standard for PC/Mobile)
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.warn('Popup failed, trying redirect...', error.code);
    // If popup is blocked or not supported (common on TVs), use redirect
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/operation-not-supported-in-this-environment' ||
        error.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError: any) {
        console.error('Redirect failed:', redirectError);
        handleFirestoreError(redirectError, OperationType.GET, 'auth-redirect-init');
      }
    } else {
      console.error('Auth error:', error);
      handleFirestoreError(error, OperationType.GET, 'auth-popup');
    }
  }
};
export const logout = () => signOut(auth);
export { getRedirectResult };

// Firestore Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();
