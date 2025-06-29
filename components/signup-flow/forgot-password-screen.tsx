"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ArrowLeft } from "lucide-react"

interface ForgotPasswordScreenProps {
  onNext: (email: string) => void
  onBack: () => void
  isLoading?: boolean
}

export default function ForgotPasswordScreen({ onNext, onBack, isLoading = false }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("")
  const [isValid, setIsValid] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setIsValid(validateEmail(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext(email)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <button onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Forgot Password</h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className="w-full h-10 sm:h-11 text-sm sm:text-base border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                autoFocus
              />
            </div>
          </form>
        </div>

        {/* Bottom Button */}
        <div className="p-4 sm:p-6">
          <Button
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={!isValid || isLoading}
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex justify-center min-h-screen p-6 lg:p-8">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <button onClick={onBack} className="p-2">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">Forgot Password</h1>
            <p className="text-gray-600 text-base lg:text-lg">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className="w-full h-11 lg:h-12 text-base lg:text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full h-11 lg:h-12 text-base lg:text-lg font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}