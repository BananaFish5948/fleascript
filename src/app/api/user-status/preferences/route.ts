import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const ssrClient = await createClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    // Fetch existing preferences
    const { data: dbUser, error: fetchError } = await ssrClient
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    const existingPreferences = dbUser?.preferences || {};
    const newPreferences = { ...existingPreferences, ...updates };

    // Update preferences
    const { error: updateError } = await ssrClient
      .from('users')
      .update({ preferences: newPreferences })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ success: true, preferences: newPreferences });
  } catch (error: any) {
    console.error('[PATCH /api/user-status/preferences] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
