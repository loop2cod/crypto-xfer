"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/useToast"
import WelcomeScreen from "./signup-flow/welcome-screen"
import EmailScreen from "./signup-flow/email-screen"
import EnhancedPasswordScreen from "./signup-flow/enhanced-password-screen"
import VerificationScreen from "./signup-flow/verification-screen"
import SignInEmailScreen from "./signup-flow/signin-email-screen"
import SignInPasswordScreen from "./signup-flow/signin-password-screen"
import ForgotPasswordScreen from "./signup-flow/forgot-password-screen"
import ToastContainer from "./ui/toast-container"
import authService from "@/services/auth"

type FlowStep =
  | "welcome"
  | "signup-email"
  | "verification"
  | "signup-password"
  | "signin-email"
  | "signin-password"
  | "forgot-password"

interface UserData {
  email: string
  password: string
  verificationCode?: string
  first_name?: string
  last_name?: string
  phone?: string
}

export default function SignupFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("welcome")
  const [userData, setUserData] = useState<UserData>({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, toasts, hideToast } = useToast()
  const { setAuthenticated } = useAuth()

  const handleGetStarted = () => {
    setCurrentStep("signup-email")
  }

  const handleSignIn = () => {
    setCurrentStep("signin-email")
  }

  const handleSignupEmailNext = async (email: string) => {
    setUserData((prev) => ({ ...prev, email }))
    setIsLoading(true)

    try {
      // Send pre-registration verification code immediately after email entry
      const response = await authService.sendPreRegistrationCode({ email })
      if (response.success) {
        showToast({
          type: 'success',
          message: 'Verification code sent to your email!',
        })

        setCurrentStep("verification")
      } else {
        showToast({
          type: 'error',
          message: response.message || 'Failed to send verification code. Please try again.',
        })
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to send verification code. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupPasswordNext = async (password: string) => {
    setUserData((prev) => ({ ...prev, password }))
    setIsLoading(true)

    try {
      // Register the user - since email is already verified, they can complete registration
      const registerResponse = await authService.register({
        email: userData.email,
        password: password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
      })

      if (!registerResponse.success) {
        showToast({
          type: 'error',
          message: registerResponse.message || 'Registration failed. Please try again.',
        })
        return
      }

      // Auto-login after successful registration
      const loginResponse = await authService.login({
        email: userData.email,
        password: password,
      })


      if (!loginResponse.success) {
        showToast({
          type: 'error',
          message: loginResponse.message || 'Login failed after registration. Please try signing in manually.',
        })
        return
      }

      // Explicitly set tokens in localStorage
      if (loginResponse.data.access_token) {
        setAuthenticated(loginResponse.data.user)

        // Success - show welcome message
        showToast({
          type: 'success',
          message: 'Account created successfully! Welcome to Xfer.',
        })
        localStorage.setItem('access_token', loginResponse.data.access_token);
        localStorage.setItem('refresh_token', loginResponse.data.refresh_token);
        localStorage.setItem('token_type', loginResponse.data.token_type);
      }

    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationNext = async (verificationCode: string) => {
    setIsLoading(true)

    try {
      // Verify the pre-registration code - this will also verify the email
      const response = await authService.verifyPreRegistrationCode({ email: userData.email, verification_code: verificationCode })
      if (response.success) {
        // Store the verification code for later use during registration
        setUserData((prev) => ({ ...prev, verificationCode }))

        showToast({
          type: 'success',
          message: 'Code verified! Now set your password.',
        })

        setCurrentStep("signup-password")
      } else {
        showToast({
          type: 'error',
          message: response.message || 'Invalid verification code. Please try again.',
        })
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Invalid verification code. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInEmailNext = (email: string) => {
    setUserData((prev) => ({ ...prev, email }))
    setCurrentStep("signin-password")
  }

  const handleSignInPasswordNext = async (password: string) => {
    setIsLoading(true)

    try {
      const loginResponse = await authService.login({
        email: userData.email,
        password: password,
      })
      if (!loginResponse.success) {
        showToast({
          type: 'error',
          message: loginResponse.message || 'Login failed. Please check your credentials.',
        })
        return
      }

      // Explicitly set tokens in localStorage
      if (loginResponse.data.access_token) {
        showToast({
          type: 'success',
          message: 'Welcome back to Xfer!',
        })
        localStorage.setItem('access_token', loginResponse.data.access_token);
        localStorage.setItem('refresh_token', loginResponse.data.refresh_token);
        localStorage.setItem('token_type', loginResponse.data.token_type);
        setAuthenticated(loginResponse.data.user)
      }

      // AppRouter will automatically show dashboard
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Login failed. Please check your credentials.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setCurrentStep("forgot-password")
  }

  const handleForgotPasswordNext = async (email: string) => {
    setIsLoading(true)

    try {
      const response = await authService.forgotPassword({ email })

      if (response.success) {
        showToast({
          type: 'success',
          message: response.message,
        })

        // Go back to sign in email screen
        setCurrentStep("signin-email")
      } else {
        showToast({
          type: 'error',
          message: response.message,
        })
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to send reset link. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case "signup-email":
      case "signin-email":
        setCurrentStep("welcome")
        break
      case "verification":
        setCurrentStep("signup-email")
        break
      case "signup-password":
        setCurrentStep("verification")
        break
      case "signin-password":
        setCurrentStep("signin-email")
        break
      case "forgot-password":
        setCurrentStep("signin-password")
        break
      default:
        break
    }
  }

  return (
    <>
      {currentStep === "welcome" && <WelcomeScreen onGetStarted={handleGetStarted} onSignIn={handleSignIn} />}

      {currentStep === "signup-email" && (
        <EmailScreen
          onNext={handleSignupEmailNext}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}

      {currentStep === "verification" && (
        <VerificationScreen
          email={userData.email}
          onNext={(code) => handleVerificationNext(code)}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}

      {currentStep === "signup-password" && (
        <EnhancedPasswordScreen
          onNext={handleSignupPasswordNext}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}

      {currentStep === "signin-email" && (
        <SignInEmailScreen
          onNext={handleSignInEmailNext}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}

      {currentStep === "signin-password" && (
        <SignInPasswordScreen
          email={userData.email}
          onNext={(password) => handleSignInPasswordNext(password)}
          onBack={handleBack}
          onForgotPassword={handleForgotPassword}
          isLoading={isLoading}
        />
      )}

      {currentStep === "forgot-password" && (
        <ForgotPasswordScreen
          onNext={handleForgotPasswordNext}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}

      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  )
}
