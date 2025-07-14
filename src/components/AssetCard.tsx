import React, { useState } from 'react';
import { Trash2, DollarSign, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { Asset } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/component-library/card';
import { Input } from '@/components/component-library/input';
import { Label } from '@/components/component-library/label';
import { Button } from '@/components/component-library/button';
import { formatPrice, formatTimeSinceUpdate, isAssetStale } from '@/utils/formatting';

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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg shrink-0">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle
                  className="text-sm sm:text-base font-medium cursor-help leading-tight"
                  title={asset.name}>
                  {asset.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {asset.symbol} (Symbol)
                </CardDescription>
              </div>
            </div>

            {/* Price and Update Status */}
            <div className="flex items-start justify-between">
              <div className="text-sm sm:text-lg font-semibold text-green-600 tabular-nums">
                {isNaN(asset.price) ? '₪0.00' : formatPrice(asset.price, asset.exchange)}
              </div>
              <div className="flex flex-col items-end">
                {onRefreshSingle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-7 px-2 text-xs">
                    <RefreshCw
                      className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    {isRefreshing ? 'Updating...' : 'Update'}
                  </Button>
                )}

                {/* Last Update Status - positioned under the update button (or aligned right if no button) */}
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span
                    className={`text-xs ${
                      isStale ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                    {timeSinceUpdate}
                  </span>
                  {isStale && (
                    <span title="Price may be outdated">
                      <AlertCircle className="h-3 w-3 text-orange-500 ml-1" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveAsset(asset.symbol)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor={`target-allocation-${asset.symbol}`}>
              Target Allocation (%)
            </Label>
            <Input
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
              className="mt-2 focus-visible:ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor={`current-value-${asset.symbol}`}>
              Current Value ({asset.exchange === 'TA' ? '₪' : '$'})
            </Label>
            <Input
              id={`current-value-${asset.symbol}`}
              type="number"
              min="0"
              step="0.01"
              value={asset.currentValue || ''}
              onChange={e =>
                onUpdateCurrentValue(asset.symbol, parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              className="mt-2 focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
