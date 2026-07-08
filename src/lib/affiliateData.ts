export interface NativeAdData {
  id: string
  title: string
  description: string
  priceText?: string
  imageUrl: string
  affiliateUrl: string
  context: 'shipping' | 'dashboard' | 'general'
  sizeTarget?: string[] // e.g. ['ネコポス', 'ゆうパケット']
}

// マスターが後でURLを差し替えるためのダミーデータ
// TODO: affiliateUrl を本物のAmazon/楽天リンクに差し替える
// TODO: imageUrl を本物の商品画像URLに差し替える
export const AFFILIATE_ADS: NativeAdData[] = [
  {
    id: 'ad-box-nekoposu',
    title: '【Amazon.co.jp限定】ネコポス用ダンボール箱 (A4サイズ・厚さ3cm以内) 50枚セット',
    description: 'メルカリのネコポスやゆうパケットに完全対応。組み立てカンタンでテープ不要の設計です。',
    priceText: '約 ￥2,500',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/dp/B07P85M8ZH',
    context: 'shipping',
    sizeTarget: ['ネコポス', 'ゆうパケットポスト', 'クリックポスト']
  },
  {
    id: 'ad-box-compact',
    title: '宅急便コンパクト 専用BOX 20枚セット',
    description: '少し厚みのある衣類や雑貨の発送に必須。まとめて買えば1枚あたりのコストを抑えられます。',
    priceText: '約 ￥1,400',
    imageUrl: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/dp/B00V5Q8DUS',
    context: 'shipping',
    sizeTarget: ['宅急便コンパクト']
  },
  {
    id: 'ad-measure',
    title: '厚さ測定定規 (1cm/2cm/3cm対応) アクリル製',
    description: '発送前の厚さオーバーを防止！コンビニや郵便局で突き返されるストレスをなくします。',
    priceText: '約 ￥800',
    imageUrl: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/dp/B07N8G2PZ7',
    context: 'dashboard'
  },
  {
    id: 'ad-opp',
    title: 'OPP袋 A4サイズ テープ付き 100枚入り',
    description: '水濡れ防止の必須アイテム。Tシャツや書籍の梱包を美しく仕上げ、良い評価に繋がります。',
    priceText: '約 ￥600',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed716d40f?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/dp/B004XIF42U',
    context: 'dashboard'
  },
  {
    id: 'ad-light',
    title: 'LEDリングライト 撮影用 スマホスタンド付き',
    description: '商品写真のクオリティが劇的にアップ！明るく綺麗な写真で売却スピードを上げましょう。',
    priceText: '約 ￥2,000',
    imageUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/dp/B08B8D1G41',
    context: 'dashboard'
  }
]
