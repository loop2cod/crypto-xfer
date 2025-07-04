"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { TransferResponse, StatusHistoryEntry } from '@/services/transfer';

interface TransferTimelineProps {
  transfer: TransferResponse;
}

export default function TransferTimeline({ transfer }: TransferTimelineProps) {
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState(false);

  // Copy hash function
  const copyHashToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
      toast({
        title: "Copied!",
        message: "Transaction hash copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy hash:', error);
      toast({
        title: "Copy Failed",
        message: "Could not copy transaction hash",
        variant: "destructive",
      });
    }
  };

  // Helper functions for timeline
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
      case 'waiting_for_deposit':
        return 'bg-yellow-500';
      case 'crypto_deposited':
      case 'verifying':
      case 'processing':
        return 'bg-blue-500';
      case 'verified':
      case 'completed':
        return 'bg-green-500';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'bg-red-500';
      case 'on_hold':
      case 'requires_approval':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Transfer Created';
      case 'waiting_for_deposit':
        return 'Waiting for Crypto Deposit';
      case 'crypto_deposited':
        return 'Crypto Deposit Detected';
      case 'verifying':
        return 'Verifying Transaction';
      case 'verified':
        return 'Transaction Verified';
      case 'processing':
        return 'Processing Transfer';
      case 'completed':
        return 'Transfer Completed';
      case 'failed':
        return 'Transfer Failed';
      case 'cancelled':
        return 'Transfer Cancelled';
      case 'expired':
        return 'Transfer Expired';
      case 'on_hold':
        return 'Transfer On Hold';
      case 'requires_approval':
        return 'Requires Admin Approval';
      default:
        return status;
    }
  };

  const getDefaultStatusMessage = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Transfer request submitted successfully';
      case 'waiting_for_deposit':
        return 'Please send crypto to the provided deposit address';
      case 'crypto_deposited':
        return 'Crypto deposit detected, starting verification';
      case 'verifying':
        return 'Verifying blockchain transaction confirmations';
      case 'verified':
        return 'Transaction verified, preparing bank transfer';
      case 'processing':
        return 'Processing bank transfers to your account(s)';
      case 'completed':
        return 'Funds have been sent to your bank account(s)';
      case 'failed':
        return 'Transfer could not be completed';
      case 'cancelled':
        return 'Transfer was cancelled';
      case 'expired':
        return 'Transfer expired due to no deposit';
      case 'on_hold':
        return 'Transfer is on hold pending review';
      case 'requires_approval':
        return 'Transfer requires admin approval';
      default:
        return 'Transfer status updated';
    }
  };

  return (
    <div className="space-y-4">
      {transfer.status_history && transfer.status_history.length > 0 ? (
        <>
          {/* Add initial creation entry if not in history */}
          {!transfer.status_history.some(entry => entry.to_status === 'pending') && (
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Transfer Created</p>
                <p className="text-sm text-gray-600">
                  {new Date(transfer.created_at).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Transfer request submitted successfully
                </p>
              </div>
            </div>
          )}

          {/* Render status history entries */}
          {transfer.status_history
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((entry, index) => {
              const statusColor = getStatusColor(entry.to_status);
              const statusLabel = getStatusLabel(entry.to_status);
              const isActive = entry.to_status === transfer.status;
              
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${statusColor} ${isActive ? 'animate-pulse' : ''}`}></div>
                  <div className="flex-1">
                    <p className="font-medium">{statusLabel}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    
                    {/* Show who made the change */}
                    {entry.changed_by_name && (
                      <p className="text-xs text-gray-500">
                        Changed by: {entry.changed_by_name}
                      </p>
                    )}
                    
                    {/* Show status message or custom message */}
                    {(entry.message || entry.admin_remarks) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {entry.message || entry.admin_remarks}
                      </p>
                    )}

                    {/* Show crypto transaction hash if status is related to crypto deposit */}
                    {(entry.to_status === 'crypto_deposited' || entry.to_status === 'verifying') && 
                     transfer.crypto_tx_hash && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600 flex-1">
                          TX: {transfer.crypto_tx_hash}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyHashToClipboard(transfer.crypto_tx_hash!)}
                          className="h-5 w-5 p-0"
                        >
                          {copiedHash ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* Show confirmation progress for verifying status */}
                    {entry.to_status === 'verifying' && 
                     transfer.confirmation_count !== undefined && 
                     transfer.required_confirmations && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Confirmations</span>
                          <span>{transfer.confirmation_count}/{transfer.required_confirmations}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${Math.min((transfer.confirmation_count / transfer.required_confirmations) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </>
      ) : (
        // Fallback to basic timeline if no status history
        <>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Transfer Created</p>
              <p className="text-sm text-gray-600">
                {new Date(transfer.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Transfer request submitted successfully
              </p>
            </div>
          </div>
          
          {transfer.status !== 'pending' && (
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(transfer.status)} ${transfer.status === 'processing' ? 'animate-pulse' : ''}`}></div>
              <div>
                <p className="font-medium">{getStatusLabel(transfer.status)}</p>
                <p className="text-sm text-gray-600">
                  {transfer.completed_at 
                    ? new Date(transfer.completed_at).toLocaleString()
                    : new Date(transfer.updated_at).toLocaleString()
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {transfer.status_message || getDefaultStatusMessage(transfer.status)}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}