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

    const supabase = createAdminClient();

    // 既に Premium かどうかをチェックする
    const { data: dbUser } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    if (dbUser?.subscription_status === 'premium') {
      return NextResponse.json({ error: 'すでにプレミアムプランに加入しています。' }, { status: 400 });
    }

    // モック用の決済成功処理: ログインユーザーの subscription_status を 'premium' に更新
    const { error } = await supabase
      .from('users')
      .upsert(
        { id: user.id, subscription_status: 'premium' },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('[checkout-mock] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[checkout-mock] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
