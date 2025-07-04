"use client"

import { ArrowLeft, Copy, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import ToastContainer from "@/components/ui/toast-container"
import useToast from "@/hooks/useToast"

interface BankAccount {
  id: string
  accountName: string
  accountNumber: string
  bankName: string
  routingNumber: string
  transferAmount: string
}

interface Transaction {
  id: any
  type: "crypto-to-fiat" | "fiat-to-crypto"
  amount: string
  currency: string
  status: "pending" | "completed" | "failed"
  date: string
  timestamp: string
  recipient?: string
  wallet?: string
  fee: string
  txHash?: string
  depositWallet?: string
  bankAccounts?: BankAccount[]
  bankDetails?: {
    accountName: string
    accountNumber: string
    bankName: string
    routingNumber: string
  }
}

export default function TransactionDetailsPage() {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const params = useParams()
  const { toast, toasts, hideToast } = useToast();

  // Mock transaction data - in real app, fetch by ID
  const transaction: Transaction = {
    id: params.id,
    type: "crypto-to-fiat",
    amount: "500.00",
    currency: "USDT",
    status: "completed",
    date: "2024-01-15",
    timestamp: "2024-01-15T14:30:00Z",
    recipient: "John Doe",
    fee: "5.00",
    txHash: "0x742d35cc6bf3c8f3a1234567890abcdef",
    depositWallet: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    bankAccounts: [
      {
        id: "1",
        accountName: "John Doe",
        accountNumber: "****1234",
        bankName: "Chase Bank",
        routingNumber: "021000021",
        transferAmount: "300.00"
      },
      {
        id: "2",
        accountName: "Jane Smith",
        accountNumber: "****5678",
        bankName: "Bank of America",
        routingNumber: "026009593",
        transferAmount: "195.00"
      }
    ],
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-gray-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-gray-500" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-gray-700" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-gray-50 text-gray-600 border-gray-300"
      case "failed":
        return "bg-gray-200 text-gray-900 border-gray-400"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Handle both old and new data structures
  const getBankAccounts = () => {
    if (transaction.bankAccounts && transaction.bankAccounts.length > 0) {
      return transaction.bankAccounts;
    } else if (transaction.bankDetails) {
      // Convert old format to new format
      return [{
        id: "1",
        accountName: transaction.bankDetails.accountName,
        accountNumber: transaction.bankDetails.accountNumber,
        bankName: transaction.bankDetails.bankName,
        routingNumber: transaction.bankDetails.routingNumber,
        transferAmount: (Number.parseFloat(transaction.amount) - Number.parseFloat(transaction.fee)).toFixed(2)
      }];
    }
    return [];
  };

  const bankAccounts = getBankAccounts();
  const netAmount = (Number.parseFloat(transaction.amount) - Number.parseFloat(transaction.fee)).toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50 md:max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
         <Button variant="ghost" size="sm" className="p-1" onClick={() => router.push("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          <div className="flex items-center space-x-2">
            {getStatusIcon(transaction.status)}
            <h1 className="text-lg font-semibold text-gray-900">Transaction Details</h1>
          </div>
        </div>
      </header>

      <div>
        <div className="bg-white p-3 space-y-4">
          {/* Transaction ID and Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="font-medium text-gray-900">{transaction.id}</p>
            </div>
            <Badge className={`${getStatusColor(transaction.status)} text-sm px-3 py-1`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
          </div>

          <Separator className="bg-gray-200" />

          {/* Transaction Type */}
          <div>
            <p className="text-sm text-gray-600">Transaction Type</p>
            <p className="font-medium text-gray-900">
              {transaction.type === "crypto-to-fiat" ? "Crypto to Fiat" : "Fiat to Crypto"}
            </p>
          </div>

          {/* Amount Details */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Amount Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">
                  {transaction.amount} {transaction.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fee:</span>
                <span className="font-medium text-gray-900">
                  {transaction.fee} {transaction.currency}
                </span>
              </div>
              <Separator className="bg-gray-100" />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Net Amount:</span>
                <span className="font-bold text-gray-900">
                  {transaction.type === "crypto-to-fiat" ? "-" : "+"}
                  {netAmount} {transaction.currency}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Info */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium text-gray-900 text-sm">{formatDate(transaction.timestamp)}</p>
              </div>

              {transaction.txHash && (
                <div>
                  <p className="text-sm text-gray-600">Transaction Hash</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">{transaction.txHash}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(transaction.txHash!, "txHash")}
                      className="flex-shrink-0"
                    >
                      {copied === "txHash" ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              )}
              {transaction.depositWallet && (
                <div>
                  <p className="text-sm text-gray-600">Deposit Wallet Address</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">{transaction.depositWallet}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(transaction.depositWallet!, "depositWallet")}
                      className="flex-shrink-0"
                    >
                      {copied === "depositWallet" ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              )}

              {transaction.wallet && (
                <div>
                  <p className="text-sm text-gray-600">Wallet Address</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">{transaction.wallet}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(transaction.wallet!, "wallet")}
                      className="flex-shrink-0"
                    >
                      {copied === "wallet" ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Details (for crypto-to-fiat) */}
          {transaction.type === "crypto-to-fiat" && bankAccounts.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base">
                  Bank Account Details
                  {bankAccounts.length > 1 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({bankAccounts.length} accounts)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bankAccounts.map((account, index) => (
                  <div key={account.id} className={index > 0 ? "pt-4 border-t border-gray-100" : ""}>
                    {bankAccounts.length > 1 && (
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Account {index + 1}</h4>
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          ${account.transferAmount} {transaction.currency}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-medium text-gray-900">{account.accountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium text-gray-900">{account.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Name:</span>
                        <span className="font-medium text-gray-900">{account.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Routing Number:</span>
                        <span className="font-medium text-gray-900">{account.routingNumber}</span>
                      </div>
                      
                      {bankAccounts.length > 1 && (
                        <div className="flex justify-between pt-1">
                          <span className="text-gray-600">Transfer Amount:</span>
                          <span className="font-medium text-gray-900">${account.transferAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show distribution summary if multiple accounts */}
                {bankAccounts.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Distribution Summary</h4>
                    
                    {/* Visual distribution bar */}
                    <div className="mb-3">
                      <div className="flex h-4 rounded-md overflow-hidden">
                        {bankAccounts.map((account, index) => {
                          const percentage = (parseFloat(account.transferAmount) / (parseFloat(transaction.amount) - parseFloat(transaction.fee))) * 100;
                          const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-yellow-500", "bg-pink-500"];
                          return (
                            <div 
                              key={`bar-${account.id}`} 
                              className={`${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                              title={`${account.accountName}: $${account.transferAmount} (${percentage.toFixed(0)}%)`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      {bankAccounts.map((account, index) => {
                        const percentage = (parseFloat(account.transferAmount) / (parseFloat(transaction.amount) - parseFloat(transaction.fee))) * 100;
                        const colors = ["text-blue-500", "text-green-500", "text-purple-500", "text-yellow-500", "text-pink-500"];
                        return (
                          <div key={`summary-${account.id}`} className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length].replace('text-', 'bg-')} mr-2`}></div>
                              <span className="text-gray-600">{account.accountName}:</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">${account.transferAmount}</span>
                              <span className="text-gray-500 ml-1">
                                ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-medium">
                        <span>Total:</span>
                        <span>${netAmount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          <Card className="border-gray-200">
            <CardContent className="pt-4">
              {transaction.status === "pending" && (
                <div className="flex items-start space-x-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Transaction Pending</p>
                    <p className="text-gray-600">
                      Your transaction is being processed. This usually takes 1-24 hours to complete.
                    </p>
                  </div>
                </div>
              )}

              {transaction.status === "completed" && (
                <div className="flex items-start space-x-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Transaction Completed</p>
                    <p className="text-gray-600">Your transaction has been successfully processed and completed.</p>
                  </div>
                </div>
              )}

              {transaction.status === "failed" && (
                <div className="flex items-start space-x-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-gray-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Transaction Failed</p>
                    <p className="text-gray-600">
                      This transaction could not be completed. Please contact support for assistance.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {transaction.txHash && (
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2"
                onClick={() => window.open(`https://tronscan.org/#/transaction/${transaction.txHash}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </Button>
            )}
            <Link href="/dashboard">
              <Button className="w-full bg-gray-900 hover:bg-gray-800">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  )
}
