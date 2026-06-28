/**
 * Chikumano Junior High School Rindousai Map Header Component
 * Beautifully crafted with responsive navigation, administrator toggle,
 * and a fully animated mobile side drawer modeled after modern drawer interfaces.
 */

import React, { useState } from 'react';
import { Sparkles, Eye, Settings, Map, Flower, Menu, X, Shield, Calendar, BookOpen, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export default function Header({ isAdmin, setIsAdmin, activeTab, setActiveTab, onOpenSettings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define tabs with metadata including custom icons for elegant visual list items
  const tabs = [
    { id: 'home', label: '口コミマップを見る・書く', icon: Map, isExternal: false },
    { id: 'manifesto', label: 'りんどう祭について知る', icon: BookOpen, isExternal: true },
    { id: 'schedule', label: '今日のスケジュールを見る', icon: Calendar, isExternal: true },
    { id: 'credits', label: 'アプリの仕組み・素材出典', icon: Sparkles, isExternal: false },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin_table', label: 'データ管理(表形式)', icon: Shield, isExternal: false });
  }

  return (
    <header className={`sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-neutral-100/80 transition-all duration-300 ${mobileMenuOpen ? 'z-[999999]' : 'z-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Festival Name + Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Hamburger trigger on the left of the logo on mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 hover:bg-neutral-100 active:bg-neutral-200 rounded-lg text-neutral-500 lg:hidden cursor-pointer"
              aria-label="メニューを開く"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo & Festival Name */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 select-none cursor-pointer"
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
            >
              <div className="w-8.5 h-8.5 rounded-xl bg-violet-50/80 flex items-center justify-center border border-violet-200/50 shadow-xs text-violet-600 transition-transform duration-300 hover:scale-105 active:scale-95 shrink-0">
                <Flower className="w-4.5 h-4.5 fill-violet-100/30 text-violet-500 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs sm:text-[14.5px] text-neutral-800 tracking-tight leading-none font-display whitespace-nowrap">筑摩野中 りんどう祭</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mt-1 hidden xs:block">Chikumano J.H.S.</span>
              </div>
            </div>
          </div>

          {/* Center Navigation links - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.isExternal) {
                    window.open('https://rindousai.userkunn.com', '_blank');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`relative px-4 py-2 rounded-xl text-xs xl:text-[13px] font-semibold tracking-wide transition-all duration-350 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-violet-700 bg-violet-50/75 font-bold shadow-xs border border-violet-100/40'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
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
                <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-200/50 text-xs font-semibold text-neutral-600">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all duration-300 bg-amber-600 hover:bg-amber-700 text-white shadow-md cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span className="hidden md:inline">マップ表示に戻る</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu matching the provided UI style */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-[999999] lg:hidden"
            />

            {/* Side Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[290px] max-w-[85vw] bg-white h-full shadow-2xl z-[1000000] lg:hidden flex flex-col overflow-hidden text-left border-r border-neutral-100"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4.5 border-b border-neutral-100/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100/50">
                    <Compass className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-bold text-[15px] sm:text-base tracking-tight text-neutral-800 font-display">メニュー</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 active:bg-neutral-200 rounded-full text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer border border-transparent"
                  aria-label="メニューを閉じる"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1.5">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.isExternal) {
                          window.open('https://rindousai.userkunn.com', '_blank');
                        } else {
                          setActiveTab(tab.id);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 py-3 px-4.5 rounded-2xl text-xs sm:text-[13.5px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'text-violet-700 bg-violet-50/85 shadow-xs border border-violet-100/30'
                          : 'text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100'
                      }`}
                    >
                      <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-violet-600' : 'text-neutral-400'}`} />
                      <span className="flex-1 text-left">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer controls */}
              <div className="border-t border-neutral-100 p-4 shrink-0 bg-neutral-50/50">
                <button
                  onClick={() => {
                    onOpenSettings();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 py-3 px-4.5 rounded-2xl text-xs sm:text-[13px] font-bold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all cursor-pointer"
                >
                  <Settings className="w-4.5 h-4.5 text-neutral-400" />
                  <span>Cookie・設定を管理する</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
