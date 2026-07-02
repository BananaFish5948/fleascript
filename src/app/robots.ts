import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://fleascript.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/'], // 管理画面やAPI、決済画面はクロールさせない
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
