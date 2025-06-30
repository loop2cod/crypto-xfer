"use client"

import { useState, useEffect } from "react"
import {  RefreshCw, Send, Plus, Clock, CheckCircle, AlertCircle, Eye, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import XferLogo from "./logo/xfer-logo"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useTransfer } from "@/context/TransferContext"
import useToast from "@/hooks/useToast"
import TransferHistory from "@/components/transfer-history"

interface Transaction {
  id: string
  type: "crypto-to-fiat" | "fiat-to-crypto"
  amount: string
  currency: string
  status: "pending" | "completed" | "failed"
  date: string
  timestamp: string
  recipient?: string
  wallet?: string
  fee: string
  txHash?: string
  bankDetails?: {
    accountName: string
    accountNumber: string
    bankName: string
    routingNumber: string
  }
}

export default function Dashboard() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState("Overview")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useRouter()
  const { logout, user } = useAuth()
  const { transfers, getUserTransfers, isLoading: transfersLoading } = useTransfer()

  const email = user?.email || "user@example.com"

  const handleLogout = () => {
    logout()
    // Note: The auth context will handle redirecting to login
  }

  // Mock transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: "TXN-001",
      type: "crypto-to-fiat",
      amount: "500.00",
      currency: "USDT",
      status: "completed",
      date: "2024-01-15",
      timestamp: "2024-01-15T14:30:00Z",
      recipient: "John Doe",
      fee: "5.00",
      txHash: "0x742d35cc6bf3c8f3a1234567890abcdef",
      bankDetails: {
        accountName: "John Doe",
        accountNumber: "****1234",
        bankName: "Chase Bank",
        routingNumber: "021000021",
      },
    },
    {
      id: "TXN-002",
      type: "fiat-to-crypto",
      amount: "1000.00",
      currency: "USDT",
      status: "pending",
      date: "2024-01-14",
      timestamp: "2024-01-14T10:15:00Z",
      wallet: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
      fee: "10.00",
    },
    {
      id: "TXN-003",
      type: "crypto-to-fiat",
      amount: "250.00",
      currency: "USDT",
      status: "failed",
      date: "2024-01-13",
      timestamp: "2024-01-13T16:45:00Z",
      recipient: "Jane Smith",
      fee: "2.50",
      bankDetails: {
        accountName: "Jane Smith",
        accountNumber: "****5678",
        bankName: "Bank of America",
        routingNumber: "026009593",
      },
    },
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const totalSent = transactions
    .filter((t) => t.type === "crypto-to-fiat" && t.status === "completed")
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

  const pendingCount = transactions.filter((t) => t.status === "pending").length
  const completedCount = transactions.filter((t) => t.status === "completed").length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-gray-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-gray-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-gray-50 text-gray-600 border-gray-300"
      case "failed":
        return "bg-gray-200 text-gray-900 border-gray-400"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-6xl mx-auto">
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
   <header className="md:px-3 md:py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mx-auto max-w-6xl">
          <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-gray-900 scale-100 sm:scale-120 h-16 md:h-20">
            <XferLogo/>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 hidden sm:inline">{email}</span>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Logout</span>
          </Button>
        </div>
        </div>
      </header>

      <div className="md:max-w-6xl mx-auto">
        {/* Account Section */}
        <div className="bg-white p-3 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-400 rounded-xl grid grid-cols-3 gap-0.5 p-1.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${i % 3 === 0 ? "bg-white" : i % 2 === 0 ? "bg-gray-200" : "bg-gray-400"}`}
                  ></div>
                ))}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">USDT Transfer</h2>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
            </div>
          </div>

          {/* Balance Display */}
          <div className="mb-4">
            <div className="text-3xl font-bold mb-1 text-gray-900">1,250.00 USDT</div>
            <div className="text-base text-gray-600">≈ $1,250.00 USD</div>
            <div className="text-xs text-gray-500 mt-1">Updated 11 minutes ago</div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link href="/transfer">
              <Button className="w-full flex items-center justify-center space-x-2 h-10 bg-gray-900 hover:bg-gray-800 text-white">
                <Send className="w-4 h-4" />
                <span className="text-sm">Send to Bank</span>
              </Button>
            </Link>
            <Link href="/buy">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Buy USDT</span>
              </Button>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 mb-4 border-b border-gray-200">
            {["Overview", "Activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content based on active tab */}
          {activeTab === "Overview" && (
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-3">
                <Card className="border-gray-200 gap-0 p-2 md:p-4">
                  <CardHeader className="p-2 md:p-4">
                    <CardTitle className="text-xs font-medium text-gray-600">Total Sent</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 md:p-4">
                    <div className="text-xl font-bold text-gray-900">${totalSent.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">Crypto to Fiat transfers</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-gray-200 gap-0 p-2 md:p-4">
                    <CardHeader className="p-2 md:p-4">
                      <CardTitle className="text-xs font-medium text-gray-600">Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 md:p-4">
                      <div className="text-lg font-bold text-gray-600">{pendingCount}</div>
                      <p className="text-xs text-gray-500">Processing</p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 gap-0 p-2 md:p-4">
                    <CardHeader className="p-2 md:p-4">
                      <CardTitle className="text-xs font-medium text-gray-600">Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 md:p-4">
                      <div className="text-lg font-bold text-gray-800">{completedCount}</div>
                      <p className="text-xs text-gray-500">Successful</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Transfers */}
              <TransferHistory 
                limit={3}
                showFilters={false}
                showPagination={false}
              />
            </div>
          )}

          {activeTab === "Activity" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold">Transfer History</h3>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="text-xs">Refresh</span>
                </Button>
              </div>

              <TransferHistory 
                limit={20}
                showFilters={true}
                showPagination={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}