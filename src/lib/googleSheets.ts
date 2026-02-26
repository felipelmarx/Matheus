import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { DashboardData, BestPerformer } from '@/types/metrics';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';

/**
 * Initialize Google Sheets JWT authentication
 */
function getAuth() {
  return new JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

/**
 * Fetch metrics data from Google Sheets
 */
export async function fetchMetricsFromSheets(): Promise<DashboardData> {
  try {
    if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
      console.error('Missing Google Sheets credentials');
      return getDefaultData();
    }

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, getAuth());
    await doc.loadInfo();

    // Assume sheets named: "Metrics", "Best Ads", "Best Pages"
    const metricsSheet = doc.sheetsByTitle['Metrics'];
    const adsSheet = doc.sheetsByTitle['Best Ads'];
    const pagesSheet = doc.sheetsByTitle['Best Pages'];

    if (!metricsSheet || !adsSheet || !pagesSheet) {
      console.error('Required sheets not found in spreadsheet');
      return getDefaultData();
    }

    // Load metrics data
    await metricsSheet.loadHeaderRow();
    const metricsRows = await metricsSheet.getRows();
    const metricsData = metricsRows[0];

    // Load best ads
    await adsSheet.loadHeaderRow();
    const adsRows = await adsSheet.getRows();
    const bestAds = adsRows.slice(0, 5).map((row, idx) => ({
      id: `ad-${idx}`,
      name: row.get('Ad Name') || '',
      value: parseFloat(row.get('Value') || '0'),
      percentage: parseFloat(row.get('Percentage') || '0'),
      rank: idx + 1,
    }));

    // Load best pages
    await pagesSheet.loadHeaderRow();
    const pagesRows = await pagesSheet.getRows();
    const bestPages = pagesRows.slice(0, 5).map((row, idx) => ({
      id: `page-${idx}`,
      name: row.get('Page Name') || '',
      value: parseFloat(row.get('Value') || '0'),
      percentage: parseFloat(row.get('Percentage') || '0'),
      rank: idx + 1,
    }));

    return {
      investedValue: parseFloat(metricsData?.get('Invested Value') || '0'),
      salesCount: parseInt(metricsData?.get('Sales Count') || '0'),
      cpa: parseFloat(metricsData?.get('CPA') || '0'),
      bestAds,
      bestPages,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return getDefaultData();
  }
}

/**
 * Default/mock data when sheets are unavailable
 */
function getDefaultData(): DashboardData {
  return {
    investedValue: 15250.5,
    salesCount: 342,
    cpa: 44.55,
    bestAds: [
      { id: 'ad-1', name: 'Campaign A - Facebook', value: 5200, percentage: 28.5, rank: 1 },
      { id: 'ad-2', name: 'Campaign B - Google', value: 4800, percentage: 26.3, rank: 2 },
      { id: 'ad-3', name: 'Campaign C - Instagram', value: 3450, percentage: 18.9, rank: 3 },
      { id: 'ad-4', name: 'Campaign D - TikTok', value: 2100, percentage: 11.5, rank: 4 },
      { id: 'ad-5', name: 'Campaign E - LinkedIn', value: 1800, percentage: 9.8, rank: 5 },
    ],
    bestPages: [
      { id: 'page-1', name: 'Home Page', value: 8500, percentage: 35.2, rank: 1 },
      { id: 'page-2', name: 'Product Page', value: 6200, percentage: 25.6, rank: 2 },
      { id: 'page-3', name: 'Pricing Page', value: 4100, percentage: 16.9, rank: 3 },
      { id: 'page-4', name: 'Blog Landing', value: 3200, percentage: 13.2, rank: 4 },
      { id: 'page-5', name: 'Thank You Page', value: 2400, percentage: 9.9, rank: 5 },
    ],
    lastUpdated: new Date().toISOString(),
  };
}
