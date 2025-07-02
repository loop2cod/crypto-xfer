import { useState, useEffect, useCallback } from 'react'
import dashboardService, { DashboardData } from '@/services/dashboard'
import useToast from './useToast'

interface UseDashboardReturn {
  dashboardData: DashboardData | null
  isLoading: boolean
  error: string | null
  refreshDashboard: () => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await dashboardService.getDashboardData()
      setDashboardData(data)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load dashboard data'
      setError(errorMessage)
      console.error('Dashboard fetch error:', err)
      
      // Don't show toast on initial load, only on refresh
      if (dashboardData !== null) {
        showToast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  const refreshDashboard = useCallback(async () => {
    await fetchDashboardData()
    if (!error) {
      showToast({
        title: 'Success',
        description: 'Dashboard refreshed successfully.',
        variant: 'success'
      })
    }
  }, [fetchDashboardData, error, showToast])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    dashboardData,
    isLoading,
    error,
    refreshDashboard
  }
}

export default useDashboard