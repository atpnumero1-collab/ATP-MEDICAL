import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Support both embedded firebase-applet-config.json and optional Vercel environment variables
const firebaseConfig = {
  projectId: (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfigRaw.projectId,
  appId: (import.meta.env?.VITE_FIREBASE_APP_ID as string) || firebaseConfigRaw.appId,
  apiKey: (import.meta.env?.VITE_FIREBASE_API_KEY as string) || firebaseConfigRaw.apiKey,
  authDomain: (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfigRaw.authDomain,
  firestoreDatabaseId: (import.meta.env?.VITE_FIREBASE_DATABASE_ID as string) || firebaseConfigRaw.firestoreDatabaseId,
  storageBucket: (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfigRaw.storageBucket,
  messagingSenderId: (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfigRaw.messagingSenderId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore using the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validation of server connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firestore: Connected to server successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore: Client appears offline, will sync when reconnected.');
    }
    return false;
  }
}
