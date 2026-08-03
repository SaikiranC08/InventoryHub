import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const OnboardingCheckPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-stitch-surface p-4">
      <Card className="max-w-md w-full glass-card p-4 text-center space-y-4">
        <CardHeader className="space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-stitch-primary mx-auto mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Authentication Verified
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Redirected to <code className="font-mono text-stitch-primary font-bold">/onboarding-check</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-1 font-mono text-slate-600">
            <p className="font-bold text-slate-900">Status: Authenticated</p>
            <p>Auth token stored in AuthService</p>
            <p>Awaiting tenant & business onboarding configuration</p>
          </div>
          <Button
            variant="stitch"
            className="w-full"
            onClick={() => navigate(ROUTES.HOME)}
          >
            Return to Landing Page <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
