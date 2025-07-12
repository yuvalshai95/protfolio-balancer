import React from 'react';
import { Trash2, DollarSign } from 'lucide-react';
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

interface AssetCardProps {
  asset: Asset;
  onUpdateAllocation: (symbol: string, allocation: number) => void;
  onUpdateCurrentValue: (symbol: string, value: number) => void;
  onRemoveAsset: (symbol: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onUpdateAllocation,
  onUpdateCurrentValue,
  onRemoveAsset,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <CardTitle>{asset.symbol}</CardTitle>
                <CardDescription className="truncate max-w-48">
                  {asset.name}
                </CardDescription>
              </div>
            </div>
            <div className="text-lg font-semibold text-green-600">
              ${asset.price.toFixed(2)}
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
            <Label htmlFor={`current-value-${asset.symbol}`}>Current Value ($)</Label>
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
