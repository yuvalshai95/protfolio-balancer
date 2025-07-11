import React from 'react';
import { Trash2, DollarSign } from 'lucide-react';
import { Asset } from '../types';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{asset.symbol}</h3>
              <p className="text-sm text-gray-600 truncate max-w-48">{asset.name}</p>
            </div>
          </div>
          <div className="text-lg font-semibold text-green-600">
            ${asset.price.toFixed(2)}
          </div>
        </div>
        <button
          onClick={() => onRemoveAsset(asset.symbol)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Allocation (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={asset.targetAllocation || ''}
            onChange={(e) => onUpdateAllocation(asset.symbol, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="0.0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Value ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={asset.currentValue || ''}
            onChange={(e) => onUpdateCurrentValue(asset.symbol, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};