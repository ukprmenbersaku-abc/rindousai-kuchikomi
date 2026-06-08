/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { CommitteeMember } from '../types';

export default function MembersTab() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await api.getMembers();
        setMembers(data);
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  // Map theme colors to specific Tailwind utility styles
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'indigo':
        return {
          bg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
          text: 'text-indigo-600',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
          text: 'text-emerald-600',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 border-amber-100 text-amber-600',
          text: 'text-amber-600',
        };
      case 'rose':
        return {
          bg: 'bg-rose-50 border-rose-100 text-rose-600',
          text: 'text-rose-600',
        };
      case 'violet':
        return {
          bg: 'bg-violet-50 border-violet-100 text-violet-600',
          text: 'text-violet-650',
        };
      case 'teal':
        return {
          bg: 'bg-teal-50 border-teal-100 text-teal-600',
          text: 'text-teal-650',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 border-orange-100 text-orange-600',
          text: 'text-orange-650',
        };
      case 'fuchsia':
        return {
          bg: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600',
          text: 'text-fuchsia-650',
        };
      default:
        return {
          bg: 'bg-neutral-50 border-neutral-150 text-neutral-600',
          text: 'text-neutral-600',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 animate-fade-in text-left" id="members-tab">
      <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
        SPECIAL PROJECTS & COMMITTEES
      </span>
      <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-4 mb-3 tracking-tight">
        特別企画・委員会のご紹介
      </h2>
      <p className="text-xs sm:text-sm text-neutral-400 mb-8 sm:mb-10 font-medium">
        今年のテーマ「輝き」をプロデュースし、毎日準備を重ねてくれた生徒・PTAリーダーたちの紹介情報です。
      </p>

      {loading ? (
        <div className="py-16 text-center text-xs text-neutral-400 font-bold">
          特別企画情報を読み込み中...
        </div>
      ) : members.length === 0 ? (
        /* Empty State matching clean instructions */
        <div className="bg-white rounded-[32px] border border-neutral-200/60 p-10 sm:p-16 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto mb-5 text-neutral-400">
            <Users2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-neutral-800 mb-2">
            特別企画・運営委員の紹介情報は現在未登録です
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed font-semibold">
            特別企画・実行委員会に関する紹介情報は、企画運営側の管理者コンソールから直接登録・管理が可能です。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {members.map((member, index) => {
            // Support both camelCase and snake_case properties
            const colorTheme = member.colorTheme || (member as any).color_theme || 'indigo';
            const avatarChar = member.avatarChar || (member as any).avatar_char || '委';
            const style = getThemeClasses(colorTheme);

            return (
              <div 
                key={member.id || index} 
                className="bg-white p-6 rounded-[28px] border border-neutral-200/50 text-center shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-16 h-16 rounded-full ${style.bg} flex items-center justify-center mx-auto mb-4 border font-black text-xl shadow-inner`}>
                    {avatarChar}
                  </div>
                  <h4 className="text-base font-black text-neutral-800 tracking-tight leading-snug">
                    {member.title}
                  </h4>
                  <p className={`text-[11px] font-black mt-1 ${style.text}`}>
                    {member.subtitle}
                  </p>
                  <p className="text-xs text-neutral-500 mt-4 leading-relaxed font-medium">
                    {member.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
