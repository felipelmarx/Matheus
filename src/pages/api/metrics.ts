import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchMetricsFromSheets, forceRefresh } from '@/lib/googleSheets';
import type { DashboardData } from '@/types/metrics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.query.refresh === 'true'
      ? await forceRefresh()
      : await fetchMetricsFromSheets();

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (error) {
    console.error('[api] Error:', error);
    return res.status(503).json({ error: 'Service unavailable' });
  }
}
