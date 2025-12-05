import React from 'react';

interface BreakEvenChartProps {
  fixedCost: number;
  getRevenue: (pax: number) => number;
  getVarCost: (pax: number) => number;
  maxPax: number;
  currentPax: number;
}

const BreakEvenChart: React.FC<BreakEvenChartProps> = ({ fixedCost, getRevenue, getVarCost, maxPax, currentPax }) => {
  const steps = 30; // resolution
  // Ensure we chart at least up to maxPax or 20, whichever is larger
  const limit = Math.max(maxPax, 10);
  
  // Generate data points
  const points = [];
  for (let i = 0; i <= steps; i++) {
    // Calculate x (pax) for this step
    const x = Math.max(0, (limit / steps) * i);
    if (x === 0) {
      points.push({ x: 0, revenue: 0, cost: fixedCost });
      continue;
    }
    
    // Round x for discrete calculation, but keep float for smooth drawing if needed
    const pax = Math.ceil(x);
    const rev = getRevenue(pax);
    const varC = getVarCost(pax);
    const cost = fixedCost + varC;
    
    points.push({ x: x, revenue: rev, cost: cost });
  }

  // Determine Scales
  const maxVal = Math.max(
    ...points.map(p => p.revenue), 
    ...points.map(p => p.cost), 
    100
  );
  const maxY = maxVal * 1.1;
  
  const width = 100;
  const height = 50;

  const getCoord = (x: number, y: number) => {
    const xPos = (x / limit) * width;
    const yPos = height - ((y / maxY) * height);
    return `${xPos},${yPos}`;
  };

  const revPath = points.map(p => getCoord(p.x, p.revenue)).join(" ");
  const costPath = points.map(p => getCoord(p.x, p.cost)).join(" ");

  // Find Break Even Point (Intersection)
  let bePax: number | null = null;
  let beY = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (prev.revenue < prev.cost && curr.revenue >= curr.cost) {
      // Linear interpolation for intersection
      const slopeCost = curr.cost - prev.cost;
      const slopeRev = curr.revenue - prev.revenue;
      const denominator = (slopeRev - slopeCost);
      
      if (denominator !== 0) {
        const ratio = (prev.cost - prev.revenue) / denominator;
        bePax = prev.x + (curr.x - prev.x) * ratio; // Interpolated X
        beY = prev.revenue + slopeRev * ratio;      // Interpolated Y
      }
      break;
    }
  }
  const beCoords = bePax ? getCoord(bePax, beY).split(',') : null;

  return (
    <div className="w-full h-72 relative mt-4 select-none bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide flex justify-between">
        <span>Break-Even Analysis</span>
        <span className="text-xs normal-case bg-gray-100 px-2 py-0.5 rounded text-gray-600">Dynamic Projection</span>
      </h3>
      <div className="relative w-full h-48">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid Lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="#f3f4f6" strokeWidth="0.5" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
          
          {/* Areas */}
          <polygon points={`0,50 ${revPath} 100,50`} fill="url(#gradRev)" />
          
          {/* Lines */}
          <polyline points={revPath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={costPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Break Even Marker */}
          {beCoords && (
            <g>
              <circle cx={beCoords[0]} cy={beCoords[1]} r="2" fill="#f59e0b" stroke="white" strokeWidth="0.5" />
              <line x1={beCoords[0]} y1={beCoords[1]} x2={beCoords[0]} y2={50} stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1,1" />
              <text x={parseFloat(beCoords[0])} y={parseFloat(beCoords[1]) - 5} fontSize="3" textAnchor="middle" fill="#d97706" fontWeight="bold">BEP</text>
            </g>
          )}
          
          {/* Current Pax Marker Line */}
          {currentPax > 0 && currentPax <= limit && (
            <line 
              x1={(currentPax / limit) * width} 
              y1="0" 
              x2={(currentPax / limit) * width} 
              y2="50" 
              stroke="#3b82f6" 
              strokeWidth="0.5" 
              strokeDasharray="2" 
              opacity="0.6"
            />
          )}
        </svg>
        
        {/* Labels Overlay */}
        <div className="absolute top-0 right-0 flex flex-col items-end gap-2 p-2 bg-white/80 backdrop-blur-sm rounded border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Revenue
          </span>
          <span className="text-xs font-bold text-red-500 flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div> Total Cost
          </span>
        </div>
      </div>
      
      {/* X-Axis Label */}
      <div className="flex justify-between text-xs text-gray-400 mt-2 px-1 font-mono">
        <span>0 Pax</span>
        <span className="font-medium text-gray-500">{limit} Pax</span>
      </div>
    </div>
  );
};

export default BreakEvenChart;
