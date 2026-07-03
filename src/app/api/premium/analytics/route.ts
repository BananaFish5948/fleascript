import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // プラン判定 (premiumのみアクセス可)
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
    .select('purchase_price, target_price, status, created_at, updated_at')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 簡易集計ロジック
  const totalItems = data.length
  const soldItems = data.filter(i => i.status === 'sold')
  const totalProfitEstimate = data.reduce((acc, item) => acc + ((item.target_price || 0) - (item.purchase_price || 0)), 0)

  // 売れ筋タイムの集計
  let bestSellingTime = "データ不足";
  if (soldItems.length > 0) {
    const timeCounts: Record<string, number> = {};
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    
    soldItems.forEach(item => {
      if (!item.updated_at) return;
      const date = new Date(item.updated_at);
      // 日本時間(JST)を考慮して曜日・時間を取得
      const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const day = days[jstDate.getUTCDay()];
      const hour = jstDate.getUTCHours();
      const key = `${day}曜日の${hour}時台`;
      timeCounts[key] = (timeCounts[key] || 0) + 1;
    });

    let maxCount = 0;
    let bestKey = "";
    Object.entries(timeCounts).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        bestKey = key;
      }
    });
    
    if (bestKey) {
      bestSellingTime = bestKey;
    }
  }

  return NextResponse.json({
    analytics: {
      totalItems,
      soldCount: soldItems.length,
      totalProfitEstimate,
      bestSellingTime
    }
  })
}
