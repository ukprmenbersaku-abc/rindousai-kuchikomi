/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface Env {
  DB: {
    prepare: (sql: string) => {
      bind: (...args: any[]) => {
        all: <T = any>() => Promise<{ results: T[] }>;
        run: () => Promise<{ success: boolean; meta: any }>;
        first: <T = any>() => Promise<T | null>;
      };
      all: <T = any>() => Promise<{ results: T[] }>;
    };
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;

    // 1. Delete all reviews (completely blank review list as requested)
    await DB.prepare("DELETE FROM rindou_kuchikomi_reviews").bind().run();

    // 2. Delete all spots (including the 4 default ones, making it fully blank and fresh)
    await DB.prepare("DELETE FROM rindou_kuchikomi_spots").bind().run();

    // 3. Delete all custom categories
    try {
      await DB.prepare("DELETE FROM rindou_kuchikomi_categories").bind().run();
    } catch (_) {
      // Ignored if table doesn't exist yet
    }

    // 4. Delete all timetable events
    try {
      await DB.prepare("DELETE FROM rindou_timetable").bind().run();
    } catch (_) {
      // Ignored if table doesn't exist yet
    }

    // 5. Delete all members/committees
    try {
      await DB.prepare("DELETE FROM rindou_members").bind().run();
    } catch (_) {
      // Ignored if table doesn't exist yet
    }

    return new Response(JSON.stringify({ success: true, message: "Database completely cleared." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
