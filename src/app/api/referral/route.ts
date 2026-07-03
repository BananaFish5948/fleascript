import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: '無効なコードです' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    // 現在のユーザー情報を取得
    const { data: currentUserData } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (!currentUserData) {
      return NextResponse.json({ error: 'ユーザーデータが見つかりません' }, { status: 404 });
    }

    const currentPreferences = currentUserData.preferences || {};

    // 既に紹介コードを使用済みかチェック
    if (currentPreferences.referred_by) {
      return NextResponse.json({ error: '紹介コードは1人1回までしか使用できません' }, { status: 400 });
    }

    // 自分のコードを使おうとしていないかチェック
    if (currentPreferences.referral_code === code) {
      return NextResponse.json({ error: '自分の紹介コードは使用できません' }, { status: 400 });
    }

    // 招待者の検索
    const { data: referrerData, error: referrerError } = await supabase
      .from('users')
      .select('id, preferences')
      .contains('preferences', { referral_code: code })
      .single();

    if (referrerError || !referrerData) {
      return NextResponse.json({ error: '有効な紹介コードが見つかりません' }, { status: 404 });
    }

    const referrerPreferences = referrerData.preferences || {};

    // 双方向にボーナスを付与 (+3枠に変更)
    const BONUS_AMOUNT = 3;
    
    // 現在のユーザーのpreferences更新
    const newCurrentPreferences = {
      ...currentPreferences,
      referred_by: code,
      bonus_slots: (currentPreferences.bonus_slots || 0) + BONUS_AMOUNT
    };

    // 招待者のpreferences更新
    const newReferrerPreferences = {
      ...referrerPreferences,
      bonus_slots: (referrerPreferences.bonus_slots || 0) + BONUS_AMOUNT
    };

    // DB更新 (トランザクションがベストだが簡易的に直列実行)
    await supabase.from('users').update({ preferences: newCurrentPreferences }).eq('id', user.id);
    await supabase.from('users').update({ preferences: newReferrerPreferences }).eq('id', referrerData.id);

    return NextResponse.json({ success: true, message: '紹介コードが適用され、枠が50追加されました！' });
  } catch (error: any) {
    console.error('Referral error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
