import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export const ForbiddenState = ({
  title = '403 Access Denied',
  message = 'You do not have authorization to view or manage this business.',
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-rose-50/90 border border-rose-200/90 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-10 space-y-4 animate-fadeIn">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <div className="inline-block">
        <span className="text-[10px] uppercase font-mono tracking-widest text-rose-700 font-extrabold bg-rose-100/90 px-3.5 py-1 rounded-full border border-rose-200">
          {title}
        </span>
      </div>

      <h3 className="font-black text-2xl text-slate-900 tracking-tight">
        Permission Restricted
      </h3>

      <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
        <Button
          onClick={() => navigate(ROUTES.BUSINESS_SELECT)}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl px-6 h-11 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Building2 className="h-4 w-4" />
          Switch Active Business
        </Button>

        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl px-5 h-11 font-semibold"
          >
            Retry Request
          </Button>
        )}
      </div>
    </div>
  );
};
