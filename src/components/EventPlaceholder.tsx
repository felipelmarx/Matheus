import { Clock } from 'lucide-react';

interface EventPlaceholderProps {
  label: string;
}

export default function EventPlaceholder({ label }: EventPlaceholderProps) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-12 text-center">
      <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-fg mb-2">{label}</h3>
      <p className="text-sm text-muted">
        Os dados deste evento estarão disponíveis em breve.
      </p>
    </div>
  );
}
