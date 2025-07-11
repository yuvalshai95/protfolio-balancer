import { Asset, AllocationResult } from '../types';

export const calculateOptimalAllocation = (
  assets: Asset[],
  additionalInvestment: number
): AllocationResult[] => {
  const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalFutureValue = totalCurrentValue + additionalInvestment;

  return assets.map(asset => {
    const targetValue = (totalFutureValue * asset.targetAllocation) / 100;
    const requiredInvestment = Math.max(0, targetValue - asset.currentValue);
    const shares = requiredInvestment / asset.price;

    return {
      symbol: asset.symbol,
      name: asset.name,
      currentValue: asset.currentValue,
      targetValue,
      recommendedInvestment: requiredInvestment,
      shares,
      price: asset.price,
    };
  }).sort((a, b) => b.recommendedInvestment - a.recommendedInvestment);
};

export const validatePortfolio = (assets: Asset[]): boolean => {
  const totalAllocation = assets.reduce((sum, asset) => sum + asset.targetAllocation, 0);
  return Math.abs(totalAllocation - 100) < 0.01;
};