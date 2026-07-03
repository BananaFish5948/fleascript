import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const ssrClient = await createClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { targetPlan } = await req.json();
    if (targetPlan !== 'standard' && targetPlan !== 'premium') {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 既に指定のプランかどうかをチェックする
    const { data: dbUser } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    if (dbUser?.subscription_status === targetPlan) {
      return NextResponse.json({ error: 'すでにこのプランに加入しています。' }, { status: 400 });
    }

    // モック用の決済成功処理: ログインユーザーの subscription_status を targetPlan に更新
    const { error } = await supabase
      .from('users')
      .update({ subscription_status: targetPlan })
      .eq('id', user.id);

    if (error) {
      console.error('[checkout-mock] Supabase error:', error.message);
      return NextResponse.json({ error: `Failed to update subscription status: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[checkout-mock] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
