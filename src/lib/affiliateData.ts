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
    title: 'ネコポス＆ゆうパケット対応ダンボール箱 50枚セット',
    description: '「発送サイズオーバーで送料が高くなった…」という失敗を防ぐ、メルカリ適合サイズ。まとめ買いで1枚あたりコスト最安に！',
    priceText: '約 ￥2,500',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/s?k=%E3%83%8D%E3%82%B3%E3%83%9D%E3%82%B9+%E3%83%80%E3%83%B3%E3%83%9C%E3%83%BC%E3%83%AB',
    context: 'shipping',
    sizeTarget: ['ネコポス', 'ゆうパケット', 'ゆうパケットポスト', 'ゆうパケットポストmini', 'クリックポスト']
  },
  {
    id: 'ad-box-compact',
    title: '宅急便コンパクト＆ゆうパケットプラス専用BOX 20枚セット',
    description: '厚みのある衣類や雑貨の発送に必須。まとめて購入することで、直前にコンビニ等で高値で買い足す手間を省きます。',
    priceText: '約 ￥1,400',
    imageUrl: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/s?k=%E5%AE%85%E6%80%A5%E4%BE%BF%E3%82%B3%E3%83%B3%E3%83%91%E3%82%AF%E3%83%88+%E5%B0%82%E7%94%A8BOX',
    context: 'shipping',
    sizeTarget: ['宅急便コンパクト', 'ゆうパケットプラス']
  },
  {
    id: 'ad-box-60size',
    title: 'ダンボール箱 60サイズ (無地・組み立てカンタン) 10枚セット',
    description: '3辺合計60cm以内の配送に対応。引っ越しや書籍、小さめの衣服の発送に。まとめ買いで梱包コストを賢く削減しましょう！',
    priceText: '約 ￥1,200',
    imageUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/s?k=%E3%83%80%E3%83%B3%E3%83%9C%E3%83%BC%E3%83%AB+60%E3%82%B5%E3%82%A4%E3%82%BA',
    context: 'shipping',
    sizeTarget: ['宅急便60サイズ', 'ゆうパック60サイズ']
  },
  {
    id: 'ad-measure',
    title: '厚さ測定定規 (1cm/2cm/3cm対応) アクリル製',
    description: '発送前の厚みオーバーを確実に防止！郵便局やコンビニのレジで突き返されるあの「気まずいストレス」から永久に解放されます。',
    priceText: '約 ￥800',
    imageUrl: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/s?k=%E5%8E%9A%E3%81%95%E6%B8%AC%E5%AE%9A%E5%AE%9A%E8%A6%8F',
    context: 'dashboard'
  },
  {
    id: 'ad-opp',
    title: 'OPP袋 A4サイズ テープ付き 100枚入り',
    description: '雨の日の水濡れ防止に必須！商品を綺麗に包むだけで、購入者の第一印象がアップし高評価率が高まります。',
    priceText: '約 ￥600',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed716d40f?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/s?k=OPP%E8%A2%8B+A4',
    context: 'dashboard'
  },
  {
    id: 'ad-light',
    title: 'LEDリングライト 撮影用 スマホスタンド付き',
    description: '暗い部屋でも商品写真のクオリティが劇的にアップ！明るく魅力的な写真に仕上げて、即売却スピードを高めましょう。',
    priceText: '約 ￥2,000',
    imageUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=400&q=80',
    affiliateUrl: 'https://www.amazon.co.jp/s?k=LED%E3%83%AA%E3%83%B3%E3%82%B0%E3%83%A9%E3%82%A4%E3%83%88',
    context: 'dashboard'
  }
]
