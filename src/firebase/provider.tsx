'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextType>({
    firebaseApp: null,
    auth: null,
    firestore: null,
  });

  useEffect(() => {
    const { firebaseApp, auth, firestore } = initializeFirebase();
    setFirebase({ firebaseApp, auth, firestore });
  }, []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
