import { createClient } from '@supabase/supabase-js'

/**
 * サーバーサイド専用 Supabase クライアント。
 * SERVICE_ROLE_KEY を使用するため、必ずサーバーコンポーネント / API Route 内でのみ呼ぶこと。
 * RLSをバイパスするため、厳密な管理が必要です。
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
