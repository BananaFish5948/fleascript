const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// .env.local から環境変数を手動でパースしてロード
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    const key = match[1]
    let value = match[2] || ''
    value = value.replace(/(^['"]|['"]$)/g, '').trim()
    env[key] = value
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const logs = [
  {
    tier: 1, // Feature
    message: `【新機能】トラブル防止のための頼れる味方！「穏やかな対話境界線ヘルパー (BNC)」をリリースしました！\n\nメルカリやヤフオクでの「過度な値下げ交渉」や「理不尽な質問」に消耗していませんか？そんな時のために、感情的にならずに毅然と、かつ角を立てずに「境界線」を引くための返答下書き機能（BNC）を実装しました。\n\nスマホでトーク画面のスクリーンショットを撮ってアップロードするだけで、その場で文字を自動解析（※個人情報を保護するため、解析はすべて端末内のローカルで行われます）し、AIが最適な「大人のやんわりお断り文章」を秒速で作成します。\n\nまずは Standard / Premium 会員向けにベータ提供を開始します。フリマ出品をもっとストレスフリーに楽しむための盾として、ぜひご活用ください！`,
    status: 'draft'
  },
  {
    tier: 2, // Tuning
    message: `【UX改善】スマホでの使いやすさを徹底追及！下部ナビゲーションの刷新と「リスト」タブの独立化を行いました。\n\nスマホユーザーの皆さまに、よりスムーズに在庫管理を行っていただくため、従来の画面スクロール形式から、モバイルファーストな「下部ナビゲーション（タブ切り替え）」へとUIを大幅にリニューアルしました！\n\nさらに、ご要望の多かった「在庫リスト」を専用の5番目の独立タブとして切り離し、一覧性を高めています。\nまた、「文字を入力しようとすると、キーボードがナビゲーションと重なって邪魔になる」問題を検知し、入力フォーカス時は下部ナビを自動でスッと隠す「キーボード防衛ロジック」も組み込みました。片手でのポチポチ登録が格段に快適になりますよ！`,
    status: 'draft'
  },
  {
    tier: 3, // Fix
    message: `【裏側の強化】決済まわりのエラーから自動で立ち直る「自己修復フォールバック」を実装しました。\n\n稀に発生する「ローカルのデータベースに保存されたStripeの顧客情報」と、「実際のStripeシステム内の顧客データ」のズレによる不整合。これまではこのズレが起きると、プラン変更や解約ポータルの画面でデッドロック（エラーが出て進めなくなる）が発生していました。\n\n今回のアップデートでは、この『No such customer（そんな顧客はいません）』エラーをシステムが自動検知し、ユーザーの安全を確保した上で、その場で自動的に決済情報のクレンジングと再接続、あるいは安全なフリープランへの自動リセットを行う「自己修復機能」を実装しました。\nユーザーの皆様を絶対に画面上で迷子にさせない、頑丈な裏方アップデートです。`,
    status: 'draft'
  },
  {
    tier: 3, // Fix
    message: `【裏側の強化】Stripe Webhookの再送ループからシステムを守る「インメモリ防御フィルター」を追加しました。\n\n開発環境などで一時的に発生する「存在しないダミー顧客ID」に対するStripeからのWebhookの連発（大量リトライ）に対し、システムが過負荷に陥るのを防ぐ防衛フィルターを実装しました。\n\n不整合が検出された無効なIDを一時的にサーバーのメモリにキャッシュし、2回目以降の連続リクエストについては、データベース（Supabase）への無駄な検索クエリを完全にバイパスして即座に処理を受け流します。\nこれにより、サーバーリソースの浪費や開発中のコンソールログが埋め尽くされる問題を解消し、開発およびシステム運用の安全性が大きく向上しました。`,
    status: 'draft'
  }
]

async function run() {
  console.log('Inserting draft release logs into database...')
  const { data, error } = await supabase
    .from('release_logs')
    .insert(logs)
    .select()

  if (error) {
    console.error('Error inserting logs:', error.message)
    process.exit(1)
  }

  console.log('Successfully inserted release logs:', data)
}

run()
