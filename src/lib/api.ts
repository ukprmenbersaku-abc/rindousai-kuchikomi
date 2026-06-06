/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Spot, Review, Category } from '../types';

// Detect preview mode
const isLocalDebug = 
  typeof window !== 'undefined' && 
  (window.location.hostname.includes('localhost') || 
   window.location.hostname.includes('ais-dev') || 
   window.location.hostname.includes('ais-pre') ||
   window.location.hostname.includes('run.app'));

// Key names for localStorage
const STORAGE_KEYS = {
  SPOTS: 'kuchicomi_spots',
  REVIEWS: 'kuchicomi_reviews',
  CATEGORIES: 'kuchicomi_categories',
};

/// Seed mock data - empty initially as requested
const MOCK_SPOTS: Spot[] = [];

const MOCK_REVIEWS: Review[] = [];

const MOCK_CATEGORIES: Category[] = [];

// Ensure initial setup of localStorage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.SPOTS)) {
    localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(MOCK_SPOTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(MOCK_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(MOCK_CATEGORIES));
  }
}

// Low-level helper functions for mock DB
function getLocalStorageCategories(): Category[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : MOCK_CATEGORIES;
  } catch (e) {
    return MOCK_CATEGORIES;
  }
}

function setLocalStorageCategories(categories: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories to localStorage', e);
  }
}

// Low-level helper functions for mock DB
function getLocalStorageSpots(): Spot[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SPOTS);
    return data ? JSON.parse(data) : MOCK_SPOTS;
  } catch (e) {
    return MOCK_SPOTS;
  }
}

function setLocalStorageSpots(spots: Spot[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(spots));
  } catch (e) {
    console.error('Error saving spots to localStorage', e);
  }
}

function getLocalStorageReviews(): Review[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return data ? JSON.parse(data) : MOCK_REVIEWS;
  } catch (e) {
    return MOCK_REVIEWS;
  }
}

function setLocalStorageReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving reviews to localStorage', e);
  }
}

// API Service exports
let hasFallbackTriggered = false;

export const api = {
  /**
   * Check if current operation failed and fell back to local storage
   */
  isUsingFallback(): boolean {
    return hasFallbackTriggered;
  },

  /**
   * Fetch all spots
   */
  async getSpots(): Promise<Spot[]> {
    try {
      const response = await fetch('/api/spots');
      if (!response.ok) throw new Error('Failed to fetch spots');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
      hasFallbackTriggered = true;
      return getLocalStorageSpots();
    }
  },

  /**
   * Save a new spot (admin)
   */
  async saveSpot(spot: Omit<Spot, 'id'>): Promise<Spot> {
    try {
      const response = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spot),
      });
      if (!response.ok) throw new Error('Failed to save spot');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
      hasFallbackTriggered = true;
      const spots = getLocalStorageSpots();
      const newSpot: Spot = {
        ...spot,
        id: spots.length > 0 ? Math.max(...spots.map(s => s.id)) + 1 : 1,
      };
      setLocalStorageSpots([...spots, newSpot]);
      return newSpot;
    }
  },

  /**
   * Delete a spot (admin)
   */
  async deleteSpot(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/spots?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete spot');
      hasFallbackTriggered = false;
      return response.ok;
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
      hasFallbackTriggered = true;
      const spots = getLocalStorageSpots();
      setLocalStorageSpots(spots.filter(s => s.id !== id));
      const reviews = getLocalStorageReviews();
      setLocalStorageReviews(reviews.filter(r => r.spotId !== id));
      return true;
    }
  },

  /**
   * Fetch all reviews or reviews for a specific spot
   */
  async getReviews(spotId?: number): Promise<Review[]> {
    try {
      const url = spotId ? `/api/reviews?spotId=${spotId}` : '/api/reviews';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
      hasFallbackTriggered = true;
      const reviews = getLocalStorageReviews();
      return spotId ? reviews.filter(r => r.spotId === spotId) : reviews;
    }
  },

  /**
   * Save a new review
   */
  async saveReview(review: Omit<Review, 'id'>): Promise<Review> {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (!response.ok) throw new Error('Failed to save review');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
      hasFallbackTriggered = true;
      const reviews = getLocalStorageReviews();
      const newReview: Review = {
        ...review,
        id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
      };
      setLocalStorageReviews([...reviews, newReview]);
      return newReview;
    }
  },

  /**
   * Reset database to the initial 4 default spots and starter reviews
   */
  async resetDatabase(): Promise<boolean> {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reset database');
      hasFallbackTriggered = false;
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
      return response.ok;
    } catch (error) {
      console.warn('API error, falling back to local storage reset:', error);
      hasFallbackTriggered = true;
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
      return true;
    }
  },

  /**
   * Fetch all custom categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage categories:', error);
      hasFallbackTriggered = true;
      return getLocalStorageCategories();
    }
  },

  /**
   * Save a dynamic category
   */
  async saveCategory(category: Category): Promise<Category> {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error('Failed to save category');
      hasFallbackTriggered = false;
      const data = await response.json();
      return data.category || category;
    } catch (error) {
      console.warn('API error, falling back to local storage categories save:', error);
      hasFallbackTriggered = true;
      const categories = getLocalStorageCategories();
      const updated = categories.filter(c => c.id !== category.id);
      updated.push(category);
      setLocalStorageCategories(updated);
      return category;
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      hasFallbackTriggered = false;
      return response.ok;
    } catch (error) {
      console.warn('API error, falling back to local storage categories delete:', error);
      hasFallbackTriggered = true;
      const categories = getLocalStorageCategories();
      setLocalStorageCategories(categories.filter(c => c.id !== id));
      return true;
    }
  }
};
