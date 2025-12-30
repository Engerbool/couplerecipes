import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Timestamp } from 'firebase/firestore';
import { Recipe, User, RecipeVersion, Ingredient } from '../types';
import { Button } from './Button';
import { Save, X, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface RecipeEditorProps {
  user: User;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  existingRecipe?: Recipe;
  isNewVersion?: boolean;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  user,
  onSave,
  onCancel,
  existingRecipe,
  isNewVersion
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingRecipe) {
      if (isNewVersion) {
        setTitle(existingRecipe.title);
        setImage(existingRecipe.imageUrl);
        const lastVer = existingRecipe.versions[existingRecipe.versions.length - 1];
        
        // Handle migration from old string[] to Ingredient[] if necessary
        const loadedIngredients = lastVer.ingredients.map(ing => {
          if (typeof ing === 'string') {
            return { name: ing, amount: '' };
          }
          return ing;
        });

        setIngredients(loadedIngredients.length > 0 ? loadedIngredients : [{ name: '', amount: '' }]);
        setSteps(lastVer.steps.length > 0 ? [...lastVer.steps] : ['']);
        setNotes(`Notes for v${lastVer.versionNumber + 1}: `);
      }
    }
  }, [existingRecipe, isNewVersion]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Ingredient Handlers ---
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newArr = [...ingredients];
    newArr[index] = { ...newArr[index], [field]: value };
    setIngredients(newArr);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    const newArr = ingredients.filter((_, i) => i !== index);
    setIngredients(newArr.length ? newArr : [{ name: '', amount: '' }]);
  };

  const moveIngredient = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= ingredients.length) return;
    const newArr = [...ingredients];
    const temp = newArr[index];
    newArr[index] = newArr[index + direction];
    newArr[index + direction] = temp;
    setIngredients(newArr);
  };

  // --- Step Handlers ---
  const updateStep = (index: number, value: string) => {
    const newArr = [...steps];
    newArr[index] = value;
    setSteps(newArr);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    const newArr = steps.filter((_, i) => i !== index);
    setSteps(newArr.length ? newArr : ['']);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= steps.length) return;
    const newArr = [...steps];
    const temp = newArr[index];
    newArr[index] = newArr[index + direction];
    newArr[index + direction] = temp;
    setSteps(newArr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ingredientsList = ingredients.filter(ing => ing.name.trim() !== '');
    const stepsList = steps.filter(line => line.trim() !== '');

    if (ingredientsList.length === 0 || stepsList.length === 0) {
      alert(t('common.atLeastOneIngredient'));
      return;
    }

    const newVersion: RecipeVersion = {
      versionNumber: existingRecipe ? existingRecipe.versions.length + 1 : 1,
      ingredients: ingredientsList,
      steps: stepsList,
      notes: notes,
      createdAt: Timestamp.fromMillis(Date.now()),
      comments: []
    };

    if (existingRecipe) {
      const updatedRecipe: Recipe = {
        ...existingRecipe,
        imageUrl: image || existingRecipe.imageUrl,
        updatedAt: Timestamp.fromMillis(Date.now()),
        versions: [...existingRecipe.versions, newVersion],
        currentVersionIndex: existingRecipe.versions.length
      };
      onSave(updatedRecipe);
    } else {
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        title,
        imageUrl: image,
        authorId: user.id,
        authorName: user.name,
        versions: [newVersion],
        currentVersionIndex: 0,
        partnershipId: '',  // Will be set by App.tsx when saving
        createdAt: Timestamp.fromMillis(Date.now()),
        updatedAt: Timestamp.fromMillis(Date.now())
      };
      onSave(newRecipe);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-dark-bg-secondary p-6 rounded-xl shadow-lg my-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-dark-text-primary">
          {existingRecipe ? (isNewVersion ? t('editor.upgrade', { title: existingRecipe.title }) : t('editor.editRecipe')) : t('editor.newRecipe')}
        </h2>
        <Button variant="ghost" onClick={onCancel}><X size={20}/></Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {!isNewVersion && (
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-dark-text-secondary mb-1">{t('editor.recipeTitle')}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 focus:border-transparent outline-none transition-all bg-white dark:bg-dark-bg-tertiary text-stone-800 dark:text-dark-text-primary placeholder:text-stone-400 dark:placeholder:text-dark-text-tertiary"
              placeholder={t('editor.titlePlaceholder')}
              disabled={!!existingRecipe}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-dark-text-secondary mb-2">{t('editor.coverImage')}</label>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 bg-stone-100 dark:bg-dark-bg-tertiary rounded-lg flex items-center justify-center overflow-hidden border border-stone-200 dark:border-dark-border-primary flex-shrink-0">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-stone-400 dark:text-dark-text-tertiary" size={32} />
              )}
            </div>
            <div>
              <label className="cursor-pointer bg-white dark:bg-dark-bg-tertiary hover:bg-stone-50 dark:hover:bg-dark-bg-primary border border-stone-300 dark:border-dark-border-primary text-stone-700 dark:text-dark-text-primary px-4 py-2 rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-2 shadow-sm">
                <ImageIcon size={16}/>
                {t('editor.uploadPhoto')}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <p className="text-xs text-stone-400 dark:text-dark-text-tertiary mt-2">{t('editor.imageRecommendation')}</p>
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-bold text-stone-800 dark:text-dark-text-primary">{t('recipe.ingredients')}</label>
            <span className="text-xs text-stone-400 dark:text-dark-text-tertiary">{t('editor.ingredientsCount', { count: ingredients.length })}</span>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 items-center group">
                <div className="cursor-move text-stone-300 dark:text-dark-text-tertiary hidden md:block">
                  <div className="w-1.5 h-1.5 bg-stone-300 dark:bg-dark-text-tertiary rounded-full mb-0.5"></div>
                  <div className="w-1.5 h-1.5 bg-stone-300 dark:bg-dark-text-tertiary rounded-full mb-0.5"></div>
                  <div className="w-1.5 h-1.5 bg-stone-300 dark:bg-dark-text-tertiary rounded-full"></div>
                </div>

                <input
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder={t('editor.ingredientName')}
                  className="flex-grow px-3 py-2 border border-stone-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none bg-white dark:bg-dark-bg-tertiary text-stone-800 dark:text-dark-text-primary placeholder:text-stone-400 dark:placeholder:text-dark-text-tertiary"
                />

                <input
                  value={ing.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                  placeholder={t('editor.amount')}
                  className="w-24 md:w-32 px-3 py-2 border border-stone-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none text-right bg-white dark:bg-dark-bg-tertiary text-stone-800 dark:text-dark-text-primary placeholder:text-stone-400 dark:placeholder:text-dark-text-tertiary"
                />

                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => moveIngredient(index, -1)} disabled={index === 0} className="p-2 text-stone-400 dark:text-dark-text-tertiary hover:text-stone-600 dark:hover:text-dark-text-primary disabled:opacity-30">
                    <ArrowUp size={16}/>
                  </button>
                  <button type="button" onClick={() => moveIngredient(index, 1)} disabled={index === ingredients.length - 1} className="p-2 text-stone-400 dark:text-dark-text-tertiary hover:text-stone-600 dark:hover:text-dark-text-primary disabled:opacity-30">
                    <ArrowDown size={16}/>
                  </button>
                  <button type="button" onClick={() => removeIngredient(index)} className="p-2 text-stone-400 dark:text-dark-text-tertiary hover:text-red-500 dark:hover:text-red-400">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addIngredient} className="mt-3 w-full border border-stone-300 dark:border-dark-border-primary bg-stone-50 dark:bg-dark-bg-tertiary">
            <Plus size={16} /> {t('editor.addIngredient')}
          </Button>
        </div>

        {/* Steps Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-bold text-stone-800 dark:text-dark-text-primary">{t('recipe.instructions')}</label>
            <span className="text-xs text-stone-400 dark:text-dark-text-tertiary">{t('editor.instructionsCount', { count: steps.length })}</span>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3 items-start group bg-stone-50 dark:bg-dark-bg-tertiary p-3 rounded-lg border border-stone-100 dark:border-dark-border-primary">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 font-bold flex items-center justify-center text-sm mt-2">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={t('editor.stepPlaceholder', { number: index + 1 })}
                    rows={2}
                    className="w-full px-3 py-2 border border-stone-200 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none resize-y bg-white dark:bg-dark-bg-secondary text-stone-800 dark:text-dark-text-primary placeholder:text-stone-400 dark:placeholder:text-dark-text-tertiary"
                  />
                  <div className="flex justify-end gap-2 mt-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                     <button type="button" onClick={() => moveStep(index, -1)} disabled={index === 0} className="text-xs flex items-center gap-1 text-stone-500 dark:text-dark-text-secondary hover:text-stone-800 dark:hover:text-dark-text-primary disabled:opacity-30 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-dark-bg-primary">
                      <ArrowUp size={12}/> {t('editor.moveUp')}
                    </button>
                    <button type="button" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} className="text-xs flex items-center gap-1 text-stone-500 dark:text-dark-text-secondary hover:text-stone-800 dark:hover:text-dark-text-primary disabled:opacity-30 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-dark-bg-primary">
                      <ArrowDown size={12}/> {t('editor.moveDown')}
                    </button>
                    <button type="button" onClick={() => removeStep(index)} className="text-xs flex items-center gap-1 text-stone-400 dark:text-dark-text-tertiary hover:text-red-500 dark:hover:text-red-400 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 size={12}/> {t('editor.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addStep} className="mt-3 w-full border border-stone-300 dark:border-dark-border-primary bg-stone-50 dark:bg-dark-bg-tertiary">
            <Plus size={16} /> {t('editor.addStep')}
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-dark-text-secondary mb-1">{t('editor.versionNotes')}</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-stone-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none bg-white dark:bg-dark-bg-tertiary text-stone-800 dark:text-dark-text-primary placeholder:text-stone-400 dark:placeholder:text-dark-text-tertiary"
            placeholder={t('editor.notesPlaceholder')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-stone-100 dark:border-dark-border-primary">
          <Button type="button" variant="ghost" onClick={onCancel}>{t('editor.cancel')}</Button>
          <Button type="submit">
            <Save size={18} />
            {existingRecipe ? t('editor.publishVersion') : t('editor.createRecipe')}
          </Button>
        </div>
      </form>
    </div>
  );
};