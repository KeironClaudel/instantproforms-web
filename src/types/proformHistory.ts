export type ProformListItem = {
  id: string;
  number: string;
  status?: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  issuedAtUtc: string;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
};

export type ProformDetailsItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sortOrder: number;
};

export type ProformDetails = {
  id: string;
  number: string;
  status: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  issuedAtUtc: string;
  notes: string | null;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
  items: ProformDetailsItem[];
};