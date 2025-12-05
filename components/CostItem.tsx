import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { Cost } from '../types';

interface CostItemProps {
  item: Cost;
  currency: string;
  usdRate: number;
  onUpdate: (item: Cost) => void;
  onRemove: () => void;
}

const CostItem: React.FC<CostItemProps> = ({ item, currency, usdRate, onUpdate, onRemove }) => {
  const [localValue, setLocalValue] = useState<string>('');

  const getDisplayValue = useCallback((amountInUSD: number) => {
    // eslint-disable-next-line
    if (amountInUSD === undefined || amountInUSD === null || isNaN(amountInUSD)) return '';
    const rate = currency === 'USD' ? 1 : usdRate;
    return (amountInUSD * rate).toFixed(2);
  }, [currency, usdRate]);

  useEffect(() => {
    setLocalValue(getDisplayValue(item.amount));
  }, [item.amount, getDisplayValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const val = parseFloat(localValue);
    if (!isNaN(val)) {
      const rate = currency === 'USD' ? 1 : usdRate;
      onUpdate({ ...item, amount: val / rate });
    } else {
      setLocalValue(getDisplayValue(item.amount));
    }
  };

  const currencySymbol = useMemo(() => {
    switch (currency) {
      case 'EUR': return <Euro className="w-3 h-3" />;
      case 'GBP': return <PoundSterling className="w-3 h-3" />;
      case 'USD': default: return <DollarSign className="w-3 h-3" />;
    }
  }, [currency]);

  return (
    <div className="flex items-center space-x-2 p-2 bg-white border border-gray-100 rounded mb-2 hover:shadow-sm transition-shadow">
      <input
        type="text"
        value={item.name}
        onChange={(e) => onUpdate({ ...item, name: e.target.value })}
        className="flex-grow p-1 text-sm border-b border-transparent focus:border-indigo-500 outline-none text-gray-700 bg-transparent"
        placeholder="Cost Name"
      />
      <div className="flex items-center bg-gray-50 rounded px-2 border border-gray-200">
        <span className="text-gray-400 mr-1">{currencySymbol}</span>
        <input
          type="number"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-20 text-right p-1 bg-transparent outline-none text-gray-700 font-medium text-sm"
          placeholder="0.00"
          step="0.01"
        />
      </div>
      <button 
        onClick={onRemove} 
        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
        title="Remove Item"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default CostItem;
