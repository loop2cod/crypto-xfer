"use client"

import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, CircleCheck } from 'lucide-react';
import { Toast } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onHideToast: (id: string) => void;
}

const getToastIcon = (variant: Toast['variant']) => {
  switch (variant) {
    case 'success':
      return <CircleCheck className="w-5 h-5 text-green-500" />;
    case 'destructive':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const getToastColors = (variant: Toast['variant']) => {
  switch (variant) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'destructive':
      return 'bg-red-50 border-red-200 text-red-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const ToastItem: React.FC<{ toast: Toast; onHide: (id: string) => void }> = ({
  toast,
  onHide,
}) => {
  return (
    <div
      className={`
        flex items-center p-3 mb-3 border rounded-lg shadow-lg transition-all duration-300 ease-in-out
        transform translate-x-0 opacity-100 animate-in slide-in-from-right
        ${getToastColors(toast.variant)}
      `}
    >
      <div className="flex-shrink-0 mr-2">
        {getToastIcon(toast.variant)}
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold mb-1">
            {toast.title}
          </p>
        )}
        <p className="text-xs">
          {toast.message}
        </p>
      </div>
      
      <button
        onClick={() => onHide(toast.id)}
        className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function ToastContainer({ toasts, onHideToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-3 z-50 w-full max-w-[340px]">
      <div className="space-y-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onHide={onHideToast}
          />
        ))}
      </div>
    </div>
  );
}