import { Asset } from '@/types';

const API_KEY = import.meta.env.VITE_EODHD_API_KEY;
const API_BASE_URL = 'https://eodhd.com/api';

// --- Price Conversion Utilities ---

// Convert TA exchange prices from agorot to NIS (divide by 100)
const convertTaPrice = (price: number, exchange: string): number => {
  if (exchange === 'TA') {
    return price / 100; // Convert agorot to NIS
  }
  return price;
};

// --- API Response Interfaces ---

export interface EodhdSearchItem {
  Code: string;
  Exchange: string;
  Name: string;
  Type: string;
  Country: string;
  Currency: string;
  ISIN: string;
  previousClose: number;
  previousCloseDate: string;
}

export interface EodhdRealtimePrice {
  timestamp: number;
  gmtoffset: number;
  open: number;
  high: number;
  low: number;
  close: number; // This is the real-time price
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
}

export interface EodhdUserInfo {
  name: string;
  email: string;
  subscriptionType: string;
  paymentMethod: string;
  apiRequests: number; // Daily API calls used
  apiRequestsDate: string;
  dailyRateLimit: number;
  extraLimit?: number; // Remaining bonus calls (if any)
  inviteToken: string;
  inviteTokenClicked: number;
}

// --- API Usage Tracking ---

// Cache for user API data
let userApiCache: {
  data: EodhdUserInfo | null;
  timestamp: number;
} | null = null;

let isInitializing = false; // Prevent multiple simultaneous initialization calls
const USER_API_CACHE_TTL = 30 * 1000; // 30 seconds cache

// Fetch real usage data from EODHD User API with caching
const fetchUserApiData = async (): Promise<EodhdUserInfo | null> => {
  // Check cache first
  if (userApiCache && Date.now() - userApiCache.timestamp < USER_API_CACHE_TTL) {
    return userApiCache.data;
  }

  // Prevent multiple simultaneous API calls
  if (isInitializing) {
    // Wait for the ongoing request to complete
    let retries = 0;
    while (isInitializing && retries < 50) {
      // Max 5 seconds wait
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    // Return cached data if available after waiting
    if (userApiCache && Date.now() - userApiCache.timestamp < USER_API_CACHE_TTL) {
      return userApiCache.data;
    }
  }

  isInitializing = true;

  try {
    const response = await fetch(`${API_BASE_URL}/user?api_token=${API_KEY}&fmt=json`);

    if (!response.ok) {
      throw new Error(`User API responded with status: ${response.status}`);
    }

    const data: EodhdUserInfo = await response.json();

    // Cache the response
    userApiCache = {
      data,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    console.warn('Failed to fetch user API data, falling back to localStorage:', error);
    return null;
  } finally {
    isInitializing = false;
  }
};

const getTotalApiCallCount = (): number => {
  const count = localStorage.getItem('eodhdTotalApiCallCount');
  return count ? parseInt(count, 10) : 0;
};

const getDailyApiCallCount = (): number => {
  const count = localStorage.getItem('eodhdApiCallCount');
  const lastReset = localStorage.getItem('eodhdApiCallLastReset');
  const today = new Date().toISOString().split('T')[0];

  if (lastReset !== today) {
    localStorage.setItem('eodhdApiCallLastReset', today);
    localStorage.setItem('eodhdApiCallCount', '0');
    return 0;
  }

  return count ? parseInt(count, 10) : 0;
};

const incrementApiCallCount = () => {
  // Increment daily count
  const newDailyCount = getDailyApiCallCount() + 1;
  localStorage.setItem('eodhdApiCallCount', newDailyCount.toString());

  // Increment total count (for welcome bonus tracking)
  const newTotalCount = getTotalApiCallCount() + 1;
  localStorage.setItem('eodhdTotalApiCallCount', newTotalCount.toString());

  // Clear user API cache so next usage check gets fresh data
  clearUserApiCache();
};

// Export clear cache function for manual cache clearing if needed
export const clearUserApiCache = () => {
  userApiCache = null;
};

// Get user's name for welcome message
export const getUserName = async (): Promise<string | null> => {
  const userData = await fetchUserApiData();
  return userData?.name || null;
};

// Single function to get all API usage information with one API call
export const getApiUsageInfo = async (): Promise<{
  usage: { used: number; remaining: number; total: number; isWelcomeBonus: boolean };
  dailyUsage?: { used: number; remaining: number; total: number };
  limitReached: boolean;
  nearLimit: boolean;
}> => {
  // Try to get real usage data from server
  const userData = await fetchUserApiData();

  if (userData) {
    // Use real server data
    const dailyUsed = userData.apiRequests;
    const dailyLimit = userData.dailyRateLimit;
    const bonusRemaining = userData.extraLimit || 0;
    const welcomeBonusLimit = 500;

    if (bonusRemaining > 0) {
      // Still have welcome bonus calls
      const bonusUsed = welcomeBonusLimit - bonusRemaining;
      const usage = {
        used: bonusUsed,
        remaining: bonusRemaining,
        total: welcomeBonusLimit,
        isWelcomeBonus: true,
      };

      const dailyUsage = {
        used: dailyUsed,
        remaining: Math.max(0, dailyLimit - dailyUsed),
        total: dailyLimit,
      };

      return {
        usage,
        dailyUsage,
        limitReached: false,
        nearLimit: bonusUsed >= 450, // Warning at 450/500
      };
    } else {
      // No bonus calls, use daily limits
      const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
      const usage = {
        used: dailyUsed,
        remaining: dailyRemaining,
        total: dailyLimit,
        isWelcomeBonus: false,
      };

      return {
        usage,
        limitReached: dailyUsed >= dailyLimit,
        nearLimit: dailyUsed >= dailyLimit - 5, // Warning at dailyLimit-5
      };
    }
  }

  // Fallback to localStorage tracking
  const totalUsed = getTotalApiCallCount();
  const dailyUsed = getDailyApiCallCount();
  const welcomeBonusLimit = 500;
  const dailyLimit = 20;

  // Check if we're still in welcome bonus period
  const isWelcomeBonus = totalUsed < welcomeBonusLimit;

  if (isWelcomeBonus) {
    // Still have welcome bonus calls available
    const remaining = Math.max(0, welcomeBonusLimit - totalUsed);
    const usage = {
      used: totalUsed,
      remaining,
      total: welcomeBonusLimit,
      isWelcomeBonus: true,
    };

    const dailyUsage = {
      used: dailyUsed,
      remaining: Math.max(0, dailyLimit - dailyUsed),
      total: dailyLimit,
    };

    return {
      usage,
      dailyUsage,
      limitReached: false,
      nearLimit: totalUsed >= 450,
    };
  } else {
    // Back to daily limits
    const remaining = Math.max(0, dailyLimit - dailyUsed);
    const usage = {
      used: dailyUsed,
      remaining,
      total: dailyLimit,
      isWelcomeBonus: false,
    };

    return {
      usage,
      limitReached: dailyUsed >= dailyLimit,
      nearLimit: dailyUsed >= dailyLimit - 5,
    };
  }
};

export const hasHitApiLimit = async (): Promise<boolean> => {
  // Try to get real usage data from server
  const userData = await fetchUserApiData();

  if (userData) {
    // Use real server data
    const dailyUsed = userData.apiRequests;
    const dailyLimit = userData.dailyRateLimit;
    const bonusRemaining = userData.extraLimit || 0;

    if (bonusRemaining > 0) {
      // Still have welcome bonus calls
      return false;
    } else {
      // No bonus calls, check daily limit
      return dailyUsed >= dailyLimit;
    }
  }

  // Fallback to localStorage tracking
  const totalUsed = getTotalApiCallCount();
  const dailyUsed = getDailyApiCallCount();
  const welcomeBonusLimit = 500;
  const dailyLimit = 20;

  // Check if we're still in welcome bonus period
  if (totalUsed < welcomeBonusLimit) {
    return false; // Still have welcome bonus calls available
  }

  // Welcome bonus exhausted, check daily limit
  return dailyUsed >= dailyLimit;
};

export const isNearApiLimit = async (): Promise<boolean> => {
  // Try to get real usage data from server
  const userData = await fetchUserApiData();

  if (userData) {
    // Use real server data
    const dailyUsed = userData.apiRequests;
    const dailyLimit = userData.dailyRateLimit;
    const bonusRemaining = userData.extraLimit || 0;
    const welcomeBonusLimit = 500;

    if (bonusRemaining > 0) {
      // Still have welcome bonus calls, warn when close to exhaustion
      const bonusUsed = welcomeBonusLimit - bonusRemaining;
      return bonusUsed >= 450; // Warning at 450/500 welcome bonus calls
    } else {
      // No bonus calls, check daily limit warning
      return dailyUsed >= dailyLimit - 5; // Warning at dailyLimit-5
    }
  }

  // Fallback to localStorage tracking
  const totalUsed = getTotalApiCallCount();
  const dailyUsed = getDailyApiCallCount();
  const welcomeBonusLimit = 500;
  const dailyLimit = 20;

  // Check if we're still in welcome bonus period
  if (totalUsed < welcomeBonusLimit) {
    return totalUsed >= 450; // Warning at 450/500 welcome bonus calls
  } else {
    return dailyUsed >= dailyLimit - 5; // Warning at 15/20 daily calls
  }
};

// --- Caching ---

interface Cache<T> {
  [key: string]: {
    timestamp: number;
    data: T;
  };
}

const searchCache: Cache<EodhdSearchItem[]> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// --- API Functions ---

export const searchAssets = async (query: string): Promise<EodhdSearchItem[]> => {
  const cached = searchCache[query];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // The EODHD search API supports searching by symbol, name, and ISIN
    // Enhanced search supports partial name matching and ISIN searches
    const response = await fetch(
      `${API_BASE_URL}/search/${encodeURIComponent(query)}?api_token=${API_KEY}&fmt=json`
    );
    incrementApiCallCount();

    if (!response.ok) {
      // Handle specific API quota errors
      if (response.status === 429 || response.status === 403) {
        throw new Error('API quota has been exceeded. Please try again tomorrow.');
      }
      throw new Error(`EODHD API responded with status: ${response.status}`);
    }

    const data: EodhdSearchItem[] = await response.json();

    // Convert prices for all items (TA exchange prices need conversion)
    const convertedData = data.map(item => ({
      ...item,
      previousClose: convertTaPrice(item.previousClose, item.Exchange),
    }));

    // Sort results with TA exchange first, then alphabetically by name
    const sortedData = convertedData.sort((a, b) => {
      // TA exchange items first
      if (a.Exchange === 'TA' && b.Exchange !== 'TA') return -1;
      if (a.Exchange !== 'TA' && b.Exchange === 'TA') return 1;
      // Then sort alphabetically by name
      return a.Name.localeCompare(b.Name);
    });

    searchCache[query] = { timestamp: Date.now(), data: sortedData };
    return sortedData;
  } catch (error) {
    console.error('Error searching assets:', error);
    throw error;
  }
};

// Bulk refresh prices for multiple assets
export const refreshAssetPrices = async (assets: Asset[]): Promise<Asset[]> => {
  const refreshedAssets: Asset[] = [];

  for (const asset of assets) {
    try {
      const updatedAsset = await getRealtimePrice(
        asset.symbol,
        asset.exchange || 'TA',
        asset.name
      );
      refreshedAssets.push({
        ...asset, // Keep existing allocation and current value
        price: updatedAsset.price, // Update only the price
        lastUpdated: updatedAsset.lastUpdated, // Update timestamp
      });
    } catch (error) {
      console.warn(`Failed to refresh price for ${asset.symbol}:`, error);
      // Keep original asset if price refresh fails
      refreshedAssets.push(asset);
    }
  }

  return refreshedAssets;
};

export const getRealtimePrice = async (
  symbol: string,
  exchange: string,
  assetName?: string
): Promise<Asset> => {
  try {
    // Note: EODHD API often uses exchange-suffixed tickers like 'AAPL.US'
    const ticker = `${symbol}.${exchange}`;
    const response = await fetch(
      `${API_BASE_URL}/real-time/${ticker}?api_token=${API_KEY}&fmt=json`
    );
    incrementApiCallCount();

    if (!response.ok) {
      // Handle specific API quota errors
      if (response.status === 429 || response.status === 403) {
        throw new Error('API quota has been exceeded. Please try again tomorrow.');
      }
      throw new Error(`EODHD API responded with status: ${response.status}`);
    }

    const data: EodhdRealtimePrice = await response.json();

    // Use previousClose if close is not available or invalid
    let price = data.close;
    if (
      price === null ||
      price === undefined ||
      isNaN(price) ||
      typeof price === 'string'
    ) {
      price = data.previousClose;
    }

    // Convert price if it's from TA exchange
    const convertedPrice = convertTaPrice(price, exchange);

    const asset: Asset = {
      symbol: symbol,
      name: assetName || 'N/A', // Use provided name to avoid extra API call
      price: convertedPrice,
      currentValue: 0,
      targetAllocation: 0,
      exchange: exchange,
      lastUpdated: Date.now(),
    };

    return asset;
  } catch (error) {
    console.error(`Error fetching real-time price for ${symbol}:`, error);
    throw error;
  }
};

// Refresh price for a single asset
export const refreshSingleAssetPrice = async (asset: Asset): Promise<Asset> => {
  try {
    const updatedAsset = await getRealtimePrice(
      asset.symbol,
      asset.exchange || 'TA',
      asset.name
    );

    return {
      ...asset, // Keep existing allocation and current value
      price: updatedAsset.price, // Update only the price
      lastUpdated: updatedAsset.lastUpdated, // Update timestamp
    };
  } catch (error) {
    console.error(`Failed to refresh price for ${asset.symbol}:`, error);
    throw error;
  }
};
