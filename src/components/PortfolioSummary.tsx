import React from 'react';
import { PieChart, DollarSign, Percent } from 'lucide-react';
import { Asset } from '../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/component-library/card';
import { Input } from '@/components/component-library/input';
import { Label } from '@/components/component-library/label';

interface PortfolioSummaryProps {
  assets: Asset[];
  additionalInvestment: number;
  onAdditionalInvestmentChange: (amount: number) => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  assets,
  additionalInvestment,
  onAdditionalInvestmentChange,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Current Portfolio Value
              </CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                ${totalCurrentValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Target Allocation
              </CardTitle>
              <Percent className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  isValidAllocation ? 'text-green-900' : 'text-red-600'
                }`}>
                {totalTargetAllocation.toFixed(1)}%
              </div>
              {!isValidAllocation && (
                <p className="text-xs text-red-600 mt-1">Should total 100%</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Label htmlFor="additional-investment">Additional Investment Amount ($)</Label>
          <Input
            id="additional-investment"
            type="number"
            min="0"
            step="0.01"
            value={additionalInvestment || ''}
            onChange={e => onAdditionalInvestmentChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="mt-2 focus-visible:ring-blue-500"
          />
        </div>

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
