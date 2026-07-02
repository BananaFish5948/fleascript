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
  
  // ログを取得 (最新50件)
  const { data: logs, error } = await supabase
    .from('generation_logs')
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

  // 統計の計算
  const total = logs.length
  const positive = logs.filter(l => l.feedback === 'positive').length
  const negative = logs.filter(l => l.feedback === 'negative').length
  
  const reasons: Record<string, number> = {}
  logs.forEach(l => {
    if (l.feedback === 'negative' && l.feedback_reason) {
      reasons[l.feedback_reason] = (reasons[l.feedback_reason] || 0) + 1
    } else if (l.feedback === 'comment' && l.feedback_reason) {
      // 匿名意見箱
      reasons['(匿名意見)'] = (reasons['(匿名意見)'] || 0) + 1
    }
  })

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
            <div className="text-[var(--color-text-secondary)] text-sm mb-1">最近の生成数</div>
            <div className="text-4xl font-bold">{total} <span className="text-base font-normal">件</span></div>
          </div>
          <div className="card p-6 border-l-4 border-green-500">
            <div className="text-[var(--color-text-secondary)] text-sm mb-1">👍 Positive</div>
            <div className="text-4xl font-bold text-green-400">{positive}</div>
          </div>
          <div className="card p-6 border-l-4 border-[var(--color-danger)]">
            <div className="text-[var(--color-text-secondary)] text-sm mb-1">👎 Negative</div>
            <div className="text-4xl font-bold text-[var(--color-danger)]">{negative}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* フィードバック理由チャート（簡易版） */}
          <div className="card p-6 lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">ネガティブ理由 / 意見</h2>
            {Object.keys(reasons).length === 0 ? (
              <p className="text-[var(--color-text-muted)] text-sm">データがありません</p>
            ) : (
              <ul className="space-y-3">
                {Object.entries(reasons)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => (
                  <li key={reason} className="flex justify-between items-center bg-[var(--color-bg-base)] p-3 rounded-lg border border-[var(--color-border)]">
                    <span className="text-sm">{reason}</span>
                    <span className="font-bold text-[var(--color-accent)]">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ログ一覧 */}
          <div className="card p-6 lg:col-span-2 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">最新の生成ログ</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                  <th className="pb-2 font-medium">日時</th>
                  <th className="pb-2 font-medium">IP</th>
                  <th className="pb-2 font-medium">プラットフォーム</th>
                  <th className="pb-2 font-medium w-1/3">入力メモ</th>
                  <th className="pb-2 font-medium">評価</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[var(--color-text-muted)]">ログがありません</td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--color-brand-dim)] transition-colors">
                    <td className="py-3 pr-2 text-xs text-[var(--color-text-muted)]">
                      {new Date(log.created_at).toLocaleString('ja-JP', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 pr-2 text-xs text-[var(--color-text-muted)]">{log.ip_address}</td>
                    <td className="py-3 pr-2 text-xs text-[var(--color-text-muted)]">
                      {log.platform === 'yahoo' ? 'ヤフオク' : log.platform === 'minne' ? 'ハンドメイド' : 'メルカリ'}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="line-clamp-2">{log.input_text}</div>
                    </td>
                    <td className="py-3">
                      {log.feedback === 'positive' && <span title="Positive">👍</span>}
                      {log.feedback === 'negative' && <span title={log.feedback_reason || 'Negative'}>👎 {log.feedback_reason}</span>}
                      {log.feedback === 'comment' && <span title={log.feedback_reason || 'Comment'}>💬 {log.feedback_reason}</span>}
                      {!log.feedback && <span className="text-[var(--color-text-muted)]">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  )
}
