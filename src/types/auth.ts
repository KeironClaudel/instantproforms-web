export type AuthUser = {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  companyId: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = AuthUser;