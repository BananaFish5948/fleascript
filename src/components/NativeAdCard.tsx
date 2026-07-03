'use client'

import { ExternalLink, Tag } from 'lucide-react'
import { NativeAdData } from '@/lib/affiliateData'

interface NativeAdCardProps {
  ad: NativeAdData
  subscriptionStatus: string
  className?: string
}

export default function NativeAdCard({ ad, subscriptionStatus, className = '' }: NativeAdCardProps) {
  // プレミアムユーザーには広告を表示しない（アドフリー体験）
  if (subscriptionStatus === 'premium') {
    return null
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group ${className}`}>
      {/* "おすすめ (PR)" badge */}
      <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-bl-lg font-medium z-10">
        おすすめツール (PR)
      </div>
      
      <a 
        href={ad.affiliateUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col sm:flex-row p-4 gap-4 items-center sm:items-stretch h-full relative"
      >
        <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center relative">
          <img 
            src={ad.imageUrl} 
            alt={ad.title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            loading="lazy"
          />
        </div>
        
        <div className="flex flex-col justify-between flex-1 w-full text-left">
          <div>
            <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
              {ad.title}
            </h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
              {ad.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
            {ad.priceText ? (
              <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {ad.priceText}
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700">
              詳細を見る <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </a>
    </div>
  )
}
