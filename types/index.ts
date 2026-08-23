// Lightweight TypeScript types used by the foundation layers.
export type Merchant = {
  id: string;
  name: string;
  email?: string;
};

export type Product = {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number; // in smallest currency unit
  currency?: string;
  inventory?: number;
  tags?: string[];
};

export type Order = {
  id: string;
  merchantId: string;
  amount: number;
  currency?: string;
  status?: string;
};
