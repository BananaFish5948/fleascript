import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature header' }, { status: 400 })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    console.error('[stripe-webhook] Missing env keys: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey)

  let event: Stripe.Event

  try {
    const rawBody = await req.text()
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error(`[stripe-webhook] Signature verification failed:`, err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const adminClient = createAdminClient()

  try {
    console.log(`[stripe-webhook] Received event: ${event.type}`)

    switch (event.type) {
      // 1. 新規チェックアウト成功時
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.userId
        const targetPlan = session.metadata?.plan as 'standard' | 'premium'
        const customerId = session.customer as string

        if (!userId || !targetPlan) {
          console.error('[stripe-webhook] checkout.session.completed: Missing userId or plan in session metadata')
          break
        }

        // DB更新
        const { error } = await adminClient
          .from('users')
          .update({ 
            subscription_status: targetPlan,
            stripe_customer_id: customerId
          })
          .eq('id', userId)

        if (error) {
          console.error(`[stripe-webhook] checkout.session.completed: Failed to update user ${userId}:`, error.message)
        } else {
          console.log(`[stripe-webhook] checkout.session.completed: Successfully upgraded user ${userId} to ${targetPlan}`)
        }
        break
      }

      // 2. サブスクリプション変更・更新時
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status

        // 顧客IDからデータベース内のユーザーIDを特定
        const { data: dbUser, error: userErr } = await adminClient
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (userErr || !dbUser) {
          console.warn(`[stripe-webhook] customer.subscription.updated: User not found for customerId ${customerId}. (Skipped update sync)`)
          break
        }

        const userId = dbUser.id

        // サブスクリプションが有効（active または trialing）な場合
        if (status === 'active' || status === 'trialing') {
          // 価格IDからプランを判別
          const priceId = subscription.items.data[0]?.price.id
          let targetPlan: 'standard' | 'premium' | 'free' = 'free'

          if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
            targetPlan = 'premium'
          } else if (priceId === process.env.STRIPE_PRICE_ID_STANDARD) {
            targetPlan = 'standard'
          }

          const { error: updateErr } = await adminClient
            .from('users')
            .update({ subscription_status: targetPlan })
            .eq('id', userId)

          if (updateErr) {
            console.error(`[stripe-webhook] customer.subscription.updated: Failed to update subscription status for user ${userId}:`, updateErr.message)
          } else {
            console.log(`[stripe-webhook] customer.subscription.updated: Updated user ${userId} to status ${targetPlan}`)
          }
        } else {
          // 有効期限切れ・滞納・未払いなどにより無効化された場合
          const { error: updateErr } = await adminClient
            .from('users')
            .update({ subscription_status: 'free' })
            .eq('id', userId)

          if (updateErr) {
            console.error(`[stripe-webhook] customer.subscription.updated (inactive): Failed to downgrade user ${userId} to free:`, updateErr.message)
          } else {
            console.log(`[stripe-webhook] customer.subscription.updated (inactive): Downgraded user ${userId} to free`)
          }
        }
        break
      }

      // 3. サブスクリプション削除・解約時
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // 顧客IDからユーザーを特定
        const { data: dbUser, error: userErr } = await adminClient
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (userErr || !dbUser) {
          console.warn(`[stripe-webhook] customer.subscription.deleted: User not found for customerId ${customerId}. (Skipped downgrade sync)`)
          break
        }

        const userId = dbUser.id

        // サブスクリプションが解約されたため、free プランへダウングレード
        const { error: updateErr } = await adminClient
          .from('users')
          .update({ subscription_status: 'free' })
          .eq('id', userId)

        if (updateErr) {
          console.error(`[stripe-webhook] customer.subscription.deleted: Failed to downgrade user ${userId} to free:`, updateErr.message)
        } else {
          console.log(`[stripe-webhook] customer.subscription.deleted: Successfully downgraded user ${userId} to free`)
        }
        break
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error(`[stripe-webhook] Server internal error:`, err.message)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
