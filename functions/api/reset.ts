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

    // 2. Delete custom spots (ID > 4 or any non-default spots)
    await DB.prepare("DELETE FROM rindou_kuchikomi_spots WHERE id > 4").bind().run();

    // 3. Make sure the 4 default essential spots are preserved and verified
    const spotsToEnsure = [
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

    for (const spot of spotsToEnsure) {
      // Use INSERT OR IGNORE / INSERT OR REPLACE with explicit IDs to make sure they exist
      await DB.prepare(
        "INSERT INTO rindou_kuchikomi_spots (id, name, x, y, description, category) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, x=excluded.x, y=excluded.y, description=excluded.description, category=excluded.category"
      )
        .bind(spot.id, spot.name, spot.x, spot.y, spot.description, spot.category)
        .run();
    }

    return new Response(JSON.stringify({ success: true, message: "Database reviews and custom spots cleared, default spots preserved." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
