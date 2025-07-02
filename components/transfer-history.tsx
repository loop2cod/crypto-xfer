"use client";

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle, Eye, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransfer } from '@/context/TransferContext';
import { transferService, TransferResponse } from '@/services/transfer';
import { useRouter } from 'next/navigation';

interface TransferHistoryProps {
  limit?: number;
  showFilters?: boolean;
  showPagination?: boolean;
}

export const TransferHistory: React.FC<TransferHistoryProps> = ({
  limit = 10,
  showFilters = true,
  showPagination = true,
}) => {
  const { transfers, getUserTransfers, isLoading, totalCount, currentPage: contextCurrentPage, totalPages, hasNext, hasPrev } = useTransfer();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const typeParam = typeFilter || undefined;
    const statusParam = statusFilter || undefined;
    getUserTransfers(currentPage * limit, limit, typeParam, statusParam);
  }, [currentPage, limit, statusFilter, typeFilter, getUserTransfers]);

  const getStatusIcon = (status: string) => {
    const iconMap = {
      pending: Clock,
      processing: Clock,
      completed: CheckCircle,
      failed: XCircle,
      cancelled: AlertCircle,
    };
    return iconMap[status as keyof typeof iconMap] || Clock;
  };

  const getTypeIcon = (type: string) => {
    return type === 'crypto-to-fiat' ? ArrowUpRight : ArrowDownLeft;
  };

  const handleViewTransfer = (transferId: string) => {
    router.push(`/transfer/${transferId}`);
  };

  // Reset to first page when filters change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(0);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(0);
  };

  if (isLoading && transfers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading transfers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
        <div className="flex items-center justify-between">
          <CardTitle>Transfer History</CardTitle>
          {showFilters && (
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="crypto-to-fiat">Crypto to Fiat</SelectItem>
                  <SelectItem value="fiat-to-crypto">Fiat to Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {transfers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <ArrowUpRight className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500 mb-2">No transfers found</p>
            <p className="text-sm text-gray-400">
              {statusFilter || typeFilter
                ? 'Try adjusting your filters or create your first transfer'
                : 'Create your first transfer to get started'
              }
            </p>
            <Button
              onClick={() => router.push('/transfer')}
              className="mt-4"
              variant="outline"
            >
              Create Transfer
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {transfers.map((transfer) => {
              const StatusIcon = getStatusIcon(transfer.status);
              const TypeIcon = getTypeIcon(transfer.type_);
              const statusInfo = transferService.formatTransferStatus(transfer.status);
              
              return (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
               onClick={() => handleViewTransfer(transfer.id)}
               >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                      <TypeIcon className={`w-4 h-4 ${statusInfo.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-xs md:text-sm">
                          {transfer?.type_ === 'crypto-to-fiat' ? 'Send to Bank' : 'Buy Crypto'}
                        </span>
                        <Badge 
                          variant="secondary"
                          className={`${statusInfo.bgColor} ${statusInfo.color} border-0 text-xs`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.text}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        {transferService.formatDate(transfer.created_at)}
                      </div>
                      
                      {transfer.status_message && (
                        <div className="text-xs md:text-sm text-gray-500 mt-1">
                          {transfer.status_message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-xs md:text-sm">
                      {transferService.formatAmount(transfer.amount, transfer.currency)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      Net: {transferService.formatAmount(transfer.net_amount, 'USD')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={!hasPrev || isLoading}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!hasNext || isLoading}
            >
              Next
            </Button>
          </div>
        )}
</>
  );
};

export default TransferHistory;