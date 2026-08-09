import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { businessService } from '@/services/business.service';
import logoImg from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  MapPin,
  Store,
  Warehouse,
  LogOut,
  ArrowRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';

export const BusinessSelectPage = () => {
  const navigate = useNavigate();
  const { selectBusiness, logout, username } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL'); // 'ALL' | 'WAREHOUSE' | 'STORE'

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

  const getInitials = (name) => {
    if (!name) return 'BH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Filtered businesses
  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.businessDomain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedTypeFilter === 'ALL' || b.businessType?.toUpperCase() === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient Mesh Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-cyan-500/10 rounded-full blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* Top Glass Navbar */}
      <header className="sticky top-0 w-full z-50 h-16 flex justify-between items-center px-4 sm:px-8 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="InventoryHub Logo" className="h-9 w-9 object-contain rounded-xl shadow-sm" />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            InventoryHub
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono border-blue-500/30 text-blue-300 bg-blue-500/10">
            Workspace Hub
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Signed in as</span>
            <span className="text-xs font-bold text-slate-200">{username || 'Enterprise User'}</span>
          </div>

          <Button
            size="sm"
            onClick={() => navigate(ROUTES.BUSINESS_CREATE)}
            className="hidden sm:flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Business</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 relative z-10">
        {/* Header Title Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <Badge className="px-3 py-1 text-[11px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-blue-400 inline" />
              MULTI-TENANT ENTERPRISE PORTAL
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
              Select Your Workspace
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Choose an active business entity to manage stock levels, inter-business transfers, and operational analytics.
            </p>
          </div>

          <Button
            onClick={() => navigate(ROUTES.BUSINESS_CREATE)}
            className="sm:hidden w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add New Business
          </Button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search business name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 font-medium"
            />
          </div>

          {/* Type Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs font-medium w-full sm:w-auto overflow-x-auto scrollbar-none">
            <span className="text-slate-500 font-mono text-[10px] uppercase mr-1 hidden sm:inline">Type:</span>
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Warehouses', value: 'WAREHOUSE' },
              { label: 'Stores', value: 'STORE' }
            ].map((chip) => (
              <button
                key={chip.value}
                onClick={() => setSelectedTypeFilter(chip.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all whitespace-nowrap ${
                  selectedTypeFilter === chip.value
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-semibold shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Business Workspace Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="bg-slate-900 border border-slate-800 p-6 space-y-4 rounded-2xl">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-12 w-12 rounded-xl bg-slate-800" />
                  <Skeleton className="h-6 w-20 rounded-full bg-slate-800" />
                </div>
                <Skeleton className="h-6 w-3/4 bg-slate-800 rounded-md" />
                <Skeleton className="h-4 w-1/2 bg-slate-800 rounded-md" />
                <Skeleton className="h-10 w-full bg-slate-800 rounded-xl" />
              </Card>
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <Card className="border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center flex flex-col items-center justify-center gap-4 rounded-3xl max-w-xl mx-auto w-full backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-lg">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-200">No Business Found</h3>
              <p className="text-slate-400 text-xs max-w-xs mx-auto">
                {searchTerm || selectedTypeFilter !== 'ALL'
                  ? 'No business matches your search filters. Try clearing search criteria.'
                  : "You don't have any businesses registered. Create your first business to access your dashboard."}
              </p>
            </div>
            {searchTerm || selectedTypeFilter !== 'ALL' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTypeFilter('ALL');
                }}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => navigate(ROUTES.BUSINESS_CREATE)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs h-10 px-5 shadow-lg shadow-blue-600/30"
              >
                Create First Business <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredBusinesses.map((b) => (
                <motion.div
                  key={b.businessId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  <Card
                    onClick={() => handleSelect(b.businessId)}
                    className="group relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 hover:border-blue-500/60 rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer overflow-hidden"
                  >
                    {/* Top Header Card Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-lg border border-blue-400/30 group-hover:scale-105 transition-transform">
                          {getInitials(b.businessName)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg text-slate-100 group-hover:text-blue-400 transition-colors tracking-tight line-clamp-1">
                            {b.businessName}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mt-0.5">
                            {b.businessDomain}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                          b.businessType?.toUpperCase() === 'WAREHOUSE'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {b.businessType}
                      </Badge>
                    </div>

                    {/* Middle Location Stats */}
                    <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-blue-400" />
                          <strong className="text-slate-200 font-semibold">{b.city}, {b.country}</strong>
                        </span>
                        <span className="text-[10px] text-slate-500">{b.pincode}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate pt-1 border-t border-slate-800/60">
                        {b.address}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1">
                      <Button
                        className="w-full bg-slate-900 group-hover:bg-blue-600 text-slate-200 group-hover:text-white font-semibold text-xs rounded-xl h-10 border border-slate-800 group-hover:border-blue-500 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(b.businessId);
                        }}
                      >
                        <span>Open Workspace</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Quick Add Business Tile */}
            <motion.div
              onClick={() => navigate(ROUTES.BUSINESS_CREATE)}
              className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-900/30 hover:bg-blue-950/20 flex flex-col items-center justify-center p-8 gap-4 rounded-3xl min-h-[240px] cursor-pointer transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all duration-300 shadow-lg">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                  Add Another Business
                </h4>
                <p className="text-xs text-slate-500 max-w-[200px]">
                  Register a new branch or warehouse to your account.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
