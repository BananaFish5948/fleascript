-- =============================================
-- FleaScript — Supabase Schema (Pivot: Inventory)
-- =============================================

-- 1. 古いテーブルの廃止 (クリーンアップ)
DROP TABLE IF EXISTS generation_logs CASCADE;
DROP TABLE IF EXISTS share_logs CASCADE;
DROP TABLE IF EXISTS device_rate_limits CASCADE;
-- ip_rate_limits はスパム防御用として残す
-- DROP TABLE IF EXISTS ip_rate_limits CASCADE; 

-- 2. ユーザーテーブル (Supabase Authに紐づく形に変更)
-- 以前の users は Device ID を PK にしていたが、Auth 必須化に伴い auth.users(id) を参照する
CREATE TABLE IF NOT EXISTS public.users (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status text NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'standard', 'premium')),
  stripe_customer_id  text,
  preferences         jsonb DEFAULT '{"box_capacity": 20}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- 既存テーブルのアップデート（カラムが欠落している場合や、制約が古い場合をケア）
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"box_capacity": 20}'::jsonb;

-- 既存の古い CHECK 制約を削除し、新しいプラン (standard) を含む制約で上書きする
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_subscription_status_check;
ALTER TABLE public.users ADD CONSTRAINT users_subscription_status_check 
CHECK (subscription_status IN ('free', 'standard', 'premium'));

-- IPごとの1日あたりリクエスト数を管理するテーブル（悪意のある連投ブロック用・既存流用）
CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address   text NOT NULL,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  count        int  NOT NULL DEFAULT 1,
  CONSTRAINT ip_rate_limits_ip_date_unique UNIQUE (ip_address, date)
);

-- 3. 在庫・利益・保管箱管理テーブル (新設)
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name         text NOT NULL,
  purchase_price    integer DEFAULT 0,
  target_price      integer DEFAULT 0,
  postage           integer DEFAULT 0,
  fee_rate          numeric(5,2) DEFAULT 10.00, -- 手数料率 (例: 10.00 = 10%)
  box_number        text,
  status            text DEFAULT 'hand' CHECK (status IN ('hand', 'mercari', 'yahoo', 'sold')),
  location_tag      text DEFAULT 'home',
  description_stock text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- トリガー用関数: updated_at の自動更新
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 既存テーブルのアップデート（カラムが欠落している場合をケア）
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS location_tag text DEFAULT 'home';

DROP TRIGGER IF EXISTS inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 4. システム設定・進捗管理テーブル (新設)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id                  text PRIMARY KEY DEFAULT 'global',
  roadmap_progress    integer NOT NULL DEFAULT 35,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 初期データの投入
INSERT INTO public.app_settings (id, roadmap_progress)
VALUES ('global', 35)
ON CONFLICT (id) DO NOTHING;


-- =============================================
-- RLS (Row Level Security) 設定
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- app_settings ポリシー (誰でも読み取り可能)
DROP POLICY IF EXISTS "Anyone can view app_settings" ON public.app_settings;
CREATE POLICY "Anyone can view app_settings" 
ON public.app_settings FOR SELECT 
USING (true);

-- users ポリシー (自分自身のデータのみ参照・更新可能)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- inventory_items ポリシー (自分自身の在庫のみCRUD可能)
DROP POLICY IF EXISTS "Users can view own inventory" ON public.inventory_items;
CREATE POLICY "Users can view own inventory" 
ON public.inventory_items FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own inventory" ON public.inventory_items;
CREATE POLICY "Users can insert own inventory" 
ON public.inventory_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own inventory" ON public.inventory_items;
CREATE POLICY "Users can update own inventory" 
ON public.inventory_items FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own inventory" ON public.inventory_items;
CREATE POLICY "Users can delete own inventory" 
ON public.inventory_items FOR DELETE 
USING (auth.uid() = user_id);

-- =============================================
-- Storage バケットとポリシーの設定
-- =============================================

-- 'temporary_shares' バケットを作成（既に存在する場合は無視）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('temporary_shares', 'temporary_shares', true)
ON CONFLICT (id) DO NOTHING;

-- 'temporary_shares' バケットの公開読み取りポリシー
DROP POLICY IF EXISTS "Public access for temporary_shares" ON storage.objects;
CREATE POLICY "Public access for temporary_shares" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'temporary_shares');

-- 'temporary_shares' バケットの挿入・更新ポリシー (スパム迎撃用制限付き)
-- 1. ファイルサイズ 1MB以下
-- 2. 拡張子が .jpg または .png
-- 3. ファイル名は `[ユーザーID]/monthly_report.jpg` または `.png`
DROP POLICY IF EXISTS "Users can upload own monthly report" ON storage.objects;
CREATE POLICY "Users can upload own monthly report" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'temporary_shares' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1] 
  AND (name LIKE '%/monthly_report.jpg' OR name LIKE '%/monthly_report.png')
  AND (LENGTH(COALESCE(metadata->>'size', '0')::text) <= 1048576) -- 1MB
);

DROP POLICY IF EXISTS "Users can update own monthly report" ON storage.objects;
CREATE POLICY "Users can update own monthly report" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'temporary_shares' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK (
  bucket_id = 'temporary_shares' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1] 
  AND (name LIKE '%/monthly_report.jpg' OR name LIKE '%/monthly_report.png')
  AND (LENGTH(COALESCE(metadata->>'size', '0')::text) <= 1048576) -- 1MB
);
