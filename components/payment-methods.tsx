'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, Building2, Copy, CheckCircle, AlertCircle, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import walletService, { PaymentMethods, FeeCalculation } from '@/services/wallet';

interface PaymentMethodsProps {
  onPaymentSelect?: (paymentMethod: 'crypto' | 'bank', amount: number, feeInfo: FeeCalculation) => void;
  defaultAmount?: number;
}

export default function PaymentMethodsComponent({ onPaymentSelect, defaultAmount = 0 }: PaymentMethodsProps) {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    primary_wallet: null,
    primary_bank_account: null
  });
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<string>(defaultAmount.toString());
  const [cryptoFeeInfo, setCryptoFeeInfo] = useState<FeeCalculation | null>(null);
  const [bankFeeInfo, setBankFeeInfo] = useState<FeeCalculation | null>(null);
  const [calculatingFees, setCalculatingFees] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      calculateFees();
    }
  }, [amount, paymentMethods]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await walletService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFees = async () => {
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) return;

    try {
      setCalculatingFees(true);
      
      // Calculate crypto fee if wallet available
      if (paymentMethods.primary_wallet) {
        try {
          const cryptoFee = await walletService.calculateCryptoFee(amountNum);
          setCryptoFeeInfo(cryptoFee);
        } catch (error) {
          setCryptoFeeInfo(null);
        }
      }

      // Calculate bank fee if account available
      if (paymentMethods.primary_bank_account) {
        try {
          const bankFee = await walletService.calculateBankFee(amountNum);
          setBankFeeInfo(bankFee);
        } catch (error) {
          setBankFeeInfo(null);
        }
      }
    } catch (error) {
      console.error('Error calculating fees:', error);
    } finally {
      setCalculatingFees(false);
    }
  };

  const handleCopyAddress = async (address: string) => {
    const success = await walletService.copyToClipboard(address);
    if (success) {
      setCopiedAddress(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive"
      });
    }
  };

  const handlePaymentSelect = (method: 'crypto' | 'bank') => {
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const feeInfo = method === 'crypto' ? cryptoFeeInfo : bankFeeInfo;
    if (!feeInfo) {
      toast({
        title: "Fee Calculation Error",
        description: "Unable to calculate fees for this payment method",
        variant: "destructive"
      });
      return;
    }

    onPaymentSelect?.(method, amountNum, feeInfo);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Choose your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>Choose your preferred payment method and see fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              USD
            </span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto" disabled={!paymentMethods.primary_wallet}>
              <Wallet className="mr-2 h-4 w-4" />
              Crypto Payment
            </TabsTrigger>
            <TabsTrigger value="bank" disabled={!paymentMethods.primary_bank_account}>
              <Building2 className="mr-2 h-4 w-4" />
              Bank Purchase
            </TabsTrigger>
          </TabsList>

          {/* Crypto Payment Tab */}
          <TabsContent value="crypto" className="space-y-4">
            {paymentMethods.primary_wallet ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Wallet className="mr-2 h-5 w-5" />
                    {paymentMethods.primary_wallet.name}
                    <Badge variant="outline" className="ml-2">Primary</Badge>
                  </CardTitle>
                  <CardDescription>
                    {paymentMethods.primary_wallet.currency} • {paymentMethods.primary_wallet.network}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-muted p-2 rounded text-sm font-mono">
                        {paymentMethods.primary_wallet.address}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyAddress(paymentMethods.primary_wallet!.address)}
                      >
                        {copiedAddress ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Fee Information */}
                  {cryptoFeeInfo && (
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Payment Amount:</span>
                        <span className="text-sm">{walletService.formatCurrency(cryptoFeeInfo.original_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Fee ({cryptoFeeInfo.fee_percentage}%):</span>
                        <span className="text-sm text-red-600">-{walletService.formatCurrency(cryptoFeeInfo.fee_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium pt-2 border-t">
                        <span>You will receive:</span>
                        <span className="text-green-600">{walletService.formatCrypto(cryptoFeeInfo.amount_after_fee, cryptoFeeInfo.currency)}</span>
                      </div>
                    </div>
                  )}

                  {calculatingFees && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Calculating fees...</span>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => handlePaymentSelect('crypto')}
                    disabled={!cryptoFeeInfo || calculatingFees || parseFloat(amount) <= 0}
                  >
                    Pay with Crypto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No crypto wallet is currently available for payments. Please contact support.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Bank Purchase Tab */}
          <TabsContent value="bank" className="space-y-4">
            {paymentMethods.primary_bank_account ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    {paymentMethods.primary_bank_account.name}
                    <Badge variant="outline" className="ml-2">Primary</Badge>
                  </CardTitle>
                  <CardDescription>
                    {paymentMethods.primary_bank_account.bank_name} • {paymentMethods.primary_bank_account.account_type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bank Account Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Account Number</Label>
                      <p className="font-mono">****{paymentMethods.primary_bank_account.account_number.slice(-4)}</p>
                    </div>
                    {paymentMethods.primary_bank_account.routing_number && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Routing Number</Label>
                        <p className="font-mono">{paymentMethods.primary_bank_account.routing_number}</p>
                      </div>
                    )}
                  </div>

                  {/* Fee Information */}
                  {bankFeeInfo && (
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Purchase Amount:</span>
                        <span className="text-sm">{walletService.formatCurrency(bankFeeInfo.original_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Processing Fee ({bankFeeInfo.fee_percentage}%):</span>
                        <span className="text-sm text-red-600">-{walletService.formatCurrency(bankFeeInfo.fee_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium pt-2 border-t">
                        <span>You will receive:</span>
                        <span className="text-green-600">{walletService.formatCurrency(bankFeeInfo.amount_after_fee)} worth of crypto</span>
                      </div>
                    </div>
                  )}

                  {calculatingFees && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Calculating fees...</span>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => handlePaymentSelect('bank')}
                    disabled={!bankFeeInfo || calculatingFees || parseFloat(amount) <= 0}
                  >
                    Purchase with Bank Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No bank account is currently available for purchases. Please contact support.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}