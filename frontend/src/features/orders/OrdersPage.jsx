import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import logoImg from '@/assets/logo.png';
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
  MessageSquare,
  FileText,
  Calendar,
  User,
  ShoppingBag,
  CheckCircle,
  Eye,
} from 'lucide-react';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fmtMoney = (val) => {
  if (val === null || val === undefined) return '₹0.00';
  return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const OrdersPage = () => {
  const navigate = useNavigate();
  const { username, selectedBusinessId, logout, initializeUserBusiness } = useAuth();

  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'purchase'
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Business resolution
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

  const fetchOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [salesData, purchaseData] = await Promise.all([
        inventoryApi.getSalesOrders(),
        inventoryApi.getPurchaseOrders(),
      ]);
      setSalesOrders(salesData || []);
      setPurchaseOrders(purchaseData || []);
    } catch (err) {
      setError(err?.message || 'Failed to load order data.');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (business) fetchOrders();
  }, [business, fetchOrders]);

  // Calculations for KPI Cards
  const totalSalesRevenue = salesOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPurchaseExpenses = purchaseOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filtered lists based on search query
  const filteredSalesOrders = salesOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      String(o.salesOrderId).includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q) ||
      o.items?.some((i) => i.productName?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q))
    );
  });

  const filteredPurchaseOrders = purchaseOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      String(o.purchaseOrderId).includes(q) ||
      o.supplierName?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q) ||
      o.items?.some((i) => i.productName?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q))
    );
  });

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
          <img src={logoImg} alt="InventoryHub Logo" className="h-11 w-11 object-contain rounded-xl shadow-sm" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            InventoryHub
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </button>
          <button
            onClick={() => navigate(ROUTES.INVENTORY)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left"
          >
            <Boxes className="h-4 w-4" /> Inventory
          </button>
          <button
            onClick={() => navigate(ROUTES.ORDERS)}
            className="flex items-center gap-3 w-full px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold text-left"
          >
            <ShoppingCart className="h-4 w-4" /> Orders
          </button>
          <button
            onClick={() => navigate(ROUTES.SUPPLIERS)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left"
          >
            <Truck className="h-4 w-4" /> Suppliers
          </button>
          <button
            onClick={() => navigate(ROUTES.REPORTS)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left"
          >
            <BarChart3 className="h-4 w-4" /> Reports
          </button>
          <button
            onClick={() => navigate(ROUTES.STOCK_HISTORY)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left"
          >
            <History className="h-4 w-4" /> Stock History
          </button>
          <button
            onClick={() => navigate(ROUTES.MESSAGING)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left"
          >
            <MessageSquare className="h-4 w-4" /> Collaboration
          </button>
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-1">
          <button
            onClick={() => navigate(ROUTES.BUSINESS_SELECT)}
            className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60 shadow-sm transition-all"
          >
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-[85%] h-full p-4 gap-2 bg-white shadow-2xl z-10 animate-slideRight">
            <div className="px-3 py-2 flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="InventoryHub Logo" className="h-11 w-11 object-contain rounded-xl shadow-sm" />
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  InventoryHub
                </span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
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
                <ShoppingCart className="h-4 w-4" /> Orders
              </a>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.SUPPLIERS); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <Truck className="h-4 w-4" /> Suppliers
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.REPORTS); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <BarChart3 className="h-4 w-4" /> Reports
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.STOCK_HISTORY); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <History className="h-4 w-4" /> Stock History
              </button>
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

      {/* ── Main Workspace ───────────────────────────────────────────────── */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-[68px] flex justify-between items-center px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl">
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-base font-black text-slate-900">Orders Management</span>
            <span className="text-[11px] text-slate-400">Commercial Sales & Purchase Orders for {business?.businessName}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={fetchOrders}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <div className="h-9 w-9 rounded-full border border-slate-200 shadow-sm flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm select-none ml-1">
              {username?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sales Orders</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{salesOrders.length}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Completed Customer Sales</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sales Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-sm leading-none select-none">
                  ₹
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{fmtMoney(totalSalesRevenue)}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Gross Sales Revenue</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Purchase Orders</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{purchaseOrders.length}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Supplier Restock Orders</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Purchase Expenses</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <TrendingDown className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{fmtMoney(totalPurchaseExpenses)}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Total Supplier Cost</p>
            </div>
          </div>

          {/* Navigation Sub-Tabs & Search Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sales Orders ({salesOrders.length})
                </button>
                <button
                  onClick={() => setActiveTab('purchase')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'purchase' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Purchase Orders ({purchaseOrders.length})
                </button>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'sales' ? 'customer sales' : 'supplier purchases'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Main Orders Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              {loading ? (
                <div className="p-8 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : activeTab === 'sales' ? (
                filteredSalesOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No Sales Orders Found</p>
                    <p className="text-xs mt-1">Customer sales executed via counter sales will appear here.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Customer Name</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Total Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSalesOrders.map((order) => (
                        <tr key={order.salesOrderId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-blue-600 text-xs">
                            #SO-{order.salesOrderId}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">{order.customerName || 'Walk-in Customer'}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(order.createdAt)}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                            {order.items?.length || 0} item(s)
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                            {fmtMoney(order.totalAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="h-3 w-3" /> {order.status || 'COMPLETED'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedOrder({ type: 'sales', ...order })}
                              className="h-8 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 ml-auto"
                            >
                              <Eye className="h-3.5 w-3.5" /> Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                filteredPurchaseOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No Purchase Orders Found</p>
                    <p className="text-xs mt-1">Stock acquired from external suppliers will appear here.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Supplier Name</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Total Cost</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPurchaseOrders.map((order) => (
                        <tr key={order.purchaseOrderId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-blue-600 text-xs">
                            #PO-{order.purchaseOrderId}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">{order.supplierName || 'External Supplier'}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(order.createdAt)}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                            {order.items?.length || 0} item(s)
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-blue-600">
                            {fmtMoney(order.totalAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <CheckCircle className="h-3 w-3" /> {order.status || 'COMPLETED'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedOrder({ type: 'purchase', ...order })}
                              className="h-8 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 ml-auto"
                            >
                              <Eye className="h-3.5 w-3.5" /> Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Order Detail Modal / Receipt Preview ───────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 z-10 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {selectedOrder.type === 'sales' ? 'Customer Sales Order' : 'Supplier Purchase Order'}
                </span>
                <h3 className="font-black text-slate-900 text-xl font-mono mt-0.5">
                  #{selectedOrder.type === 'sales' ? `SO-${selectedOrder.salesOrderId}` : `PO-${selectedOrder.purchaseOrderId}`}
                </h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 p-0 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {selectedOrder.type === 'sales' ? 'Customer Name' : 'Supplier Name'}
                  </p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {selectedOrder.type === 'sales' ? selectedOrder.customerName || 'Walk-in Customer' : selectedOrder.supplierName || 'External Supplier'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Date</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{fmtDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Line Items Breakdown</p>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{item.productName || `Variant #${item.variantId}`}</p>
                        <p className="text-[10px] font-mono text-slate-400">{item.sku} {item.brand ? `• ${item.brand}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-800">{fmtMoney(item.totalPrice)}</p>
                        <p className="text-[10px] text-slate-400">{item.quantity} x {fmtMoney(item.unitPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total Summary */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm">Grand Total Amount</span>
                <span className="font-mono font-black text-xl text-blue-600">{fmtMoney(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
