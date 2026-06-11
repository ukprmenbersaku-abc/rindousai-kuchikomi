/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Spot, Review } from '../types';
import { api } from '../lib/api';
import { X, Star, Send, Trash2, Heart, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewModalProps {
  spot: Spot;
  onClose: () => void;
  isAdmin: boolean;
  onDeleteSpot: (id: number) => void;
}

export default function ReviewModal({ spot, onClose, isAdmin, onDeleteSpot }: ReviewModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState<'1年生' | '2年生' | '3年生' | '教職員' | '保護者' | 'OB・OG' | '地域住民' | 'その他'>('1年生');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews for this spot
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReviews(spot.id);
      setReviews(data);
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [spot.id]);

  // Handle new review submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const submittedName = author.trim() || '匿名希望';
      await api.saveReview({
        spotId: spot.id,
        rating,
        comment: comment.trim(),
        author: submittedName,
        role,
      });

      // Reset form & reload reviews list
      setComment('');
      setAuthor('');
      setRating(5);
      fetchReviews();
    } catch (error) {
      console.error('Failed to post review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category label translations
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'stage':
        return { text: '体育館ステージ発表', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
      case 'exhibition':
        return { text: '学年・部活動 展示企画', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'food_shop':
        return { text: 'PTAバザー ＆ 模擬店', color: 'bg-amber-50 text-amber-700 border-amber-100' };
      default:
        return { text: 'りんどう特別催し・イベント', color: 'bg-rose-50 text-rose-700 border-rose-100' };
    }
  };

  const categoryInfo = getCategoryLabel(spot.category);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '評価はまだありません';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 overflow-y-auto w-full h-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="w-full max-w-2xl bg-white rounded-[32px] border border-neutral-100 shadow-[0_24px_50px_rgba(0,0,0,0.12)] max-h-[90vh] flex flex-col relative"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-all duration-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header scrollable area */}
        <div className="p-8 pb-4 border-b border-neutral-100/60">
          <span className={`inline-block text-[10px] font-bold tracking-wider px-3 py-1 rounded-full mb-3 border ${categoryInfo.color}`}>
            {categoryInfo.text}
          </span>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-2xl font-bold text-neutral-800 tracking-tight leading-tight">
                {spot.name}
              </h3>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  if (confirm('この口コミスポットと紐づくすべての口コミを本当に削除しますか？')) {
                    onDeleteSpot(spot.id);
                  }
                }}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-full font-bold transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>スポット削除</span>
              </button>
            )}
          </div>
          {spot.description && (
            <p className="text-xs text-neutral-400 leading-relaxed mt-3 bg-neutral-50 p-4 border border-dashed border-neutral-200/50 rounded-2xl">
              {spot.description}
            </p>
          )}

          {/* Average Rating Stats summary */}
          <div className="flex items-center gap-3 mt-4 text-xs font-semibold text-neutral-600">
            <span className="flex items-center gap-0.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-neutral-900 text-sm font-bold pl-1">{averageRating}</span>
            </span>
            <span>•</span>
            <span>口コミ投稿数: {reviews.length}件</span>
          </div>
        </div>

        {/* Scrollable Center Reviews list */}
        <div className="flex-1 overflow-y-auto p-8 py-4 space-y-5 bg-[#FAF9F6]/40">
          
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
            <span>寄せられた感想・みんなの口コミ</span>
          </h4>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-neutral-400 font-mono">データを読み込み中...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-white p-6 rounded-2xl border border-dashed border-neutral-200/50">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3 text-indigo-600 border border-indigo-100">
                <Heart className="w-5 h-5 fill-indigo-100" />
              </div>
              <p className="text-xs font-bold text-neutral-600">
                まだ口コミがありません。
              </p>
              <p className="text-[11px] text-neutral-400 max-w-sm mt-1 leading-relaxed">
                あなたの感想が、りんどう祭の盛り上がりに繋がります！美味しかったおやつ、すごかった劇、応援メッセージなど、最初の口コミを投稿しましょう！
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white p-5 rounded-2xl border border-neutral-200/40 shadow-sm leading-relaxed text-sm animate-fade-in">
                
                {/* Review Header card */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100/50 rounded px-2 py-0.5 scale-95 font-sans">
                      {review.role}
                    </span>
                    <span className="text-xs font-bold text-neutral-700">
                      {review.author}
                    </span>
                  </div>
                  
                  {/* Rating Stars render */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating 
                            ? 'text-amber-500 fill-amber-500' 
                             : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-neutral-600 font-medium text-xs md:text-sm pl-0">
                  {review.comment}
                </p>

                {review.createdAt && (
                  <div className="text-right mt-2 text-[10px] text-neutral-300 font-mono">
                    {new Date(review.createdAt).toLocaleDateString()} {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom Form input wrapper */}
        <div className="p-8 border-t border-neutral-100 bg-white rounded-b-[32px]">
          <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-4">
            新しい口コミ・要望を書き込む
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Star Rating select */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  おすすめの評価・満足度 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none focus:scale-125 transition-transform duration-200"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors duration-200 ${
                          star <= rating 
                            ? 'text-amber-500 fill-amber-500' 
                            : 'text-neutral-200 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Identity Picker */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    区分 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
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
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    お名前 / ペンネーム
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="匿名希望"
                    maxLength={15}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-neutral-300"
                  />
                </div>
              </div>

            </div>

            {/* Request comment field */}
            <div>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="模擬店・展示の感想や、応援メッセージ、良かった点などの口コミをお寄せください。"
                rows={2}
                maxLength={400}
                className="w-full px-4 py-3 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-neutral-400 resize-none transition-all duration-200"
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-all duration-200 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>口コミを送信する</span>
              </button>
            </div>
          </form>
        </div>

      </motion.div>
    </div>
  );
}
