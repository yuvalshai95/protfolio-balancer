import React, { useState } from 'react';
import {
  Trash2,
  RefreshCw,
  Clock,
  AlertCircle,
  Minus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Asset } from '@/types';
import { formatPrice, formatTimeSinceUpdate, isAssetStale } from '@/utils/formatting';
import { Badge } from '@/components/component-library/badge';

interface AssetCardProps {
  asset: Asset;
  onUpdateAllocation: (symbol: string, allocation: number) => void;
  onUpdateCurrentValue: (symbol: string, value: number) => void;
  onRemoveAsset: (symbol: string) => void;
  onRefreshSingle?: (asset: Asset) => Promise<void>;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onUpdateAllocation,
  onUpdateCurrentValue,
  onRemoveAsset,
  onRefreshSingle,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isStale = isAssetStale(asset.lastUpdated);
  const timeSinceUpdate = formatTimeSinceUpdate(asset.lastUpdated);

  const handleRefresh = async () => {
    if (!onRefreshSingle || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefreshSingle(asset);
    } catch (error) {
      console.error('Failed to refresh asset:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full">
      {/* Header */}
      <header className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div className="bg-green-100 w-12 h-12 rounded-full mr-4 shrink-0 relative">
            <span
              className="text-green-600 text-3xl font-bold absolute inset-0 flex items-center justify-center"
              style={{ lineHeight: '1', transform: 'translateY(-4px)' }}>
              ₪
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-lg font-bold text-gray-800 leading-tight cursor-help"
              title={asset.name}>
              {asset.name}
            </h2>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-500">{asset.symbol} (Symbol)</p>
              {asset.exchange === 'TA' && (
                <Badge
                  variant="secondary"
                  className="!px-1.5 !py-0 !text-[10px] bg-blue-500 text-white border-0 hover:bg-blue-500">
                  TA Exchange
                </Badge>
              )}
              {asset.exchange === 'US' && (
                <Badge
                  variant="default"
                  className="!px-1.5 !py-0 !text-[10px] bg-indigo-500 text-white border-0 hover:bg-indigo-500">
                  US Exchange
                </Badge>
              )}
              {asset.exchange && asset.exchange !== 'TA' && asset.exchange !== 'US' && (
                <Badge
                  variant="outline"
                  className="!px-1.5 !py-0 !text-[10px] bg-purple-500 text-white border-0 hover:bg-purple-500">
                  {asset.exchange} Exchange
                </Badge>
              )}
              {isStale && (
                <Badge
                  variant="destructive"
                  className="!px-1.5 !py-0 !text-[10px] bg-red-500 text-white border-0 hover:bg-red-500">
                  Stale Data
                </Badge>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemoveAsset(asset.symbol)}
          className="text-gray-400 hover:text-gray-600 p-1">
          <Trash2 className="h-5 w-5" />
        </button>
      </header>

      {/* Price and Update Section */}
      <div className="mb-6">
        <p className="text-3xl font-bold text-gray-800 mb-2 tabular-nums">
          {isNaN(asset.price) ? '₪0.00' : formatPrice(asset.price, asset.exchange)}
        </p>
        {asset.lastPrice && (
          <div className="text-xs -mt-1 mb-1">
            {asset.price > asset.lastPrice ? (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>
                  was {formatPrice(asset.lastPrice, asset.exchange)} (+
                  {formatPrice(asset.price - asset.lastPrice, asset.exchange)})
                </span>
              </div>
            ) : asset.price < asset.lastPrice ? (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-3 w-3" />
                <span>
                  was {formatPrice(asset.lastPrice, asset.exchange)} (
                  {formatPrice(asset.price - asset.lastPrice, asset.exchange)})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <Minus className="h-3 w-3" />
                <span>Price unchanged</span>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {onRefreshSingle ? (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-blue-600 hover:underline disabled:opacity-50">
                {isRefreshing ? 'Updating...' : 'Update Price'}
              </button>
            ) : (
              <span className="text-gray-400">No updates available</span>
            )}
          </div>
          <div
            className={`flex items-center ${
              isStale ? 'text-orange-500' : 'text-gray-500'
            }`}>
            <Clock className="h-4 w-4 mr-1" />
            <span>{timeSinceUpdate}</span>
            {isStale && (
              <span title="Price may be outdated">
                <AlertCircle className="h-4 w-4 ml-1" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form Inputs */}
      <div className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`target-allocation-${asset.symbol}`}>
            Target Allocation (%)
          </label>
          <input
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            id={`target-allocation-${asset.symbol}`}
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={asset.targetAllocation || ''}
            onChange={e =>
              onUpdateAllocation(asset.symbol, parseFloat(e.target.value) || 0)
            }
            placeholder="0.0"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`current-value-${asset.symbol}`}>
            Current Value ({asset.exchange === 'TA' ? '₪' : '$'})
          </label>
          <input
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            id={`current-value-${asset.symbol}`}
            type="number"
            min="0"
            step="0.01"
            value={asset.currentValue || ''}
            onChange={e =>
              onUpdateCurrentValue(asset.symbol, parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};
