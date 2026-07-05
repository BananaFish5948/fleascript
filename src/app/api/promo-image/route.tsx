import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

// Kinfolkテーマのカラーコード定数
const COLORS = {
  bgBase: '#F5F2EB',      // リネンエクリュ
  bgSurface: '#ffffff',
  brand: '#A65D47',       // テラコッタ
  accent: '#7A8B76',      // セージグリーン
  textPrimary: '#2D2926',  // チャコールグレー
  textSecondary: '#78716C',// stone-500
  border: '#E7E5E4',      // stone-200
  success: '#5B6E53',     // ディープオリーブ
  successBg: '#E9ECE7',
  danger: '#BA8A85',      // ダスティモーブ
  dangerBg: '#F8F3F2'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slide = searchParams.get('slide') || '1'

  // Windowsのローカルフォント (游明朝: yumin.ttf) を直接読み込む
  let fontData: ArrayBuffer | null = null
  try {
    const localFontPath = 'C:\\Windows\\Fonts\\yumin.ttf'
    if (fs.existsSync(localFontPath)) {
      const fileBuffer = fs.readFileSync(localFontPath)
      const arrayBuffer = new ArrayBuffer(fileBuffer.length)
      new Uint8Array(arrayBuffer).set(new Uint8Array(fileBuffer))
      fontData = arrayBuffer
    }
  } catch (err) {
    console.error('Failed to load local font (yumin.ttf), falling back to default:', err)
  }

  const fontOptions = fontData ? [
    {
      name: 'Noto Sans JP', // Satori内部のフォント名
      data: fontData,
      style: 'normal' as const,
      weight: 400 as const,
    }
  ] : []

  // 外枠用1px極細ソリッドラインの色 (背景色より少し濃い色)
  const borderOuterColor = 'rgba(45, 41, 38, 0.08)'

  // スライド別のJSXレンダリング
  let content = null

  if (slide === '1') {
    // 1枚目：ファーストビュー
    content = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLORS.bgBase,
          padding: '80px',
          boxSizing: 'border-box',
          border: `1px solid ${borderOuterColor}`,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '120px' }}>
          <span style={{ color: COLORS.brand, fontSize: '24px', fontWeight: 600, letterSpacing: '4px', marginBottom: '40px' }}>
            // System Tuning
          </span>
          <h2 style={{ fontSize: '56px', fontWeight: 300, color: COLORS.textPrimary, lineHeight: 1.4, margin: 0, letterSpacing: '2px', display: 'flex', flexDirection: 'column' }}>
            <span>あなたの暮らしは、</span>
            <span>あと何時間調律できる？</span>
          </h2>
        </div>

        {/* ドット矢印 (SVG) - 右中央に配置 */}
        <div style={{ position: 'absolute', right: '60px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="6" r="1.5" fill={COLORS.brand} />
            <circle cx="12" cy="8" r="1.5" fill={COLORS.brand} />
            <circle cx="16" cy="12" r="2" fill={COLORS.brand} />
            <circle cx="12" cy="16" r="1.5" fill={COLORS.brand} />
            <circle cx="8" cy="18" r="1.5" fill={COLORS.brand} />
            <circle cx="4" cy="12" r="1" fill={COLORS.brand} opacity="0.5" />
          </svg>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary, letterSpacing: '4px' }}>
            FleaScript
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary }}>
            1 / 4
          </span>
        </div>
      </div>
    )
  } else if (slide === '2') {
    // 2枚目：機会損失の可視化
    content = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLORS.bgBase,
          padding: '80px',
          boxSizing: 'border-box',
          border: `1px solid ${borderOuterColor}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: COLORS.danger, fontSize: '24px', fontWeight: 600, letterSpacing: '4px', marginBottom: '20px' }}>
            // Opportunities Lost
          </span>
          <h3 style={{ fontSize: '42px', fontWeight: 600, color: COLORS.textPrimary, margin: 0 }}>
            「価格設定の迷子」による月間機会損失
          </h3>
        </div>

        {/* 精密なグリッドグラフ (SVG) */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', margin: '40px 0', position: 'relative' }}>
          <svg width="920" height="380" viewBox="0 0 920 380" style={{ overflow: 'visible' }}>
            {/* グリッド背景線 */}
            <line x1="0" y1="60" x2="920" y2="60" stroke="rgba(120, 113, 108, 0.15)" strokeWidth="0.8" />
            <line x1="0" y1="150" x2="920" y2="150" stroke="rgba(120, 113, 108, 0.15)" strokeWidth="0.8" />
            <line x1="0" y1="240" x2="920" y2="240" stroke="rgba(120, 113, 108, 0.15)" strokeWidth="0.8" />
            <line x1="0" y1="330" x2="920" y2="330" stroke="rgba(120, 113, 108, 0.15)" strokeWidth="0.8" />
            
            {/* 縦線 */}
            <line x1="184" y1="0" x2="184" y2="330" stroke="rgba(120, 113, 108, 0.15)" strokeWidth="0.8" />
            <line x1="368" y1="0" x2="368" y2="330" stroke="rgba(120, 113, 108, 0.15)" strokeWidth="0.8" />
            <line x1="552" y1="0" x2="552" y2="330" stroke="rgba(120, 113, 108, 0.15)" strokeWidth="0.8" />
            <line x1="736" y1="0" x2="736" y2="330" stroke="rgba(120, 113, 108, 0.15)" strokeWidth="0.8" />

            {/* 損失曲線 */}
            <path 
              d="M 50 290 L 184 270 L 368 180 L 552 140 L 736 80 L 870 50" 
              fill="none" 
              stroke={COLORS.danger} 
              strokeWidth="5" 
              strokeLinecap="round"
            />

            {/* ドット */}
            <circle cx="50" cy="290" r="8" fill={COLORS.danger} />
            <circle cx="184" cy="270" r="8" fill={COLORS.danger} />
            <circle cx="368" cy="180" r="8" fill={COLORS.danger} />
            <circle cx="552" cy="140" r="8" fill={COLORS.danger} />
            <circle cx="736" cy="80" r="8" fill={COLORS.danger} />
            <circle cx="870" cy="50" r="12" fill={COLORS.danger} />
          </svg>
          
          {/* HTML重ね合わせによるラベル配置 (Satori SVG text制限の回避策) */}
          <div style={{ position: 'absolute', left: '50px', top: '345px', display: 'flex', color: COLORS.textSecondary, fontSize: '18px', fontFamily: 'monospace' }}>Week 1</div>
          <div style={{ position: 'absolute', left: '368px', top: '345px', display: 'flex', color: COLORS.textSecondary, fontSize: '18px', fontFamily: 'monospace' }}>Week 3</div>
          <div style={{ position: 'absolute', left: '736px', top: '345px', display: 'flex', color: COLORS.textSecondary, fontSize: '18px', fontFamily: 'monospace' }}>Week 5</div>
          <div style={{ position: 'absolute', left: '700px', top: '25px', display: 'flex', color: COLORS.danger, fontSize: '20px', fontWeight: 'bold' }}>損失スタミナ: Max</div>

          <p style={{ fontSize: '24px', color: COLORS.textSecondary, textAlign: 'center', marginTop: '40px', lineHeight: 1.6 }}>
            商品説明作成や送料計算に費やす時間は、1ヶ月で平均約5時間以上のスタミナを浪費します。
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary, letterSpacing: '4px' }}>
            Opportunity Cost
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary }}>
            2 / 4
          </span>
        </div>
      </div>
    )
  } else if (slide === '3') {
    // 3枚目：解決策のドロップ
    content = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLORS.bgBase,
          padding: '80px',
          boxSizing: 'border-box',
          border: `1px solid ${borderOuterColor}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: COLORS.accent, fontSize: '24px', fontWeight: 600, letterSpacing: '4px', marginBottom: '20px' }}>
            // The Compilation
          </span>
          <h3 style={{ fontSize: '42px', fontWeight: 600, color: COLORS.textPrimary, margin: 0 }}>
            ワンタップ調律：15分から1秒の圧縮
          </h3>
        </div>

        {/* 比較グラフィックス */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '40px 0' }}>
          <div style={{ display: 'flex', gap: '40px', width: '100%', maxWidth: '800px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bgSurface, padding: '40px', borderRadius: '24px', border: `1px solid ${COLORS.border}`, width: '340px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '2px', color: COLORS.textSecondary }}>Manual Time</span>
              <span style={{ fontSize: '64px', fontWeight: 200, color: COLORS.textSecondary, textDecoration: 'line-through', margin: '20px 0' }}>15 min</span>
              <span style={{ fontSize: '18px', color: COLORS.textSecondary }}>悩む・調べる・書く</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: COLORS.successBg, padding: '40px', borderRadius: '24px', border: `1px solid rgba(91, 110, 83, 0.2)`, width: '340px', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.success, color: '#ffffff', fontSize: '14px', padding: '8px 16px', borderBottomLeftRadius: '24px' }}>Active</div>
              <span style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '2px', color: COLORS.success, fontWeight: 600 }}>FleaScript</span>
              <span style={{ fontSize: '64px', fontWeight: 800, color: COLORS.success, margin: '20px 0' }}>1 sec</span>
              <span style={{ fontSize: '18px', color: COLORS.success, fontWeight: 600 }}>自動最適化＆調律</span>
            </div>
          </div>
          <p style={{ fontSize: '24px', color: COLORS.textSecondary, textAlign: 'center', marginTop: '60px', maxWidth: '800px', lineHeight: 1.6 }}>
            無駄なエネルギーを1秒でコンパイル。回収したスタミナを「お気に入りの本を読む」「淹れたての珈琲を味わう」といった自分だけの豊かな時間へ。
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary, letterSpacing: '4px' }}>
            Optimized Life
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary }}>
            3 / 4
          </span>
        </div>
      </div>
    )
  } else {
    // 4枚目：コンバージョン
    content = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLORS.bgBase,
          padding: '80px',
          boxSizing: 'border-box',
          border: `1px solid ${borderOuterColor}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, margin: '40px 0' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '32px', backgroundColor: COLORS.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '64px', fontWeight: 800, boxShadow: '0 8px 30px rgba(166, 93, 71, 0.2)' }}>
            FS
          </div>
          <h3 style={{ fontSize: '48px', fontWeight: 800, color: COLORS.textPrimary, margin: '24px 0 0 0' }}>
            FleaScript
          </h3>
          <p style={{ fontSize: '20px', color: COLORS.textSecondary, letterSpacing: '6px', textTransform: 'uppercase', margin: '8px 0 40px 0' }}>
            フリマ商品説明ジェネレーター
          </p>
          
          <div style={{ padding: '16px 40px', border: `1px solid ${COLORS.brand}`, backgroundColor: 'rgba(166, 93, 71, 0.05)', borderRadius: '100px', fontSize: '20px', fontWeight: 600, color: COLORS.brand, letterSpacing: '4px' }}>
            事前登録受付中
          </div>

          <p style={{ fontSize: '22px', color: COLORS.textSecondary, marginTop: '40px', maxWidth: '600px', textAlign: 'center', lineHeight: 1.6 }}>
            プロフィールの固定リンクから、最優先で余白を手に入れましょう。
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary, letterSpacing: '4px' }}>
            Get Started
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary }}>
            4 / 4
          </span>
        </div>
      </div>
    )
  }

  // 1080x1080 の解像度でPNGとしてレンダリングして返却
  return new ImageResponse(content, {
    width: 1080,
    height: 1080,
    fonts: fontOptions
  })
}
