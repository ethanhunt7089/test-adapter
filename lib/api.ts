import type {
    ApiResponse,
    CreateMemberRequest,
    Member,
    MemberBalanceResponse,
    MemberListResponse,
    UpdateMemberRequest
} from '@/types/member';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// สร้าง axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // เพิ่มเป็น 30 วินาที
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken = '';

// ตรวจสอบว่าเราอยู่ใน browser หรือไม่
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('bank-adapter-token') || '';
}

// Interceptor สำหรับเพิ่ม token
apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Interceptor สำหรับจัดการ error
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('bank-adapter-token', token);
  }
};

export const getAuthToken = () => {
  return authToken;
};

export const clearAuthToken = () => {
  authToken = '';
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bank-adapter-token');
  }
};

export const api = {
  // GET - ดึงรายการสมาชิกทั้งหมด
  getMembers: async (): Promise<ApiResponse<MemberListResponse>> => {
    try {
      const response = await apiClient.get('/member/list');
      // จัดการ nested data structure
      const responseData = response.data;
      if (responseData.data && responseData.data.data) {
        return {
          ...responseData,
          data: responseData.data.data
        };
      }
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        console.log('API timeout, retrying...');
        // ลองใหม่อีกครั้ง
        try {
          const retryResponse = await apiClient.get('/member/list');
          const responseData = retryResponse.data;
          if (responseData.data && responseData.data.data) {
            return {
              ...responseData,
              data: responseData.data.data
            };
          }
          return retryResponse.data;
        } catch (retryError) {
          throw retryError;
        }
      }
      throw error;
    }
  },

  // GET - ดึงข้อมูลสมาชิกตาม ID
  getMemberById: async (id: string): Promise<ApiResponse<{ member: Member }>> => {
    try {
      const response = await apiClient.get(`/member/${id}`);
      // จัดการ nested data structure
      const responseData = response.data;
      if (responseData.data && responseData.data.data) {
        return {
          ...responseData,
          data: responseData.data.data
        };
      }
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        console.log('API timeout, retrying...');
        // ลองใหม่อีกครั้ง
        try {
          const retryResponse = await apiClient.get(`/member/${id}`);
          const responseData = retryResponse.data;
          if (responseData.data && responseData.data.data) {
            return {
              ...responseData,
              data: responseData.data.data
            };
          }
          return retryResponse.data;
        } catch (retryError) {
          throw retryError;
        }
      }
      throw error;
    }
  },

  // GET - ดึงข้อมูลสมาชิกตามเบอร์โทร
  getMemberByPhone: async (phone: string): Promise<ApiResponse<{ member: Member }>> => {
    try {
      const response = await apiClient.get(`/member/phone/${phone}`);
      // จัดการ nested data structure
      const responseData = response.data;
      if (responseData.data && responseData.data.data) {
        return {
          ...responseData,
          data: responseData.data.data
        };
      }
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        console.log('API timeout, retrying...');
        // ลองใหม่อีกครั้ง
        try {
          const retryResponse = await apiClient.get(`/member/phone/${phone}`);
          const responseData = retryResponse.data;
          if (responseData.data && responseData.data.data) {
            return {
              ...responseData,
              data: responseData.data.data
            };
          }
          return retryResponse.data;
        } catch (retryError) {
          throw retryError;
        }
      }
      throw error;
    }
  },

  // GET - ดึงยอดเงินของสมาชิก
  getMemberBalance: async (id: string): Promise<ApiResponse<MemberBalanceResponse>> => {
    try {
      const response = await apiClient.get(`/member/${id}/balance`);
      // จัดการ nested data structure
      const responseData = response.data;
      if (responseData.data && responseData.data.data) {
        return {
          ...responseData,
          data: responseData.data.data
        };
      }
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        console.log('API timeout, retrying...');
        // ลองใหม่อีกครั้ง
        try {
          const retryResponse = await apiClient.get(`/member/${id}/balance`);
          const responseData = retryResponse.data;
          if (responseData.data && responseData.data.data) {
            return {
              ...responseData,
              data: responseData.data.data
            };
          }
          return retryResponse.data;
        } catch (retryError) {
          throw retryError;
        }
      }
      throw error;
    }
  },

  // POST - สร้างสมาชิกใหม่
  createMember: async (data: CreateMemberRequest): Promise<ApiResponse<Member>> => {
    const response = await apiClient.post('/member/create', data);
    return response.data;
  },

  // PUT - อัปเดตข้อมูลสมาชิก
  updateMember: async (data: UpdateMemberRequest): Promise<ApiResponse<Member>> => {
    const response = await apiClient.put(`/member/${data.id}`, data);
    return response.data;
  },

  // DELETE - ลบสมาชิก
  deleteMember: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.delete(`/member/${id}`);
    return response.data;
  },

  // GET - ดึงรายการธนาคารลาว
  getLaoBanks: async (): Promise<ApiResponse<Array<{ value: string; label: string }>>> => {
    const response = await apiClient.get('/bank/lao/list');
    return response.data;
  },

  // GET - ดึงรายการสกุลเงิน
  getCurrencies: async (): Promise<ApiResponse<Array<{ value: string; label: string }>>> => {
    const response = await apiClient.get('/currency/list');
    return response.data;
  },

  // GET - ดึงรายการกลุ่มลูกค้า
  getCustomerGroups: async (): Promise<ApiResponse<Array<any>>> => {
    const response = await apiClient.get('/customer-group/list');
    return response.data;
  },

  // POST - ตรวจสอบบัญชีธนาคาร
  checkAccount: async (data: {
    bankAccountNumber: string;
    bankName: string;
    bankType: string;
    phone: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/member/check-account', data);
    return response.data;
  },

  // POST - ตรวจสอบบัญชีธนาคาร (alias)
  verifyBankAccount: async (data: {
    bankAccountNumber: string;
    bankName: string;
    bankType: string;
    phone: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/member/verify-bank-account', data);
    return response.data;
  },

  // Credit Management APIs
  addCredit: async (id: string, data: { phone: string; amount: number; remarks?: string }) => {
    const response = await apiClient.post(`/api/member/${id}/add-credit`, data);
    return response.data;
  },

  removeCredit: async (id: string, data: { amount: number; remarks?: string }) => {
    const response = await apiClient.post(`/api/member/${id}/remove-credit`, data);
    return response.data;
  },

  cashoutCredit: async (id: string, data: { remarks?: string }) => {
    const response = await apiClient.post(`/api/member/${id}/cashout-credit`, data);
    return response.data;
  },

  deposit: async (data: { 
    id?: string; 
    phone: string; 
    amount: number; 
    currency: string; 
    bankName: string; 
    dateDeposit: string; 
    timeDeposit: string; 
    actualDateTime: string 
  }) => {
    const response = await apiClient.post('/api/member/deposit', data);
    return response.data;
  },
};

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'THB') => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
