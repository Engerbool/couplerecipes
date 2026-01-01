import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Recipe, User, ViewState } from './types';
import { signInWithGoogle, logout, onAuthStateChange, getCurrentUser, updateNickname } from './services/authService';
import { getRecipesByPartnership, saveRecipe, deleteRecipe } from './services/recipeService';
import { getPartner } from './services/partnershipService';
import { RecipeCard } from './components/RecipeCard';
import { RecipeEditor } from './components/RecipeEditor';
import { RecipeDetail } from './components/RecipeDetail';
import { Button } from './components/Button';
import { PartnerInviteModal } from './components/PartnerInviteModal';
import { PartnerBadge } from './components/PartnerBadge';
import { DisconnectModal } from './components/DisconnectModal';
import { LogoutModal } from './components/LogoutModal';
import { NicknameSetupModal } from './components/NicknameSetupModal';
import { NicknameEditModal } from './components/NicknameEditModal';
import { LanguageToggle } from './components/LanguageToggle';
import { DarkModeToggle } from './components/DarkModeToggle';
import { User as UserIcon, LogOut, Plus, Heart, UtensilsCrossed, Share2, UserX, Edit2 } from 'lucide-react';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNicknameEditModal, setShowNicknameEditModal] = useState(false);
  const [partnerName, setPartnerName] = useState('');
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

  // Load partner name when partnerId changes
  useEffect(() => {
    const loadPartner = async () => {
      if (currentUser?.partnerId) {
        try {
          const partner = await getPartner(currentUser.partnerId);
          if (partner) {
            setPartnerName(partner.nickname || partner.displayName || partner.email);
          }
        } catch (error) {
          console.error('Failed to load partner:', error);
        }
      } else {
        setPartnerName('');
      }
    };

    loadPartner();
  }, [currentUser?.partnerId]);

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
      setShowLogoutModal(false);
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

  const handleEditRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('EDIT_VERSION');
  };

  const handleUpgradeRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('UPGRADE_VERSION');
  };

  const handleInviteSuccess = async () => {
    const updatedUser = await getCurrentUser();
    setCurrentUser(updatedUser);
    setShowInviteModal(false);
  };

  const handleDisconnectSuccess = async () => {
    const updatedUser = await getCurrentUser();
    setCurrentUser(updatedUser);
    setRecipes([]);
    setShowDisconnectModal(false);
  };

  const handleNicknameSave = async (nickname: string) => {
    if (!currentUser) return;

    try {
      await updateNickname(currentUser.id, nickname);
      const updatedUser = await getCurrentUser();
      setCurrentUser(updatedUser);
      setShowNicknameEditModal(false);
    } catch (error) {
      console.error('Failed to update nickname:', error);
      alert('Failed to update nickname');
    }
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
          <h1 className="text-3xl font-bold text-stone-800 mb-2 font-diphylleia">{t('app.title')}</h1>
          <p className="text-stone-500 mb-8" dangerouslySetInnerHTML={{ __html: `${t('app.tagline')}<br/>${t('app.subtitle')}` }} />

          <Button onClick={handleGoogleLogin} className="w-full py-3 text-lg justify-center mt-4">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.signInWithGoogle')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-bg-primary text-stone-900 dark:text-dark-text-primary font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg-secondary/80 backdrop-blur-md border-b border-stone-200 dark:border-dark-border-primary px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
        <div
          className="flex items-center gap-1 md:gap-2 font-bold text-base md:text-xl text-amber-600 dark:text-amber-500 cursor-pointer font-diphylleia whitespace-nowrap"
          onClick={() => { setView('DASHBOARD'); setSelectedRecipe(null); }}
        >
          <UtensilsCrossed className="w-4 h-4 md:w-6 md:h-6 flex-shrink-0" /> <span className="leading-none">{t('app.title')}</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <DarkModeToggle />
          <LanguageToggle />
          {currentUser?.partnerId ? (
            <>
              <PartnerBadge partnerId={currentUser.partnerId} />
              <Button
                variant="ghost"
                onClick={() => setShowDisconnectModal(true)}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <UserX size={16} /> <span className="hidden sm:inline">{t('partner.disconnect')}</span>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setShowInviteModal(true)}
              className="hidden sm:flex text-sm"
            >
              <Share2 size={16} /> {t('nav.invitePartner')}
            </Button>
          )}
          <div className="flex items-center gap-3 pl-4 border-l border-stone-200 dark:border-dark-border-primary">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-stone-800 dark:text-dark-text-primary">{currentUser.nickname || currentUser.name}</div>
                {currentUser.nickname && (
                  <button
                    onClick={() => setShowNicknameEditModal(true)}
                    className="text-stone-400 dark:text-dark-text-tertiary hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                    title={t('nickname.edit')}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
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
            <button onClick={() => setShowLogoutModal(true)} className="text-stone-400 dark:text-dark-text-tertiary hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2" title={t('auth.logout')}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'DASHBOARD' && (
          <>
            <div className="flex justify-between items-end mb-4 md:mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-800 dark:text-dark-text-primary mb-1">{t('dashboard.title')}</h2>
                <p className="text-sm text-stone-500 dark:text-dark-text-secondary">{t('dashboard.subtitle', { count: recipes.length })}</p>
              </div>
              <Button onClick={() => setView('CREATE_RECIPE')} className="flex-shrink-0">
                <Plus size={20} /> <span className="hidden sm:inline">{t('dashboard.newRecipe')}</span>
              </Button>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-dark-bg-secondary rounded-3xl border-2 border-dashed border-stone-200 dark:border-dark-border-primary">
                <div className="w-20 h-20 bg-stone-50 dark:bg-dark-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300 dark:text-dark-text-tertiary">
                  <UtensilsCrossed size={40} />
                </div>
                <h3 className="text-lg font-bold text-stone-600 dark:text-dark-text-secondary mb-2">{t('dashboard.noRecipes')}</h3>
                <p className="text-stone-400 dark:text-dark-text-tertiary max-w-xs mx-auto" dangerouslySetInnerHTML={{ __html: t('dashboard.noRecipesDesc') }} />
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

        {(view === 'CREATE_RECIPE' || view === 'EDIT_VERSION' || view === 'UPGRADE_VERSION') && (
          <RecipeEditor
            user={currentUser}
            existingRecipe={selectedRecipe || undefined}
            isNewVersion={view === 'EDIT_VERSION' || view === 'UPGRADE_VERSION'}
            editMode={view === 'EDIT_VERSION' ? 'edit' : view === 'UPGRADE_VERSION' ? 'upgrade' : undefined}
            onSave={handleSaveRecipe}
            onCancel={() => {
              if ((view === 'EDIT_VERSION' || view === 'UPGRADE_VERSION') && selectedRecipe) {
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
            onEditClick={handleEditRecipeClick}
            onUpgradeClick={handleUpgradeRecipeClick}
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

      {/* Disconnect Modal */}
      {showDisconnectModal && currentUser && currentUser.partnershipId && (
        <DisconnectModal
          userId={currentUser.id}
          partnershipId={currentUser.partnershipId}
          partnerName={partnerName}
          onClose={() => setShowDisconnectModal(false)}
          onSuccess={handleDisconnectSuccess}
        />
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      )}

      {/* Nickname Setup Modal */}
      {currentUser && !currentUser.nickname && (
        <NicknameSetupModal defaultName={currentUser.name} onSave={handleNicknameSave} />
      )}

      {/* Nickname Edit Modal */}
      {showNicknameEditModal && currentUser && currentUser.nickname && (
        <NicknameEditModal
          currentNickname={currentUser.nickname}
          onSave={handleNicknameSave}
          onClose={() => setShowNicknameEditModal(false)}
        />
      )}
    </div>
  );
};

export default App;