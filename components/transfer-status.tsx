"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTransfer } from '@/context/TransferContext';
import { transferService } from '@/services/transfer';

interface TransferStatusProps {
  transferId: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const TransferStatus: React.FC<TransferStatusProps> = ({
  transferId,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}) => {
  const { currentTransfer, getTransferStatus } = useTransfer();
  const [status, setStatus] = useState<{
    status: string;
    status_message?: string;
    confirmation_count: number;
  } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedHash, setCopiedHash] = useState(false);

  // Copy hash function
  const copyHashToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch (error) {
      console.error('Failed to copy hash:', error);
    }
  };

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const statusData = await getTransferStatus(transferId);
      if (statusData) {
        setStatus(statusData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch transfer status:', error);
    }
  }, [transferId, getTransferStatus]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && transferId) {
      fetchStatus();
      
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [transferId, autoRefresh, refreshInterval, fetchStatus]);

  // Get status display info
  const getStatusInfo = (statusValue: string) => {
    const statusMap = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        text: 'Pending',
        description: 'Waiting for crypto deposit confirmation'
      },
      processing: {
        icon: Loader2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        text: 'Processing',
        description: 'Transfer is being processed'
      },
      completed: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Completed',
        description: 'Transfer completed successfully'
      },
      failed: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: 'Failed',
        description: 'Transfer failed'
      },
      cancelled: {
        icon: AlertCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        text: 'Cancelled',
        description: 'Transfer was cancelled'
      }
    };

    return statusMap[statusValue as keyof typeof statusMap] || statusMap.pending;
  };

  const currentStatus = status?.status || currentTransfer?.status || 'pending';
  const statusInfo = getStatusInfo(currentStatus);
  const StatusIcon = statusInfo.icon;



  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Transfer Status</span>
          <Badge 
            variant="secondary" 
            className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}
          >
            <StatusIcon className={`w-4 h-4 mr-1 ${statusInfo.icon === Loader2 ? 'animate-spin' : ''}`} />
            {statusInfo.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transfer Details */}
        {showDetails && currentTransfer && (
          <div className="border-t pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Amount:</span>
                <div className="font-medium">
                  {transferService.formatAmount(currentTransfer.amount, 'USDT')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Fee:</span>
                <div className="font-medium">
                  {transferService.formatAmount(currentTransfer.fee, 'USDT')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Net Amount:</span>
                <div className="font-medium text-green-600">
                  {transferService.formatAmount(currentTransfer.net_amount, 'USD')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <div className="font-medium">
                  {transferService.formatDate(currentTransfer.created_at)}
                </div>
              </div>
            </div>

            {/* Transaction Hash */}
            {currentTransfer.crypto_tx_hash && (
              <div>
                <span className="text-gray-600 text-sm">Transaction Hash:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded flex-1 break-all">
                    {currentTransfer.crypto_tx_hash}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => currentTransfer.crypto_tx_hash && copyHashToClipboard(currentTransfer.crypto_tx_hash)}
                    className="flex-shrink-0"
                  >
                    {copiedHash ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Bank Accounts */}
            {currentTransfer.bank_accounts && currentTransfer.bank_accounts.length > 0 && (
              <div>
                <span className="text-gray-600 text-sm">Bank Accounts:</span>
                <div className="mt-2 space-y-2">
                  {currentTransfer.bank_accounts.map((account: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                      <div className="font-medium">{account.account_name}</div>
                      <div className="text-gray-600">
                        {account.bank_name} - ****{account.account_number.slice(-4)}
                      </div>
                      <div className="text-green-600 font-medium">
                        {transferService.formatAmount(parseFloat(account.transfer_amount), 'USD')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
          {autoRefresh && (
            <span className="ml-2">
              (Auto-refreshing every {refreshInterval / 1000}s)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferStatus;