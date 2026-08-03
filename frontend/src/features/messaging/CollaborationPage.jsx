import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getBusinessId } from '@/utils/tokenStorage';
import { businessApi } from '@/api/business.api';
import { messagingApi } from '@/api/messaging.api';
import { inventoryApi } from '@/api/inventory.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
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
  Send,
  MessageSquare,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  ChevronRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Activity,
  History,
  X,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

export const CollaborationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, selectedBusinessId, logout, initializeUserBusiness } = useAuth();

  // Active Business context
  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);

  // Conversations & messaging
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Negotiation / request context
  const [activeRequest, setActiveRequest] = useState(null);
  const [negotiationSummary, setNegotiationSummary] = useState(null);
  const [otherBusinessInventory, setOtherBusinessInventory] = useState([]);
  const [loadingContext, setLoadingContext] = useState(false);

  // WebSockets / live features
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [typing, setTyping] = useState(false);
  const stompClientRef = useRef(null);

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, UNREAD, NEGOTIATIONS
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // Responsive UI toggles
  const [showLeftSidebarMobile, setShowLeftSidebarMobile] = useState(false);
  const [showRightSidebarMobile, setShowRightSidebarMobile] = useState(false);

  // Counter offer state
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');

  // ─── 1. Resolve Active Business ───────────────────────────────────────────
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

  // ─── 2. Fetch Conversations Summary ────────────────────────────────────────
  const fetchConversations = useCallback(async (selectId = null) => {
    if (!business) return;
    try {
      setLoadingConv(true);
      const data = await messagingApi.getConversations();
      setConversations(data || []);

      // If active conversation is not selected, try to restore or select the first one
      if (selectId) {
        const match = data.find((c) => c.conversationId === selectId);
        if (match) setActiveConv(match);
      } else if (data.length > 0 && !activeConv) {
        setActiveConv(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConv(false);
    }
  }, [business, activeConv]);

  useEffect(() => {
    if (business) {
      fetchConversations();
    }
  }, [business]);

  // ─── 3. Handle Navigation State Entry (Marketplace Search -> Chat) ──────────
  useEffect(() => {
    if (business && location.state && location.state.otherBusinessId) {
      const { otherBusinessId, otherBusinessName, startProduct } = location.state;
      
      // Clear location state to prevent loop on refreshes
      window.history.replaceState({}, document.title);

      // Check if conversation already exists
      const match = conversations.find((c) => c.otherBusinessId === otherBusinessId);
      if (match) {
        setActiveConv(match);
        if (startProduct) {
          setupNewProductNegotiation(startProduct);
        }
      } else {
        // Create temporary/mock conversation shell until first message is sent
        const tempConv = {
          conversationId: null, // null triggers creation on sendMessage
          otherBusinessId,
          otherBusinessName,
          lastMessage: startProduct ? `Hi, I am interested in requesting ${startProduct.productName}` : 'Starting conversation...',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isTemporary: true,
        };
        setConversations((prev) => [tempConv, ...prev]);
        setActiveConv(tempConv);
        if (startProduct) {
          setupNewProductNegotiation(startProduct);
        }
      }
    }
  }, [business, location.state, conversations]);

  const setupNewProductNegotiation = (product) => {
    setActiveRequest({
      productVariantId: product.variantId,
      sku: product.sku,
      productName: product.productName,
      quantity: product.quantity,
      offeredUnitPrice: product.currentPrice,
      status: 'PENDING',
    });
    setNegotiationSummary({
      offeredPrice: product.currentPrice,
      quantity: product.quantity,
      total: product.currentPrice * product.quantity,
    });
  };

  // ─── 4. Fetch Message History & Context ─────────────────────────────────────
  const fetchMessages = useCallback(async (conv) => {
    if (!conv) return;
    try {
      setLoadingMessages(true);
      if (conv.isTemporary) {
        setMessages([]);
        setLoadingMessages(false);
        return;
      }
      const data = await messagingApi.getConversationMessages(conv.conversationId, 0, 50);
      // Backend returns newest first, reverse to display chronologically
      setMessages((data.content || []).reverse());
      
      // Mark as read
      if (data.content?.length > 0) {
        const lastMsg = data.content[0]; // first item in response content is newest
        await messagingApi.markAsRead(conv.conversationId, lastMsg.messageId);
        // Reset unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch {
      toast.error('Failed to load message history');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const fetchBusinessContext = useCallback(async (otherBusinessId) => {
    if (!otherBusinessId) return;
    try {
      setLoadingContext(true);
      // Fetch snapshot inventory of the other business
      const data = await inventoryApi.getInventory();
      // Filter list representing target business's stock (for demo fallback or specific mapping if we had cross-access)
      setOtherBusinessInventory(data.slice(0, 4));
    } catch {
      setOtherBusinessInventory([]);
    } finally {
      setLoadingContext(false);
    }
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv);
      fetchBusinessContext(activeConv.otherBusinessId);
      // Look for active stock requests with this business
      fetchActiveRequests(activeConv.otherBusinessId);
    }
  }, [activeConv, fetchMessages, fetchBusinessContext]);

  const fetchActiveRequests = async (otherId) => {
    try {
      const data = await inventoryApi.getStockRequests();
      // Find request between activeBusiness and otherBusiness
      const current = data?.find(
        (r) =>
          (r.fromBusinessId === business?.businessId && r.toBusinessId === otherId) ||
          (r.fromBusinessId === otherId && r.toBusinessId === business?.businessId)
      );
      if (current) {
        setActiveRequest(current);
        setNegotiationSummary({
          offeredPrice: current.offeredUnitPrice,
          quantity: current.quantity,
          total: current.offeredTotalPrice,
        });
      } else {
        setActiveRequest(null);
        setNegotiationSummary(null);
      }
    } catch {
      setActiveRequest(null);
    }
  };

  // ─── 5. WebSocket Connections (SockJS + STOMP) ──────────────────────────────────
  useEffect(() => {
    if (!business) return;

    setReconnecting(true);
    const socket = new SockJS('http://localhost:8000/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        'X-Business-Id': String(business.businessId),
      },
      debug: (str) => console.log('STOMP: ', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);
      setReconnecting(false);
      
      // Subscribe to private business notifications
      client.subscribe(`/user/queue/messages`, (msg) => {
        const payload = JSON.parse(msg.body);
        
        // Append message if it belongs to active conversation
        if (activeConv && payload.conversationId === activeConv.conversationId) {
          setMessages((prev) => [...prev, payload]);
          // Mark read
          messagingApi.markAsRead(activeConv.conversationId, payload.messageId);
        } else {
          // Play notification and increment unread count
          setConversations((prev) =>
            prev.map((c) =>
              c.conversationId === payload.conversationId
                ? { ...c, unreadCount: c.unreadCount + 1, lastMessage: payload.content, lastMessageTime: payload.sentAt }
                : c
            )
          );
        }
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
      setReconnecting(true);
    };

    client.onStompError = (frame) => {
      console.error('Broker error: ' + frame.body);
      setConnected(false);
      setReconnecting(true);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [business, activeConv]);

  // ─── 6. Message actions ───────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeConv) return;

    const payload = {
      conversationId: activeConv.isTemporary ? null : activeConv.conversationId,
      receiverBusinessId: activeConv.otherBusinessId,
      content: messageText,
      sentAt: new Date().toISOString(),
    };

    try {
      if (stompClientRef.current && connected) {
        stompClientRef.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(payload),
        });
        setMessageText('');
        // Refresh conversations to resolve temporary shell
        if (activeConv.isTemporary) {
          setTimeout(() => fetchConversations(), 1000);
        }
      } else {
        toast.error('Disconnected from chat server. Reconnecting...');
      }
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleUpdateStockRequest = async (status) => {
    if (!activeRequest) return;
    try {
      await inventoryApi.updateStockRequest(activeRequest.requestId, status);
      toast.success(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'}.`);
      fetchActiveRequests(activeConv.otherBusinessId);
    } catch (err) {
      toast.error(err?.message || 'Failed to update request.');
    }
  };

  const handleCounterOffer = async () => {
    if (!counterPrice || !activeRequest) return;
    // Counter offer implementation: sends counter negotiation message
    const payload = {
      conversationId: activeConv.conversationId,
      receiverBusinessId: activeConv.otherBusinessId,
      content: `[NEGOTIATION] Counter offered unit price: ₹${counterPrice} for ${activeRequest.quantity} units`,
      sentAt: new Date().toISOString(),
    };
    try {
      stompClientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(payload),
      });
      setCounterOpen(false);
      setCounterPrice('');
      toast.success('Counter offer sent!');
    } catch {
      toast.error('Failed to send counter offer');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Filter conversations list ──────────────────────────────────────────
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.otherBusinessName.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q);
    if (activeFilter === 'UNREAD') return matchesSearch && c.unreadCount > 0;
    if (activeFilter === 'NEGOTIATIONS') return matchesSearch && c.lastMessage?.includes('[NEGOTIATION]');
    return matchesSearch;
  });

  const isNegMsg = (content) => content?.startsWith('[NEGOTIATION]');
  const cleanMsgContent = (content) => content?.replace('[NEGOTIATION]', '').trim();

  return (
    <div className="font-sans text-slate-800 antialiased flex h-screen overflow-hidden bg-[#F8FAFC]">

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
          <button onClick={() => navigate(ROUTES.STOCK_HISTORY)} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left">
            <History className="h-4 w-4" /> Stock History
          </button>
          <button onClick={() => navigate(ROUTES.MESSAGING)} className="flex items-center gap-3 w-full px-3 py-2.5 bg-blue-50 text-blue-700 font-semibold rounded-xl transition-all text-left">
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

      {/* ── Main Workspace Area ─────────────────────────────────────────── */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* Reconnect Banner */}
        {reconnecting && (
          <div className="bg-amber-500 text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-2 z-50">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Reconnecting to negotiation server...
          </div>
        )}

        {/* 3-Column Desktop Layout */}
        <div className="flex-1 flex overflow-hidden">

          {/* ── LEFT SIDEBAR: Conversation List ─────────────────────────── */}
          <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
            {/* Search */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  placeholder="Search negotiated businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {['ALL', 'UNREAD', 'NEGOTIATIONS'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                      activeFilter === f
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingConv ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 space-y-2">
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                ))
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-2">
                  <MessageSquare className="h-10 w-10 text-slate-200 mx-auto" />
                  <p className="text-xs font-semibold">No discussions yet</p>
                  <Button
                    onClick={() => navigate(ROUTES.INVENTORY)}
                    size="sm"
                    className="mt-2 bg-blue-600 text-white text-[10px] rounded-lg"
                  >
                    Open Marketplace
                  </Button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = activeConv?.otherBusinessId === c.otherBusinessId;
                  return (
                    <div
                      key={c.otherBusinessId}
                      onClick={() => setActiveConv(c)}
                      className={`p-4 cursor-pointer transition-all flex items-start gap-3 relative ${
                        isActive ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100/50 border border-blue-200/50 flex items-center justify-center font-bold text-blue-700 shrink-0 shadow-sm">
                        {c.otherBusinessName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className="text-xs font-black text-slate-900 truncate pr-2">
                            {c.otherBusinessName}
                          </p>
                          {c.lastMessageTime && (
                            <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                              {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {isNegMsg(c.lastMessage) ? '📑 Counter offer received' : c.lastMessage}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black rounded-full h-4 min-w-4 flex items-center justify-center px-1 self-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── CENTER PANEL: Chat & Context Workspace ────────────────── */}
          <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
            {activeConv ? (
              <>
                {/* Top header */}
                <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                      {activeConv.otherBusinessName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 leading-tight">
                        {activeConv.otherBusinessName}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {connected ? 'Active workspace' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate(ROUTES.INVENTORY)}
                      size="sm"
                      variant="outline"
                      className="h-8 text-[10px] font-black rounded-lg border-slate-200 text-slate-700"
                    >
                      Marketplace
                    </Button>
                    <button
                      onClick={() => setShowRightSidebarMobile(!showRightSidebarMobile)}
                      className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                      <Sliders className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ── Current Request Banner ──────────────────────────── */}
                <div className="bg-white border-b border-slate-200/80 px-6 py-3 shrink-0 relative z-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {activeRequest ? (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 shrink-0">
                          <Package className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">
                              {activeRequest.productName || `Variant #${activeRequest.productVariantId}`}
                            </span>
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black">
                              {activeRequest.status || 'PENDING'}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            SKU: {activeRequest.sku || 'N/A'} · Qty: {activeRequest.quantity} · Price: ₹{activeRequest.offeredUnitPrice}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {activeRequest.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStockRequest('APPROVED')}
                              className="h-8 px-3 text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStockRequest('REJECTED')}
                              variant="outline"
                              className="h-8 px-3 text-[10px] font-black border-red-200 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCounterOpen(!counterOpen)}
                          className="h-8 px-3 text-[10px] font-black border-slate-200 text-slate-700 rounded-lg"
                        >
                          Counter Offer
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-xs flex items-center gap-2 py-1 font-medium">
                      <AlertCircle className="h-4 w-4 text-slate-300" />
                      <span>No active negotiation. Start by requesting stock in the Marketplace.</span>
                    </div>
                  )}
                </div>

                {/* Counter Offer Dialog Overlay */}
                {counterOpen && (
                  <div className="absolute inset-x-0 top-0 bg-white border-b border-blue-100 shadow-md p-4 z-20 space-y-3 animate-slideIn">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900">Propose Counter Offer</span>
                      <button onClick={() => setCounterOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Offered price per unit (₹)"
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={handleCounterOffer}
                        className="bg-blue-600 text-white rounded-xl text-xs px-4"
                      >
                        Send Counter
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── MESSAGE AREA ────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loadingMessages ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-3 w-1/3 rounded" />
                          <Skeleton className="h-10 w-2/3 rounded-xl" />
                        </div>
                      </div>
                    ))
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 h-full gap-2">
                      <MessageSquare className="h-12 w-12 text-slate-200" />
                      <p className="text-sm font-semibold">Beginning of discussion</p>
                      <p className="text-xs text-slate-400">Ask questions, negotiate terms, or finalize orders.</p>
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isMe = m.senderBusinessId === business?.businessId;
                      const isNegotiation = isNegMsg(m.content);
                      
                      return (
                        <div
                          key={m.messageId || idx}
                          className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                          style={{ animation: 'fadeUp 0.2s ease' }}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isMe ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {isMe ? 'ME' : activeConv.otherBusinessName.substring(0, 1).toUpperCase()}
                          </div>
                          
                          <div className="space-y-1">
                            {isNegotiation ? (
                              /* Premium Negotiation Card Widget */
                              <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-sm space-y-3 min-w-[280px]">
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Negotiation Offer</span>
                                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-black">
                                    Counter Offer
                                  </Badge>
                                </div>
                                <p className="text-xs font-bold text-slate-800">{cleanMsgContent(m.content)}</p>
                                <div className="flex gap-1.5 pt-2 border-t border-slate-100">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStockRequest('APPROVED')}
                                    className="flex-1 h-7 text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStockRequest('REJECTED')}
                                    variant="outline"
                                    className="flex-1 h-7 text-[9px] font-black border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* Standard bubble message */
                              <div className={`p-3 rounded-2xl shadow-sm text-xs leading-relaxed ${
                                isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/60'
                              }`}>
                                <p>{m.content}</p>
                              </div>
                            )}

                            <p className="text-[9px] text-slate-400 font-medium text-right">
                              {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── MESSAGE COMPOSER ────────────────────────────────────── */}
                <form
                  onSubmit={handleSendMessage}
                  className="bg-white border-t border-slate-200/80 px-6 py-4 shrink-0 flex items-center gap-3 relative z-10"
                >
                  <input
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm placeholder-slate-400"
                    placeholder="Discuss pricing, availability or delivery..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 p-6">
                <MessageSquare className="h-16 w-16 text-slate-200" />
                <h3 className="font-bold text-slate-700 text-base">Select a discussion</h3>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Pick a conversation from the sidebar or click **Chat** on a business card in the Marketplace to begin negotiation.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR: Business Profile & Context Details ────────── */}
          {activeConv && (
            <div className={`w-80 border-l border-slate-200 bg-white flex flex-col h-full shrink-0 ${
              showRightSidebarMobile ? 'fixed inset-y-0 right-0 z-50 shadow-2xl animate-slideInRight' : 'hidden lg:flex'
            }`}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="font-black text-slate-900 text-sm">Business Profile</h3>
                {showRightSidebarMobile && (
                  <button onClick={() => setShowRightSidebarMobile(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Header profile */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center font-black text-indigo-700 text-xl shadow-md">
                    {activeConv.otherBusinessName.substring(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-black text-slate-900 text-base">{activeConv.otherBusinessName}</h4>
                  <Badge className="bg-slate-100 text-slate-600 border border-slate-200/80 text-[10px] font-bold">
                    other business
                  </Badge>
                </div>

                {/* Snapshot inventory list */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inventory Snapshot</p>
                  {loadingContext ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full rounded-xl" />
                      <Skeleton className="h-8 w-full rounded-xl" />
                    </div>
                  ) : otherBusinessInventory.length === 0 ? (
                    <p className="text-xs text-slate-400">No inventory information available</p>
                  ) : (
                    <div className="space-y-2">
                      {otherBusinessInventory.map((item) => (
                        <div key={item.inventoryId} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl hover:bg-slate-100/50 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.productVariant?.product?.productName}</p>
                            <p className="text-[9px] text-slate-400 font-mono">{item.productVariant?.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-800">{item.quantity} Qty</p>
                            <p className="text-[9px] text-indigo-600 font-bold">₹{item.productVariant?.currentPrice}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Request Lifecycle</p>
                  <div className="relative pl-5 space-y-4 mt-2">
                    {[
                      { label: 'Request Created', checked: true },
                      { label: 'Negotiation Active', checked: !!activeRequest },
                      { label: 'Approved by Owner', checked: activeRequest?.status === 'APPROVED' },
                      { label: 'Transfer Completed', checked: activeRequest?.status === 'APPROVED' && false /* demo */ },
                    ].map((step, idx) => (
                      <div key={idx} className="relative flex items-center">
                        <div className={`absolute -left-5 w-2.5 h-2.5 rounded-full ring-2 ring-white z-10 ${
                          step.checked ? 'bg-indigo-600' : 'bg-slate-200'
                        }`} />
                        {idx < 3 && (
                          <div className="absolute -left-[14px] top-3 h-full w-px bg-slate-200" />
                        )}
                        <p className={`text-xs ${step.checked ? 'font-bold text-slate-800' : 'text-slate-400 font-medium'}`}>
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* Global CSS for sliding drawers */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.25s ease;
        }
      `}</style>
    </div>
  );
};
