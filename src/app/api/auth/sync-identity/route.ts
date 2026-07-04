import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { provider, providerId } = await request.json();

    if (!provider || !providerId) {
      return NextResponse.json({ error: 'Missing provider information' }, { status: 400 });
    }

    // 既存の同一プロバイダIDがあるか確認（重複アカウントの突合）
    const { data: existingIdentity, error: queryError } = await supabase
      .from('user_identities')
      .select('*')
      .eq('provider', provider)
      .eq('provider_id', providerId)
      .single();

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "No rows found"
      throw queryError;
    }

    if (existingIdentity && existingIdentity.user_id !== user.id) {
      // 異なるユーザーIDに紐づいている場合、統合が必要である旨を返す
      return NextResponse.json({ 
        status: 'conflict', 
        message: 'This identity is already linked to another account. Please verify your login method.' 
      }, { status: 409 });
    }

    if (!existingIdentity) {
      // 新規バインド
      const { error: insertError } = await supabase
        .from('user_identities')
        .insert({
          user_id: user.id,
          provider: provider,
          provider_id: providerId,
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ status: 'success', message: 'Identity synchronized successfully' });
  } catch (error: any) {
    console.error('Identity sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
