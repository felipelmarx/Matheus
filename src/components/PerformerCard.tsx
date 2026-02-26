import React from 'react';
import { BestPerformer } from '@/types/metrics';
import { Medal } from 'lucide-react';

interface PerformerCardProps {
  performer: BestPerformer;
  type: 'ad' | 'page';
}

export default function PerformerCard({ performer, type }: PerformerCardProps) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-700';
      case 2:
        return 'bg-gray-100 text-gray-700';
      case 3:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getBarColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500';
      case 2:
        return 'bg-gray-500';
      case 3:
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{performer.name}</h4>
          <p className="text-gray-500 text-xs mt-1">Rank #{performer.rank}</p>
        </div>
        <div className={`${getMedalColor(performer.rank)} rounded-full p-2 ml-2`}>
          <Medal className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold text-gray-900">
            {performer.value.toLocaleString('pt-BR')}
          </span>
          <span className="text-sm font-semibold text-gray-600">{performer.percentage}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`${getBarColor(performer.rank)} h-full rounded-full transition-all`}
            style={{ width: `${performer.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
