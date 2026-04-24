export type SendProformByEmailRequest = {
  proformId: string;
  toEmail: string;
  subject: string | null;
  message: string | null;
};

export type UpdateProformStatusRequest = {
  proformId: string;
  status: string;
};

export type UpdateProformStatusResponse = {
  proformId: string;
  status: string;
  message: string;
};

export type SendProformByEmailResponse = {
  proformId: string;
  status: string;
  message: string;
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
