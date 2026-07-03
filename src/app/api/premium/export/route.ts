import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  if (userData?.subscription_status !== 'premium') {
    return NextResponse.json({ error: 'Premium Required' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // CSV形式に変換
  const headers = ['id', 'item_name', 'purchase_price', 'target_price', 'status', 'location_tag', 'created_at'].join(',')
  const rows = data.map(item => 
    [item.id, `"${item.item_name}"`, item.purchase_price, item.target_price, item.status, item.location_tag, item.created_at].join(',')
  )
  const csvContent = [headers, ...rows].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="inventory_export.csv"'
    }
  })
}
