import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// 補助：API内でのBasic認証二重チェック (Middlewareが万が一バイパスされた場合の防御策)
function checkAdminAuth(req: NextRequest): boolean {
  const basicAuth = req.headers.get('authorization');
  if (!basicAuth) return false;

  try {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');
    const expectedUser = process.env.ADMIN_USER;
    const expectedPass = process.env.ADMIN_PASS;
    return !!(expectedUser && expectedPass && user === expectedUser && pwd === expectedPass);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Basic認証チェック
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const { action, ad } = await req.json();

    if (!action || !['upsert', 'delete'].includes(action)) {
      return NextResponse.json({ error: '無効なアクションです' }, { status: 400 });
    }

    if (!ad || !ad.id) {
      return NextResponse.json({ error: '無効な広告データです' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (action === 'upsert') {
      // データのマッピング (キャメルケースからスネークケースへ)
      const dbAd = {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        price_text: ad.priceText || null,
        image_url: ad.imageUrl,
        affiliate_url: ad.affiliateUrl,
        context: ad.context,
        size_target: ad.sizeTarget || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('affiliate_ads')
        .upsert(dbAd, { onConflict: 'id' });

      if (error) {
        console.error('Failed to upsert affiliate ad:', error);
        return NextResponse.json({ error: `データベース保存に失敗しました: ${error.message}` }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: '保存が完了しました' });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('affiliate_ads')
        .delete()
        .eq('id', ad.id);

      if (error) {
        console.error('Failed to delete affiliate ad:', error);
        return NextResponse.json({ error: `データベース削除に失敗しました: ${error.message}` }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: '削除が完了しました' });
    }

    return NextResponse.json({ error: '未対応のアクションです' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in admin affiliate API:', err);
    return NextResponse.json({ error: `サーバーエラーが発生しました: ${err.message || err}` }, { status: 500 });
  }
}
