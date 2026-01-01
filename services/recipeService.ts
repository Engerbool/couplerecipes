import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Recipe, RecipeVersion, Comment } from '../types';

/**
 * 단일 레시피 데이터 로드 (서브컬렉션 포함)
 */
const loadRecipeData = async (docSnap: any): Promise<Recipe> => {
  const data = docSnap.data();

  // 서브컬렉션: versions 로드
  const versionsSnap = await getDocs(
    collection(db, 'recipes', docSnap.id, 'versions')
  );
  const versions: RecipeVersion[] = [];

  for (const versionDoc of versionsSnap.docs) {
    const versionData = versionDoc.data();

    // 서브컬렉션: comments 로드
    const commentsSnap = await getDocs(
      collection(db, 'recipes', docSnap.id, 'versions', versionDoc.id, 'comments')
    );
    const comments: Comment[] = commentsSnap.docs.map((c) => ({
      id: c.id,
      userId: c.data().userId,
      userName: c.data().userName,
      userPhotoURL: c.data().userPhotoURL,
      text: c.data().text,
      timestamp: c.data().timestamp,
      rating: c.data().rating,
    }));

    versions.push({
      id: versionDoc.id,
      versionNumber: versionData.versionNumber,
      ingredients: versionData.ingredients,
      steps: versionData.steps,
      notes: versionData.notes,
      createdAt: versionData.createdAt,
      comments,
    });
  }

  versions.sort((a, b) => a.versionNumber - b.versionNumber);

  return {
    id: docSnap.id,
    partnershipId: data.partnershipId,
    title: data.title,
    imageUrl: data.imageUrl,
    authorId: data.authorId,
    authorName: data.authorName,
    currentVersionIndex: data.currentVersionIndex,
    versions,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

/**
 * 파트너십 기반 레시피 목록 가져오기
 * shared.md 참고: 서브컬렉션도 명시적으로 로드 필요
 */
export const getRecipesByPartnership = async (
  partnershipId: string
): Promise<Recipe[]> => {
  const q = query(
    collection(db, 'recipes'),
    where('partnershipId', '==', partnershipId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const recipes: Recipe[] = [];

  for (const docSnap of snapshot.docs) {
    const recipe = await loadRecipeData(docSnap);
    recipes.push(recipe);
  }

  return recipes;
};

/**
 * 사용자의 모든 레시피 가져오기 (현재 + 과거 파트너십)
 * 파트너 연결 해제 후에도 기존 레시피에 접근 가능
 */
export const getRecipesByUser = async (
  currentPartnershipId: string | null,
  pastPartnershipIds?: string[]
): Promise<Recipe[]> => {
  const allPartnershipIds = [
    ...(currentPartnershipId ? [currentPartnershipId] : []),
    ...(pastPartnershipIds || []),
  ];

  if (allPartnershipIds.length === 0) {
    return [];
  }

  // Firestore 'in' query는 최대 30개까지만 지원
  // 30개 이상일 경우 여러 쿼리로 나눠서 실행
  const BATCH_SIZE = 30;
  const recipes: Recipe[] = [];

  for (let i = 0; i < allPartnershipIds.length; i += BATCH_SIZE) {
    const batch = allPartnershipIds.slice(i, i + BATCH_SIZE);
    const q = query(
      collection(db, 'recipes'),
      where('partnershipId', 'in', batch),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const recipe = await loadRecipeData(docSnap);
      recipes.push(recipe);
    }
  }

  // updatedAt 기준으로 다시 정렬 (여러 쿼리 결과 합치기 때문)
  recipes.sort((a, b) => {
    const aTime = a.updatedAt.toMillis();
    const bTime = b.updatedAt.toMillis();
    return bTime - aTime;
  });

  return recipes;
};

/**
 * 레시피 저장/업데이트
 * shared.md 참고: Batch write로 원자성 보장
 */
export const saveRecipe = async (
  recipe: Recipe,
  partnershipId: string
): Promise<void> => {
  const recipeRef = doc(db, 'recipes', recipe.id);
  const recipeSnap = await getDoc(recipeRef);

  const batch = writeBatch(db);

  // 1. 메인 레시피 문서
  batch.set(
    recipeRef,
    {
      partnershipId,
      title: recipe.title,
      imageUrl: recipe.imageUrl,
      authorId: recipe.authorId,
      authorName: recipe.authorName,
      currentVersionIndex: recipe.currentVersionIndex,
      updatedAt: serverTimestamp(),
      ...(recipeSnap.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );

  // 2. 기존 댓글 삭제 (삭제된 댓글을 Firestore에서 제거하기 위해)
  if (recipeSnap.exists()) {
    const versionsSnap = await getDocs(
      collection(db, 'recipes', recipe.id, 'versions')
    );
    for (const versionDoc of versionsSnap.docs) {
      const commentsSnap = await getDocs(
        collection(db, 'recipes', recipe.id, 'versions', versionDoc.id, 'comments')
      );
      for (const commentDoc of commentsSnap.docs) {
        batch.delete(commentDoc.ref);
      }
    }
  }

  // 3. 버전 서브컬렉션
  for (const version of recipe.versions) {
    const versionRef = doc(
      db,
      'recipes',
      recipe.id,
      'versions',
      `v${version.versionNumber}`
    );
    batch.set(versionRef, {
      versionNumber: version.versionNumber,
      ingredients: version.ingredients,
      steps: version.steps,
      notes: version.notes,
      createdAt: version.createdAt || serverTimestamp(),
    });

    // 4. 댓글 서브컬렉션 (새로 저장)
    for (const comment of version.comments) {
      const commentRef = doc(
        db,
        'recipes',
        recipe.id,
        'versions',
        `v${version.versionNumber}`,
        'comments',
        comment.id
      );
      batch.set(commentRef, {
        userId: comment.userId,
        userName: comment.userName,
        text: comment.text,
        rating: comment.rating || null,
        timestamp: comment.timestamp || serverTimestamp(),
      });
    }
  }

  await batch.commit();
};

/**
 * 레시피 삭제
 * shared.md 참고: 서브컬렉션도 명시적으로 삭제 필요
 */
export const deleteRecipe = async (recipeId: string): Promise<void> => {
  const batch = writeBatch(db);

  // 1. 모든 버전의 모든 댓글 삭제
  const versionsSnap = await getDocs(collection(db, 'recipes', recipeId, 'versions'));

  for (const versionDoc of versionsSnap.docs) {
    const commentsSnap = await getDocs(
      collection(db, 'recipes', recipeId, 'versions', versionDoc.id, 'comments')
    );

    for (const commentDoc of commentsSnap.docs) {
      batch.delete(commentDoc.ref);
    }

    batch.delete(versionDoc.ref);
  }

  // 2. 메인 레시피 문서 삭제
  batch.delete(doc(db, 'recipes', recipeId));

  await batch.commit();
};

/**
 * Timestamp를 number로 변환 (UI 호환성)
 */
export const timestampToNumber = (timestamp: Timestamp): number => {
  return timestamp.toMillis();
};

/**
 * number를 Timestamp로 변환
 */
export const numberToTimestamp = (num: number): Timestamp => {
  return Timestamp.fromMillis(num);
};
