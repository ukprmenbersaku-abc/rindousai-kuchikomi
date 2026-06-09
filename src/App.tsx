/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Header from './components/Header';
import MapPage from './components/MapPage';
import SpotFormModal from './components/SpotFormModal';
import ReviewModal from './components/ReviewModal';
import ManifestoTab from './components/ManifestoTab';
import MembersTab from './components/MembersTab';
import ScheduleTab from './components/ScheduleTab';
import AdminTableTab from './components/AdminTableTab';
import CookieConsentModal from './components/CookieConsentModal';
import CreditsTab from './components/CreditsTab';
import SettingsModal from './components/SettingsModal';
import { useMapApp } from './hooks/useMapApp';
import { Sparkles, Key, ChevronRight } from 'lucide-react';

export default function App() {
  const {
    isAdmin,
    setIsAdmin,
    activeTab,
    setActiveTab,
    spots,
    setSpots,
    categories,
    setCategories,
    selectedSpot,
    setSelectedSpot,
    selectedCategory,
    setSelectedCategory,
    addingCoord,
    setAddingCoord,
    showNotification,
    showSettingsModal,
    setShowSettingsModal,

    showLoginModal,
    setShowLoginModal,
    loginPassword,
    setLoginPassword,
    loginError,
    setLoginError,
    isMobile,
    isMobileDrawerExpanded,
    setIsMobileDrawerExpanded,
    expandedProgram,
    setExpandedProgram,

    spotReviews,
    isLoadingReviews,
    searchQuery,
    setSearchQuery,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
    newAuthor,
    setNewAuthor,
    newRole,
    setNewRole,
    isSubmittingReview,

    triggerNotification,
    handleAddReview,
    getCategoryColor,
    searchedSpots,
    averageRating,
    loadSpots,
    handleLoginSubmit,
    handleSaveSpot,
    handleDeleteSpot,
    handleAddSpotClick,
  } = useMapApp();

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
        
        {/* Map page loaded as a standalone screen layout */}
        {activeTab === 'home' && (
          <MapPage
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
            handleAddSpotClick={handleAddSpotClick}
          />
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
                <span className="w-8 h-8 rounded-full bg-indigo-505/10 flex items-center justify-center border border-indigo-500/20">
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
                     パスワードが一致しません
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
