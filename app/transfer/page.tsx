"use client"

import { useState } from "react"
import { ArrowLeft, Copy, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TransferPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [accountDetails, setAccountDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
  })
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const adminWallet = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"

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

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    router.push("/?success=transfer")
  }

  return (
    <div className="min-h-screen bg-gray-50 md:max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Send to Bank</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="bg-white rounded-lg p-4">
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
                  className="text-lg mt-1"
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">Available: 1,250.00 USDT</p>
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

              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-700">Admin Wallet Address (USDT TRC20)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <code className="text-xs break-all text-gray-800 flex-1">{adminWallet}</code>
                    <Button size="sm" variant="outline" onClick={handleCopyWallet} className="ml-2 flex-shrink-0">
                      {copied ? <CheckCircle className="w-4 h-4 text-gray-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                <Button onClick={handleNext} className="flex-1 bg-gray-900 hover:bg-gray-800" disabled={isLoading}>
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
                  We&apos;ll send ${(Number.parseFloat(amount) * 0.99).toFixed(2)} USD to your account
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="accountName" className="text-sm font-medium text-gray-700">
                    Account Holder Name
                  </Label>
                  <Input
                    id="accountName"
                    placeholder="John Doe"
                    value={accountDetails.accountName}
                    onChange={(e) => setAccountDetails({ ...accountDetails, accountName: e.target.value })}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                    Account Number
                  </Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890"
                    value={accountDetails.accountNumber}
                    onChange={(e) => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    placeholder="Chase Bank"
                    value={accountDetails.bankName}
                    onChange={(e) => setAccountDetails({ ...accountDetails, bankName: e.target.value })}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="routingNumber" className="text-sm font-medium text-gray-700">
                    Routing Number
                  </Label>
                  <Input
                    id="routingNumber"
                    placeholder="021000021"
                    value={accountDetails.routingNumber}
                    onChange={(e) => setAccountDetails({ ...accountDetails, routingNumber: e.target.value })}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 border-gray-300" disabled={isLoading}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                  disabled={
                    !accountDetails.accountName ||
                    !accountDetails.accountNumber ||
                    !accountDetails.bankName ||
                    !accountDetails.routingNumber ||
                    isLoading
                  }
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
