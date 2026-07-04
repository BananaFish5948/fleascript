import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('x-agent-secret')
    // エージェント認証（簡易チェック）
    if (authHeader !== process.env.AGENT_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier, message } = await req.json()
    if (!tier || !message) {
      return NextResponse.json({ error: 'Missing tier or message' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('release_logs')
      .insert([{ tier, message, status: 'draft' }])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
