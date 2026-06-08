/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Eye, Settings, Map, Flower, Menu, X, Shield } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export default function Header({ isAdmin, setIsAdmin, activeTab, setActiveTab, onOpenSettings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation tabs matching the school festival guide + permanent credits section
  const tabs = [
    { id: 'home', label: '口コミマップ' },
    { id: 'manifesto', label: 'りんどう祭について' },
    { id: 'members', label: '特別企画・実行委員' },
    { id: 'schedule', label: 'タイムテーブル' },
    { id: 'credits', label: 'クレジット・出典情報' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin_table', label: 'データ管理(表形式)' });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-100/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Festival Name */}
          <div 
            className="flex items-center gap-2 select-none cursor-pointer"
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-200/50 shadow-sm text-indigo-600">
              <Flower className="w-4.5 h-4.5 fill-indigo-100 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-neutral-800 tracking-tight leading-none">筑摩野中 りんどう祭</span>
            </div>
          </div>

          {/* Center Navigation links - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`relative py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-indigo-600 font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Settings gear always visible */}
            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="p-2 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors cursor-pointer"
              title="Cookieとプライバシー設定"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {isAdmin && (
              <>
                {/* View Mode indicator */}
                <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-200/50 text-[10px] font-medium text-neutral-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  管理者モード
                </div>

                {/* Quick Toggle Button styled with clean slate color */}
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    setActiveTab('home');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-300 bg-amber-600 hover:bg-amber-700 text-white shadow-md cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span className="hidden sm:inline">マップ表示に戻る</span>
                </button>
              </>
            )}

            {/* Hamburger trigger for small mobile screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white/98 backdrop-blur-md py-3 px-4 flex flex-col gap-2 animate-slide-down shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'text-indigo-700 bg-indigo-50/70 border-l-4 border-indigo-500 pl-3'
                  : 'text-neutral-600 hover:bg-neutral-50 pl-4'
              }`}
            >
              {tab.label}
            </button>
          ))}
          
          <button
            onClick={() => {
              onOpenSettings();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-4 font-semibold text-xs sm:text-sm text-indigo-650 hover:bg-neutral-50 rounded-xl cursor-pointer flex items-center gap-2 mt-1 border-t border-neutral-100 pt-3"
          >
            <Settings className="w-4 h-4 text-indigo-500" />
            <span>Cookie・設定を管理する</span>
          </button>
        </div>
      )}
    </header>
  );
}
