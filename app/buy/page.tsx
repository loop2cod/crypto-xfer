"use client"

import { useState } from "react"
import { ArrowLeft, Copy, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function BuyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const adminBankDetails = {
    accountName: "Xfer Admin",
    accountNumber: "1234567890",
    bankName: "Chase Bank",
    routingNumber: "021000021",
  }

  const handleCopyBankDetails = () => {
    const details = `Account: ${adminBankDetails.accountNumber}\nBank: ${adminBankDetails.bankName}\nRouting: ${adminBankDetails.routingNumber}`
    navigator.clipboard.writeText(details)
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
    router.push("/?success=buy")
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
          <h1 className="text-lg font-semibold text-gray-900">Buy USDT</h1>
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

          {/* Step 1: Enter Amount and Wallet */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="buyAmount" className="text-sm font-medium text-gray-700">
                  Amount (USD)
                </Label>
                <Input
                  id="buyAmount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="walletAddress" className="text-sm font-medium text-gray-700">
                  Your USDT Wallet Address (TRC20)
                </Label>
                <Input
                  id="walletAddress"
                  placeholder="TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="mt-1"
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">Make sure this is a TRC20 USDT address</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">${amount || "0.00"} USD</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Fee (1%):</span>
                  <span className="font-medium text-gray-900">
                    ${amount ? (Number.parseFloat(amount) * 0.01).toFixed(2) : "0.00"} USD
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-900">You&apos;ll receive:</span>
                  <span className="text-gray-900">
                    ≈ {amount ? (Number.parseFloat(amount) * 0.99).toFixed(2) : "0.00"} USDT
                  </span>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-gray-900 hover:bg-gray-800"
                disabled={!amount || !walletAddress || Number.parseFloat(amount) <= 0 || isLoading}
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

          {/* Step 2: Send Fiat */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2 text-gray-900">Send ${amount} USD</h3>
                <p className="text-sm text-gray-600 mb-4">Transfer the amount to our admin bank account</p>
              </div>

              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-700">Admin Bank Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Account Name:</span>
                      <p className="font-medium text-gray-900">{adminBankDetails.accountName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Number:</span>
                      <p className="font-medium text-gray-900">{adminBankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bank Name:</span>
                      <p className="font-medium text-gray-900">{adminBankDetails.bankName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Routing Number:</span>
                      <p className="font-medium text-gray-900">{adminBankDetails.routingNumber}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopyBankDetails} className="w-full mt-3">
                    {copied ? (
                      <CheckCircle className="w-4 h-4 mr-2 text-gray-600" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy Bank Details
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>Note:</strong> Include your email address in the transfer memo so we can identify your
                  payment.
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
                    "I've Sent the Payment"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-medium mb-2 text-gray-900">Order Submitted!</h3>
                <p className="text-sm text-gray-600">
                  Your buy order has been submitted. We&apos;ll process your payment and send USDT to your wallet within 24
                  hours.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-gray-900">${amount} USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">USDT to Receive:</span>
                  <span className="font-medium text-gray-900">
                    {(Number.parseFloat(amount) * 0.99).toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Wallet Address:</span>
                  <span className="text-xs break-all text-gray-900">{walletAddress}</span>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full bg-gray-900 hover:bg-gray-800" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  "Done"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
