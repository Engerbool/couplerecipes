import React from 'react';
import { useTranslation } from 'react-i18next';
import { Recipe } from '../types';
import { Clock, ChefHat, Users } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const { t } = useTranslation();
  const currentVersion = recipe.versions[recipe.versions.length - 1];

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border border-stone-100 dark:border-dark-border-primary hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-stone-200 dark:bg-dark-bg-tertiary">
        <img
          src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/400/300`}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          v{currentVersion.versionNumber}.0
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-stone-800 dark:text-dark-text-primary mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-xs text-stone-500 dark:text-dark-text-tertiary mb-3">{t('recipe.by', { author: recipe.authorName })}</p>

        <div className="mt-auto flex items-center justify-between text-stone-500 dark:text-dark-text-secondary text-sm">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{recipe.updatedAt.toDate().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat size={14} />
            <span>{currentVersion.ingredients.length} {t('recipe.ingredients')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};