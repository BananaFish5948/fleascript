import { createClient } from '@supabase/supabase-js'

/**
 * サーバーサイド専用 Supabase クライアント。
 * SERVICE_ROLE_KEY を使用するため、必ずサーバーコンポーネント / API Route 内でのみ呼ぶこと。
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
