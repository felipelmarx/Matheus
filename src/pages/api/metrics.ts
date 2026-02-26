import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchMetricsFromSheets } from '@/lib/googleSheets';
import { DashboardData } from '@/types/metrics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await fetchMetricsFromSheets();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}
