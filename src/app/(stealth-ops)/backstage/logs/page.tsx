import { createAdminClient } from '@/lib/supabase/admin'
import { publishLog } from './actions'

export const dynamic = 'force-dynamic'

export default async function StealthAdminLogs() {
  const supabase = createAdminClient()
  const { data: logs } = await supabase
    .from('release_logs')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-2xl mx-auto bg-black text-white min-h-screen">
      <h1 className="text-xl font-bold mb-6 text-gray-400">Backstage - Release Notes Queue</h1>
      
      {logs?.length === 0 ? (
        <p className="text-sm text-gray-500">No drafts in queue.</p>
      ) : (
        <div className="space-y-6">
          {logs?.map(log => (
            <div key={log.id} className="border border-gray-800 p-4 rounded-lg bg-gray-900">
              <div className="text-xs text-gray-500 mb-2">
                Tier: {log.tier} | Created: {new Date(log.created_at).toLocaleString('ja-JP')}
              </div>
              <form action={async (formData) => {
                'use server'
                await publishLog(log.id, formData.get('message') as string)
              }}>
                <textarea 
                  name="message"
                  defaultValue={log.message}
                  className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm text-gray-300 h-24 mb-3 focus:outline-none focus:border-gray-500"
                />
                <button 
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800 text-blue-100 text-xs px-4 py-2 rounded transition-colors font-bold"
                >
                  Publish Now
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
