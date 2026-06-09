/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Spot, Category, Review } from '../types';
import SpotSidebar from './SpotSidebar';
import MapContainer from './MapContainer';

interface MapPageProps {
  isMobile: boolean;
  isMobileDrawerExpanded: boolean;
  setIsMobileDrawerExpanded: (expanded: boolean) => void;
  selectedSpot: Spot | null;
  setSelectedSpot: (spot: Spot | null) => void;
  spots: Spot[];
  setSpots: React.Dispatch<React.SetStateAction<Spot[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  isAdmin: boolean;
  triggerNotification: (message: string) => void;
  loadSpots: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  setActiveTab: (tab: string) => void;
  getCategoryColor: (categoryId: string) => { label: string; textBg: string; bg: string };
  searchedSpots: Spot[];
  averageRating: string;
  spotReviews: Review[];
  isLoadingReviews: boolean;
  handleAddReview: (e: React.FormEvent) => Promise<void>;
  newRating: number;
  setNewRating: (rating: number) => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  newAuthor: string;
  setNewAuthor: (author: string) => void;
  newRole: '1年生' | '2年生' | '3年生' | '教職員' | '保護者' | 'OB・OG' | '地域住民' | 'その他';
  setNewRole: (role: any) => void;
  isSubmittingReview: boolean;
  handleDeleteSpot: (id: number) => Promise<void>;
  setAddingCoord: (coord: { x: number; y: number } | null) => void;
  handleAddSpotClick: (x: number, y: number) => void;
}

export default function MapPage({
  isMobile,
  isMobileDrawerExpanded,
  setIsMobileDrawerExpanded,
  selectedSpot,
  setSelectedSpot,
  spots,
  setSpots,
  categories,
  setCategories,
  isAdmin,
  triggerNotification,
  loadSpots,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  setActiveTab,
  getCategoryColor,
  searchedSpots,
  averageRating,
  spotReviews,
  isLoadingReviews,
  handleAddReview,
  newRating,
  setNewRating,
  newComment,
  setNewComment,
  newAuthor,
  setNewAuthor,
  newRole,
  setNewRole,
  isSubmittingReview,
  handleDeleteSpot,
  setAddingCoord,
  handleAddSpotClick,
}: MapPageProps) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-white animate-fade-in text-left">
      {/* Modular Sidebar Section */}
      <SpotSidebar
        isMobile={isMobile}
        isMobileDrawerExpanded={isMobileDrawerExpanded}
        setIsMobileDrawerExpanded={setIsMobileDrawerExpanded}
        selectedSpot={selectedSpot}
        setSelectedSpot={setSelectedSpot}
        spots={spots}
        setSpots={setSpots}
        categories={categories}
        setCategories={setCategories}
        isAdmin={isAdmin}
        triggerNotification={triggerNotification}
        loadSpots={loadSpots}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setActiveTab={setActiveTab}
        getCategoryColor={getCategoryColor}
        searchedSpots={searchedSpots}
        averageRating={averageRating}
        spotReviews={spotReviews}
        isLoadingReviews={isLoadingReviews}
        handleAddReview={handleAddReview}
        newRating={newRating}
        setNewRating={setNewRating}
        newComment={newComment}
        setNewComment={setNewComment}
        newAuthor={newAuthor}
        setNewAuthor={setNewAuthor}
        newRole={newRole}
        setNewRole={setNewRole}
        isSubmittingReview={isSubmittingReview}
        handleDeleteSpot={handleDeleteSpot}
        setAddingCoord={setAddingCoord}
      />

      {/* Google Maps style right-hand canvas mapping viewport */}
      <div className="flex-1 h-full min-w-0 overflow-hidden relative bg-neutral-100">
        <MapContainer
          spots={spots}
          selectedSpot={selectedSpot}
          onSelectSpot={setSelectedSpot}
          isAdmin={isAdmin}
          onAddSpotClick={handleAddSpotClick}
          selectedCategory={selectedCategory}
          categories={categories}
        />
      </div>
    </div>
  );
}
