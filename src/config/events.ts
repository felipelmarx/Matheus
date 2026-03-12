export interface EventConfig {
  id: string;
  label: string;
  sheetTab: string;
  range: string;
  enabled: boolean;
  dateLabel?: string;
}

export const EVENTS: EventConfig[] = [
  {
    id: 'maio-2026',
    label: 'Evento Maio',
    sheetTab: 'EVENTO MAIO',
    range: 'CM17:CV79',
    enabled: true,
    dateLabel: 'Maio 2026',
  },
  {
    id: 'proximo-evento',
    label: 'Proximo Evento',
    sheetTab: '',
    range: 'CM17:CV79',
    enabled: false,
  },
];

export function getEnabledEvents(): EventConfig[] {
  return EVENTS.filter((e) => e.enabled);
}

export function getEventById(id: string): EventConfig | undefined {
  return EVENTS.find((e) => e.id === id);
}
