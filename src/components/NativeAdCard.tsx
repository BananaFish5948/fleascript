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
    <div className={`relative overflow-hidden rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] hover:border-[var(--color-brand)] transition-all group ${className}`}>
      {/* "おすすめ (PR)" badge */}
      <div className="absolute top-0 right-0 bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] text-[10px] tracking-widest px-3 py-1 rounded-bl-lg font-medium z-10">
        おすすめツール (PR)
      </div>
      
      <a 
        href={ad.affiliateUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col sm:flex-row p-4 gap-4 items-center sm:items-stretch h-full relative"
      >
        <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)] overflow-hidden flex items-center justify-center relative">
          <img 
            src={ad.imageUrl} 
            alt={ad.title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            loading="lazy"
          />
        </div>
        
        <div className="flex flex-col justify-between flex-1 w-full text-left">
          <div>
            <h4 className="text-sm font-medium tracking-wide text-[var(--color-text-primary)] line-clamp-2 mb-1 group-hover:text-[var(--color-brand)] transition-colors">
              {ad.title}
            </h4>
            <p className="text-[10px] tracking-wider text-[var(--color-text-secondary)] line-clamp-2 mb-2 leading-relaxed">
              {ad.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-border)]">
            {ad.priceText ? (
              <span className="text-[10px] tracking-widest font-medium text-[var(--color-brand)] flex items-center gap-1">
                <Tag className="w-3 h-3" strokeWidth={1.5} />
                {ad.priceText}
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium tracking-widest text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand)] transition-colors">
              詳細を見る <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </a>
    </div>
  )
}
