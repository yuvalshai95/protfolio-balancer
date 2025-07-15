import React from 'react';
import { Calculator, Target, TrendingUp } from 'lucide-react';
import { AllocationResult } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/component-library/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/component-library/alert';
import { formatNumber } from '@/utils/formatting';

interface AllocationResultsProps {
  results: AllocationResult[];
  totalAdditionalInvestment: number;
}

export const AllocationResults: React.FC<AllocationResultsProps> = ({
  results,
  totalAdditionalInvestment,
}) => {
  const totalAllocated = results.reduce(
    (sum, result) => sum + result.investmentAmount,
    0
  );
  const remainder = totalAdditionalInvestment - totalAllocated;

  // Calculate total current portfolio value (before additional investment)
  const totalCurrentPortfolioValue = results.reduce(
    (sum, result) => sum + result.currentValue,
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle>Investment Recommendations</CardTitle>
            <CardDescription>
              Optimal allocation to achieve your target percentages
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mb-6">
          {results.map(result => {
            // Calculate current percentage before investment
            const currentPercentage =
              totalCurrentPortfolioValue > 0
                ? (result.currentValue / totalCurrentPortfolioValue) * 100
                : 0;

            return (
              <Card key={result.symbol}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                          {result.symbol}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">{result.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm sm:text-lg font-bold text-green-600 whitespace-nowrap">
                        ₪{formatNumber(result.investmentAmount)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        {result.shares} shares
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-2 sm:mt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 sm:gap-x-4 gap-y-2 sm:gap-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-600">Current Value:</span>
                        <div className="font-medium text-gray-500 whitespace-nowrap">
                          ₪{formatNumber(result.currentValue)}
                        </div>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-600">Current % in Portfolio:</span>
                        <div className="font-medium text-gray-500 whitespace-nowrap">
                          {currentPercentage.toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-600">Target %:</span>
                        <div className="font-medium text-blue-600 whitespace-nowrap">
                          {result.targetAllocation.toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-600">New Value:</span>
                        <div className="font-medium whitespace-nowrap">
                          ₪{formatNumber(result.newValue)}
                        </div>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-600">New % in Portfolio:</span>
                        <div className="font-medium whitespace-nowrap">
                          {result.newPortfolioPercentage.toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-600">New Diff from Target:</span>
                        <div
                          className={`font-medium whitespace-nowrap ${
                            result.newDifferenceFromTarget < 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                          {result.newDifferenceFromTarget.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Allocated:</span>
            <span className="font-semibold">₪{formatNumber(totalAllocated)}</span>
          </div>
          {remainder > 0.01 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Remaining:</span>
              <span className="font-semibold text-orange-600">
                ₪{formatNumber(remainder)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Additional Investment:</span>
            <span className="text-blue-600">
              ₪{formatNumber(totalAdditionalInvestment)}
            </span>
          </div>
        </div>

        {remainder > 0.01 && (
          <Alert className="mt-4">
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              ₪{formatNumber(remainder)} remains unallocated. This is because no single
              available share purchase could further improve the portfolio balance.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
