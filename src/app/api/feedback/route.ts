import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rating, reason, comment, feedback, complaint } = body;

    // フロントが古い形式（feedback, complaint）で送ってきた場合の互換性担保
    const finalRating = rating || (feedback === 'comment' ? 'up' : feedback);
    const finalComment = comment || complaint;

    if (!finalRating || !['up', 'down'].includes(finalRating)) {
      return NextResponse.json({ error: 'invalid rating' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('feedback_logs')
      .insert([
        {
          rating: finalRating,
          reason: reason || null,
          comment: finalComment || null,
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
