import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getBusinessId } from '@/utils/tokenStorage';
import { businessApi } from '@/api/business.api';
import { inventoryApi } from '@/api/inventory.api';
import { productsApi } from '@/api/products.api';
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
  HelpCircle, 
  LogOut, 
  Search, 
  Bell, 
  ArrowUpDown, 
  Plus,
  Menu,
  ChevronDown,
  RefreshCw,
  Filter,
  Eye,
  ArrowRight,
  TrendingUp,
  Package,
  PlusCircle,
  MinusCircle,
  Send,
  MessageSquare,
  Sparkles,
  AlertCircle,
  X,
  Inbox,
  CheckCircle,
  XCircle,
  ClipboardList
} from 'lucide-react';

export const InventoryPage = () => {
  const navigate = useNavigate();
  const { username, selectedBusinessId, logout, initializeUserBusiness } = useAuth();
  
  // Layout States
  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  
  // Dropdowns / Choices Data
  const [businessesList, setBusinessesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [unitTypes, setUnitTypes] = useState(['PIECE', 'KG', 'LITRE', 'BOX', 'PACKET']);

  // --- Tab 1: Products / Inventory States ---
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer / Detail Side Panel
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  // --- Tab 2: Purchase Stock Form States ---
  const [purchaseForm, setPurchaseForm] = useState({
    supplierName: '',
    productName: '',
    brand: '',
    categoryId: '',
    sku: '',
    unitType: 'PIECE',
    unitValue: 1,
    currentPrice: '',
    quantity: 1,
    unitPrice: '',
    remark: 'Stock purchase',
    reorderLevel: 5,
  });
  const [purchaseAttributes, setPurchaseAttributes] = useState({});
  const [dynamicCategoryAttributes, setDynamicCategoryAttributes] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // --- Tab 3: Sell Stock Form States ---
  const [sellForm, setSellForm] = useState({
    customerName: '',
    variantId: '',
    quantity: 1,
    unitPrice: '',
    remark: 'Sold at counter',
  });
  const [sellLoading, setSellLoading] = useState(false);

  // --- Tab 4: Transfer Stock Form States ---
  const [transferForm, setTransferForm] = useState({
    toBusinessId: '',
    productVariantId: '',
    quantity: 1,
    unitPrice: '',
    remark: 'Internal branch transfer',
  });
  const [transferLoading, setTransferLoading] = useState(false);

  // --- Tab 5: Marketplace Search States ---
  const [marketplaceQuery, setMarketplaceQuery] = useState('');
  const [marketplaceResults, setMarketplaceResults] = useState([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);

  // --- Stock Request Modal States ---
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestTarget, setRequestTarget] = useState(null); // the marketplace result being requested
  const [requestForm, setRequestForm] = useState({ quantity: 1, offeredUnitPrice: '' });
  const [requestLoading, setRequestLoading] = useState(false);

  // --- Tab 6: Stock Requests Inbox ---
  const [stockRequests, setStockRequests] = useState([]);
  const [stockRequestsLoading, setStockRequestsLoading] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  // Core Resolution: ensure business is authenticated and selected
  useEffect(() => {
    const resolveBusiness = async () => {
      const activeBusinessId = selectedBusinessId || getBusinessId();
      if (!activeBusinessId) {
        const targetRoute = await initializeUserBusiness();
        if (targetRoute !== ROUTES.DASHBOARD) {
          navigate(targetRoute, { replace: true });
        }
      } else {
        try {
          setBusinessLoading(true);
          const data = await businessApi.getBusinessById(activeBusinessId);
          setBusiness(data);
        } catch (err) {
          console.error('Failed to load business details:', err);
          navigate(ROUTES.BUSINESS_SELECT, { replace: true });
        } finally {
          setBusinessLoading(false);
        }
      }
    };
    resolveBusiness();
  }, [selectedBusinessId, navigate, initializeUserBusiness]);

  // Load supporting lists
  useEffect(() => {
    if (business) {
      fetchInventory();
      fetchCategories();
      fetchUnitTypes();
      fetchOtherBusinesses();
      fetchStockRequests();
    }
  }, [business]);

  // Fetch functions
  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);
      setInventoryError(null);
      const data = await inventoryApi.getInventory();
      setInventoryList(data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setInventoryError('Could not retrieve inventory items.');
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productsApi.getCategories();
      setCategoriesList(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchUnitTypes = async () => {
    try {
      const data = await productsApi.getUnitTypes();
      if (data && data.length > 0) {
        setUnitTypes(data);
      }
    } catch (err) {
      console.error('Error fetching unit types:', err);
    }
  };

  const fetchOtherBusinesses = async () => {
    try {
      const data = await businessApi.getAllBusinesses();
      setBusinessesList(data || []);
    } catch (err) {
      console.error('Error fetching other businesses:', err);
    }
  };


  // Fetch dynamic attributes when a category is selected in Purchase Form
  useEffect(() => {
    const loadCategoryAttributes = async () => {
      if (purchaseForm.categoryId) {
        try {
          const attributes = await productsApi.getCategoryAttributes(purchaseForm.categoryId);
          setDynamicCategoryAttributes(attributes || []);
          // reset attribute values
          const initialAttrs = {};
          (attributes || []).forEach(attr => {
            initialAttrs[attr.attributKey] = attr.dataType === 'BOOLEAN' ? false : '';
          });
          setPurchaseAttributes(initialAttrs);
        } catch (err) {
          console.error('Error fetching category attributes:', err);
          setDynamicCategoryAttributes([]);
        }
      } else {
        setDynamicCategoryAttributes([]);
        setPurchaseAttributes({});
      }
    };
    loadCategoryAttributes();
  }, [purchaseForm.categoryId]);

  // Filtered & Sorted Inventory list memo
  const processedInventory = useMemo(() => {
    let result = [...inventoryList];

    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        const prodName = item.productVariant?.product?.productName?.toLowerCase() || '';
        const sku = item.productVariant?.sku?.toLowerCase() || '';
        const brand = item.productVariant?.product?.brand?.toLowerCase() || '';
        return prodName.includes(query) || sku.includes(query) || brand.includes(query);
      });
    }

    // 2. Category Filter
    if (selectedCategoryFilter !== 'ALL') {
      result = result.filter(item => 
        String(item.productVariant?.product?.category?.categoryId) === String(selectedCategoryFilter)
      );
    }

    // 3. Stock Status Filter
    if (stockStatusFilter !== 'ALL') {
      result = result.filter(item => {
        const qty = item.quantity || 0;
        const reorder = item.reorderLevel || 0;
        if (stockStatusFilter === 'IN_STOCK') return qty > reorder;
        if (stockStatusFilter === 'LOW_STOCK') return qty > 0 && qty <= reorder;
        if (stockStatusFilter === 'OUT_OF_STOCK') return qty === 0;
        return true;
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'name') {
        valA = a.productVariant?.product?.productName || '';
        valB = b.productVariant?.product?.productName || '';
      } else if (sortField === 'sku') {
        valA = a.productVariant?.sku || '';
        valB = b.productVariant?.sku || '';
      } else if (sortField === 'quantity') {
        valA = a.quantity || 0;
        valB = b.quantity || 0;
      } else if (sortField === 'price') {
        valA = a.productVariant?.currentPrice || 0;
        valB = b.productVariant?.currentPrice || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [inventoryList, searchQuery, selectedCategoryFilter, stockStatusFilter, sortField, sortOrder]);

  // Paginated Inventory
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [processedInventory, currentPage]);

  const totalPages = Math.ceil(processedInventory.length / itemsPerPage) || 1;

  // Selected Variant details for Tab 3 & Tab 4 selection dropdown
  const selectedVariantDetails = useMemo(() => {
    if (!sellForm.variantId) return null;
    return inventoryList.find(item => String(item.productVariant?.variantId) === String(sellForm.variantId));
  }, [sellForm.variantId, inventoryList]);

  const selectedTransferVariantDetails = useMemo(() => {
    if (!transferForm.productVariantId) return null;
    return inventoryList.find(item => String(item.productVariant?.variantId) === String(transferForm.productVariantId));
  }, [transferForm.productVariantId, inventoryList]);

  // Handle Purchase Submit
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseForm.supplierName || !purchaseForm.productName || !purchaseForm.categoryId || !purchaseForm.sku || !purchaseForm.currentPrice || !purchaseForm.unitPrice) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setPurchaseLoading(true);
      const payload = {
        ...purchaseForm,
        categoryId: parseInt(purchaseForm.categoryId),
        unitValue: parseFloat(purchaseForm.unitValue),
        currentPrice: parseFloat(purchaseForm.currentPrice),
        quantity: parseInt(purchaseForm.quantity),
        unitPrice: parseFloat(purchaseForm.unitPrice),
        totalPrice: parseFloat(purchaseForm.unitPrice) * parseInt(purchaseForm.quantity),
        attributes: purchaseAttributes,
      };

      await inventoryApi.purchaseStock(payload);
      toast.success(`Successfully purchased ${purchaseForm.quantity} unit(s) of ${purchaseForm.productName}!`);
      
      // Reset form
      setPurchaseForm({
        supplierName: '',
        productName: '',
        brand: '',
        categoryId: '',
        sku: '',
        unitType: 'PIECE',
        unitValue: 1,
        currentPrice: '',
        quantity: 1,
        unitPrice: '',
        remark: 'Stock purchase',
        reorderLevel: 5,
      });
      setPurchaseAttributes({});
      
      // Reload inventory
      fetchInventory();
      setActiveTab('products');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to purchase stock.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Handle Sell Submit
  const handleSellSubmit = async (e) => {
    e.preventDefault();
    if (!sellForm.customerName || !sellForm.variantId || !sellForm.quantity || !sellForm.unitPrice) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (selectedVariantDetails && sellForm.quantity > selectedVariantDetails.quantity) {
      toast.error('Insufficient stock level for this transaction.');
      return;
    }

    try {
      setSellLoading(true);
      const payload = {
        customerName: sellForm.customerName,
        variantId: parseInt(sellForm.variantId),
        quantity: parseInt(sellForm.quantity),
        unitPrice: parseFloat(sellForm.unitPrice),
        totalPrice: parseFloat(sellForm.unitPrice) * parseInt(sellForm.quantity),
        remark: sellForm.remark,
      };

      await inventoryApi.sellStock(payload);
      toast.success(`Successfully sold ${sellForm.quantity} unit(s) to ${sellForm.customerName}!`);
      
      // Reset form
      setSellForm({
        customerName: '',
        variantId: '',
        quantity: 1,
        unitPrice: '',
        remark: 'Sold at counter',
      });

      // Reload inventory
      fetchInventory();
      setActiveTab('products');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to sell stock.');
    } finally {
      setSellLoading(false);
    }
  };

  // Handle Transfer Submit
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferForm.toBusinessId || !transferForm.productVariantId || !transferForm.quantity || !transferForm.unitPrice) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (selectedTransferVariantDetails && transferForm.quantity > selectedTransferVariantDetails.quantity) {
      toast.error('Insufficient stock for internal transfer.');
      return;
    }

    try {
      setTransferLoading(true);
      const payload = {
        toBusinessId: parseInt(transferForm.toBusinessId),
        productVariantId: parseInt(transferForm.productVariantId),
        quantity: parseInt(transferForm.quantity),
        unitPrice: parseFloat(transferForm.unitPrice),
        totalPrice: parseFloat(transferForm.unitPrice) * parseInt(transferForm.quantity),
        remark: transferForm.remark,
      };

      await inventoryApi.transferStock(payload);
      toast.success(`Successfully transferred ${transferForm.quantity} unit(s) internally!`);
      
      // Reset form
      setTransferForm({
        toBusinessId: '',
        productVariantId: '',
        quantity: 1,
        unitPrice: '',
        remark: 'Internal branch transfer',
      });

      // Reload inventory
      fetchInventory();
      setActiveTab('products');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to complete stock transfer.');
    } finally {
      setTransferLoading(false);
    }
  };

  // Fetch Stock Requests
  const fetchStockRequests = async () => {
    try {
      setStockRequestsLoading(true);
      const data = await inventoryApi.getStockRequests();
      setStockRequests(data || []);
    } catch (err) {
      console.error('Error fetching stock requests:', err);
    } finally {
      setStockRequestsLoading(false);
    }
  };

  // Handle Marketplace Search
  const handleMarketplaceSearch = async (e) => {
    if (e) e.preventDefault();
    if (!marketplaceQuery.trim()) {
      toast.error('Please enter a search query.');
      return;
    }

    try {
      setMarketplaceLoading(true);
      const results = await inventoryApi.searchMarketplace(marketplaceQuery);
      setMarketplaceResults(results || []);
      if ((results || []).length === 0) {
        toast.info('No results found. Try the exact product name (e.g. "laptop" not "laptops").');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Marketplace search failed.');
      setMarketplaceResults([]);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  // Open Request Modal from Marketplace
  const openRequestModal = (result) => {
    setRequestTarget(result);
    setRequestForm({ quantity: 1, offeredUnitPrice: result.currentPrice || '' });
    setRequestModalOpen(true);
  };

  // Handle Stock Request Submit
  const handleStockRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.quantity || !requestForm.offeredUnitPrice) {
      toast.error('Please fill in quantity and offered price.');
      return;
    }
    try {
      setRequestLoading(true);
      const payload = {
        toBusinessId: requestTarget.businessId,
        productVariantId: requestTarget.productVariantId,
        quantity: parseInt(requestForm.quantity),
        offeredUnitPrice: parseFloat(requestForm.offeredUnitPrice),
        offeredTotalPrice: parseFloat(requestForm.offeredUnitPrice) * parseInt(requestForm.quantity),
      };
      await inventoryApi.createStockRequest(payload);
      toast.success(`Stock request sent to ${requestTarget.businessName}!`);
      setRequestModalOpen(false);
      setRequestTarget(null);
      fetchStockRequests();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to send stock request.');
    } finally {
      setRequestLoading(false);
    }
  };

  // Handle Stock Request Status Update (Accept / Reject)
  const handleUpdateStockRequest = async (requestId, status) => {
    try {
      setUpdatingRequestId(requestId);
      await inventoryApi.updateStockRequest(requestId, status);
      toast.success(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
      fetchStockRequests();
      if (status === 'APPROVED') fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to update stock request.');
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // Switch tab and handle helper animations
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Helper helper to get stock status attributes
  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (quantity <= reorderLevel) {
      return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  if (businessLoading || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="space-y-4 max-w-md w-full">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-10 w-3/4 rounded-xl mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800 antialiased flex h-screen overflow-hidden bg-slate-50/50">
      {/* SideNavBar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col p-4 gap-2 bg-white border-r border-slate-200/80 shadow-sm z-40 transition-transform">
        <div className="px-3 py-2 flex items-center gap-2 mb-6">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            InventoryHub
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <button 
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 text-left w-full"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button 
            onClick={() => handleTabChange('products')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 text-left w-full ${
              activeTab === 'products' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Boxes className="h-4 w-4" />
            Inventory
          </button>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200" href="#">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200" href="#">
            <Truck className="h-4 w-4" />
            Suppliers
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200" href="#">
            <BarChart3 className="h-4 w-4" />
            Reports
          </a>
        </nav>

        {/* Bottom Panel */}
        <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-1">
          <button 
            onClick={() => navigate(ROUTES.BUSINESS_SELECT)}
            className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60 shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-800 truncate">{business?.businessName}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide truncate">
                  {business?.businessType?.toLowerCase()}
                </p>
              </div>
            </div>
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 mt-2" href="#">
            <Settings className="h-4 w-4" />
            Settings
          </a>
          <button 
            onClick={logout} 
            className="flex items-center gap-3 px-3 py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 text-left w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* TopNavBar */}
        <header className="sticky top-0 w-full z-30 h-[72px] flex justify-between items-center px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
          <div className="flex items-center md:hidden">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl">
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 max-w-xl mx-auto flex items-center justify-center">
            {activeTab === 'products' && (
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow shadow-sm" 
                  placeholder="Search products by SKU or Name..." 
                  type="text"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 ml-2 shadow-sm flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-sm select-none">
              {username?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Operations Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end pb-4 border-b border-slate-200/50 gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Operations</h1>
                <p className="text-slate-500 text-sm">
                  Manage products, stock changes, and marketplace lookups for <span className="font-bold text-blue-600">{business?.businessName}</span>.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTabChange('purchase')}
                  className={`h-10 px-4 rounded-xl font-semibold shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'purchase' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" /> Purchase Stock
                </Button>
                <Button 
                  onClick={() => handleTabChange('sell')}
                  className={`h-10 px-4 rounded-xl font-semibold shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'sell' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <MinusCircle className="h-4 w-4" /> Sell Stock
                </Button>
              </div>
            </div>

            {/* Custom Premium Tabs Navigation */}
            <div className="border-b border-slate-200 relative">
              <nav className="flex gap-6 overflow-x-auto no-scrollbar pb-0.5" aria-label="Tabs">
                <button
                  onClick={() => handleTabChange('products')}
                  className={`py-3 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap ${
                    activeTab === 'products' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => handleTabChange('purchase')}
                  className={`py-3 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap ${
                    activeTab === 'purchase' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
                  }`}
                >
                  Purchase Stock (Supplier)
                </button>
                <button
                  onClick={() => handleTabChange('sell')}
                  className={`py-3 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap ${
                    activeTab === 'sell' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
                  }`}
                >
                  Sell Stock (Buyer)
                </button>
                <button
                  onClick={() => handleTabChange('transfer')}
                  className={`py-3 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap ${
                    activeTab === 'transfer' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
                  }`}
                >
                  Internal Transfer
                </button>
                <button
                  onClick={() => handleTabChange('marketplace')}
                  className={`py-3 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap ${
                    activeTab === 'marketplace' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
                  }`}
                >
                  Search Marketplace
                </button>
                <button
                   onClick={() => { handleTabChange('requests'); fetchStockRequests(); }}
                   className={`py-3 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
                     activeTab === 'requests' 
                       ? 'border-indigo-600 text-indigo-600' 
                       : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
                   }`}
                 >
                   <Inbox className="h-3.5 w-3.5" />
                   Stock Requests
                   {stockRequests.filter(r => r.status === 'PENDING').length > 0 && (
                     <span className="ml-0.5 bg-red-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                       {stockRequests.filter(r => r.status === 'PENDING').length}
                     </span>
                   )}
                 </button>
              </nav>
            </div>

            {/* TAB PANELS */}
            <div className="relative">
              
              {/* TAB 1: ALL PRODUCTS / INVENTORY LISTING */}
              {activeTab === 'products' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Toolbar */}
                  <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {/* Search for mobile/tablet */}
                      <div className="relative flex-1 min-w-[200px] md:hidden">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" 
                          placeholder="Search SKU or Name..." 
                          type="text"
                        />
                      </div>
                      
                      {/* Category Filter */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 shrink-0">
                        <Filter className="h-3.5 w-3.5 text-slate-400" />
                        <select 
                          value={selectedCategoryFilter}
                          onChange={(e) => {
                            setSelectedCategoryFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none border-none p-0 pr-6"
                        >
                          <option value="ALL">All Categories</option>
                          {categoriesList.map(cat => (
                            <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                          ))}
                        </select>
                      </div>

                      {/* Stock Status Filter */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 shrink-0">
                        <Boxes className="h-3.5 w-3.5 text-slate-400" />
                        <select 
                          value={stockStatusFilter}
                          onChange={(e) => {
                            setStockStatusFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none border-none p-0 pr-6"
                        >
                          <option value="ALL">All Stock Levels</option>
                          <option value="IN_STOCK">In Stock</option>
                          <option value="LOW_STOCK">Low Stock</option>
                          <option value="OUT_OF_STOCK">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <Button 
                        variant="outline" 
                        onClick={fetchInventory} 
                        className="h-10 px-3.5 border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm flex items-center gap-2 active:scale-95 duration-100"
                        title="Refresh"
                      >
                        <RefreshCw className={`h-4 w-4 ${inventoryLoading ? 'animate-spin' : ''}`} />
                        <span className="text-xs font-bold text-slate-600">Refresh</span>
                      </Button>
                    </div>
                  </div>

                  {/* Loading Skeleton */}
                  {inventoryLoading ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                      <Skeleton className="h-8 w-1/3 rounded-lg" />
                      <Skeleton className="h-40 w-full rounded-xl" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  ) : inventoryError ? (
                    /* Error State */
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-800 space-y-3">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                      <h3 className="font-bold text-lg">Failed to Retrieve Inventory</h3>
                      <p className="text-sm text-red-655 max-w-md mx-auto">{inventoryError}</p>
                      <Button onClick={fetchInventory} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                        Retry
                      </Button>
                    </div>
                  ) : processedInventory.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-4 shadow-sm">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                        <Package className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-slate-800">No Inventory Items</h3>
                        <p className="text-sm text-slate-400 max-w-sm mx-auto">
                          This business doesn't have any products in stock yet. Go to the "Purchase Stock" tab to add your first supplier stock!
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleTabChange('purchase')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 h-10 shadow-md inline-flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add First Stock
                      </Button>
                    </div>
                  ) : (
                    /* Responsive Table & List Card View */
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-55/60 border-b border-slate-200/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              <th className="px-6 py-4">Product Image</th>
                              <th 
                                onClick={() => {
                                  setSortField('name');
                                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                                className="px-6 py-4 cursor-pointer hover:text-slate-700 select-none"
                              >
                                <div className="flex items-center gap-1">
                                  Product Name
                                  <ArrowUpDown className="h-3 w-3 shrink-0" />
                                </div>
                              </th>
                              <th 
                                onClick={() => {
                                  setSortField('sku');
                                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                                className="px-6 py-4 cursor-pointer hover:text-slate-700 select-none"
                              >
                                <div className="flex items-center gap-1">
                                  SKU
                                  <ArrowUpDown className="h-3 w-3 shrink-0" />
                                </div>
                              </th>
                              <th className="px-6 py-4">Variant</th>
                              <th 
                                onClick={() => {
                                  setSortField('quantity');
                                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                                className="px-6 py-4 text-right cursor-pointer hover:text-slate-700 select-none"
                              >
                                <div className="flex items-center gap-1 justify-end">
                                  Quantity
                                  <ArrowUpDown className="h-3 w-3 shrink-0" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-right">Reorder Level</th>
                              <th 
                                onClick={() => {
                                  setSortField('price');
                                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                                className="px-6 py-4 text-right cursor-pointer hover:text-slate-700 select-none"
                              >
                                <div className="flex items-center gap-1 justify-end">
                                  Sell Price
                                  <ArrowUpDown className="h-3 w-3 shrink-0" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-center">Status</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {paginatedInventory.map((item) => {
                              const qty = item.quantity || 0;
                              const reorder = item.reorderLevel || 0;
                              const statusDetails = getStockStatus(qty, reorder);

                              // format variant signature into tags or readable text
                              const signature = item.productVariant?.variantSignature || '';
                              const formattedSig = signature
                                ? signature.split('|').map(pair => pair.split(':')[1]).join(' / ')
                                : 'Default';

                              return (
                                <tr 
                                  key={item.inventoryId}
                                  onClick={() => setSelectedItemDetail(item)}
                                  className="hover:bg-slate-50/50 cursor-pointer transition-colors duration-150 group"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200/50 group-hover:scale-105 duration-200">
                                      <span className="text-[10px] text-slate-400 font-bold uppercase">Image</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-slate-800">
                                    {item.productVariant?.product?.productName}
                                    <div className="text-xs text-slate-400 font-normal mt-0.5">
                                      {item.productVariant?.product?.brand}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-slate-600">
                                    {item.productVariant?.sku}
                                  </td>
                                  <td className="px-6 py-4 text-slate-500 truncate max-w-[120px]">
                                    <span className="bg-slate-100 border border-slate-200 text-xs px-2 py-0.5 rounded-md font-medium text-slate-650">
                                      {formattedSig}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                                    {qty.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono text-slate-550">
                                    {reorder}
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                                    ${(item.productVariant?.currentPrice || 0).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusDetails.color}`}>
                                      {statusDetails.label}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <Button 
                                      variant="ghost" 
                                      className="p-1 h-8 w-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 duration-100 inline-flex items-center justify-center"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItemDetail(item);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500">
                          Showing {Math.min(processedInventory.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(processedInventory.length, currentPage * itemsPerPage)} of {processedInventory.length} products
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="h-8 border-slate-200 rounded-lg text-[10px] font-bold uppercase shadow-sm"
                          >
                            Prev
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 border-slate-200 rounded-lg text-[10px] font-bold uppercase shadow-sm"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PURCHASE STOCK FORM */}
              {activeTab === 'purchase' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  {/* Form Block */}
                  <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Stock Purchase</h2>
                    <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Supplier Name *</label>
                          <input 
                            required
                            type="text"
                            value={purchaseForm.supplierName}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, supplierName: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="Supplier or distributor name"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Category *</label>
                          <select 
                            required
                            value={purchaseForm.categoryId}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, categoryId: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                          >
                            <option value="">Select product category</option>
                            {categoriesList.map(cat => (
                              <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                        <div className="flex flex-col gap-1 md:col-span-2">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Product Name *</label>
                          <input 
                            required
                            type="text"
                            value={purchaseForm.productName}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, productName: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="e.g. Rice, Laptop, Smartwatch"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Brand Name</label>
                          <input 
                            type="text"
                            value={purchaseForm.brand}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, brand: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="Brand name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">SKU Code *</label>
                          <input 
                            required
                            type="text"
                            value={purchaseForm.sku}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, sku: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow font-mono text-xs uppercase"
                            placeholder="SKU-XXXXXX"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Unit Type *</label>
                          <select 
                            required
                            value={purchaseForm.unitType}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, unitType: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                          >
                            {unitTypes.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Unit Value *</label>
                          <input 
                            required
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={purchaseForm.unitValue}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, unitValue: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="1"
                          />
                        </div>
                      </div>

                      {/* Render Dynamic Category Attributes */}
                      {dynamicCategoryAttributes.length > 0 && (
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <label className="text-[10px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> Category Specific Attributes
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dynamicCategoryAttributes.map(attr => (
                              <div key={attr.attributKey} className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                  {attr.attributKey}
                                </label>
                                {attr.dataType === 'BOOLEAN' ? (
                                  <div className="flex items-center h-10 px-1">
                                    <input 
                                      type="checkbox"
                                      checked={!!purchaseAttributes[attr.attributKey]}
                                      onChange={(e) => setPurchaseAttributes(prev => ({ ...prev, [attr.attributKey]: e.target.checked }))}
                                      className="h-4.5 w-4.5 text-blue-600 rounded border-slate-350 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="text-xs text-slate-550 ml-2">Enabled</span>
                                  </div>
                                ) : (
                                  <input 
                                    type={attr.dataType === 'NUMBER' ? 'number' : 'text'}
                                    value={purchaseAttributes[attr.attributKey] || ''}
                                    onChange={(e) => setPurchaseAttributes(prev => ({ ...prev, [attr.attributKey]: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                                    placeholder={`Enter ${attr.attributKey}`}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Quantity *</label>
                          <input 
                            required
                            type="number"
                            min="1"
                            value={purchaseForm.quantity}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, quantity: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="1"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Supplier Price (Buy) *</label>
                          <input 
                            required
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={purchaseForm.unitPrice}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="$0.00"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Retail Price (Sell) *</label>
                          <input 
                            required
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={purchaseForm.currentPrice}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, currentPrice: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="$0.00"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Reorder Level *</label>
                          <input 
                            required
                            type="number"
                            min="1"
                            value={purchaseForm.reorderLevel}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, reorderLevel: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="5"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Remarks</label>
                        <textarea 
                          value={purchaseForm.remark}
                          onChange={(e) => setPurchaseForm(prev => ({ ...prev, remark: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow h-20 resize-none"
                          placeholder="Special shipping instructions or annotations..."
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleTabChange('products')}
                          className="h-11 px-6 rounded-xl border-slate-200 hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={purchaseLoading}
                          className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/10 active:scale-98 duration-100"
                        >
                          {purchaseLoading ? 'Processing...' : 'Purchase Stock'}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Summary card side column */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6 h-fit">
                    <h3 className="font-headline-md text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                      Purchase Summary
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450">Product Name</span>
                        <span className="font-bold text-slate-800 truncate max-w-[150px]">{purchaseForm.productName || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450">SKU Code</span>
                        <span className="font-mono text-xs text-slate-600">{purchaseForm.sku || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450">Total Quantity</span>
                        <span className="font-mono font-bold text-slate-800">{parseInt(purchaseForm.quantity || 0).toLocaleString()} Unit(s)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450">Supplier Unit Price</span>
                        <span className="font-mono font-bold text-slate-800">${parseFloat(purchaseForm.unitPrice || 0).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-base">
                        <span className="font-bold text-slate-900">Total Purchase Cost</span>
                        <span className="font-mono font-black text-blue-600">
                          ${(parseFloat(purchaseForm.unitPrice || 0) * parseInt(purchaseForm.quantity || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SELL STOCK FORM */}
              {activeTab === 'sell' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  {/* Form Block */}
                  <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Sell Stock</h2>
                    <form onSubmit={handleSellSubmit} className="space-y-4">
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Customer Name *</label>
                        <input 
                          required
                          type="text"
                          value={sellForm.customerName}
                          onChange={(e) => setSellForm(prev => ({ ...prev, customerName: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                          placeholder="Client or buyer name"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Product Variant *</label>
                          <select 
                            required
                            value={sellForm.variantId}
                            onChange={(e) => {
                              const variant = e.target.value;
                              const match = inventoryList.find(i => String(i.productVariant?.variantId) === String(variant));
                              setSellForm(prev => ({ 
                                ...prev, 
                                variantId: variant,
                                unitPrice: match ? match.productVariant?.currentPrice || '' : ''
                              }));
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                          >
                            <option value="">Select variant from stock</option>
                            {inventoryList.map(item => {
                              const signature = item.productVariant?.variantSignature || '';
                              const formattedSig = signature
                                ? signature.split('|').map(pair => pair.split(':')[1]).join('/')
                                : 'Default';
                              return (
                                <option key={item.productVariant?.variantId} value={item.productVariant?.variantId}>
                                  {item.productVariant?.product?.productName} ({formattedSig}) — SKU: {item.productVariant?.sku}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Quantity *</label>
                            <input 
                              required
                              type="number"
                              min="1"
                              value={sellForm.quantity}
                              onChange={(e) => setSellForm(prev => ({ ...prev, quantity: e.target.value }))}
                              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                              placeholder="1"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Unit Sale Price ($) *</label>
                            <input 
                              required
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={sellForm.unitPrice}
                              onChange={(e) => setSellForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                              placeholder="$0.00"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Remarks</label>
                        <textarea 
                          value={sellForm.remark}
                          onChange={(e) => setSellForm(prev => ({ ...prev, remark: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow h-20 resize-none"
                          placeholder="Sale comments or delivery annotations..."
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleTabChange('products')}
                          className="h-11 px-6 rounded-xl border-slate-200 hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={sellLoading}
                          className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/10 active:scale-98 duration-100"
                        >
                          {sellLoading ? 'Processing...' : 'Sell Stock'}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Stock Preview Side Column */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6 h-fit">
                    <h3 className="font-headline-md text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                      Stock Level Resolution
                    </h3>
                    {selectedVariantDetails ? (
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-450">Currently Available</span>
                          <span className="font-mono font-bold text-slate-800">{selectedVariantDetails.quantity} Unit(s)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-450">Sale Quantity</span>
                          <span className="font-mono font-bold text-slate-850">-{sellForm.quantity || 0} Unit(s)</span>
                        </div>
                        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                          <span className="text-slate-450">Remaining Post Sale</span>
                          <span className={`font-mono font-black ${
                            selectedVariantDetails.quantity - (parseInt(sellForm.quantity || 0)) < 0 
                              ? 'text-red-600' 
                              : 'text-slate-800'
                          }`}>
                            {selectedVariantDetails.quantity - (parseInt(sellForm.quantity || 0))} Unit(s)
                          </span>
                        </div>

                        {/* Insufficient Stock Warning Alert */}
                        {selectedVariantDetails.quantity - (parseInt(sellForm.quantity || 0)) < 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-xs text-red-800 mt-2">
                            <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Insufficient Inventory</p>
                              <p className="text-red-655 mt-0.5">You cannot sell more than the currently available quantity of this item.</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-base">
                          <span className="font-bold text-slate-900">Total Transaction Value</span>
                          <span className="font-mono font-black text-indigo-650">
                            ${(parseFloat(sellForm.unitPrice || 0) * parseInt(sellForm.quantity || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs text-center py-4">
                        Please select a product variant to view live stock details and invoice pricing.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: INTERNAL TRANSFER FORM */}
              {activeTab === 'transfer' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  {/* Form Block */}
                  <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Internal Stock Transfer</h2>
                    <form onSubmit={handleTransferSubmit} className="space-y-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Destination Business *</label>
                          <select 
                            required
                            value={transferForm.toBusinessId}
                            onChange={(e) => setTransferForm(prev => ({ ...prev, toBusinessId: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                          >
                            <option value="">Select target branch/warehouse</option>
                            {/* Filter out current active business */}
                            {businessesList
                              .filter(b => String(b.businessId) !== String(business.businessId))
                              .map(b => (
                                <option key={b.businessId} value={b.businessId}>
                                  {b.businessName} ({b.city}, {b.country}) — {b.businessType}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Product Variant to Transfer *</label>
                          <select 
                            required
                            value={transferForm.productVariantId}
                            onChange={(e) => {
                              const variant = e.target.value;
                              const match = inventoryList.find(i => String(i.productVariant?.variantId) === String(variant));
                              setTransferForm(prev => ({ 
                                ...prev, 
                                productVariantId: variant,
                                unitPrice: match ? match.productVariant?.currentPrice || '' : ''
                              }));
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                          >
                            <option value="">Select variant from stock</option>
                            {inventoryList.map(item => {
                              const signature = item.productVariant?.variantSignature || '';
                              const formattedSig = signature
                                ? signature.split('|').map(pair => pair.split(':')[1]).join('/')
                                : 'Default';
                              return (
                                <option key={item.productVariant?.variantId} value={item.productVariant?.variantId}>
                                  {item.productVariant?.product?.productName} ({formattedSig}) — SKU: {item.productVariant?.sku}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Quantity *</label>
                          <input 
                            required
                            type="number"
                            min="1"
                            value={transferForm.quantity}
                            onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="1"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Transfer Unit Price ($) *</label>
                          <input 
                            required
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={transferForm.unitPrice}
                            onChange={(e) => setTransferForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            placeholder="$0.00"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Remarks</label>
                        <textarea 
                          value={transferForm.remark}
                          onChange={(e) => setTransferForm(prev => ({ ...prev, remark: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow h-20 resize-none"
                          placeholder="Transfer instructions or annotations..."
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleTabChange('products')}
                          className="h-11 px-6 rounded-xl border-slate-200 hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={transferLoading}
                          className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/10 active:scale-98 duration-100"
                        >
                          {transferLoading ? 'Processing...' : 'Transfer Stock'}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Transfer Summary side card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6 h-fit">
                    <h3 className="font-headline-md text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                      Transfer Resolution
                    </h3>
                    {selectedTransferVariantDetails ? (
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-450">Currently Available</span>
                          <span className="font-mono font-bold text-slate-800">{selectedTransferVariantDetails.quantity} Unit(s)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-450">Transfer Quantity</span>
                          <span className="font-mono font-bold text-slate-850">-{transferForm.quantity || 0} Unit(s)</span>
                        </div>
                        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                          <span className="text-slate-450">Remaining Post Transfer</span>
                          <span className={`font-mono font-black ${
                            selectedTransferVariantDetails.quantity - (parseInt(transferForm.quantity || 0)) < 0 
                              ? 'text-red-600' 
                              : 'text-slate-800'
                          }`}>
                            {selectedTransferVariantDetails.quantity - (parseInt(transferForm.quantity || 0))} Unit(s)
                          </span>
                        </div>

                        {/* Insufficient Stock Warning Alert */}
                        {selectedTransferVariantDetails.quantity - (parseInt(transferForm.quantity || 0)) < 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-xs text-red-800 mt-2">
                            <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Insufficient Stock</p>
                              <p className="text-red-655 mt-0.5">You cannot transfer more stock than you currently hold.</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-base">
                          <span className="font-bold text-slate-900">Est. Transfer Value</span>
                          <span className="font-mono font-black text-blue-600">
                            ${(parseFloat(transferForm.unitPrice || 0) * parseInt(transferForm.quantity || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs text-center py-4">
                        Please select a variant to view branch-to-branch logistics details.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: MARKETPLACE SEARCH */}
              {activeTab === 'marketplace' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Search Section */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Cross-Business Product Lookup</h2>
                    <p className="text-slate-400 text-xs max-w-xl">
                      Discover available stock across other businesses in the network. Enter a product name to search.
                    </p>
                    <form onSubmit={handleMarketplaceSearch} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                        <input 
                          required
                          value={marketplaceQuery}
                          onChange={(e) => setMarketplaceQuery(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow shadow-inner" 
                          placeholder="Search product name... (e.g. Rice, Laptop, Smartwatch)" 
                          type="text"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={marketplaceLoading}
                        className="px-6 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md active:scale-95 duration-100"
                      >
                        {marketplaceLoading ? 'Searching...' : 'Search'}
                      </Button>
                    </form>
                  </div>

                  {/* Search Results */}
                  {marketplaceLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Skeleton className="h-44 w-full rounded-2xl" />
                      <Skeleton className="h-44 w-full rounded-2xl" />
                      <Skeleton className="h-44 w-full rounded-2xl" />
                    </div>
                  ) : marketplaceResults.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Search className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-700 mt-4">No Marketplace Results</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Type a product name above to discover available stock in the network.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {marketplaceResults.map((result, idx) => (
                        <div 
                          key={idx}
                          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs font-bold font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                                SKU: {result.sku}
                              </span>
                              <Badge className="bg-blue-50 border border-blue-100 text-blue-700 font-bold hover:bg-blue-50">
                                ${result.currentPrice.toFixed(2)}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-base">{result.productName}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mt-0.5">
                                <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                                {result.businessName}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Available Stock</p>
                              <p className="font-mono text-sm font-black text-slate-800">{result.quantity} Unit(s)</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button 
                                size="sm"
                                onClick={() => openRequestModal(result)}
                                className="h-8 text-[10px] font-bold bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center gap-1"
                              >
                                <Send className="h-3 w-3" /> Request
                              </Button>

                              <Button 
                                size="sm"
                                onClick={() => toast.info('Messaging conversation coming in messaging phase!')}
                                className="h-8 text-[10px] font-bold bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1"
                              >
                                <MessageSquare className="h-3 w-3" /> Chat
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      </main>


              {/* TAB 6: STOCK REQUESTS INBOX */}
              {activeTab === 'requests' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Stock Requests Inbox</h2>
                      <p className="text-slate-400 text-xs mt-0.5">Manage incoming stock requests from other businesses.</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={fetchStockRequests}
                      className="h-9 px-3 border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${stockRequestsLoading ? 'animate-spin' : ''}`} />
                      <span className="text-xs font-bold">Refresh</span>
                    </Button>
                  </div>

                  {stockRequestsLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                    </div>
                  ) : stockRequests.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                        <Inbox className="h-7 w-7 text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-base text-slate-700 mt-4">No Stock Requests</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Stock requests from other businesses will appear here. You can also create requests from Marketplace Search.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stockRequests.map((req, idx) => {
                        const isPending = req.status === 'PENDING' || !req.status;
                        const isApproved = req.status === 'APPROVED';
                        const isRejected = req.status === 'REJECTED';
                        const isUpdating = updatingRequestId === req.requestId || updatingRequestId === idx;

                        return (
                          <div
                            key={req.requestId || idx}
                            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                <ClipboardList className="h-5 w-5 text-indigo-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-800">Variant ID: {req.productVariantId}</span>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                    isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                    {req.status || 'PENDING'}
                                  </span>
                                </div>
                                <div className="flex gap-4 mt-1 text-xs text-slate-500 flex-wrap">
                                  <span>From Business: <strong className="text-slate-700">{req.fromBusinessId}</strong></span>
                                  <span>To Business: <strong className="text-slate-700">{req.toBusinessId}</strong></span>
                                  <span>Qty: <strong className="text-slate-700">{req.quantity}</strong></span>
                                  <span>Offered: <strong className="text-slate-700">${(req.offeredUnitPrice || 0).toFixed ? (req.offeredUnitPrice).toFixed(2) : req.offeredUnitPrice}/unit</strong></span>
                                </div>
                              </div>
                            </div>

                            {isPending && (
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStockRequest(req.requestId || idx, 'APPROVED')}
                                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  {isUpdating ? 'Processing...' : 'Approve'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStockRequest(req.requestId || idx, 'REJECTED')}
                                  className="h-9 px-4 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-1.5"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {!isPending && (
                              <span className={`text-xs font-bold ${isApproved ? 'text-emerald-600' : 'text-red-500'}`}>
                                {isApproved ? '✓ Fulfilled' : '✗ Rejected'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}


      {/* STOCK REQUEST MODAL */}
      {requestModalOpen && requestTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setRequestModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 z-10 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Request Stock</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  From <strong className="text-slate-600">{requestTarget.businessName}</strong>
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setRequestModalOpen(false)}
                className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-50 p-0 flex items-center justify-center shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Product summary */}
            <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-100">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Product</p>
                  <p className="font-bold text-slate-800">{requestTarget.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">SKU</p>
                  <p className="font-mono text-slate-600">{requestTarget.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Available</p>
                  <p className="font-mono font-bold text-slate-800">{requestTarget.quantity} units</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleStockRequestSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Quantity *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max={requestTarget.quantity}
                    value={requestForm.quantity}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="1"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Offered Price/unit *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={requestForm.offeredUnitPrice}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, offeredUnitPrice: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Total preview */}
              {requestForm.quantity && requestForm.offeredUnitPrice && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-xs text-blue-700 font-semibold">Total Offer</span>
                  <span className="font-mono font-black text-blue-700">
                    ${(parseFloat(requestForm.offeredUnitPrice || 0) * parseInt(requestForm.quantity || 0)).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRequestModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={requestLoading}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  {requestLoading ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED OVERLAY DRAWER PANEL */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedItemDetail(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn" 
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slideOver border-l border-slate-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  SKU: {selectedItemDetail.productVariant?.sku}
                </span>
                <h3 className="font-black text-slate-900 text-lg leading-tight mt-0.5">
                  {selectedItemDetail.productVariant?.product?.productName}
                </h3>
              </div>
              <Button 
                variant="ghost"
                onClick={() => setSelectedItemDetail(null)}
                className="h-9 w-9 rounded-full text-slate-400 hover:bg-slate-50 flex items-center justify-center p-0 shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Details Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Product Info Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Info</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Brand</p>
                    <p className="text-sm font-bold text-slate-800">{selectedItemDetail.productVariant?.product?.brand || 'Generic'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Category</p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedItemDetail.productVariant?.product?.category?.categoryName || 'General'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant attributes JSON grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Variant Specifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 border border-slate-200/40 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-450 uppercase font-semibold">Unit Type</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedItemDetail.productVariant?.unitType}</p>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-200/40 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-450 uppercase font-semibold">Unit Value</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedItemDetail.productVariant?.unitValue}</p>
                  </div>
                  
                  {selectedItemDetail.productVariant?.attributes && 
                    Object.entries(selectedItemDetail.productVariant.attributes).map(([key, val]) => (
                      <div key={key} className="bg-slate-50/50 border border-slate-200/40 p-3 rounded-lg">
                        <p className="text-[10px] text-slate-450 uppercase font-semibold">{key}</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                        </p>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Live stock values */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Valuation</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Available Quantity</span>
                    <span className="font-mono font-bold text-slate-800">{selectedItemDetail.quantity} Unit(s)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Reorder Threshold</span>
                    <span className="font-mono font-bold text-slate-800">{selectedItemDetail.reorderLevel} Unit(s)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Unit Retail Price</span>
                    <span className="font-mono font-bold text-slate-800">${(selectedItemDetail.productVariant?.currentPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-slate-500 font-semibold">Total Stock Valuation</span>
                    <span className="font-mono font-black text-blue-600">
                      ${(selectedItemDetail.quantity * (selectedItemDetail.productVariant?.currentPrice || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity placeholder */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Activity</h4>
                <div className="relative pl-4 border-l border-slate-200 space-y-4 text-xs ml-1">
                  <div>
                    <div className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white" />
                    <p className="font-bold text-slate-700">Initial Stock Added</p>
                    <p className="text-slate-400 mt-0.5">Purchased from external supplier</p>
                    <p className="text-[10px] text-slate-350 mt-0.5">System creation</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-slate-100 flex gap-2">
              <Button 
                onClick={() => {
                  setSellForm(prev => ({ ...prev, variantId: String(selectedItemDetail.productVariant?.variantId) }));
                  setSelectedItemDetail(null);
                  handleTabChange('sell');
                }}
                className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
              >
                Sell Stock
              </Button>
              <Button 
                onClick={() => {
                  setTransferForm(prev => ({ ...prev, productVariantId: String(selectedItemDetail.productVariant?.variantId) }));
                  setSelectedItemDetail(null);
                  handleTabChange('transfer');
                }}
                variant="outline"
                className="flex-1 h-11 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Transfer
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
