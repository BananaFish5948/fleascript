import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const ssrClient = await createClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // UPSERT or Insert ignore to ensure the user exists in public.users
    const { error } = await supabase
      .from('users')
      .upsert({ id: user.id, subscription_status: 'free' }, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[users/init] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to init user' }, { status: 500 });
  }
}
