import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchEventoMetrics } from '@/lib/googleSheets';
import { getEnabledEvents, getEventById } from '@/config/events';
import { clearCache } from '@/lib/cache';
import { EventData, MultiEventResponse } from '@/types/metrics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, refresh } = req.query;

    if (refresh === 'true') {
      clearCache();
    }

    if (event === 'all') {
      const enabledEvents = getEnabledEvents();
      const results: EventData[] = await Promise.all(
        enabledEvents.map(async (cfg) => ({
          eventId: cfg.id,
          eventLabel: cfg.label,
          metrics: await fetchEventoMetrics(cfg.sheetTab, cfg.range),
        }))
      );
      const response: MultiEventResponse = { events: results };
      return res.status(200).json(response);
    }

    if (event && typeof event === 'string') {
      const cfg = getEventById(event);
      if (!cfg) {
        return res.status(404).json({ error: `Event '${event}' not found` });
      }
      if (!cfg.enabled) {
        return res.status(200).json({ placeholder: true, label: cfg.label });
      }
      const metrics = await fetchEventoMetrics(cfg.sheetTab, cfg.range);
      return res.status(200).json(metrics);
    }

    const defaultEvent = getEnabledEvents()[0];
    if (!defaultEvent) {
      return res.status(404).json({ error: 'No events configured' });
    }
    const metrics = await fetchEventoMetrics(defaultEvent.sheetTab, defaultEvent.range);
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
