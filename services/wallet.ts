import { get, post } from '@/utilities/AxiosInterceptor';

export interface AdminWallet {
  id: string;
  name: string;
  address: string;
  currency: string;
  network: string;
  fee_percentage: number;
  is_active: boolean;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminBankAccount {
  id: string;
  name: string;
  bank_name: string;
  account_number: string;
  routing_number?: string;
  account_type: string;
  fee_percentage: number;
  is_active: boolean;
  is_primary: boolean;
  account_holder_name?: string;
  swift_code?: string;
  iban?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethods {
  primary_wallet: AdminWallet | null;
  primary_bank_account: AdminBankAccount | null;
}

export interface FeeCalculation {
  original_amount: number;
  fee_percentage: number;
  fee_amount: number;
  amount_after_fee: number;
  currency: string;
  wallet?: {
    id: string;
    name: string;
    address: string;
    currency: string;
    network: string;
  };
  bank_account?: {
    id: string;
    name: string;
    bank_name: string;
    account_type: string;
  };
}

export const walletService = {
  // Get primary wallet for payments
  async getPrimaryWallet(): Promise<AdminWallet> {
    try {
      // First try the authenticated endpoint
      const response = await get<{ success: boolean; data: AdminWallet; message: string }>('/api/v1/admin-wallets/public/primary');
      return response.data;
    } catch (error: any) {
      // If authentication fails, try the public endpoint as fallback
      if (error?.response?.status === 401) {
        try {
          console.log('Trying public primary wallet endpoint...');
          const publicResponse = await get<{ success: boolean; data: AdminWallet; message: string }>('/api/v1/admin-wallets/public/primary');
          return publicResponse.data;
        } catch (publicError: any) {
          throw new Error(publicError?.response?.data?.detail || 'Failed to fetch primary wallet from public endpoint');
        }
      }
      throw new Error(error?.response?.data?.detail || 'Failed to fetch primary wallet');
    }
  },

  // Get all active wallets
  async getActiveWallets(): Promise<AdminWallet[]> {
    try {
      const response = await get<{ success: boolean; data: AdminWallet[]; message: string }>('/api/v1/admin-wallets/active');
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to fetch active wallets');
    }
  },

  // Get primary bank account
  async getPrimaryBankAccount(): Promise<AdminBankAccount> {
    try {
      const response = await get<{ success: boolean; data: AdminBankAccount; message: string }>('/api/v1/admin-bank-accounts/primary');
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to fetch primary bank account');
    }
  },

  // Get all active bank accounts
  async getActiveBankAccounts(): Promise<AdminBankAccount[]> {
    try {
      const response = await get<{ success: boolean; data: AdminBankAccount[]; message: string }>('/api/v1/admin-bank-accounts/active');
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to fetch active bank accounts');
    }
  },

  // Get available payment methods
  async getPaymentMethods(): Promise<PaymentMethods> {
    try {
      const response = await get<{ success: boolean; data: PaymentMethods; message: string }>('/api/v1/fees/payment-methods');
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to fetch payment methods');
    }
  },

  // Calculate crypto payment fee
  async calculateCryptoFee(
    amount: number,
    walletId?: string
  ): Promise<FeeCalculation> {
    try {
      const params = new URLSearchParams();
      params.append('amount', amount.toString());
      if (walletId) {
        params.append('wallet_id', walletId);
      }

      const response = await post<{ success: boolean; data: FeeCalculation; message: string }>(`/api/v1/fees/calculate-crypto-fee?${params}`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to calculate crypto fee');
    }
  },

  // Calculate bank purchase fee
  async calculateBankFee(
    amount: number,
    accountId?: string
  ): Promise<FeeCalculation> {
    try {
      const params = new URLSearchParams();
      params.append('amount', amount.toString());
      if (accountId) {
        params.append('account_id', accountId);
      }

      const response = await post<{ success: boolean; data: FeeCalculation; message: string }>(`/api/v1/fees/calculate-bank-fee?${params}`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Failed to calculate bank fee');
    }
  },

  // Utility function to format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Utility function to format crypto amount
  formatCrypto(amount: number, currency: string = 'USDT'): string {
    return `${amount.toFixed(2)} ${currency}`;
  },

  // Utility function to truncate wallet address
  truncateAddress(address: string, startLength: number = 8, endLength: number = 6): string {
    if (address.length <= startLength + endLength) {
      return address;
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  },

  // Validate wallet address format (basic validation)
  isValidWalletAddress(address: string, network: string = 'TRC20'): boolean {
    if (!address || address.length < 10) return false;
    
    switch (network) {
      case 'TRC20':
        return address.startsWith('T') && address.length === 34;
      case 'ERC20':
        return address.startsWith('0x') && address.length === 42;
      case 'BEP20':
        return address.startsWith('0x') && address.length === 42;
      default:
        return address.length >= 26 && address.length <= 62;
    }
  },

  // Copy text to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
};

export default walletService;