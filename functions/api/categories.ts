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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;
    
    // Auto-create table if not exists for flawless zero-config database upgrades
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS rindou_kuchikomi_categories (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `).bind().run();

    const { results } = await DB.prepare("SELECT * FROM rindou_kuchikomi_categories").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;
    const data: any = await context.request.json();
    const { id, label, color } = data;

    if (!id || !label || !color) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Auto-create table if not exists
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS rindou_kuchikomi_categories (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `).bind().run();

    await DB.prepare(
      "INSERT INTO rindou_kuchikomi_categories (id, label, color) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET label=excluded.label, color=excluded.color"
    )
      .bind(id, label, color)
      .run();

    return new Response(JSON.stringify({ success: true, category: { id, label, color } }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing category id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Auto-create table if not exists
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS rindou_kuchikomi_categories (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `).bind().run();

    await DB.prepare("DELETE FROM rindou_kuchikomi_categories WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
