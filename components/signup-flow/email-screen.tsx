"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import ProgressBar from "./progress-bar"
import { validateEmail, sanitizeInput } from "@/utils/validation"

interface EmailScreenProps {
  onNext: (email: string) => void
  onBack: () => void
  isLoading?: boolean
}

export default function EmailScreen({ onNext, onBack, isLoading = false }: EmailScreenProps) {
  const [email, setEmail] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value)
    setEmail(value)
    
    const validation = validateEmail(value)
    setIsValid(validation.isValid)
    setErrors(validation.errors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext(email)
    }
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
          <ProgressBar currentStep={1} totalSteps={3} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">What&apos;s your email?</h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            We&apos;ll use this to create your account and send important updates.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full h-10 sm:h-11 text-sm sm:text-base border-gray-300 focus:border-gray-900 focus:ring-gray-900 ${
                  errors.length > 0 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                autoFocus
              />
              {errors.length > 0 && (
                <div className="mt-2">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-500">{error}</p>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Bottom Button */}
        <div className="mt-4 md:mt-6">
          <Button
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={!isValid || isLoading}
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
          >
            {isLoading ? "Processing..." : "Continue"}
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="p-2">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <ProgressBar currentStep={1} totalSteps={3} />

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">What&apos;s your email?</h1>
            <p className="text-gray-600 text-base lg:text-lg">
              We&apos;ll use this to create your account and send important updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full h-11 lg:h-12 text-base lg:text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 ${
                  errors.length > 0 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                autoFocus
              />
              {errors.length > 0 && (
                <div className="mt-2">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-500">{error}</p>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full h-11 lg:h-12 text-base lg:text-lg font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
            >
              {isLoading ? "Processing..." : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
