import { get } from '@/utilities/AxiosInterceptor'

export interface DashboardStats {
  total_sent: number
  pending_requests: number
  completed_transfers: number
  failed_transfers: number
  total_fees_paid: number
}

export interface DashboardData {
  customer_id: string
  full_name: string
  email: string
  kyc_status: string
  account_balance: number
  is_verified: boolean
  member_since: string
  last_activity: string
  stats: DashboardStats
  account_limits: {
    daily_limit: number
    monthly_limit: number
    used_daily: number
    used_monthly: number
  }
}

export interface DashboardResponse {
  success: boolean
  data: DashboardData
  message: string
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await get<DashboardResponse>('/api/v1/users/dashboard')
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch dashboard data')
    } catch (error: any) {
      console.error('Dashboard service error:', error)
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch dashboard data')
    }
  }

  // Utility methods for formatting
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  getKycStatusDisplay(status: string): { text: string; color: string } {
    switch (status.toLowerCase()) {
      case 'approved':
        return { text: 'Verified', color: 'text-green-600 bg-green-50 border-green-200' }
      case 'pending':
        return { text: 'Pending', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
      case 'rejected':
        return { text: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200' }
      default:
        return { text: 'Unknown', color: 'text-gray-600 bg-gray-50 border-gray-200' }
    }
  }

  getTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    
    return this.formatDate(dateString)
  }
}

export const dashboardService = new DashboardService()
export default dashboardService