/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Spot, Category } from '../types';
import { X, Save, Crosshair, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SpotFormModalProps {
  x: number;
  y: number;
  onClose: () => void;
  onSave: (spot: Omit<Spot, 'id'>) => void;
  categories: Category[];
}

export default function SpotFormModal({ x, y, onClose, onSave, categories }: SpotFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(categories[0]?.id || 'stage');
  const [coordX, setCoordX] = useState<number>(x);
  const [coordY, setCoordY] = useState<number>(y);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    onSave({
      name: name.trim(),
      x: Number(coordX),
      y: Number(coordY),
      description: description.trim(),
      category,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="w-full max-w-lg bg-white rounded-[32px] border border-neutral-100 shadow-[0_24px_50px_rgba(0,0,0,0.12)] p-8 relative"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/50 flex items-center justify-center text-indigo-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800">
              企画・ブーススポットの配置
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              選択した会場内の座標に、ユーザーが口コミ投稿できる展示や模擬店のスポットを新しく作成します
            </p>
          </div>
        </div>

        {/* Selected Coordinates Status Badge (Now fully editable for perfect layout alignment) */}
        <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl">
          <div className="flex items-center gap-1.5 mb-2.5 text-neutral-700 font-bold text-xs select-none">
            <Crosshair className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
            <span>配置座標の微調整 (比率%)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 mb-1">X 座標 (0〜100%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={coordX}
                onChange={(e) => setCoordX(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono font-bold bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 mb-1">Y 座標 (0〜100%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={coordY}
                onChange={(e) => setCoordY(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono font-bold bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <p className="text-[9px] text-neutral-400 mt-2 leading-tight">
            ※数値を直接入力して配置位置をコントロールできます。ステージ発表は「42.5, 35」、展示企画は「22, 55.5」や「81.3, 28.5」、模擬店は「62.5, 72」が基準点となります。
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
              スポット名/場所名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 第1体育館 (メインステージ)、3F 2-A教室など"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm placeholder-neutral-400 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
              カテゴリー <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-200 truncate ${
                    category === cat.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                  title={cat.label}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
              スポットの紹介・解説
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="例: ここではどのような発表・企画が行われるか、またはイベントの詳細について分かりやすい解説文を記入してください。"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm placeholder-neutral-400 transition-all duration-200 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-all duration-200 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>スポットを配置する</span>
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}
