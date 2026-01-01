import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, getDoc, getDocFromServer, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
      nickname: null,  // 닉네임은 나중에 설정
      customPhotoURL: null,  // 커스텀 프로필 사진은 나중에 설정
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
  const userSnap = await getDocFromServer(userRef);

  return userSnap.exists()
    ? convertFirebaseUserToUser(userSnap.data() as FirebaseUser)
    : null;
};

const convertFirebaseUserToUser = (fbUser: FirebaseUser): User => ({
  id: fbUser.uid,
  name: fbUser.displayName,
  nickname: fbUser.nickname || null,
  email: fbUser.email,
  photoURL: fbUser.photoURL,
  customPhotoURL: fbUser.customPhotoURL || null,
  partnerId: fbUser.partnerId,
  partnershipId: fbUser.partnershipId,
  pastPartnershipIds: fbUser.pastPartnershipIds || [],
});

export const updateNickname = async (userId: string, nickname: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { nickname });
};

export const updateProfile = async (userId: string, nickname: string, customPhotoURL: string | null): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { nickname, customPhotoURL });
};
