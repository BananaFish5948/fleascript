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
  subscription_status text NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  stripe_customer_id  text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

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

DROP TRIGGER IF EXISTS inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =============================================
-- RLS (Row Level Security) 設定
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- users ポリシー (自分自身のデータのみ参照・更新可能)
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- inventory_items ポリシー (自分自身の在庫のみCRUD可能)
CREATE POLICY "Users can view own inventory" 
ON public.inventory_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" 
ON public.inventory_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" 
ON public.inventory_items FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" 
ON public.inventory_items FOR DELETE 
USING (auth.uid() = user_id);
