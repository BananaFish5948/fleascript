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

    const isDevEnv = process.env.NODE_ENV === 'development'
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    // 【開発環境 or Stripe未設定の場合】: モック挙動（即時DBダウングレード）
    if (isDevEnv && !stripeSecretKey) {
      const adminClient = createAdminClient()
      
      // DBユーザーのプランを free に更新
      const { error: updateErr } = await adminClient
        .from('users')
        .update({ subscription_status: 'free' })
        .eq('id', user.id)

      if (updateErr) {
        console.error('[portal-api-mock] Supabase update error:', updateErr.message)
        return NextResponse.json({ error: 'プランの変更に失敗しました。' }, { status: 500 })
      }

      return NextResponse.json({ url: '/?canceled=true' })
    }

    // 【本番環境（Stripeポータル連携）】
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe 決済キーが設定されていません。' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acronyms' as any,
    })

    const adminClient = createAdminClient()

    // 1. ユーザーの stripe_customer_id および現在のプランステータスを取得
    const { data: dbUser } = await adminClient
      .from('users')
      .select('stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .maybeSingle()

    const customerId = dbUser?.stripe_customer_id
    const currentStatus = dbUser?.subscription_status || 'free'

    if (!customerId) {
      // Stripe上に顧客データがないにも関わらず、プラン状態が有料(standard/premium)になっている場合、
      // ユーザーが自力で解約できなくなるのを防ぐため、即時DBをfreeにダウングレードする（自己修復フォールバック）
      if (currentStatus !== 'free') {
        const { error: resetErr } = await adminClient
          .from('users')
          .update({ subscription_status: 'free' })
          .eq('id', user.id)

        if (resetErr) {
          console.error('[portal-api] Fallback reset error:', resetErr.message)
          return NextResponse.json({ error: 'プランの強制解約に失敗しました。' }, { status: 500 })
        }

        return NextResponse.json({ url: '/?canceled=true' })
      }

      return NextResponse.json({ error: '有効なサブスクリプション情報が見つかりません。' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    // 2. Stripe Customer Portal Session の作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: appUrl,
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (error: any) {
    console.error('[portal-api] Error:', error)
    return NextResponse.json({ error: error.message || '内部サーバーエラーが発生しました。' }, { status: 500 })
  }
}
