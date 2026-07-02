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

    // モック用の解約処理: ログインユーザーの subscription_status を 'free' にダウングレードする
    const { error } = await supabase
      .from('users')
      .upsert(
        { id: user.id, subscription_status: 'free' },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('[cancel-subscription-mock] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[cancel-subscription-mock] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
