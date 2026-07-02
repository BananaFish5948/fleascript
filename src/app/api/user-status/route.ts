import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const FREE_LIMIT = 3;
const PREMIUM_LIMIT = 50;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId');
  const ip = req.headers.get('x-real-ip') ?? '127.0.0.1';
  const isDevMode = req.cookies.has('FLEA_DEV_MODE');

  if (isDevMode) {
    return NextResponse.json({ remaining: 9999, isPremium: true });
  }

  const supabase = createAdminClient();
  const ssrClient = await createClient(); // Need to import this
  const today = new Date().toISOString().slice(0, 10);

  let limit = FREE_LIMIT;
  let isPremium = false;

  const { data: { user } } = await ssrClient.auth.getUser();

  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    if (dbUser?.subscription_status === 'premium') {
      limit = PREMIUM_LIMIT;
      isPremium = true;
    }
  }

  if (deviceId) {
    const { data } = await supabase
      .from('device_rate_limits')
      .select('count')
      .eq('device_id', deviceId)
      .eq('date', today)
      .maybeSingle();

    const currentCount = data?.count ?? 0;
    return NextResponse.json({ remaining: Math.max(0, limit - currentCount), isPremium, isLoggedIn: !!user });
  } else {
    // If no deviceId yet, fallback to IP count
    const { data } = await supabase
      .from('ip_rate_limits')
      .select('count')
      .eq('ip_address', ip)
      .eq('date', today)
      .maybeSingle();

    const currentCount = data?.count ?? 0;
    return NextResponse.json({ remaining: Math.max(0, limit - currentCount), isPremium, isLoggedIn: !!user });
  }
}
