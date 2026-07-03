import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('app_settings')
      .select('roadmap_progress')
      .eq('id', 'global')
      .maybeSingle();

    if (error) {
      console.error('[roadmap-api] Error fetching progress:', error.message);
      return NextResponse.json({ progress: 35 }); // フォールバック
    }

    return NextResponse.json({ progress: data?.roadmap_progress ?? 35 });
  } catch (error) {
    console.error('[roadmap-api] Unexpected error:', error);
    return NextResponse.json({ progress: 35 }); // フォールバック
  }
}
