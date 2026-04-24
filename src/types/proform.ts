export type ProformItemDraft = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

export type CreateProformRequestItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type CreateProformRequest = {
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  notes: string | null;
  items: CreateProformRequestItem[];
};

export type CreateProformResponse = {
  proformId: string;
  number: string;
  status: string;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
};

export type CreateProformResult =
  | {
      type: "created";
      response: CreateProformResponse;
    }
  | {
      type: "queued";
      queueId: string;
    };
