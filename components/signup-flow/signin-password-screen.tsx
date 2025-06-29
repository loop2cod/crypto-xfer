"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import authService from "@/services/auth"

interface SignInPasswordScreenProps {
  email: string
  onNext: (password: string) => void
  onBack: () => void
  onForgotPassword?: () => void
  isLoading?: boolean
}

export default function SignInPasswordScreen({ email, onNext, onBack, onForgotPassword, isLoading = false }: SignInPasswordScreenProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length >= 1) {
      try {
        setError("")
        setIsSigningIn(true)
        const response = await authService.login({ email, password })
        if (response.success) {
          onNext(password) // This will trigger the redirect to dashboard
        } else {
          setError(response.message || "Login failed")
        }
      } catch (error: any) {
        setError(error.message || "Login failed")
      } finally {
        setIsSigningIn(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <button onClick={onBack} className="p-2">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 py-2 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Enter Password</h1>
          <p className="text-gray-600 text-sm sm:text-base mb-2">Welcome back!</p>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">{email}</p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base border-gray-300 focus:border-gray-900 focus:ring-gray-900 pr-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  )}
                </button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="text-center">
              <button 
                type="button" 
                onClick={onForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Button */}
        <div className="p-4 sm:p-6">
          <Button
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={password.length < 1 || isSigningIn || isLoading}
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
          >
            {isSigningIn || isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex justify-center min-h-screen p-6 lg:p-8">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <button onClick={onBack} className="p-2">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">Enter Password</h1>
            <p className="text-gray-600 text-base lg:text-lg mb-2">Welcome back!</p>
            <p className="text-gray-500 text-sm lg:text-base">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 lg:h-12 text-base lg:text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 pr-12"
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
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="text-center">
              <button 
                type="button" 
                onClick={onForgotPassword}
                className="text-sm lg:text-base text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={password.length < 1 || isSigningIn || isLoading}
              className="w-full h-11 lg:h-12 text-base lg:text-lg font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
            >
              {isSigningIn || isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
