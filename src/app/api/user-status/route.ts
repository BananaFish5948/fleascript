import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const FREE_LIMIT = 3;
const PREMIUM_LIMIT = 500; // 仕様変更: 無制限ではなく500件上限

export async function GET(req: NextRequest) {
  const ssrClient = await createClient();
  const { data: { user } } = await ssrClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ remaining: 0, isPremium: false, isLoggedIn: false });
  }

  const { data: dbUser } = await ssrClient
    .from('users')
    .select('subscription_status')
    .eq('id', user.id)
    .maybeSingle();

  const isPremium = dbUser?.subscription_status === 'premium';
  const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

  // inventory_items に登録されている現在の在庫数をカウント
  const { count } = await ssrClient
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  const currentCount = count ?? 0;
  return NextResponse.json({ remaining: Math.max(0, limit - currentCount), isPremium, isLoggedIn: true });
}
