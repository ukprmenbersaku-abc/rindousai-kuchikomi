-- D1 Database Schema Setup for Matsumoto Chikumano JHS Rindo Festival
-- Run: npx wrangler d1 execute <DATABASE_NAME> --file=./functions/schema.sql --local (or --remote)

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS spots;

CREATE TABLE IF NOT EXISTS spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);

-- Seed defaults corresponding to Chikumano JHS Rindo Festival
INSERT INTO spots (id, name, x, y, description, category) VALUES 
(1, '第1体育館 (メインステージ)', 42.5, 35.0, 'オープニングセレモニー、合唱コンクール、吹奏楽部の演奏、有志による演劇やダンスなど、りんどう祭の熱気が最高潮に達する特設ステージです！', 'stage'),
(2, '3階 2年A組教室 (ステンドグラス光のアート)', 22.0, 55.5, 'クラス全員で1枚ずつ心を込めて作った色透明フィルムのモザイクアート展示。陽の光が差し込むと教室全体が万華鏡のように輝きます。', 'exhibition'),
(3, '中庭テント (PTAバザー＆松本おやき模擬店)', 62.5, 72.0, '松本名物の「おやき(あんこ・きんぴら)」やフランクフルト、冷たいジュースを販売しています。中庭の青空テーブルで一休みしていきませんか？', 'food_shop'),
(4, '多目的ホール (美術部・書道部 合同作品展)', 81.3, 28.5, '美術部が描いた巨大な共同制作絵画と、書道部が大きな紙に力強く書き上げたパフォーマンス作品をメイン展示。圧巻のアート空間です。', 'exhibition');

INSERT INTO reviews (spot_id, rating, comment, author, role) VALUES
(1, 5, '合唱コンクールの金賞を目指して毎日練習した成果が本番で発揮できました！体育館の響きも綺麗で最高の思い出です！', 'りんどうっ子', '3年生'),
(2, 5, '教室の窓ガラス一面に広がるステンドグラス風モザイクに感動しました。生徒の細かい作業努力が目に浮かび涙が出そうです。', 'ちくまのファン', '保護者'),
(3, 4, 'おやきの野沢菜味が、モチモチの皮とピリ辛の具で絶品でした！友達と芝生に座っておしゃべりしながら美味しく食べました。', 'おやき大好き', '2年生'),
(4, 5, '先輩達の作品のレベルが高すぎて驚きました！書道部のダイナミックな文字の勢いは本当にかっこいいです。', 'アート同好会', '1年生');
