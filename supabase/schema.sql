-- =============================================
-- FleaScript — Supabase Schema
-- =============================================

-- ユーザー（デバイス）とサブスクリプション状況を管理するテーブル
CREATE TABLE IF NOT EXISTS users (
  id                  uuid PRIMARY KEY, -- クライアント側で生成するDevice ID (UUID)
  subscription_status text NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  stripe_customer_id  text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- デバイスID（ユーザー）ごとの1日あたりリクエスト数を管理するテーブル
CREATE TABLE IF NOT EXISTS device_rate_limits (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  count        int  NOT NULL DEFAULT 1,
  CONSTRAINT device_rate_limits_device_date_unique UNIQUE (device_id, date)
);

-- IPごとの1日あたりリクエスト数を管理するテーブル（悪意のある連投ブロック用）
CREATE TABLE IF NOT EXISTS ip_rate_limits (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address   text NOT NULL,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  count        int  NOT NULL DEFAULT 1,
  CONSTRAINT ip_rate_limits_ip_date_unique UNIQUE (ip_address, date)
);

-- 全生成リクエストのログテーブル
CREATE TABLE IF NOT EXISTS generation_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  ip_address      text,
  input_text      text,
  output_text     text,
  feedback        text CHECK (feedback IN ('positive', 'negative')),
  feedback_reason text CHECK (feedback_reason IN ('文体', 'スペック', 'ハッシュタグ', 'その他')),
  user_complaint  text, -- フッターからの1行クレーム
  ad_click_count  int NOT NULL DEFAULT 0,
  platform        text DEFAULT 'mercari'
);

-- ※既存のテーブルにカラムを追加する場合のALTER文（初回移行用）
ALTER TABLE generation_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE generation_logs ADD COLUMN IF NOT EXISTS user_complaint text;
ALTER TABLE generation_logs ADD COLUMN IF NOT EXISTS ad_click_count int NOT NULL DEFAULT 0;
ALTER TABLE generation_logs ADD COLUMN IF NOT EXISTS platform text DEFAULT 'mercari';

-- RLS: service_role 以外は操作禁止（anon による直接読み書きを防ぐ）
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_rate_limits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_rate_limits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs     ENABLE ROW LEVEL SECURITY;
