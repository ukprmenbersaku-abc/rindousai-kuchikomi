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
    const { results } = await DB.prepare("SELECT * FROM rindou_kuchikomi_spots ORDER BY id DESC").all();
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
    const { name, x, y, description, category } = data;

    if (!name || x === undefined || y === undefined || !category) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const info = await DB.prepare(
      "INSERT INTO rindou_kuchikomi_spots (name, x, y, description, category) VALUES (?, ?, ?, ?, ?) RETURNING *"
    )
      .bind(name, x, y, description || "", category)
      .first();

    return new Response(JSON.stringify(info), {
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
      return new Response(JSON.stringify({ error: "Missing spot id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Protect initial 4 essential spots from being manually deleted
    const numericId = parseInt(id, 10);
    if (numericId >= 1 && numericId <= 4) {
      return new Response(JSON.stringify({ error: "基本の4スポット（メインステージ、ステンドグラス、模擬店、美術書道展）は保護されているため削除できません。" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete spot (cascades or handle reviews manually in database schema/queries)
    await DB.prepare("DELETE FROM rindou_kuchikomi_reviews WHERE spot_id = ?").bind(id).run();
    await DB.prepare("DELETE FROM rindou_kuchikomi_spots WHERE id = ?").bind(id).run();

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
