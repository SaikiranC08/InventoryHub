import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getAccessToken, getBusinessId } from '@/utils/tokenStorage';

import { businessApi } from '@/api/business.api';
import { messagingApi } from '@/api/messaging.api';
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
  LogOut,
  Search,
  Send,
  MessageSquare,
  Package,
  Loader2,
  Menu,
  X,
  ChevronLeft,
  History,
  ArrowUpDown,
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

  // Pagination for WhatsApp infinite scroll on scroll up
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // WebSockets / live features
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const stompClientRef = useRef(null);

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, UNREAD
  const [messageText, setMessageText] = useState('');

  // Mobile sidebar toggle
  const [showLeftSidebarMobile, setShowLeftSidebarMobile] = useState(false);

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

  // Ref to track latest active conversation in callbacks without causing reconnect loops
  const activeConvRef = useRef(activeConv);
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // ─── 2. Fetch Conversations Summary ────────────────────────────────────────
  const fetchConversations = useCallback(async (selectId = null) => {
    if (!business) return;
    try {
      setLoadingConv(true);
      const data = await messagingApi.getConversations();
      setConversations(data || []);

      if (selectId) {
        const match = data.find((c) => c.conversationId === selectId);
        if (match) setActiveConv(match);
      }
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConv(false);
    }
  }, [business]);

  useEffect(() => {
    if (business) {
      fetchConversations();
    }
  }, [business]);

  // ─── 3. Handle Navigation State Entry (Marketplace Search -> Chat) ──────────
  useEffect(() => {
    if (business && location.state && location.state.otherBusinessId) {
      const { otherBusinessId, otherBusinessName } = location.state;

      // Clear location state to prevent duplicate creation on refreshes
      window.history.replaceState({}, document.title);

      // Check if conversation already exists
      const match = conversations.find((c) => c.otherBusinessId === otherBusinessId);
      if (match) {
        setActiveConv(match);
      } else {
        // Create temporary conversation shell until first message is sent
        const tempConv = {
          conversationId: null,
          otherBusinessId,
          otherBusinessName,
          lastMessage: 'Starting conversation...',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isTemporary: true,
        };
        setConversations((prev) => [tempConv, ...prev]);
        setActiveConv(tempConv);
      }
    }
  }, [business, location.state, conversations]);

  // ─── 4. Fetch Message History (Page 0) ──────────────────────────────────
  const fetchMessages = useCallback(async (conv) => {
    if (!conv) return;
    try {
      setLoadingMessages(true);
      setPage(0);
      setHasMore(true);

      if (conv.isTemporary) {
        setMessages([]);
        setLoadingMessages(false);
        return;
      }

      // Fetch page 0 with size 20
      const data = await messagingApi.getConversationMessages(conv.conversationId, 0, 20);
      const fetchedMsgs = (data.content || []).reverse();
      setMessages(fetchedMsgs);
      setHasMore(!data.last);

      // Auto-scroll to bottom on initial message load
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);

      // Send markAsRead PATCH API request for the latest message shown on screen
      if (data.content?.length > 0) {
        const latestMsgOnScreen = data.content[0]; // data.content is ordered desc (latest first)
        if (latestMsgOnScreen.messageId) {
          try {
            await messagingApi.markAsRead(conv.conversationId, latestMsgOnScreen.messageId);
          } catch (e) {
            console.error('Failed to send markAsRead API request:', e);
          }
        }
      }

      // Set unreadCount to 0 for active conversation thread
      setConversations((prev) =>
        prev.map((c) => (c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c))
      );

    } catch {
      toast.error('Failed to load message history');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv);
    }
  }, [activeConv, fetchMessages]);

  // ─── 5. Load Older Messages (Pagination on Scroll Up) ─────────────────────
  const loadOlderMessages = async () => {
    if (!activeConv || activeConv.isTemporary || loadingMore || !hasMore || loadingMessages) return;

    const container = chatContainerRef.current;
    const prevScrollHeight = container ? container.scrollHeight : 0;
    const nextPage = page + 1;

    try {
      setLoadingMore(true);
      const data = await messagingApi.getConversationMessages(activeConv.conversationId, nextPage, 20);
      const olderMsgs = (data.content || []).reverse();

      if (olderMsgs.length > 0) {
        setMessages((prev) => [...olderMsgs, ...prev]);
        setPage(nextPage);
        setHasMore(!data.last);

        // Preserve exact scroll position so user doesn't jump when top messages load
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }
        });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop <= 30 && hasMore && !loadingMore && !loadingMessages) {
      loadOlderMessages();
    }
  };

  // ─── 6. WebSocket Connection (SockJS + STOMP) ───────────────────────────────
  useEffect(() => {
    if (!business) return;

    setReconnecting(true);
    const token = getAccessToken();
    const socket = new SockJS(`http://localhost:8000/ws?jwt=${token}`);
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

      client.subscribe(`/user/queue/messages`, (msg) => {
        const payload = JSON.parse(msg.body);
        const currentActive = activeConvRef.current;

        // Match message if it belongs to active conversation
        const isMatch = currentActive && (
          payload.conversationId === currentActive.conversationId ||
          (currentActive.isTemporary && payload.senderBusinessId === business.businessId) ||
          (currentActive.isTemporary && payload.senderBusinessId === currentActive.otherBusinessId)
        );

        if (isMatch) {
          if (currentActive.isTemporary) {
            setActiveConv((prev) => ({
              ...prev,
              conversationId: payload.conversationId,
              isTemporary: false,
            }));
            fetchConversations(payload.conversationId);
          }

          setMessages((prev) => {
            const exists = prev.some(
              (m) =>
                (payload.clientCorrelationId && m.clientCorrelationId === payload.clientCorrelationId) ||
                (payload.messageId && m.messageId === payload.messageId)
            );
            if (exists) {
              return prev.map((m) =>
                (payload.clientCorrelationId && m.clientCorrelationId === payload.clientCorrelationId) ||
                (payload.messageId && m.messageId === payload.messageId)
                  ? payload
                  : m
              );
            }
            return [...prev, payload];
          });

          // Auto-scroll to bottom on new message if near bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 50);

          // Update conversation last message summary in sidebar
          setConversations((prev) =>
            prev.map((c) =>
              c.conversationId === payload.conversationId
                ? {
                    ...c,
                    lastMessage: payload.content,
                    lastMessageTime: payload.sentAt,
                  }
                : c
            )
          );

          if (payload.conversationId && payload.messageId) {
            messagingApi.markAsRead(payload.conversationId, payload.messageId);
          }
        } else {
          setConversations((prev) => {
            const exists = prev.some((c) => c.conversationId === payload.conversationId);
            if (exists) {
              return prev.map((c) =>
                c.conversationId === payload.conversationId
                  ? {
                      ...c,
                      unreadCount: (c.unreadCount || 0) + 1,
                      lastMessage: payload.content,
                      lastMessageTime: payload.sentAt,
                    }
                  : c
              );
            } else {
              fetchConversations();
              return prev;
            }
          });
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
  }, [business, fetchConversations]);

  // Refetch on focus or reconnect
  useEffect(() => {
    const handleFocus = () => {
      const currentActive = activeConvRef.current;
      if (currentActive && !currentActive.isTemporary) {
        fetchMessages(currentActive);
        fetchConversations(currentActive.conversationId);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeConv, fetchMessages, fetchConversations]);

  useEffect(() => {
    if (connected && activeConv && !activeConv.isTemporary) {
      fetchMessages(activeConv);
      fetchConversations(activeConv.conversationId);
    }
  }, [connected]);

  // ─── 7. Send Chat Message ────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeConv) return;

    const currentMsgText = messageText.trim();
    setMessageText('');
    const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create optimistic message object
    const optimisticMsg = {
      messageId: null,
      senderBusinessId: business.businessId,
      content: currentMsgText,
      clientCorrelationId: correlationId,
      sentAt: new Date().toISOString(),
    };

    // Update screen instantly
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    const payload = {
      conversationId: activeConv.isTemporary ? null : activeConv.conversationId,
      senderBusinessId: business.businessId,
      receiverBusinessId: activeConv.otherBusinessId,
      content: currentMsgText,
      clientCorrelationId: correlationId,
      sentAt: new Date().toISOString(),
    };

    try {
      if (stompClientRef.current && connected) {
        stompClientRef.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(payload),
        });

        if (activeConv.isTemporary) {
          setTimeout(() => fetchConversations(), 1500);
        }
      } else {
        toast.error('Disconnected from chat server. Reconnecting...');
        setMessages((prev) => prev.filter((m) => m.clientCorrelationId !== correlationId));
      }
    } catch {
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((m) => m.clientCorrelationId !== correlationId));
    }
  };

  const handleSelectConversation = useCallback(async (conv) => {
    if (!conv) return;
    setActiveConv(conv);

    if (!conv.isTemporary && conv.conversationId) {
      // Clear unread badge in local UI immediately
      setConversations((prev) =>
        prev.map((c) => (c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, []);

  // ─── Filter Conversations List ──────────────────────────────────────────
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.otherBusinessName.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q);
    if (activeFilter === 'UNREAD') return matchesSearch && c.unreadCount > 0;
    return matchesSearch;
  });

  return (
    <div className="font-sans text-slate-800 antialiased flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* ── Desktop Left Navigation Sidebar ─────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col p-4 gap-2 bg-white border-r border-slate-200/80 shadow-sm z-40">
        <div className="px-3 py-2 flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
            IH
          </div>
          <div>
            <h1 className="font-black text-sm text-slate-900 tracking-tight leading-none">InventoryHub</h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Enterprise Portal</p>
          </div>
        </div>

        {businessLoading ? (
          <Skeleton className="h-12 w-full rounded-2xl mb-4" />
        ) : (
          <div className="px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-2xl mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                {business?.businessName?.substring(0, 1) || 'B'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{business?.businessName}</p>
                <p className="text-[9px] text-slate-400 font-mono">ID: {business?.businessId}</p>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-black shrink-0">
              Active
            </Badge>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          <Button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            variant="ghost"
            className="w-full justify-start text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl py-2.5"
          >
            <LayoutDashboard className="mr-2.5 h-4 w-4" />
            Dashboard
          </Button>

          <Button
            onClick={() => navigate(ROUTES.INVENTORY)}
            variant="ghost"
            className="w-full justify-start text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl py-2.5"
          >
            <Boxes className="mr-2.5 h-4 w-4" />
            Inventory & Stock
          </Button>

          <Button
            onClick={() => navigate('/collaboration')}
            className="w-full justify-start text-xs font-bold bg-blue-600 text-white rounded-xl py-2.5 shadow-md shadow-blue-500/10"
          >
            <MessageSquare className="mr-2.5 h-4 w-4" />
            Business Chat
          </Button>
        </nav>

        <div className="pt-4 border-t border-slate-100">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl py-2.5"
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ───────────────────────────────────────── */}
      {showLeftSidebarMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLeftSidebarMobile(false)}
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
                onClick={() => setShowLeftSidebarMobile(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
              <button onClick={() => { setShowLeftSidebarMobile(false); navigate(ROUTES.DASHBOARD); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
              <button onClick={() => { setShowLeftSidebarMobile(false); navigate(ROUTES.INVENTORY); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <Boxes className="h-4 w-4" /> Inventory
              </button>
              <button onClick={() => { setShowLeftSidebarMobile(false); navigate(ROUTES.STOCK_HISTORY); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left text-sm font-medium">
                <History className="h-4 w-4" /> Stock History
              </button>
              <a className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm" href="#">
                <MessageSquare className="h-4 w-4" /> Business Chat
              </a>
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-2">
              <button onClick={() => { setShowLeftSidebarMobile(false); navigate(ROUTES.BUSINESS_SELECT); }} className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60 shadow-sm transition-all active:scale-[0.98]">
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

      {/* ── Main Workspace ────────────────────────────────────────────── */}
      <main className="flex-1 md:pl-64 flex h-full overflow-hidden w-full">
        <div className="flex-1 flex h-full w-full overflow-hidden">

          {/* ── B2B Conversation List Panel ───────────────────────────── */}
          <div className={`w-full md:w-80 border-r border-slate-200 bg-white flex flex-col h-full shrink-0 ${
            activeConv ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Search */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLeftSidebarMobile(true)}
                  className="p-1.5 md:hidden text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    placeholder="Search business chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1">
                {['ALL', 'UNREAD'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
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


            {/* Conversation List */}
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
                    Find Businesses in Marketplace
                  </Button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = activeConv?.otherBusinessId === c.otherBusinessId;
                  return (
                    <div
                      key={c.otherBusinessId}
                      onClick={() => handleSelectConversation(c)}
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
                          {c.lastMessage}
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

          {/* ── WhatsApp-Style Plain Chat Workspace ─────────────────────── */}
          <div className={`flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden ${
            !activeConv ? 'hidden md:flex' : 'flex'
          }`}>
            {activeConv ? (
              <>
                {/* Active Chat Header */}
                <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConv(null)}
                      className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
                      title="Back to chats"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-sm">
                      {activeConv.otherBusinessName.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-slate-900 leading-tight">
                        {activeConv.otherBusinessName}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {connected ? 'Connected' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(ROUTES.INVENTORY)}
                    size="sm"
                    variant="outline"
                    className="h-8 text-[10px] font-black rounded-lg border-slate-200 text-slate-700"
                  >
                    Search Marketplace
                  </Button>
                </div>

                {/* ── CHAT MESSAGE STREAM WITH INFINITE SCROLL UP ───────────── */}
                <div
                  ref={chatContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                  {/* Loading Older Messages Spinner */}
                  {loadingMore && (
                    <div className="flex justify-center py-2">
                      <div className="bg-white border border-slate-200/80 rounded-full px-3 py-1 text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 shadow-sm">
                        <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                        <span>Loading older messages...</span>
                      </div>
                    </div>
                  )}

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
                      <p className="text-sm font-semibold">Start of B2B Conversation</p>
                      <p className="text-xs text-slate-400">Send a message to start communicating with {activeConv.otherBusinessName}.</p>
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isMe = m.senderBusinessId === business?.businessId;

                      return (
                        <div
                          key={m.messageId || m.clientCorrelationId || idx}
                          className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                          style={{ animation: 'fadeUp 0.2s ease' }}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isMe ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {isMe ? 'ME' : activeConv.otherBusinessName.substring(0, 1).toUpperCase()}
                          </div>

                          <div className="space-y-1">
                            <div className={`p-3 rounded-2xl shadow-sm text-xs leading-relaxed ${
                              isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/60'
                            }`}>
                              <p>{m.content}</p>
                            </div>

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

                {/* ── BOTTOM MESSAGE INPUT BAR ────────────────────────────── */}
                <div className="p-4 bg-white border-t border-slate-200/80 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-inner"
                      placeholder={`Type a message to ${activeConv.otherBusinessName}...`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <Button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-5 h-10 shadow-md shadow-blue-500/20 text-xs font-bold shrink-0 transition-all"
                    >
                      <Send className="h-4 w-4 mr-1.5" /> Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <MessageSquare className="h-16 w-16 text-slate-200" />
                <p className="text-base font-bold text-slate-700">Select a business chat to start messaging</p>
                <p className="text-xs text-slate-400">Search marketplace listings to connect with other businesses.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
