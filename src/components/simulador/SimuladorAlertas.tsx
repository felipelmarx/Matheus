import type { SimuladorAlert } from '@/hooks/useSimulador';
import { AlertTriangle, XCircle, Info } from 'lucide-react';

interface SimuladorAlertasProps {
  alerts: SimuladorAlert[];
}

const alertConfig = {
  danger: {
    icon: XCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconColor: 'text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconColor: 'text-blue-400',
  },
};

export default function SimuladorAlertas({ alerts }: SimuladorAlertasProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const config = alertConfig[alert.level];
        const Icon = config.icon;
        return (
          <div
            key={i}
            className={`flex items-start gap-2.5 px-4 py-2.5 rounded-lg border ${config.bg} ${config.border}`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
            <p className={`text-xs font-heading ${config.text}`}>
              {alert.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
