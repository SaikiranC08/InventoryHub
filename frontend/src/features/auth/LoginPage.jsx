import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Lock, User, Loader2, AlertCircle } from 'lucide-react';

// Zod Validation Schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loading, isAuthenticated, login, initializeUserBusiness } = useAuth();
  const [authError, setAuthError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      initializeUserBusiness().then((route) => {
        navigate(route, { replace: true });
      });
    }
  }, [isAuthenticated, loading, navigate, initializeUserBusiness]);

  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      await login({
        username: data.username,
        password: data.password,
      });

      toast.success('Signed in successfully!');
      const targetRoute = await initializeUserBusiness();
      navigate(targetRoute, { replace: true });
    } catch (err) {
      const errorMessage = err?.message || 'Something went wrong.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isPending = isSubmitting;

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back to InventoryHub
          </h1>
          <p className="text-sm text-slate-500">
            Enter your credentials to access your multi-business workspace
          </p>
        </div>

        {/* Global Error Banner */}
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="username"
                type="text"
                placeholder="john"
                className="pl-9"
                disabled={isPending}
                {...register('username')}
              />
            </div>
            {errors.username && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-xs font-semibold text-stitch-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                disabled={isPending}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-stitch-primary focus:ring-stitch-primary h-4 w-4"
                {...register('rememberMe')}
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="stitch"
            className="w-full h-11 text-sm font-semibold"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-stitch-primary hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
