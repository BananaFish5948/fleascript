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
    if (!['free', 'standard', 'premium'].includes(targetPlan)) {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // モック用のプラン変更処理: ログインユーザーの subscription_status を更新
    const { error } = await supabase
      .from('users')
      .update({ subscription_status: targetPlan })
      .eq('id', user.id);

    if (error) {
      console.error('[change-plan-mock] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[change-plan-mock] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
