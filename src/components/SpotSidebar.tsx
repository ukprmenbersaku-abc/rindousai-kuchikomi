/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
}: SpotSidebarProps) {
  const [showD1Help, setShowD1Help] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('indigo');

  const handleDeleteSpotFromSidebar = async (id: number) => {
    if (confirm('この口コミスポットと紐づくすべての口コミを本当に削除しますか？')) {
      await handleDeleteSpot(id);
    }
  };

  return (
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
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        
                        <select
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-1 py-1 text-[10px] text-slate-300 focus:outline-none"
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] transition-colors rounded-lg py-1 px-2.5 font-sans"
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
                              <span className="text-[10px] font-bold text-slate-200">{c.label}</span>
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
                      className="w-full flex items-center justify-between text-[10px] font-extrabold text-slate-300 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        ❓ D1連携について
                      </span>
                      <span className="text-[8px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {showD1Help ? '閉じる' : '展開'}
                      </span>
                    </button>

                    {showD1Help && (
                      <div className="mt-2 p-2.5 bg-slate-950 rounded-xl text-[9px] text-slate-300 space-y-2 border border-slate-800/60 leading-normal animate-slide-up">
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
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
                      selectedCategory === null 
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' 
                        : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:opacity-80'
                    }`}
                  >
                    すべて
                  </button>
                  
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    
                    let colorClasses = 'bg-rose-50 border-rose-100 text-rose-700';
                    switch (cat.color) {
                      case 'indigo': colorClasses = 'bg-indigo-50 border-indigo-100 text-indigo-700'; break;
                      case 'emerald': colorClasses = 'bg-emerald-50 border-emerald-100 text-emerald-700'; break;
                      case 'amber': colorClasses = 'bg-amber-50 border-amber-100 text-amber-700'; break;
                      case 'violet': colorClasses = 'bg-violet-50 border-violet-100 text-violet-700'; break;
                      case 'teal': colorClasses = 'bg-teal-50 border-teal-100 text-teal-700'; break;
                      case 'orange': colorClasses = 'bg-orange-50 border-orange-100 text-orange-700'; break;
                      case 'fuchsia': colorClasses = 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700'; break;
                      case 'rose': default: colorClasses = 'bg-rose-50 border-rose-100 text-rose-700'; break;
                    }
                    
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
                          isSelected 
                            ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' 
                            : `${colorClasses} hover:opacity-80`
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable list of registered spots */}
              <div className="flex-grow overflow-y-auto p-4 space-y-2.5 bg-neutral-50/30 text-left">
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
                        className="bg-white p-3.5 rounded-2xl border border-neutral-100 hover:border-indigo-200 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${styleSet.textBg}`}>
                            {styleSet.label}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            位置: {spot.x.toFixed(1)}%, {spot.y.toFixed(1)}%
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
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-800 mt-2 leading-relaxed flex gap-2">
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
              <div className="p-4 border-b border-neutral-100 flex flex-col bg-neutral-50/20 text-left">
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
                      className="flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 animate-fade-in"
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
              <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-neutral-50/50 text-left">
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
                    <div key={review.id} className="bg-white p-3.5 rounded-xl border border-neutral-200/40 shadow-sm leading-relaxed flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                            {review.role}
                          </span>
                          <span className="text-[11px] font-bold text-neutral-700 font-sans">
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
                      
                      <p className="text-neutral-600 font-medium text-[11.5px] sm:text-xs">
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
  );
}
