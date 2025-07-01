"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Copy, CheckCircle, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { QRCodeSVG } from "qrcode.react"
import { useTransfer, BankAccount } from "@/context/TransferContext"
import { useToast } from "@/hooks/useToast"
import { transferService } from "@/services/transfer"
import { walletService } from "@/services/wallet"
import AuthWrapper from "@/components/AuthWrapper"

export default function TransferPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    // State
    isLoading,
    error,
    currentTransfer,
    
    // Transfer flow state
    transferStep,
    transferAmount,
    depositWalletAddress,
    transactionHash,
    bankAccounts,
    feePercentage,
    
    // Actions
    createTransfer,
    setTransferStep,
    setTransferAmount,
    setDepositWalletAddress,
    setTransactionHash,
    setFeePercentage,
    addBankAccount,
    removeBankAccount,
    updateBankAccount,
    resetTransferFlow,
    
    // Utility functions
    calculateFeeAndNet,
    getTotalAllocated,
    getRemainingAmount,
    areAllBankAccountsValid,
  } = useTransfer()

  const [copied, setCopied] = useState(false)
  const [primaryWallet, setPrimaryWallet] = useState<any>(null)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [hashVerification, setHashVerification] = useState<{
    isVerifying: boolean
    isVerified: boolean
    verificationMessage: string
  }>({
    isVerifying: false,
    isVerified: false,
    verificationMessage: ""
  })

  const adminWallet = primaryWallet?.address || "TAQ2TfR4Pk6GPstVPExPo4QvdwcyJTzDSf"

  // Reset transfer flow on component mount
  useEffect(() => {
    resetTransferFlow()
  }, [resetTransferFlow])

  // Fetch primary wallet information
  useEffect(() => {
    const fetchPrimaryWallet = async () => {
      try {
        const wallet = await walletService.getPrimaryWallet()
        setPrimaryWallet(wallet)
        // Convert percentage to decimal (e.g., 13% -> 0.13)
        const feePercent = Number(wallet.fee_percentage) || 1
        setFeePercentage(feePercent / 100)
      } catch (error: any) {
        console.error('Failed to fetch primary wallet:', error)
        setIsMaintenanceMode(true)

        // Handle authentication errors
        if (error?.response?.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access the transfer feature.",
            variant: "destructive",
          })
          // Could redirect to login page
          return
        }

        // Set maintenance mode for any other API failures
        console.log("Setting maintenance mode due to primary wallet fetch failure")

        toast({
          title: "Service Under Maintenance",
          description: "The transfer service is temporarily unavailable. Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchPrimaryWallet()
  }, [setFeePercentage, toast])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(adminWallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerifyHash = async () => {
    if (!transactionHash || !depositWalletAddress || !transferAmount) {
      toast({
        title: "Missing Information",
        description: "Please provide transaction hash, wallet address, and amount",
        variant: "destructive",
      })
      return
    }

    setHashVerification({ isVerifying: true, isVerified: false, verificationMessage: "" })

    try {
      const result = await transferService.verifyTransactionHash({
        transaction_hash: transactionHash,
        wallet_address: depositWalletAddress,
        amount: parseFloat(transferAmount),
        network: primaryWallet?.network,
        admin_wallet_address: adminWallet,
      })

      if (result.data.is_valid) {
        setHashVerification({
          isVerifying: false,
          isVerified: true,
          verificationMessage: result.data.message
        })
        toast({
          title: "Transaction Verified",
          description: `${result.data.message}. You can now proceed to add bank details.`,
        })
        setTransferStep(3)
      } else {
        setHashVerification({
          isVerifying: false,
          isVerified: false,
          verificationMessage: result.data.message
        })
        toast({
          title: "Verification Failed",
          description: result.data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setHashVerification({
        isVerifying: false,
        isVerified: false,
        verificationMessage: "Verification failed"
      })
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify transaction hash",
        variant: "destructive",
      })
    }
  }

  const handleNext = async () => {
    if (transferStep === 1) {
      // Validate amount
      if (!transferAmount || parseFloat(transferAmount) <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0",
          variant: "destructive",
        })
        return
      }
      setTransferStep(2)
    } else if (transferStep === 2) {
      // This step is handled by hash verification now
      // The verification will automatically proceed to step 3 if successful
      return
    }
  }

  const handleBack = () => {
    if (transferStep > 1) {
      setTransferStep(transferStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate all data before submission
      const transferData = {
        type: 'crypto-to-fiat' as const,
        amount: parseFloat(transferAmount),
        currency: 'USDT',
        deposit_wallet_address: depositWalletAddress,
        crypto_tx_hash: transactionHash,
        bank_accounts: bankAccounts.map(account => ({
          account_name: account.accountName,
          account_number: account.accountNumber,
          bank_name: account.bankName,
          routing_number: account.routingNumber,
          transfer_amount: account.transferAmount,
        })),
      }

      // Validate transfer data
      const validation = transferService.validateTransferData(transferData)
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors[0],
          variant: "destructive",
        })
        return
      }

      // Create transfer
      const result = await createTransfer(transferData)
      
      if (result) {
        toast({
          title: "Transfer Created Successfully",
          description: "Your transfer request has been submitted and is being processed.",
        })
        
        // Redirect to transfer status page
        router.push(`/transfer/${result.id}`)
      }
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to create transfer. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50 md:max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-1" onClick={() => router.push("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          <h1 className="text-lg font-semibold text-gray-900">Send to Bank</h1>
        </div>
      </header>

      <div>
        <div className="bg-white rounded-lg p-3">
          {/* Maintenance Mode Message */}
          {isMaintenanceMode ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md w-full text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Service Under Maintenance</h3>
                  <p className="text-sm text-orange-700 mb-4">
                    The transfer service is temporarily unavailable. We're working to restore service as quickly as possible.
                  </p>
                  <p className="text-xs text-orange-600">
                    Please try again later or contact support if this issue persists.
                  </p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-6">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        transferStep >= stepNum ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div
                        className={`w-8 h-0.5 mx-2 transition-colors ${transferStep > stepNum ? "bg-gray-900" : "bg-gray-200"}`}
                      />
                    )}
                  </div>
                ))}
              </div>

          {/* Step 1: Enter Amount */}
          {transferStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount (USDT)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="text-xs md:text-sm mt-1"
                  disabled={isLoading}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">{transferAmount || "0"} USDT</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Fee ({(feePercentage * 100).toFixed(1)}%):</span>
                  <span className="font-medium text-gray-900">
                    {transferAmount ? (parseFloat(transferAmount) * feePercentage).toFixed(2) : "0"} USDT
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-900">You&apos;ll receive:</span>
                  <span className="text-gray-900">
                    ≈ ${transferAmount ? (parseFloat(transferAmount) * (1 - feePercentage)).toFixed(2) : "0.00"} USD
                  </span>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-gray-900 hover:bg-gray-800"
                disabled={!transferAmount || Number.parseFloat(transferAmount) <= 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Deposit Crypto */}
          {transferStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2 text-gray-900">Deposit {transferAmount} USDT</h3>
                <p className="text-sm text-gray-600 mb-4">Send your USDT to our {primaryWallet?.name || 'admin'} wallet address below</p>
                {primaryWallet && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-700">
                      <strong>Network:</strong> {primaryWallet.network} | <strong>Currency:</strong> {primaryWallet.currency}
                    </p>
                  </div>
                )}
              </div>

              {/* QR Code for admin wallet address */}
              <div className="flex flex-col items-center justify-center mb-4">
                <QRCodeSVG value={adminWallet} size={228} level="M" includeMargin={true} />
                <span className="text-xs text-gray-500 mt-2">Scan to copy wallet address</span>
              </div>
                <Label className="text-sm font-medium text-gray-700">
                  {primaryWallet?.name || 'Admin'} Wallet Address ({primaryWallet?.currency || 'USDT'} {primaryWallet?.network || 'TRC20'})
                </Label>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <code className="text-xs md:text-sm break-all text-gray-800 flex-1">{adminWallet}</code>
                    <Button size="sm" variant="outline" onClick={handleCopyWallet} className="ml-2 flex-shrink-0">
                      {copied ? <CheckCircle className="w-4 h-4 text-gray-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

              {/* Input for user's deposit wallet address */}
              <div>
                <Label htmlFor="depositWalletAddress" className="text-sm font-medium text-gray-700">
                  Your Deposit Wallet Address
                </Label>
                <Input
                  id="depositWalletAddress"
                  type="text"
                  placeholder="Enter your wallet address used for deposit"
                  value={depositWalletAddress}
                  onChange={e => setDepositWalletAddress(e.target.value)}
                  className="mt-1 text-xs md:text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Input for transaction hash */}
              <div>
                <Label htmlFor="transactionHash" className="text-sm font-medium text-gray-700">
                  Transaction Hash
                </Label>
                <Input
                  id="transactionHash"
                  type="text"
                  placeholder="Enter the transaction hash from your transfer"
                  value={transactionHash}
                  onChange={e => setTransactionHash(e.target.value)}
                  className="mt-1 text-xs md:text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>Important:</strong> Only send {primaryWallet?.currency || 'USDT'} ({primaryWallet?.network || 'TRC20'}) to this address. Sending other tokens may result in
                  permanent loss.
                </p>
              </div>

              {/* Hash verification status */}
              {hashVerification.verificationMessage && (
                <div className={`p-3 rounded-lg ${
                  hashVerification.isVerified 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${
                    hashVerification.isVerified ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {hashVerification.verificationMessage}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 border-gray-300" disabled={isLoading || hashVerification.isVerifying}>
                  Back
                </Button>
                <Button
                  onClick={handleVerifyHash}
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                  disabled={isLoading || hashVerification.isVerifying || !depositWalletAddress || !transactionHash}
                >
                  {hashVerification.isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying Hash...
                    </>
                  ) : (
                    "I've Sent the USDT"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Bank Details */}
          {transferStep === 3 && (
            <div className="space-y-4">
              {/* Transaction Verification Status */}
              {hashVerification.isVerified && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Transaction Verified Successfully</p>
                      <p className="text-xs text-green-700 mt-1">{hashVerification.verificationMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900">Enter Bank Account Details</h3>
                <p className="text-sm text-gray-600">
                  Total available: ${transferAmount ? (parseFloat(transferAmount) * (1 - feePercentage)).toFixed(2) : "0.00"} USD
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Remaining: ${getRemainingAmount().toFixed(2)} USD
                </p>
              </div>

              {bankAccounts.map((account, index) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Bank Account {index + 1}</h4>
                    {bankAccounts.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeBankAccount(account.id)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 text-xs md:text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`transferAmount-${account.id}`} className="text-sm font-medium text-gray-700">
                      Transfer Amount (USD)
                    </Label>
                    {/* Calculate if this account's amount exceeds the remaining balance */}
                    {(() => {
                      const currentAmount = account.transferAmount ? parseFloat(account.transferAmount) : 0;
                      const otherAccountsTotal = bankAccounts
                        .filter(acc => acc.id !== account.id)
                        .reduce((sum, acc) => sum + (acc.transferAmount ? parseFloat(acc.transferAmount) : 0), 0);
                      const totalAvailable = transferAmount ? calculateFeeAndNet(parseFloat(transferAmount)).netAmount : 0;
                      const maxForThisAccount = Math.max(0, totalAvailable - otherAccountsTotal);
                      const isExceeding = currentAmount > maxForThisAccount;
                      
                      return (
                        <>
                          <Input
                            id={`transferAmount-${account.id}`}
                            type="number"
                            placeholder="0.00"
                            value={account.transferAmount}
                            onChange={(e) => updateBankAccount(account.id, "transferAmount", e.target.value)}
                            className={`mt-1 text-xs md:text-sm ${isExceeding ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            disabled={isLoading}
                          />
                          {isExceeding && (
                            <p className="text-xs text-red-500 mt-1">
                              Exceeds available amount. Maximum: ${maxForThisAccount.toFixed(2)}
                              <Button 
                                variant="link" 
                                className="text-xs p-0 h-auto text-red-500 underline ml-1"
                                onClick={() => updateBankAccount(account.id, "transferAmount", maxForThisAccount.toString())}
                              >
                                Use max
                              </Button>
                            </p>
                          )}
                          {!isExceeding && account.transferAmount && (
                            <p className="text-xs text-gray-500 mt-1">
                              Remaining after this: ${(totalAvailable - currentAmount - otherAccountsTotal).toFixed(2)}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div>
                    <Label htmlFor={`accountName-${account.id}`} className="text-sm font-medium text-gray-700">
                      Account Holder Name
                    </Label>
                    <Input
                      id={`accountName-${account.id}`}
                      placeholder="John Doe"
                      value={account.accountName}
                      onChange={(e) => updateBankAccount(account.id, "accountName", e.target.value)}
                      className="mt-1 text-xs md:text-sm"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`accountNumber-${account.id}`} className="text-sm font-medium text-gray-700">
                      Account Number
                    </Label>
                    <Input
                      id={`accountNumber-${account.id}`}
                      placeholder="1234567890"
                      value={account.accountNumber}
                      onChange={(e) => updateBankAccount(account.id, "accountNumber", e.target.value)}
                      className="mt-1 text-xs md:text-sm"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`bankName-${account.id}`} className="text-sm font-medium text-gray-700">
                      Bank Name
                    </Label>
                    <Input
                      id={`bankName-${account.id}`}
                      placeholder="Chase Bank"
                      value={account.bankName}
                      onChange={(e) => updateBankAccount(account.id, "bankName", e.target.value)}
                      className="mt-1 text-xs md:text-sm"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`routingNumber-${account.id}`} className="text-sm font-medium text-gray-700">
                      Routing Number
                    </Label>
                    <Input
                      id={`routingNumber-${account.id}`}
                      placeholder="021000021"
                      value={account.routingNumber}
                      onChange={(e) => updateBankAccount(account.id, "routingNumber", e.target.value)}
                      className="mt-1 text-xs md:text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}

              <Button
                onClick={addBankAccount}
                variant="outline"
                className="w-full border-dashed border-gray-300 flex items-center justify-center py-2"
                disabled={isLoading || getRemainingAmount() <= 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Bank Account
              </Button>

              {(() => {
                const totalAvailable = transferAmount ? calculateFeeAndNet(parseFloat(transferAmount)).netAmount : 0;
                const totalAllocated = getTotalAllocated();
                const isExceeding = totalAllocated > totalAvailable;
                
                if (isExceeding) {
                  const exceededBy = (totalAllocated - totalAvailable).toFixed(2);
                  return (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                      <p className="font-medium mb-1">Total allocation exceeds available amount by ${exceededBy}</p>
                      <p>Please adjust the transfer amounts in the highlighted fields.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs h-7 border-red-200 text-red-700 hover:bg-red-100"
                        onClick={() => {
                          // Auto-adjust the last account with a value to fit within the limit
                          const accountsWithValues = bankAccounts.filter(acc => acc.transferAmount && parseFloat(acc.transferAmount) > 0);
                          if (accountsWithValues.length > 0) {
                            const lastAccount = accountsWithValues[accountsWithValues.length - 1];
                            const currentAmount = parseFloat(lastAccount.transferAmount);
                            const otherAccountsTotal = bankAccounts
                              .filter(acc => acc.id !== lastAccount.id)
                              .reduce((sum, acc) => sum + (acc.transferAmount ? parseFloat(acc.transferAmount) : 0), 0);
                            const maxForLastAccount = Math.max(0, totalAvailable - otherAccountsTotal);
                            updateBankAccount(lastAccount.id, "transferAmount", maxForLastAccount.toString());
                          }
                        }}
                      >
                        Auto-adjust amounts
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex space-x-3 mt-6">
                <Button variant="outline" onClick={handleBack} className="flex-1 border-gray-300" disabled={isLoading}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                  disabled={!areAllBankAccountsValid() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Transfer"
                  )}
                </Button>
              </div>
            </div>
          )}
          </>
          )}
        </div>
      </div>
      </div>
    </AuthWrapper>
  )
}
