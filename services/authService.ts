import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { FirebaseUser, User } from '../types';

export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const userData: Partial<FirebaseUser> = {
    displayName: firebaseUser.displayName || 'Anonymous',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL,
    lastLoginAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    // 신규 사용자
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      ...userData,
      partnerId: null,
      partnershipId: null,
      createdAt: serverTimestamp(),
    });
  } else {
    // 기존 사용자
    await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
  }

  const userDoc = await getDoc(userRef);
  return convertFirebaseUserToUser(userDoc.data() as FirebaseUser);
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        callback(convertFirebaseUserToUser(userSnap.data() as FirebaseUser));
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  return userSnap.exists()
    ? convertFirebaseUserToUser(userSnap.data() as FirebaseUser)
    : null;
};

const convertFirebaseUserToUser = (fbUser: FirebaseUser): User => ({
  id: fbUser.uid,
  name: fbUser.displayName,
  email: fbUser.email,
  photoURL: fbUser.photoURL,
  partnerId: fbUser.partnerId,
  partnershipId: fbUser.partnershipId,
});
