/**
 * Registry de eventos do iBreathwork.
 * Cada evento = 1 aba da planilha com o mesmo layout de 123 colunas.
 *
 * Para adicionar novo evento:
 * 1. Confirmar que a aba tem o MESMO layout (mesmas colunas que EVENTO MAIO)
 * 2. Adicionar entry abaixo com `enabled: true`
 * 3. Redeployar
 */
export interface EventConfig {
  id: string;
  label: string;
  sheetTab: string;
  /** Range A1 da aba (inclui header na primeira linha). */
  range: string;
  enabled: boolean;
  dateLabel?: string;
  /** Descrição opcional mostrada no seletor. */
  description?: string;
}

export const EVENTS: EventConfig[] = [
  {
    id: 'maio-2026',
    label: 'Imersão Maio 2026',
    sheetTab: 'EVENTO MAIO',
    range: 'A1:CY79',
    enabled: true,
    dateLabel: 'Maio 2026',
    description: 'Evento presencial iBreathwork — Maio 2026',
  },
  // Adicione novos eventos aqui:
  // {
  //   id: 'agosto-2026',
  //   label: 'Imersão Agosto 2026',
  //   sheetTab: 'EVENTO AGOSTO',
  //   range: 'A1:CY79',
  //   enabled: true,
  //   dateLabel: 'Agosto 2026',
  // },
];

export function getEnabledEvents(): EventConfig[] {
  return EVENTS.filter((e) => e.enabled);
}

export function getEventById(id: string): EventConfig | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function getDefaultEvent(): EventConfig | undefined {
  return getEnabledEvents()[0];
}
