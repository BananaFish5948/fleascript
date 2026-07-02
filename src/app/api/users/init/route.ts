import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();
    if (!deviceId) return NextResponse.json({ error: 'No device ID' }, { status: 400 });

    const supabase = createAdminClient();
    
    // UPSERT or Insert ignore to ensure the user exists
    const { error } = await supabase
      .from('users')
      .upsert({ id: deviceId, subscription_status: 'free' }, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[users/init] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to init user' }, { status: 500 });
  }
}
