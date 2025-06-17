"use client"

import { Button } from "@/components/ui/button"
import XferLogo from "../logo/xfer-logo"

interface WelcomeScreenProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export default function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <XferLogo />
        </div>

        {/* 3D Elements Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-6 sm:mb-8 flex items-center justify-center mx-auto">
          {/* Bitcoin Symbol */}
          <div className="absolute top-8 sm:top-12 left-12 sm:left-16 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full shadow-xl flex items-center justify-center transform -rotate-12 transition-all duration-700 hover:scale-110 hover:shadow-2xl animate-float">
            <span className="text-lg sm:text-2xl font-bold text-gray-700 transition-colors duration-300">₿</span>
          </div>

          {/* Dollar Symbol */}
          <div className="absolute top-6 sm:top-8 right-8 sm:right-12 w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-lg flex items-center justify-center transform rotate-12 transition-all duration-700 hover:scale-110 hover:shadow-2xl animate-float-delayed">
            <span className="text-base sm:text-xl font-bold text-white transition-colors duration-300">$</span>
          </div>

          {/* Ethereum Symbol */}
          <div className="absolute bottom-16 sm:bottom-20 left-6 sm:left-8 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full shadow-lg flex items-center justify-center transform rotate-45 transition-all duration-700 hover:scale-110 hover:shadow-2xl animate-float-slow">
            <span className="text-sm sm:text-lg font-bold text-gray-700 transition-colors duration-300">Ξ</span>
          </div>

          {/* Euro Symbol */}
          <div className="absolute bottom-8 sm:bottom-12 right-16 sm:right-20 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full shadow-lg flex items-center justify-center transform -rotate-45 transition-all duration-700 hover:scale-110 hover:shadow-2xl animate-float-fast">
            <span className="text-xs sm:text-sm font-bold text-white transition-colors duration-300">€</span>
          </div>

          {/* Central Conversion Hub */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-200 transition-all duration-500 hover:scale-105 animate-pulse-slow">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gray-100">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 rounded-full animate-spin-slow"></div>
            </div>
          </div>

          {/* Animated Conversion Arrows */}
          <div className="absolute top-1/2 left-6 sm:left-8 transform -translate-y-1/2 animate-slide-right">
            <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-gray-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-600 border-t-2 border-t-transparent border-b-2 border-b-transparent animate-pulse"></div>
            </div>
          </div>

          <div className="absolute top-1/2 right-6 sm:right-8 transform -translate-y-1/2 rotate-180 animate-slide-left">
            <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-gray-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer-delayed"></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-600 border-t-2 border-t-transparent border-b-2 border-b-transparent animate-pulse"></div>
            </div>
          </div>

          <div className="absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 rotate-90 animate-slide-down">
            <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-gray-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer-slow"></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-600 border-t-2 border-t-transparent border-b-2 border-b-transparent animate-pulse"></div>
            </div>
          </div>

          <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 -rotate-90 animate-slide-up">
            <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-gray-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer-fast"></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-600 border-t-2 border-t-transparent border-b-2 border-b-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Floating Transfer Indicators with Orbital Motion */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 sm:w-32 sm:h-32 animate-spin-very-slow">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full shadow-md animate-pulse-fast"></div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 sm:w-40 sm:h-40 animate-spin-reverse-slow">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-md animate-pulse-medium"></div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-40 h-40 sm:w-48 sm:h-48 animate-spin-very-slow">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full shadow-md animate-pulse-slow"></div>
            </div>
          </div>

          {/* Ripple Effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 border border-gray-300 rounded-full animate-ping opacity-20"></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 border border-gray-400 rounded-full animate-ping opacity-10"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Get Started</h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Sign in with existing wallet
            <br />
            or create a new one
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3 sm:space-y-4">
          <Button
            variant="outline"
            onClick={onSignIn}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium border-2 border-dashed border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100"
          >
            Sign In
          </Button>

          <Button
            onClick={onGetStarted}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium bg-gray-900 hover:bg-gray-800 text-white"
          >
            Create A New
          </Button>
        </div>
      </div>
    </div>
  )
}
