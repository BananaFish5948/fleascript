'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'

interface ChartData {
  name: string
  value: number
  fill: string
}

interface PremiumChartProps {
  data?: ChartData[]
}

const PremiumChart: React.FC<PremiumChartProps> = ({ data = [] }) => {
  const hasData = data && data.length > 0;

  // ダミーデータ（モック用の美しいグラフ）
  const mockData = [
    { name: '手取り利益', value: 75000, fill: '#5B6E53' }, // Deep Olive (Success)
    { name: '送料', value: 15000, fill: '#C29B62' },      // Mustard (Warning)
    { name: 'プラットフォーム手数料', value: 10000, fill: '#C4837A' },    // Dusty Red (Danger)
    { name: '仕入値', value: 30000, fill: '#8B9B9E' }     // Slate Blue (Info)
  ];

  const chartData = hasData ? data : mockData;

  const formatTooltip = (value: any) => {
    if (typeof value === 'number') {
      return `¥${value.toLocaleString()}`;
    }
    return value;
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] rounded-2xl p-6 relative overflow-hidden flex-1">
      <h4 className="text-xs font-medium tracking-[0.2em] text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
        <PieChartIcon size={16} strokeWidth={1.5} className="text-[var(--color-brand)]" />
        <span>利益構成比率</span>
      </h4>

      <div className="w-full h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Empty State Overlay */}
        {!hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--color-bg-surface)]/70 backdrop-blur-[2px] rounded-xl">
            <div className="bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] px-4 py-2 rounded-full font-medium tracking-widest text-[10px] shadow-sm mb-2 border border-[var(--color-border)]">
              データ集計待ち
            </div>
            <p className="text-[var(--color-text-secondary)] text-[10px] tracking-widest font-medium max-w-[200px] text-center leading-relaxed mt-2">
              商品が売却されると、ここに<br/>美しい利益構成グラフが描画されます
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PremiumChart;
