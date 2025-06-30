import { useState, useEffect, useCallback } from 'react';
import walletService, { PaymentMethods, FeeCalculation, AdminWallet, AdminBankAccount } from '@/services/wallet';

export interface UseWalletReturn {
  paymentMethods: PaymentMethods;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  calculateCryptoFee: (amount: number, walletId?: string) => Promise<FeeCalculation | null>;
  calculateBankFee: (amount: number, accountId?: string) => Promise<FeeCalculation | null>;
  primaryWallet: AdminWallet | null;
  primaryBankAccount: AdminBankAccount | null;
}

export function useWallet(): UseWalletReturn {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    primary_wallet: null,
    primary_bank_account: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const methods = await walletService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment methods');
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateCryptoFee = useCallback(async (
    amount: number, 
    walletId?: string
  ): Promise<FeeCalculation | null> => {
    try {
      return await walletService.calculateCryptoFee(amount, walletId);
    } catch (err) {
      console.error('Error calculating crypto fee:', err);
      return null;
    }
  }, []);

  const calculateBankFee = useCallback(async (
    amount: number, 
    accountId?: string
  ): Promise<FeeCalculation | null> => {
    try {
      return await walletService.calculateBankFee(amount, accountId);
    } catch (err) {
      console.error('Error calculating bank fee:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    refetch: fetchPaymentMethods,
    calculateCryptoFee,
    calculateBankFee,
    primaryWallet: paymentMethods.primary_wallet,
    primaryBankAccount: paymentMethods.primary_bank_account
  };
}

export default useWallet;