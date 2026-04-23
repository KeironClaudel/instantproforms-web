export type CompanySettings = {
  displayName: string;
  legalName: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  termsAndConditions: string | null;
  logoFileName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  proformPrefix: string;
  taxPercentage: number;
  currencySymbol: string;
  taxLabel: string;
};