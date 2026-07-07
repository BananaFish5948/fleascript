import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const ssrClient = await createClient()
    const { data: { user } } = await ssrClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 })
    }

    const { targetPlan } = await req.json()
    if (targetPlan !== 'standard' && targetPlan !== 'premium') {
      return NextResponse.json({ error: '無効なプランが指定されました。' }, { status: 400 })
    }

    const isDevEnv = process.env.NODE_ENV === 'development'
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    // 【開発環境 or Stripe未設定の場合】: モック挙動（即時DB更新）
    if (isDevEnv && !stripeSecretKey) {
      const adminClient = createAdminClient()
      
      // DBユーザーのプランを直接更新
      const { error: updateErr } = await adminClient
        .from('users')
        .update({ subscription_status: targetPlan })
        .eq('id', user.id)

      if (updateErr) {
        console.error('[checkout-api-mock] Supabase update error:', updateErr.message)
        return NextResponse.json({ error: 'プランの更新に失敗しました。' }, { status: 500 })
      }

      return NextResponse.json({ url: '/?upgraded=true' })
    }

    // 【本番環境（Stripe連携）】
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe 決済キーが設定されていません。' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey)

    const adminClient = createAdminClient()

    // 1. ユーザーの stripe_customer_id を取得
    const { data: dbUser } = await adminClient
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    let customerId = dbUser?.stripe_customer_id

    // 2. 顧客IDがまだ無ければ、Stripe上に顧客を作成してDBに保存
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      await adminClient
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // 3. 価格IDの取得
    const priceId = targetPlan === 'premium'
      ? process.env.STRIPE_PRICE_ID_PREMIUM
      : process.env.STRIPE_PRICE_ID_STANDARD

    if (!priceId) {
      return NextResponse.json({ error: '該当プランの Stripe Price ID が設定されていません。' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    // 4. Stripe Checkout Session の作成 (No such customer エラーに対する自動修復リトライ付き)
    let session
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${appUrl}/?upgraded=true`,
        cancel_url: `${appUrl}/checkout?plan=${targetPlan}`,
        client_reference_id: user.id,
        metadata: {
          userId: user.id,
          plan: targetPlan,
        },
      })
    } catch (stripeErr: any) {
      if (stripeErr.message?.includes('No such customer')) {
        console.warn(`[checkout-api] Stripe customer not found (${customerId}). Re-creating customer for user ${user.id}.`)
        
        // 1. Stripe上で顧客を再作成
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            userId: user.id,
          },
        })
        customerId = customer.id

        // 2. DBの stripe_customer_id を更新
        await adminClient
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)

        // 3. 新しい顧客IDでセッションの作成を再試行
        session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${appUrl}/?upgraded=true`,
          cancel_url: `${appUrl}/checkout?plan=${targetPlan}`,
          client_reference_id: user.id,
          metadata: {
            userId: user.id,
            plan: targetPlan,
          },
        })
      } else {
        throw stripeErr
      }
    }

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('[checkout-api] Error:', error)
    return NextResponse.json({ error: error.message || '内部サーバーエラーが発生しました。' }, { status: 500 })
  }
}
