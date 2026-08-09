import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { businessService } from '@/services/business.service';
import logoImg from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Store,
  Warehouse,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  Globe,
  Layers,
  Box
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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(businessCreateSchema),
    defaultValues: {
      businessName: '',
      businessType: 'WAREHOUSE',
      businessDomain: 'ELECTRONICS',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
    },
  });

  const selectedType = watch('businessType');
  const watchName = watch('businessName');
  const watchDomain = watch('businessDomain');
  const watchCity = watch('city');

  const onSubmit = async (data) => {
    try {
      const response = await businessService.createBusiness(data);
      if (!response || !response.businessId) {
        throw new Error('No business ID returned.');
      }
      setCreatedBusiness(response);
      setShowSuccessOverlay(true);

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Progress Step Bar */}
      <div className="w-full max-w-4xl mb-6 flex justify-center z-10">
        <div className="w-full flex items-center justify-between relative max-w-sm">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 z-0" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-blue-500 z-0" />

          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg">
              ✓
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Account</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-slate-900 shadow-lg">
              2
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-semibold">Workspace</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Main Glass Form Card Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-slate-900/90 rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden z-10 backdrop-blur-xl">
        {/* Left Side Live Workspace Preview */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/80 p-8 flex-col justify-between border-r border-slate-800/80 relative text-white">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="InventoryHub Logo" className="h-10 w-10 object-contain rounded-xl shadow-md" />
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                InventoryHub
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-300 bg-blue-500/10">
                LIVE PREVIEW
              </Badge>
              <h2 className="text-xl font-bold tracking-tight text-slate-100">Setup your workspace</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure your business entity to manage products, variants, stock transfers, and inter-business trade workflows.
              </p>
            </div>

            {/* Live Interactive Workspace Card Preview */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedType === 'WAREHOUSE' ? <Warehouse className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                  </div>
                  <span className="font-bold text-slate-200 truncate max-w-[120px]">
                    {watchName || 'My Business'}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 uppercase">
                  {selectedType || 'WAREHOUSE'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>Domain: <strong className="text-slate-200">{watchDomain || 'ELECTRONICS'}</strong></span>
                <span>{watchCity || 'City'}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest pt-6">
            Multi-Tenant Isolated Database Scope
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="p-6 sm:p-8 md:col-span-7 flex flex-col justify-center bg-slate-900/60">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Configure New Business</h1>
            <p className="text-xs text-slate-400">Provide operational details to launch your business entity.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Visual Type Picker (Warehouse vs Store) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-semibold">Business Entity Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('businessType', 'WAREHOUSE')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    selectedType === 'WAREHOUSE'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl border ${selectedType === 'WAREHOUSE' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">Warehouse</h5>
                    <p className="text-[10px] text-slate-400 font-mono">Storage & Logistics</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('businessType', 'STORE')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    selectedType === 'STORE'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl border ${selectedType === 'STORE' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">Retail Store</h5>
                    <p className="text-[10px] text-slate-400 font-mono">Direct Sales & POS</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Business Name */}
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-xs text-slate-300">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="e.g. Apex Industrial Logistics"
                {...register('businessName')}
                disabled={isSubmitting}
                className="bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 rounded-xl h-10"
              />
              {errors.businessName && (
                <p className="text-xs font-semibold text-rose-400">{errors.businessName.message}</p>
              )}
            </div>

            {/* Domain Select */}
            <div className="space-y-1.5">
              <Label htmlFor="businessDomain" className="text-xs text-slate-300">Industry Domain</Label>
              <select
                id="businessDomain"
                {...register('businessDomain')}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="GENERAL">General Trade</option>
                <option value="ELECTRONICS">Electronics & Tech</option>
                <option value="GROCERY">Grocery & FMCG</option>
                <option value="CLOTHES">Apparel & Clothes</option>
                <option value="MEDICAL">Medical & Pharma</option>
              </select>
              {errors.businessDomain && (
                <p className="text-xs font-semibold text-rose-400">{errors.businessDomain.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs text-slate-300">Street Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="12 Logistics Boulevard, Zone 4"
                {...register('address')}
                disabled={isSubmitting}
                className="bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 rounded-xl h-10"
              />
              {errors.address && (
                <p className="text-xs font-semibold text-rose-400">{errors.address.message}</p>
              )}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs text-slate-300">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Hyderabad"
                  {...register('city')}
                  disabled={isSubmitting}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 rounded-xl h-10"
                />
                {errors.city && (
                  <p className="text-xs font-semibold text-rose-400">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs text-slate-300">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="Telangana"
                  {...register('state')}
                  disabled={isSubmitting}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 rounded-xl h-10"
                />
                {errors.state && (
                  <p className="text-xs font-semibold text-rose-400">{errors.state.message}</p>
                )}
              </div>
            </div>

            {/* Country & Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs text-slate-300">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="India"
                  {...register('country')}
                  disabled={isSubmitting}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 rounded-xl h-10"
                />
                {errors.country && (
                  <p className="text-xs font-semibold text-rose-400">{errors.country.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pincode" className="text-xs text-slate-300">Postal Code</Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="500001"
                  {...register('pincode')}
                  disabled={isSubmitting}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-100 font-mono placeholder:text-slate-600 rounded-xl h-10"
                />
                {errors.pincode && (
                  <p className="text-xs font-semibold text-rose-400">{errors.pincode.message}</p>
                )}
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(ROUTES.BUSINESS_SELECT)}
                disabled={isSubmitting}
                className="h-10 px-4 rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10 px-6 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Configuring Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Business</span> <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-opacity duration-300">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 flex flex-col items-center text-center max-w-md w-full">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 shadow-inner border border-blue-500/20 animate-bounce">
              {createdBusiness?.businessType === 'WAREHOUSE' ? (
                <Warehouse className="h-8 w-8" />
              ) : (
                <Store className="h-8 w-8" />
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100 mb-1">Workspace Configured!</h2>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Your business workspace is set up and inventory racks are initialized. Redirecting to your dashboard...
            </p>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden relative border border-slate-800">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-[2500ms] ease-out"
                style={{
                  width: showSuccessOverlay ? '100%' : '0%',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
