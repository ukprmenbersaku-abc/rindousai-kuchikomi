/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MapPin, CheckSquare, Plus, Trash2, Calendar, Users, Clock, Tag } from 'lucide-react';
import { Spot, Category, TimetableEvent, CommitteeMember } from '../types';
import { api } from '../lib/api';

interface AdminTableTabProps {
  spots: Spot[];
  setSpots: React.Dispatch<React.SetStateAction<Spot[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  triggerNotification: (message: string) => void;
  setSelectedSpot: (spot: Spot | null) => void;
}

export default function AdminTableTab({
  spots,
  setSpots,
  categories,
  setCategories,
  triggerNotification,
  setSelectedSpot,
}: AdminTableTabProps) {
  // Navigation / Switch inside admin tab
  const [adminSection, setAdminSection] = useState<'spots' | 'timetable' | 'members'>('spots');

  // Localized form states for adding spots
  const [tableSpotName, setTableSpotName] = useState('');
  const [tableSpotDesc, setTableSpotDesc] = useState('');
  const [tableSpotCat, setTableSpotCat] = useState('stage');
  const [tableSpotX, setTableSpotX] = useState<number>(50);
  const [tableSpotY, setTableSpotY] = useState<number>(50);

  // Localized form states for adding categories
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('indigo');

  // Timetable and members data hooks
  const [timetable, setTimetable] = useState<TimetableEvent[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Form states for adding Timetable events
  const [timetableDay, setTimetableDay] = useState<number>(1);
  const [timetableTime, setTimetableTime] = useState('');
  const [timetableTitle, setTimetableTitle] = useState('');
  const [timetableLocation, setTimetableLocation] = useState('');
  const [timetableDescription, setTimetableDescription] = useState('');
  const [timetableBadge, setTimetableBadge] = useState('');
  const [timetableBadgeColor, setTimetableBadgeColor] = useState('indigo');

  // Form states for adding Members/Committees
  const [memberTitle, setMemberTitle] = useState('');
  const [memberSubtitle, setMemberSubtitle] = useState('');
  const [memberAvatarChar, setMemberAvatarChar] = useState('');
  const [memberColorTheme, setMemberColorTheme] = useState('indigo');
  const [memberDescription, setMemberDescription] = useState('');

  // Fetch all timetable and members
  useEffect(() => {
    async function loadData() {
      try {
        const tData = await api.getTimetable();
        setTimetable(tData);
      } catch (err) {
        console.error('Error fetching timetable in admin:', err);
      } finally {
        setLoadingTimetable(false);
      }
      try {
        const mData = await api.getMembers();
        setMembers(mData);
      } catch (err) {
        console.error('Error fetching members in admin:', err);
      } finally {
        setLoadingMembers(false);
      }
    }
    loadData();
  }, []);

  // Timetable Handlers
  const handleAddTimetable = async () => {
    if (!timetableTime.trim() || !timetableTitle.trim() || !timetableLocation.trim()) {
      triggerNotification('進行時間・催しタイトル・開催場所をすべて指定してください');
      return;
    }
    try {
      triggerNotification('進行プログラムを登録中...');
      let badgeColorClass = 'bg-indigo-50 border-indigo-150 text-indigo-750';
      if (timetableBadgeColor === 'emerald') badgeColorClass = 'bg-emerald-50 border-emerald-150 text-emerald-750';
      if (timetableBadgeColor === 'amber') badgeColorClass = 'bg-amber-50 border-amber-150 text-amber-750';
      if (timetableBadgeColor === 'rose') badgeColorClass = 'bg-rose-50 border-rose-150 text-rose-750';
      if (timetableBadgeColor === 'neutral') badgeColorClass = 'bg-neutral-50 border-neutral-200 text-neutral-700';

      const eventData = {
        day: Number(timetableDay),
        time: timetableTime.trim(),
        title: timetableTitle.trim(),
        location: timetableLocation.trim(),
        description: timetableDescription.trim(),
        badge: timetableBadge.trim(),
        badgeColor: badgeColorClass,
      };

      const saved = await api.saveTimetable(eventData);
      setTimetable(prev => [...prev, saved]);
      setTimetableTime('');
      setTimetableTitle('');
      setTimetableLocation('');
      setTimetableDescription('');
      setTimetableBadge('');
      triggerNotification(`進行「${saved.title}」を正常に登録しました。`);
    } catch (err) {
      console.error(err);
      triggerNotification('プログラムの登録に失敗しました');
    }
  };

  const handleDeleteTimetable = async (id: number, title: string) => {
    if (confirm(`プログラム「${title}」を完全消去しますか？`)) {
      try {
        triggerNotification('プログラムを消去中...');
        const success = await api.deleteTimetable(id);
        if (success) {
          setTimetable(prev => prev.filter(t => t.id !== id));
          triggerNotification(`プログラム「${title}」を削除しました。`);
        }
      } catch (err) {
        console.error(err);
        triggerNotification('削除に失敗しました');
      }
    }
  };

  // Member Handlers
  const handleAddMember = async () => {
    if (!memberTitle.trim() || !memberSubtitle.trim() || !memberAvatarChar.trim() || !memberDescription.trim()) {
      triggerNotification('主要項目をすべて入力してください');
      return;
    }
    try {
      triggerNotification('特別企画コラムを登録中...');
      const memberData = {
        title: memberTitle.trim(),
        subtitle: memberSubtitle.trim(),
        avatarChar: memberAvatarChar.trim().substr(0, 2),
        colorTheme: memberColorTheme,
        description: memberDescription.trim(),
      };

      const saved = await api.saveMember(memberData);
      setMembers(prev => [...prev, saved]);
      setMemberTitle('');
      setMemberSubtitle('');
      setMemberAvatarChar('');
      setMemberDescription('');
      triggerNotification(`特別企画「${saved.title}」を正常に登録しました。`);
    } catch (err) {
      console.error(err);
      triggerNotification('特別企画コラムの登録に失敗しました');
    }
  };

  const handleDeleteMember = async (id: number, title: string) => {
    if (confirm(`特別企画「${title}」をリストから削除しますか？`)) {
      try {
        triggerNotification('特別企画を削除中...');
        const success = await api.deleteMember(id);
        if (success) {
          setMembers(prev => prev.filter(m => m.id !== id));
          triggerNotification(`特別企画「${title}」を削除しました。`);
        }
      } catch (err) {
        console.error(err);
        triggerNotification('削除に失敗しました');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
            データベース管理 (表形式)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-3 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            企画・催し・タイムライン統合管理
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            管理者コンソールから、イベントスポット、進行タイムテーブル、主要特別企画カードを完全に手動登録・削除でき、D1に自動共有されます。
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 text-white rounded-2xl p-3 border border-slate-800 shrink-0">
          <div className="text-xs">
            <span className="font-bold text-slate-400 block text-[9px] uppercase">Connection Status</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cloud Sync Active (D1 / Local)
            </span>
          </div>
        </div>
      </div>

      {/* Internal Nav Tabs */}
      <div className="flex border-b border-neutral-200/60 mb-8 gap-4 font-sans">
        <button
          onClick={() => setAdminSection('spots')}
          className={`pb-3 text-xs sm:text-sm font-black transition-all relative flex items-center gap-1.5 ${
            adminSection === 'spots' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>📍 スポット＆カテゴリー</span>
        </button>
        <button
          onClick={() => setAdminSection('timetable')}
          className={`pb-3 text-xs sm:text-sm font-black transition-all relative flex items-center gap-1.5 ${
            adminSection === 'timetable' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 進行タイムテーブル</span>
        </button>
        <button
          onClick={() => setAdminSection('members')}
          className={`pb-3 text-xs sm:text-sm font-black transition-all relative flex items-center gap-1.5 ${
            adminSection === 'members' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 特別企画・委員会紹介</span>
        </button>
      </div>

      {/* SECTION 1: SPOTS MANAGEMENT */}
      {adminSection === 'spots' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Form 1: Add new Spot directly via Table */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-xs col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-black text-neutral-800">新規スポットを登録する</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                      企画・スポット名 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="例: 第1体育館 (メインステージ)"
                      value={tableSpotName}
                      onChange={(e) => setTableSpotName(e.target.value)}
                      className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                      カテゴリー <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={tableSpotCat}
                      onChange={(e) => setTableSpotCat(e.target.value)}
                      className="w-full bg-neutral-50 hover:bg-neutral-100/55 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 transition-all outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                      地図上の X 座標 (%) <span className="text-[10px] text-neutral-400">(0～100 / 0.01%単位で指定可能)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={tableSpotX}
                      onChange={(e) => setTableSpotX(parseFloat(e.target.value) || 0)}
                      className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 transition-all outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                      地図上の Y 座標 (%) <span className="text-[10px] text-neutral-400">(0～100 / 0.01%単位で指定可能)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={tableSpotY}
                      onChange={(e) => setTableSpotY(parseFloat(e.target.value) || 0)}
                      className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 transition-all outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    企画の紹介・説明文
                  </label>
                  <textarea
                    placeholder="企画の内容やスケジュール、PR文を入力..."
                    value={tableSpotDesc}
                    onChange={(e) => setTableSpotDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!tableSpotName.trim()) {
                        triggerNotification('スポット名を入力してください');
                        return;
                      }
                      try {
                        triggerNotification('新しいスポットを登録中...');
                        const spotData = {
                          name: tableSpotName.trim(),
                          x: Math.max(0, Math.min(100, parseFloat(tableSpotX.toFixed(2)))),
                          y: Math.max(0, Math.min(100, parseFloat(tableSpotY.toFixed(2)))),
                          description: tableSpotDesc.trim(),
                          category: tableSpotCat,
                        };

                        const saved = await api.saveSpot(spotData);
                        if (saved) {
                          setSpots((prev) => [...prev, saved]);
                          setTableSpotName('');
                          setTableSpotDesc('');
                          triggerNotification(`スポット「${saved.name}」を表形式から正常に追加しました`);
                        }
                      } catch (err) {
                        console.error(err);
                        triggerNotification('スポットの追加に失敗しました');
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新規スポットを表に追加</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Form 2: Quick add category right here in Table Admin too */}
            <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl col-span-1 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-sm font-black tracking-tight">新たなカテゴリー登録</h3>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal mb-4">
                  教室企画や部活展、生徒向けオリジナル企画など、テーマ色の異なるカテゴリーを追加できます。
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      カテゴリーの表示名
                    </label>
                    <input
                      type="text"
                      placeholder="例: イラスト研究会"
                      value={newCategoryLabel}
                      onChange={(e) => setNewCategoryLabel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-550"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      テーマ色 (ピン・バッジの色)
                    </label>
                    <select
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="indigo">藍色 (Indigo)</option>
                      <option value="emerald">緑色 (Emerald)</option>
                      <option value="amber">琥珀色 (Amber)</option>
                      <option value="rose">薔薇色 (Rose)</option>
                      <option value="violet">紫色 (Violet)</option>
                      <option value="teal">鴨羽色 (Teal)</option>
                      <option value="orange">橙色 (Orange)</option>
                      <option value="fuchsia">紅紫色 (Fuchsia)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (!newCategoryLabel.trim()) return;
                  const cleanId = 'cat_' + Math.random().toString(36).substr(2, 9);
                  const newCat = {
                    id: cleanId,
                    label: newCategoryLabel.trim(),
                    color: newCategoryColor,
                  };
                  try {
                    triggerNotification('カテゴリーを登録中...');
                    const saved = await api.saveCategory(newCat);
                    setCategories(prev => [...prev, saved]);
                    setNewCategoryLabel('');
                    triggerNotification(`カテゴリー「${saved.label}」を作成しました`);
                  } catch (err) {
                    console.error(err);
                    triggerNotification('カテゴリー作成に失敗しました');
                  }
                }}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] transition-colors rounded-lg py-2.5 px-3"
              >
                新しいカテゴリーを作成・追加
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Table 1: Spots list */}
            <div className="bg-white rounded-3xl border border-neutral-200/60 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/40">
                <div>
                  <h3 className="text-sm font-black text-neutral-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span>登録済みスポット一覧 ({spots.length}個)</span>
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    マップ上に配置されているすべての企画スポット・教室情報です。
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                {spots.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-400">
                    登録されているスポットはありません。
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200/60 text-[10px] font-black text-neutral-500 uppercase tracking-wider font-sans">
                        <th className="py-3 px-4">スポット名 / 説明</th>
                        <th className="py-3 px-4">カテゴリー</th>
                        <th className="py-3 px-4">座標 (X, Y)</th>
                        <th className="py-3 px-4 w-24 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {spots.map((spot) => {
                        const cat = categories.find((c) => c.id === spot.category);
                        return (
                          <tr key={spot.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-sans text-left">
                              <div className="font-bold text-neutral-800">{spot.name}</div>
                              <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{spot.description}</div>
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-50 text-neutral-700`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-indigo-500`} />
                                {cat?.label || 'その他'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[10px] text-neutral-500 font-bold text-left">
                              {spot.x.toFixed(2)}% , {spot.y.toFixed(2)}%
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={async () => {
                                  if (confirm(`スポット「${spot.name}」を完全に削除しますか？`)) {
                                    try {
                                      triggerNotification('スポットを削除中...');
                                      const success = await api.deleteSpot(spot.id);
                                      if (success) {
                                        setSpots((prev) => prev.filter((s) => s.id !== spot.id));
                                        setSelectedSpot(null);
                                        triggerNotification(`スポット「${spot.name}」を削除しました`);
                                      }
                                    } catch (err) {
                                      console.error(err);
                                      triggerNotification('送信中にエラーが発生しました');
                                    }
                                  }
                                }}
                                className="p-1 px-2.5 rounded-lg border border-neutral-100 hover:border-rose-100 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors text-[10px] font-bold"
                              >
                                削除
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Table 2: Category list */}
            <div className="bg-white rounded-3xl border border-neutral-200/60 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/40">
                <div>
                  <h3 className="text-sm font-black text-neutral-800 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-500" />
                    <span>カテゴリー一覧 ({categories.length}個)</span>
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    システム上のカテゴリーを削除できます。
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200/60 text-[10px] font-black text-neutral-500 uppercase tracking-wider font-sans">
                      <th className="py-3 px-4">内部ID</th>
                      <th className="py-3 px-4">表示名</th>
                      <th className="py-3 px-4">カラー</th>
                      <th className="py-3 px-4 w-28 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-500 text-left">
                          {c.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-800 flex items-center gap-2 text-left">
                          <span className={`w-2 h-2 rounded-full ${
                            c.color === 'indigo' ? 'bg-indigo-500' :
                            c.color === 'emerald' ? 'bg-emerald-500' :
                            c.color === 'amber' ? 'bg-amber-500' :
                            c.color === 'violet' ? 'bg-violet-500' :
                            c.color === 'teal' ? 'bg-teal-500' :
                            c.color === 'orange' ? 'bg-orange-500' :
                            c.color === 'fuchsia' ? 'bg-fuchsia-500' :
                            'bg-rose-500'
                          }`} />
                          {c.label}
                        </td>
                        <td className="py-3.5 px-4 uppercase font-mono tracking-wider font-bold text-[10px] text-neutral-500 text-left">{c.color}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={async () => {
                              if (confirm(`カテゴリー「${c.label}」を完全に削除しますか？`)) {
                                try {
                                  triggerNotification('カテゴリーを削除中...');
                                  const success = await api.deleteCategory(c.id);
                                  if (success) {
                                    setCategories(prev => prev.filter(item => item.id !== c.id));
                                    triggerNotification('カテゴリーを消去しました');
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                            className="p-1 px-2.5 rounded-lg border border-neutral-100 hover:border-rose-100 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors text-[10px] font-bold"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TIMETABLE MANAGEMENT */}
      {adminSection === 'timetable' && (
        <div className="space-y-8">
          {/* Timetable Form */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-black text-neutral-800">進行プログラム・タイムテーブルの追加</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    開催日程 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={timetableDay}
                    onChange={(e) => setTimetableDay(Number(e.target.value))}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/55 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value={1}>1日目 (D1)</option>
                    <option value={2}>2日目 (D2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    時間帯 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例: 09:00 - 09:30"
                    value={timetableTime}
                    onChange={(e) => setTimetableTime(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    催し・プログラム名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例: 開祭式・オープニング"
                    value={timetableTitle}
                    onChange={(e) => setTimetableTitle(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    開催場所 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例: 第1体育館 (メインステージ)"
                    value={timetableLocation}
                    onChange={(e) => setTimetableLocation(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    バッジ表示 (例: 全体・クラスなど)
                  </label>
                  <input
                    type="text"
                    placeholder="例: 全体イベント"
                    value={timetableBadge}
                    onChange={(e) => setTimetableBadge(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    バッジの配色テーマ
                  </label>
                  <select
                    value={timetableBadgeColor}
                    onChange={(e) => setTimetableBadgeColor(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/55 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  >
                    <option value="indigo">藍色Preset (Indigo)</option>
                    <option value="emerald">緑色Preset (Emerald)</option>
                    <option value="amber">琥珀色Preset (Amber)</option>
                    <option value="rose">薔薇色Preset (Rose)</option>
                    <option value="neutral">グレーPreset (Neutral)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                  催しの内容説明・PR文
                </label>
                <textarea
                  placeholder="吹奏楽部の合同演奏や、各発表クラスの見どころなどの紹介文を詳細に入力します..."
                  value={timetableDescription}
                  onChange={(e) => setTimetableDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddTimetable}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>プログラムを登録してタイムラインに反映</span>
                </button>
              </div>
            </div>
          </div>

          {/* Registered timetable List Table */}
          <div className="bg-white rounded-3xl border border-neutral-200/60 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-neutral-100 bg-neutral-50/40">
              <h3 className="text-sm font-black text-neutral-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>登録済みタイムテーブル一覧 ({timetable.length}項目)</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              {loadingTimetable ? (
                <div className="py-12 text-center text-xs text-neutral-400 font-bold">
                  読み込み中...
                </div>
              ) : timetable.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 font-bold">
                  現在、タイムテーブルに登録されたイベントはありません。
                </div>
              ) : (
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200/60 text-[10px] font-black text-neutral-500 uppercase tracking-wider font-sans">
                      <th className="py-3 px-4">日程</th>
                      <th className="py-3 px-4">時間設定</th>
                      <th className="py-3 px-4">催し・プログラム名 / 紹介</th>
                      <th className="py-3 px-4">開催場所</th>
                      <th className="py-3 px-4">タグ / バッジ</th>
                      <th className="py-3 px-4 w-24 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {timetable.map((t) => (
                      <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-neutral-800">{Number(t.day)}日目</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-600">{t.time}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-neutral-800">{t.title}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 max-w-md line-clamp-1">{t.description}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-600">{t.location}</td>
                        <td className="py-3.5 px-4">
                          {t.badge ? (
                            <span className="px-2 py-0.5 text-[9px] font-bold border border-neutral-200 bg-neutral-50 text-neutral-600 rounded">
                              {t.badge}
                            </span>
                          ) : (
                            <span className="text-neutral-300">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDeleteTimetable(t.id, t.title)}
                            className="p-1 px-2.5 rounded-lg border border-neutral-100 hover:border-rose-100 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors text-[10px] font-bold"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MEMBERS AND SPECIAL PROGRAMS */}
      {adminSection === 'members' && (
        <div className="space-y-8">
          {/* Members/Committees Form */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
              <Users className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-black text-neutral-800">特別企画・運営員・紹介カードの追加</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    組織・企画紹介名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例: りんどう祭 実行委員会本部"
                    value={memberTitle}
                    onChange={(e) => setMemberTitle(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    所属・副見出し <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例: 生徒会本部 ＆ 実行委員一同"
                    value={memberSubtitle}
                    onChange={(e) => setMemberSubtitle(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    丸型アイコン内の文字 (1〜2文字) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="例: 実"
                    value={memberAvatarChar}
                    onChange={(e) => setMemberAvatarChar(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                    カードのテーマカラー選択 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={memberColorTheme}
                    onChange={(e) => setMemberColorTheme(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/55 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value="indigo">藍色 (Indigo)</option>
                    <option value="emerald">緑色 (Emerald)</option>
                    <option value="amber">琥珀色 (Amber)</option>
                    <option value="rose">薔薇色 (Rose)</option>
                    <option value="violet">青紫色 (Violet)</option>
                    <option value="teal">鴨羽色 (Teal)</option>
                    <option value="orange">橙色 (Orange)</option>
                    <option value="fuchsia">紅紫色 (Fuchsia)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">
                  特別企画・委員会の紹介メッセージ・詳細説明 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder="「全校の一体感を目指して、思い出に残るプログラムを全力でプロデュースしました...」"
                  value={memberDescription}
                  onChange={(e) => setMemberDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-indigo-500 text-xs rounded-xl px-3.5 py-2.5 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>紹介カードを登録して追加</span>
                </button>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-3xl border border-neutral-200/60 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-neutral-100 bg-neutral-50/40">
              <h3 className="text-sm font-black text-neutral-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>登録済み紹介カード一覧 ({members.length}団体)</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              {loadingMembers ? (
                <div className="py-12 text-center text-xs text-neutral-400 font-bold">
                  読み込み中...
                </div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 font-bold">
                  現在、紹介カードに登録された紹介情報はありません。
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200/60 text-[10px] font-black text-neutral-500 uppercase tracking-wider font-sans">
                      <th className="py-3 px-4 w-16 text-center">アイコン</th>
                      <th className="py-3 px-4">組織名・タイトル</th>
                      <th className="py-3 px-4">役割・副題</th>
                      <th className="py-3 px-4">アピール・紹介文</th>
                      <th className="py-3 px-4">カラー</th>
                      <th className="py-3 px-4 w-24 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <span className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center font-bold text-xs mx-auto">
                            {m.avatarChar || (m as any).avatar_char}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-neutral-800">{m.title}</td>
                        <td className="py-3.5 px-4 font-bold text-indigo-600">{m.subtitle}</td>
                        <td className="py-3.5 px-4 text-neutral-500 max-w-xs truncate">{m.description}</td>
                        <td className="py-3.5 px-4 uppercase font-mono text-[10px] text-neutral-500 font-bold">
                          {m.colorTheme || (m as any).color_theme || 'indigo'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDeleteMember(m.id, m.title)}
                            className="p-1 px-2.5 rounded-lg border border-neutral-100 hover:border-rose-100 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors text-[10px] font-bold"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
