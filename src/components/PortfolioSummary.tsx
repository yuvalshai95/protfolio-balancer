import React from 'react';
import { PieChart, Percent, X, Calculator } from 'lucide-react';
import { Asset } from '../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/component-library/card';
import { Button } from '@/components/component-library/button';
import { Switch } from '@/components/component-library/switch';
import { Badge } from '@/components/component-library/badge';
import { formatNumber } from '@/utils/formatting';

interface PortfolioSummaryProps {
  assets: Asset[];
  additionalInvestment: number;
  isAutoCalculate: boolean;
  canCalculate: boolean;
  onAdditionalInvestmentChange: (amount: number) => void;
  onAutoCalculateChange: (auto: boolean) => void;
  onManualCalculate: () => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  assets,
  additionalInvestment,
  isAutoCalculate,
  canCalculate,
  onAdditionalInvestmentChange,
  onAutoCalculateChange,
  onManualCalculate,
}) => {
  const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalTargetAllocation = assets.reduce(
    (sum, asset) => sum + asset.targetAllocation,
    0
  );
  const isValidAllocation = Math.abs(totalTargetAllocation - 100) < 0.01;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <PieChart className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle>Portfolio Summary</CardTitle>
            <CardDescription>
              Current portfolio value and investment planning
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-800">
                Target Allocation
              </CardTitle>
              <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="mb-2">
                <div
                  className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 ${
                    isValidAllocation ? 'text-green-900' : 'text-red-600'
                  }`}>
                  {totalTargetAllocation.toFixed(1)}%
                </div>
                <div className="flex justify-start">
                  {isValidAllocation ? (
                    <Badge
                      variant="secondary"
                      className="!px-1 !py-0 !text-[9px] bg-green-500 text-white border-0 hover:bg-green-500 whitespace-nowrap">
                      Valid
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="!px-1 !py-0 !text-[9px] bg-red-500 text-white border-0 hover:bg-red-500 whitespace-nowrap">
                      Invalid
                    </Badge>
                  )}
                </div>
              </div>
              {!isValidAllocation && (
                <p className="text-xs text-red-600 mt-1">Should total 100%</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-800">
                Current Portfolio Value
              </CardTitle>
              <span className="text-blue-600 text-lg sm:text-xl font-bold flex-shrink-0">
                ₪
              </span>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">
                ₪{formatNumber(totalCurrentValue)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Mode Switch */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Calculation Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${
                  !isAutoCalculate ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                Manual
              </span>
              <Switch checked={isAutoCalculate} onCheckedChange={onAutoCalculateChange} />
              <span
                className={`text-xs ${
                  isAutoCalculate ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                Auto
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {isAutoCalculate
              ? 'Investment recommendations update automatically when you change values'
              : 'Click Calculate to generate investment recommendations manually'}
          </p>
        </div>

        <div className="mb-6">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="additional-investment">
            Additional Investment Amount (₪)
          </label>
          <div className="relative">
            <input
              className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              id="additional-investment"
              type="number"
              min="0"
              step="0.01"
              value={additionalInvestment || ''}
              onChange={e =>
                onAdditionalInvestmentChange(parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
            {additionalInvestment > 0 && (
              <button
                type="button"
                onClick={() => onAdditionalInvestmentChange(0)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Manual Calculate Button */}
        {!isAutoCalculate && additionalInvestment > 0 && isValidAllocation && (
          <div className="mb-6">
            <Button
              onClick={onManualCalculate}
              disabled={!canCalculate}
              className="w-full"
              size="sm">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Investment Recommendations
            </Button>
          </div>
        )}

        {!isValidAllocation && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your target allocations should total 100% for
              accurate calculations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
