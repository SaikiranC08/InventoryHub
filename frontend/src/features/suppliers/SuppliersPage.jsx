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
  X,
  Menu,
  History,
  Package,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Calendar,
  User,
  ShoppingBag,
  Eye,
  Plus,
} from 'lucide-react';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
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

export const SuppliersPage = () => {
  const navigate = useNavigate();
  const { username, selectedBusinessId, logout, initializeUserBusiness } = useAuth();

  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
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

  const fetchSuppliers = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await inventoryApi.getSuppliers();
      setSuppliers(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load supplier directory.');
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (business) fetchSuppliers();
  }, [business, fetchSuppliers]);

  // KPI Computations
  const totalSuppliers = suppliers.length;
  const totalSpend = suppliers.reduce((sum, s) => sum + (s.totalSpend || 0), 0);
  const totalRestockOrders = suppliers.reduce((sum, s) => sum + (s.totalOrders || 0), 0);
  const topSupplier = suppliers.length > 0 ? suppliers[0] : null;

  // Filtered Suppliers List
  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      s.supplierName?.toLowerCase().includes(q) ||
      s.suppliedProducts?.some((p) => p.toLowerCase().includes(q))
    );
  });

  const handleRestock = (supplier) => {
    if (!supplier) {
      navigate(ROUTES.INVENTORY, {
        state: { defaultTab: 'purchase' },
      });
      return;
    }

    const firstItem = supplier.recentOrders?.[0]?.items?.[0];

    if (supplier.isB2bBusiness && supplier.b2bBusinessId) {
      // Registered B2B Business -> Redirect to Marketplace tab & trigger auto-search / modal pre-fill
      navigate(ROUTES.INVENTORY, {
        state: {
          defaultTab: 'marketplace',
          prefillTargetBusinessId: supplier.b2bBusinessId,
          prefillTargetBusinessName: supplier.supplierName,
          prefillProduct: supplier.suppliedProducts?.[0] || firstItem?.productName || supplier.supplierName,
          requestTargetData: {
            businessId: supplier.b2bBusinessId,
            businessName: supplier.supplierName,
            productVariantId: firstItem?.variantId || null,
            productName: supplier.suppliedProducts?.[0] || firstItem?.productName || 'General Product',
            brand: firstItem?.brand || '',
            sku: firstItem?.sku || '',
            currentPrice: firstItem?.unitPrice || '',
            quantity: 100,
          },
        },
      });
    } else {
      // External Vendor -> Redirect to Purchase Stock tab with pre-filled supplier, product name, and unit price
      navigate(ROUTES.INVENTORY, {
        state: {
          defaultTab: 'purchase',
          prefillSupplier: supplier.supplierName,
          prefillProductName: supplier.suppliedProducts?.[0] || firstItem?.productName || '',
          prefillUnitPrice: firstItem?.unitPrice || '',
          prefillBrand: firstItem?.brand || '',
          prefillSku: firstItem?.sku || '',
        },
      });
    }
  };

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
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left"
          >
            <ShoppingCart className="h-4 w-4" /> Orders
          </button>
          <button
            onClick={() => navigate(ROUTES.SUPPLIERS)}
            className="flex items-center gap-3 w-full px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold text-left"
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
              <button onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.ORDERS); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <ShoppingCart className="h-4 w-4" /> Orders
              </button>
              <a className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm" href="#">
                <Truck className="h-4 w-4" /> Suppliers
              </a>
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
            <span className="text-base font-black text-slate-900">Supplier Directory & Procurement</span>
            <span className="text-[11px] text-slate-400">Manage external distributors and restock partners for {business?.businessName}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={fetchSuppliers}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              title="Refresh Directory"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <Button
              onClick={() => handleRestock('')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm flex items-center gap-1.5 ml-2"
            >
              <Plus className="h-4 w-4" /> Purchase Stock
            </Button>
            <div className="h-9 w-9 rounded-full border border-slate-200 shadow-sm flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm select-none ml-2">
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Suppliers</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Truck className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalSuppliers}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Distributors & Vendors</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Spend</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-sm leading-none select-none">
                  ₹
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{fmtMoney(totalSpend)}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Cumulative Procurement</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Restock Orders</span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalRestockOrders}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Delivered Purchase Orders</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Supplier</span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <p className="text-base font-black text-slate-900 truncate">
                {topSupplier ? topSupplier.supplierName : 'N/A'}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {topSupplier ? fmtMoney(topSupplier.totalSpend) : 'No Orders Yet'}
              </p>
            </div>
          </div>

          {/* Search Header & Supplier Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Supplier Directory</h3>
                <p className="text-xs text-slate-400">Click any vendor to inspect supplied products and purchase history.</p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search supplier name or product..."
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

            {/* Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              {loading ? (
                <div className="p-8 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600">No Suppliers Found</p>
                  <p className="text-xs mt-1">Purchases executed via the Purchase Stock form will populate suppliers automatically.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Supplier Name</th>
                      <th className="px-4 py-3">Supplied Products</th>
                      <th className="px-4 py-3">Total Restock Orders</th>
                      <th className="px-4 py-3">Total Spend</th>
                      <th className="px-4 py-3">Last Order Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSuppliers.map((supplier, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${supplier.isB2bBusiness ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-blue-50 text-blue-600 border border-blue-100'} flex items-center justify-center shrink-0 font-bold text-xs`}>
                              {supplier.supplierName?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{supplier.supplierName}</span>
                                {supplier.isB2bBusiness ? (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    B2B Partner
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    External
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                          {supplier.suppliedProducts?.join(', ') || 'General Stock'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {supplier.totalOrders} order(s)
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">
                          {fmtMoney(supplier.totalSpend)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {fmtDate(supplier.lastOrderDate)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedSupplier(supplier)}
                              className="h-9 px-3.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl inline-flex items-center gap-1.5 shrink-0"
                            >
                              <Eye className="h-4 w-4" /> Profile
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRestock(supplier)}
                              className={`h-9 px-4 text-xs font-extrabold ${
                                supplier.isB2bBusiness ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
                              } text-white rounded-xl inline-flex items-center gap-2 shadow-sm shrink-0 min-w-[145px] justify-center tracking-wide`}
                            >
                              <Plus className="h-4 w-4" /> {supplier.isB2bBusiness ? 'Request Stock' : 'Restock'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Supplier Profile Modal ─────────────────────────────────────── */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedSupplier(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 z-10 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                  {selectedSupplier.supplierName?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xl">{selectedSupplier.supplierName}</h3>
                  <p className="text-xs text-slate-400 font-medium">Verified Supplier & Distributor</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedSupplier(null)}
                className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 p-0 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-xl p-4 text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
                  <p className="font-black text-slate-800 text-base mt-0.5">{selectedSupplier.totalOrders}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Spend</p>
                  <p className="font-mono font-black text-blue-600 text-base mt-0.5">{fmtMoney(selectedSupplier.totalSpend)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Order</p>
                  <p className="font-bold text-slate-700 text-xs mt-0.5">{fmtDate(selectedSupplier.lastOrderDate)}</p>
                </div>
              </div>

              {/* Supplied Products List */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Supplied Products Catalog</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplier.suppliedProducts?.map((prod, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                      📦 {prod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Orders Receipts */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Fulfilled Purchase Orders</p>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs max-h-48 overflow-y-auto">
                  {selectedSupplier.recentOrders?.map((order) => (
                    <div key={order.purchaseOrderId} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-mono font-bold text-blue-600">#PO-{order.purchaseOrderId}</p>
                        <p className="text-[10px] text-slate-400">{fmtDate(order.createdAt)} • {order.items?.length || 0} item(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-800">{fmtMoney(order.totalAmount)}</p>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {order.status || 'COMPLETED'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restock Action */}
              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <Button
                  onClick={() => {
                    const sup = selectedSupplier;
                    setSelectedSupplier(null);
                    handleRestock(sup);
                  }}
                  className={`font-bold text-xs h-10 px-5 rounded-xl shadow-md flex items-center gap-2 text-white ${selectedSupplier.isB2bBusiness ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Plus className="h-4 w-4" /> {selectedSupplier.isB2bBusiness ? `Request Stock from ${selectedSupplier.supplierName}` : `Purchase Stock from ${selectedSupplier.supplierName}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
