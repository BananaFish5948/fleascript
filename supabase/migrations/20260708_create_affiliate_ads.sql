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
    'ネコポス＆ゆうパケット対応ダンボール箱 50枚セット', 
    '「発送サイズオーバーで送料が高くなった…」という失敗を防ぐ、メルカリ適合サイズ。まとめ買いで1枚あたりコスト最安に！', 
    '約 ￥2,500', 
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80', 
    'https://www.amazon.co.jp/s?k=%E3%83%8D%E3%82%B3%E3%83%9D%E3%82%B9+%E3%83%80%E3%83%B3%E3%83%9C%E3%83%BC%E3%83%AB', 
    'shipping', 
    ARRAY['ネコポス', 'ゆうパケット', 'ゆうパケットポスト', 'ゆうパケットポストmini', 'クリックポスト']
  ),
  (
    'ad-box-compact', 
    '宅急便コンパクト＆ゆうパケットプラス専用BOX 20枚セット', 
    '厚みのある衣類や雑貨の発送に必須。まとめて購入することで、直前にコンビニ等で高値で買い足す手間を省きます。', 
    '約 ￥1,400', 
    'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80', 
    'https://www.amazon.co.jp/s?k=%E5%AE%85%E6%80%A5%E4%BE%BF%E3%82%B3%E3%83%B3%E3%83%91%E3%82%AF%E3%83%88+%E5%B0%82%E7%94%A8BOX', 
    'shipping', 
    ARRAY['宅急便コンパクト', 'ゆうパケットプラス']
  ),
  (
    'ad-box-60size',
    'ダンボール箱 60サイズ (無地・組み立てカンタン) 10枚セット',
    '3辺合計60cm以内の配送に対応。引っ越しや書籍、小さめの衣服の発送に。まとめ買いで梱包コストを賢く削減しましょう！',
    '約 ￥1,200',
    'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80',
    'https://www.amazon.co.jp/s?k=%E3%83%80%E3%83%B3%E3%83%9C%E3%83%BC%E3%83%AB+60%E3%82%B5%E3%82%A4%E3%82%BA',
    'shipping',
    ARRAY['宅急便60サイズ', 'ゆうパック60サイズ']
  ),
  (
    'ad-measure', 
    '厚さ測定定規 (1cm/2cm/3cm対応) アクリル製', 
    '発送前の厚みオーバーを確実に防止！郵便局やコンビニのレジで突き返されるあの「気まずいストレス」から永久に解放されます。', 
    '約 ￥800', 
    'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&q=80', 
    'https://www.amazon.co.jp/s?k=%E5%8E%9A%E3%81%95%E6%B8%AC%E5%AE%9A%E5%AE%9A%E8%A6%8F', 
    'dashboard', 
    NULL
  ),
  (
    'ad-opp', 
    'OPP袋 A4サイズ テープ付き 100枚入り', 
    '雨の日の水濡れ防止に必須！商品を綺麗に包むだけで、購入者の第一印象がアップし高評価率が高まります。', 
    '約 ￥600', 
    'https://images.unsplash.com/photo-1586528116311-ad8ed716d40f?w=400&q=80', 
    'https://www.amazon.co.jp/s?k=OPP%E8%A2%8B+A4', 
    'dashboard', 
    NULL
  ),
  (
    'ad-light', 
    'LEDリングライト 撮影用 スマホスタンド付き', 
    '暗い部屋でも商品写真のクオリティが劇的にアップ！明るく魅力的な写真に仕上げて、即売却スピードを高めましょう。', 
    '約 ￥2,000', 
    'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=400&q=80', 
    'https://www.amazon.co.jp/s?k=LED%E3%83%AA%E3%83%B3%E3%82%B0%E3%83%A9%E3%82%A4%E3%83%88', 
    'dashboard', 
    NULL
  )
ON CONFLICT (id) DO NOTHING;
