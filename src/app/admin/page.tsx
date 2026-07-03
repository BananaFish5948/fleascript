import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link'
import { cookies } from 'next/headers'
import DevModeToggle from '@/components/DevModeToggle'
import PremiumToggle from '@/components/PremiumToggle'

// Dynamic rendering for admin dashboard
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createAdminClient()
  const cookieStore = await cookies()
  const isDevMode = cookieStore.has('FLEA_DEV_MODE')
  
  // 在庫アイテムを取得 (最新50件)
  const { data: items, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return (
      <div className="p-8 text-[var(--color-danger)]">
        エラーが発生しました: {error.message}
      </div>
    )
  }

  // 今日の利用状況 (IP) と Premium ユーザー数を取得
  const today = new Date().toISOString().slice(0, 10)
  
  const [
    { data: ipLimits },
    { data: premiumUsersData }
  ] = await Promise.all([
    supabase.from('ip_rate_limits').select('*').eq('date', today).order('count', { ascending: false }).limit(10),
    supabase.from('users').select('id').eq('subscription_status', 'premium')
  ])

  const premiumCount = premiumUsersData?.length || 0

  // 統計の計算
  const totalItems = items.length
  const soldItemsCount = items.filter(i => i.status === 'sold').length

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[var(--color-brand)]">FleaScript Admin Dashboard</h1>
          <div className="flex flex-wrap items-center gap-4">
            <PremiumToggle />
            <DevModeToggle initialDevMode={isDevMode} />
            <Link href="/" className="text-[var(--color-accent)] hover:underline text-sm whitespace-nowrap">アプリへ戻る</Link>
          </div>
        </header>
        
        {/* KPI パネル */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 border-l-4 border-[var(--color-brand)]">
            <div className="text-[var(--color-text-secondary)] text-sm mb-1">最近の登録在庫数</div>
            <div className="text-4xl font-bold">{totalItems} <span className="text-base font-normal">件</span></div>
          </div>
          <div className="card p-6 border-l-4 border-amber-400">
            <div className="text-[var(--color-text-secondary)] text-sm mb-1">👑 Premium 会員</div>
            <div className="text-4xl font-bold text-amber-500">{premiumCount} <span className="text-base font-normal text-amber-500">人</span></div>
          </div>
          <div className="card p-6 border-l-4 border-emerald-500">
            <div className="text-[var(--color-text-secondary)] text-sm mb-1">最近の売却済アイテム</div>
            <div className="text-4xl font-bold text-emerald-500">{soldItemsCount} <span className="text-base font-normal text-emerald-500">件</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ログ一覧（在庫アイテム） */}
          <div className="card p-6 lg:col-span-2 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">最新の在庫アイテム (TOP 50)</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                  <th className="pb-2 font-medium">登録日時</th>
                  <th className="pb-2 font-medium">ユーザーID (先頭8桁)</th>
                  <th className="pb-2 font-medium w-1/3">商品名</th>
                  <th className="pb-2 font-medium">ステータス</th>
                  <th className="pb-2 font-medium">目標売価</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[var(--color-text-muted)]">データがありません</td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--color-brand-dim)] transition-colors">
                    <td className="py-3 pr-2 text-xs text-[var(--color-text-muted)]">
                      {new Date(item.created_at).toLocaleString('ja-JP', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 pr-2 font-mono text-xs text-[var(--color-text-muted)]">
                      {item.user_id?.split('-')[0] || '-'}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="line-clamp-2 font-bold">{item.item_name}</div>
                    </td>
                    <td className="py-3 pr-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.status}</span>
                    </td>
                    <td className="py-3 pr-2">
                      ¥{item.target_price?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* トラフィック (Today) */}
          <div className="card p-6 lg:col-span-1 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">本日のIP利用状況 (TOP 10)</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                  <th className="pb-2 font-medium">IP Address</th>
                  <th className="pb-2 font-medium text-right">API呼出</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {!ipLimits || ipLimits.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-[var(--color-text-muted)]">データなし</td>
                  </tr>
                ) : (
                  ipLimits.map(ip => (
                    <tr key={ip.id} className="hover:bg-[var(--color-brand-dim)] transition-colors">
                      <td className="py-3 font-mono text-xs">
                        {ip.ip_address}
                      </td>
                      <td className="py-3 text-right font-bold text-[var(--color-accent)]">{ip.count} 回</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
        
      </div>
    </div>
  )
}

