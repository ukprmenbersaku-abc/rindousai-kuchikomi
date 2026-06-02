/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Spot, Review } from '../types';

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
};

// Seed mock data corresponding to Chikumano Junior High School Rindo Festival
const MOCK_SPOTS: Spot[] = [
  {
    id: 1,
    name: "第1体育館 (メインステージ)",
    x: 42.5,
    y: 35.0,
    description: "オープニングセレモニー、合唱コンクール、吹奏楽部の演奏、有志による演劇やダンスなど、りんどう祭の熱気が最高潮に達する特設ステージです！",
    category: "stage"
  },
  {
    id: 2,
    name: "3階 2年A組教室 (ステンドグラス光のアート)",
    x: 22.0,
    y: 55.5,
    description: "クラス全員で1枚ずつ心を込めて作った色透明フィルムのモザイクアート展示。陽の光が差し込むと教室全体が万華鏡のように輝きます。",
    category: "exhibition"
  },
  {
    id: 3,
    name: "中庭テント (PTAバザー＆松本おやき模擬店)",
    x: 62.5,
    y: 72.0,
    description: "松本名物の「おやき(あんこ・きんぴら)」やフランクフルト、冷たいジュースを販売しています。中庭の青空テーブルで一休みしていきませんか？",
    category: "food_shop"
  },
  {
    id: 4,
    name: "多目的ホール (美術部・書道部 合同作品展)",
    x: 81.3,
    y: 28.5,
    description: "美術部が描いた巨大な共同制作絵画と、書道部が大きな紙に力強く書き上げたパフォーマンス作品をメイン展示。圧巻のアート空間です。",
    category: "exhibition"
  }
];

const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    spotId: 1,
    rating: 5,
    author: "りんどうっ子",
    role: "3年生",
    comment: "合唱コンクールの金賞を目指して毎日練習した成果が本番で発揮できました！体育館の響きも綺麗で最高の思い出です！",
    createdAt: "2026-05-30T14:22:00Z"
  },
  {
    id: 2,
    spotId: 2,
    rating: 5,
    author: "ちくまのファン",
    role: "保護者",
    comment: "教室の窓ガラス一面に広がるステンドグラス風モザイクに感動しました。生徒の細かい作業努力が目に浮かび涙が出そうです。",
    createdAt: "2026-05-31T01:10:00Z"
  },
  {
    id: 3,
    spotId: 3,
    rating: 4,
    author: "おやき大好き",
    role: "2年生",
    comment: "おやきの野沢菜味が、モチモチの皮とピリ辛の具で絶品でした！友達と芝生に座っておしゃべりしながら美味しく食べました。",
    createdAt: "2026-05-29T18:05:00Z"
  },
  {
    id: 4,
    spotId: 4,
    rating: 5,
    author: "アート同好会",
    role: "1年生",
    comment: "先輩達の作品のレベルが高すぎて驚きました！書道部のダイナミックな文字の勢いは本当にかっこいいです。",
    createdAt: "2026-05-31T08:30:00Z"
  }
];

// Ensure initial setup of localStorage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.SPOTS)) {
    localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(MOCK_SPOTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(MOCK_REVIEWS));
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
export const api = {
  /**
   * Fetch all spots
   */
  async getSpots(): Promise<Spot[]> {
    try {
      const response = await fetch('/api/spots');
      if (!response.ok) throw new Error('Failed to fetch spots');
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
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
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
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
      return response.ok;
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
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
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
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
      return await response.json();
    } catch (error) {
      console.warn('API error, falling back to local storage:', error);
      const reviews = getLocalStorageReviews();
      const newReview: Review = {
        ...review,
        id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
      };
      setLocalStorageReviews([...reviews, newReview]);
      return newReview;
    }
  }
};
