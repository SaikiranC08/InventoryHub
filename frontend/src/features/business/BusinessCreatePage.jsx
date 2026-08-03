import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { businessService } from '@/services/business.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  MapPin, 
  Store, 
  Warehouse, 
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const businessCreateSchema = z.object({
  businessName: z.string()
    .min(3, 'Business name must be at least 3 characters')
    .max(50, 'Business name must be 50 characters or less'),
  businessType: z.enum(['WAREHOUSE', 'STORE'], {
    errorMap: () => ({ message: 'Please select a business type' }),
  }),
  businessDomain: z.enum(['GROCERY', 'MEDICAL', 'CLOTHES', 'ELECTRONICS', 'GENERAL'], {
    errorMap: () => ({ message: 'Please select a business domain' }),
  }),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(1, 'Postal code is required'),
});

export const BusinessCreatePage = () => {
  const navigate = useNavigate();
  const { selectBusiness } = useAuth();
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [createdBusiness, setCreatedBusiness] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(businessCreateSchema),
    defaultValues: {
      businessName: '',
      businessType: '',
      businessDomain: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await businessService.createBusiness(data);
      if (!response || !response.businessId) {
        throw new Error('No business ID returned.');
      }
      setCreatedBusiness(response);
      setShowSuccessOverlay(true);

      // Perform a simulated progress load before navigating
      setTimeout(() => {
        selectBusiness(response.businessId);
        toast.success('Workspace created successfully!');
        navigate(ROUTES.DASHBOARD);
      }, 2500);
    } catch (err) {
      toast.error(err?.message || 'Failed to create business.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply" />

      {/* Progress Indicator */}
      <div className="w-full max-w-3xl mb-8 flex justify-center">
        <div className="w-full flex items-center justify-between relative max-w-md">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-blue-600 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm text-xs font-bold">
              ✓
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Account</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm text-xs font-bold border-2 border-slate-50">
              2
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">Business</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-white text-slate-400 border border-slate-200 flex items-center justify-center shadow-sm text-xs font-bold">
              3
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px] z-10">
        {/* Left Side Info Panel */}
        <div className="hidden md:block md:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 p-8 flex flex-col justify-between relative text-white">
          <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="font-extrabold text-lg tracking-tight">InventoryHub</span>
            </div>
            <div className="space-y-2 pt-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">Setup your operations</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Centralize your inventory, track incoming stock, and collaborate across warehouses all in a single workspace.
              </p>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">
            Step 2: Workspace Setup
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="p-8 md:col-span-7 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create First Business</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your business details to configure your initial workspace.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="e.g. Sai Electronics"
                {...register('businessName')}
                disabled={isSubmitting}
                className={errors.businessName ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.businessName && (
                <p className="text-xs font-semibold text-red-500">{errors.businessName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="businessType">Business Type</Label>
                <select
                  id="businessType"
                  {...register('businessType')}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                >
                  <option value="" disabled>Select Type</option>
                  <option value="STORE">Store</option>
                  <option value="WAREHOUSE">Warehouse</option>
                </select>
                {errors.businessType && (
                  <p className="text-xs font-semibold text-red-500">{errors.businessType.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="businessDomain">Domain</Label>
                <select
                  id="businessDomain"
                  {...register('businessDomain')}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                >
                  <option value="" disabled>Select Domain</option>
                  <option value="GENERAL">General</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="GROCERY">Grocery</option>
                  <option value="CLOTHES">Clothes</option>
                  <option value="MEDICAL">Medical</option>
                </select>
                {errors.businessDomain && (
                  <p className="text-xs font-semibold text-red-500">{errors.businessDomain.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="12 Main Road, High Street"
                {...register('address')}
                disabled={isSubmitting}
                className={errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.address && (
                <p className="text-xs font-semibold text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Hyderabad"
                  {...register('city')}
                  disabled={isSubmitting}
                  className={errors.city ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-xs font-semibold text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="Telangana"
                  {...register('state')}
                  disabled={isSubmitting}
                  className={errors.state ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-xs font-semibold text-red-500">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="India"
                  {...register('country')}
                  disabled={isSubmitting}
                  className={errors.country ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.country && (
                  <p className="text-xs font-semibold text-red-500">{errors.country.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pincode">Postal Code</Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="500001"
                  {...register('pincode')}
                  disabled={isSubmitting}
                  className={errors.pincode ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.pincode && (
                  <p className="text-xs font-semibold text-red-500">{errors.pincode.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(ROUTES.BUSINESS_SELECT)}
                disabled={isSubmitting}
                className="h-10 px-5 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm h-10 px-6 rounded-xl transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Business <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 flex flex-col items-center text-center max-w-md w-full scale-100 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-inner border border-blue-100 animate-bounce">
              {createdBusiness?.businessType === 'WAREHOUSE' ? (
                <Warehouse className="h-8 w-8" />
              ) : (
                <Store className="h-8 w-8" />
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Workspace Configured!</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Warehouse shelves are set up and shelves are ready to stock. Redirecting to your dashboard...
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-[2500ms] ease-out-quad" 
                style={{
                  width: showSuccessOverlay ? '100%' : '0%',
                  animationName: 'progress',
                  animationDuration: '2.5s',
                  animationTimingFunction: 'ease-in-out'
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Injected style keyframes */}
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
