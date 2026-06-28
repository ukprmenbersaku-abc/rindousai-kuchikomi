/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, MapPin, Sparkles, ChevronRight, ChevronLeft, 
  Trash2, Star, Plus, CheckSquare, HelpCircle, Search, Send, Wrench, Info 
} from 'lucide-react';
import { Spot, Category } from '../types';
import { api } from '../lib/api';

interface SpotSidebarProps {
  isMobile: boolean;
  isMobileDrawerExpanded: boolean;
  setIsMobileDrawerExpanded: (val: boolean) => void;
  selectedSpot: Spot | null;
  setSelectedSpot: (spot: Spot | null) => void;
  spots: Spot[];
  setSpots: React.Dispatch<React.SetStateAction<Spot[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  isAdmin: boolean;
  triggerNotification: (msg: string) => void;
  loadSpots: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  setActiveTab: (tab: string) => void;
  getCategoryColor: (categoryId: string) => { label: string; textBg: string; bg: string };
  searchedSpots: Spot[];
  averageRating: string;
  spotReviews: any[];
  isLoadingReviews: boolean;
  handleAddReview: (e: React.FormEvent) => void;
  newRating: number;
  setNewRating: (rating: number) => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  newAuthor: string;
  setNewAuthor: (author: string) => void;
  newRole: '1年生' | '2年生' | '3年生' | '教職員' | '保護者' | 'OB・OG' | '地域住民' | 'その他';
  setNewRole: (role: '1年生' | '2年生' | '3年生' | '教職員' | '保護者' | 'OB・OG' | '地域住民' | 'その他') => void;
  isSubmittingReview: boolean;
  handleDeleteSpot: (id: number) => Promise<void>;
  setAddingCoord: (coord: { x: number; y: number } | null) => void;
  drawerHeight: number;
  setDrawerHeight: (height: number) => void;
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
}

export default function SpotSidebar({
  isMobile,
  isMobileDrawerExpanded,
  setIsMobileDrawerExpanded,
  selectedSpot,
  setSelectedSpot,
  spots,
  setSpots,
  categories,
  setCategories,
  isAdmin,
  triggerNotification,
  loadSpots,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  setActiveTab,
  getCategoryColor,
  searchedSpots,
  averageRating,
  spotReviews,
  isLoadingReviews,
  handleAddReview,
  newRating,
  setNewRating,
  newComment,
  setNewComment,
  newAuthor,
  setNewAuthor,
  newRole,
  setNewRole,
  isSubmittingReview,
  handleDeleteSpot,
  setAddingCoord,
  drawerHeight,
  setDrawerHeight,
  isDragging,
  setIsDragging,
}: SpotSidebarProps) {
  const [showD1Help, setShowD1Help] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('indigo');

  // Draggable height states
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const dragDistance = useRef(0);

  // Synchronize drawer height with outside toggle changes or selected spot updates
  useEffect(() => {
    if (isMobile) {
      if (isMobileDrawerExpanded) {
        const collapsedH = selectedSpot ? 110 : 64;
        if (drawerHeight <= collapsedH) {
          setDrawerHeight(window.innerHeight * 0.48); // Automatic center height (about 50vh)
        }
      } else {
        setDrawerHeight(selectedSpot ? 110 : 64);
      }
    }
  }, [isMobileDrawerExpanded, selectedSpot, isMobile]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = drawerHeight;
    dragDistance.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaY = dragStartY.current - e.clientY;
    dragDistance.current += Math.abs(e.clientY - dragStartY.current);
    
    const collapsedH = selectedSpot ? 110 : 64;
    const maxH = window.innerHeight * 0.85;
    const newHeight = Math.max(
      collapsedH,
      Math.min(maxH, dragStartHeight.current + deltaY)
    );
    setDrawerHeight(newHeight);
    dragStartY.current = e.clientY; // update current y continuously to align with mouse delta
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const collapsedH = selectedSpot ? 110 : 64;
    const centerH = window.innerHeight * 0.48;
    const maxH = window.innerHeight * 0.85;

    // If it was a short tap instead of a real drag
    if (dragDistance.current < 6) {
      if (isMobileDrawerExpanded) {
        setDrawerHeight(collapsedH);
        setIsMobileDrawerExpanded(false);
      } else {
        setDrawerHeight(centerH);
        setIsMobileDrawerExpanded(true);
      }
      return;
    }

    // Snapping thresholds
    if (drawerHeight < collapsedH + 50) {
      setDrawerHeight(collapsedH);
      setIsMobileDrawerExpanded(false);
    } else if (drawerHeight > centerH + (maxH - centerH) / 2) {
      setDrawerHeight(maxH);
      setIsMobileDrawerExpanded(true);
    } else {
      setDrawerHeight(centerH);
      setIsMobileDrawerExpanded(true);
    }
  };

  const handleDeleteSpotFromSidebar = async (id: number) => {
    if (confirm('この口コミスポットと紐づくすべての口コミを本当に削除しますか？')) {
      await handleDeleteSpot(id);
    }
  };

  return (
    <div 
      style={isMobile ? {
        height: `${drawerHeight}px`,
        maxHeight: '85vh',
        transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      } : undefined}
      className={`
        ${isMobile 
          ? 'absolute bottom-0 left-0 right-0 w-full bg-white z-30 flex flex-col shrink-0 overflow-hidden rounded-t-[24px] shadow-[0_-10px_35px_rgba(0,0,0,0.15)] border-t border-neutral-100' 
          : 'w-[350px] xl:w-[380px] h-full bg-white border-r border-neutral-100 flex flex-col shrink-0 overflow-hidden relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]'
        }
      `}
    >
      {/* Grabber indicator at the top for Mobile swipe drawer style */}
      {isMobile && (
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full pt-3 flex flex-col items-center justify-center cursor-ns-resize select-none pb-2 bg-neutral-50 border-b border-neutral-100 shrink-0 touch-none active:bg-neutral-100/50 transition-colors"
        >
          <div className="w-14 h-1.5 bg-neutral-300 rounded-full" />
        </div>
      )}

      {/* MOBILE COLLAPSED ALTERNATIVES */}
      {isMobile && !isMobileDrawerExpanded ? (
        /* Collapsed Mobile Mini View */
        !selectedSpot ? (
          /* No spot selected collapsed content */
          <div 
            onClick={() => {
              setIsMobileDrawerExpanded(true);
              setDrawerHeight(window.innerHeight * 0.48);
            }}
            className="flex-grow flex items-center justify-between px-5 font-bold cursor-pointer h-full bg-white text-left py-2"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-indigo-500 animate-spin-slow shrink-0" />
              <span className="text-sm font-black text-neutral-800">
                企画・模擬店スポット一覧をみる ({spots.length}選)
              </span>
            </div>
            <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg font-black shrink-0">
              展開する
            </span>
          </div>
        ) : (
          /* Selected Spot summary collapsed content */
          <div 
            onClick={() => setIsMobileDrawerExpanded(true)}
            className="flex-grow flex items-center justify-between px-5 h-full text-left bg-white py-2"
          >
            <div className="flex flex-col min-w-0 pr-3 justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded border whitespace-nowrap ${getCategoryColor(selectedSpot.category).textBg}`}>
                  {getCategoryColor(selectedSpot.category).label}
                </span>
                <h3 className="text-sm font-black text-neutral-800 truncate max-w-[140px] xs:max-w-none">
                  {selectedSpot.name}
                </h3>
              </div>
              <div className="flex items-center gap-2.5 mt-1.5 text-xs font-bold text-neutral-500">
                <span className="flex items-center text-amber-500 gap-0.5 font-extrabold">
                  ★ <span className="text-neutral-800 font-black">{averageRating}</span>
                </span>
                <span>•</span>
                <span>口コミ {spotReviews.length}件</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSpot(null);
                }}
                className="px-3 py-1.5 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-xl text-xs font-black border border-neutral-200/60 transition-all cursor-pointer"
              >
                戻る
              </button>
              <span className="text-xs text-white bg-indigo-600 px-3 py-1.5 rounded-xl font-black animate-pulse select-none">
                もっと見る 👋
              </span>
            </div>
          </div>
        )
      ) : (
        /* FULL EXPANDED SIDEBAR CONTENT (Both Desktop, and Mobile Expanded) */
        <>
          {/* Sidebar Header Title Area */}
          <div className="p-5 border-b border-neutral-100 bg-neutral-50/60 school-grid relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-100/30 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-violet-700 bg-violet-100/65 border border-violet-200/50 px-3 py-1 rounded-full select-none tracking-wider">
                  校内デジタルマップ
                </span>
                {isAdmin && (
                  <span className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-1 rounded-md select-none">
                    管理者特権
                  </span>
                )}
              </div>
              <span className="text-xs font-extrabold text-neutral-400 font-mono">
                SPOTS: {spots.length}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-800 mt-3 tracking-tight font-display flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-violet-600" />
              <span>りんどう祭 会場ナビボード</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-normal font-sans">
              筑摩野中の各展示・ステージ・模擬店での感動やおすすめ口コミ、お役立ち情報をリアルタイム共有！
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
                      <Wrench className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span className="text-xs font-black tracking-tight text-slate-100">
                        管理者コンソール
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
                            ローカル(LocalStorage)で動作中
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-400">
                            Realtime D1 データベース接続中
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
                    マップ上のすべての企画イベントや口コミ投稿データを一括管理します。「データをすべて消去」を選択すると、初期化できます。
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Reset/Clear button */}
                    <button
                      onClick={async () => {
                        if (window.confirm('登録されているすべてのイベントスポットと一連の口コミをデータベースから完全に消去して初期化します。本当によろしいですか？')) {
                          try {
                            triggerNotification('データベースを完全初期化中...');
                            const success = await api.resetDatabase();
                            if (success) {
                              await loadSpots();
                              setSelectedSpot(null);
                              triggerNotification('データベースを完全に初期化し、まっさらな状態になりました。');
                            } else {
                              triggerNotification('初期化中にエラーが発生しました');
                            }
                          } catch (err) {
                            console.error(err);
                            triggerNotification('接続エラーが発生しました');
                          }
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm shrink-0 whitespace-nowrap select-none border border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>データをすべて消去</span>
                    </button>

                    {/* Add Spot button */}
                    <button
                      onClick={() => {
                        setAddingCoord({ x: 50.0, y: 50.0 });
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[10px] font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shrink-0 whitespace-nowrap select-none border border-indigo-500/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新規イベント追加</span>
                    </button>
                  </div>

                  {/* Link to table management view */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('admin_table');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[10px] font-extrabold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all shadow-md mb-3"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>表形式の一括管理画面を開く</span>
                  </button>

                  {/* Dynamic Category Management Section */}
                  <div className="border-t border-slate-800/80 pt-3 mt-3 mb-2 pb-3">
                    <span className="text-[10px] font-black text-indigo-400 block mb-2 tracking-wide font-sans">
                      カテゴリーの追加・管理
                    </span>
                    
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mb-2">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="カテゴリー名..."
                          value={newCategoryLabel}
                          onChange={(e) => setNewCategoryLabel(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        
                        <select
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-1 py-1 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="indigo">藍色</option>
                          <option value="emerald">緑色</option>
                          <option value="amber">琥珀色</option>
                          <option value="rose">薔薇色</option>
                          <option value="violet">紫色</option>
                          <option value="teal">鴨羽色</option>
                          <option value="orange">橙色</option>
                          <option value="fuchsia">紅紫色</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!newCategoryLabel.trim()) return;
                          
                          const cleanId = 'cat_' + Math.random().toString(36).substr(2, 9);
                          const newCat: Category = {
                            id: cleanId,
                            label: newCategoryLabel.trim(),
                            color: newCategoryColor,
                          };
                          
                          try {
                            triggerNotification('カテゴリーを登録中...');
                            const saved = await api.saveCategory(newCat);
                            setCategories(prev => [...prev, saved]);
                            setNewCategoryLabel('');
                            triggerNotification(`新しいカテゴリー「${saved.label}」を作成しました`);
                          } catch (err) {
                            console.error(err);
                            triggerNotification('カテゴリー作成に失敗しました');
                          }
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors rounded-lg py-1 px-2.5 font-sans"
                      >
                        作成・追加
                      </button>
                    </div>

                    {/* Render list of existing dynamic categories */}
                    {categories.length > 0 && (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {categories.map((c) => (
                          <div key={c.id} className="flex items-center justify-between bg-slate-950/60 hover:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/40">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                c.color === 'indigo' ? 'bg-indigo-500' :
                                c.color === 'emerald' ? 'bg-emerald-500' :
                                c.color === 'amber' ? 'bg-amber-500' :
                                c.color === 'violet' ? 'bg-violet-500' :
                                c.color === 'teal' ? 'bg-teal-500' :
                                c.color === 'orange' ? 'bg-orange-500' :
                                c.color === 'fuchsia' ? 'bg-fuchsia-500' :
                                'bg-rose-500'
                              }`} />
                              <span className="text-xs font-bold text-slate-200">{c.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`カテゴリー「${c.label}」を本当に削除しますか？ (属するスポットは「特別催し・その他」に変更されます)`)) {
                                  try {
                                    triggerNotification('カテゴリーを削除中...');
                                    const success = await api.deleteCategory(c.id);
                                    if (success) {
                                      setCategories(prev => prev.filter(item => item.id !== c.id));
                                      triggerNotification(`カテゴリー「${c.label}」を削除しました`);
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    triggerNotification('カテゴリー削除に失敗しました');
                                  }
                                }
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick D1 setup dropdown help */}
                  <div className="border-t border-slate-800/80 pt-2.5">
                    <button
                      onClick={() => setShowD1Help(!showD1Help)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        ❓ D1連携について
                      </span>
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {showD1Help ? '閉じる' : '展開'}
                      </span>
                    </button>

                    {showD1Help && (
                      <div className="mt-2 p-2.5 bg-slate-950 rounded-xl text-[11px] text-slate-300 space-y-2 border border-slate-800/60 leading-normal animate-slide-up">
                        <p className="font-bold text-indigo-400">Cloudflare Pages & D1 連携</p>
                        <ol className="list-decimal pl-3 space-y-1.5 text-slate-400">
                          <li>Cloudflare 「D1/SQL」 でデータベースを作成</li>
                          <li><code className="text-indigo-300">functions/schema.sql</code> をインポート</li>
                          <li>Pages「Settings &gt; Functions」で <code className="text-slate-200 bg-slate-800 px-1 rounded">DB</code> という名前でバインド</li>
                          <li>再デプロイでD1連携がアクティブになります。</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Bar matching Google Maps search utility */}
              <div className="relative px-5 py-3 border-b border-neutral-100 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="展示企画・模擬店、教室などを検索..."
                    className="w-full pl-9 pr-9 py-2.5 text-sm sm:text-xs rounded-2xl border border-neutral-205/60 bg-neutral-50/65 focus:outline-none focus:ring-4 focus:ring-violet-500/15 focus:border-violet-400 focus:bg-white transition-all duration-300 placeholder-neutral-400 font-bold text-neutral-800"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 bg-neutral-200/50 hover:bg-neutral-200 w-5 h-5 flex items-center justify-center rounded-full transition-colors text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Horizontal Quick Filter Tags */}
              <div className="px-5 py-3.5 bg-white border-b border-neutral-100/80">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-extrabold block mb-2.5 font-display">
                  カテゴリーで絞り込む
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3.5 py-2 text-xs font-black rounded-full border transition-all duration-300 cursor-pointer ${
                      selectedCategory === null 
                        ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-600/10' 
                        : 'bg-neutral-100 border-neutral-200/60 text-neutral-600 hover:bg-neutral-200/60'
                    }`}
                  >
                    すべて
                  </button>
                  
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    
                    let colorClasses = 'bg-rose-50 border-rose-100/80 text-rose-700 hover:bg-rose-100/50';
                    switch (cat.color) {
                      case 'indigo': colorClasses = 'bg-indigo-50 border-indigo-100/80 text-indigo-700 hover:bg-indigo-100/50'; break;
                      case 'emerald': colorClasses = 'bg-emerald-50 border-emerald-100/80 text-emerald-700 hover:bg-emerald-100/50'; break;
                      case 'amber': colorClasses = 'bg-amber-50 border-amber-100/80 text-amber-700 hover:bg-amber-100/50'; break;
                      case 'violet': colorClasses = 'bg-violet-50 border-violet-100/80 text-violet-700 hover:bg-violet-100/50'; break;
                      case 'teal': colorClasses = 'bg-teal-50 border-teal-100/80 text-teal-700 hover:bg-teal-100/50'; break;
                      case 'orange': colorClasses = 'bg-orange-50 border-orange-100/80 text-orange-700 hover:bg-orange-100/50'; break;
                      case 'fuchsia': colorClasses = 'bg-fuchsia-50 border-fuchsia-100/80 text-fuchsia-700 hover:bg-fuchsia-100/50'; break;
                      case 'rose': default: colorClasses = 'bg-rose-50 border-rose-100/80 text-rose-700 hover:bg-rose-100/50'; break;
                    }
                    
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-2 text-xs font-black rounded-full border transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-600/10' 
                            : `${colorClasses}`
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable list of registered spots */}
              <div className="flex-grow overflow-y-auto p-5 space-y-3.5 bg-neutral-50/40 text-left school-grid">
                {searchedSpots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-dashed border-neutral-200/80 mt-2 shadow-xs">
                    <MapPin className="w-10 h-10 text-neutral-300 mb-3" />
                    <p className="text-xs font-bold text-neutral-700">
                      {spots.length === 0 ? 'スポットが未登録です' : 'スポットが見つかりません'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
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
                        className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-[0_4px_16px_rgba(0,0,0,0.015)] hover:border-violet-200 hover:shadow-[0_12px_24px_rgba(109,40,217,0.04)] hover:-translate-y-0.5 transition-all duration-320 cursor-pointer flex flex-col gap-1.5 relative overflow-hidden group"
                      >
                        {/* Soft visual left accent border on hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${styleSet.textBg} tracking-wide`}>
                              {styleSet.label}
                            </span>
                            <span className="text-[10px] bg-neutral-100 text-neutral-600 font-extrabold px-2 py-0.5 rounded-full border border-neutral-200/50">
                              {spot.floor || '屋外'}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            COORD: {spot.x.toFixed(0)}, {spot.y.toFixed(0)}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-neutral-800 tracking-tight leading-snug group-hover:text-violet-700 transition-colors">
                          {spot.name}
                        </h3>
                        {spot.description && (
                          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium line-clamp-2 leading-relaxed font-sans">
                            {spot.description}
                          </p>
                        )}
                        {spot.tags && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {spot.tags.split(/[,，、\s]+/).filter(Boolean).map((t, idx) => (
                              <span key={idx} className="inline-flex items-center text-[10px] bg-neutral-50 border border-neutral-200/40 text-neutral-500 px-2 py-0.5 rounded-lg font-bold transition-all group-hover:border-violet-100 group-hover:bg-violet-50/30 group-hover:text-violet-600">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-neutral-100/60 text-xs font-black text-neutral-500 transition-colors group-hover:text-violet-600">
                          <span className="flex items-center gap-1">
                            <Compass className="w-4 h-4 text-violet-500 animate-spin-slow" />
                            <span>詳細レビューを見る・書く</span>
                          </span>
                          <ChevronRight className="w-4.5 h-4.5 text-neutral-300 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })
                )}

                {isAdmin && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-bold text-amber-800 mt-2 leading-relaxed flex gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-amber-900 block mb-0.5">企画管理者メンバーへ</span>
                      右側の「マップ画面」の任意の床面をタップすると、新しい企画スポット（口コミピン）をその場所へ一発配置できます。
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* SELECTED SPOT IN-DEPTH DETAIL SIDEBAR (Google Maps layout mode) */
            <div className="flex-grow flex flex-col overflow-hidden bg-white">
              
              {/* Title Header with clean back action bar */}
              <div className="p-5 border-b border-neutral-100 flex flex-col bg-neutral-50/20 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-violet-100/10 rounded-full blur-xl pointer-events-none" />
                <button 
                  onClick={() => setSelectedSpot(null)}
                  className="group flex items-center gap-1 text-xs text-neutral-500 hover:text-violet-600 font-bold mb-4 select-none self-start transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span>一覧・検索に戻る</span>
                </button>

                <div className="flex justify-between items-start gap-2.5 relative z-10">
                  <div>
                    <div className="flex flex-wrap gap-1.5 items-center mb-2">
                      <span className={`inline-block text-xs font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryColor(selectedSpot.category).textBg}`}>
                        {getCategoryColor(selectedSpot.category).label}
                      </span>
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/50">
                        {selectedSpot.floor || '屋外'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight leading-snug">
                      {selectedSpot.name}
                    </h3>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteSpotFromSidebar(selectedSpot.id)}
                      className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 animate-fade-in"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>削除</span>
                    </button>
                  )}
                </div>

                {selectedSpot.description && (
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-3 bg-white p-3.5 border border-dashed border-neutral-200/50 rounded-2xl shadow-inner font-sans">
                    {selectedSpot.description}
                  </p>
                )}

                {selectedSpot.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {selectedSpot.tags.split(/[,，、\s]+/).filter(Boolean).map((t, idx) => (
                      <span key={idx} className="inline-flex items-center text-[10px] sm:text-xs bg-neutral-100/80 border border-neutral-200 text-neutral-600 px-2.5 py-1 rounded-lg font-bold">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats Summary row */}
                <div className="flex items-center gap-2.5 mt-4 text-xs sm:text-sm font-bold text-neutral-500">
                  <span className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span className="text-neutral-900 font-black pb-[1px]">{averageRating}</span>
                  </span>
                  <span>•</span>
                  <span className="bg-neutral-100/90 px-2.5 py-1 rounded-lg text-neutral-600">
                    口コミ投稿: <span className="font-extrabold text-neutral-900">{spotReviews.length}</span> 件
                  </span>
                </div>
              </div>

              {/* Reviews lists inside the Sidebar */}
              <div className="flex-grow overflow-y-auto p-5 space-y-3.5 bg-neutral-50/40 text-left school-grid">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-extrabold block mb-2 font-display">
                  寄せられた口コミ一覧
                </span>

                {isLoadingReviews ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2.5">
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-neutral-400 font-mono">読込中...</span>
                  </div>
                ) : spotReviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center bg-white p-5 rounded-3xl border border-dashed border-neutral-200/80 shadow-xs">
                    <Sparkles className="w-7 h-7 text-violet-400 mb-2 animate-pulse" />
                    <p className="text-sm font-black text-neutral-800">まだ口コミがありません</p>
                    <p className="text-xs text-neutral-500 max-w-xs mt-1.5 leading-relaxed">
                      この場所に興味があるみんなに、最初の口コミや応援メッセージを教えてください！
                    </p>
                  </div>
                ) : (
                  spotReviews.map((review) => (
                    <div key={review.id} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-xs hover:border-neutral-200/65 leading-relaxed flex flex-col gap-1.5 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-sans">
                          <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded">
                            {review.role}
                          </span>
                          <span className="text-xs font-black text-neutral-800">
                            {review.author || '匿名希望'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= review.rating 
                                  ? 'text-amber-400 fill-amber-400' 
                                  : 'text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-neutral-700 font-medium text-xs sm:text-sm">
                        {review.comment}
                      </p>

                      {review.createdAt && (
                        <div className="text-right text-[10px] text-neutral-400 font-mono">
                          {new Date(review.createdAt).toLocaleDateString()} {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Submission Form integrated into bottom of Detail Sidebar with premium spacing */}
              <div className="border-t border-neutral-200 p-5 bg-white text-left shrink-0 shadow-[0_-8px_40px_rgba(0,0,0,0.025)]">
                <h4 className="text-xs sm:text-sm font-black text-neutral-800 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                  <span>新しい口コミを投稿する</span>
                </h4>

                <form onSubmit={handleAddReview} className="space-y-4">
                  <div className="space-y-4">
                    {/* Rating stars select and identity picker row */}
                    <div className="grid grid-cols-1 gap-1">
                      
                      {/* Rating stars select */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 tracking-wider mb-1.5">
                          星の評価 (タップして選択) <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-2.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="focus:outline-none hover:scale-115 active:scale-95 transition-transform duration-100 cursor-pointer"
                            >
                              <Star
                                className={`w-6 h-6 transition-colors duration-100 ${
                                  star <= newRating 
                                    ? 'text-amber-400 fill-amber-400' 
                                    : 'text-neutral-200 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dropdown elements */}
                      <div className="grid grid-cols-2 gap-2.5 mt-2">
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 tracking-wider mb-1.5">
                            区分 <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={newRole}
                            onChange={(e: any) => setNewRole(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border border-neutral-200 focus:outline-none bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all cursor-pointer text-neutral-800"
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
                          <label className="block text-xs font-bold text-neutral-500 tracking-wider mb-1.5">
                            ペンネーム
                          </label>
                          <input
                            type="text"
                            value={newAuthor}
                            onChange={(e) => setNewAuthor(e.target.value)}
                            placeholder="匿名希望"
                            maxLength={12}
                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-205/85 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all placeholder-neutral-300 font-sans text-neutral-800 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Text Input */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-505 tracking-wider mb-1.5">
                        口コミ・感想内容 <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="過ごした感想やおいしかった点、応援メッセージなどをお寄せください！"
                        rows={3}
                        maxLength={300}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 placeholder-neutral-300 resize-none leading-normal transition-all font-sans text-neutral-800 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newComment.trim()}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-violet-600 hover:bg-violet-755 text-white disabled:opacity-40 shadow-sm transition-all shadow-violet-600/10 active:scale-98 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>口コミを送信する</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
