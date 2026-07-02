import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { logId, feedback, reason } = body;

    if (!logId || !feedback) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (logId === 'anonymous') {
      // 匿名意見箱の場合は UPDATE 対象がないため正常終了とする
      return NextResponse.json({ ok: true });
    }

    const supabase = createServerClient();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { feedback };
    if (reason) {
      updateData.feedback_reason = reason;
    }

    const { error } = await supabase
      .from('generation_logs')
      .update(updateData)
      .eq('id', logId);

    if (error) {
      console.error("[feedback] Supabase error:", error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[feedback] Error:", error.message);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
