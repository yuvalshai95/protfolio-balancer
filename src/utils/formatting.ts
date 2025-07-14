// Format price with commas and appropriate currency symbol
export const formatPrice = (price: number, exchange?: string): string => {
  const currency = exchange === 'TA' ? '₪' : '$';
  const formattedNumber = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency}${formattedNumber}`;
};

// Format number with commas (no currency)
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format time since last update
export const formatTimeSinceUpdate = (lastUpdated?: number): string => {
  if (!lastUpdated) {
    return 'Never updated';
  }

  const now = Date.now();
  const diffMs = now - lastUpdated;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)); // Use Math.round for more accurate day calculation

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
};

// Check if asset needs updating (older than 1 hour)
export const isAssetStale = (lastUpdated?: number): boolean => {
  if (!lastUpdated) return true;

  const now = Date.now();
  const diffMs = now - lastUpdated;
  const oneHour = 1000 * 60 * 60; // 1 hour in milliseconds

  return diffMs > oneHour;
};
