import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

function initializeFirebase() {
  // Only initialize if Firebase config is complete
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase is not configured. Skipping initialization.');
    return { firebaseApp: null, auth: null, firestore: null };
  }
  
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
}

export { initializeFirebase };
export * from './provider';
export * from './auth';
