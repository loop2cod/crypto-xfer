"use client";

import React, { useEffect, useState } from 'react';
import { RefreshCw, Filter, Clock, User, Shield, CreditCard, FileText, Activity as ActivityIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { activityService, UserActivity, UserActivityStats, ActivityFilters } from '@/services/activity';
import useToast from '@/hooks/useToast';

interface UserActivityComponentProps {
  limit?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  showStats?: boolean;
}

export const UserActivityComponent: React.FC<UserActivityComponentProps> = ({
  limit = 10,
  showFilters = true,
  showPagination = true,
  showStats = true,
}) => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<UserActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    loadActivities();
    if (showStats) {
      loadStats();
    }
  }, [currentPage, actionFilter, resourceTypeFilter, limit]);

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ActivityFilters = {
        skip: currentPage * limit,
        limit: limit,
      };

      if (actionFilter) filters.action = actionFilter;
      if (resourceTypeFilter) filters.resource_type = resourceTypeFilter;

      const response = await activityService.getUserActivities(filters);

      setActivities(response.activities);
      setTotalCount(response.total);
      setTotalPages(response.total_pages);
      setHasNext(response.has_next);
      setHasPrev(response.has_prev);
    } catch (error: any) {
      console.error('Failed to load activities:', error);
      setError(error.message || 'Failed to load activities');
      showToast({
        title: 'Error',
        description: 'Failed to load activities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await activityService.getUserActivityStats(30);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load activity stats:', error);
    }
  };

  const handleRefresh = () => {
    loadActivities();
    if (showStats) {
      loadStats();
    }
  };

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value === 'all' ? '' : value);
    setCurrentPage(0);
  };

  const handleResourceTypeFilterChange = (value: string) => {
    setResourceTypeFilter(value === 'all' ? '' : value);
    setCurrentPage(0);
  };

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-4">
        {showStats && (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Loading activities...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {showStats && stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{stats.total_activities}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Most Common</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {stats.actions_breakdown[0]?.action ? 
                  activityService.formatActivityAction(stats.actions_breakdown[0].action) : 
                  'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.actions_breakdown[0]?.count || 0} times
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Last Login</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {stats.last_login ? 
                  activityService.formatDate(stats.last_login) : 
                  'Never'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.last_login ? activityService.formatTime(stats.last_login) : ''}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading activities</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!error && activities.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <ActivityIcon className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500 mb-2">No activities found</p>
              <p className="text-sm text-gray-400">
                Your account activities will appear here
              </p>
            </div>
          )}

          {!error && activities.length > 0 && (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-full text-sm ${activityService.getActivityColor(activity.action)}`}>
                    {activityService.getActivityIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activityService.formatActivityAction(activity.action)}
                      </p>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {activityService.formatDate(activity.created_at)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activityService.formatTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    {activity.resource_type && (
                      <div>
                        <Badge variant="secondary" className="text-xs">
                          {activity.resource_type}
                        </Badge>
                      </div>
                    )}
                    
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="text-xs text-gray-600">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={!hasPrev || loading}
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasNext || loading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivityComponent;