/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Spot {
  id: number;
  name: string;
  x: number; // percentage coordinate 0 to 100
  y: number; // percentage coordinate 0 to 100
  description: string;
  category: 'stage' | 'exhibition' | 'food_shop' | 'event';
  createdAt?: string;
}

export interface Review {
  id: number;
  spotId: number;
  rating: number; // 1 to 5
  comment: string;
  author: string;
  role: '1年生' | '2年生' | '3年生' | '教職員' | '保護者' | 'OB・OG' | '地域住民' | 'その他';
  category?: string;
  createdAt?: string;
}

export interface D1Database {
  // representation of CF D1 database binding
  prepare: (query: string) => any;
}
