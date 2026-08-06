import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getBusinessId } from '@/utils/tokenStorage';
import { businessApi } from '@/api/business.api';
import { inventoryApi } from '@/api/inventory.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Building2,
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  ArrowUpDown,
  Search,
  RefreshCw,
  Download,
  Filter,
  X,
  Menu,
  History,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Wrench,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Clock,
  Hash,
  FileText,
  MessageSquare,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MOVEMENT_META = {
  PURCHASED: {
    label: 'Purchase',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: TrendingUp,
  },
  SALE: {
    label: 'Sale',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: TrendingDown,
  },
  TRANSFER_IN: {
    label: 'Transfer In',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    icon: TrendingUp,
  },
  TRANSFER_OUT: {
    label: 'Transfer Out',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    icon: TrendingDown,
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    color: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: Wrench,
  },
};

const REF_LABELS = {
  PURCHASE_ORDER: 'Purchase Order',
  SALES_ORDER: 'Sales Order',
  STOCK_TRANSFER: 'Stock Transfer',
  INVENTORY_AUDIT: 'Inventory Audit',
  STOCK_ADJUSTMENT: 'Stock Adjustment',
  RETURN: 'Return',
  MANUAL: 'Manual',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const fmtRelative = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Skeleton Row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[80, 120, 80, 60, 90, 50, 110, 60, 120, 100, 70].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className={`h-3 rounded`} style={{ width: w }} />
      </td>
    ))}
  </tr>
);

// ── Movement Type Badge ───────────────────────────────────────────────────────
const MovementBadge = ({ type }) => {
  const meta = MOVEMENT_META[type] || MOVEMENT_META.ADJUSTMENT;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

// ── Row Detail Drawer ─────────────────────────────────────────────────────────
const DetailDrawer = ({ movement, onClose }) => {
  if (!movement) return null;
  const meta = MOVEMENT_META[movement.movementType] || MOVEMENT_META.ADJUSTMENT;
  const Icon = meta.icon;
  const TIMELINE_STEPS = ['PURCHASED', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'];
  const currentStep = TIMELINE_STEPS.indexOf(movement.movementType);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideInRight 0.25s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-black text-slate-900 text-base">Movement Detail</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">ID #{movement.stockMovementId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Status badge */}
          <MovementBadge type={movement.movementType} />

          {/* Product info */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Product</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{movement.productName || '—'}</p>
                {movement.brand && <p className="text-[11px] text-slate-400">{movement.brand}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">SKU</p>
                <p className="font-mono text-xs font-bold text-slate-700">{movement.sku || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Category</p>
                <p className="text-xs font-bold text-slate-700">{movement.categoryName || '—'}</p>
              </div>
            </div>
          </div>

          {/* Business */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Business</p>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <p className="font-bold text-sm text-slate-800">{movement.businessName || `Business #${movement.businessId}`}</p>
            </div>
          </div>

          {/* Movement details */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Movement Details</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border border-slate-200/60 text-center">
                <p className="text-[10px] text-slate-400 font-semibold">Quantity</p>
                <p className="text-lg font-black text-slate-900">{movement.quantity}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200/60 text-center">
                <p className="text-[10px] text-slate-400 font-semibold">Unit Price</p>
                <p className="text-sm font-black text-slate-900">
                  {movement.unitPrice != null ? `₹${movement.unitPrice}` : '—'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200/60 text-center">
                <p className="text-[10px] text-slate-400 font-semibold">Total</p>
                <p className="text-sm font-black text-slate-900">
                  {movement.totalPrice != null ? `₹${movement.totalPrice}` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Reference */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reference</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Type</p>
                <p className="text-xs font-bold text-slate-700">{REF_LABELS[movement.referenceType] || movement.referenceType || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Reference ID</p>
                <p className="font-mono text-xs font-bold text-slate-700">#{movement.referenceId || '—'}</p>
              </div>
            </div>
            {movement.remark && (
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Remarks</p>
                <p className="text-xs text-slate-700 mt-0.5 italic">"{movement.remark}"</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Movement Timeline</p>
            <div className="relative pl-5 space-y-4">
              {TIMELINE_STEPS.map((step, i) => {
                const stepMeta = MOVEMENT_META[step];
                const isCurrent = i === currentStep;
                const isPast = i < currentStep;
                return (
                  <div key={step} className="relative flex items-center gap-3">
                    <div className={`absolute -left-5 w-2.5 h-2.5 rounded-full ring-2 ring-white z-10 ${
                      isCurrent ? stepMeta.dot : isPast ? 'bg-slate-300' : 'bg-slate-100 border border-slate-200'
                    }`} />
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className="absolute -left-[14px] top-3 h-full w-px bg-slate-200" />
                    )}
                    <p className={`text-xs ${isCurrent ? 'font-black text-slate-900' : 'text-slate-400 font-medium'}`}>
                      {stepMeta.label}
                      {isCurrent && <span className="ml-2 text-[10px] text-slate-400 font-normal">← current</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timestamp */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-400">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <p className="text-[11px]">{fmtDate(movement.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const StockHistoryPage = () => {
  const navigate = useNavigate();
  const { username, selectedBusinessId, logout, initializeUserBusiness } = useAuth();

  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedMovement, setSelectedMovement] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const PAGE_SIZE = 15;

  // ── Business resolution ───────────────────────────────────────────────────
  useEffect(() => {
    const resolve = async () => {
      const bId = selectedBusinessId || getBusinessId();
      if (!bId) {
        const route = await initializeUserBusiness();
        if (route !== ROUTES.DASHBOARD) navigate(route, { replace: true });
      } else {
        try {
          setBusinessLoading(true);
          const data = await businessApi.getBusinessById(bId);
          setBusiness(data);
        } catch {
          navigate(ROUTES.BUSINESS_SELECT, { replace: true });
        } finally {
          setBusinessLoading(false);
        }
      }
    };
    resolve();
  }, [selectedBusinessId, navigate, initializeUserBusiness]);

  const fetchMovements = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await inventoryApi.getStockMovements();
      setMovements(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load stock movements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (business) fetchMovements();
  }, [business, fetchMovements]);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = movements.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.productName?.toLowerCase().includes(q) ||
      m.sku?.toLowerCase().includes(q) ||
      String(m.stockMovementId).includes(q) ||
      String(m.referenceId || '').includes(q) ||
      m.businessName?.toLowerCase().includes(q);
    const matchType = filterType === 'ALL' || m.movementType === filterType;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(0); };
  const handleFilter = (t) => { setFilterType(t); setPage(0); };

  const TYPES = ['ALL', 'PURCHASED', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'];

  if (businessLoading || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="space-y-4 w-full max-w-md px-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

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
          <button onClick={() => navigate(ROUTES.DASHBOARD)} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </button>
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
          <a className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold" href="#">
            <History className="h-4 w-4" /> Stock History
          </a>
          <button onClick={() => navigate(ROUTES.MESSAGING)} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left">
            <MessageSquare className="h-4 w-4" /> Collaboration
          </button>
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-1">
          <button onClick={() => navigate(ROUTES.BUSINESS_SELECT)} className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60 shadow-sm transition-all">
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

      {/* ── Mobile Sidebar Drawer ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-[85%] h-full p-4 gap-2 bg-white shadow-2xl z-10 animate-slideRight">
            <div className="px-3 py-2 flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  InventoryHub
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.DASHBOARD); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.INVENTORY); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <Boxes className="h-4 w-4" /> Inventory
              </button>
              <a className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm" href="#">
                <History className="h-4 w-4" /> Stock History
              </a>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.MESSAGING); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <MessageSquare className="h-4 w-4" /> Collaboration
              </button>
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-2">
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.BUSINESS_SELECT); }} className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60 shadow-sm transition-all">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-xs text-slate-800 truncate">{business?.businessName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{business?.businessType}</p>
                  </div>
                </div>
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>
              <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all text-left w-full text-sm font-semibold">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-[68px] flex justify-between items-center px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl">
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-base font-black text-slate-900">Stock History</span>
            <span className="text-[11px] text-slate-400">Full audit trail for {business?.businessName}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={fetchMovements}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
            <div className="h-9 w-9 rounded-full border border-slate-200 shadow-sm flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm select-none ml-1">
              {username?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-full mx-auto space-y-4 pb-10">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200/50">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stock Movement History</h1>
                <p className="text-slate-400 text-sm mt-0.5">Every inventory change — purchases, sales, and transfers</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 text-sm shadow-sm">
                <Hash className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-slate-800">{filtered.length}</span>
                <span className="text-slate-400">movements</span>
              </div>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  placeholder="Search product, SKU, ID, business..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Type filter */}
              <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5 overflow-x-auto shadow-sm">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleFilter(t)}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg whitespace-nowrap transition-all ${
                      filterType === t
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {t === 'ALL' ? 'All Types' : MOVEMENT_META[t]?.label || t}
                  </button>
                ))}
              </div>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <AlertCircle className="h-10 w-10 text-red-300" />
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                  <Button onClick={fetchMovements} size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-left">SKU</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Unit ₹</th>
                        <th className="px-4 py-3 text-left">Reference</th>
                        <th className="px-4 py-3 text-left">Ref ID</th>
                        <th className="px-4 py-3 text-left">Business</th>
                        <th className="px-4 py-3 text-left">When</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {loading
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                        : paged.length === 0
                        ? (
                          <tr>
                            <td colSpan={11} className="py-16 text-center">
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <History className="h-12 w-12 text-slate-200" />
                                <p className="text-sm font-semibold">No stock movements found</p>
                                <p className="text-xs">
                                  {search || filterType !== 'ALL'
                                    ? 'Try adjusting your search or filter'
                                    : 'Movements will appear here after purchases, sales or transfers'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )
                        : paged.map((m, idx) => {
                          const meta = MOVEMENT_META[m.movementType] || MOVEMENT_META.ADJUSTMENT;
                          return (
                            <tr
                              key={m.stockMovementId}
                              onClick={() => setSelectedMovement(m)}
                              className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                              style={{ animation: `fadeUp 0.2s ease ${idx * 0.03}s both` }}
                            >
                              <td className="px-4 py-3">
                                <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  #{m.stockMovementId}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-800 text-xs truncate max-w-[140px]">{m.productName || '—'}</p>
                                {m.brand && <p className="text-[10px] text-slate-400">{m.brand}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                  {m.sku || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <MovementBadge type={m.movementType} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-black text-sm ${
                                  m.movementType === 'SALE' || m.movementType === 'TRANSFER_OUT'
                                    ? 'text-red-600'
                                    : 'text-emerald-600'
                                }`}>
                                  {m.movementType === 'SALE' || m.movementType === 'TRANSFER_OUT' ? '-' : '+'}
                                  {m.quantity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-xs text-slate-600">
                                {m.unitPrice != null ? `₹${m.unitPrice}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500">
                                {REF_LABELS[m.referenceType] || m.referenceType || '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-[10px] text-slate-400">
                                  {m.referenceId ? `#${m.referenceId}` : '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[120px]">
                                {m.businessName || `#${m.businessId}`}
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-[11px] text-slate-500">{fmtRelative(m.createdAt)}</p>
                                <p className="text-[10px] text-slate-300">{fmtDate(m.createdAt)}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 px-2 py-1 rounded-lg group-hover:bg-blue-50 transition-colors flex items-center gap-0.5 mx-auto">
                                  Details <ChevronRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-[11px] text-slate-400 font-medium">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="h-4 w-4 text-slate-500" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                      const pg = start + i;
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            pg === page
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:bg-white hover:border border-transparent hover:border-slate-200'
                          }`}
                        >
                          {pg + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Drawer */}
      {selectedMovement && (
        <DetailDrawer movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
      )}

      {/* Global animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
