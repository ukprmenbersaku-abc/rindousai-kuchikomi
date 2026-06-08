/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Spot, Review, Category, TimetableEvent, CommitteeMember } from '../types';

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
  TIMETABLE: 'kuchicomi_timetable',
  MEMBERS: 'kuchicomi_members',
};

/// Seed mock data - empty initially as requested
const MOCK_SPOTS: Spot[] = [];

const MOCK_REVIEWS: Review[] = [];

const MOCK_CATEGORIES: Category[] = [
  { id: 'stage', label: 'ステージ発表', color: 'indigo' },
  { id: 'exhibition', label: '展示企画', color: 'emerald' },
  { id: 'food_shop', label: '模擬店・バザー', color: 'amber' },
  { id: 'event', label: '特別催し', color: 'rose' },
];

const MOCK_TIMETABLE: TimetableEvent[] = [];
const MOCK_MEMBERS: CommitteeMember[] = [];

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
  if (!localStorage.getItem(STORAGE_KEYS.TIMETABLE)) {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(MOCK_TIMETABLE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(MOCK_MEMBERS));
  }
}

// Low-level helper functions for mock DB
function getLocalStorageTimetable(): TimetableEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    return data ? JSON.parse(data) : MOCK_TIMETABLE;
  } catch (e) {
    return MOCK_TIMETABLE;
  }
}

function setLocalStorageTimetable(timetable: TimetableEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  } catch (e) {
    console.error('Error saving timetable to localStorage', e);
  }
}

function getLocalStorageMembers(): CommitteeMember[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : MOCK_MEMBERS;
  } catch (e) {
    return MOCK_MEMBERS;
  }
}

function setLocalStorageMembers(members: CommitteeMember[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Error saving members to localStorage', e);
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

const BLOCKED_SPOT_NAMES = [
  '第1体育館 (メインステージ)',
  '3階 2年A組教室 (ステンドグラス光のアート)',
  '中庭テント (PTAバザー＆松本おやき模擬店)',
  '多目的ホール (美術部・書道部 合同作品展)',
  '第1体育館',
  '3階 2年A組教室',
  '中庭テント',
  '多目的ホール'
];

function isInitialStaticSpot(spot: Spot): boolean {
  if (!spot.name) return false;
  const name = spot.name.trim();
  // Check if name contains or matches any of the blocked names
  if (BLOCKED_SPOT_NAMES.some(blocked => name.includes(blocked) || blocked.includes(name))) {
    return true;
  }
  // Check if description matches key phrasing
  if (spot.description) {
    if (spot.description.includes('おやき') && spot.description.includes('PTA')) return true;
    if (spot.description.includes('ステンドグラス') || spot.description.includes('モザイクアート')) return true;
    if (spot.description.includes('吹奏楽部') && spot.description.includes('合唱')) return true;
    if (spot.description.includes('美術部') && spot.description.includes('書道部')) return true;
  }
  return false;
}

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
      const data: Spot[] = await response.json();
      
      // Filter out initial static spots so they never render in UI
      const cleanData = data.filter(s => !isInitialStaticSpot(s));
      const problematic = data.filter(s => isInitialStaticSpot(s));
      if (problematic.length > 0) {
        // Automatically delete these pre-existing mock items from D1 asynchronously
        for (const prob of problematic) {
          fetch(`/api/spots?id=${prob.id}`, { method: 'DELETE' }).catch(err => console.error(err));
        }
      }
      return cleanData;
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
      hasFallbackTriggered = true;
      const data = getLocalStorageSpots();
      const cleanData = data.filter(s => !isInitialStaticSpot(s));
      if (cleanData.length !== data.length) {
        setLocalStorageSpots(cleanData);
      }
      return cleanData;
    }
  },

  /**
   * Save a new spot or edit an existing spot (admin)
   */
  async saveSpot(spot: Omit<Spot, 'id'> & { id?: number }): Promise<Spot> {
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
      if (spot.id) {
        const updated = spots.map(s => s.id === spot.id ? { ...s, ...spot } as Spot : s);
        setLocalStorageSpots(updated);
        return spot as Spot;
      } else {
        const newSpot: Spot = {
          ...spot,
          id: spots.length > 0 ? Math.max(...spots.map(s => s.id)) + 1 : 1,
        } as Spot;
        setLocalStorageSpots([...spots, newSpot]);
        return newSpot;
      }
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
  },

  /**
   * Fetch all timetable events
   */
  async getTimetable(): Promise<TimetableEvent[]> {
    try {
      const response = await fetch('/api/timetable');
      if (!response.ok) throw new Error('Failed to fetch timetable');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage timetable:', error);
      hasFallbackTriggered = true;
      return getLocalStorageTimetable();
    }
  },

  /**
   * Save a timetable event (create or edit)
   */
  async saveTimetable(event: Omit<TimetableEvent, 'id'> & { id?: number }): Promise<TimetableEvent> {
    try {
      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error('Failed to save timetable event');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage timetable save:', error);
      hasFallbackTriggered = true;
      const timetable = getLocalStorageTimetable();
      if (event.id) {
        const updated = timetable.map(t => t.id === event.id ? { ...t, ...event } as TimetableEvent : t);
        setLocalStorageTimetable(updated);
        return event as TimetableEvent;
      } else {
        const newEvent: TimetableEvent = {
          ...event,
          id: timetable.length > 0 ? Math.max(...timetable.map(t => t.id)) + 1 : 1,
        } as TimetableEvent;
        setLocalStorageTimetable([...timetable, newEvent]);
        return newEvent;
      }
    }
  },

  /**
   * Delete a timetable event
   */
  async deleteTimetable(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/timetable?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete timetable event');
      hasFallbackTriggered = false;
      return response.ok;
    } catch (error) {
      console.warn('API error, falling back to local storage timetable delete:', error);
      hasFallbackTriggered = true;
      const timetable = getLocalStorageTimetable();
      setLocalStorageTimetable(timetable.filter(t => t.id !== id));
      return true;
    }
  },

  /**
   * Fetch all committee members/special projects
   */
  async getMembers(): Promise<CommitteeMember[]> {
    try {
      const response = await fetch('/api/members');
      if (!response.ok) throw new Error('Failed to fetch members');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage members:', error);
      hasFallbackTriggered = true;
      return getLocalStorageMembers();
    }
  },

  /**
   * Save a committee member/special project (create or edit)
   */
  async saveMember(member: Omit<CommitteeMember, 'id'> & { id?: number }): Promise<CommitteeMember> {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      if (!response.ok) throw new Error('Failed to save member');
      hasFallbackTriggered = false;
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage member save:', error);
      hasFallbackTriggered = true;
      const members = getLocalStorageMembers();
      if (member.id) {
        const updated = members.map(m => m.id === member.id ? { ...m, ...member } as CommitteeMember : m);
        setLocalStorageMembers(updated);
        return member as CommitteeMember;
      } else {
        const newMember: CommitteeMember = {
          ...member,
          id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
        } as CommitteeMember;
        setLocalStorageMembers([...members, newMember]);
        return newMember;
      }
    }
  },

  /**
   * Delete a committee member/special project
   */
  async deleteMember(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete member');
      hasFallbackTriggered = false;
      return response.ok;
    } catch (error) {
      console.warn('API error, falling back to local storage member delete:', error);
      hasFallbackTriggered = true;
      const members = getLocalStorageMembers();
      setLocalStorageMembers(members.filter(m => m.id !== id));
      return true;
    }
  }
};
