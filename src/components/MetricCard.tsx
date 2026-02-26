import React from 'react';
import { MetricCard as MetricCardType } from '@/types/metrics';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  metric: MetricCardType;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const getTrendColor = () => {
    if (metric.changeType === 'increase') return 'text-green-600';
    if (metric.changeType === 'decrease') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (metric.changeType === 'increase') return <TrendingUp className="w-4 h-4" />;
    if (metric.changeType === 'decrease') return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{metric.label}</h3>
        {metric.change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-semibold">{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {typeof metric.value === 'number'
            ? metric.value.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : metric.value}
        </span>
        {metric.unit && <span className="text-gray-500 font-medium">{metric.unit}</span>}
      </div>
    </div>
  );
}
