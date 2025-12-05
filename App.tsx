import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, DollarSign, TrendingUp, Activity, 
  Table as TableIcon, BarChart3, Users, Settings 
} from 'lucide-react';
import { Cost, Tier, PricingMode } from './types';
import { generateId, getTieredValue } from './utils';
import CostItem from './components/CostItem';
import CostCategory from './components/CostCategory';
import TierEditor from './components/TierEditor';
import BreakEvenChart from './components/BreakEvenChart';

const App = () => {
  // --- State ---
  const [fixedCosts, setFixedCosts] = useState<Cost[]>([
    { id: generateId(), name: 'Bus Rental (Day)', amount: 800 },
    { id: generateId(), name: 'Guide Fee', amount: 200 },
  ]);
  const [varCosts, setVarCosts] = useState<Cost[]>([
    { id: generateId(), name: 'Lunch per person', amount: 25 },
    { id: generateId(), name: 'Ticket Entry', amount: 15 },
  ]);
  
  const [maxCapacity, setMaxCapacity] = useState<number>(50);
  const [pricingMode, setPricingMode] = useState<PricingMode>('flat');
  const [sellingPrice, setSellingPrice] = useState<number>(150); // Flat Price USD
  const [priceTiers, setPriceTiers] = useState<Tier[]>([ // Tiered Price USD
      { min: 1, max: 10, value: 180 },
      { min: 11, max: 20, value: 160 },
      { min: 21, max: 999, value: 140 }
  ]);
  
  const [commissionPct, setCommissionPct] = useState<number>(20);
  const [currency, setCurrency] = useState<string>('USD');
  const [usdRate, setUsdRate] = useState<number>(1);

  // --- Actions ---
  const updateItem = useCallback((setter: React.Dispatch<React.SetStateAction<Cost[]>>, item: Cost) => {
    setter(prev => prev.map(i => (i.id === item.id ? item : i)));
  }, []);

  const removeItem = useCallback((setter: React.Dispatch<React.SetStateAction<Cost[]>>, id: number) => {
    setter(prev => prev.filter(i => i.id !== id));
  }, []);

  const addItem = useCallback((setter: React.Dispatch<React.SetStateAction<Cost[]>>, name: string) => {
    setter(prev => [...prev, { id: generateId(), name, amount: 0 }]);
  }, []);

  // --- Calculations ---
  const calculateTotal = (costs: Cost[]) => costs.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedUSD = useMemo(() => calculateTotal(fixedCosts), [fixedCosts]);
  const totalVarUSD = useMemo(() => calculateTotal(varCosts), [varCosts]);

  // Currency Formatter
  const formatCurrency = useCallback((amountUSD: number) => {
    const rate = currency === 'USD' ? 1 : usdRate;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amountUSD * rate);
  }, [currency, usdRate]);

  // Display Totals
  const totalFixedDisplay = useMemo(() => formatCurrency(totalFixedUSD), [totalFixedUSD, formatCurrency]);
  const totalVarDisplay = useMemo(() => formatCurrency(totalVarUSD), [totalVarUSD, formatCurrency]);

  // Simulate Exchange Rates
  useEffect(() => {
    let rate = 1;
    switch (currency) {
      case 'EUR': rate = 0.92; break;
      case 'GBP': rate = 0.79; break;
      default: rate = 1;
    }
    setUsdRate(rate);
  }, [currency]);

  // Helper to get revenue for N pax based on current mode
  const getGrossRevenue = useCallback((pax: number) => {
    if (pricingMode === 'flat') {
      return sellingPrice * pax;
    } else {
      const unitPrice = getTieredValue(priceTiers, pax);
      return unitPrice * pax;
    }
  }, [pricingMode, sellingPrice, priceTiers]);

  const getPricePerPax = useCallback((pax: number) => {
    if (pricingMode === 'flat') return sellingPrice;
    return getTieredValue(priceTiers, pax);
  }, [pricingMode, sellingPrice, priceTiers]);

  // --- Table Generation ---
  const tableData = useMemo(() => {
    const rows = [];
    for (let i = 1; i <= maxCapacity; i++) {
      const grossRev = getGrossRevenue(i);
      const unitPrice = getPricePerPax(i);
      const commission = (grossRev * commissionPct) / 100;
      const netRev = grossRev - commission;
      
      const tFixed = totalFixedUSD;
      const tVar = totalVarUSD * i;
      const tCost = tFixed + tVar;
      
      const profit = netRev - tCost;
      const margin = netRev > 0 ? (profit / netRev) * 100 : 0;

      rows.push({
        pax: i,
        unitPrice,
        grossRev,
        netRev,
        totalCost: tCost,
        profit,
        margin
      });
    }
    return rows;
  }, [maxCapacity, getGrossRevenue, getPricePerPax, commissionPct, totalFixedUSD, totalVarUSD]);

  // Find Break Even for Display
  const breakevenPax = useMemo(() => {
    const firstPositive = tableData.find(r => r.profit >= 0);
    return firstPositive ? firstPositive.pax : Infinity;
  }, [tableData]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BarChart3 size={24} />
            </div>
            Profitability Dashboard
          </h1>
          <p className="text-slate-500 ml-[52px] mt-1 text-sm font-medium">Advanced Cost & Pricing Analysis Tool</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-slate-50 px-4 py-2 rounded-lg border border-gray-200">
          <Settings className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-500 mr-2">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer text-sm"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: SETTINGS --- */}
        <div className="lg:col-span-4 space-y-6">
            
          {/* 1. Global Capacity */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
              <Users className="text-indigo-500" size={20} />
              Tour Capacity
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Pax Count</label>
              <input 
                type="number" 
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-2">Determines the upper limit for charts and tables.</p>
            </div>
          </div>

          {/* 2. Revenue & Pricing */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-emerald-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-50"></div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center relative z-10">
              <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
              Revenue Strategy
            </h2>
            
            <div className="space-y-4 relative z-10">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setPricingMode('flat')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${pricingMode === 'flat' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Flat Price
                </button>
                <button 
                  onClick={() => setPricingMode('tiered')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${pricingMode === 'tiered' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Tiered Price
                </button>
              </div>

              {pricingMode === 'flat' ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price ({currency})</label>
                  <input 
                    type="number" 
                    value={(sellingPrice * (currency === 'USD' ? 1 : usdRate)).toFixed(2)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const rate = currency === 'USD' ? 1 : usdRate;
                      setSellingPrice(val / rate);
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700"
                  />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tiered Pricing Rules</label>
                  <TierEditor tiers={priceTiers} onChange={setPriceTiers} currency={currency} usdRate={usdRate} />
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commission (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={commissionPct}
                    onChange={(e) => setCommissionPct(parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Costs */}
          <CostCategory 
            title="Fixed Costs" 
            icon={<Activity className="w-5 h-5 text-indigo-500" />} 
            total={totalFixedDisplay}
          >
            {fixedCosts.map(item => (
              <CostItem 
                key={item.id} 
                item={item} 
                currency={currency} 
                usdRate={usdRate} 
                onUpdate={(u) => updateItem(setFixedCosts, u)} 
                onRemove={() => removeItem(setFixedCosts, item.id)} 
              />
            ))}
            <button 
              onClick={() => addItem(setFixedCosts, 'New Fixed Cost')} 
              className="w-full mt-2 py-2 text-xs font-bold text-indigo-600 border border-dashed border-indigo-300 rounded hover:bg-indigo-50 flex justify-center items-center transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Fixed Cost
            </button>
          </CostCategory>

          <CostCategory 
            title="Variable Costs" 
            icon={<TrendingUp className="w-5 h-5 text-indigo-500" />} 
            total={totalVarDisplay}
          >
            {varCosts.map(item => (
              <CostItem 
                key={item.id} 
                item={item} 
                currency={currency} 
                usdRate={usdRate} 
                onUpdate={(u) => updateItem(setVarCosts, u)} 
                onRemove={() => removeItem(setVarCosts, item.id)} 
              />
            ))}
            <button 
              onClick={() => addItem(setVarCosts, 'New Var Cost')} 
              className="w-full mt-2 py-2 text-xs font-bold text-indigo-600 border border-dashed border-indigo-300 rounded hover:bg-indigo-50 flex justify-center items-center transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Variable Cost
            </button>
          </CostCategory>

        </div>

        {/* --- RIGHT COLUMN: VISUALIZATION --- */}
        <div className="lg:col-span-8 space-y-6">
            
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl shadow-sm border transition-all duration-300 ${breakevenPax !== Infinity ? 'bg-indigo-600 border-indigo-700 text-white shadow-indigo-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${breakevenPax !== Infinity ? 'text-indigo-200' : 'text-red-500'}`}>Breakeven</p>
              <p className="text-3xl font-extrabold mt-2">
                {breakevenPax === Infinity ? 'Never' : `${breakevenPax} Pax`}
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Max Profit</p>
              <p className="text-xl font-bold text-emerald-600 mt-2 truncate">
                {formatCurrency(tableData[tableData.length - 1]?.profit || 0)}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">@ {maxCapacity} Pax</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Min Profit</p>
              <p className="text-xl font-bold text-red-500 mt-2 truncate">
                {formatCurrency(tableData[0]?.profit || 0)}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">@ 1 Pax</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg Margin</p>
              <p className="text-xl font-bold text-blue-600 mt-2">
                {Math.round(tableData.reduce((acc, curr) => acc + curr.margin, 0) / tableData.length)}%
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Across all pax</p>
            </div>
          </div>

          {/* CHART */}
          <BreakEvenChart 
            fixedCost={totalFixedUSD}
            getRevenue={getGrossRevenue}
            getVarCost={(pax) => totalVarUSD * pax}
            maxPax={maxCapacity}
            currentPax={Math.round(maxCapacity / 2)}
          />

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-700 flex items-center">
                <TableIcon className="w-4 h-4 mr-2 text-indigo-500" />
                Detailed Analysis
              </h3>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200">1 - {maxCapacity} Pax</span>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left relative">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium bg-gray-50">Pax</th>
                    <th className="px-4 py-3 font-medium text-right bg-gray-50">Sell Price</th>
                    <th className="px-4 py-3 font-medium text-right bg-gray-50 text-emerald-600">Net Rev</th>
                    <th className="px-4 py-3 font-medium text-right bg-gray-50 text-red-500">Total Cost</th>
                    <th className="px-4 py-3 font-medium text-right bg-gray-50">Profit/Loss</th>
                    <th className="px-4 py-3 font-medium text-right bg-gray-50">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableData.map((row) => (
                    <tr key={row.pax} className={`hover:bg-indigo-50/50 transition-colors ${row.pax === breakevenPax ? 'bg-amber-50' : ''}`}>
                      <td className="px-4 py-2 font-medium text-gray-900 border-r border-gray-100">
                        <span className="inline-block min-w-[1.5rem]">{row.pax}</span>
                        {row.pax === breakevenPax && <span className="ml-2 text-[9px] uppercase tracking-wider font-bold bg-amber-400 text-white px-1.5 py-0.5 rounded shadow-sm">BEP</span>}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-500 bg-gray-50/30 font-mono text-xs">
                        {formatCurrency(row.unitPrice)}
                      </td>
                      <td className="px-4 py-2 text-right text-emerald-700 font-medium">
                        {formatCurrency(row.netRev)}
                      </td>
                      <td className="px-4 py-2 text-right text-red-600">
                        {formatCurrency(row.totalCost)}
                      </td>
                      <td className={`px-4 py-2 text-right font-bold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {formatCurrency(row.profit)}
                      </td>
                      <td className={`px-4 py-2 text-right text-xs font-mono ${row.margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {row.margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
