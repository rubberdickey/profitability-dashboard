import React from 'react';
import { Plus, X } from 'lucide-react';
import { Tier } from '../types';

interface TierEditorProps {
  tiers: Tier[];
  onChange: (tiers: Tier[]) => void;
  currency: string;
  usdRate: number;
}

const TierEditor: React.FC<TierEditorProps> = ({ tiers, onChange, currency, usdRate }) => {
  const updateTier = (index: number, field: keyof Tier, value: string | number) => {
    const newTiers = [...tiers];
    newTiers[index][field] = parseFloat(value.toString()) || 0;
    onChange(newTiers);
  };

  const addTier = () => {
    const lastMax = tiers.length > 0 ? tiers[tiers.length - 1].max : 0;
    onChange([...tiers, { min: lastMax + 1, max: 999, value: 0 }]);
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 uppercase mb-1 px-1">
        <div className="col-span-3">Min Pax</div>
        <div className="col-span-3">Max Pax</div>
        <div className="col-span-4 text-right">Price ({currency})</div>
        <div className="col-span-2"></div>
      </div>
      
      {tiers.map((tier, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200">
          <input 
            type="number" 
            value={tier.min} 
            onChange={(e) => updateTier(idx, 'min', e.target.value)} 
            className="col-span-3 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
          <input 
            type="number" 
            value={tier.max} 
            onChange={(e) => updateTier(idx, 'max', e.target.value)} 
            className="col-span-3 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
          <input 
            type="number" 
            value={(tier.value * (currency === 'USD' ? 1 : usdRate)).toFixed(2)} 
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const rate = currency === 'USD' ? 1 : usdRate;
              updateTier(idx, 'value', val / rate);
            }}
            className="col-span-4 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-right font-medium text-sm text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
          <div className="col-span-2 flex justify-end">
            <button 
              onClick={() => removeTier(idx)} 
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
      
      <button 
        onClick={addTier} 
        className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-3 px-1 py-1 hover:bg-blue-50 rounded transition-colors"
      >
        <Plus size={12} /> Add Pricing Tier
      </button>
    </div>
  );
};

export default TierEditor;