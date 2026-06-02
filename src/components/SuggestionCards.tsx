/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Music, Palette, Coffee, Sparkles } from 'lucide-react';

interface SuggestionCardsProps {
  onSelectCategory: (category: string | null) => void;
  selectedCategory: string | null;
}

export default function SuggestionCards({ onSelectCategory, selectedCategory }: SuggestionCardsProps) {
  const categories = [
    {
      id: 'stage',
      title: '体育館ステージ発表',
      subtitle: '音楽・歌・演劇・パフォーマンス',
      description: 'オープニングセレモニー、各学年による合唱コンクール、吹奏楽部の特別コンサートや有志ダンスグループなど、りんどう祭の主役たちが輝きます！',
      icon: Music,
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      activeBorder: 'ring-2 ring-indigo-500 ring-offset-2',
      badgeColor: 'bg-indigo-100/50 text-indigo-800'
    },
    {
      id: 'exhibition',
      title: '学年・部活動 展示企画',
      subtitle: '学習成果・美術作品・研究発表',
      description: '各クラスの趣向を凝らした工作・モザイクアート展示や、美術部・書道部、自由研究発表など。校舎全体が巨大な美術館に生まれ変わります！',
      icon: Palette,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      activeBorder: 'ring-2 ring-emerald-500 ring-offset-2',
      badgeColor: 'bg-emerald-100/50 text-emerald-800'
    },
    {
      id: 'food_shop',
      title: 'PTAバザー ＆ 模擬店',
      subtitle: '美味しい模擬店・ドリンク・おやき',
      description: '中庭テラスにて、松本名物の特製「おやき(あんこ、きんぴら、野沢菜)」や美味しいお菓子、ジュースを販売中。バザーの掘り出し物もあるかも？',
      icon: Coffee,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
      activeBorder: 'ring-2 ring-amber-500 ring-offset-2',
      badgeColor: 'bg-amber-100/50 text-amber-800'
    },
    {
      id: 'event',
      title: 'りんどう特別催し・イベント',
      subtitle: '中庭ラリー・開祭式・サプライズ',
      description: 'スタンプラリーや、生徒会が贈る中庭特別謎解きゲーム。今年のりんどう祭のスローガンを体感できる最高の一日を演出する特別イベントです。',
      icon: Sparkles,
      bgColor: 'bg-rose-50 text-rose-600 border-rose-100',
      activeBorder: 'ring-2 ring-rose-500 ring-offset-2',
      badgeColor: 'bg-rose-100/50 text-rose-800'
    }
  ];

  return (
    <div className="w-full py-10 bg-[#FAF9F6] border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 px-3 py-1.5 rounded-full mb-4 border border-indigo-100/50">
            FESTIVAL CATEGORIES
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-black text-neutral-900 tracking-tight leading-normal mb-6">
            りんどう祭 4大プログラム
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-medium">
            今年のテーマは「輝き」。生徒たちが一丸となって作り上げた各おすすめブース、イベントを紹介します。<br />
            下記のカードをクリックすると、対象の企画に絞り込んでマップ上で口コミを読むことができます！
          </p>
        </div>

        {/* 4 Cards Grid - Responsive: slides horizontally on mobile, standard grid on desktop */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 md:pb-0 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;
            
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                className={`group relative flex flex-col items-start bg-white p-7 rounded-[32px] border border-neutral-200/40 shadow-[0_12px_45px_-8px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 min-w-[280px] xs:min-w-[320px] max-w-[85vw] snap-start shrink-0 md:min-w-0 md:max-w-none md:shrink ${
                  isSelected ? cat.activeBorder : ''
                }`}
              >
                {/* Colored Icon Header */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 transition-transform duration-300 group-hover:scale-105 ${cat.bgColor}`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Categories Indicator Badge */}
                <div className="mb-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${cat.badgeColor}`}>
                    {cat.subtitle}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="text-base font-bold text-neutral-900 mb-3 tracking-tight group-hover:text-indigo-700 transition-colors duration-200">
                  {cat.title}
                </h3>

                {/* Card Body */}
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  {cat.description}
                </p>

                {/* Filter indicator */}
                <div className="mt-6 w-full flex items-center justify-between border-t border-neutral-100 pt-3">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    {isSelected ? '選択解除する' : 'マップの対象箇所を見る'}
                  </span>
                  <span className={`w-2 h-2 rounded-full transition-all duration-300 ${isSelected ? 'bg-indigo-500 scale-125' : 'bg-neutral-200 group-hover:bg-neutral-300'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1.5 text-[11px] text-neutral-400 mt-2 font-medium">
          <span>← 左右にスワイプして全企画を表示 →</span>
        </div>

        {selectedCategory && (
          <div className="mt-8 text-center animate-fade-in">
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 px-4 py-2 rounded-full transition-colors duration-200"
            >
              フィルターを解除してすべてのスポットを表示
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
