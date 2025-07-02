import { get } from "@/utilities/AxiosInterceptor";
import { formatRelativeTime, formatTime as formatTimeUtil } from "@/lib/utils";


export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserActivityListResponse {
  activities: UserActivity[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UserActivityStats {
  period_days: number;
  total_activities: number;
  actions_breakdown: Array<{
    action: string;
    count: number;
  }>;
  last_login?: string;
}

export interface ActivityFilters {
  skip?: number;
  limit?: number;
  action?: string;
  resource_type?: string;
}

  const baseUrl = '/api/v1/user-activities';
class ActivityService {

  async getUserActivities(filters: ActivityFilters = {}): Promise<UserActivityListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
      if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
      if (filters.action) params.append('action', filters.action);
      if (filters.resource_type) params.append('resource_type', filters.resource_type);

      const response = await get<any>(`${baseUrl}?${params.toString()}`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch user activities');
      }
    } catch (error: any) {
      console.error('Error fetching user activities:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch user activities');
    }
  }

  async getUserActivityStats(days: number = 30): Promise<UserActivityStats> {
    try {
      const response = await get<any>(`${baseUrl}/stats?days=${days}`);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch activity stats');
      }
    } catch (error: any) {
      console.error('Error fetching activity stats:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch activity stats');
    }
  }

  // Helper methods for formatting
  formatActivityAction(action: string): string {
    const actionMap: Record<string, string> = {
      'login': 'Logged in',
      'logout': 'Logged out',
      'profile_update': 'Updated profile',
      'password_change': 'Changed password',
      'email_verification': 'Verified email',
      'transfer_create': 'Created transfer',
      'transfer_update': 'Updated transfer',
      'transfer_cancel': 'Cancelled transfer',
      'wallet_create': 'Created wallet',
      'wallet_update': 'Updated wallet',
      'kyc_submit': 'Submitted KYC',
      'kyc_update': 'Updated KYC'
    };
    
    return actionMap[action] || action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getActivityIcon(action: string): string {
    const iconMap: Record<string, string> = {
      'login': '🔐',
      'logout': '🚪',
      'profile_update': '👤',
      'password_change': '🔑',
      'email_verification': '✉️',
      'transfer_create': '💸',
      'transfer_update': '📝',
      'transfer_cancel': '❌',
      'wallet_create': '💳',
      'wallet_update': '💳',
      'kyc_submit': '📋',
      'kyc_update': '📋'
    };
    
    return iconMap[action] || '📝';
  }

  getActivityColor(action: string): string {
    const colorMap: Record<string, string> = {
      'login': 'text-green-600 bg-green-50',
      'logout': 'text-gray-600 bg-gray-50',
      'profile_update': 'text-blue-600 bg-blue-50',
      'password_change': 'text-orange-600 bg-orange-50',
      'email_verification': 'text-purple-600 bg-purple-50',
      'transfer_create': 'text-emerald-600 bg-emerald-50',
      'transfer_update': 'text-yellow-600 bg-yellow-50',
      'transfer_cancel': 'text-red-600 bg-red-50',
      'wallet_create': 'text-indigo-600 bg-indigo-50',
      'wallet_update': 'text-indigo-600 bg-indigo-50',
      'kyc_submit': 'text-teal-600 bg-teal-50',
      'kyc_update': 'text-teal-600 bg-teal-50'
    };
    
    return colorMap[action] || 'text-gray-600 bg-gray-50';
  }

  formatDate(dateString: string): string {
    return formatRelativeTime(dateString, 'Unknown');
  }

  formatTime(dateString: string): string {
    return formatTimeUtil(dateString, '');
  }
}

export const activityService = new ActivityService();
export default activityService;