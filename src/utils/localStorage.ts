import { Asset } from '@/types';

const PORTFOLIO_STORAGE_KEY = 'portfolio_assets';
const ADDITIONAL_INVESTMENT_KEY = 'additional_investment';

export const savePortfolioToLocalStorage = (
  assets: Asset[],
  additionalInvestment: number
) => {
  try {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(assets));
    localStorage.setItem(ADDITIONAL_INVESTMENT_KEY, additionalInvestment.toString());
  } catch (error) {
    console.error('Failed to save portfolio to localStorage:', error);
  }
};

export const loadPortfolioFromLocalStorage = (): {
  assets: Asset[];
  additionalInvestment: number;
} => {
  try {
    const assetsData = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    const additionalInvestmentData = localStorage.getItem(ADDITIONAL_INVESTMENT_KEY);

    const assets = assetsData ? JSON.parse(assetsData) : [];
    const additionalInvestment = additionalInvestmentData
      ? parseFloat(additionalInvestmentData)
      : 0;

    return { assets, additionalInvestment };
  } catch (error) {
    console.error('Failed to load portfolio from localStorage:', error);
    return { assets: [], additionalInvestment: 0 };
  }
};

export const clearPortfolioFromLocalStorage = () => {
  try {
    localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    localStorage.removeItem(ADDITIONAL_INVESTMENT_KEY);
  } catch (error) {
    console.error('Failed to clear portfolio from localStorage:', error);
  }
};
