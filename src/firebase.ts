import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, setLogLevel, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';
import defaultConfig from '../firebase-applet-config.json';

// Configure log level to error to avoid noisy stream idle disconnect notices in Node environment
try {
  setLogLevel('error');
} catch (e) {}

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || defaultConfig.projectId,
  appId: process.env.FIREBASE_APP_ID || defaultConfig.appId,
  apiKey: process.env.FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || defaultConfig.firestoreDatabaseId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || defaultConfig.measurementId,
  oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || defaultConfig.oAuthClientId,
  recaptchaSiteKey: process.env.FIREBASE_RECAPTCHA_SITE_KEY || defaultConfig.recaptchaSiteKey
};

let appInstance: any = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export function getFirebaseApp() {
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
}

export function getFirebaseDb(): Firestore {
  if (!dbInstance) {
    const app = getFirebaseApp();
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  return dbInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
  }
  return authInstance;
}

export async function ensureAuth(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (e) {
    // If anonymous auth is not enabled in Firebase console, proceed unauthenticated
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await ensureAuth();
    const db = getFirebaseDb();
    await getDocFromServer(doc(db, 'settings', 'site_name'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Using resilient in-memory storage.');
    }
    return false;
  }
}

export { firebaseConfig };
