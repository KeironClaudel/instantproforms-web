export type SendProformByEmailRequest = {
  proformId: string;
  toEmail: string;
  subject: string | null;
  message: string | null;
};

export type CreateShareLinkResponse = {
  proformId: string;
  shareUrl: string;
  expiresAtUtc: string | null;
  isSingleUse: boolean;
};

export type CreatedProformSummary = {
  id: string;
  number: string;
  status: string;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
};