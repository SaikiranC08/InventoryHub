import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import logoImg from '@/assets/logo.png';
import { getBusinessId } from '@/utils/tokenStorage';
import { businessApi } from '@/api/business.api';
import { inventoryApi } from '@/api/inventory.api';
import { generateBusinessHealthPDFReport } from '@/services/pdfReportGenerator';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  MessageSquare,
  FileText,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const fmtRs = (val) => {
  const num = Number(val || 0);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const ReportsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Business & Data States
  const [business, setBusiness] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [stockRequests, setStockRequests] = useState([]);
  const [movements, setMovements] = useState([]);

  // Date Filter State
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    preset: 'ALL', // '7DAYS' | '30DAYS' | 'THIS_MONTH' | 'ALL' | 'CUSTOM'
  });

  const activeBusinessId = getBusinessId();

  // Load Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeBusinessId) {
        try {
          const bizData = await businessApi.getBusinessInfoById(activeBusinessId);
          setBusiness(bizData);
        } catch (e) {
          console.warn('Could not load specific business context:', e);
        }
      }

      const [invData, reqData, movData] = await Promise.all([
        inventoryApi.getInventory().catch(() => []),
        inventoryApi.getStockRequests().catch(() => []),
        inventoryApi.getStockMovements().catch(() => []),
      ]);

      setInventory(invData || []);
      setStockRequests(reqData || []);
      setMovements(movData || []);
    } catch (err) {
      console.error('Failed to load report data:', err);
      toast.error('Failed to load audit and report data.');
    } finally {
      setLoading(false);
    }
  }, [activeBusinessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Quick Date Range Handler
  const handlePresetChange = (preset) => {
    const today = new Date();
    let start = null;
    let end = today.toISOString().slice(0, 10);

    if (preset === '7DAYS') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().slice(0, 10);
    } else if (preset === '30DAYS') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().slice(0, 10);
    } else if (preset === 'THIS_MONTH') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = d.toISOString().slice(0, 10);
    } else if (preset === 'ALL') {
      start = '';
      end = '';
    }

    setDateRange({
      startDate: start || '',
      endDate: end || '',
      preset,
    });
  };

  // Filter Movements & Requests by Selected Date Range
  const filteredMovements = useMemo(() => {
    if (!dateRange.startDate && !dateRange.endDate) return movements;

    return movements.filter((m) => {
      if (!m.timestamp) return true;
      const mDate = new Date(m.timestamp).toISOString().slice(0, 10);
      if (dateRange.startDate && mDate < dateRange.startDate) return false;
      if (dateRange.endDate && mDate > dateRange.endDate) return false;
      return true;
    });
  }, [movements, dateRange]);

  const filteredRequests = useMemo(() => {
    if (!dateRange.startDate && !dateRange.endDate) return stockRequests;

    return stockRequests.filter((r) => {
      if (!r.createdAt && !r.timestamp) return true;
      const rDate = new Date(r.createdAt || r.timestamp).toISOString().slice(0, 10);
      if (dateRange.startDate && rDate < dateRange.startDate) return false;
      if (dateRange.endDate && rDate > dateRange.endDate) return false;
      return true;
    });
  }, [stockRequests, dateRange]);

  // Derived Summary Analytics for Preview
  const totalValuation = useMemo(() => {
    return inventory.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.currentPrice || i.unitPrice) || 0), 0);
  }, [inventory]);

  const totalUnits = useMemo(() => {
    return inventory.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((i) => (Number(i.quantity) || 0) <= (Number(i.reorderLevel) || 10));
  }, [inventory]);

  const outOfStockCount = useMemo(() => {
    return lowStockItems.filter((i) => (Number(i.quantity) || 0) <= 0).length;
  }, [lowStockItems]);

  const totalRestockBudget = useMemo(() => {
    return lowStockItems.reduce((sum, i) => {
      const qty = Number(i.quantity) || 0;
      const reorderLvl = Number(i.reorderLevel) || 10;
      const needed = Math.max((reorderLvl * 2 > 20 ? reorderLvl * 2 : 25) - qty, 10);
      const price = Number(i.unitPrice || i.currentPrice || 0);
      return sum + needed * price;
    }, 0);
  }, [lowStockItems]);

  // Handle Export Trigger
  const handleExportPDF = async (sectionFilter = 'ALL') => {
    try {
      setExporting(true);
      toast.info(`Preparing ${sectionFilter === 'ALL' ? 'Full 4-Section' : `Section ${sectionFilter}`} PDF Report...`);

      await generateBusinessHealthPDFReport({
        business: business || {},
        inventory,
        stockRequests: filteredRequests,
        movements: filteredMovements,
        dateRange,
        sectionFilter,
      });

      toast.success('PDF Report generated and downloaded successfully!');
    } catch (e) {
      console.error('Failed to generate PDF report:', e);
      toast.error('Failed to generate PDF document.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="space-y-4 max-w-lg w-full">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800 antialiased flex h-screen overflow-hidden bg-slate-50/50">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col p-4 gap-2 bg-white border-r border-slate-200/80 shadow-sm z-40">
        <div className="px-3 py-2 flex items-center gap-3 mb-4">
          <img src={logoImg} alt="InventoryHub Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              InventoryHub
            </span>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-semibold">
              Audit & Reports
            </span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all text-left text-xs font-medium"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-400" /> Dashboard
          </button>
          <button
            onClick={() => navigate(ROUTES.INVENTORY)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all text-left text-xs font-medium"
          >
            <Boxes className="h-4 w-4 text-slate-400" /> Inventory
          </button>
          <button
            onClick={() => navigate(ROUTES.ORDERS)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all text-left text-xs font-medium"
          >
            <ShoppingCart className="h-4 w-4 text-slate-400" /> Orders & Requests
          </button>
          <button
            onClick={() => navigate(ROUTES.SUPPLIERS)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all text-left text-xs font-medium"
          >
            <Truck className="h-4 w-4 text-slate-400" /> Suppliers
          </button>
          <button
            onClick={() => navigate(ROUTES.REPORTS)}
            className="flex items-center gap-3 w-full px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 text-left text-xs"
          >
            <BarChart3 className="h-4 w-4" /> Reports & Audit
          </button>
          <button
            onClick={() => navigate(ROUTES.STOCK_HISTORY)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-xs font-medium"
          >
            <History className="h-4 w-4 text-slate-400" /> Stock History
          </button>
          <button
            onClick={() => navigate(ROUTES.MESSAGING)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-left text-xs font-semibold"
          >
            <MessageSquare className="h-4 w-4 text-blue-500" /> Business Chat
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-3 flex flex-col gap-1">
          <button
            onClick={() => navigate(ROUTES.BUSINESS_SELECT)}
            className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 text-left">
                <p className="font-bold text-xs text-slate-800 group-hover:text-blue-600 truncate">{business?.businessName}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{business?.businessType}</span>
                </div>
              </div>
            </div>
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>
          <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-left w-full text-xs font-semibold mt-1">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-[85%] h-full p-4 gap-2 bg-white shadow-2xl z-10 animate-slideRight">
            <div className="px-3 py-2 flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="InventoryHub Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  InventoryHub
                </span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.DASHBOARD); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-xs font-medium">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.INVENTORY); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-xs font-medium">
                <Boxes className="h-4 w-4" /> Inventory
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.ORDERS); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-xs font-medium">
                <ShoppingCart className="h-4 w-4" /> Orders
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.SUPPLIERS); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-xs font-medium">
                <Truck className="h-4 w-4" /> Suppliers
              </button>
              <a className="flex items-center gap-3 px-3 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs" href="#">
                <BarChart3 className="h-4 w-4" /> Reports
              </a>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.STOCK_HISTORY); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-xs font-medium">
                <History className="h-4 w-4" /> Stock History
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.MESSAGING); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-left text-xs font-semibold">
                <MessageSquare className="h-4 w-4" /> Business Chat
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main Content Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-y-auto min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-base font-black text-slate-900">Executive Audit & Health Reports</span>
              <span className="text-[11px] text-slate-400">Official audit ledger for {business?.businessName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleExportPDF('ALL')}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10 gap-2 h-9 px-4 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? 'Generating PDF...' : 'Export PDF Report'}
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* ── Date Range Controls Filter Card ───────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Custom Audit Date Filter</h2>
                  <p className="text-xs text-slate-500">Filter movement logs and transfer ledgers for specific audit periods</p>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handlePresetChange('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    dateRange.preset === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => handlePresetChange('7DAYS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    dateRange.preset === '7DAYS' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => handlePresetChange('30DAYS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    dateRange.preset === '30DAYS' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => handlePresetChange('THIS_MONTH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    dateRange.preset === 'THIS_MONTH' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Custom Start / End Date Pickers */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">From Date:</span>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value, preset: 'CUSTOM' }))}
                  className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">To Date:</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value, preset: 'CUSTOM' }))}
                  className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {(dateRange.startDate || dateRange.endDate) && (
                <button
                  onClick={() => handlePresetChange('ALL')}
                  className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" /> Clear Date Filter
                </button>
              )}
            </div>
          </div>

          {/* ── SECTION 1 CARD: Executive Stock Valuation & Audit ─────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Section 1: Executive Stock Valuation & Audit</h2>
                  <p className="text-xs text-slate-500">Official SKU asset valuation, total inventory health KPIs, and compliance signoff</p>
                </div>
              </div>

              <Button
                onClick={() => handleExportPDF(1)}
                disabled={exporting}
                variant="outline"
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs h-9 px-3.5 gap-2 shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" /> Export Section 1 PDF
              </Button>
            </div>

            {/* Section 1 Live KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Active SKUs</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{inventory.length} SKUs</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Physical Units</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalUnits.toLocaleString('en-IN')} Units</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Inventory Valuation</p>
                <p className="text-2xl font-extrabold text-blue-950 mt-1">{fmtRs(totalValuation)}</p>
              </div>
            </div>

            {/* Itemized Table Preview */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Asset Value (₹)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {inventory.slice(0, 5).map((item, idx) => {
                    const qty = Number(item.quantity) || 0;
                    const price = Number(item.currentPrice || item.unitPrice) || 0;
                    const assetVal = qty * price;
                    const reorderLvl = Number(item.reorderLevel) || 10;
                    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    let statusLabel = 'Optimal';
                    if (qty <= 0) {
                      badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                      statusLabel = 'Out of Stock';
                    } else if (qty <= reorderLvl) {
                      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                      statusLabel = 'Low Stock';
                    }

                    return (
                      <tr key={item.productId || item.sku || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-600">{item.sku || `SKU-00${idx + 1}`}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{item.productName || item.name}</td>
                        <td className="px-4 py-3 text-slate-500">{item.categoryName || 'General'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">{qty}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmtRs(price)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{fmtRs(assetVal)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={`${badgeClass} text-[10px] uppercase tracking-wide font-bold`}>
                            {statusLabel}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {inventory.length > 5 && (
                <div className="p-2.5 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                  Showing top 5 of {inventory.length} items. Complete itemized table will be rendered in exported PDF report.
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 2 CARD: B2B Network Transfer & Collaboration Audit ────── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Section 2: B2B Network Transfer & Collaboration Audit</h2>
                  <p className="text-xs text-slate-500">Log of inter-business stock transfers, partner trade summary, and stock request history</p>
                </div>
              </div>

              <Button
                onClick={() => handleExportPDF(2)}
                disabled={exporting}
                variant="outline"
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs h-9 px-3.5 gap-2 shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600" /> Export Section 2 PDF
              </Button>
            </div>

            {/* B2B Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Stock Requests Recorded</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{filteredRequests.length} Requests</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Approved B2B Requests</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {filteredRequests.filter((r) => r.status === 'APPROVED').length} Approved
                </p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">B2B Audit Movements</p>
                <p className="text-2xl font-extrabold text-indigo-950 mt-1">{filteredMovements.length} Logs</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 3 CARD: Low Stock & Restock Action Plan ───────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Section 3: Low Stock & Restock Action Plan</h2>
                  <p className="text-xs text-slate-500">Critical threshold alerts, suggested restock quantities, and projected budget</p>
                </div>
              </div>

              <Button
                onClick={() => handleExportPDF(3)}
                disabled={exporting}
                variant="outline"
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs h-9 px-3.5 gap-2 shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-rose-600" /> Export Section 3 PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Low Stock Warnings</p>
                <p className="text-2xl font-extrabold text-amber-950 mt-1">{lowStockItems.length} SKUs</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Out of Stock Critical</p>
                <p className="text-2xl font-extrabold text-rose-950 mt-1">{outOfStockCount} SKUs</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Est. Restock Budget Needed</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{fmtRs(totalRestockBudget)}</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 4 CARD: Stock Movement & Velocity Ledger ─────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Section 4: Stock Movement & Velocity Ledger</h2>
                  <p className="text-xs text-slate-500">Inbound vs. outbound velocity, fast-moving SKUs, and chronological movement audit trail</p>
                </div>
              </div>

              <Button
                onClick={() => handleExportPDF(4)}
                disabled={exporting}
                variant="outline"
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs h-9 px-3.5 gap-2 shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-slate-700" /> Export Section 4 PDF
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Movement Audit Summary</p>
                <p className="text-xs text-slate-500">
                  Total {filteredMovements.length} logged stock movements recorded for the selected audit period.
                </p>
              </div>
              <Button
                onClick={() => handleExportPDF('ALL')}
                disabled={exporting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9 px-4 gap-2"
              >
                <Download className="h-3.5 w-3.5" /> Download Complete 4-Section Report
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
