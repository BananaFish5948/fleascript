import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ユーザーのプランと制限を取得
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_status, preferences')
    .eq('id', user.id)
    .single()
  
  const subStatus = userData?.subscription_status || 'free'
  const preferences = userData?.preferences || {}
  const bonusSlots = preferences.bonus_slots || 0

  let maxLimit = 3
  if (subStatus === 'premium') maxLimit = 500
  else if (subStatus === 'standard') maxLimit = 100

  maxLimit += bonusSlots

  // 総数を取得
  const { count } = await supabase
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const totalCount = count || 0

  // 上限件数までしか取得させない（悪質なダウングレードによる超過データ保持の防止）
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(maxLimit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    items: data, 
    totalCount, 
    maxLimit, 
    isLocked: totalCount > maxLimit 
  })
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
    .select('subscription_status, preferences')
    .eq('id', user.id)
    .single()
  
  const subStatus = userData?.subscription_status || 'free'
  const preferences = userData?.preferences || {}
  const bonusSlots = preferences.bonus_slots || 0

  let maxLimit = 3
  if (subStatus === 'premium') maxLimit = 500
  else if (subStatus === 'standard') maxLimit = 100

  maxLimit += bonusSlots // ボーナス枠を加算

  // 現在の登録件数を取得
  const { count } = await supabase
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  if (count !== null && count >= maxLimit) {
    return NextResponse.json({ error: 'Payment Required', limitReached: true }, { status: 402 })
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
        location_tag: body.location_tag || 'home',
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
