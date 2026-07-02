import { createServerClient } from './supabase'

const DAILY_LIMIT = parseInt(process.env.RATE_LIMIT_PER_DAY ?? '3', 10)

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createServerClient()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data, error } = await supabase
    .from('ip_rate_limits')
    .select('count')
    .eq('ip_address', ip)
    .eq('date', today)
    .maybeSingle()

  if (error) {
    // DBエラー時はユーザーをブロックしない（コスト優先でなく可用性優先）
    console.error('[rateLimit] Supabase error:', error.message)
    return { allowed: true, remaining: DAILY_LIMIT }
  }

  const currentCount = data?.count ?? 0

  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  // カウントをインクリメント（存在しない場合は INSERT、存在する場合は UPDATE）
  await supabase
    .from('ip_rate_limits')
    .upsert(
      { ip_address: ip, date: today, count: currentCount + 1 },
      { onConflict: 'ip_address,date' }
    )

  return { allowed: true, remaining: DAILY_LIMIT - (currentCount + 1) }
}
