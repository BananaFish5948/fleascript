import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'

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
  const aiInsights = preferences.ai_insights || null
  const lastAiAnalysisAt = preferences.last_ai_analysis_at || null

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
    { name: '手取り利益', value: Math.max(0, netProfit), fill: 'var(--color-success)' },
    { name: '送料', value: totalPostage, fill: 'var(--color-warning)' },
    { name: 'プラットフォーム手数料', value: totalFees, fill: 'var(--color-danger)' },
    { name: '仕入値', value: totalPurchase, fill: 'var(--color-info)' }
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
      chartData,
      aiInsights,
      lastAiAnalysisAt
    }
  })
}

export async function POST() {
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

  const preferences = userData?.preferences || {}
  const lastAiAnalysisAt = preferences.last_ai_analysis_at

  // 24時間二重実行チェック
  if (lastAiAnalysisAt) {
    const diff = Date.now() - new Date(lastAiAnalysisAt).getTime()
    const limitDuration = 24 * 60 * 60 * 1000 // 24時間
    if (diff < limitDuration) {
      const hoursLeft = Math.ceil((limitDuration - diff) / (1000 * 60 * 60))
      return NextResponse.json(
        { error: `AI分析は24時間に1回まで実行可能です。次回更新まであと約${hoursLeft}時間です。` }, 
        { status: 429 }
      )
    }
  }

  const subStatus = userData?.subscription_status || 'free'
  const bonusSlots = preferences.bonus_slots || 0
  let maxLimit = 3
  if (subStatus === 'premium') maxLimit = 500
  else if (subStatus === 'standard') maxLimit = 100
  maxLimit += bonusSlots

  // 全在庫データ取得
  const { data, error } = await supabase
    .from('inventory_items')
    .select('item_name, purchase_price, target_price, postage, fee_rate, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(maxLimit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data.length === 0) {
    return NextResponse.json({ error: '分析対象の在庫データが登録されていません。先にアイテムを追加してください。' }, { status: 400 })
  }

  try {
    // OpenAI用データテキスト作成
    const itemDataText = data.map((item, idx) => {
      return `[商品${idx + 1}] 商品名: ${item.item_name}, 仕入値: ${item.purchase_price}円, 目標売価: ${item.target_price}円, 送料: ${item.postage}円, 手数料率: ${item.fee_rate}%, ステータス: ${item.status === 'sold' ? '売却済' : '出品中・手元保管'}, 登録日時: ${item.created_at}`;
    }).join('\n')

    const systemPrompt = `あなたは優秀なフリマ出品の診断コンシェルジュです。
ユーザーから渡される在庫データ（仕入価格、目標売価、送料、手数料、ステータス、登録日時など）を多角的に分析し、売上を最大化するためのアドバイスを提供してください。

以下のJSONフォーマットで厳密に出力してください。出力言語は必ず「日本語」にしてください。

{
  "best_selling_time_advice": "売れ筋の時間帯や曜日のアドバイス（例：ガジェット類は金曜夜に売れやすいため、木曜夜に再出品を検討してください など）",
  "pricing_strategy": "価格設定に関する戦略のアドバイス（例：仕入値に対して売価が高すぎるものが一部あるため、少し値下げして回転率を上げることを推奨します など）",
  "insights": [
    "経営全体に対するインサイト分析の箇条書き1（100文字程度）",
    "経営全体に対するインサイト分析の箇条書き2（100文字程度）",
    "経営全体に対するインサイト分析の箇条書き3（100文字程度）"
  ]
}`

    const userPrompt = `以下は私の現在の在庫データ一覧です。これを分析してください。\n\n${itemDataText}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    }, {
      timeout: 25000 // 25秒タイムアウト
    })

    const rawOutput = completion.choices[0]?.message?.content
    if (!rawOutput) {
      throw new Error("OpenAI API returned empty response.")
    }

    const parsedAI = JSON.parse(rawOutput)

    // DBへのキャッシュ保存
    const newPreferences = {
      ...preferences,
      ai_insights: parsedAI,
      last_ai_analysis_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ preferences: newPreferences })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update preferences error:', updateError)
      throw new Error("Failed to save AI insights to database")
    }

    return NextResponse.json({
      success: true,
      aiInsights: parsedAI,
      lastAiAnalysisAt: newPreferences.last_ai_analysis_at
    })

  } catch (err: any) {
    console.error('[POST /api/premium/analytics] OpenAI Error:', err)
    return NextResponse.json({ error: err.message || 'AI分析に失敗しました。' }, { status: 500 })
  }
}
