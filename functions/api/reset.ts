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

    // 1. Clear existing spots and reviews
    await DB.prepare("DELETE FROM rindou_kuchikomi_reviews").bind().run();
    await DB.prepare("DELETE FROM rindou_kuchikomi_spots").bind().run();

    // 2. Insert the 4 custom spots requested by the user
    // We insert them with explicit IDs to cleanly link the initial reviews
    const spotsToInsert = [
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

    for (const spot of spotsToInsert) {
      await DB.prepare(
        "INSERT INTO rindou_kuchikomi_spots (id, name, x, y, description, category) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(spot.id, spot.name, spot.x, spot.y, spot.description, spot.category)
        .run();
    }

    // 3. Insert matching beautiful reviews for a full and colorful design presentation
    const reviewsToInsert = [
      {
        spotId: 1,
        rating: 5,
        comment: "合唱コンクールの金賞を目指して毎日練習した成果が本番で発揮できました！体育館の響きも綺麗で最高の思い出です！",
        author: "りんどうっ子",
        role: "3年生"
      },
      {
        spotId: 2,
        rating: 5,
        comment: "教室の窓ガラス一面に広がるステンドグラス風モザイクに感動しました。生徒の細かい作業努力が目に浮かび涙が出そうです。",
        author: "ちくまのファン",
        role: "保護者"
      },
      {
        spotId: 3,
        rating: 4,
        comment: "おやきの野沢菜味が、モチモチの皮とピリ辛の具で絶品でした！友達と芝生に座っておしゃべりしながら美味しく食べました。",
        author: "おやき大好き",
        role: "2年生"
      },
      {
        spotId: 4,
        rating: 5,
        comment: "美術部の巨大絵画の迫力がすごいです。書道パフォーマンスの文字も力強く、エネルギーをもらいました。",
        author: "ちくまの風",
        role: "教職員"
      }
    ];

    for (const rev of reviewsToInsert) {
      await DB.prepare(
        "INSERT INTO rindou_kuchikomi_reviews (spot_id, rating, comment, author, role) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(rev.spotId, rev.rating, rev.comment, rev.author, rev.role)
        .run();
    }

    return new Response(JSON.stringify({ success: true, message: "Default database configuration restored successfully." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
