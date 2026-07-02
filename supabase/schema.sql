-- =============================================
-- FleaScript — Supabase Schema
-- =============================================

-- IPごとの1日あたりリクエスト数を管理するテーブル
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
  ip_address      text,
  input_text      text,
  output_text     text,
  feedback        text CHECK (feedback IN ('positive', 'negative')),
  feedback_reason text CHECK (feedback_reason IN ('文体', 'スペック', 'ハッシュタグ', 'その他'))
);

-- RLS: service_role 以外は操作禁止（anon による直接読み書きを防ぐ）
ALTER TABLE ip_rate_limits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
