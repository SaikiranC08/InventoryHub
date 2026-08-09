import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import logoImg from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Calendar, 
  Store, 
  Warehouse, 
  LogOut, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export const BusinessSelectPage = () => {
  const navigate = useNavigate();
  const { selectBusiness, logout, username } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const data = await businessService.loadBusinesses();
        setBusinesses(data || []);
      } catch (err) {
        toast.error('Failed to load your businesses.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleSelect = (businessId) => {
    selectBusiness(businessId);
    toast.success('Workspace loaded successfully!');
    navigate(ROUTES.DASHBOARD);
  };

  const getBusinessIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'WAREHOUSE':
        return <Warehouse className="h-6 w-6 text-stitch-primary" />;
      case 'STORE':
      default:
        return <Store className="h-6 w-6 text-stitch-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 w-full z-50 h-[72px] flex justify-between items-center px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="InventoryHub Logo" className="h-11 w-11 object-contain rounded-xl shadow-sm" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            InventoryHub
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-semibold text-slate-800">{username}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout} 
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-8 relative">
        {/* Ambient Decorative Blurs */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200/50 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Choose Your Business
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Select the workspace/business you want to manage today.
            </p>
          </div>
        </div>

        {/* Business Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="overflow-hidden border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <Card className="border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm p-12 text-center flex flex-col items-center justify-center gap-5 rounded-2xl max-w-xl mx-auto w-full">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-inner">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">No Business Registered</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                You don't have any businesses registered. Let's create one to launch your workspace.
              </p>
            </div>
            <Button 
              onClick={() => navigate(ROUTES.BUSINESS_CREATE)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md h-11 px-6"
            >
              Get Started <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card 
                key={business.businessId} 
                className="group relative bg-white border border-slate-200 hover:border-blue-600 rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)] cursor-pointer"
                onClick={() => handleSelect(business.businessId)}
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full group-hover:bg-blue-50 transition-colors duration-300" />
                
                <div className="flex justify-between items-start z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                    {getBusinessIcon(business.businessType)}
                  </div>
                  <Badge variant="secondary" className="font-semibold text-xs py-1 capitalize">
                    {business.businessType?.toLowerCase()}
                  </Badge>
                </div>

                <div className="z-10">
                  <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                    {business.businessName}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                    {business.businessDomain}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 text-slate-600 text-xs z-10">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Location</span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {business.city}, {business.country}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Postal Code</span>
                    <span className="flex items-center gap-1 font-mono text-slate-700 font-medium">
                      {business.pincode}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 mt-auto z-10">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl h-10 border-slate-200 hover:bg-slate-50 font-medium text-xs tracking-wide uppercase text-slate-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(business.businessId);
                    }}
                  >
                    Open
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs tracking-wide uppercase rounded-xl h-10 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(business.businessId);
                    }}
                  >
                    Dashboard <ChevronRight className="h-3.5 w-3.5 ml-1 shrink-0" />
                  </Button>
                </div>
              </Card>
            ))}

            {/* Quick Add Card inside Grid */}
            <Card 
              onClick={() => navigate(ROUTES.BUSINESS_CREATE)} 
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 flex flex-col items-center justify-center p-8 gap-4 rounded-2xl min-h-[280px] cursor-pointer transition-all duration-300 hover:shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:border-blue-400 group-hover:text-blue-500 transition-all duration-300">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-800">Add Another Business</h4>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Expand your enterprise by creating a new workspace.
                </p>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
