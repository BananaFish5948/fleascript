import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | FleaScript',
  description: 'FleaScriptの特定商取引法に基づく表記です。',
}

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-[#f7fafc] text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          特定商取引法に基づく表記
        </h1>
        
        <div className="space-y-6 text-sm text-gray-700">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">販売事業者</h2>
            <div className="md:col-span-2 text-gray-400 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
              [ここに事業者名・法人名を入力]
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">運営統括責任者</h2>
            <div className="md:col-span-2 text-gray-400 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
              [ここに代表者氏名を入力]
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">所在地</h2>
            <div className="md:col-span-2 text-gray-400 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
              [ここに住所を入力]
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">電話番号</h2>
            <div className="md:col-span-2 text-gray-400 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
              [ここに電話番号を入力] ※「電話番号についてはお問い合わせ先メールアドレスにてご請求をいただければ、遅滞なく開示いたします。」でも可
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">メールアドレス</h2>
            <div className="md:col-span-2 text-gray-400 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
              [ここにサポートメールアドレスを入力]
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">販売価格</h2>
            <div className="md:col-span-2">
              購入手続きの際に画面に表示されます。（例：月額300円）
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">商品代金以外の必要料金</h2>
            <div className="md:col-span-2">
              当サイトのページの閲覧、ソフトウェアのダウンロード等に必要となるインターネット接続料金、通信料金等はお客様の負担となります。
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">支払方法と支払の時期</h2>
            <div className="md:col-span-2">
              クレジットカード決済（Apple Pay / Google Pay含む）。<br/>
              初月は即時決済され、以降は毎月同日に自動的に決済が行われます。
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <h2 className="font-bold text-gray-900">商品の引渡時期</h2>
            <div className="md:col-span-2">
              決済手続き完了後、直ちにご利用いただけます。
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <h2 className="font-bold text-gray-900">返品・キャンセルに関する特約</h2>
            <div className="md:col-span-2">
              サービスの性質上、決済完了後の返品および返金はお受け付けしておりません。<br/>
              解約は、サービス内の設定画面からいつでも行うことができます。解約手続きが完了した月の翌月以降の請求は行われません。
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-[var(--color-brand)] font-bold hover:underline">
            ← トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
