-- =======================================================
-- FleaScript — Create affiliate_ads Table & Seed Data
-- =======================================================

-- 1. アフィリエイト広告管理テーブルの作成
CREATE TABLE IF NOT EXISTS public.affiliate_ads (
  id            text PRIMARY KEY, -- 例: 'ad-box-nekoposu' などの一意キー
  title         text NOT NULL,
  description   text NOT NULL,
  price_text    text,
  image_url     text NOT NULL,
  affiliate_url text NOT NULL,
  context       text NOT NULL CHECK (context IN ('shipping', 'dashboard', 'general')),
  size_target   text[], -- 配送サイズ用の配列 (例: ['ネコポス', 'クリックポスト'])
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 2. RLS (Row Level Security) 設定
ALTER TABLE public.affiliate_ads ENABLE ROW LEVEL SECURITY;

-- 3. ポリシー設定 (誰でも閲覧可能、変更は管理者のみ。認証・RLSバイパスでAPIから変更するためSELECTのみ)
DROP POLICY IF EXISTS "Anyone can view affiliate_ads" ON public.affiliate_ads;
CREATE POLICY "Anyone can view affiliate_ads" 
ON public.affiliate_ads FOR SELECT 
USING (true);

-- 4. 初期テストデータの投入
INSERT INTO public.affiliate_ads (id, title, description, price_text, image_url, affiliate_url, context, size_target)
VALUES 
  (
    'ad-box-nekoposu', 
    '【Amazon.co.jp限定】ネコポス用ダンボール箱 (A4サイズ・厚さ3cm以内) 50枚セット', 
    'メルカリのネコポスやゆうパケットに完全対応。組み立てカンタンでテープ不要の設計です。', 
    '約 ￥2,500', 
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80', 
    'https://www.amazon.co.jp/', 
    'shipping', 
    ARRAY['ネコポス', 'ゆうパケットポスト', 'クリックポスト']
  ),
  (
    'ad-box-compact', 
    '宅急便コンパクト 専用BOX 20枚セット', 
    '少し厚みのある衣類や雑貨の発送に必須。まとめて買えば1枚あたりのコストを抑えられます。', 
    '約 ￥1,400', 
    'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80', 
    'https://www.amazon.co.jp/', 
    'shipping', 
    ARRAY['宅急便コンパクト']
  ),
  (
    'ad-measure', 
    '厚さ測定定規 (1cm/2cm/3cm対応) アクリル製', 
    '発送前の厚さオーバーを防止！コンビニや郵便局で突き返されるストレスをなくします。', 
    '約 ￥800', 
    'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&q=80', 
    'https://www.amazon.co.jp/', 
    'dashboard', 
    NULL
  ),
  (
    'ad-opp', 
    'OPP袋 A4サイズ テープ付き 100枚入り', 
    '水濡れ防止の必須アイテム。Tシャツや書籍の梱包を美しく仕上げ、良い評価に繋がります。', 
    '約 ￥600', 
    'https://images.unsplash.com/photo-1586528116311-ad8ed716d40f?w=400&q=80', 
    'https://www.amazon.co.jp/', 
    'dashboard', 
    NULL
  ),
  (
    'ad-light', 
    'LEDリングライト 撮影用 スマホスタンド付き', 
    '商品写真のクオリティが劇的にアップ！明るく綺麗な写真で売却スピードを上げましょう。', 
    '約 ￥2,000', 
    'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=400&q=80', 
    'https://www.amazon.co.jp/', 
    'dashboard', 
    NULL
  )
ON CONFLICT (id) DO NOTHING;
