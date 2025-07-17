import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  RefreshCw,
  Clock,
  AlertCircle,
  Minus,
  TrendingUp,
  TrendingDown,
  X,
  PieChart,
  Info,
  Edit2,
  Save,
  Loader2,
} from 'lucide-react';
import { Asset } from '@/types';
import { formatPrice, formatTimeSinceUpdate, isAssetStale } from '@/utils/formatting';
import { Badge } from '@/components/component-library/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/component-library/alert-dialog';

interface AssetCardProps {
  asset: Asset;
  totalPortfolioValue: number;
  onUpdateAllocation: (symbol: string, allocation: number) => void;
  onUpdateCurrentValue: (symbol: string, value: number) => void;
  onRemoveAsset: (symbol: string) => Promise<void> | void;
  onRefreshSingle?: (asset: Asset) => Promise<void>;
  onAssetRename: (symbol: string, newName: string) => void;
  assets: Asset[]; // Need this for uniqueness validation
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  totalPortfolioValue,
  onUpdateAllocation,
  onUpdateCurrentValue,
  onRemoveAsset,
  onRefreshSingle,
  onAssetRename,
  assets,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPriceTooltip, setShowPriceTooltip] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for inline editing
  const [editingAsset, setEditingAsset] = useState(false);
  const [tempName, setTempName] = useState('');
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isStale = isAssetStale(asset.lastUpdated);
  const timeSinceUpdate = formatTimeSinceUpdate(asset.lastUpdated);

  // Calculate current portfolio percentage
  const currentPercentage =
    totalPortfolioValue > 0 ? (asset.currentValue / totalPortfolioValue) * 100 : 0;

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingAsset && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingAsset]);

  /**
   * Validates asset name according to requirements
   */
  const validateAssetName = (name: string): string => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return 'Name cannot be empty';
    }

    if (trimmedName.length > 20) {
      return 'Name must be 20 characters or less';
    }

    // Check uniqueness among other assets
    const isUnique = !assets.some(
      a => a.symbol !== asset.symbol && a.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (!isUnique) {
      return 'Name must be unique among assets';
    }

    return '';
  };

  /**
   * Starts editing an asset name
   */
  const startEditing = () => {
    setEditingAsset(true);
    setTempName(asset.name);
    setValidationError('');
  };

  /**
   * Saves the edited asset name
   */
  const saveEdit = () => {
    const error = validateAssetName(tempName);
    if (error) {
      setValidationError(error);
      return;
    }

    const trimmedName = tempName.trim();
    onAssetRename(asset.symbol, trimmedName);
    cancelEdit();
  };

  /**
   * Cancels editing without saving
   */
  const cancelEdit = () => {
    setEditingAsset(false);
    setTempName('');
    setValidationError('');
  };

  /**
   * Handles keyboard events for the input
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  /**
   * Handles input blur with a small delay to allow button clicks
   */
  const handleBlur = () => {
    setTimeout(() => {
      if (editingAsset && !validationError) {
        saveEdit();
      }
    }, 100);
  };

  /**
   * Handles asset deletion with loading state
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onRemoveAsset(asset.symbol);
    } catch (error) {
      console.error('Failed to delete asset:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    if (!onRefreshSingle || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefreshSingle(asset);
    } catch (error) {
      console.error('Failed to refresh asset:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const togglePriceTooltip = () => {
    setShowPriceTooltip(!showPriceTooltip);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg w-full">
      {/* Header */}
      <header className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-start min-w-0 flex-1">
          <div className="bg-green-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 shrink-0 relative">
            <span
              className="text-green-600 text-xl sm:text-2xl md:text-xl lg:text-3xl font-bold absolute inset-0 flex items-center justify-center"
              style={{ lineHeight: '1', transform: 'translateY(-4px)' }}>
              ₪
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Inline Editing for Asset Name */}
            <div className="relative mb-1">
              {editingAsset ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                      className={`w-full px-2 py-1 text-base sm:text-lg font-bold border rounded transition-all duration-75 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 ${
                        validationError
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600'
                      }`}
                      placeholder="Asset name"
                      maxLength={20}
                    />
                    {validationError && (
                      <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400 whitespace-nowrap z-20">
                        {validationError}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={saveEdit}
                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-75 shrink-0"
                    title="Save">
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-75 shrink-0"
                    title="Cancel">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2
                    className="text-base sm:text-lg font-bold text-gray-800 leading-tight cursor-help truncate flex-1"
                    title={asset.name}>
                    {asset.name}
                  </h2>
                  <button
                    onClick={startEditing}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-75 shrink-0"
                    title="Edit name">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mb-1">
              <p className="text-sm text-gray-500 mb-1">{asset.symbol} (Symbol)</p>
              <div className="flex items-center flex-wrap gap-1">
                {asset.exchange === 'TA' && (
                  <Badge
                    variant="secondary"
                    className="!px-1.5 !py-0 !text-[10px] bg-blue-500 text-white border-0 hover:bg-blue-500 whitespace-nowrap">
                    TA Exchange
                  </Badge>
                )}
                {asset.exchange === 'US' && (
                  <Badge
                    variant="default"
                    className="!px-1.5 !py-0 !text-[10px] bg-indigo-500 text-white border-0 hover:bg-indigo-500 whitespace-nowrap">
                    US Exchange
                  </Badge>
                )}
                {asset.exchange && asset.exchange !== 'TA' && asset.exchange !== 'US' && (
                  <Badge
                    variant="outline"
                    className="!px-1.5 !py-0 !text-[10px] bg-purple-500 text-white border-0 hover:bg-purple-500 whitespace-nowrap">
                    {asset.exchange} Exchange
                  </Badge>
                )}
                {isStale && (
                  <Badge
                    variant="destructive"
                    className="!px-1.5 !py-0 !text-[10px] bg-red-500 text-white border-0 hover:bg-red-500 whitespace-nowrap">
                    Stale Data
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Delete Confirmation Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
              title="Delete asset">
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Asset</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{asset.name}</strong>? This action
                cannot be undone and will remove this asset from your portfolio.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-500 focus:ring-red-500">
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      {/* Price and Update Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 tabular-nums">
            {isNaN(asset.price) ? '₪0.00' : formatPrice(asset.price, asset.exchange)}
          </p>
          <div className="relative">
            <button
              onClick={togglePriceTooltip}
              onMouseEnter={() => setShowPriceTooltip(true)}
              onMouseLeave={() => setShowPriceTooltip(false)}
              className="text-gray-400 p-1 rounded-full cursor-help"
              aria-label="Price information">
              <Info className="h-4 w-4" />
            </button>
            {showPriceTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                This price is the last known previous closing price
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>
        {asset.lastPrice && (
          <div className="text-xs -mt-1 mb-1">
            {asset.price > asset.lastPrice ? (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>
                  was {formatPrice(asset.lastPrice, asset.exchange)} (+
                  {formatPrice(asset.price - asset.lastPrice, asset.exchange)})
                </span>
              </div>
            ) : asset.price < asset.lastPrice ? (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-3 w-3" />
                <span>
                  was {formatPrice(asset.lastPrice, asset.exchange)} (
                  {formatPrice(asset.price - asset.lastPrice, asset.exchange)})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <Minus className="h-3 w-3" />
                <span>Price unchanged</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2">
          <div className="flex items-center">
            {onRefreshSingle ? (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Updating...' : 'Update Price'}
              </button>
            ) : (
              <div className="flex items-center text-gray-400">
                <RefreshCw className="h-4 w-4 mr-1" />
                <span>No updates available</span>
              </div>
            )}
          </div>
          <div
            className={`flex items-center ${
              isStale ? 'text-orange-500' : 'text-gray-500'
            }`}>
            <Clock className="h-4 w-4 mr-1" />
            <span>{timeSinceUpdate}</span>
            {isStale && (
              <span title="Price may be outdated">
                <AlertCircle className="h-4 w-4 ml-1" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Current Portfolio Percentage */}
      <div className="mb-6 bg-purple-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">
            Current Portfolio Weight
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl sm:text-3xl font-bold text-purple-600">
            {currentPercentage.toFixed(2)}%
          </span>
          <span className="ml-2 text-sm text-gray-500">of total portfolio</span>
        </div>
      </div>

      {/* Form Inputs */}
      <div className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`target-allocation-${asset.symbol}`}>
            Target Allocation (%)
          </label>
          <div className="relative">
            <input
              className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            />
            {asset.targetAllocation > 0 && (
              <button
                type="button"
                onClick={() => onUpdateAllocation(asset.symbol, 0)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`current-value-${asset.symbol}`}>
            Current Value ({asset.exchange === 'TA' ? '₪' : '$'})
          </label>
          <div className="relative">
            <input
              className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              id={`current-value-${asset.symbol}`}
              type="number"
              min="0"
              step="0.01"
              value={asset.currentValue || ''}
              onChange={e =>
                onUpdateCurrentValue(asset.symbol, parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
            {asset.currentValue > 0 && (
              <button
                type="button"
                onClick={() => onUpdateCurrentValue(asset.symbol, 0)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
