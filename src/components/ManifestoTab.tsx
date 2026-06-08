/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin } from 'lucide-react';
import { Spot, Category } from '../types';

interface ManifestoTabProps {
  isMobile: boolean;
  expandedProgram: number | null;
  setExpandedProgram: (id: number | null) => void;
  spots: Spot[];
  categories: Category[];
}

export default function ManifestoTab({ isMobile, expandedProgram, setExpandedProgram, spots, categories }: ManifestoTabProps) {
  // Translate dynamic spots from the database (D1) into the overview's programs
  const programs = spots.map((spot) => {
    // Determine color class and background label styles based on current category
    const matchedCategory = categories.find((c) => c.id === spot.category);
    const colorScheme = matchedCategory ? matchedCategory.color : 'rose';
    
    let colorClass = 'bg-rose-500';
    let spotColor = 'text-rose-700 bg-rose-50 border-rose-100';
    
    switch (colorScheme) {
      case 'indigo':
        colorClass = 'bg-indigo-500';
        spotColor = 'text-indigo-700 bg-indigo-50 border-indigo-100';
        break;
      case 'emerald':
        colorClass = 'bg-emerald-500';
        spotColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
        break;
      case 'amber':
        colorClass = 'bg-amber-500';
        spotColor = 'text-amber-700 bg-amber-50 border-amber-100';
        break;
      case 'violet':
        colorClass = 'bg-violet-500';
        spotColor = 'text-violet-700 bg-violet-50 border-violet-100';
        break;
      case 'teal':
        colorClass = 'bg-teal-500';
        spotColor = 'text-teal-700 bg-teal-50 border-teal-100';
        break;
      case 'orange':
        colorClass = 'bg-orange-500';
        spotColor = 'text-orange-700 bg-orange-50 border-orange-100';
        break;
      case 'fuchsia':
        colorClass = 'bg-fuchsia-500';
        spotColor = 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-100';
        break;
    }

    return {
      id: spot.id,
      title: spot.name,
      categoryLabel: matchedCategory ? matchedCategory.label : 'その他特別催し',
      color: colorClass,
      desc: spot.description || 'この企画の追加詳細情報はまだ用意されていません。',
      locationInfo: `詳細位置: 座標 ${spot.x.toFixed(1)}%, ${spot.y.toFixed(1)}%`,
      spotColor: spotColor,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 animate-fade-in text-left" id="manifesto-tab">
      <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">りんどう祭の概要</span>
      <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-4 mb-6 sm:mb-8 text-center sm:text-left">
        筑摩野中学校「りんどう祭」プログラム一覧
      </h2>
      
      {programs.length === 0 ? (
        /* Dynamic empty database response matching clean boundaries layout guidelines */
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100/80 flex items-center justify-center mx-auto mb-4 text-indigo-500">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-800 mb-2">
            登録されている企画・イベントがありません
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            現在、D1 データベースに登録されているイベント展示はすべてクリアされています。会場マップの床面をクリック・タップするか、管理者コンソールから新しいプログラムを登録してください！
          </p>
        </div>
      ) : (
        /* Responsively optimized dynamic festival programs container */
        <div className="space-y-4 sm:space-y-6">
          {programs.map((prog) => {
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
                  className="w-full text-left p-5 sm:p-7 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <h3 className="text-sm sm:text-base font-bold text-neutral-800 flex items-center gap-2 sm:gap-3 pr-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${prog.color}`} />
                    <span className="text-[10px] sm:text-xs font-black tracking-tight text-neutral-400 border border-neutral-150 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {prog.categoryLabel}
                    </span>
                    <span className="truncate">{prog.title}</span>
                  </h3>
                  {isMobile && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all duration-205 shrink-0 ${
                      isOpen ? 'bg-neutral-100 text-neutral-500' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {isOpen ? '閉じる' : '詳細表示'}
                    </span>
                  )}
                </button>

                {/* Content Area with smooth height expansion */}
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-7 sm:pb-7 pt-0 border-t border-neutral-100/50 animate-fade-in">
                    <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-4 mt-2">
                      {prog.desc}
                    </p>
                    <div className={`text-[10px] sm:text-[11px] font-bold px-3.5 py-2.5 rounded-xl border ${prog.spotColor}`}>
                      見どころお勧めスポット・開催場所: {prog.locationInfo}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
