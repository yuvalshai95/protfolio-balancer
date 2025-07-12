import { Asset, AllocationResult } from '../types';

export const calculateOptimalAllocation = (
  assets: Asset[],
  additionalInvestment: number
): AllocationResult[] => {
  if (additionalInvestment <= 0 || assets.length === 0) {
    return [];
  }

  let remainingInvestment = additionalInvestment;
  const sharesToBuy: { [symbol: string]: number } = Object.fromEntries(
    assets.map(asset => [asset.symbol, 0])
  );

  const currentAssetValues: { [symbol: string]: number } = Object.fromEntries(
    assets.map(asset => [asset.symbol, asset.currentValue])
  );

  let totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  const calculateDeviation = (
    values: { [symbol: string]: number },
    totalValue: number
  ): number => {
    return assets.reduce((deviation, asset) => {
      const currentPercentage = (values[asset.symbol] / totalValue) * 100;
      const diff = currentPercentage - asset.targetAllocation;
      return deviation + diff * diff;
    }, 0);
  };

  while (true) {
    let bestAssetToBuy: Asset | null = null;
    let minDeviation = -1;

    for (const asset of assets) {
      if (remainingInvestment >= asset.price) {
        const tempValues = { ...currentAssetValues };
        tempValues[asset.symbol] += asset.price;
        const tempTotalValue = totalPortfolioValue + asset.price;
        const deviation = calculateDeviation(tempValues, tempTotalValue);

        if (minDeviation === -1 || deviation < minDeviation) {
          minDeviation = deviation;
          bestAssetToBuy = asset;
        }
      }
    }

    if (bestAssetToBuy) {
      const price = bestAssetToBuy.price;
      const symbol = bestAssetToBuy.symbol;

      remainingInvestment -= price;
      sharesToBuy[symbol]++;
      currentAssetValues[symbol] += price;
      totalPortfolioValue += price;
    } else {
      break;
    }
  }

  const newTotalPortfolioValue = totalPortfolioValue;

  return assets
    .map(asset => {
      const shares = sharesToBuy[asset.symbol];
      const investmentAmount = shares * asset.price;
      const newValue = asset.currentValue + investmentAmount;
      const newPortfolioPercentage = (newValue / newTotalPortfolioValue) * 100;
      const newDifferenceFromTarget = newPortfolioPercentage - asset.targetAllocation;

      return {
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        currentValue: asset.currentValue,
        targetAllocation: asset.targetAllocation,
        investmentAmount,
        shares,
        newValue,
        newPortfolioPercentage,
        newDifferenceFromTarget,
      };
    })
    .sort((a, b) => b.investmentAmount - a.investmentAmount);
};

export const validatePortfolio = (assets: Asset[]): boolean => {
  const totalAllocation = assets.reduce((sum, asset) => sum + asset.targetAllocation, 0);
  return Math.abs(totalAllocation - 100) < 0.01;
};
