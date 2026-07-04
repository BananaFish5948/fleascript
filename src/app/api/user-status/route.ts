import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';

const FREE_LIMIT = 3;
const PREMIUM_LIMIT = 500; // 仕様変更: 無制限ではなく500件上限

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-real-ip') ?? '127.0.0.1';
  const ssrClient = await createClient();
  const { data: { user } } = await ssrClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ remaining: 0, isPremium: false, isLoggedIn: false });
  }

  const { data: dbUser } = await ssrClient
    .from('users')
    .select('subscription_status, preferences')
    .eq('id', user.id)
    .maybeSingle();

  const subscriptionStatus = dbUser?.subscription_status || 'free';
  let preferences = dbUser?.preferences || { box_capacity: 20 };
  
  // referral_code の自動生成
  if (!preferences.referral_code) {
    const newCode = `ref_${user.id.substring(0, 8)}`;
    preferences = { ...preferences, referral_code: newCode };
    
    // DBを更新 (失敗してもエラーにはしない)
    await ssrClient
      .from('users')
      .update({ preferences })
      .eq('id', user.id);
  }

  const bonusSlots = preferences.bonus_slots || 0;

  let limit = FREE_LIMIT;
  if (subscriptionStatus === 'premium') limit = 500;
  else if (subscriptionStatus === 'standard') limit = 100;

  limit += bonusSlots; // ボーナス枠を加算

  const isPremium = subscriptionStatus === 'premium';

  // inventory_items に登録されている現在の在庫数をカウント
  const { count } = await ssrClient
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  const currentCount = count ?? 0;
  
  const rateLimitInfo = await checkRateLimit(ip, user.id);
  const imageAnalysisMax = isPremium ? 3 : (subscriptionStatus === 'standard' ? 1 : 0);

  return NextResponse.json({ 
    remaining: Math.max(0, limit - currentCount), 
    maxLimit: limit,
    isPremium, 
    subscriptionStatus, 
    preferences, 
    isLoggedIn: true,
    imageAnalysisRemaining: rateLimitInfo.remaining,
    imageAnalysisMax
  });
}
