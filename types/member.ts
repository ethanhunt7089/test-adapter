export interface Member {
  id: string;
  name: string;
  username: string;
  phone?: string; // Made optional
  bankAccountNo?: string; // Made optional
  bankCode?: string; // Made optional
  currency?: string; // Made optional
  balance?: number; // Made optional
  creditBalance?: string; // Added
  creditWallet?: string; // Added
  agentUsername?: string; // Added
  agentPassword?: string; // Added
  password?: string; // Added
  isBanned?: boolean; // Added
  lastLoginAt?: string; // Added
  createdAt?: string; // Added
  updatedAt?: string; // Added
  rank?: {
    iconUrl?: string;
    name: string;
  };
  // New fields for create/edit form
  bcelOneId?: string; // Customer group ID
  registerChannelId?: string; // Source ID
}

export interface CreateMemberRequest {
  name: string;
  username: string;
  phone: string;
  bankAccountNo: string;
  bankCode: string;
  currency: string;
  password: string;
  bcelOneId?: string;
  registerChannelId?: string;
}

export interface UpdateMemberRequest extends CreateMemberRequest {
  id: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  statusCode?: number;
  prefix?: string;
  timestamp?: string;
}

export interface MemberListResponse {
  members: Member[];
  summary: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
}

export interface MemberBalanceResponse {
  memberId: string;
  balance: number;
  member: Member;
}

// New types for bank data
export interface BankOption {
  value: string;
  label: string;
}

export interface CurrencyOption {
  value: string;
  label: string;
}

export interface CustomerGroup {
  id: string;
  picklistLabel: string;
  customerGroupName?: string;
  accountName?: string;
}

export interface RegisterChannel {
  id: string;
  name: string;
}

export interface AccountVerificationRequest {
  bankAccountNumber: string;
  bankName: string;
  bankType: string;
  phone: string;
}

export interface AccountVerificationResponse {
  status: 'success' | 'failed';
  message: string;
}
