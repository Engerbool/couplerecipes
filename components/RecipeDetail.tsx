import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Timestamp } from 'firebase/firestore';
import { Recipe, User, Comment } from '../types';
import { Button } from './Button';
import { ArrowLeft, GitBranch, MessageSquare, Star, Send, ChefHat, MonitorPlay, CheckCircle2, Circle, X, User as UserIcon, UtensilsCrossed, Edit2, Trash2, Check } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  currentUser: User;
  onBack: () => void;
  onUpdateRecipe: (updatedRecipe: Recipe) => void;
  onEditClick: (recipe: Recipe) => void;
  onUpgradeClick: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  currentUser,
  onBack,
  onUpdateRecipe,
  onEditClick,
  onUpgradeClick,
  onDelete
}) => {
  const { t } = useTranslation();
  const [activeVersionIndex, setActiveVersionIndex] = useState(recipe.versions.length - 1);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);

  // Comment Edit State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  // Cooking Mode State
  const [cookingMode, setCookingMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [completedIngredients, setCompletedIngredients] = useState<number[]>([]);

  // Image Modal State
  const [showImageModal, setShowImageModal] = useState(false);

  const activeVersion = recipe.versions[activeVersionIndex];
  const isLatest = activeVersionIndex === recipe.versions.length - 1;

  // Migration helper for ingredients that might be strings in old data
  const getSafeIngredient = (ing: any) => {
    if (typeof ing === 'string') return { name: ing, amount: '' };
    return ing;
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.nickname || currentUser.name,
      userPhotoURL: currentUser.customPhotoURL || currentUser.photoURL,
      text: newComment,
      timestamp: Timestamp.fromMillis(Date.now()),
      rating
    };

    const updatedVersions = [...recipe.versions];
    updatedVersions[activeVersionIndex] = {
      ...activeVersion,
      comments: [comment, ...activeVersion.comments] // Newest first
    };

    const updatedRecipe = { ...recipe, versions: updatedVersions };
    onUpdateRecipe(updatedRecipe);
    setNewComment('');
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setEditingRating(comment.rating || 5);
  };

  const handleSaveEdit = (commentId: string) => {
    const updatedVersions = [...recipe.versions];
    const comments = activeVersion.comments.map(c =>
      c.id === commentId
        ? { ...c, text: editingText, rating: editingRating }
        : c
    );

    updatedVersions[activeVersionIndex] = {
      ...activeVersion,
      comments
    };

    const updatedRecipe = { ...recipe, versions: updatedVersions };
    onUpdateRecipe(updatedRecipe);
    setEditingCommentId(null);
    setEditingText('');
    setEditingRating(5);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
    setEditingRating(5);
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm(t('comment.deleteConfirm'))) return;

    const updatedVersions = [...recipe.versions];
    const comments = activeVersion.comments.filter(c => c.id !== commentId);

    updatedVersions[activeVersionIndex] = {
      ...activeVersion,
      comments
    };

    const updatedRecipe = { ...recipe, versions: updatedVersions };
    onUpdateRecipe(updatedRecipe);
  };

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const toggleIngredient = (index: number) => {
    if (completedIngredients.includes(index)) {
      setCompletedIngredients(completedIngredients.filter(i => i !== index));
    } else {
      setCompletedIngredients([...completedIngredients, index]);
    }
  };

  const enterCookingMode = () => {
    setCompletedSteps([]);
    setCompletedIngredients([]);
    setCookingMode(true);
  };

  // ESC key to close image modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showImageModal]);

  // --- Cooking Mode View ---
  if (cookingMode) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-bg-primary z-50 overflow-y-auto flex flex-col animate-in fade-in duration-200">
        <div className="sticky top-0 bg-white/95 dark:bg-dark-bg-secondary/95 backdrop-blur border-b border-stone-200 dark:border-dark-border-primary p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-stone-800 dark:text-dark-text-primary truncate pr-4">{recipe.title}</h2>
            <span className="text-xs text-stone-500 dark:text-dark-text-secondary font-medium">{t('recipe.cookingMode')} • v{activeVersion.versionNumber}</span>
          </div>
          <Button variant="secondary" onClick={() => setCookingMode(false)} className="bg-stone-100 hover:bg-stone-200">
            <X size={20} /> <span className="hidden sm:inline">{t('recipe.exitCooking')}</span>
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 flex-grow pb-24">
          {/* Ingredients Checklist */}
          <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
            <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-4 text-xl flex items-center gap-2">
              <ChefHat size={24}/> {t('recipe.ingredientsCheck')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeVersion.ingredients.map((rawIng, i) => {
                const ing = getSafeIngredient(rawIng);
                const isDone = completedIngredients.includes(i);
                return (
                  <div 
                    key={i} 
                    onClick={() => toggleIngredient(i)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isDone ? 'bg-amber-100/50 dark:bg-amber-900/30 text-stone-400 dark:text-dark-text-tertiary line-through' : 'bg-white dark:bg-dark-bg-secondary hover:bg-amber-100/30 dark:hover:bg-amber-900/20 text-stone-800 dark:text-dark-text-primary'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isDone ? 'bg-amber-500 border-amber-500 text-white' : 'border-amber-300 dark:border-amber-700 bg-white dark:bg-dark-bg-tertiary'
                    }`}>
                      {isDone && <CheckCircle2 size={16} />}
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-lg font-medium">{ing.name}</span>
                      {(() => {
                        // Support both new format (quantity + unit) and old format (amount)
                        const displayAmount = 'quantity' in ing && 'unit' in ing
                          ? `${ing.quantity}${ing.unit ? ' ' + ing.unit : ''}`.trim()
                          : ('amount' in ing ? ing.amount : '');
                        return displayAmount && <span className="text-lg text-stone-500 dark:text-dark-text-secondary">{displayAmount}</span>;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            <h3 className="font-bold text-stone-800 dark:text-dark-text-primary text-xl px-2">{t('recipe.instructions')}</h3>
            {activeVersion.steps.map((step, i) => {
              const isDone = completedSteps.includes(i);
              return (
                <div
                  key={i}
                  onClick={() => toggleStep(i)}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex gap-5 items-start ${
                    isDone
                      ? 'bg-stone-50 dark:bg-dark-bg-tertiary border-stone-100 dark:border-dark-border-primary opacity-60'
                      : 'bg-white dark:bg-dark-bg-secondary border-stone-200 dark:border-dark-border-primary hover:border-amber-400 dark:hover:border-amber-600 shadow-sm'
                  }`}
                >
                  <div className={`flex-shrink-0 mt-1 transition-colors ${isDone ? 'text-green-500' : 'text-stone-300'}`}>
                    {isDone ? <CheckCircle2 size={40} className="fill-green-100" /> : <Circle size={40} />}
                  </div>
                  <div className="flex-grow">
                    <span className={`text-sm font-bold uppercase tracking-wider mb-2 block ${isDone ? 'text-stone-400 dark:text-dark-text-tertiary' : 'text-amber-600 dark:text-amber-500'}`}>
                      {t('recipe.step', { number: i + 1 })}
                    </span>
                    <p className={`text-2xl leading-relaxed font-medium ${isDone ? 'line-through text-stone-400 dark:text-dark-text-tertiary' : 'text-stone-800 dark:text-dark-text-primary'}`}>
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Message */}
          {completedSteps.length === activeVersion.steps.length && activeVersion.steps.length > 0 && (
            <div className="mt-12 p-8 text-center bg-green-50 rounded-2xl border border-green-100 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat size={32} />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">{t('recipe.bonAppetit')}</h3>
              <p className="text-green-600 mb-6">{t('recipe.completed')}</p>
              <Button onClick={() => setCookingMode(false)} className="bg-green-600 hover:bg-green-700">
                {t('recipe.finishCooking')}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Standard View ---
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="text-stone-500 dark:text-dark-text-secondary hover:text-stone-800 dark:hover:text-dark-text-primary">
          <ArrowLeft size={20} /> {t('recipe.back')}
        </Button>
        <Button variant="primary" onClick={enterCookingMode} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">
          <MonitorPlay size={20} /> {t('recipe.startCooking')}
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-bg-secondary rounded-3xl shadow-xl overflow-hidden mb-8 border border-stone-100 dark:border-dark-border-primary">
        {/* Header Image */}
        <div
          className="relative h-64 md:h-96 bg-stone-200 dark:bg-dark-bg-tertiary cursor-pointer group"
          onClick={() => recipe.imageUrl && setShowImageModal(true)}
        >
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-dark-bg-tertiary dark:to-dark-bg-primary">
              <UtensilsCrossed size={120} className="text-stone-300 dark:text-dark-text-tertiary opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-black/90 via-transparent to-transparent flex items-end pointer-events-none">
            <div className="p-6 md:p-10 w-full text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">{recipe.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium opacity-90">
                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <ChefHat size={18}/> {recipe.authorName}
                </span>
                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <GitBranch size={18}/> v{activeVersion.versionNumber}.0
                </span>
                <span className="opacity-75">{activeVersion.createdAt.toDate().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Version Selector */}
        <div className="border-b border-stone-100 dark:border-dark-border-primary p-4 bg-stone-50/50 dark:bg-dark-bg-tertiary/50 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-400 dark:text-dark-text-tertiary mr-2 uppercase tracking-wide">{t('recipe.versionHistory')}</span>
            {recipe.versions.map((v, idx) => (
              <button
                key={v.versionNumber}
                onClick={() => setActiveVersionIndex(idx)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  idx === activeVersionIndex
                    ? 'bg-amber-500 dark:bg-amber-600 text-white shadow-md transform scale-105'
                    : 'bg-white dark:bg-dark-bg-secondary border border-stone-200 dark:border-dark-border-primary text-stone-600 dark:text-dark-text-secondary hover:bg-stone-50 dark:hover:bg-dark-bg-tertiary hover:border-stone-300 dark:hover:border-amber-700'
                }`}
              >
                v{v.versionNumber}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-10 grid md:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-stone-800 dark:text-dark-text-primary mb-5 flex items-center gap-2">
                {t('recipe.ingredients')} <span className="text-sm font-normal text-stone-400 dark:text-dark-text-tertiary bg-stone-100 dark:bg-dark-bg-tertiary px-2 py-1 rounded-full">{activeVersion.ingredients.length}</span>
              </h3>
              <ul className="grid grid-cols-1 gap-3">
                {activeVersion.ingredients.map((rawIng, i) => {
                  const ing = getSafeIngredient(rawIng);
                  return (
                    <li key={i} className="flex items-center justify-between gap-3 text-stone-700 dark:text-dark-text-primary bg-stone-50 dark:bg-dark-bg-tertiary p-3 rounded-lg border border-stone-100 dark:border-dark-border-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500 flex-shrink-0" />
                        <span className="font-medium">{ing.name}</span>
                      </div>
                      <span className="text-stone-500 dark:text-dark-text-secondary font-medium">
                        {(() => {
                          // Support both new format (quantity + unit) and old format (amount)
                          const displayAmount = 'quantity' in ing && 'unit' in ing
                            ? `${ing.quantity}${ing.unit ? ' ' + ing.unit : ''}`.trim()
                            : ('amount' in ing ? ing.amount : '');
                          return displayAmount;
                        })()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-stone-800 dark:text-dark-text-primary mb-5">{t('recipe.instructions')}</h3>
              <div className="space-y-6">
                {activeVersion.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-dark-bg-tertiary text-stone-500 dark:text-dark-text-secondary font-bold flex items-center justify-center text-sm mt-1 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                      {i + 1}
                    </span>
                    <p className="text-lg text-stone-700 dark:text-dark-text-primary leading-relaxed mt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Feedback */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-stone-50 dark:bg-dark-bg-tertiary p-6 rounded-2xl border border-stone-100 dark:border-dark-border-primary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-stone-800 dark:text-dark-text-primary flex items-center gap-2">
                  <MessageSquare size={18}/> {t('recipe.feedback')}
                </h3>
              </div>

              {/* Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex gap-1 mb-2 justify-center bg-white dark:bg-dark-bg-secondary p-2 rounded-lg border border-stone-200 dark:border-dark-border-primary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`}
                    >
                      <Star size={20} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('comment.howDidItTaste')}
                    className="w-full px-4 py-3 pb-10 rounded-xl border border-stone-200 dark:border-dark-border-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none text-sm resize-none bg-white dark:bg-dark-bg-secondary text-stone-800 dark:text-dark-text-primary placeholder:text-stone-400 dark:placeholder:text-dark-text-tertiary"
                    rows={3}
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute bottom-2 right-2 p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {activeVersion.comments.length === 0 ? (
                  <div className="text-center text-stone-400 dark:text-dark-text-tertiary py-4 text-sm" dangerouslySetInnerHTML={{ __html: t('recipe.noFeedback') }} />
                ) : (
                  activeVersion.comments.map(comment => {
                    const isEditing = editingCommentId === comment.id;
                    const isOwner = comment.userId === currentUser.id;

                    return (
                      <div key={comment.id} className="bg-white dark:bg-dark-bg-secondary p-3 rounded-xl border border-stone-100 dark:border-dark-border-primary shadow-sm">
                        <div className="flex gap-3">
                          {(() => {
                            if (comment.userPhotoURL?.startsWith('avatar:')) {
                              const emoji = comment.userPhotoURL.replace('avatar:', '');
                              return (
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 text-sm">
                                  {emoji}
                                </div>
                              );
                            } else if (comment.userPhotoURL) {
                              return (
                                <img
                                  src={comment.userPhotoURL}
                                  alt={comment.userName}
                                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                                />
                              );
                            } else {
                              return (
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                  <UserIcon size={16} className="text-amber-600 dark:text-amber-500" />
                                </div>
                              );
                            }
                          })()}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm text-stone-800 dark:text-dark-text-primary">{comment.userName}</span>
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEditingRating(star)}
                                        className={`transition-transform hover:scale-110 ${editingRating >= star ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`}
                                      >
                                        <Star size={12} fill={editingRating >= star ? "currentColor" : "none"} />
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex text-amber-400">
                                    {[...Array(comment.rating)].map((_, i) => (
                                      <Star key={i} size={10} fill="currentColor" />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  rows={2}
                                  className="w-full px-2 py-1 text-sm border border-stone-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none resize-none bg-white dark:bg-dark-bg-secondary text-stone-800 dark:text-dark-text-primary"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="text-xs px-2 py-1 text-stone-500 dark:text-dark-text-secondary hover:text-stone-800 dark:hover:text-dark-text-primary"
                                  >
                                    {t('editor.cancel')}
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(comment.id)}
                                    className="text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 flex items-center gap-1"
                                  >
                                    <Check size={12} /> {t('editor.save')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-stone-600 dark:text-dark-text-secondary text-sm mb-2">{comment.text}</p>
                                <div className="flex justify-between items-center">
                                  <div className="text-xs text-stone-400 dark:text-dark-text-tertiary">
                                    {comment.timestamp.toDate().toLocaleDateString()}
                                  </div>
                                  {isOwner && (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleEditComment(comment)}
                                        className="text-xs p-1 text-stone-400 dark:text-dark-text-tertiary hover:text-blue-500 dark:hover:text-blue-400"
                                        title={t('comment.edit')}
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-xs p-1 text-stone-400 dark:text-dark-text-tertiary hover:text-red-500 dark:hover:text-red-400"
                                        title={t('comment.delete')}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            {isLatest && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400 dark:text-dark-text-tertiary text-center">{t('recipe.wantToImprove')}</p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => onEditClick(recipe)}
                    variant="secondary"
                    className="w-full justify-center border-2 border-blue-500 dark:border-blue-600 text-stone-700 dark:text-dark-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {t('recipe.edit')}
                  </Button>
                  <Button
                    onClick={() => onUpgradeClick(recipe)}
                    variant="secondary"
                    className="w-full justify-center border-2 border-amber-500 dark:border-amber-600 text-stone-700 dark:text-dark-text-secondary hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <GitBranch size={16} /> {t('recipe.upgrade')}
                  </Button>
                  <Button
                    onClick={() => {
                      if (window.confirm(t('recipe.deleteConfirm'))) {
                        onDelete(recipe.id);
                      }
                    }}
                    variant="secondary"
                    className="w-full justify-center border-2 border-red-500 dark:border-red-600 text-stone-700 dark:text-dark-text-secondary hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={16} /> {t('recipe.delete')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && recipe.imageUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
            onClick={() => setShowImageModal(false)}
          >
            <X size={24} />
          </button>
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};