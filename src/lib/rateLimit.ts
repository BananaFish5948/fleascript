import { createAdminClient } from './supabase/admin'

const FREE_LIMIT = 3;
const PREMIUM_LIMIT = 50;

// 開発者モード用の一時的なインメモリキャッシュ（リロードで復帰）
export const devRateLimits = new Map<string, number>();

export async function checkRateLimit(
  ip: string,
  deviceId?: string | null,
  isDevMode?: boolean,
  userId?: string | null,
  pageLoadId?: string | null
): Promise<{ allowed: boolean; remaining: number; isPremium: boolean }> {
  if (isDevMode && pageLoadId) {
    const currentCount = devRateLimits.get(pageLoadId) || 0;
    if (currentCount >= FREE_LIMIT) {
      return { allowed: false, remaining: 0, isPremium: false };
    }
    devRateLimits.set(pageLoadId, currentCount + 1);
    return { allowed: true, remaining: Math.max(0, FREE_LIMIT - (currentCount + 1)), isPremium: false };
  } else if (isDevMode) {
    return { allowed: true, remaining: 9999, isPremium: true };
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  let limit = FREE_LIMIT;
  let isPremium = false;
  let finalDeviceCount = 0;

  // ユーザーIDがある場合はプレミアム判定を優先
  if (userId) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', userId)
      .maybeSingle()
      
    if (dbUser?.subscription_status === 'premium') {
      limit = PREMIUM_LIMIT;
      isPremium = true;
    }
  }

  // 無料枠用の自己修復（deviceIdベース）
  if (deviceId && !userId) {
    const { data: user } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', deviceId)
      .maybeSingle()
    
    if (!user) {
      // ユーザーが存在しない場合は自己修復で作成
      await supabase
        .from('users')
        .upsert({ id: deviceId, subscription_status: 'free' }, { onConflict: 'id' });
    }
  }

  // シェアボーナス枠の確認
  if (deviceId && !isPremium) {
    const { data: shareLog } = await supabase
      .from('share_logs')
      .select('id')
      .eq('device_id', deviceId)
      .eq('date', today)
      .maybeSingle()

    if (shareLog) {
      limit += 1;
    }
  }

  // デバイス単位でのレート制限チェック
  if (deviceId) {
    const { data, error } = await supabase
      .from('device_rate_limits')
      .select('count')
      .eq('device_id', deviceId)
      .eq('date', today)
      .maybeSingle()

    if (error) {
      console.error('[rateLimit] Supabase error (device select):', error.message)
      // エラー時も安全側に倒さず許可してしまうのを防ぐため、仮の動作だが一旦許可しておく
      // 本番では適宜ハンドリングを変更
    }

    const currentCount = data?.count ?? 0
    if (currentCount >= limit) {
      return { allowed: false, remaining: 0, isPremium }
    }

    finalDeviceCount = currentCount + 1;

    const { error: upsertError } = await supabase
      .from('device_rate_limits')
      .upsert(
        { device_id: deviceId, date: today, count: finalDeviceCount },
        { onConflict: 'device_id,date' }
      )
      
    if (upsertError) {
      console.error('[rateLimit] Supabase error (device upsert):', upsertError.message)
    }
  }

  // IPアドレス単位での連投ブロック（予備）
  const { data: ipData } = await supabase
    .from('ip_rate_limits')
    .select('count')
    .eq('ip_address', ip)
    .eq('date', today)
    .maybeSingle()

  const ipCount = ipData?.count ?? 0
  // プレミアムユーザーが同IPにいる可能性を考慮しIP制限は少し緩めにするか、一旦同じlimitを使用
  if (ipCount >= Math.max(limit, 10)) { 
    return { allowed: false, remaining: 0, isPremium }
  }

  await supabase
    .from('ip_rate_limits')
    .upsert(
      { ip_address: ip, date: today, count: ipCount + 1 },
      { onConflict: 'ip_address,date' }
    )

  // deviceIdに基づく残りの回数を返す（deviceIdがない場合はIPの残り）
  if (deviceId) {
    return { allowed: true, remaining: Math.max(0, limit - finalDeviceCount), isPremium };
  }

  return { allowed: true, remaining: Math.max(0, limit - (ipCount + 1)), isPremium }
}
