/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { TimetableEvent } from '../types';

export default function ScheduleTab() {
  const [activeDay, setActiveDay] = useState(1);
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimetable() {
      try {
        const data = await api.getTimetable();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, []);

  const day1Events = events.filter(e => Number(e.day) === 1);
  const day2Events = events.filter(e => Number(e.day) === 2);
  const currentEvents = activeDay === 1 ? day1Events : day2Events;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 animate-fade-in text-left font-sans" id="schedule-tab">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
          PROGRAM TIMELINE
        </span>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            <span>りんどう祭 進行タイムテーブル</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-normal font-medium">
            各合唱コンクールやステージ発表、バザーなどの詳細スケジュール。見逃さないようブックマークしてください！
          </p>
        </div>

        {/* Day selection tabs */}
        <div className="flex p-1 bg-neutral-150/40 rounded-xl border border-neutral-200/50 self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveDay(1)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeDay === 1 
                ? 'bg-neutral-800 text-white shadow-md' 
                : 'text-neutral-520 hover:text-neutral-800'
            }`}
          >
            1日目 (D1)
          </button>
          <button
            onClick={() => setActiveDay(2)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeDay === 2 
                ? 'bg-neutral-800 text-white shadow-md' 
                : 'text-neutral-520 hover:text-neutral-800'
            }`}
          >
            2日目 (D2)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-neutral-400 font-bold">
          タイムテーブルを読み込み中...
        </div>
      ) : currentEvents.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-[32px] border border-neutral-200/60 p-10 sm:p-16 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto mb-5 text-neutral-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-neutral-800 mb-2">
            {activeDay}日目のタイムテーブルは現在未登録です
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed font-semibold">
            タイムテーブル情報は、企画運営側の管理者コンソールから直接データベース(D1)に登録・管理されます。登録完了までしばらくお待ちください。
          </p>
        </div>
      ) : (
        /* Styled Event Timeline */
        <div className="relative border-l-2 border-neutral-200/80 ml-3.5 pl-6 sm:pl-8 space-y-8 py-2">
          {currentEvents.map((event, index) => {
            // Support both camelCase camel and snake_case properties
            const displayColor = event.badgeColor || (event as any).badge_color || 'bg-indigo-50 border-indigo-150 text-indigo-750';
            return (
              <div key={event.id || index} className="relative group">
                {/* Timeline pin point */}
                <span className="absolute -left-[32px] sm:-left-[37px] top-1.5 flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-center rounded-full bg-white border-2 border-indigo-500 shadow-xs group-hover:scale-110 transition-transform duration-200 z-10">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </span>

                <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-neutral-200/50 hover:border-neutral-300 shadow-xs hover:shadow-md transition-all duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                    {event.badge && (
                      <span className={`text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${displayColor}`}>
                        {event.badge}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 text-neutral-500 font-bold font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{event.time}</span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-neutral-800 mb-2 leading-snug">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-xs text-neutral-500 leading-relaxed mb-4 font-medium">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-indigo-700 bg-neutral-50 border border-neutral-100/80 px-3 py-2 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>開催場所: {event.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-150/40 text-[11px] font-bold text-indigo-800/80 mt-10 leading-relaxed flex items-start gap-2 max-w-2xl">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span>
            ※ 各イベントの時間は目安です。進行状況により多少前後する場合があります。<br />
            コンクール当日の進行速報やリアルタイムの変更も、是非「会場スポット口コミ」へ気軽に書き込んでシェアしてください！
          </span>
        </div>
      </div>
    </div>
  );
}
