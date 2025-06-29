"use client"

import { useAuth } from '@/context/AuthContext';
import SignupFlow from './signup-flow';
import Dashboard from './dashboard';
import { Loader2 } from 'lucide-react';

export default function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      </div>
    );
  }

  // Show dashboard if authenticated, otherwise show signup flow
  return isAuthenticated ? <Dashboard /> : <SignupFlow />;
}