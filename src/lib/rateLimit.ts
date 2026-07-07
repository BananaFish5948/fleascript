import { createAdminClient } from './supabase/admin'

const STANDARD_LIMIT = 1;
const PREMIUM_LIMIT = 3;

// 開発者モード用の一時的なインメモリキャッシュ（リロードで復帰）
export const devRateLimits = new Map<string, number>();

export async function checkRateLimit(
  ip: string,
  userId?: string | null
): Promise<{ allowed: boolean; remaining: number; isPremium: boolean; lockReason?: string }> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // 枠のデフォルト（無料プランは現状 0 枠と設定）
  let limit = 0; 
  let isPremium = false;

  if (userId) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', userId)
      .maybeSingle();
      
    if (dbUser?.subscription_status === 'premium') {
      limit = PREMIUM_LIMIT;
      isPremium = true;
    } else if (dbUser?.subscription_status === 'standard') {
      limit = STANDARD_LIMIT;
    }
  }

  // IPベースでのロックチェックおよびカウント取得
  const { data: ipData } = await supabase
    .from('ip_rate_limits')
    .select('count, consecutive_failures, locked_until')
    .eq('ip_address', ip)
    .eq('date', today)
    .maybeSingle();

  // 3回連続失敗による15分ロックの確認
  if (ipData?.locked_until) {
    const lockTime = new Date(ipData.locked_until).getTime();
    if (Date.now() < lockTime) {
      return { 
        allowed: false, 
        remaining: 0, 
        isPremium, 
        lockReason: '連続で解析に失敗したため、15分間のクールダウン中です。しばらく経ってから再度お試しください。' 
      };
    }
  }

  const currentCount = ipData?.count ?? 0;
  if (currentCount >= limit) {
    return { 
      allowed: false, 
      remaining: 0, 
      isPremium, 
      lockReason: '本日の画像解析の利用枠の上限に達しました。' 
    };
  }

  // 成功時のみカウントを進める仕様のため、ここでは事前のチェックのみを行う
  return { allowed: true, remaining: limit - currentCount, isPremium };
}

/**
 * 解析の成否に応じて利用枠（count）や連続失敗回数を記録・更新する。
 * 成功時は count を +1 し、失敗時は consecutive_failures を +1 する。
 * 3回連続失敗した場合は15分間のロック（locked_until）をセットする（枠消費ロールバックの実現）。
 */
export async function recordAnalysisResult(ip: string, success: boolean) {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  
  const { data: ipData } = await supabase
    .from('ip_rate_limits')
    .select('count, consecutive_failures')
    .eq('ip_address', ip)
    .eq('date', today)
    .maybeSingle();
    
  let count = ipData?.count ?? 0;
  let failures = ipData?.consecutive_failures ?? 0;
  let lockedUntil = null;
  
  if (success) {
    count += 1;
    failures = 0; // 成功で連続失敗リセット
  } else {
    failures += 1;
    if (failures >= 3) {
      // 15分ロック
      lockedUntil = new Date(Date.now() + 15 * 60000).toISOString();
    }
  }
  
  await supabase
    .from('ip_rate_limits')
    .upsert({
      ip_address: ip,
      date: today,
      count,
      consecutive_failures: failures,
      locked_until: lockedUntil
    }, { onConflict: 'ip_address,date' });
}

export async function checkBncRateLimit(
  ip: string,
  subscriptionStatus: string
): Promise<{ allowed: boolean; remaining: number; lockReason?: string }> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const bncIp = `${ip}_bnc`;

  let limit = 0;
  if (subscriptionStatus === 'premium') {
    limit = 30;
  } else if (subscriptionStatus === 'standard') {
    limit = 10;
  }

  const { data: ipData } = await supabase
    .from('ip_rate_limits')
    .select('count')
    .eq('ip_address', bncIp)
    .eq('date', today)
    .maybeSingle();

  const currentCount = ipData?.count ?? 0;
  if (currentCount >= limit) {
    return { 
      allowed: false, 
      remaining: 0, 
      lockReason: '本日の対話境界線ヘルパーの利用枠の上限に達しました。' 
    };
  }

  return { allowed: true, remaining: limit - currentCount };
}

export async function recordBncAnalysisResult(ip: string) {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const bncIp = `${ip}_bnc`;

  const { data: ipData } = await supabase
    .from('ip_rate_limits')
    .select('count')
    .eq('ip_address', bncIp)
    .eq('date', today)
    .maybeSingle();

  let count = ipData?.count ?? 0;
  count += 1;

  await supabase
    .from('ip_rate_limits')
    .upsert({
      ip_address: bncIp,
      date: today,
      count,
      consecutive_failures: 0
    }, { onConflict: 'ip_address,date' });
}
