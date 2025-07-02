"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { transferService, TransferResponse, TransferCreateRequest, BankAccountInfo, PaginatedTransfersResponse } from '@/services/transfer';

interface TransferContextType {
  // State
  transfers: TransferResponse[];
  currentTransfer: TransferResponse | null;
  isLoading: boolean;
  error: string | null;

  // Pagination state
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  
  // Transfer creation flow state
  transferStep: number;
  transferAmount: string;
  depositWalletAddress: string;
  transactionHash: string;
  bankAccounts: BankAccount[];
  feePercentage: number;
  
  // Actions
  createTransfer: (data: TransferCreateRequest) => Promise<TransferResponse | null>;
  getUserTransfers: (skip?: number, limit?: number, typeFilter?: string, statusFilter?: string) => Promise<void>;
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

  // Pagination state
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  
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

  const getUserTransfers = useCallback(async (
    skip: number = 0,
    limit: number = 20,
    typeFilter?: string,
    statusFilter?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await transferService.getUserTransfers(skip, limit, typeFilter, statusFilter);
      if (response.success) {
        setTransfers(response.data.transfers);
        setTotalCount(response.data.total_count);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.total_pages);
        setHasNext(response.data.has_next);
        setHasPrev(response.data.has_prev);
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
    const total = bankAccounts.reduce((sum, account) => {
      const accountAmount = account.transferAmount ? parseFloat(account.transferAmount) : 0;
      return sum + accountAmount;
    }, 0);
    // Round to 2 decimal places to avoid floating-point precision issues
    return Math.round(total * 100) / 100;
  }, [bankAccounts]);

  const getRemainingAmount = useCallback(() => {
    const totalAmount = transferAmount ? parseFloat(transferAmount) * (1 - feePercentage) : 0; // Total after fee
    const allocated = getTotalAllocated();
    const remaining = totalAmount - allocated;
    // Round to 2 decimal places to avoid floating-point precision issues
    return Math.max(0, Math.round(remaining * 100) / 100);
  }, [transferAmount, feePercentage, getTotalAllocated]);

  const areAllBankAccountsValid = useCallback(() => {
    const totalAmount = transferAmount ? parseFloat(transferAmount) * (1 - feePercentage) : 0;
    const totalAllocated = getTotalAllocated();

    // Use a small epsilon for floating-point comparison to handle precision issues
    const epsilon = 0.01; // 1 cent tolerance

    // Check if all bank accounts have valid data
    const allAccountsHaveValidData = bankAccounts.every(account =>
      account.accountName.trim() &&
      account.accountNumber.trim() &&
      account.bankName.trim() &&
      account.routingNumber.trim() &&
      account.transferAmount &&
      parseFloat(account.transferAmount) > 0
    );

    // Check if total allocation is valid (not exceeding available amount with tolerance)
    const isAllocationValid = totalAllocated > 0 && totalAllocated <= (totalAmount + epsilon);

    // Debug logging to help troubleshoot validation issues
    if (transferAmount && bankAccounts.some(acc => acc.transferAmount)) {
      console.log('Validation Debug:', {
        transferAmount,
        feePercentage,
        totalAmount: totalAmount.toFixed(2),
        totalAllocated: totalAllocated.toFixed(2),
        allAccountsHaveValidData,
        isAllocationValid,
        bankAccounts: bankAccounts.map(acc => ({
          id: acc.id,
          accountName: acc.accountName,
          accountNumber: acc.accountNumber,
          bankName: acc.bankName,
          routingNumber: acc.routingNumber,
          transferAmount: acc.transferAmount
        }))
      });
    }

    return allAccountsHaveValidData && isAllocationValid;
  }, [bankAccounts, transferAmount, feePercentage, getTotalAllocated]);

  const value: TransferContextType = {
    // State
    transfers,
    currentTransfer,
    isLoading,
    error,

    // Pagination state
    totalCount,
    currentPage,
    totalPages,
    hasNext,
    hasPrev,
    
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