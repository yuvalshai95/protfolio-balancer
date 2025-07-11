import React from 'react';
import { PieChart, DollarSign, Percent } from 'lucide-react';
import { Asset } from '../types';

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
  const totalTargetAllocation = assets.reduce((sum, asset) => sum + asset.targetAllocation, 0);
  const isValidAllocation = Math.abs(totalTargetAllocation - 100) < 0.01;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <PieChart className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Portfolio Summary</h2>
          <p className="text-sm text-gray-600">Current portfolio value and investment planning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Current Portfolio Value</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ${totalCurrentValue.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Target Allocation</span>
          </div>
          <div className={`text-2xl font-bold ${isValidAllocation ? 'text-green-900' : 'text-red-600'}`}>
            {totalTargetAllocation.toFixed(1)}%
          </div>
          {!isValidAllocation && (
            <p className="text-xs text-red-600 mt-1">Should total 100%</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Investment Amount ($)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={additionalInvestment || ''}
          onChange={(e) => onAdditionalInvestmentChange(parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
          placeholder="0.00"
        />
      </div>

      {!isValidAllocation && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your target allocations should total 100% for accurate calculations.
          </p>
        </div>
      )}
    </div>
  );
};