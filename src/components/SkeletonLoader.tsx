import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  text?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  text = '調律中...' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
      {/* アニメーションするスケルトンエリア */}
      <div 
        className="w-full max-w-sm h-32 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-base) 50%, var(--color-bg-surface) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2.5s infinite linear'
        }}
      ></div>
      
      <div className="flex items-center space-x-2 animate-fade-in-up">
        {/* 小さなインジケーター（メーター風） */}
        <div className="w-4 h-4 rounded-full bg-[var(--color-brand)] animate-pulse-glow"></div>
        <p className="text-[var(--color-text-secondary)] font-medium text-sm tracking-widest">
          {text}
        </p>
      </div>
    </div>
  );
};
