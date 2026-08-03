import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getBusinessId } from '@/utils/tokenStorage';
import { businessApi } from '@/api/business.api';
import { dashboardApi } from '@/api/dashboard.api';
import { inventoryApi } from '@/api/inventory.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Building2,
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Menu,
  Package,
  ShoppingBag,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Inbox,
  ClipboardList,
  Activity,
  X,
  ChevronRight,
  History,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';



// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const today = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ─── Skeleton helpers ────────────────────────────────────────────────────────

const KpiSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
    <div className="flex justify-between items-start">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-20 rounded" />
    <Skeleton className="h-3 w-28 rounded" />
  </div>
);

// ─── Custom Tooltip for chart ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-slate-800 mb-1 text-xs">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-800">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, unit, icon: Icon, color, gradient, trend, trendLabel, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden cursor-default ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute top-0 right-0 w-20 h-20 ${gradient} rounded-bl-full pointer-events-none opacity-60`} />
    <div className="flex justify-between items-start mb-3 z-10">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</span>
      <div className={`p-1.5 rounded-lg border ${color.bg} ${color.border}`}>
        <Icon className={`h-4 w-4 ${color.icon}`} />
      </div>
    </div>
    <div className="flex items-baseline gap-1.5 mb-2 z-10">
      <span className="text-3xl font-black text-slate-900 tracking-tight">{fmt(value)}</span>
      {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-bold z-10 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        <span className="text-slate-400 font-normal">{trendLabel}</span>
      </div>
    )}
    {trend === undefined && trendLabel && (
      <p className="text-[10px] text-slate-400 font-medium z-10">{trendLabel}</p>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { username, selectedBusinessId, logout, initializeUserBusiness } = useAuth();

  // ── Business resolution ──
  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);

  // ── Dashboard data ──
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState('MONTH');
  const [chartLoading, setChartLoading] = useState(true);

  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);

  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  const [stockRequests, setStockRequests] = useState([]);
  const [stockRequestsLoading, setStockRequestsLoading] = useState(true);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  const [recentDecisions, setRecentDecisions] = useState([]);
  const [recentDecisionsLoading, setRecentDecisionsLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);


  // ── Business resolution ──────────────────────────────────────────────────
  useEffect(() => {
    const resolveBusiness = async () => {
      const activeBusinessId = selectedBusinessId || getBusinessId();
      if (!activeBusinessId) {
        const targetRoute = await initializeUserBusiness();
        if (targetRoute !== ROUTES.DASHBOARD) navigate(targetRoute, { replace: true });
      } else {
        try {
          setBusinessLoading(true);
          const data = await businessApi.getBusinessById(activeBusinessId);
          setBusiness(data);
        } catch {
          navigate(ROUTES.BUSINESS_SELECT, { replace: true });
        } finally {
          setBusinessLoading(false);
        }
      }
    };
    resolveBusiness();
  }, [selectedBusinessId, navigate, initializeUserBusiness]);

  // ── Fetch all dashboard data when business is ready ──────────────────────
  const fetchAll = useCallback(async () => {
    if (!business) return;
    setRefreshing(true);
    await Promise.allSettled([
      fetchSummary(),
      fetchChart(chartRange),
      fetchTopProducts(),
      fetchInventory(),
      fetchStockRequests(),
    ]);
    setRefreshing(false);
  }, [business, chartRange]);


  useEffect(() => {
    if (business) fetchAll();
  }, [business]);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const data = await dashboardApi.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setSummaryError(err?.message || 'Failed to load summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchChart = async (range) => {
    try {
      setChartLoading(true);
      const data = await dashboardApi.getSalesChart(range);
      setChartData(data || []);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setTopProductsLoading(true);
      const data = await dashboardApi.getTopSellingProducts();
      setTopProducts(data || []);
    } catch {
      setTopProducts([]);
    } finally {
      setTopProductsLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);
      const data = await inventoryApi.getInventory();
      setInventoryList(data || []);
    } catch {
      setInventoryList([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchStockRequests = async () => {
    try {
      setStockRequestsLoading(true);
      const data = await inventoryApi.getStockRequests();
      const all = data || [];
      setStockRequests(all);
      setRecentDecisions(all.filter((r) => r.status === 'APPROVED' || r.status === 'REJECTED'));
    } catch {
      setStockRequests([]);
      setRecentDecisions([]);
    } finally {
      setStockRequestsLoading(false);
      setRecentDecisionsLoading(false);
    }
  };


  const handleRangeChange = (range) => {
    setChartRange(range);
    fetchChart(range);
  };

  const handleUpdateStockRequest = async (requestId, status) => {
    try {
      setUpdatingRequestId(requestId);
      await inventoryApi.updateStockRequest(requestId, status);
      toast.success(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'}.`);
      fetchStockRequests();
      if (status === 'APPROVED') fetchInventory();
      fetchSummary();
    } catch (err) {
      toast.error(err?.message || 'Failed to update request.');
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const lowStockItems = inventoryList.filter(
    (i) => i.quantity > 0 && i.quantity <= (i.reorderLevel || 0)
  );
  const outOfStockItems = inventoryList.filter((i) => i.quantity === 0);
  const pendingRequests = stockRequests.filter((r) => r.status === 'PENDING' || !r.status);

  const getStockStatus = (qty, reorder) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    if (qty <= reorder) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  // ── Loading shell ─────────────────────────────────────────────────────────
  if (businessLoading || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="space-y-4 w-full max-w-md px-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-10 w-3/4 rounded-xl mx-auto" />
        </div>
      </div>
    );
  }

  // ── KPI config ────────────────────────────────────────────────────────────
  const kpiCards = [
    {
      title: 'Total Products',
      value: summary?.totalProducts,
      icon: Boxes,
      unit: 'SKUs',
      color: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-600' },
      gradient: 'bg-blue-50/40',
      trendLabel: 'all variants tracked',
    },
    {
      title: "Today's Purchases",
      value: summary?.todayPurchaseOrders,
      icon: ShoppingCart,
      unit: 'orders',
      color: { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-600' },
      gradient: 'bg-indigo-50/40',
      trendLabel: 'today',
    },
    {
      title: "Today's Sales",
      value: summary?.todaySalesOrders,
      icon: ShoppingBag,
      unit: 'orders',
      color: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600' },
      gradient: 'bg-emerald-50/40',
      trendLabel: 'today',
    },
    {
      title: 'Monthly Purchases',
      value: summary?.monthlyPurchaseOrders,
      icon: Truck,
      unit: 'orders',
      color: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'text-violet-600' },
      gradient: 'bg-violet-50/40',
      trendLabel: 'this month',
    },
    {
      title: 'Monthly Sales',
      value: summary?.monthlySalesOrders,
      icon: BarChart3,
      unit: 'orders',
      color: { bg: 'bg-cyan-50', border: 'border-cyan-100', icon: 'text-cyan-600' },
      gradient: 'bg-cyan-50/40',
      trendLabel: 'this month',
    },
    {
      title: 'Completed Transfers',
      value: summary?.completedTransfers,
      icon: ArrowUpDown,
      color: { bg: 'bg-teal-50', border: 'border-teal-100', icon: 'text-teal-600' },
      gradient: 'bg-teal-50/40',
      trendLabel: 'internal transfers',
    },
    {
      title: 'Pending Requests',
      value: summary?.pendingStockRequests,
      icon: Inbox,
      color: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600' },
      gradient: 'bg-amber-50/40',
      trendLabel: 'awaiting your action',
      onClick: () => navigate(ROUTES.INVENTORY),
    },
    {
      title: 'Low Stock',
      value: summary?.lowStockProducts,
      icon: AlertTriangle,
      color: { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'text-orange-600' },
      gradient: 'bg-orange-50/40',
      trendLabel: 'need restock soon',
    },
    {
      title: 'Out of Stock',
      value: summary?.outOfStockProducts,
      icon: AlertCircle,
      color: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-600' },
      gradient: 'bg-red-50/40',
      trendLabel: 'critical — restock now',
    },
  ];

  const RANGES = ['DAY', 'WEEK', 'MONTH', 'YEAR'];

  return (
    <div className="font-sans text-slate-800 antialiased flex h-screen overflow-hidden bg-slate-50/50">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col p-4 gap-2 bg-white border-r border-slate-200/80 shadow-sm z-40">
        <div className="px-3 py-2 flex items-center gap-2 mb-6">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            InventoryHub
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <a className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold" href="#">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </a>
          <button onClick={() => navigate(ROUTES.INVENTORY)} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left">
            <Boxes className="h-4 w-4" /> Inventory
          </button>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all" href="#">
            <ShoppingCart className="h-4 w-4" /> Orders
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all" href="#">
            <Truck className="h-4 w-4" /> Suppliers
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all" href="#">
            <BarChart3 className="h-4 w-4" /> Reports
          </a>
          <button onClick={() => navigate(ROUTES.STOCK_HISTORY)} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left">
            <History className="h-4 w-4" /> Stock History
          </button>
          <button onClick={() => navigate(ROUTES.MESSAGING)} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left animate-pulse">
            <MessageSquare className="h-4 w-4" /> Collaboration
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-1">
          <button onClick={() => navigate(ROUTES.BUSINESS_SELECT)} className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60 shadow-sm transition-all active:scale-[0.98]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-800 truncate">{business?.businessName}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{business?.businessType}</p>
              </div>
            </div>
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all mt-2" href="#">
            <Settings className="h-4 w-4" /> Settings
          </a>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all text-left w-full">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">

        {/* TopBar */}
        <header className="sticky top-0 z-30 h-[68px] flex justify-between items-center px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 md:hidden">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl">
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Business + Date */}
          <div className="hidden md:flex flex-col">
            <span className="text-base font-black text-slate-900">{business?.businessName}</span>
            <span className="text-[11px] text-slate-400 font-medium">{today()}</span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm mx-6 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              placeholder="Search inventory..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={() => fetchAll()}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              title="Refresh dashboard"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
            </button>

            {/* Bell with pending badge */}
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              {pendingRequests.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full border border-slate-200 shadow-sm flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm select-none ml-1">
              {username?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6 pb-10">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/50">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  Overview for <span className="font-bold text-blue-600">{business?.businessName}</span> · {business?.city}, {business?.country}
                </p>
              </div>
              <Button
                onClick={() => navigate(ROUTES.INVENTORY)}
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm px-4 rounded-xl flex items-center gap-2 shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Stock
              </Button>
            </div>

            {/* ── KPI Grid ──────────────────────────────────────────────── */}
            {summaryError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-700 font-semibold text-sm">{summaryError}</p>
                <Button onClick={fetchSummary} size="sm" className="mt-3 bg-red-600 hover:bg-red-700 text-white rounded-xl">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                {summaryLoading
                  ? Array.from({ length: 9 }).map((_, i) => <KpiSkeleton key={i} />)
                  : kpiCards.map((card) => (
                      <KpiCard key={card.title} {...card} />
                    ))}
              </div>
            )}

            {/* ── Chart + Top Products ───────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* Sales vs Purchases Chart */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Sales vs Purchases</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Order volume over time</p>
                  </div>
                  <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
                    {RANGES.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRangeChange(r)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                          chartRange === r
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {r === 'DAY' ? '1D' : r === 'WEEK' ? '7D' : r === 'MONTH' ? '30D' : '1Y'}
                      </button>
                    ))}
                  </div>
                </div>

                {chartLoading ? (
                  <Skeleton className="h-[280px] w-full rounded-xl" />
                ) : chartData.length === 0 ? (
                  <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 gap-2">
                    <BarChart3 className="h-12 w-12 text-slate-200" />
                    <p className="text-sm font-medium">No data for this range yet</p>
                    <p className="text-xs">Complete a purchase or sale to see chart data</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="purchasesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        interval={chartRange === 'MONTH' ? 4 : 0}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 12 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        name="Sales"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#salesGrad)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="purchases"
                        name="Purchases"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#purchasesGrad)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top Selling Products */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Top Selling</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">By quantity sold</p>
                  </div>
                  <button onClick={() => navigate(ROUTES.INVENTORY)} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                    View All <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {topProductsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                  </div>
                ) : topProducts.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 py-8">
                    <Package className="h-10 w-10 text-slate-200" />
                    <p className="text-xs font-medium">No sales recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topProducts.map((p, idx) => (
                      <div
                        key={p.productVariantId}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                          idx === 0 ? 'bg-amber-100 text-amber-700' :
                          idx === 1 ? 'bg-slate-100 text-slate-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-50 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 bg-slate-100 rounded-lg border border-slate-200/50 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{p.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                        </div>
                        <span className="text-xs font-black text-indigo-600 shrink-0">{fmt(p.totalQuantitySold)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Low Stock + Pending Requests ───────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Low Stock Panel */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Stock Alerts</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Low & out-of-stock items</p>
                  </div>
                  <button onClick={() => navigate(ROUTES.INVENTORY)} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                    Manage <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {inventoryLoading ? (
                  <div className="p-4 space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                  </div>
                ) : [...outOfStockItems, ...lowStockItems].length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2 py-10">
                    <CheckCircle className="h-10 w-10 text-emerald-200" />
                    <p className="text-sm font-semibold text-emerald-600">All stock levels healthy!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="px-5 py-3 text-left">Product</th>
                          <th className="px-5 py-3 text-left">SKU</th>
                          <th className="px-5 py-3 text-right">Qty</th>
                          <th className="px-5 py-3 text-right">Reorder</th>
                          <th className="px-5 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...outOfStockItems, ...lowStockItems].slice(0, 6).map((item) => {
                          const status = getStockStatus(item.quantity, item.reorderLevel);
                          return (
                            <tr key={item.inventoryId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3 font-semibold text-slate-800 text-xs truncate max-w-[120px]">
                                {item.productVariant?.product?.productName}
                              </td>
                              <td className="px-5 py-3 font-mono text-[10px] text-slate-400">
                                {item.productVariant?.sku}
                              </td>
                              <td className="px-5 py-3 text-right font-mono font-bold text-slate-800 text-xs">
                                {item.quantity}
                              </td>
                              <td className="px-5 py-3 text-right font-mono text-[11px] text-slate-400">
                                {item.reorderLevel}
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${status.color}`}>
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pending Stock Requests */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">Pending Requests</h2>
                    {pendingRequests.length > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingRequests.length}
                      </span>
                    )}
                  </div>
                  <button onClick={() => navigate(ROUTES.INVENTORY)} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                    View All <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {stockRequestsLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2 py-10">
                    <Inbox className="h-10 w-10 text-slate-200" />
                    <p className="text-sm font-medium">No pending requests</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {pendingRequests.map((req) => {
                      const isUpdating = updatingRequestId === req.requestId;
                      return (
                        <div key={req.requestId} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                              <ClipboardList className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">Variant #{req.productVariantId}</p>
                              <p className="text-[10px] text-slate-400">
                                From Biz #{req.fromBusinessId} · <span className="font-semibold text-slate-600">{req.quantity} units</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStockRequest(req.requestId, 'APPROVED')}
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              {isUpdating ? '...' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStockRequest(req.requestId, 'REJECTED')}
                              className="h-7 px-2.5 border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold rounded-lg flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Recent Request Decisions ─────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Request Decisions</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Latest processed stock requests</p>
                </div>
                <button
                  onClick={() => navigate(ROUTES.STOCK_HISTORY)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  View History <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {recentDecisionsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : recentDecisions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2 py-10">
                  <ClipboardList className="h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium">No processed requests yet</p>
                  <p className="text-xs text-slate-400">Approved or rejected requests will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                  {recentDecisions.slice(0, 8).map((req, idx) => {
                    const isApproved = req.status === 'APPROVED';
                    return (
                      <div
                        key={req.requestId}
                        className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                        style={{ animation: `fadeUp 0.3s ease ${idx * 0.05}s both` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isApproved ? 'bg-emerald-50' : 'bg-red-50'
                          }`}>
                            {isApproved
                              ? <ThumbsUp className="h-4 w-4 text-emerald-500" />
                              : <ThumbsDown className="h-4 w-4 text-red-500" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              Variant #{req.productVariantId}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              From Biz #{req.fromBusinessId} · <span className="font-semibold">{req.quantity} units</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {isApproved
                              ? <><CheckCircle className="h-2.5 w-2.5" /> Approved</>
                              : <><XCircle className="h-2.5 w-2.5" /> Rejected</>
                            }
                          </span>
                          <button
                            onClick={() => navigate(ROUTES.STOCK_HISTORY)}
                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

