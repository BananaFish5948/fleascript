import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ユーザーのサブスクリプション状態を取得
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', user.id)
    .single()
  
  const isPremium = userData?.subscription_status === 'premium'
  const maxLimit = isPremium ? 500 : 3

  // 現在の登録件数を取得
  const { count } = await supabase
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  if (count !== null && count >= maxLimit) {
    return NextResponse.json({ error: 'Registration limit reached', limitReached: true }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { item_name, purchase_price, target_price, postage, fee_rate, box_number, status, description_stock } = body

    if (!item_name) {
      return NextResponse.json({ error: 'item_name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        user_id: user.id,
        item_name,
        purchase_price: purchase_price || 0,
        target_price: target_price || 0,
        postage: postage || 0,
        fee_rate: fee_rate || 10.00,
        box_number: box_number || null,
        status: status || 'hand',
        description_stock: description_stock || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ item: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
