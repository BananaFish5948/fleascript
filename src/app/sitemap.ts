import { MetadataRoute } from 'next'
import { seoCategories } from '@/data/seoCategories'

export default function sitemap(): MetadataRoute.Sitemap {
  // 本番デプロイ後、独自のドメインを取得した場合はここを変更します
  const baseUrl = 'https://fleascript.vercel.app'
  
  // カテゴリごとの動的ページのURLを生成
  const categoryUrls = Object.keys(seoCategories).map((id) => ({
    url: `${baseUrl}/template/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...categoryUrls,
  ]
}
