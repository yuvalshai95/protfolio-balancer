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

interface AllocationResultsProps {
  results: AllocationResult[];
  totalAdditionalInvestment: number;
}

export const AllocationResults: React.FC<AllocationResultsProps> = ({
  results,
  totalAdditionalInvestment,
}) => {
  const totalRecommended = results.reduce(
    (sum, result) => sum + result.recommendedInvestment,
    0
  );
  const remainder = totalAdditionalInvestment - totalRecommended;

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
          {results.map(result => (
            <Card key={result.symbol}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.symbol}</h3>
                      <p className="text-sm text-gray-600 truncate max-w-64">
                        {result.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${result.recommendedInvestment.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.shares.toFixed(3)} shares
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Current Value:</span>
                    <div className="font-medium">${result.currentValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Target Value:</span>
                    <div className="font-medium">${result.targetValue.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Allocated:</span>
            <span className="font-semibold">${totalRecommended.toFixed(2)}</span>
          </div>
          {remainder > 0.01 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Remaining:</span>
              <span className="font-semibold text-orange-600">
                ${remainder.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Additional Investment:</span>
            <span className="text-blue-600">${totalAdditionalInvestment.toFixed(2)}</span>
          </div>
        </div>

        {remainder > 0.01 && (
          <Alert className="mt-4">
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              ${remainder.toFixed(2)} remains unallocated due to fractional share
              constraints. Consider adjusting your allocations or keeping this as cash.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
