import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Partnership } from '../types';

const generateInviteCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 파트너십 생성 및 초대 코드 발급
 * shared.md 참고: 양방향 멤버십 관리
 */
export const createPartnership = async (userId: string): Promise<string> => {
  const userRef = doc(db, 'users', userId);
  // 캐시를 무시하고 서버에서 직접 가져오기
  const userSnap = await getDocFromServer(userRef);

  console.log('[DEBUG] createPartnership - User data from server:', {
    exists: userSnap.exists(),
    partnershipId: userSnap.data()?.partnershipId,
    partnerId: userSnap.data()?.partnerId,
    data: userSnap.data()
  });

  if (userSnap.exists() && userSnap.data().partnershipId) {
    throw new Error('이미 파트너가 있습니다');
  }

  // 고유한 6자리 초대 코드 생성
  let inviteCode = generateInviteCode();
  let isUnique = false;

  while (!isUnique) {
    const q = query(
      collection(db, 'partnerships'),
      where('inviteCode', '==', inviteCode),
      where('status', '==', 'pending')
    );
    const existingSnap = await getDocs(q);

    if (existingSnap.empty) {
      isUnique = true;
    } else {
      inviteCode = generateInviteCode();
    }
  }

  const batch = writeBatch(db);

  // 1. Partnership 문서 생성
  const partnershipRef = doc(collection(db, 'partnerships'));
  batch.set(partnershipRef, {
    users: [userId, ''],
    inviteCode,
    createdBy: userId,
    createdAt: serverTimestamp(),
    status: 'pending',
  });

  // 2. User의 partnershipId 업데이트 (양방향 관계)
  batch.update(userRef, { partnershipId: partnershipRef.id });

  await batch.commit();

  return inviteCode;
};

/**
 * 초대 코드로 파트너십 찾기
 */
export const findPartnershipByCode = async (
  inviteCode: string
): Promise<Partnership | null> => {
  const q = query(
    collection(db, 'partnerships'),
    where('inviteCode', '==', inviteCode),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Partnership;
};

/**
 * 파트너십 참여 (초대 코드 사용)
 * shared.md 참고: Batch write로 원자성 보장
 */
export const joinPartnership = async (
  userId: string,
  inviteCode: string
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  // 캐시를 무시하고 서버에서 직접 가져오기
  const userSnap = await getDocFromServer(userRef);

  if (userSnap.exists() && userSnap.data().partnershipId) {
    throw new Error('이미 파트너가 있습니다');
  }

  const partnership = await findPartnershipByCode(inviteCode);

  if (!partnership) {
    throw new Error('유효하지 않은 초대 코드입니다');
  }

  if (partnership.users.includes(userId)) {
    throw new Error('자기 자신을 초대할 수 없습니다');
  }

  const batch = writeBatch(db);

  // 1. Partnership 업데이트 (users 배열, status)
  const partnershipRef = doc(db, 'partnerships', partnership.id);
  batch.update(partnershipRef, {
    users: [partnership.users[0], userId],
    status: 'active',
  });

  // 2. 참여자의 partnershipId, partnerId 업데이트
  batch.update(userRef, {
    partnershipId: partnership.id,
    partnerId: partnership.users[0],
  });

  // 3. 생성자의 partnerId 업데이트
  const creatorRef = doc(db, 'users', partnership.users[0]);
  batch.update(creatorRef, {
    partnerId: userId,
  });

  await batch.commit();
};

/**
 * 파트너 정보 가져오기
 */
export const getPartner = async (partnerId: string) => {
  const partnerRef = doc(db, 'users', partnerId);
  const partnerSnap = await getDoc(partnerRef);
  return partnerSnap.exists() ? partnerSnap.data() : null;
};

/**
 * 파트너십 해제
 * shared.md 참고: 양방향 업데이트 필수
 */
export const leavePartnership = async (userId: string, partnershipId: string): Promise<void> => {
  console.log('[DEBUG] leavePartnership called with:', { userId, partnershipId });

  const partnershipRef = doc(db, 'partnerships', partnershipId);
  const partnershipSnap = await getDoc(partnershipRef);

  if (!partnershipSnap.exists()) {
    console.error('[DEBUG] Partnership not found:', partnershipId);
    throw new Error('파트너십을 찾을 수 없습니다');
  }

  const partnership = partnershipSnap.data() as Partnership;
  const partnerId = partnership.users.find(uid => uid !== userId);

  if (!partnerId) {
    console.error('[DEBUG] Partner not found in users:', partnership.users);
    throw new Error('파트너를 찾을 수 없습니다');
  }

  console.log('[DEBUG] Found partner:', partnerId);

  const batch = writeBatch(db);

  // 1. 본인 user 문서 업데이트
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, {
    partnerId: null,
    partnershipId: null,
  });

  // 2. 파트너 user 문서 업데이트
  const partnerRef = doc(db, 'users', partnerId);
  batch.update(partnerRef, {
    partnerId: null,
    partnershipId: null,
  });

  // 3. Partnership 문서 삭제
  batch.delete(partnershipRef);

  console.log('[DEBUG] About to commit batch updates');
  await batch.commit();
  console.log('[DEBUG] Batch commit successful');
};
