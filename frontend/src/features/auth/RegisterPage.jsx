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
import { useRegisterMutation } from './auth.hooks';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { User, Mail, Lock, Loader2, AlertCircle, Phone } from 'lucide-react';

// Zod Validation Schema
const registerSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  phoneNumber: z.string().regex(/^\d{10,15}$/, 'Phone number must be 10 to 15 digits'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterPage = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const { loading, isAuthenticated, initializeUserBusiness } = useAuth();
  const [authError, setAuthError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userName: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      initializeUserBusiness().then((route) => {
        navigate(route, { replace: true });
      });
    }
  }, [isAuthenticated, loading, navigate, initializeUserBusiness]);

  const passwordValue = watch('password', '');

  // Password Strength Calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      await registerMutation.mutateAsync(data);

      toast.success('Account created successfully.');
      const targetRoute = await initializeUserBusiness();
      navigate(targetRoute, { replace: true });
    } catch (err) {
      const errorMessage = err?.message || 'Something went wrong.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isPending = isSubmitting || registerMutation.isPending;

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your InventoryHub account
          </h1>
          <p className="text-sm text-slate-500">
            Join the connected multi-business inventory network
          </p>
        </div>

        {/* Error Banner */}
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="userName">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="userName"
                type="text"
                placeholder="john"
                className="pl-9"
                disabled={isPending}
                {...register('userName')}
              />
            </div>
            {errors.userName && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.userName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="alex@company.com"
                className="pl-9"
                disabled={isPending}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="9876543210"
                className="pl-9"
                disabled={isPending}
                {...register('phoneNumber')}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
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

            {/* Password Strength Indicator */}
            {passwordValue && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Strength:</span>
                  <span className="font-semibold text-slate-700">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>
            )}
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-stitch-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
