export interface Member {
  id: string;
  name: string;
  username: string;
  phone?: string;
  bankAccountNo?: string;
  bankCode?: string;
  currency?: string;
  balance?: number;
  creditBalance?: string;
  creditWallet?: string;
  agentUsername?: string;
  agentPassword?: string;
  password?: string;
  isBanned?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  rank?: {
    iconUrl?: string;
  };
  createdBy?: {
    name: string;
  };
}

export interface CreateMemberRequest {
  name: string;
  username: string;
  phone: string;
  bankAccountNo: string;
  bankCode: string;
  currency: string;
}

export interface UpdateMemberRequest {
  id: string;
  name?: string;
  username?: string;
  phone?: string;
  bankAccountNo?: string;
  bankCode?: string;
  currency?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  prefix?: string;
  timestamp: string;
  error?: string;
  statusCode?: number;
  details?: string;
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
