import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Recipe, User, ViewState } from './types';
import { signInWithGoogle, logout, onAuthStateChange, getCurrentUser } from './services/authService';
import { getRecipesByPartnership, saveRecipe, deleteRecipe } from './services/recipeService';
import { RecipeCard } from './components/RecipeCard';
import { RecipeEditor } from './components/RecipeEditor';
import { RecipeDetail } from './components/RecipeDetail';
import { Button } from './components/Button';
import { PartnerInviteModal } from './components/PartnerInviteModal';
import { PartnerBadge } from './components/PartnerBadge';
import { LanguageToggle } from './components/LanguageToggle';
import { User as UserIcon, LogOut, Plus, Heart, UtensilsCrossed, Share2 } from 'lucide-react';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load recipes when user has partnership
  useEffect(() => {
    const loadRecipes = async () => {
      if (currentUser?.partnershipId) {
        try {
          const recipes = await getRecipesByPartnership(currentUser.partnershipId);
          setRecipes(recipes);
        } catch (error) {
          console.error('Failed to load recipes:', error);
          setRecipes([]);
        }
      } else {
        setRecipes([]);
      }
    };

    loadRecipes();
  }, [currentUser]);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const user = await signInWithGoogle();
      setCurrentUser(user);  // 즉시 UI 업데이트
    } catch (error: any) {
      console.error('Login failed:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setView('DASHBOARD');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!currentUser?.partnershipId) {
      alert('Please connect with a partner first');
      return;
    }

    try {
      await saveRecipe(recipe, currentUser.partnershipId);
      const updatedRecipes = await getRecipesByPartnership(currentUser.partnershipId);
      setRecipes(updatedRecipes);
      setView('DASHBOARD');
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Failed to save recipe:', error);
      alert('Failed to save recipe');
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('VIEW_RECIPE');
  };

  const handleInviteSuccess = async () => {
    const updatedUser = await getCurrentUser();
    setCurrentUser(updatedUser);
    setShowInviteModal(false);
  };

  // --- Views ---

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500">{t('auth.loading')}</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
            <Heart size={40} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2 font-gowun">{t('app.title')}</h1>
          <p className="text-stone-500 mb-8" dangerouslySetInnerHTML={{ __html: `${t('app.tagline')}<br/>${t('app.subtitle')}` }} />

          <Button onClick={handleGoogleLogin} className="w-full py-3 text-lg justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.signInWithGoogle')}
          </Button>

          <p className="mt-6 text-xs text-stone-400" dangerouslySetInnerHTML={{ __html: t('app.footer') }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-4 flex justify-between items-center">
        <div
          className="flex items-center gap-2 font-bold text-xl text-amber-600 cursor-pointer font-gowun"
          onClick={() => { setView('DASHBOARD'); setSelectedRecipe(null); }}
        >
          <UtensilsCrossed /> {t('app.title')}
        </div>

        <div className="flex items-center gap-4">
          <LanguageToggle />
          {currentUser?.partnerId ? (
            <PartnerBadge partnerId={currentUser.partnerId} />
          ) : (
            <Button
              variant="ghost"
              onClick={() => setShowInviteModal(true)}
              className="hidden sm:flex text-sm"
            >
              <Share2 size={16} /> {t('nav.invitePartner')}
            </Button>
          )}
          <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-stone-800">{currentUser.name}</div>
            </div>
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <UserIcon size={18} />
              </div>
            )}
            <button onClick={handleLogout} className="text-stone-400 hover:text-red-500 transition-colors ml-2" title={t('auth.logout')}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'DASHBOARD' && (
          <>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-stone-800 mb-2">{t('dashboard.title')}</h2>
                <p className="text-stone-500">{t('dashboard.subtitle', { count: recipes.length })}</p>
              </div>
              <Button onClick={() => setView('CREATE_RECIPE')}>
                <Plus size={20} /> {t('dashboard.newRecipe')}
              </Button>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                  <UtensilsCrossed size={40} />
                </div>
                <h3 className="text-lg font-bold text-stone-600 mb-2">{t('dashboard.noRecipes')}</h3>
                <p className="text-stone-400 mb-6 max-w-xs mx-auto" dangerouslySetInnerHTML={{ __html: t('dashboard.noRecipesDesc') }} />
                <Button onClick={() => setView('CREATE_RECIPE')}>{t('dashboard.createRecipe')}</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="h-80">
                    <RecipeCard recipe={recipe} onClick={() => handleSelectRecipe(recipe)} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {(view === 'CREATE_RECIPE' || view === 'EDIT_VERSION') && (
          <RecipeEditor 
            user={currentUser}
            existingRecipe={selectedRecipe || undefined}
            isNewVersion={view === 'EDIT_VERSION'}
            onSave={handleSaveRecipe}
            onCancel={() => {
              if (view === 'EDIT_VERSION' && selectedRecipe) {
                setView('VIEW_RECIPE');
              } else {
                setView('DASHBOARD');
                setSelectedRecipe(null);
              }
            }}
          />
        )}

        {view === 'VIEW_RECIPE' && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            currentUser={currentUser}
            onBack={() => {
              setView('DASHBOARD');
              setSelectedRecipe(null);
            }}
            onUpdateRecipe={async (updated) => {
              if (!currentUser?.partnershipId) return;

              try {
                await saveRecipe(updated, currentUser.partnershipId);
                setSelectedRecipe(updated);
                const updatedRecipes = await getRecipesByPartnership(currentUser.partnershipId);
                setRecipes(updatedRecipes);
              } catch (error) {
                console.error('Failed to update recipe:', error);
              }
            }}
            onEdit={() => setView('EDIT_VERSION')}
          />
        )}
      </main>

      {/* Partner Invite Modal */}
      {showInviteModal && currentUser && (
        <PartnerInviteModal
          userId={currentUser.id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default App;