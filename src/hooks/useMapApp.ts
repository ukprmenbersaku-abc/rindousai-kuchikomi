/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Spot, Category, Review } from '../types';
import { api } from '../lib/api';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'stage', label: 'ステージ発表', color: 'indigo' },
  { id: 'exhibition', label: '展示企画', color: 'emerald' },
  { id: 'food_shop', label: '模擬店・バザー', color: 'amber' },
  { id: 'event', label: '特別催し', color: 'rose' },
];

export function useMapApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingCoord, setAddingCoord] = useState<{ x: number; y: number } | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Secret Admin & Mobile responsive optimization states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(0); // 1st program open by default on mobile

  // Reviews and Search/Filtering for Google Maps style left detailed sidebar
  const [spotReviews, setSpotReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRole, setNewRole] = useState<'1年生' | '2年生' | '3年生' | '教職員' | '保護者' | 'OB・OG' | '地域住民' | 'その他'>('1年生');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const triggerNotification = (message: string) => {
    setShowNotification(message);
    const timer = setTimeout(() => {
      setShowNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  // Auto-fetch reviews inside sidebar when selectedSpot transitions
  useEffect(() => {
    if (selectedSpot) {
      setIsMobileDrawerExpanded(true);
      const getSpotReviews = async () => {
        setIsLoadingReviews(true);
        try {
          const data = await api.getReviews(selectedSpot.id);
          setSpotReviews(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingReviews(false);
        }
      };
      getSpotReviews();
    } else {
      setSpotReviews([]);
      setIsMobileDrawerExpanded(false);
    }
  }, [selectedSpot]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot || !newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const submittedName = newAuthor.trim() || '匿名希望';
      await api.saveReview({
        spotId: selectedSpot.id,
        rating: newRating,
        comment: newComment.trim(),
        author: submittedName,
        role: newRole,
      });
      setNewComment('');
      setNewAuthor('');
      setNewRating(5);
      
      // Refresh list
      const data = await api.getReviews(selectedSpot.id);
      setSpotReviews(data);
      triggerNotification('📝 新しい口コミを投稿しました！');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const found = categories.find(c => c.id === categoryId);
    if (!found) {
      return {
        label: '特別催し・その他',
        textBg: 'bg-rose-50 border-rose-150 text-rose-700',
        bg: 'bg-rose-500',
      };
    }

    let textBgStr = 'bg-rose-50 border-rose-155 text-rose-700';
    let bgStr = 'bg-rose-500';

    switch (found.color) {
      case 'indigo':
        textBgStr = 'bg-indigo-50 border-indigo-150 text-indigo-700';
        bgStr = 'bg-indigo-500';
        break;
      case 'emerald':
        textBgStr = 'bg-emerald-50 border-emerald-155 text-emerald-700';
        bgStr = 'bg-emerald-500';
        break;
      case 'amber':
        textBgStr = 'bg-amber-50 border-amber-155 text-amber-700';
        bgStr = 'bg-amber-500';
        break;
      case 'violet':
        textBgStr = 'bg-violet-50 border-violet-155 text-violet-700';
        bgStr = 'bg-violet-500';
        break;
      case 'teal':
        textBgStr = 'bg-teal-50 border-teal-155 text-teal-700';
        bgStr = 'bg-teal-500';
        break;
      case 'orange':
        textBgStr = 'bg-orange-50 border-orange-155 text-orange-700';
        bgStr = 'bg-orange-500';
        break;
      case 'fuchsia':
        textBgStr = 'bg-fuchsia-50 border-fuchsia-155 text-fuchsia-700';
        bgStr = 'bg-fuchsia-500';
        break;
      case 'rose':
      default:
        textBgStr = 'bg-rose-50 border-rose-155 text-rose-700';
        bgStr = 'bg-rose-500';
        break;
    }

    return {
      label: found.label,
      textBg: textBgStr,
      bg: bgStr,
    };
  };

  // Filter spots based on both parent tag filters and left sidebar search inputs
  const searchedSpots = spots.filter(s => {
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const averageRating = spotReviews.length > 0
    ? (spotReviews.reduce((acc, r) => acc + r.rating, 0) / spotReviews.length).toFixed(1)
    : '評価なし';

  // Load spots from our API / storage layer
  const loadSpots = async () => {
    try {
      const data = await api.getSpots();
      setSpots(data);
    } catch (e) {
      console.error('Error loading spots:', e);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      if (data && data.length > 0) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  useEffect(() => {
    loadSpots();
    loadCategories();

    // Check size on mount
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Check URL to see if we should trigger secret administrator login dialog
    const checkPath = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const isSecret = 
        path.includes('stystem-rindou') || 
        path.includes('system-rindou') || 
        hash.includes('stystem-rindou') || 
        hash.includes('system-rindou');

      if (isSecret) {
        setShowLoginModal(true);
      }
    };

    checkPath();
    window.addEventListener('hashchange', checkPath);

    // Keep admin mode persistent during current session
    if (sessionStorage.getItem('rindo_admin') === 'true') {
      setIsAdmin(true);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('hashchange', checkPath);
    };
  }, []);

  // Admin secret login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === 'kuchikomi-yama') {
      setIsAdmin(true);
      sessionStorage.setItem('rindo_admin', 'true');
      setShowLoginModal(false);
      setLoginPassword('');
      setLoginError(false);
      triggerNotification('ログイン成功！管理者モードになりました。');
      
      // Clear secret parameters from URL seamlessly
      if (window.location.hash.includes('rindou')) {
        window.location.hash = 'home';
      } else {
        window.history.replaceState({}, '', '/');
      }
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  // Add new spot from map click (Admin only)
  const handleAddSpotClick = (x: number, y: number) => {
    setAddingCoord({ x, y });
  };

  const handleSaveSpot = async (newSpotData: Omit<Spot, 'id'>) => {
    try {
      const saved = await api.saveSpot(newSpotData);
      setSpots((prev) => [saved, ...prev]);
      setAddingCoord(null);
      triggerNotification(`口コミスポット「${saved.name}」を配置しました！`);
    } catch (error) {
      console.error('Failed to save spot:', error);
    }
  };

  // Delete spot
  const handleDeleteSpot = async (id: number) => {
    try {
      const success = await api.deleteSpot(id);
      if (success) {
        setSpots((prev) => prev.filter((s) => s.id !== id));
        setSelectedSpot(null);
        triggerNotification('🗑️ スポットを削除しました。');
      }
    } catch (error) {
      console.error('Failed to delete spot:', error);
    }
  };

  return {
    isAdmin,
    setIsAdmin,
    activeTab,
    setActiveTab,
    spots,
    setSpots,
    categories,
    setCategories,
    selectedSpot,
    setSelectedSpot,
    selectedCategory,
    setSelectedCategory,
    addingCoord,
    setAddingCoord,
    showNotification,
    setShowNotification,
    showSettingsModal,
    setShowSettingsModal,

    showLoginModal,
    setShowLoginModal,
    loginPassword,
    setLoginPassword,
    loginError,
    setLoginError,
    isMobile,
    setIsMobile,
    isMobileDrawerExpanded,
    setIsMobileDrawerExpanded,
    expandedProgram,
    setExpandedProgram,

    spotReviews,
    setSpotReviews,
    isLoadingReviews,
    setIsLoadingReviews,
    searchQuery,
    setSearchQuery,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
    newAuthor,
    setNewAuthor,
    newRole,
    setNewRole,
    isSubmittingReview,
    setIsSubmittingReview,

    triggerNotification,
    handleAddReview,
    getCategoryColor,
    searchedSpots,
    averageRating,
    loadSpots,
    loadCategories,
    handleLoginSubmit,
    handleAddSpotClick,
    handleSaveSpot,
    handleDeleteSpot,
  };
}
