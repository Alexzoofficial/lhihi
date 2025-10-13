'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, Auth } from 'firebase/auth';

export const signInWithGoogle = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutWithGoogle = async (auth: Auth) => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out with Google:', error);
    throw error;
  }
};
