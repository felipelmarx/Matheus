import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchEventoMetrics } from '@/lib/googleSheets';
import { getEnabledEvents, getEventById } from '@/config/events';
import type {
  EventData,
  MultiEventResponse,
  SingleEventResponse,
} from '@/types/metrics';

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MultiEventResponse | SingleEventResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, refresh } = req.query;
    const force = refresh === 'true' || refresh === '1';

    if (typeof event === 'string' && event.length > 0) {
      const cfg = getEventById(event);
      if (!cfg || !cfg.enabled) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const metrics = await fetchEventoMetrics(cfg.sheetTab, cfg.range, { force });
      const data: EventData = {
        eventId: cfg.id,
        eventLabel: cfg.label,
        dateLabel: cfg.dateLabel,
        metrics,
      };
      return res.status(200).json({ event: data });
    }

    const enabled = getEnabledEvents();
    const events: EventData[] = await Promise.all(
      enabled.map(async (cfg) => ({
        eventId: cfg.id,
        eventLabel: cfg.label,
        dateLabel: cfg.dateLabel,
        metrics: await fetchEventoMetrics(cfg.sheetTab, cfg.range, { force }),
      }))
    );

    return res.status(200).json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch metrics';
    return res.status(500).json({ error: message });
  }
}
