'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function publishLog(id: string, newMessage: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('release_logs')
    .update({ 
      status: 'published', 
      message: newMessage,
      published_at: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/backstage/logs')
  revalidatePath('/') // フッター等に反映させるために再検証
}
