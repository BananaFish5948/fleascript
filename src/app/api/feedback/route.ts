import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { logId, feedback, reason } = body;

    if (!logId || !feedback) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (logId === 'anonymous') {
      // 匿名意見箱の場合は新しいログとして保存する
      const { error } = await supabase
        .from('generation_logs')
        .insert({ user_complaint: reason });

      if (error) {
        console.error("[feedback] Supabase error for anonymous:", error.message);
      }
      return NextResponse.json({ ok: true });
    }
    
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
  } catch (error: unknown) {
    console.error("[feedback] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
