-- =============================================
-- FleaScript — 本番環境セットアップ (Production Setup)
-- 必須テーブル (ip_rate_limits, feedback_logs) とセキュリティポリシー
-- =============================================

-- =============================================
-- 1. レートリミット (ip_rate_limits)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address           text NOT NULL,
  date                 date NOT NULL DEFAULT CURRENT_DATE,
  count                int  NOT NULL DEFAULT 1,
  consecutive_failures int NOT NULL DEFAULT 0,
  locked_until         timestamptz,
  CONSTRAINT ip_rate_limits_ip_date_unique UNIQUE (ip_address, date)
);

ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;

-- サービスロール（サーバー側のAPI Routes）からの操作を許可するため、
-- クライアント（匿名や一般ユーザー）からの直接操作は禁止（全て拒否）する設定が安全です。
-- ただし、Supabase Service Role Keyを使ってアクセスするAPI RoutesはRLSをバイパスします。
-- クライアントから直接参照・更新されるのを防ぐため、ポリシーはあえて設定しない（デフォルト拒否）。


-- =============================================
-- 2. フィードバックログ (feedback_logs)
-- =============================================
CREATE TABLE IF NOT EXISTS public.feedback_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- ログインしていれば紐付け
  rating      text NOT NULL CHECK (rating IN ('up', 'down')),    -- 👍 / 👎
  reason      text,                                              -- 選択式の理由
  comment     text,                                              -- 自由記述
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_logs ENABLE ROW LEVEL SECURITY;

-- 誰でも（匿名ユーザーでも）フィードバックを送信できるようにする
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback_logs;
CREATE POLICY "Anyone can insert feedback" 
ON public.feedback_logs FOR INSERT 
WITH CHECK (true);

-- 閲覧は管理画面からService Roleで行うため、クライアントからのSELECTは禁止
-- （ポリシーを作成しなければデフォルト拒否となるため安全）

-- =============================================
-- おまけ: 実行確認用出力
-- =============================================
SELECT 'Production tables (ip_rate_limits, feedback_logs) have been successfully created.' as status;
