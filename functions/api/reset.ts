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

    // Clear all existing spots and reviews to leave the database completely blank and fresh!
    await DB.prepare("DELETE FROM rindou_kuchikomi_reviews").bind().run();
    await DB.prepare("DELETE FROM rindou_kuchikomi_spots").bind().run();

    return new Response(JSON.stringify({ success: true, message: "Database tables cleared completely." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
