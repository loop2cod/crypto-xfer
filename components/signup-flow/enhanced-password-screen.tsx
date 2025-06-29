"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import ProgressBar from "./progress-bar"
import { validatePassword, sanitizeInput } from "@/utils/validation"

interface PasswordScreenProps {
  onNext: (password: string) => void
  onBack: () => void
  isLoading?: boolean
}

export default function EnhancedPasswordScreen({ onNext, onBack, isLoading = false }: PasswordScreenProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  
  const handlePasswordChange = (value: string) => {
    const sanitized = sanitizeInput(value)
    setPassword(sanitized)
    
    const validation = validatePassword(sanitized)
    setPasswordErrors(validation.errors)
  }

  const handleConfirmPasswordChange = (value: string) => {
    const sanitized = sanitizeInput(value)
    setConfirmPassword(sanitized)
  }

  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password)
    if (validation.isValid) return { strength: "Strong", color: "text-green-600" }
    if (password.length >= 8) return { strength: "Good", color: "text-yellow-500" }
    return { strength: "Weak", color: "text-red-500" }
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const isPasswordValid = validatePassword(password).isValid
  const isValid = isPasswordValid && passwordsMatch && agreedToTerms

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext(password)
    }
  }

  const getPasswordRequirements = () => {
    const requirements = [
      { met: password.length >= 8, text: "At least 8 characters" },
      { met: /[a-z]/.test(password), text: "One lowercase letter" },
      { met: /[A-Z]/.test(password), text: "One uppercase letter" },
      { met: /\d/.test(password), text: "One number" },
      { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), text: "One special character" },
    ]
    return requirements
  }

  const requirements = getPasswordRequirements()

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
          <ProgressBar currentStep={2} totalSteps={3} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Create Password</h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            Choose a strong password to secure your wallet.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full h-10 sm:h-11 text-sm sm:text-base border-gray-300 focus:border-gray-900 focus:ring-gray-900 pr-12 ${
                    passwordErrors.length > 0 ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              
              {password && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Password strength: <span className={passwordStrength.color}>{passwordStrength.strength}</span>
                  </p>
                  
                  {/* Password Requirements */}
                  <div className="space-y-1">
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        {req.met ? (
                          <Check className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-gray-400 mr-2" />
                        )}
                        <span className={req.met ? "text-green-600" : "text-gray-500"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full h-10 sm:h-11 text-sm sm:text-base border-gray-300 focus:border-gray-900 focus:ring-gray-900 pr-12 ${
                    confirmPassword && !passwordsMatch ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-5">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          </form>
        </div>

        {/* Bottom Button */}
        <div className="mt-4 md:mt-6">
          <Button
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={!isValid || isLoading}
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white"
          >
            {isLoading ? "Creating Account..." : "Create Password"}
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
          <ProgressBar currentStep={2} totalSteps={3} />

          {/* Content */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">Create Password</h1>
            <p className="text-gray-600 text-base lg:text-lg">
              Choose a strong password to secure your wallet.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full h-11 lg:h-12 text-base lg:text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 pr-12 ${
                    passwordErrors.length > 0 ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" />
                  )}
                </button>
              </div>
              
              {password && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Password strength: <span className={passwordStrength.color}>{passwordStrength.strength}</span>
                  </p>
                  
                  {/* Password Requirements */}
                  <div className="grid grid-cols-1 gap-2">
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {req.met ? (
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400 mr-2" />
                        )}
                        <span className={req.met ? "text-green-600" : "text-gray-500"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full h-11 lg:h-12 text-base lg:text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 pr-12 ${
                    confirmPassword && !passwordsMatch ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms-desktop"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms-desktop" className="text-sm text-gray-700 leading-6">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full h-11 lg:h-12 text-base lg:text-lg font-medium bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white"
            >
              {isLoading ? "Creating Account..." : "Create Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}