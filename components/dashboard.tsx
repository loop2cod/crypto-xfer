"use client"

import { useState } from "react"
import { ChevronDown, Copy, RefreshCw, SlidersHorizontal, Plus, Send, ArrowDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import XferLogo from "./logo/xfer-logo"

interface DashboardProps {
  email: string
}

export default function Dashboard({ email }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("Portfolio")
  const [activeAssetType, setActiveAssetType] = useState("Crypto")

  const cryptoAssets = [
    {
      symbol: "USDT",
      name: "Tether",
      price: "$1",
      change: "-0.01%",
      balance: "0",
      balanceUSD: "$0.00",
      color: "bg-gray-500",
      icon: "₮",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      price: "$0.9998",
      change: "-0.01%",
      balance: "0",
      balanceUSD: "$0.00",
      color: "bg-gray-600",
      icon: "$",
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: "$104,491.9",
      change: "-2.85%",
      balance: "0",
      balanceUSD: "$0.00",
      color: "bg-gray-700",
      icon: "₿",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-gray-900 scale-100 sm:scale-120">
            <XferLogo />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-gray-300 to-gray-500 rounded grid grid-cols-2 gap-0.5 p-0.5 sm:p-1">
              <div className="bg-white rounded-sm"></div>
              <div className="bg-gray-200 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
            </div>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Account Section */}
        <div className="p-3 sm:p-4 lg:p-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-gray-200 to-gray-400 rounded-xl grid grid-cols-3 gap-0.5 p-1.5 sm:p-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${i % 3 === 0 ? "bg-white" : i % 2 === 0 ? "bg-gray-200" : "bg-gray-400"}`}
                  ></div>
                ))}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Account 01</h2>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-500">$0.00</div>
              <div className="w-24 sm:w-32 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-500"></div>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">$0.00</div>
            </div>
          </div>

          {/* Balance Display */}
          <div className="mb-4 sm:mb-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-gray-900">$0.00</div>
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
              <span className="text-gray-700">$0.00</span>
              <span className="hidden sm:inline">1D</span>
              <span>Updated 11 minutes ago</span>
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-700" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button className="flex items-center justify-center space-x-2 h-9 sm:h-10 bg-gray-900 hover:bg-gray-800 text-white">
              <Send className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Transfer</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 h-9 sm:h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Convert</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 h-9 sm:h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Buy</span>
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 sm:space-x-6 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
            {["Portfolio", "Activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 sm:pb-3 px-1 text-sm sm:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/*Filter Controls */}
          <div className="flex justify-end space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <button className="bg-gray-100 rounded-lg p-2 sm:p-3 border border-gray-200 sm:w-auto sm:max-w-fit">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mx-auto" />
            </button>
          </div>

          {/* Asset List Header */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 font-medium">
            <div>Asset</div>
            <div>Price</div>
            <div className="text-right">Balance</div>
          </div>

          {/* Asset List */}
          <div className="space-y-2 sm:space-y-4">
            {cryptoAssets.map((asset) => (
              <div
                key={asset.symbol}
                className="grid grid-cols-3 gap-2 sm:gap-4 items-center py-2 sm:py-3 hover:bg-gray-50 rounded-lg px-1 sm:px-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${asset.color} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base`}
                  >
                    {asset.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{asset.symbol}</div>
                    <div className="text-xs text-gray-500 sm:hidden">{asset.name}</div>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{asset.price}</div>
                  <div
                    className={`text-xs sm:text-sm ${asset.change.startsWith("-") ? "text-gray-600" : "text-gray-700"}`}
                  >
                    {asset.change}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{asset.balance}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{asset.balanceUSD}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
