"use client"

import { useState } from "react"
import { ArrowLeft, Copy, CheckCircle, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { QRCodeSVG } from "qrcode.react"

// Bank account type definition
type BankAccount = {
  id: string
  accountName: string
  accountNumber: string
  bankName: string
  routingNumber: string
  transferAmount: string
}

export default function TransferPage() {
  const [depositWalletAddress, setDepositWalletAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      accountName: "",
      accountNumber: "",
      bankName: "",
      routingNumber: "",
      transferAmount: ""
    }
  ])
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const adminWallet = "TAQ2TfR4Pk6GPstVPExPo4QvdwcyJTzDSf"

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(adminWallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNext = async () => {
    if (step < 3) {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  // Calculate total amount allocated to bank accounts
  const getTotalAllocated = () => {
    return bankAccounts.reduce((sum, account) => {
      const accountAmount = account.transferAmount ? parseFloat(account.transferAmount) : 0
      return sum + accountAmount
    }, 0)
  }

  // Calculate remaining amount to be allocated
  const getRemainingAmount = () => {
    const totalAmount = amount ? parseFloat(amount) * 0.99 : 0 // Total after fee
    const allocated = getTotalAllocated()
    return Math.max(0, totalAmount - allocated).toFixed(2)
  }

  // Add a new bank account
  const handleAddBankAccount = () => {
    setBankAccounts([
      ...bankAccounts,
      {
        id: Date.now().toString(),
        accountName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
        transferAmount: ""
      }
    ])
  }

  // Remove a bank account
  const handleRemoveBankAccount = (id: string) => {
    if (bankAccounts.length > 1) {
      setBankAccounts(bankAccounts.filter(account => account.id !== id))
    }
  }

  // Update a specific bank account field
  const handleUpdateBankAccount = (id: string, field: keyof BankAccount, value: string) => {
    setBankAccounts(
      bankAccounts.map(account => 
        account.id === id ? { ...account, [field]: value } : account
      )
    )
  }

  // Check if all required fields are filled for all bank accounts
  const areAllBankAccountsValid = () => {
    return bankAccounts.every(account => 
      account.accountName && 
      account.accountNumber && 
      account.bankName && 
      account.routingNumber &&
      account.transferAmount &&
      parseFloat(account.transferAmount) > 0
    ) && getTotalAllocated() <= (amount ? parseFloat(amount) * 0.99 : 0)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 md:max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-1" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          <h1 className="text-lg font-semibold text-gray-900">Send to Bank</h1>
        </div>
      </header>

      <div>
        <div className="bg-white rounded-lg p-3">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= stepNum ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-8 h-0.5 mx-2 transition-colors ${step > stepNum ? "bg-gray-900" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Enter Amount */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount (USDT)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-xs md:text-sm mt-1"
                  disabled={isLoading}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">{amount || "0"} USDT</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Fee (1%):</span>
                  <span className="font-medium text-gray-900">
                    {amount ? (Number.parseFloat(amount) * 0.01).toFixed(2) : "0"} USDT
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-900">You&apos;ll receive:</span>
                  <span className="text-gray-900">
                    ≈ ${amount ? (Number.parseFloat(amount) * 0.99).toFixed(2) : "0.00"} USD
                  </span>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-gray-900 hover:bg-gray-800"
                disabled={!amount || Number.parseFloat(amount) <= 0 || isLoading}
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
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2 text-gray-900">Deposit {amount} USDT</h3>
                <p className="text-sm text-gray-600 mb-4">Send your USDT to our admin wallet address below</p>
              </div>

              {/* QR Code for admin wallet address */}
              <div className="flex flex-col items-center justify-center mb-4">
                <QRCodeSVG value={adminWallet} size={228} level="M" includeMargin={true} />
                <span className="text-xs text-gray-500 mt-2">Scan to copy wallet address</span>
              </div>
                <Label className="text-sm font-medium text-gray-700">Admin Wallet Address (USDT TRC20)</Label>
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
                  <strong>Important:</strong> Only send USDT (TRC20) to this address. Sending other tokens may result in
                  permanent loss.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 border-gray-300" disabled={isLoading}>
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1 bg-gray-900 hover:bg-gray-800" disabled={isLoading || !depositWalletAddress || !transactionHash}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "I've Sent the USDT"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Bank Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900">Enter Bank Account Details</h3>
                <p className="text-sm text-gray-600">
                  Total available: ${(Number.parseFloat(amount) * 0.99).toFixed(2)} USD
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Remaining: ${getRemainingAmount()} USD
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
                        onClick={() => handleRemoveBankAccount(account.id)}
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
                      const totalAvailable = amount ? parseFloat(amount) * 0.99 : 0;
                      const maxForThisAccount = Math.max(0, totalAvailable - otherAccountsTotal);
                      const isExceeding = currentAmount > maxForThisAccount;
                      
                      return (
                        <>
                          <Input
                            id={`transferAmount-${account.id}`}
                            type="number"
                            placeholder="0.00"
                            value={account.transferAmount}
                            onChange={(e) => handleUpdateBankAccount(account.id, "transferAmount", e.target.value)}
                            className={`mt-1 text-xs md:text-sm ${isExceeding ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            disabled={isLoading}
                          />
                          {isExceeding && (
                            <p className="text-xs text-red-500 mt-1">
                              Exceeds available amount. Maximum: ${maxForThisAccount.toFixed(2)}
                              <Button 
                                variant="link" 
                                className="text-xs p-0 h-auto text-red-500 underline ml-1"
                                onClick={() => handleUpdateBankAccount(account.id, "transferAmount", maxForThisAccount.toString())}
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
                      onChange={(e) => handleUpdateBankAccount(account.id, "accountName", e.target.value)}
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
                      onChange={(e) => handleUpdateBankAccount(account.id, "accountNumber", e.target.value)}
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
                      onChange={(e) => handleUpdateBankAccount(account.id, "bankName", e.target.value)}
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
                      onChange={(e) => handleUpdateBankAccount(account.id, "routingNumber", e.target.value)}
                      className="mt-1 text-xs md:text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}

              <Button
                onClick={handleAddBankAccount}
                variant="outline"
                className="w-full border-dashed border-gray-300 flex items-center justify-center py-2"
                disabled={isLoading || getRemainingAmount() === "0.00"}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Bank Account
              </Button>

              {(() => {
                const totalAvailable = amount ? parseFloat(amount) * 0.99 : 0;
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
                            handleUpdateBankAccount(lastAccount.id, "transferAmount", maxForLastAccount.toString());
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
        </div>
      </div>
    </div>
  )
}
