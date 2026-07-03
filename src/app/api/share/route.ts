import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RLSをバイパスするAdminクライアントを生成（確実なDB操作のため）
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 現在のpreferencesを取得
  const { data: userData, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('preferences, subscription_status')
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const currentPrefs = userData?.preferences || { box_capacity: 20 };
  const currentBonus = currentPrefs.bonus_slots || 0;

  if (currentBonus >= 1) {
    return NextResponse.json({ error: 'Bonus already claimed' }, { status: 400 });
  }
  
  const updatedPrefs = {
    ...currentPrefs,
    bonus_slots: 1
  };

  if (userData) {
    // 既存レコード更新
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ preferences: updatedPrefs })
      .eq('id', user.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  } else {
    // 新規レコード作成
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: user.id,
        preferences: updatedPrefs,
        subscription_status: 'free'
      });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, bonus_slots: updatedPrefs.bonus_slots });
}
