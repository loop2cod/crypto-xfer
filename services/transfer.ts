import { post, get, put } from '@/utilities/AxiosInterceptor';

// Types
export interface BankAccountInfo {
  account_name: string;
  account_number: string;
  bank_name: string;
  routing_number: string;
  transfer_amount: string;
}

export interface TransferCreateRequest {
  type: 'crypto-to-fiat' | 'fiat-to-crypto';
  amount: number;
  currency?: string;
  deposit_wallet_address?: string;
  crypto_tx_hash?: string;
  bank_account_info?: BankAccountInfo;
  bank_accounts?: BankAccountInfo[];
}

export interface StatusHistoryEntry {
  from_status?: string;
  to_status: string;
  timestamp: string;
  changed_by: string;
  changed_by_name?: string;
  message?: string;
  admin_remarks?: string;
  internal_notes?: string;
}

export interface TransferResponse {
  id: string;
  transfer_id: string;
  user_id: string;
  type_: string;
  amount: number;
  fee: number;
  net_amount: number;
  currency: string;
  status: string;
  status_message?: string;
  crypto_tx_hash?: string;
  deposit_wallet_address?: string;
  admin_wallet_address?: string;
  confirmation_count?: number;
  required_confirmations?: number;
  bank_account_info?: any;
  bank_accounts?: any[];
  status_history?: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  expires_at?: string;
}

export interface TransferStatusResponse {
  status: string;
  status_message?: string;
  confirmation_count: number;
}

export interface PaginatedTransfersResponse {
  transfers: TransferResponse[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface HashVerificationRequest {
  transaction_hash: string;
  wallet_address: string;
  amount: number;
  network: string;
  admin_wallet_address?: string;
}

export interface HashVerificationResponse {
  is_valid: boolean;
  confirmations: number;
  amount: number;
  message: string;
  network?: string;
  block_height?: number;
  timestamp?: string;
}

// API endpoints
const TRANSFER_ENDPOINTS = {
  CREATE: '/api/v1/transfers/',
  GET_ALL: '/api/v1/transfers/',
  GET_BY_ID: (id: string) => `/api/v1/transfers/${id}`,
  GET_STATUS: (id: string) => `/api/v1/transfers/${id}/status`,
  VERIFY_HASH: '/api/v1/transfers/verify-hash',
} as const;

// Transfer service functions
export const transferService = {
  async createTransfer(data: TransferCreateRequest): Promise<ApiResponse<TransferResponse>> {
    try {
      const response = await post<ApiResponse<TransferResponse>>(TRANSFER_ENDPOINTS.CREATE, data);
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to create transfer');
    }
  },

  async getUserTransfers(
    skip: number = 0,
    limit: number = 20,
    typeFilter?: string,
    statusFilter?: string
  ): Promise<ApiResponse<PaginatedTransfersResponse>> {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      if (typeFilter) params.append('type_filter', typeFilter);
      if (statusFilter) params.append('status_filter', statusFilter);

      const response = await get<ApiResponse<PaginatedTransfersResponse>>(
        `${TRANSFER_ENDPOINTS.GET_ALL}?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to fetch transfers');
    }
  },

  async getTransferById(transferId: string): Promise<ApiResponse<TransferResponse>> {
    try {
      const response = await get<ApiResponse<TransferResponse>>(
        TRANSFER_ENDPOINTS.GET_BY_ID(transferId)
      );
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to fetch transfer');
    }
  },

  async getTransferStatus(transferId: string): Promise<ApiResponse<TransferStatusResponse>> {
    try {
      const response = await get<ApiResponse<TransferStatusResponse>>(
        TRANSFER_ENDPOINTS.GET_STATUS(transferId)
      );
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to fetch transfer status');
    }
  },

  async verifyTransactionHash(data: HashVerificationRequest): Promise<ApiResponse<HashVerificationResponse>> {
    try {
      const response = await post<ApiResponse<HashVerificationResponse>>(
        TRANSFER_ENDPOINTS.VERIFY_HASH,
        data
      );
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to verify transaction hash');
    }
  },

  // Helper function to calculate fee and net amount
  calculateTransferAmounts(amount: number, feePercentage: number = 0.01) {
    const fee = amount * feePercentage;
    const netAmount = amount - fee;
    return {
      fee: Math.round(fee * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100
    };
  },

  // Helper function to validate transfer data
  validateTransferData(data: TransferCreateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!data.type || !['crypto-to-fiat', 'fiat-to-crypto'].includes(data.type)) {
      errors.push('Invalid transfer type');
    }

    if (data.type === 'crypto-to-fiat') {
      if (!data.deposit_wallet_address) {
        errors.push('Deposit wallet address is required');
      }
      if (!data.crypto_tx_hash) {
        errors.push('Transaction hash is required');
      }
      if (!data.bank_accounts || data.bank_accounts.length === 0) {
        errors.push('At least one bank account is required');
      } else {
        // Validate each bank account
        data.bank_accounts.forEach((account, index) => {
          if (!account.account_name) {
            errors.push(`Bank account ${index + 1}: Account name is required`);
          }
          if (!account.account_number) {
            errors.push(`Bank account ${index + 1}: Account number is required`);
          }
          if (!account.bank_name) {
            errors.push(`Bank account ${index + 1}: Bank name is required`);
          }
          if (!account.routing_number) {
            errors.push(`Bank account ${index + 1}: Routing number is required`);
          }
          if (!account.transfer_amount || parseFloat(account.transfer_amount) <= 0) {
            errors.push(`Bank account ${index + 1}: Transfer amount must be greater than 0`);
          }
        });

        // Validate total allocation
        const totalAllocated = data.bank_accounts.reduce(
          (sum, account) => sum + parseFloat(account.transfer_amount || '0'),
          0
        );
        const netAmount = this.calculateTransferAmounts(data.amount, 0.01).netAmount; // Use default fee if not provided
        
        if (totalAllocated > netAmount) {
          errors.push('Total allocated amount exceeds available amount after fees');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Helper function to format transfer status for display
  formatTransferStatus(status: string): { text: string; color: string; bgColor: string } {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      pending: { text: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      processing: { text: 'Processing', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      completed: { text: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
      failed: { text: 'Failed', color: 'text-red-700', bgColor: 'bg-red-100' },
      cancelled: { text: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    };

    return statusMap[status] || { text: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  },

  // Helper function to format currency amounts
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USDT' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Helper function to format date
  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  }
};

export default transferService;