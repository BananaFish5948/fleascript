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
    .select('subscription_status, preferences')
    .eq('id', user.id)
    .single()

  if (userData?.subscription_status !== 'premium') {
    return NextResponse.json({ error: 'Premium Required' }, { status: 403 })
  }

  const subStatus = userData?.subscription_status || 'free'
  const preferences = userData?.preferences || {}
  const bonusSlots = preferences.bonus_slots || 0

  let maxLimit = 3
  if (subStatus === 'premium') maxLimit = 500
  else if (subStatus === 'standard') maxLimit = 100

  maxLimit += bonusSlots

  const { data, error } = await supabase
    .from('inventory_items')
    .select('id, item_name, purchase_price, target_price, postage, fee_rate, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(maxLimit)

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

  // グラフ用データ（売却済アイテムの内訳）
  let totalRevenue = 0;
  let totalFees = 0;
  let totalPostage = 0;
  let netProfit = 0;
  let totalPurchase = 0;

  soldItems.forEach(item => {
    const price = item.target_price || 0;
    const fee = Math.floor(price * ((item.fee_rate || 10) / 100));
    const postage = item.postage || 0;
    const purchase = item.purchase_price || 0;
    
    totalRevenue += price;
    totalFees += fee;
    totalPostage += postage;
    totalPurchase += purchase;
    netProfit += (price - fee - postage - purchase);
  });

  const chartData = soldItems.length > 0 ? [
    { name: '手取り利益', value: Math.max(0, netProfit), fill: '#10b981' },
    { name: '送料', value: totalPostage, fill: '#f59e0b' },
    { name: 'プラットフォーム手数料', value: totalFees, fill: '#ef4444' },
    { name: '仕入値', value: totalPurchase, fill: '#6b7280' }
  ].filter(d => d.value > 0) : [];

  // AI値下げサジェストの生成
  const markdownSuggestions: any[] = [];
  const now = new Date();
  
  data.forEach(item => {
    if (item.status === 'mercari' || item.status === 'yahoo') {
      const updatedAt = new Date(item.updated_at);
      const diffTime = Math.abs(now.getTime() - updatedAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // 出品から3日以上経過しているものを対象とする
      if (diffDays >= 3) {
        const currentPrice = item.target_price || 0;
        // 基本は100円値下げ（ただし100円以下の場合は0にならないように下限を設ける）
        const suggestedPrice = Math.max(300, currentPrice - 100);
        
        if (currentPrice > 300) {
          markdownSuggestions.push({
            id: item.id,
            item_name: item.item_name,
            current_price: currentPrice,
            suggested_price: suggestedPrice,
            days_elapsed: diffDays,
            reason: `出品・更新から${diffDays}日経過。100円値下げでタイムライン上位表示を狙いましょう。`
          });
        }
      }
    }
  });

  return NextResponse.json({
    analytics: {
      totalItems,
      soldCount: soldItems.length,
      totalProfitEstimate,
      bestSellingTime,
      markdownSuggestions,
      chartData
    }
  })
}
