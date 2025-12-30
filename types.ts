import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;                    // Firebase UID
  name: string;                  // displayName
  email: string;                 // Firebase email
  photoURL: string | null;       // Firebase photoURL
  partnerId: string | null;      // Partner's UID
  partnershipId: string | null;  // Partnership document ID
}

// Firestore 사용자 타입 (내부용)
export interface FirebaseUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  partnerId: string | null;
  partnershipId: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// Partnership 타입
export interface Partnership {
  id: string;
  users: [string, string];       // [userId1, userId2]
  inviteCode: string;            // 6자리 숫자
  createdBy: string;
  createdAt: Timestamp;
  status: 'pending' | 'active';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  text: string;
  timestamp: Timestamp;          // number → Timestamp
  rating?: number; // 1-5 stars
}

export interface Ingredient {
  name: string;
  quantity: string;  // 숫자 또는 "적당량" 같은 텍스트
  unit: string;      // 단위 (큰술, g, 개, etc)
}

export interface RecipeVersion {
  id: string;
  versionNumber: number;
  ingredients: Ingredient[];
  steps: string[];
  notes: string;
  createdAt: Timestamp;          // number → Timestamp
  comments: Comment[];
}

export interface Recipe {
  id: string;
  partnershipId: string;         // sharedWith 대신 사용
  title: string;
  imageUrl: string;              // image → imageUrl
  authorId: string;
  authorName: string;
  currentVersionIndex: number;
  versions: RecipeVersion[];
  createdAt: Timestamp;          // number → Timestamp
  updatedAt: Timestamp;          // number → Timestamp
}

export type ViewState =
  | 'DASHBOARD'
  | 'CREATE_RECIPE'
  | 'VIEW_RECIPE'
  | 'EDIT_VERSION'
  | 'PARTNER_INVITE';