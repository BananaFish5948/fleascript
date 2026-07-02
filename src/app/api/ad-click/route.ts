import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { logId } = await req.json();

    if (!logId) {
      return NextResponse.json({ error: "No logId provided." }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // 現在の ad_click_count を取得してインクリメント (RPCAなしの簡易実装)
    const { data: current } = await supabase
      .from('generation_logs')
      .select('ad_click_count')
      .eq('id', logId)
      .maybeSingle();

    if (current) {
      await supabase
        .from('generation_logs')
        .update({ ad_click_count: (current.ad_click_count ?? 0) + 1 })
        .eq('id', logId);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[ad-click] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to log click" }, { status: 500 });
  }
}
