import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const url = req.nextUrl

  // Admin経路とDev Mode APIへのBasic認証
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/dev-mode')) {
    const basicAuth = req.headers.get('authorization')
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')
      
      const expectedUser = process.env.ADMIN_USER
      const expectedPass = process.env.ADMIN_PASS
      
      if (expectedUser && expectedPass && user === expectedUser && pwd === expectedPass) {
        // 認証成功時はそのまま通す
        return NextResponse.next()
      }
    }
    
    // 認証失敗または未認証時は401を返す
    const expectedUser = process.env.ADMIN_USER
    const expectedPass = process.env.ADMIN_PASS

    return new NextResponse('Auth Required', {
      status: 401,
      headers: { 
        'WWW-Authenticate': 'Basic realm="Secure Area"',
        'x-debug-auth-user-loaded': expectedUser ? 'true' : 'false',
        'x-debug-auth-pass-loaded': expectedPass ? 'true' : 'false'
      }
    })
  }

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
  matcher: ['/api/generate', '/api/feedback', '/api/dev-mode', '/admin/:path*'],
}
