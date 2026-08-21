import React from 'react';
import { useBackendWake } from '@/hooks/useBackendWake';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BackendStatusBanner = ({ className = '', variant = 'default' }) => {
  const { status, isStarting, isBackendReady, isError, errorMessage, retry } = useBackendWake();

  if (isBackendReady) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold backdrop-blur-md transition-all ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Backend is ready</span>
      </div>
    );
  }

  if (isStarting) {
    return (
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs shadow-sm backdrop-blur-md gap-2 ${className}`}>
        <div className="flex items-center space-x-2.5">
          <Loader2 className="h-4 w-4 text-amber-600 animate-spin shrink-0" />
          <div>
            <span className="font-bold text-amber-950 block">Backend is starting...</span>
            <span className="text-amber-800 text-[11px]">Please wait while InventoryHub starts.</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-900 text-xs shadow-sm backdrop-blur-md gap-2 ${className}`}>
        <div className="flex items-center space-x-2.5">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="font-semibold text-red-950">{errorMessage || 'Backend could not be started. Please try again.'}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={retry}
          className="h-8 px-3 text-xs border-red-300 hover:bg-red-100 text-red-800 font-medium shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  return null;
};
