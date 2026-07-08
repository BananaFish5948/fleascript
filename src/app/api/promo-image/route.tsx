import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import fs from 'fs'

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
  const platform = searchParams.get('platform') || 'x'

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
  const isInsta = platform === 'instagram'
  const content = isInsta 
    ? renderInstagramSlide(slide, borderOuterColor)
    : renderXSlide(slide, borderOuterColor)

  const width = 1080
  const height = isInsta ? 1350 : 1080

  // 指定の解像度でPNGとしてレンダリングして返却
  return new ImageResponse(content, {
    width,
    height,
    fonts: fontOptions
  })
}

// ----------------------------------------------------
// X / Twitter用スライド (1080x1080)
// ----------------------------------------------------
function renderXSlide(slide: string, borderOuterColor: string) {
  if (slide === '1') {
    return (
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
    return (
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
          <div style={{ position: 'absolute', left: '700px', top: '25px', display: 'flex', color: COLORS.danger, fontSize: '20px', fontWeight: 'bold' }}>失われた余白: Max</div>

          <p style={{ fontSize: '24px', color: COLORS.textSecondary, textAlign: 'center', marginTop: '40px', lineHeight: 1.6 }}>
            商品説明作成や送料計算に費やす時間は、1ヶ月で平均約5時間もの「暮らしの余白」を喪失します。
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
    return (
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
            無駄なエネルギーを1秒でコンパイル。回収した「余白の時間」を「お気に入りの本を読む」「淹れたての珈琲を味わう」といった自分だけの豊かな時間へ。
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
    return (
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
          <span style={{ color: COLORS.brand, fontSize: '24px', fontWeight: 600, letterSpacing: '4px', marginBottom: '20px' }}>
            // Recommended Equipment
          </span>
          <h3 style={{ fontSize: '42px', fontWeight: 600, color: COLORS.textPrimary, margin: 0 }}>
            フリマ出品の必需品 → 一撃で送料判定
          </h3>
        </div>

        {/* 商品紹介イラストエリア (SVG) */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center', gap: '40px', margin: '30px 0' }}>
          {/* 定規の紹介カード */}
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bgSurface, padding: '30px', borderRadius: '24px', border: `1px solid ${COLORS.border}`, width: '380px', alignItems: 'center' }}>
            <svg width="180" height="90" viewBox="0 0 180 90" style={{ marginBottom: '20px' }}>
              <rect x="10" y="25" width="160" height="40" rx="6" fill="rgba(122, 139, 118, 0.15)" stroke={COLORS.accent} strokeWidth="2" />
              <rect x="30" y="37" width="120" height="16" rx="3" fill="#ffffff" stroke={COLORS.accent} strokeWidth="1" />
              <line x1="20" y1="25" x2="20" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="40" y1="25" x2="40" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="60" y1="25" x2="60" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="80" y1="25" x2="80" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="100" y1="25" x2="100" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="120" y1="25" x2="120" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="140" y1="25" x2="140" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="160" y1="25" x2="160" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPrimary }}>厚さ測定定規</span>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '8px', textAlign: 'center', lineHeight: 1.4 }}>
              郵便局やコンビニで突き返される送料超過の失敗を防ぐ必須ツール
            </span>
          </div>

          {/* 専用ダンボール箱の紹介カード */}
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bgSurface, padding: '30px', borderRadius: '24px', border: `1px solid ${COLORS.border}`, width: '380px', alignItems: 'center' }}>
            <svg width="180" height="90" viewBox="0 0 180 90" style={{ marginBottom: '20px' }}>
              <path d="M 30 70 L 90 85 L 150 70 L 150 40 L 90 25 L 30 40 Z" fill="none" stroke={COLORS.brand} strokeWidth="2" />
              <path d="M 30 40 L 90 55 L 150 40" fill="none" stroke={COLORS.brand} strokeWidth="1.5" />
              <line x1="90" y1="55" x2="90" y2="85" stroke={COLORS.brand} strokeWidth="2" />
            </svg>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPrimary }}>梱包用ダンボール箱</span>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '8px', textAlign: 'center', lineHeight: 1.4 }}>
              組み立てカンタンでテープ不要。サイズ超過を防いで利益を最大化
            </span>
          </div>
        </div>

        {/* 誘導CTAバナー */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(166, 93, 71, 0.05)', padding: '20px 40px', borderRadius: '20px', border: `1px solid ${COLORS.brand}` }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.brand, letterSpacing: '2px', marginBottom: '8px' }}>
            【登録不要】最安送料判定ツール公開中
          </span>
          <span style={{ fontSize: '15px', color: COLORS.textPrimary }}>
            FleaScriptの便利ツールで送料を計算し、AI商品説明文を無料体験しましょう。
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary, letterSpacing: '4px' }}>
            FleaScript Tools
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary }}>
            4 / 4
          </span>
        </div>
      </div>
    )
  }
}

// ----------------------------------------------------
// Instagram用縦長広告スライド (1080x1350)
// ----------------------------------------------------
function renderInstagramSlide(slide: string, borderOuterColor: string) {
  if (slide === '1') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLORS.bgBase,
          padding: '100px 80px',
          boxSizing: 'border-box',
          border: `1px solid ${borderOuterColor}`,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '160px' }}>
          <span style={{ color: COLORS.accent, fontSize: '24px', fontWeight: 600, letterSpacing: '4px', marginBottom: '40px' }}>
            // Slow Living
          </span>
          <h2 style={{ fontSize: '64px', fontWeight: 300, color: COLORS.textPrimary, lineHeight: 1.4, margin: 0, letterSpacing: '2px', display: 'flex', flexDirection: 'column' }}>
            <span>出品のあわただしさ、</span>
            <span>手放そう。</span>
          </h2>
          <p style={{ fontSize: '28px', color: COLORS.textSecondary, marginTop: '60px', lineHeight: 1.6, maxWidth: '800px' }}>
            商品説明作成や配送手段の調査に奪われる時間に、静かな「余白」を。
          </p>
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
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLORS.bgBase,
          padding: '100px 80px',
          boxSizing: 'border-box',
          border: `1px solid ${borderOuterColor}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: COLORS.brand, fontSize: '24px', fontWeight: 600, letterSpacing: '4px', marginBottom: '20px' }}>
            // The Comparison
          </span>
          <h3 style={{ fontSize: '48px', fontWeight: 600, color: COLORS.textPrimary, margin: 0, lineHeight: 1.3 }}>
            迷う時間を、1秒のスマートさに変える。
          </h3>
        </div>

        {/* 比較グラフィックス（縦並び配置で縦長画面を活用） */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '40px 0', gap: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bgSurface, padding: '30px 40px', borderRadius: '24px', border: `1px solid ${COLORS.border}`, width: '450px', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', color: COLORS.textSecondary }}>Manual Time</span>
            <span style={{ fontSize: '48px', fontWeight: 200, color: COLORS.textSecondary, textDecoration: 'line-through', margin: '10px 0' }}>15 min</span>
            <span style={{ fontSize: '16px', color: COLORS.textSecondary }}>悩む・調べる・書く</span>
          </div>

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V20M12 20L6 14M12 20L18 14" stroke={COLORS.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: COLORS.successBg, padding: '35px 40px', borderRadius: '24px', border: `1px solid rgba(91, 110, 83, 0.2)`, width: '450px', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.success, color: '#ffffff', fontSize: '14px', padding: '8px 16px', borderBottomLeftRadius: '24px' }}>Active</div>
            <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', color: COLORS.success, fontWeight: 600 }}>FleaScript</span>
            <span style={{ fontSize: '56px', fontWeight: 800, color: COLORS.success, margin: '10px 0' }}>1 sec</span>
            <span style={{ fontSize: '16px', color: COLORS.success, fontWeight: 600 }}>自動最適化＆調律</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary, letterSpacing: '4px' }}>
            Optimized Life
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary }}>
            2 / 4
          </span>
        </div>
      </div>
    )
  } else if (slide === '3') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLORS.bgBase,
          padding: '100px 80px',
          boxSizing: 'border-box',
          border: `1px solid ${borderOuterColor}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: COLORS.accent, fontSize: '24px', fontWeight: 600, letterSpacing: '4px', marginBottom: '20px' }}>
            // Mindful Moments
          </span>
          <h3 style={{ fontSize: '48px', fontWeight: 600, color: COLORS.textPrimary, margin: 0, lineHeight: 1.3 }}>
            生まれた時間は、あなたを豊かにする余白へ。
          </h3>
        </div>

        {/* 抽象的なオーガニックデザイン (SVG) */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '400px', margin: '20px 0' }}>
          <svg width="320" height="320" viewBox="0 0 200 200">
            {/* セージグリーンの大きな有機的な円 */}
            <circle cx="90" cy="100" r="70" fill={COLORS.successBg} opacity="0.8" />
            {/* テラコッタの小さな円が重なる */}
            <circle cx="130" cy="80" r="45" fill="rgba(166, 93, 71, 0.15)" />
            {/* 心地よい波線（ゆらぎ・スローライフ） */}
            <path d="M 30 110 Q 60 90 90 110 T 150 110" fill="none" stroke={COLORS.brand} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="150" cy="110" r="4" fill={COLORS.brand} />
          </svg>
        </div>

        <p style={{ fontSize: '26px', color: COLORS.textSecondary, textAlign: 'center', lineHeight: 1.6, margin: '0 auto 40px auto', maxWidth: '850px' }}>
          回収した「余白の時間」で、お気に入りの本を読んだり、淹れたての珈琲を味わったり。忙しい毎日に、ひと呼吸を。
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary, letterSpacing: '4px' }}>
            Yohaku
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary }}>
            3 / 4
          </span>
        </div>
      </div>
    )
  } else {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLORS.bgBase,
          padding: '100px 80px',
          boxSizing: 'border-box',
          border: `1px solid ${borderOuterColor}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: COLORS.brand, fontSize: '24px', fontWeight: 600, letterSpacing: '4px', marginBottom: '20px' }}>
            // Recommended Equipment
          </span>
          <h3 style={{ fontSize: '48px', fontWeight: 600, color: COLORS.textPrimary, margin: 0, lineHeight: 1.3 }}>
            フリマ出品の必需品 → 一撃で送料判定
          </h3>
        </div>

        {/* 商品紹介イラストエリア（縦長レイアウト） */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '30px', margin: '30px 0', alignItems: 'center' }}>
          {/* 定規の紹介カード */}
          <div style={{ display: 'flex', backgroundColor: COLORS.bgSurface, padding: '30px', borderRadius: '24px', border: `1px solid ${COLORS.border}`, width: '100%', maxWidth: '800px', alignItems: 'center', gap: '40px' }}>
            <svg width="180" height="90" viewBox="0 0 180 90" style={{ flexShrink: 0 }}>
              <rect x="10" y="25" width="160" height="40" rx="6" fill="rgba(122, 139, 118, 0.15)" stroke={COLORS.accent} strokeWidth="2" />
              <rect x="30" y="37" width="120" height="16" rx="3" fill="#ffffff" stroke={COLORS.accent} strokeWidth="1" />
              <line x1="20" y1="25" x2="20" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="40" y1="25" x2="40" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="60" y1="25" x2="60" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="80" y1="25" x2="80" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="100" y1="25" x2="100" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
              <line x1="120" y1="25" x2="120" y2="35" stroke={COLORS.accent} strokeWidth="1.5" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.textPrimary }}>厚さ測定定規</span>
              <span style={{ fontSize: '15px', color: COLORS.textSecondary, marginTop: '8px', lineHeight: 1.5 }}>
                郵便局やコンビニで突き返される送料超過の失敗を防ぐ必須ツール
              </span>
            </div>
          </div>

          {/* 専用ダンボール箱の紹介カード */}
          <div style={{ display: 'flex', backgroundColor: COLORS.bgSurface, padding: '30px', borderRadius: '24px', border: `1px solid ${COLORS.border}`, width: '100%', maxWidth: '800px', alignItems: 'center', gap: '40px' }}>
            <svg width="180" height="90" viewBox="0 0 180 90" style={{ flexShrink: 0 }}>
              <path d="M 30 70 L 90 85 L 150 70 L 150 40 L 90 25 L 30 40 Z" fill="none" stroke={COLORS.brand} strokeWidth="2" />
              <path d="M 30 40 L 90 55 L 150 40" fill="none" stroke={COLORS.brand} strokeWidth="1.5" />
              <line x1="90" y1="55" x2="90" y2="85" stroke={COLORS.brand} strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.textPrimary }}>梱包用ダンボール箱</span>
              <span style={{ fontSize: '15px', color: COLORS.textSecondary, marginTop: '8px', lineHeight: 1.5 }}>
                組み立てカンタンでテープ不要。サイズ超過を防いで利益を最大化
              </span>
            </div>
          </div>
        </div>

        {/* 誘導CTAバナー */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(166, 93, 71, 0.05)', padding: '30px 40px', borderRadius: '20px', border: `1px solid ${COLORS.brand}`, width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: COLORS.brand, letterSpacing: '2px', marginBottom: '8px', textAlign: 'center' }}>
            【登録不要】最安送料判定ツール公開中
          </span>
          <span style={{ fontSize: '16px', color: COLORS.textPrimary, textAlign: 'center', lineHeight: 1.5 }}>
            FleaScriptの便利ツールで送料を計算し、AI商品説明文を無料体験しましょう。プロフィールのリンクから！
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary, letterSpacing: '4px' }}>
            FleaScript Tools
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'monospace', color: COLORS.textSecondary }}>
            4 / 4
          </span>
        </div>
      </div>
    )
  }
}
