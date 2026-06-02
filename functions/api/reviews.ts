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
    const url = new URL(context.request.url);
    const spotId = url.searchParams.get("spotId");

    let query = "SELECT * FROM rindou_kuchikomi_reviews ORDER BY id DESC";
    let stmt;

    if (spotId) {
      query = "SELECT * FROM rindou_kuchikomi_reviews WHERE spot_id = ? ORDER BY id DESC";
      stmt = DB.prepare(query).bind(spotId);
    } else {
      stmt = DB.prepare(query);
    }

    const { results } = await stmt.all();

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
    const { spotId, rating, comment, author, role } = data;

    if (!spotId || !rating || !comment || !author || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert review and return the inserted row
    const info = await DB.prepare(
      "INSERT INTO rindou_kuchikomi_reviews (spot_id, rating, comment, author, role) VALUES (?, ?, ?, ?, ?) RETURNING *"
    )
      .bind(spotId, rating, comment, author, role)
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
