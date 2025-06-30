"use client"

import { useAuth } from "@/context/AuthContext"
import SignupFlow from "./signup-flow"
import AuthLoader from "./auth-loader"

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Authentication wrapper component that checks if user is authenticated
 * Shows signup flow if not authenticated, otherwise shows the protected content
 */
export default function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <AuthLoader>
        {children}
      </AuthLoader>
    )
  }

  // If user is authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>
  }

  // If user is not authenticated, show the signup flow or custom fallback
  return <>{fallback || <SignupFlow />}</>
}