"use client";

import { useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTransfer } from '@/context/TransferContext';
import TransferHistory from '@/components/transfer-history';
import { useToast } from '@/hooks/useToast';

export default function TransactionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { error, getUserTransfers } = useTransfer();

  useEffect(() => {
    // Load transfers when component mounts
    getUserTransfers();
  }, [getUserTransfers]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleCreateTransfer = () => {
    router.push('/transfer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1" 
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Transfer History</h1>
              <p className="text-sm text-gray-600">
                View and manage all your transfers
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleCreateTransfer}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <TransferHistory 
          limit={50}
          showFilters={true}
          showPagination={true}
        />
      </main>
    </div>
  );
}