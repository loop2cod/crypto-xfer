"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail } from "lucide-react"
import ProgressBar from "./progress-bar"
import { useAuth } from "@/context/AuthContext"
import authService from "@/services/auth"

interface VerificationScreenProps {
  email: string
  onNext: (code: string) => void
  onBack: () => void
  isLoading?: boolean
}

export default function VerificationScreen({ email, onNext, onBack, isLoading = false }: VerificationScreenProps) {
  const [code, setCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const handleResend = async () => {
    try {
      setError("")
      const response = await authService.sendPreRegistrationCode({ email })
          if (response.success) {
      setTimeLeft(60)
      setCanResend(false)
          } else {
            setError(response.message || "Failed to resend verification code")
          }
    } catch (error: any) {
      setError(error.message || "Failed to resend verification code")
    }
  }

  const handleVerify = async () => {
    if (code.length === 6) {
      onNext(code)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setCode(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="">
          <ProgressBar currentStep={3} totalSteps={3} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Check your email</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-2">We&apos;ve sent a verification code to</p>
            <p className="text-gray-900 font-medium">{email}</p>
          </div>

          <div className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={handleCodeChange}
                className="w-full h-10 sm:h-11 text-sm sm:text-base text-center tracking-widest border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                maxLength={6}
                autoFocus
              />
              {error && (
                <div className="text-center text-sm text-red-500 mt-2">
                  {error}
                </div>
              )}
            </div>

            <div className="text-center">
              {canResend ? (
                <button onClick={handleResend} className="text-blue-600 hover:text-blue-700 font-medium">
                  Resend code
                </button>
              ) : (
                <p className="text-gray-500">Resend code in {timeLeft}s</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-4 md:mt-6">
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || isLoading}
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex  justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="p-2">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <ProgressBar currentStep={3} totalSteps={3} />

          {/* Content */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">Check your email</h1>
            <p className="text-gray-600 text-base lg:text-lg mb-2">We&apos;ve sent a verification code to</p>
          </div>

          <div className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={handleCodeChange}
                className="w-full h-11 lg:h-12 text-base lg:text-lg text-center tracking-widest border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="text-center">
              {canResend ? (
                <button onClick={handleResend} className="text-blue-600 hover:text-blue-700 font-medium">
                  Resend code
                </button>
              ) : (
                <p className="text-gray-500">Resend code in {timeLeft}s</p>
              )}
            </div>

            <Button
              onClick={handleVerify}
              disabled={code.length !== 6 || isLoading}
              className="w-full h-11 lg:h-12 text-base lg:text-lg font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
