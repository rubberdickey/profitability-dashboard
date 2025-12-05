import React from 'react';

interface CostCategoryProps {
  title: string;
  icon: React.ReactNode;
  total: string;
  children: React.ReactNode;
}

const CostCategory: React.FC<CostCategoryProps> = ({ title, icon, total, children }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {icon} 
          <span>{title}</span>
        </h2>
        <span className="text-xl font-extrabold text-indigo-600 tracking-tight">{total}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export default CostCategory;
