/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Spot } from './types';
import { api } from './lib/api';
import Header from './components/Header';
import SuggestionCards from './components/SuggestionCards';
import MapContainer from './components/MapContainer';
import SpotFormModal from './components/SpotFormModal';
import ReviewModal from './components/ReviewModal';
import { 
  Users, Calendar, CheckSquare, Sparkles, MessageSquareHeart, 
  MapPin, AlertCircle, HelpCircle, Flame, ExternalLink, ChevronRight, CheckCircle2,
  Search, Star, Send, Trash2, Heart, MessageSquare, ChevronLeft, Compass
} from 'lucide-react';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingCoord, setAddingCoord] = useState<{ x: number; y: number } | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Secret Admin & Mobile responsive optimization states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(0); // 1st program open by default on mobile
  const [showD1Help, setShowD1Help] = useState(false);

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

  const handleDeleteSpotFromSidebar = async (id: number) => {
    if (confirm('この口コミスポットと紐づくすべての口コミを本当に削除しますか？')) {
      await handleDeleteSpot(id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stage':
        return {
          label: 'ステージ発表',
          textBg: 'bg-indigo-50 border-indigo-150 text-indigo-700',
          bg: 'bg-indigo-500',
        };
      case 'exhibition':
        return {
          label: '展示企画',
          textBg: 'bg-emerald-50 border-emerald-150 text-emerald-700',
          bg: 'bg-emerald-500',
        };
      case 'food_shop':
        return {
          label: '模擬店・バザー',
          textBg: 'bg-amber-50 border-amber-150 text-amber-700',
          bg: 'bg-amber-500',
        };
      default:
        return {
          label: '特別催し・その他',
          textBg: 'bg-rose-50 border-rose-150 text-rose-700',
          bg: 'bg-rose-500',
        };
    }
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

  useEffect(() => {
    loadSpots();

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
      triggerNotification('🔑 ログイン成功！管理者モードになりました。');
      
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
      triggerNotification(`📍 口コミスポット「${saved.name}」を配置しました！`);
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

  // Handle promise category selection to auto-scroll to map
  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      // Auto scroll to map area smoothly for immediate interaction
      const mapEl = document.getElementById('map-explore-section');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-800 font-sans antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header component replicating school festival look */}
      <Header 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Floated system notifications */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-neutral-100 border border-neutral-800 text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Interactive Main Body Content */}
      <main className="flex-grow">
        
        {/* Dynamic Navigation Content router */}
        {activeTab === 'home' && (
          <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-white animate-fade-in text-left">
            
            {/* Left Detailed Sidebar Menu (Google Maps style) */}
            <div 
              style={isMobile ? {
                height: selectedSpot 
                  ? (isMobileDrawerExpanded ? '65vh' : '110px') 
                  : (isMobileDrawerExpanded ? '65vh' : '64px'),
                maxHeight: '75vh',
              } : undefined}
              className={`
                ${isMobile 
                  ? 'absolute bottom-0 left-0 right-0 w-full bg-white z-30 flex flex-col shrink-0 overflow-hidden rounded-t-[24px] shadow-[0_-10px_35px_rgba(0,0,0,0.15)] border-t border-neutral-100 transition-all duration-300 ease-in-out' 
                  : 'w-full md:w-[320px] lg:w-[350px] xl:w-[380px] h-full bg-white border-b md:border-b-0 md:border-r border-neutral-100 flex flex-col shrink-0 overflow-hidden relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]'
                }
              `}
            >
              {/* Grabber indicator at the top for Mobile swipe drawer style */}
              {isMobile && (
                <div 
                  onClick={() => setIsMobileDrawerExpanded(!isMobileDrawerExpanded)}
                  className="w-full pt-2.5 flex flex-col items-center justify-center cursor-pointer select-none pb-1.5 bg-neutral-50 border-b border-neutral-100 shrink-0"
                >
                  <div className="w-12 h-1 bg-neutral-300 rounded-full mb-1" />
                  <span className="text-[8px] font-bold text-neutral-400 font-mono">
                    {isMobileDrawerExpanded ? 'タップしてマップを広く表示 ⬇️' : 'タップ・引き上げて詳細を表示 ⬆️'}
                  </span>
                </div>
              )}

              {/* MOBILE COLLAPSED ALTERNATIVES */}
              {isMobile && !isMobileDrawerExpanded ? (
                /* Collapsed Mobile Mini View */
                !selectedSpot ? (
                  /* No spot selected collapsed content */
                  <div 
                    onClick={() => setIsMobileDrawerExpanded(true)}
                    className="flex-grow flex items-center justify-between px-5 font-bold cursor-pointer h-full bg-white text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                      <span className="text-xs font-black text-neutral-800">
                        企画・模擬店スポット一覧をみる ({spots.length}選)
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md font-bold">
                      展開する 🔍
                    </span>
                  </div>
                ) : (
                  /* Selected Spot summary collapsed content */
                  <div 
                    onClick={() => setIsMobileDrawerExpanded(true)}
                    className="flex-grow flex items-center justify-between px-5 h-full text-left bg-white"
                  >
                    <div className="flex flex-col min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${getCategoryColor(selectedSpot.category).textBg}`}>
                          {getCategoryColor(selectedSpot.category).label}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-neutral-800 truncate">
                          {selectedSpot.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-neutral-500">
                        <span className="flex items-center text-amber-500 gap-0.5">
                          ★ <span className="text-neutral-800 font-bold">{averageRating}</span>
                        </span>
                        <span>•</span>
                        <span>口コミ {spotReviews.length}件</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSpot(null);
                        }}
                        className="px-2.5 py-1 text-neutral-600 bg-neutral-100 rounded-lg text-[10px] font-bold border border-neutral-200"
                      >
                        戻る
                      </button>
                      <span className="text-[10px] text-white bg-indigo-600 px-2.5 py-1 rounded-md font-bold animate-pulse">
                        もっと見る 👋
                      </span>
                    </div>
                  </div>
                )
              ) : (
                /* FULL EXPANDED SIDEBAR CONTENT (Both Desktop, and Mobile Expanded) */
                <>
                  {/* Sidebar Header Title Area */}
                  <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                          校内マップボード
                        </span>
                        {isAdmin && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                            管理者マップ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 font-mono">
                        スポット数: {spots.length}
                      </span>
                    </div>
                    <h2 className="text-base font-black text-neutral-800 mt-2 tracking-tight">
                      りんどう祭 会場口コミボード
                    </h2>
                    <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                      各展示・ステージ・模擬店のおすすめ口コミや満足度を集約！気になる場所を選択して確認しましょう。
                    </p>
                  </div>

                  {/* Sidebar Content Switch: Details View or Global Exploration List */}
                  {!selectedSpot ? (
                    <>
                      {/* Admin Console Section (Collapsible & Premium) */}
                      {isAdmin && (
                        <div className="mx-4 mt-3 p-4 bg-slate-900 text-white rounded-2xl text-left shadow-lg border border-slate-800">
                          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-xs font-black tracking-tight">
                                🛠️ 管理者コンソール
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                              Pages D1
                            </span>
                          </div>

                          {/* D1 Connection Status Badge */}
                          <div className="mb-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                            <div className="flex items-center gap-2 mb-1">
                              {api.isUsingFallback() ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                  <span className="text-[10px] font-bold text-cyan-400">
                                    💡 ローカル(LocalStorage)で動作中
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="text-[10px] font-bold text-emerald-400">
                                    🟢 Realtime D1 データベース接続中
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 leading-normal">
                              {api.isUsingFallback() 
                                ? "現在の環境では Cloudflare D1 データベースへのバインディングが無効、または未作成のため、ローカルキャッシュ(安全な模擬DB)で自動フォールバック運転しています。D1設定完了後に自動でリアルタイム同期に切り替わります。"
                                : "Cloudflare D1 リアルタイムデータベースとの完全同期に成功しています！追加したスポットや書き込まれた口コミは本番DBに直接保存されます。"}
                            </p>
                          </div>

                          <p className="text-[10px] text-slate-300 leading-relaxed mb-3">
                            マップ上のすべての企画イベントや口コミ投稿データを一括管理します。「データをすべて消去」を選択すると、登録されたすべてのスポット情報（座標位置も含む）と一般の書き込み口コミを含む、すべてのデータがデータベースから完全に消去され、まっさらな状態から新規設定できます。
                          </p>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {/* Reset/Clear button */}
                            <button
                              onClick={async () => {
                                if (window.confirm('登録されているすべてのイベントスポットと一連の口コミをデータベースから完全に消去して初期化します。本当によろしいですか？')) {
                                  try {
                                    triggerNotification('🔄 データベースを完全初期化中...');
                                    const success = await api.resetDatabase();
                                    if (success) {
                                      await loadSpots();
                                      setSelectedSpot(null);
                                      triggerNotification('✨ データベースを完全に初期化し、まっさらな状態になりました！');
                                    } else {
                                      triggerNotification('❌ 初期化中にエラーが発生しました');
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    triggerNotification('❌ 接続エラーが発生しました');
                                  }
                                }
                              }}
                              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm shrink-0 whitespace-nowrap select-none border border-rose-500/30"
                            >
                              <span>🗑️ データをすべて消去</span>
                            </button>

                            {/* Add Spot button */}
                            <button
                              onClick={() => {
                                setAddingCoord({ x: 50.0, y: 50.0 });
                              }}
                              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[10px] font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shrink-0 whitespace-nowrap select-none border border-indigo-500/30"
                            >
                              <span>➕ 新規イベント追加</span>
                            </button>
                          </div>

                          {/* Quick D1 setup dropdown help */}
                          <div className="border-t border-slate-800/80 pt-2.5">
                            <button
                              onClick={() => setShowD1Help(!showD1Help)}
                              className="w-full flex items-center justify-between text-[10px] font-extrabold text-slate-300 hover:text-white transition-colors"
                            >
                              <span className="flex items-center gap-1">
                                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                                ❓ D1データベース連携に必要な設定は？
                              </span>
                              <span className="text-[8px] font-mono font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                {showD1Help ? '閉じる ⬆️' : '展開する ⬇️'}
                              </span>
                            </button>

                            {showD1Help && (
                              <div className="mt-2 p-2.5 bg-slate-950 rounded-xl text-[9px] text-slate-300 space-y-2 border border-slate-800/60 leading-normal animate-slide-up">
                                <p className="font-bold text-indigo-400">Cloudflare Pages と D1 連携設定シート</p>
                                <ol className="list-decimal pl-3 space-y-1.5 text-slate-400">
                                  <li>
                                    <strong className="text-slate-200">D1データベースの作成:</strong><br />
                                    Cloudflareダッシュボードの 「D1/SQL」 からデータベースを新規作成します。
                                  </li>
                                  <li>
                                    <strong className="text-slate-200">テーブルの初期設定 (スキーマ適用):</strong><br />
                                    D1コンソール上に、本プロジェクトのルートにある <code className="text-indigo-300">/functions/schema.sql</code> の内容を実行して、テーブルを作成します。
                                  </li>
                                  <li>
                                    <strong className="text-slate-200">Pagesプロジェクトにバインド:</strong><br />
                                    Pagesの設定画面「Settings」 &gt; 「Functions」 &gt; 「D1 database bindings」にて、<code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">DB</code> というバインディング名 (Variable name) で上記1で作成したD1を選択して保存します。
                                  </li>
                                  <li>
                                    <strong className="text-slate-200">再デプロイ:</strong><br />
                                    バインド後に再デプロイすると、自動的にフォールバックから本物のリアルタイムD1通信に切り替わります！
                                  </li>
                                </ol>
                                <p className="text-[8px] text-amber-400 bg-amber-500/5 p-1.5 rounded border border-amber-500/20">
                                  ※ 独自ドメイン <code className="font-semibold text-white">rindousai-kuchi.pages.dev</code> にてD1バインドを行えば、複数スマホやブラウザ間で投稿された内容が即時にリアルタイム共有されます。
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Search Bar matching Google Maps search utility */}
                  <div className="relative px-4 py-2 border-b border-neutral-100 bg-white">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="場所名やキーワードを入力して探す..."
                        className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border border-neutral-200/80 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder-neutral-400"
                      />
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Quick Filter Tags */}
                  <div className="px-4 py-3 bg-neutral-50/30 border-b border-neutral-100">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1.5">
                      カテゴリーで絞り込む
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: null, label: 'すべて', color: 'bg-neutral-100 border-neutral-200 text-neutral-700' },
                        { id: 'stage', label: 'ステージ', color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
                        { id: 'exhibition', label: '展示企画', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
                        { id: 'food_shop', label: '模擬店', color: 'bg-amber-50 border-amber-100 text-amber-700' },
                        { id: 'other', label: '特別催し', color: 'bg-rose-50 border-rose-100 text-rose-700' },
                      ].map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id || 'all'}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
                              isSelected 
                                ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' 
                                : `${cat.color} hover:opacity-80`
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scrollable list of registered spots */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-2.5 bg-neutral-50/30">
                    {searchedSpots.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-neutral-200 mt-2">
                        <MapPin className="w-8 h-8 text-neutral-300 mb-2" />
                        <p className="text-xs font-bold text-neutral-500">
                          {spots.length === 0 ? 'スポットが未登録です' : 'スポットが見つかりません'}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                          {spots.length === 0 
                            ? '右上または左の管理者モード等から、マップをタップ・クリックするか「新規イベント追加」から最初のステージや教室企画を登録しましょう！'
                            : 'キーワードを修正するか、フィルターをリセットしてください。'}
                        </p>
                      </div>
                    ) : (
                      searchedSpots.map((spot) => {
                        const styleSet = getCategoryColor(spot.category);
                        return (
                          <div
                            key={spot.id}
                            onClick={() => setSelectedSpot(spot)}
                            className="bg-white p-3.5 rounded-2xl border border-neutral-100 hover:border-indigo-200 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col gap-1 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${styleSet.textBg}`}>
                                {styleSet.label}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                位置: {spot.x}%, {spot.y}%
                              </span>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-neutral-800 tracking-tight leading-snug">
                              {spot.name}
                            </h3>
                            {spot.description && (
                              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                                {spot.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-neutral-50 text-[10px] font-bold text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                <span>口コミをみる・投稿する</span>
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                            </div>
                          </div>
                        );
                      })
                    )}

                    {isAdmin && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-800 mt-2 leading-relaxed text-left">
                        💡 企画管理者メンバーへ：<br />
                        右側の「マップ画面」の任意の床面をタップすると、新しい企画スポット（口コミピン）をその場所へ一発配置できます。
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* SELECTED SPOT IN-DEPTH DETAIL SIDEBAR (Google Maps layout mode) */
                <div className="flex-grow flex flex-col overflow-hidden bg-white text-left">
                  
                  {/* Title Header with clean back action bar */}
                  <div className="p-4 border-b border-neutral-100 flex flex-col bg-neutral-50/20">
                    <button 
                      onClick={() => setSelectedSpot(null)}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-indigo-600 font-black mb-3 select-none self-start transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>一覧・検索に戻る</span>
                    </button>

                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full border mb-1.5 ${getCategoryColor(selectedSpot.category).textBg}`}>
                          {getCategoryColor(selectedSpot.category).label}
                        </span>
                        <h3 className="text-base font-black text-neutral-900 tracking-tight leading-tight">
                          {selectedSpot.name}
                        </h3>
                      </div>
                      
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteSpotFromSidebar(selectedSpot.id)}
                          className="flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>削除</span>
                        </button>
                      )}
                    </div>

                    {selectedSpot.description && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed mt-2 bg-white p-3 border border-dashed border-neutral-200/50 rounded-xl shadow-inner">
                        {selectedSpot.description}
                      </p>
                    )}

                    {/* Stats Summary row */}
                    <div className="flex items-center gap-3 mt-3.5 text-[11px] font-semibold text-neutral-500">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="text-neutral-900 font-black pl-0.5">{averageRating}</span>
                      </span>
                      <span>•</span>
                      <span>口コミ投稿: {spotReviews.length}件</span>
                    </div>
                  </div>

                  {/* Reviews lists inside the Sidebar */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-neutral-50/50">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                      寄せられた口コミ一覧
                    </span>

                    {isLoadingReviews ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-neutral-400 font-mono">読込中...</span>
                      </div>
                    ) : spotReviews.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center bg-white p-4 rounded-xl border border-dashed border-neutral-200">
                        <Sparkles className="w-6 h-6 text-indigo-400 mb-1.5 animate-pulse" />
                        <p className="text-[11px] font-bold text-neutral-600">まだ口コミがありません</p>
                        <p className="text-[10px] text-neutral-400 max-w-xs mt-1 leading-normal">
                          この場所に興味があるみんなに、最初の口コミや応援メッセージを教えてください！
                        </p>
                      </div>
                    ) : (
                      spotReviews.map((review) => (
                        <div key={review.id} className="bg-white p-3.5 rounded-xl border border-neutral-200/40 shadow-sm leading-relaxed text-left flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                                {review.role}
                              </span>
                              <span className="text-[11px] font-bold text-neutral-700">
                                {review.author}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= review.rating 
                                      ? 'text-amber-500 fill-amber-500' 
                                      : 'text-neutral-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-neutral-600 font-medium text-[11px] sm:text-xs">
                            {review.comment}
                          </p>

                          {review.createdAt && (
                            <div className="text-right text-[8px] text-neutral-300 font-mono">
                              {new Date(review.createdAt).toLocaleDateString()} {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Submission Form integrated into bottom of Detail Sidebar */}
                  <div className="border-t border-neutral-100 p-4 bg-white text-left shrink-0">
                    <h4 className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      新しい口コミを投稿する
                    </h4>

                    <form onSubmit={handleAddReview} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        
                        {/* Rating stars select */}
                        <div className="flex-1">
                          <label className="block text-[8px] font-bold text-neutral-400 tracking-wider mb-1">
                            星の評価 <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className="focus:outline-none focus:scale-125 transition-transform duration-100"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 transition-colors duration-100 ${
                                    star <= newRating 
                                      ? 'text-amber-500 fill-amber-500' 
                                      : 'text-neutral-200 hover:text-amber-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Dropdown elements */}
                        <div className="flex gap-2 shrink-0">
                          <div>
                            <label className="block text-[8px] font-bold text-neutral-400 tracking-wider mb-1">
                              区分 <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={newRole}
                              onChange={(e: any) => setNewRole(e.target.value)}
                              className="px-2 py-1 text-[10px] rounded-lg border border-neutral-200 focus:outline-none bg-white focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="1年生">1年生</option>
                              <option value="2年生">2年生</option>
                              <option value="3年生">3年生</option>
                              <option value="教職員">教職員</option>
                              <option value="保護者">保護者</option>
                              <option value="OB・OG">OB・OG</option>
                              <option value="地域住民">地域住民</option>
                              <option value="その他">その他</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-neutral-400 tracking-wider mb-1">
                              ペンネーム
                            </label>
                            <input
                              type="text"
                              value={newAuthor}
                              onChange={(e) => setNewAuthor(e.target.value)}
                              placeholder="匿名希望"
                              maxLength={12}
                              className="w-24 px-2 py-1 text-[10px] rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Text Input */}
                      <div className="relative">
                        <textarea
                          required
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="過ごした感想やおいしかった点、応援メッセージなどをお寄せください！"
                          rows={1}
                          maxLength={300}
                          className="w-full pl-3 pr-10 py-1.5 text-[11px] rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-neutral-400 resize-none leading-normal"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingReview || !newComment.trim()}
                          className="absolute right-1.5 top-1.5 p-1 rounded-md bg-indigo-600 text-white disabled:opacity-40"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

            {/* Google Maps style right-hand canvas mapping viewport */}
            <div className="flex-1 h-full min-w-0 overflow-hidden relative bg-neutral-100">
              <MapContainer
                spots={spots}
                selectedSpot={selectedSpot}
                onSelectSpot={setSelectedSpot}
                isAdmin={isAdmin}
                onAddSpotClick={handleAddSpotClick}
                selectedCategory={selectedCategory}
              />
            </div>

          </div>
        )}

        {activeTab === 'manifesto' && (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 animate-fade-in">
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">りんどう祭の概要</span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-4 mb-6 sm:mb-8 text-center sm:text-left">
              筑摩野中学校「りんどう祭」について
            </h2>
            
            {/* Responsively optimized 4 major festival programs container */}
            <div className="space-y-4 sm:space-y-8">
              {[
                {
                  id: 0,
                  title: '1. 響け！歌声とハーモニー（展示・ステージ発表・合唱）',
                  color: 'bg-indigo-500',
                  desc: 'クラス全員が一丸となって毎日朝と放課後に練習を重ねてきた合唱コンクール。第一体育館に美しく響く一人一人の歌声は、りんどう祭のハイライトです。また、吹奏楽部の迫力あるポップス演奏や、有志による表現豊かなステージ発表も行われます。',
                  spot: '第1体育館 (メインステージ)',
                  spotColor: 'text-indigo-700 bg-indigo-50 border-indigo-100'
                },
                {
                  id: 1,
                  title: '2. 彩れ！青春の学び（学年・部活動 展示企画）',
                  color: 'bg-emerald-500',
                  desc: '各学年の総合学習のまとめ、社会科・理科の自由研究、そして美術部や書道部が長期間にわたって準備してきた大型作品展示が校内に並びます。2年生の教室いっぱいに広がる鮮やかなステンドグラス風モザイクアート展示は必見のクオリティです。',
                  spot: '北校舎 各教室、多目的ホール',
                  spotColor: 'text-emerald-700 bg-emerald-50 border-emerald-100'
                },
                {
                  id: 2,
                  title: '3. 味わえ！松本の温もり（PTA模擬店・おやきバザー）',
                  color: 'bg-amber-500',
                  desc: '中庭に設置された特別模擬店テントでは、PTA厚生部の皆さんによる美味しい「おやき(あんこ・きんぴら・野沢菜)」がホカホカの状態で販売されます。バザーやジュース、フランクフルトもあり、ご家族みんなで休憩しながらお楽しみいただけます。',
                  spot: '中庭テラス特設テント',
                  spotColor: 'text-amber-700 bg-amber-50 border-amber-100'
                },
                {
                  id: 3,
                  title: '4. つながれ！笑顔の輪（謎解きスタンプラリー）',
                  color: 'bg-rose-500',
                  desc: '生徒会執行部が企画した「りんどう特別スタンプラリー」と中庭謎解きアドベンチャー。校内各所を探索しながらクイズに答えて、スタンプを集めるとオリジナル記念バッジがもらえます！',
                  spot: '常設イベント(校内全域)',
                  spotColor: 'text-rose-700 bg-rose-50 border-rose-100'
                }
              ].map((prog) => {
                const isOpen = !isMobile || expandedProgram === prog.id;
                return (
                  <div 
                    key={prog.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/50 shadow-sm overflow-hidden transition-all duration-300"
                  >
                    {/* Header: Clickable only on mobile to collapse layout */}
                    <button
                      onClick={() => isMobile && setExpandedProgram(expandedProgram === prog.id ? null : prog.id)}
                      disabled={!isMobile}
                      className="w-full text-left p-5 sm:p-8 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <h3 className="text-sm sm:text-lg font-bold text-neutral-800 flex items-center gap-2 sm:gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${prog.color}`} />
                        <span>{prog.title}</span>
                      </h3>
                      {isMobile && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all duration-200 ${
                          isOpen ? 'bg-neutral-100 text-neutral-500' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {isOpen ? '閉じる' : '詳細表示'}
                        </span>
                      )}
                    </button>

                    {/* Content Area with smooth height expansion */}
                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-8 sm:pb-8 pt-0 border-t border-neutral-100/50 animate-fade-in">
                        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-4 mt-2">
                          {prog.desc}
                        </p>
                        <div className={`text-[10px] sm:text-[11px] font-bold px-3.5 py-2.5 rounded-xl border ${prog.spotColor}`}>
                          見どころスポット: {prog.spot}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 animate-fade-in">
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">実行委員・主要メンバー</span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-4 mb-4">特別企画・委員会のご紹介</h2>
            <p className="text-xs text-neutral-400 mb-8 sm:mb-10">
              今年のテーマ「輝き」をプロデュースし、毎日準備を重ねてくれた生徒・PTAリーダーたちです。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Member card 1 */}
              <div className="bg-white p-6 rounded-[28px] border border-neutral-200/40 text-center shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 font-bold text-xl shadow-inner">
                  実
                </div>
                <h4 className="text-base font-bold text-neutral-800">りんどう祭 実行委員会本部</h4>
                <p className="text-[11px] text-indigo-600 font-bold mt-1">生徒会本部 ＆ 実行委員一同</p>
                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  「全校の一体感を目指して、思い出に残るプログラムを全力で計画しました。ぜひたくさんの口コミで盛り上げてください！」
                </p>
              </div>

              {/* Member card 2 */}
              <div className="bg-white p-6 rounded-[28px] border border-neutral-200/40 text-center shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 font-bold text-xl shadow-inner">
                  美
                </div>
                <h4 className="text-base font-bold text-neutral-800">美術部 ＆ 書道部</h4>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">合同展示 制作メンバー</p>
                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  「多目的ホールの巨大壁画とダイナミックな書道パフォーマンスに挑戦しました！近くでディテールまで見てほしいです」
                </p>
              </div>

              {/* Member card 3 */}
              <div className="bg-white p-6 rounded-[28px] border border-neutral-200/40 text-center shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100 font-bold text-xl shadow-inner">
                  協
                </div>
                <h4 className="text-base font-bold text-neutral-800">PTA厚生部 模擬店チーム</h4>
                <p className="text-[11px] text-amber-600 font-bold mt-1">おやき模擬店スタッフ一同</p>
                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  「今年も松本地元の美味しいおやきを焼き立てホカホカで準備しました！きんぴら味もたっぷり用意してお待ちしています。」
                </p>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 animate-fade-in">
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">タイムテーブル</span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-4 mb-8">りんどう祭 プログラム日程表</h2>

            <div className="relative border-l-2 border-neutral-200 pl-4 sm:pl-6 ml-2 sm:ml-4 space-y-6 sm:space-y-10">
              
              <div className="relative">
                <span className="absolute -left-[25px] sm:-left-[31px] top-1.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-4 border-white bg-indigo-500 shadow" />
                <h4 className="text-xs sm:text-sm font-mono font-bold text-indigo-600">08:30 ～ 09:10</h4>
                <h3 className="text-sm sm:text-base font-bold text-neutral-800 mt-1">オープニングセレモニー (生徒会本部発表)</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">第一体育館にて開催。りんどう祭の開幕を告げる、テーマに沿った劇や吹奏楽部のおすすめ演奏からスタート！</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[25px] sm:-left-[31px] top-1.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-4 border-white bg-indigo-500 shadow" />
                <h4 className="text-xs sm:text-sm font-mono font-bold text-indigo-600">09:30 ～ 11:30</h4>
                <h3 className="text-sm sm:text-base font-bold text-neutral-800 mt-1">全校合唱コンクール</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">各年生クラスの発表。体育館の響き、一体感、この瞬間のために何百時間も練習してきた生徒たちの生の歌声をぜひお聴きください。</p>
              </div>

              <div className="relative bg-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-indigo-100">
                <span className="absolute -left-[25px] sm:-left-[31px] top-6 w-4.5 h-4.5 rounded-full border-4 border-white bg-amber-500 shadow animate-pulse" />
                <h4 className="text-xs sm:text-sm font-mono font-bold text-amber-600">11:30 ～ 15:00</h4>
                <h3 className="text-sm sm:text-base font-bold text-neutral-800 mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>ブース自由見学・PTA模擬店 ＆ ランチ</span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-widest font-sans">お楽しみ時間</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">各教室のスタンプラリー、おやきバザー、謎解きイベント、作品展示鑑賞など自由に楽しめるお祭りタイムです！</p>
              </div>

              <div className="relative bg-white/60 p-4 sm:p-5 rounded-2xl border border-neutral-200/40">
                <span className="absolute -left-[25px] sm:-left-[31px] top-6 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-4 border-white bg-indigo-500 shadow" />
                <h4 className="text-xs sm:text-sm font-mono font-bold text-indigo-600">15:10 ～ 15:45</h4>
                <h3 className="text-sm sm:text-base font-bold text-neutral-800 mt-1">クロージングセレモニー ＆ 表彰式</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">合唱コンクールの金賞発表、スライドショー上映など、感動で幕を閉じる閉祭式です。</p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER - only visible on standard scrollable pages, hidden on full-screen map to maximize canvas space */}
      {activeTab !== 'home' && (
        <footer className="bg-neutral-900 text-neutral-400 text-xs py-10 sm:py-14 mt-auto border-t border-neutral-800 border-dashed">
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
                    className="hover:text-neutral-100 text-neutral-400 transition-colors duration-150 flex items-center gap-1 text-[11px] font-bold self-start md:self-auto"
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
        />
      )}

      {/* 3. Secret Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-8 rounded-[32px] border border-neutral-100 shadow-2xl relative animate-scale-up">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100 text-lg font-bold">
                🔑
              </div>
              <h3 className="text-lg font-black text-neutral-900">委員会管理者ログイン</h3>
              <p className="text-[11px] text-neutral-400 mt-1">
                デバッグ・企画確認などの管理権限を設定します。
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-grow mb-1.5">
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
                  className="flex-1 py-3 border border-neutral-100 hover:bg-neutral-50 rounded-xl text-neutral-400 hover:text-neutral-700 font-semibold text-xs tracking-wider transition-all duration-150"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs tracking-wider shadow-lg shadow-indigo-600/10 transition-all duration-150"
                >
                  認証する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
