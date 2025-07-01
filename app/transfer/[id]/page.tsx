"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransfer } from '@/context/TransferContext';
import TransferStatus from '@/components/transfer-status';
import TransferTimeline from '@/components/transfer-timeline';
import { useToast } from '@/hooks/useToast';
import AuthWrapper from '@/components/AuthWrapper';

export default function TransferStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const transferId = params.id as string;
  
  const {
    currentTransfer,
    isLoading,
    error,
    getTransferById,
    getTransferStatus,
  } = useTransfer();



  useEffect(() => {
    if (transferId) {
      getTransferById(transferId);
    }
  }, [transferId, getTransferById]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleRefresh = async () => {
    if (transferId) {
      await getTransferById(transferId);
      await getTransferStatus(transferId);

      toast({
        title: "Refreshed",
        description: "Transfer status has been updated",
      });
    }
  };

  const handleBackToDashboard = () => {
    router.push('/');
  };

  if (isLoading && !currentTransfer) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transfer details...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  if (!currentTransfer && !isLoading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Transfer Not Found</h2>
              <p className="text-gray-600 mb-4">
                The transfer you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
              </p>
              <Button onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-sm md:text-base font-semibold text-gray-900">Transfer Status</h1>
              <p className="text-xs md:text-sm text-gray-600">
                ID: {currentTransfer?.transfer_id}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-2 py-4 md:px-4 md:py-6 space-y-6">
        {/* Transfer Status Card */}
        <TransferStatus 
          transferId={transferId}
          showDetails={true}
          autoRefresh={true}
          refreshInterval={30000}
        />

        {/* Transfer Timeline */}
        {currentTransfer && (
          <Card>
            <CardHeader>
              <CardTitle>Transfer Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TransferTimeline transfer={currentTransfer} />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {currentTransfer?.status === 'failed' && (
            <Button
              onClick={() => router.push('/transfer')}
              className="flex-1 max-w-xs"
            >
              Create New Transfer
            </Button>
          )}
          
          {currentTransfer?.status === 'completed' && (
            <Button
              onClick={() => router.push('/transfer')}
              className="flex-1 max-w-xs"
            >
              Create Another Transfer
            </Button>
          )}
        </div>

        {/* Support Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have questions about your transfer or need assistance, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm">
                  View FAQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      </div>
    </AuthWrapper>
  );
}