import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { enable } = await req.json();
    
    const response = NextResponse.json({ success: true, devMode: enable });
    
    if (enable) {
      // httpOnly: false によりクライアントサイドでも読み取り可能にする
      response.cookies.set('FLEA_DEV_MODE', '1', { 
        path: '/', 
        httpOnly: false, 
        maxAge: 60 * 60 * 24 * 30 // 30日
      });
    } else {
      response.cookies.delete('FLEA_DEV_MODE');
    }
    
    return response;
  } catch (error: unknown) {
    console.error("[dev-mode] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
