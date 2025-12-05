export interface Cost {
  id: number;
  name: string;
  amount: number; // Stored in USD
}

export interface Tier {
  min: number;
  max: number;
  value: number; // Stored in USD
}

export type PricingMode = 'flat' | 'tiered';

export interface TableRow {
  pax: number;
  unitPrice: number;
  grossRev: number;
  netRev: number;
  totalCost: number;
  profit: number;
  margin: number;
}
