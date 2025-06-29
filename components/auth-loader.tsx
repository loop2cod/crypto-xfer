"use client"

import { useAuth } from "@/context/AuthContext"

interface AuthLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that shows loading state while authentication is being initialized
 * This prevents flash of unauthenticated content
 */
export default function AuthLoader({ children, fallback }: AuthLoaderProps) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}