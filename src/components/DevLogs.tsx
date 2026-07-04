'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ReleaseLog = {
  id: string
  message: string
  published_at: string
}

export default function DevLogs() {
  const [logs, setLogs] = useState<ReleaseLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('release_logs')
        .select('id, message, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3)
      
      if (data) {
        setLogs(data)
      } else if (error) {
        console.error('Failed to fetch dev logs:', error)
      }
      setLoading(false)
    }

    fetchLogs()
  }, [])

  if (loading || logs.length === 0) return null

  return (
    <div className="max-w-md mx-auto mb-8 text-left">
      <div className="bg-orange-50/60 rounded-2xl p-5 border border-orange-100 shadow-sm relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/40 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
        
        <h3 className="text-[var(--color-text-primary)] font-bold mb-4 flex items-center gap-2 text-sm">
          <span className="text-orange-400">📝</span> 
          開発日記（最近のカイゼン）
        </h3>
        
        <div className="space-y-4 relative z-10">
          {logs.map((log, index) => (
            <div key={log.id} className={index !== 0 ? 'pt-4 border-t border-orange-100/60' : ''}>
              <div className="text-[11px] text-gray-400 mb-1 font-medium">
                {new Date(log.published_at).toLocaleDateString('ja-JP', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {log.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
