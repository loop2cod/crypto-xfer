"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { transferService, TransferResponse, TransferCreateRequest, BankAccountInfo } from '@/services/transfer';

interface TransferContextType {
  // State
  transfers: TransferResponse[];
  currentTransfer: TransferResponse | null;
  isLoading: boolean;
  error: string | null;
  
  // Transfer creation flow state
  transferStep: number;
  transferAmount: string;
  depositWalletAddress: string;
  transactionHash: string;
  bankAccounts: BankAccount[];
  feePercentage: number;
  
  // Actions
  createTransfer: (data: TransferCreateRequest) => Promise<TransferResponse | null>;
  getUserTransfers: (skip?: number, limit?: number) => Promise<void>;
  getTransferById: (id: string) => Promise<void>;
  getTransferStatus: (id: string) => Promise<{ status: string; status_message?: string; confirmation_count: number } | null>;
  
  // Transfer flow actions
  setTransferStep: (step: number) => void;
  setTransferAmount: (amount: string) => void;
  setDepositWalletAddress: (address: string) => void;
  setTransactionHash: (hash: string) => void;
  setBankAccounts: (accounts: BankAccount[]) => void;
  setFeePercentage: (percentage: number) => void;
  addBankAccount: () => void;
  removeBankAccount: (id: string) => void;
  updateBankAccount: (id: string, field: keyof BankAccount, value: string) => void;
  resetTransferFlow: () => void;
  
  // Utility functions
  calculateFeeAndNet: (amount: number, feePercentage?: number) => { fee: number; netAmount: number };
  validateTransferData: (data: TransferCreateRequest) => { isValid: boolean; errors: string[] };
  getTotalAllocated: () => number;
  getRemainingAmount: () => number;
  areAllBankAccountsValid: () => boolean;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  routingNumber: string;
  transferAmount: string;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
};

interface TransferProviderProps {
  children: ReactNode;
}

export const TransferProvider: React.FC<TransferProviderProps> = ({ children }) => {
  // State
  const [transfers, setTransfers] = useState<TransferResponse[]>([]);
  const [currentTransfer, setCurrentTransfer] = useState<TransferResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Transfer creation flow state
  const [transferStep, setTransferStep] = useState(1);
  const [transferAmount, setTransferAmount] = useState('');
  const [depositWalletAddress, setDepositWalletAddress] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [feePercentage, setFeePercentage] = useState(0.01);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      accountName: '',
      accountNumber: '',
      bankName: '',
      routingNumber: '',
      transferAmount: ''
    }
  ]);

  // Actions
  const createTransfer = useCallback(async (data: TransferCreateRequest): Promise<TransferResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await transferService.createTransfer(data);
      if (response.success) {
        setCurrentTransfer(response.data);
        // Add to transfers list
        setTransfers(prev => [response.data, ...prev]);
        return response.data;
      } else {
        setError(response.message || 'Failed to create transfer');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create transfer');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserTransfers = useCallback(async (skip: number = 0, limit: number = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await transferService.getUserTransfers(skip, limit);
      if (response.success) {
        setTransfers(response.data);
      } else {
        setError(response.message || 'Failed to fetch transfers');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transfers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransferById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await transferService.getTransferById(id);
      if (response.success) {
        setCurrentTransfer(response.data);
      } else {
        setError(response.message || 'Failed to fetch transfer');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transfer');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransferStatus = useCallback(async (id: string) => {
    try {
      const response = await transferService.getTransferStatus(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch transfer status');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transfer status');
      return null;
    }
  }, []);

  // Transfer flow actions
  const addBankAccount = useCallback(() => {
    setBankAccounts(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        accountName: '',
        accountNumber: '',
        bankName: '',
        routingNumber: '',
        transferAmount: ''
      }
    ]);
  }, []);

  const removeBankAccount = useCallback((id: string) => {
    setBankAccounts(prev => {
      if (prev.length > 1) {
        return prev.filter(account => account.id !== id);
      }
      return prev;
    });
  }, []);

  const updateBankAccount = useCallback((id: string, field: keyof BankAccount, value: string) => {
    setBankAccounts(prev =>
      prev.map(account =>
        account.id === id ? { ...account, [field]: value } : account
      )
    );
  }, []);

  const resetTransferFlow = useCallback(() => {
    setTransferStep(1);
    setTransferAmount('');
    setDepositWalletAddress('');
    setTransactionHash('');
    setFeePercentage(0.01);
    setBankAccounts([
      {
        id: '1',
        accountName: '',
        accountNumber: '',
        bankName: '',
        routingNumber: '',
        transferAmount: ''
      }
    ]);
    setCurrentTransfer(null);
    setError(null);
  }, []);

  // Utility functions
  const calculateFeeAndNet = useCallback((amount: number, customFeePercentage?: number) => {
    return transferService.calculateTransferAmounts(amount, customFeePercentage || feePercentage);
  }, [feePercentage]);

  const validateTransferData = useCallback((data: TransferCreateRequest) => {
    return transferService.validateTransferData(data);
  }, []);

  const getTotalAllocated = useCallback(() => {
    return bankAccounts.reduce((sum, account) => {
      const accountAmount = account.transferAmount ? parseFloat(account.transferAmount) : 0;
      return sum + accountAmount;
    }, 0);
  }, [bankAccounts]);

  const getRemainingAmount = useCallback(() => {
    const totalAmount = transferAmount ? parseFloat(transferAmount) * (1 - feePercentage) : 0; // Total after fee
    const allocated = getTotalAllocated();
    return Math.max(0, totalAmount - allocated);
  }, [transferAmount, feePercentage, getTotalAllocated]);

  const areAllBankAccountsValid = useCallback(() => {
    const totalAmount = transferAmount ? parseFloat(transferAmount) * (1 - feePercentage) : 0;
    const totalAllocated = getTotalAllocated();
    
    return bankAccounts.every(account =>
      account.accountName &&
      account.accountNumber &&
      account.bankName &&
      account.routingNumber &&
      account.transferAmount &&
      parseFloat(account.transferAmount) > 0
    ) && totalAllocated <= totalAmount && totalAllocated > 0;
  }, [bankAccounts, transferAmount, feePercentage, getTotalAllocated]);

  const value: TransferContextType = {
    // State
    transfers,
    currentTransfer,
    isLoading,
    error,
    
    // Transfer creation flow state
    transferStep,
    transferAmount,
    depositWalletAddress,
    transactionHash,
    bankAccounts,
    feePercentage,
    
    // Actions
    createTransfer,
    getUserTransfers,
    getTransferById,
    getTransferStatus,
    
    // Transfer flow actions
    setTransferStep,
    setTransferAmount,
    setDepositWalletAddress,
    setTransactionHash,
    setBankAccounts,
    setFeePercentage,
    addBankAccount,
    removeBankAccount,
    updateBankAccount,
    resetTransferFlow,
    
    // Utility functions
    calculateFeeAndNet,
    validateTransferData,
    getTotalAllocated,
    getRemainingAmount,
    areAllBankAccountsValid,
  };

  return (
    <TransferContext.Provider value={value}>
      {children}
    </TransferContext.Provider>
  );
};

export default TransferProvider;