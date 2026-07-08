import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AFFILIATE_ADS } from '@/lib/affiliateData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // DBからアフィリエイト広告データをフェッチ
    const { data: ads, error } = await supabase
      .from('affiliate_ads')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Database error while fetching affiliate ads, using local fallback:', error.message);
      return NextResponse.json(AFFILIATE_ADS);
    }

    // テーブルが存在しない場合や空データの場合のフォールバック
    if (!ads || ads.length === 0) {
      return NextResponse.json(AFFILIATE_ADS);
    }

    // DBから返されたスネークケースのカラム名をフロントエンドが期待するキャメルケースにマッピング
    // id, title, description, priceText, imageUrl, affiliateUrl, context, sizeTarget
    const formattedAds = ads.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      priceText: ad.price_text || undefined,
      imageUrl: ad.image_url,
      affiliateUrl: ad.affiliate_url,
      context: ad.context,
      sizeTarget: ad.size_target || undefined,
    }));

    return NextResponse.json(formattedAds);
  } catch (err: any) {
    console.error('Unexpected error in affiliate API, using local fallback:', err);
    return NextResponse.json(AFFILIATE_ADS);
  }
}
