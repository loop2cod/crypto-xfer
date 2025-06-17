"use client"

import { useState } from "react"
import WelcomeScreen from "./signup-flow/welcome-screen"
import EmailScreen from "./signup-flow/email-screen"
import PasswordScreen from "./signup-flow/password-screen"
import VerificationScreen from "./signup-flow/verification-screen"
import SignInEmailScreen from "./signup-flow/signin-email-screen"
import SignInPasswordScreen from "./signup-flow/signin-password-screen"
import Dashboard from "./dashboard"

type FlowStep =
  | "welcome"
  | "signup-email"
  | "signup-password"
  | "verification"
  | "signin-email"
  | "signin-password"
  | "dashboard"

interface UserData {
  email: string
  password: string
}

export default function SignupFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("welcome")
  const [userData, setUserData] = useState<UserData>({
    email: "",
    password: "",
  })

  const handleGetStarted = () => {
    setCurrentStep("signup-email")
  }

  const handleSignIn = () => {
    setCurrentStep("signin-email")
  }

  const handleSignupEmailNext = (email: string) => {
    setUserData((prev) => ({ ...prev, email }))
    setCurrentStep("signup-password")
  }

  const handleSignupPasswordNext = (password: string) => {
    setUserData((prev) => ({ ...prev, password }))
    setCurrentStep("verification")
  }

  const handleVerificationNext = () => {
    setCurrentStep("dashboard")
  }

  const handleSignInEmailNext = (email: string) => {
    setUserData((prev) => ({ ...prev, email }))
    setCurrentStep("signin-password")
  }

  const handleSignInPasswordNext = () => {
    setCurrentStep("dashboard")
  }

  const handleBack = () => {
    switch (currentStep) {
      case "signup-email":
      case "signin-email":
        setCurrentStep("welcome")
        break
      case "signup-password":
        setCurrentStep("signup-email")
        break
      case "verification":
        setCurrentStep("signup-password")
        break
      case "signin-password":
        setCurrentStep("signin-email")
        break
      default:
        break
    }
  }

  return (
    <>
      {currentStep === "welcome" && <WelcomeScreen onGetStarted={handleGetStarted} onSignIn={handleSignIn} />}

      {currentStep === "signup-email" && <EmailScreen onNext={handleSignupEmailNext} onBack={handleBack} />}

      {currentStep === "signup-password" && (
        <PasswordScreen email={userData.email} onNext={handleSignupPasswordNext} onBack={handleBack} />
      )}

      {currentStep === "verification" && (
        <VerificationScreen email={userData.email} onNext={handleVerificationNext} onBack={handleBack} />
      )}

      {currentStep === "signin-email" && <SignInEmailScreen onNext={handleSignInEmailNext} onBack={handleBack} />}

      {currentStep === "signin-password" && (
        <SignInPasswordScreen email={userData.email} onNext={handleSignInPasswordNext} onBack={handleBack} />
      )}

      {currentStep === "dashboard" && <Dashboard email={userData.email} />}
    </>
  )
}
