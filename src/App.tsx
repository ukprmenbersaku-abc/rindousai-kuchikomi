/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Spot, Category } from './types';
import { api } from './lib/api';
import Header from './components/Header';
import MapContainer from './components/MapContainer';
import SpotFormModal from './components/SpotFormModal';
import ReviewModal from './components/ReviewModal';
import ManifestoTab from './components/ManifestoTab';
import MembersTab from './components/MembersTab';
import ScheduleTab from './components/ScheduleTab';
import AdminTableTab from './components/AdminTableTab';
import SpotSidebar from './components/SpotSidebar';
import CookieConsentModal from './components/CookieConsentModal';
import CreditsTab from './components/CreditsTab';
import SettingsModal from './components/SettingsModal';
import { Sparkles, Key, ChevronRight } from 'lucide-react';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'stage', label: 'ステージ発表', color: 'indigo' },
  { id: 'exhibition', label: '展示企画', color: 'emerald' },
  { id: 'food_shop', label: '模擬店・バザー', color: 'amber' },
  { id: 'event', label: '特別催し', color: 'rose' },
];

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingCoord, setAddingCoord] = useState<{ x: number; y: number } | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Secret Admin & Mobile responsive optimization states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(0); // 1st program open by default on mobile

  // Reviews and Search/Filtering for Google Maps style left detailed sidebar
  const [spotReviews, setSpotReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRole, setNewRole] = useState<'1年生' | '2年生' | '3年生' | '教職員' | '保護者' | 'OB・OG' | '地域住民' | 'その他'>('1年生');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Auto-fetch reviews inside sidebar when selectedSpot transitions
  useEffect(() => {
    if (selectedSpot) {
      setIsMobileDrawerExpanded(true);
      const getSpotReviews = async () => {
        setIsLoadingReviews(true);
        try {
          const data = await api.getReviews(selectedSpot.id);
          setSpotReviews(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingReviews(false);
        }
      };
      getSpotReviews();
    } else {
      setSpotReviews([]);
      setIsMobileDrawerExpanded(false);
    }
  }, [selectedSpot]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot || !newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const submittedName = newAuthor.trim() || '匿名希望';
      await api.saveReview({
        spotId: selectedSpot.id,
        rating: newRating,
        comment: newComment.trim(),
        author: submittedName,
        role: newRole,
      });
      setNewComment('');
      setNewAuthor('');
      setNewRating(5);
      
      // Refresh list
      const data = await api.getReviews(selectedSpot.id);
      setSpotReviews(data);
      triggerNotification('📝 新しい口コミを投稿しました！');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const found = categories.find(c => c.id === categoryId);
    if (!found) {
      return {
        label: '特別催し・その他',
        textBg: 'bg-rose-50 border-rose-150 text-rose-700',
        bg: 'bg-rose-500',
      };
    }

    let textBgStr = 'bg-rose-50 border-rose-155 text-rose-700';
    let bgStr = 'bg-rose-500';

    switch (found.color) {
      case 'indigo':
        textBgStr = 'bg-indigo-50 border-indigo-150 text-indigo-700';
        bgStr = 'bg-indigo-500';
        break;
      case 'emerald':
        textBgStr = 'bg-emerald-50 border-emerald-155 text-emerald-700';
        bgStr = 'bg-emerald-505';
        break;
      case 'amber':
        textBgStr = 'bg-amber-50 border-amber-155 text-amber-700';
        bgStr = 'bg-amber-500';
        break;
      case 'violet':
        textBgStr = 'bg-violet-50 border-violet-155 text-violet-700';
        bgStr = 'bg-violet-500';
        break;
      case 'teal':
        textBgStr = 'bg-teal-50 border-teal-155 text-teal-700';
        bgStr = 'bg-teal-500';
        break;
      case 'orange':
        textBgStr = 'bg-orange-50 border-orange-155 text-orange-700';
        bgStr = 'bg-orange-500';
        break;
      case 'fuchsia':
        textBgStr = 'bg-fuchsia-50 border-fuchsia-155 text-fuchsia-700';
        bgStr = 'bg-fuchsia-505';
        break;
      case 'rose':
      default:
        textBgStr = 'bg-rose-50 border-rose-155 text-rose-700';
        bgStr = 'bg-rose-500';
        break;
    }

    return {
      label: found.label,
      textBg: textBgStr,
      bg: bgStr,
    };
  };

  // Filter spots based on both parent tag filters and left sidebar search inputs
  const searchedSpots = spots.filter(s => {
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const averageRating = spotReviews.length > 0
    ? (spotReviews.reduce((acc, r) => acc + r.rating, 0) / spotReviews.length).toFixed(1)
    : '評価なし';

  // Load spots from our API / storage layer
  const loadSpots = async () => {
    try {
      const data = await api.getSpots();
      setSpots(data);
    } catch (e) {
      console.error('Error loading spots:', e);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      if (data && data.length > 0) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  useEffect(() => {
    loadSpots();
    loadCategories();

    // Check size on mount
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Check URL to see if we should trigger secret administrator login dialog
    const checkPath = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const isSecret = 
        path.includes('stystem-rindou') || 
        path.includes('system-rindou') || 
        hash.includes('stystem-rindou') || 
        hash.includes('system-rindou');

      if (isSecret) {
        setShowLoginModal(true);
      }
    };

    checkPath();
    window.addEventListener('hashchange', checkPath);

    // Keep admin mode persistent during current session
    if (sessionStorage.getItem('rindo_admin') === 'true') {
      setIsAdmin(true);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('hashchange', checkPath);
    };
  }, []);

  const triggerNotification = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // Admin secret login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === 'kuchikomi-yama') {
      setIsAdmin(true);
      sessionStorage.setItem('rindo_admin', 'true');
      setShowLoginModal(false);
      setLoginPassword('');
      setLoginError(false);
      triggerNotification('ログイン成功！管理者モードになりました。');
      
      // Clear secret parameters from URL seamlessly
      if (window.location.hash.includes('rindou')) {
        window.location.hash = 'home';
      } else {
        window.history.replaceState({}, '', '/');
      }
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  // Add new spot from map click (Admin only)
  const handleAddSpotClick = (x: number, y: number) => {
    setAddingCoord({ x, y });
  };

  const handleSaveSpot = async (newSpotData: Omit<Spot, 'id'>) => {
    try {
      const saved = await api.saveSpot(newSpotData);
      setSpots((prev) => [saved, ...prev]);
      setAddingCoord(null);
      triggerNotification(`口コミスポット「${saved.name}」を配置しました！`);
    } catch (error) {
      console.error('Failed to save spot:', error);
    }
  };

  // Delete spot
  const handleDeleteSpot = async (id: number) => {
    try {
      const success = await api.deleteSpot(id);
      if (success) {
        setSpots((prev) => prev.filter((s) => s.id !== id));
        setSelectedSpot(null);
        triggerNotification('🗑️ スポットを削除しました。');
      }
    } catch (error) {
      console.error('Failed to delete spot:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-800 font-sans antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-900" id="main-view-app">
      
      {/* Header component replicating school festival look */}
      <Header 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Floated system notifications */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-neutral-100 border border-neutral-800 text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up" id="app-notification">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Interactive Main Body Content */}
      <main className="flex-grow">
        
        {/* Dynamic Navigation Content router */}
        {activeTab === 'home' && (
          <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-white animate-fade-in text-left">
            
            {/* Modular Sidebar Section */}
            <SpotSidebar 
              isMobile={isMobile}
              isMobileDrawerExpanded={isMobileDrawerExpanded}
              setIsMobileDrawerExpanded={setIsMobileDrawerExpanded}
              selectedSpot={selectedSpot}
              setSelectedSpot={setSelectedSpot}
              spots={spots}
              setSpots={setSpots}
              categories={categories}
              setCategories={setCategories}
              isAdmin={isAdmin}
              triggerNotification={triggerNotification}
              loadSpots={loadSpots}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setActiveTab={setActiveTab}
              getCategoryColor={getCategoryColor}
              searchedSpots={searchedSpots}
              averageRating={averageRating}
              spotReviews={spotReviews}
              isLoadingReviews={isLoadingReviews}
              handleAddReview={handleAddReview}
              newRating={newRating}
              setNewRating={setNewRating}
              newComment={newComment}
              setNewComment={setNewComment}
              newAuthor={newAuthor}
              setNewAuthor={setNewAuthor}
              newRole={newRole}
              setNewRole={setNewRole}
              isSubmittingReview={isSubmittingReview}
              handleDeleteSpot={handleDeleteSpot}
              setAddingCoord={setAddingCoord}
            />

            {/* Google Maps style right-hand canvas mapping viewport */}
            <div className="flex-1 h-full min-w-0 overflow-hidden relative bg-neutral-100">
              <MapContainer
                spots={spots}
                selectedSpot={selectedSpot}
                onSelectSpot={setSelectedSpot}
                isAdmin={isAdmin}
                onAddSpotClick={handleAddSpotClick}
                selectedCategory={selectedCategory}
                categories={categories}
              />
            </div>

          </div>
        )}

        {/* 1. Manifesto tab modular view */}
        {activeTab === 'manifesto' && (
          <ManifestoTab 
            isMobile={isMobile}
            expandedProgram={expandedProgram}
            setExpandedProgram={setExpandedProgram}
            spots={spots}
            categories={categories}
          />
        )}

        {/* 2. Members tab modular view */}
        {activeTab === 'members' && (
          <MembersTab />
        )}

        {/* 3. Schedule tab modular view */}
        {activeTab === 'schedule' && (
          <ScheduleTab />
        )}

        {/* 3.5. Credits & Sources tab modular view */}
        {activeTab === 'credits' && (
          <CreditsTab />
        )}

        {/* 4. Administrator full tabular board view */}
        {activeTab === 'admin_table' && isAdmin && (
          <AdminTableTab 
            spots={spots}
            setSpots={setSpots}
            categories={categories}
            setCategories={setCategories}
            triggerNotification={triggerNotification}
            setSelectedSpot={setSelectedSpot}
          />
        )}

      </main>

      {/* FOOTER - only visible on standard scrollable pages, hidden on full-screen map to maximize canvas space */}
      {activeTab !== 'home' && (
        <footer className="bg-neutral-900 text-neutral-400 text-xs py-10 sm:py-14 mt-auto border-t border-neutral-800 border-dashed" id="footer-app">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center text-left">
              
              {/* Column 1 Logo */}
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </span>
                <span className="font-bold text-neutral-100 tracking-tight text-sm">りんどう祭 実行委員会</span>
              </div>

              {/* Column 2 Copy & Logout */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
                <div>
                  <p className="text-neutral-500 font-mono text-[10px]">
                    CAMPUS MAP PLATFORM v1.2
                  </p>
                  <p className="text-neutral-400 text-[10px] mt-0.5">
                    © 2026 Chikumano Junior High School Rindo Festival Committee.
                  </p>
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => {
                      setIsAdmin(false);
                      sessionStorage.removeItem('rindo_admin');
                      window.location.hash = 'home';
                      triggerNotification('🔒 ログアウトしました。一般表示に戻ります。');
                    }} 
                    className="hover:text-neutral-100 text-neutral-400 transition-colors duration-150 flex items-center gap-1 text-[11px] font-bold self-start md:self-auto cursor-pointer"
                  >
                    <span>一般ユーザー表示に戻る</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>
        </footer>
      )}

      {/* POPUP MODALS */}
      {/* 1. Review Modal (Clicked Spot reviews & post - only rendered outside home map tab just in case fallback) */}
      {selectedSpot && activeTab !== 'home' && (
        <ReviewModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          isAdmin={isAdmin}
          onDeleteSpot={handleDeleteSpot}
        />
      )}

      {/* 2. Admin Spot Creation modal */}
      {addingCoord && (
        <SpotFormModal
          x={addingCoord.x}
          y={addingCoord.y}
          onClose={() => setAddingCoord(null)}
          onSave={handleSaveSpot}
          categories={categories}
        />
      )}

      {/* 3. Secret Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-4" id="login-modal">
          <div className="bg-white max-w-sm w-full p-8 rounded-[32px] border border-neutral-100 shadow-2xl relative animate-scale-up">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                <Key className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-lg font-black text-neutral-900">委員会管理者ログイン</h3>
              <p className="text-[11px] text-neutral-400 mt-1">
                デバッグ・企画確認などの管理権限を設定します。
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  管理者パスワード
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  autoFocus
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-200 ${
                    loginError 
                      ? 'border-rose-500 focus:ring-rose-500/20 bg-rose-50/10' 
                      : 'border-neutral-200 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-inner'
                  }`}
                />
                {loginError && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 animate-pulse">
                    ⚠️ パスワードが一致しません
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginPassword('');
                    setLoginError(false);
                    window.location.hash = 'home';
                  }}
                  className="flex-1 py-3 border border-neutral-100 hover:bg-neutral-50 rounded-xl text-neutral-400 hover:text-neutral-700 font-semibold text-xs tracking-wider transition-all duration-150 cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs tracking-wider shadow-lg shadow-indigo-600/10 transition-all duration-150 cursor-pointer"
                >
                  認証する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cookie Consent & Credits Modal Overlay */}
      <CookieConsentModal />

      {/* Settings & Cookie Preferences Modal Panel */}
      {showSettingsModal && (
        <SettingsModal 
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}
