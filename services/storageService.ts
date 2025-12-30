import { Recipe, User } from '../types';

const RECIPES_KEY = 'couplecook_recipes_v1';
const USER_KEY = 'couplecook_user_v1';
const PARTNER_KEY = 'couplecook_partner_v1';

export const getRecipes = (): Recipe[] => {
  const data = localStorage.getItem(RECIPES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecipe = (recipe: Recipe): void => {
  const recipes = getRecipes();
  const existingIndex = recipes.findIndex(r => r.id === recipe.id);
  
  if (existingIndex >= 0) {
    recipes[existingIndex] = recipe;
  } else {
    recipes.push(recipe);
  }
  
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
};

export const deleteRecipe = (id: string): void => {
  const recipes = getRecipes().filter(r => r.id !== id);
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveCurrentUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Simulate Partner Inviting
export const generateInviteLink = (): string => {
  return window.location.href; // In a real app, this would be a unique token URL
};
