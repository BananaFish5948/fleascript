import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { deviceId, status } = await req.json();

    if (!deviceId || !status) {
      return NextResponse.json({ error: 'Device ID and status are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('users')
      .upsert(
        { id: deviceId, subscription_status: status },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('[toggle-premium] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('[toggle-premium] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
