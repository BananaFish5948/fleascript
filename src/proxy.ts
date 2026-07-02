import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  // Vercel 環境では x-forwarded-for を使用
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : '127.0.0.1' // req.ip は Next.js 15+ で削除されたためフォールバック

  const res = NextResponse.next()
  res.headers.set('x-real-ip', ip)
  return res
}

export const config = {
  matcher: ['/api/generate', '/api/feedback'],
}
