'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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
    { name: '手取り利益', value: 75000, fill: '#10b981' }, // emerald
    { name: '送料', value: 15000, fill: '#f59e0b' },      // amber
    { name: 'プラットフォーム手数料', value: 10000, fill: '#ef4444' },    // red
    { name: '仕入値', value: 30000, fill: '#6b7280' }     // gray
  ];

  const chartData = hasData ? data : mockData;

  const formatTooltip = (value: any) => {
    if (typeof value === 'number') {
      return `¥${value.toLocaleString()}`;
    }
    return value;
  };

  return (
    <div className="bg-white rounded-2xl p-6 relative overflow-hidden flex-1 shadow-inner border border-amber-100">
      <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
        📊 利益構成比率
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
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl">
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold text-sm shadow-sm mb-2 border border-amber-200">
              データ集計待ち
            </div>
            <p className="text-gray-500 text-xs font-medium max-w-[200px] text-center">
              商品が売却されると、ここに<br/>美しい利益構成グラフが描画されます
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PremiumChart;
