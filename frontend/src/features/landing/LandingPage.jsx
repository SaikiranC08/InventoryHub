import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingLayout } from '@/layouts/LandingLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import {
  Building2,
  PackageCheck,
  Search,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Warehouse,
  Truck,
  Box,
  ShieldCheck,
  Zap,
  RefreshCw,
  CheckCircle2,
  Activity,
  Grid,
  ArrowRightLeft,
  ChevronRight,
  Check,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Code2
} from 'lucide-react';

// Sample Inventory Data for Smart Matrix Visualizer
const INITIAL_ITEMS = [
  { id: 1, sku: 'SKU-8890', name: 'Servo Motor x40', category: 'Motors', rack: 'Rack A', color: 'from-blue-600 to-indigo-600', qty: 120, status: 'Audited' },
  { id: 2, sku: 'SKU-4412', name: 'Alloy Valve B2', category: 'Valves', rack: 'Rack B', color: 'from-cyan-600 to-blue-600', qty: 450, status: 'In Stock' },
  { id: 3, sku: 'SKU-1029', name: 'Micro Control Board', category: 'Electronics', rack: 'Rack C', color: 'from-purple-600 to-indigo-600', qty: 85, status: 'Audited' },
  { id: 4, sku: 'SKU-9931', name: 'Hydraulic Line Set', category: 'Fluidics', rack: 'Rack D', color: 'from-amber-500 to-orange-600', qty: 310, status: 'In Transit' },
  { id: 5, sku: 'SKU-8891', name: 'Servo Motor Heavy', category: 'Motors', rack: 'Rack A', color: 'from-blue-600 to-indigo-600', qty: 60, status: 'Audited' },
  { id: 6, sku: 'SKU-4413', name: 'Precision Valve Pro', category: 'Valves', rack: 'Rack B', color: 'from-cyan-600 to-blue-600', qty: 220, status: 'In Stock' },
  { id: 7, sku: 'SKU-1030', name: 'Optical Sensor Array', category: 'Electronics', rack: 'Rack C', color: 'from-purple-600 to-indigo-600', qty: 540, status: 'Audited' },
  { id: 8, sku: 'SKU-9932', name: 'Pneumatic Cylinder', category: 'Fluidics', rack: 'Rack D', color: 'from-amber-500 to-orange-600', qty: 175, status: 'In Stock' },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  // Active View Mode inside Hero Visualizer Deck
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'flow' | 'analytics'
  const [isOrganized, setIsOrganized] = useState(true);
  const [isSorting, setIsSorting] = useState(false);
  const [items] = useState(INITIAL_ITEMS);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Trigger manual or automated rack re-sorting
  const handleSortToggle = () => {
    setIsSorting(true);
    setTimeout(() => {
      setIsOrganized((prev) => !prev);
      setIsSorting(false);
    }, 400);
  };

  // Filter items based on active category if organized
  const displayedItems = isOrganized
    ? items.filter(
        (item) => activeCategoryFilter === 'All' || item.category === activeCategoryFilter
      )
    : [...items].sort(() => (isOrganized ? 1 : Math.sin(items.length) - 0.5));

  return (
    <LandingLayout>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-3 sm:px-6 pt-6 sm:pt-10 pb-12 sm:pb-20 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-white">
        {/* Modern Ambient Mesh Background Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-600/25 via-indigo-500/20 to-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-2/3 right-10 w-[500px] h-[350px] bg-cyan-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-10 w-[450px] h-[300px] bg-blue-500/10 rounded-full blur-[90px]" />
          {/* Subtle Grid Lines Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
        </div>

        {/* HERO TEXT & HEADLINE */}
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 z-10 mt-2 sm:mt-4">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <Badge className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold tracking-wide bg-blue-500/10 text-blue-300 border border-blue-500/30 backdrop-blur-md rounded-full shadow-lg shadow-blue-500/5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-blue-400 animate-pulse" />
              Connected Inventory. Smarter Business.
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.1]"
          >
            Inventory management built for{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              modern connected networks.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal px-1"
          >
            Eliminate stock chaos. Transfer inventory instantly between entities, track automated stock arrangements, and negotiate inter-business trades in real time.
          </motion.p>

          {/* QUICK METRICS STRIP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs font-mono text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>99.98% Audit Accuracy</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Sub-second Transfer Sync</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Multi-Tenant Encrypted</span>
            </div>
          </motion.div>
        </div>

        {/* HERO INTERACTIVE VISUALIZER DECK */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-6xl mx-auto mt-12 z-20 px-2"
        >
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
            {/* Visualizer Control Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:px-6 bg-slate-900/90 rounded-t-2xl border-b border-slate-800">
              {/* Window Dots & Title */}
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700/50">
                  live_inventory_engine.v2
                </span>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium w-full sm:w-auto overflow-x-auto scrollbar-none justify-start sm:justify-center shrink-0">
                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'matrix'
                      ? 'bg-blue-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span>Smart Stock Matrix</span>
                </button>
                <button
                  onClick={() => setActiveTab('flow')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'flow'
                      ? 'bg-blue-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>Supply Flow</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'analytics'
                      ? 'bg-blue-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Audit Analytics</span>
                </button>
              </div>
            </div>

            {/* MAIN TAB CONTENT AREA */}
            <div className="p-4 sm:p-6 bg-slate-950/90 rounded-b-2xl min-h-[420px] flex flex-col justify-between">
              {/* TAB 1: SMART STOCK MATRIX (Organized vs Chaotic Inventory Rack Visualizer) */}
              {activeTab === 'matrix' && (
                <div className="space-y-4">
                  {/* Matrix Toolbar Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                        <Box className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                          Automated Rack Allocation Engine
                          <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                            Live Auto-Sort
                          </Badge>
                        </h4>
                        <p className="text-xs text-slate-400">
                          {isOrganized
                            ? 'Stock items automatically assigned and aligned into verified category racks.'
                            : 'Unsorted raw inbound batch loaded. Click sort to organize.'}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Action Toggle Button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        onClick={handleSortToggle}
                        disabled={isSorting}
                        className={`w-full sm:w-auto gap-2 text-xs font-semibold shadow-lg ${
                          isOrganized
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isSorting ? 'animate-spin' : ''}`} />
                        {isOrganized ? 'Simulate Unsorted Inbound' : 'Auto-Sort Racks Now'}
                      </Button>
                    </div>
                  </div>

                  {/* Category Filter Chips (When Organized) */}
                  {isOrganized && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                      <span className="text-slate-500 font-mono uppercase text-[10px] mr-1">Racks:</span>
                      {['All', 'Motors', 'Valves', 'Electronics', 'Fluidics'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-lg border text-xs transition-all ${
                            activeCategoryFilter === cat
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-semibold'
                              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Animated Grid of Stock Cards */}
                  <motion.div
                    layout
                    className={`grid gap-3 transition-all ${
                      isOrganized
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 opacity-90'
                    }`}
                  >
                    <AnimatePresence mode="popLayout">
                      {displayedItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className={`p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border ${
                            isOrganized ? 'border-slate-800 hover:border-blue-500/40' : 'border-amber-500/30 bg-amber-950/10'
                          } shadow-lg relative group transition-all`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${item.color} text-white shadow-sm`}>
                                <Box className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-200">
                                {item.sku}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                                item.status === 'Audited'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : item.status === 'In Transit'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h5 className="text-xs font-semibold text-slate-100 truncate">
                              {item.name}
                            </h5>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                              <span>Qty: <strong className="text-slate-200">{item.qty}</strong></span>
                              <span className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                {isOrganized ? item.rack : 'Unsorted'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}

              {/* TAB 2: SUPPLY FLOW NETWORK (Inter-Business Bezier Transport Engine) */}
              {activeTab === 'flow' && (
                <div className="space-y-6 my-auto py-4">
                  <div className="text-center max-w-lg mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-center gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                      Inter-Business Stock Routing Engine
                    </h4>
                    <p className="text-xs text-slate-400">
                      Real-time inventory transfers with automated dispatch approvals between business hubs.
                    </p>
                  </div>

                  {/* Connected Enterprise Hub Nodes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative items-center">
                    {/* Node 1: Warehouse A */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                          <Warehouse className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">
                          DISPATCH HUB
                        </Badge>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-100">Apex Logistics Base</h5>
                        <p className="text-[11px] text-slate-400 font-mono">Stock: 14,280 Units</p>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[85%]" />
                      </div>
                    </div>

                    {/* Animated Bezier Transfer Path (Center Node) */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 via-blue-950/20 to-slate-900 border border-blue-500/30 text-center space-y-3 relative z-10 shadow-xl">
                      <div className="inline-flex p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/40 animate-pulse">
                        <Truck className="h-6 w-6" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-blue-300 font-mono">ACTIVE TRANSFER IN TRANSIT</h5>
                        <p className="text-[11px] text-slate-400 font-mono">Batch #TR-9942 • 450 Units</p>
                      </div>
                      {/* Floating Payload Pill */}
                      <motion.div
                        animate={{ x: [-10, 10, -10] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="inline-flex items-center gap-1.5 bg-blue-600/40 border border-blue-400/40 px-3 py-1 rounded-full text-[10px] font-mono text-cyan-200"
                      >
                        <Box className="h-3 w-3 text-cyan-300" />
                        <span>Precision Valves ➔ In Transit</span>
                      </motion.div>
                    </div>

                    {/* Node 3: Retail Branch */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                          DESTINATION
                        </Badge>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-100">Metro Retail Store</h5>
                        <p className="text-[11px] text-slate-400 font-mono">Stock: 4,120 Units</p>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[62%]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT ANALYTICS DASHBOARD */}
              {activeTab === 'analytics' && (
                <div className="space-y-4 my-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Stock Accuracy Score</span>
                      <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">99.98%</div>
                      <span className="text-[11px] text-slate-500">Verified by QR audit trail</span>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active Inter-Trade Requests</span>
                      <div className="text-2xl font-bold font-mono text-blue-400 mt-1">34 Batches</div>
                      <span className="text-[11px] text-slate-500">Avg transfer time: 14 mins</span>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Marketplace Stock Match</span>
                      <div className="text-2xl font-bold font-mono text-amber-400 mt-1">98.4%</div>
                      <span className="text-[11px] text-slate-500">Instant local supplier fit</span>
                    </div>
                  </div>

                  {/* Audit Table Preview */}
                  <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto text-xs font-mono">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800 pb-2">
                          <th className="pb-2">BATCH ID</th>
                          <th className="pb-2">RESOURCE</th>
                          <th className="pb-2">SOURCE</th>
                          <th className="pb-2">DESTINATION</th>
                          <th className="pb-2 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-2 font-bold text-blue-400">TR-8812</td>
                          <td>Servo Motors x120</td>
                          <td>Apex Logistics</td>
                          <td>Metro Retail</td>
                          <td className="text-right text-emerald-400">Delivered</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-blue-400">TR-8813</td>
                          <td>Alloy Valves x450</td>
                          <td>Apex Logistics</td>
                          <td>Vanguard Hub</td>
                          <td className="text-right text-amber-400">In Transit</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bottom Visualizer Footer Bar */}
              <div className="pt-3 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-time WebSocket Synchronized</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Latency: &lt;14ms</span>
                  <span>Encryption: TLS 1.3</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" className="py-24 bg-slate-50 text-slate-900 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-xs font-mono text-blue-600 border-blue-200 bg-blue-50">
              SOLUTIONS OVERVIEW
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              What InventoryHub Solves
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Engineered to simplify inventory tracking, multi-business collaboration, and B2B trade execution.
            </p>
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Solution 1 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PackageCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Inventory Management</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Manage products, variants, stock levels, and reorder thresholds with real-time audit visibility and stock tracking.
              </p>
            </div>

            {/* Solution 2 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-Business Inventory</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Businesses can maintain their own independent inventory while seamlessly interacting and trading with other businesses.
              </p>
            </div>

            {/* Solution 3 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Stock Transfers & Requests</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Request and transfer inventory between businesses with automated dispatch workflows and QR code verification.
              </p>
            </div>

            {/* Solution 4 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Collaboration</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                WebSocket-powered communication for instant inventory discussions, real-time stock alerts, and price negotiation.
              </p>
            </div>

            {/* Solution 5 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300 group md:col-span-2 lg:col-span-2">
              <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure API Gateway</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                JWT authentication, rate limiting, and centralized microservices routing powered by Kong API Gateway to ensure enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT & BUILT WITH TECH STACK SECTION */}
      <section id="about" className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-xs font-mono text-indigo-600 border-indigo-200 bg-indigo-50">
              PROJECT SCOPE & TECH DEPTH
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              About InventoryHub
            </h2>
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-slate-200 text-left space-y-4 shadow-xl border border-slate-800">
              <p className="text-base sm:text-lg leading-relaxed font-normal">
                InventoryHub is a multi-business inventory management platform designed to simplify inventory tracking, stock collaboration, and business-to-business inventory operations.
              </p>
              <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 pt-2 border-t border-slate-800">
                <Code2 className="h-4 w-4" />
                <span>Full-Stack Microservices Architecture</span>
              </div>
            </div>
          </div>

          {/* BUILT WITH SECTION */}
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-2">
                TECHNOLOGY STACK
              </h3>
              <h4 className="text-2xl font-bold text-slate-900">
                Built With Production-Grade Tech
              </h4>
            </div>

            {/* Tech Badges Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
              {[
                { name: 'React', desc: 'Frontend Single-Page App', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
                { name: 'Java', desc: 'Core Backend Language', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                { name: 'Spring Boot', desc: 'Microservices Framework', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { name: 'PostgreSQL', desc: 'Relational Database', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { name: 'Docker', desc: 'Container Orchestration', color: 'bg-sky-50 text-sky-700 border-sky-200' },
                { name: 'Kong', desc: 'API Gateway & Auth', color: 'bg-slate-100 text-slate-800 border-slate-300' },
                { name: 'WebSockets', desc: 'Real-time Event Sync', color: 'bg-purple-50 text-purple-700 border-purple-200' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className={`px-5 py-3 rounded-2xl border ${tech.color} shadow-sm flex flex-col items-center justify-center font-mono hover:scale-105 transition-transform`}
                >
                  <span className="font-bold text-base">{tech.name}</span>
                  <span className="text-[11px] opacity-80 mt-0.5">{tech.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT & ARCHITECTURE RECRUITER SECTION */}
      <section id="contact" className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-xs font-mono text-cyan-300 border-cyan-500/30 bg-cyan-500/10">
              DEVELOPER CONTACT & SOURCE
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Have feedback or want to discuss the project?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
              Reach out directly or explore the backend architecture and codebase.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {/* GitHub Card */}
            <a
              href="https://github.com/SaikiranC08"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition-all duration-300 group space-y-4 shadow-xl"
            >
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Github className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-100 flex items-center gap-1.5">
                  GitHub <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-blue-400" />
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1 truncate">github.com/SaikiranC08</p>
                <p className="text-xs text-slate-500 mt-2">Explore repository, docker setup, and microservices.</p>
              </div>
            </a>

            {/* LinkedIn Card */}
            <a
              href="https://www.linkedin.com/in/saikiran-chevula"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition-all duration-300 group space-y-4 shadow-xl"
            >
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl w-fit border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Linkedin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-100 flex items-center gap-1.5">
                  LinkedIn <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-400" />
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1 truncate">saikiran-chevula</p>
                <p className="text-xs text-slate-500 mt-2">Connect with Saikiran Chevula on LinkedIn.</p>
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:schevula26@gmail.com"
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition-all duration-300 group space-y-4 shadow-xl"
            >
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-100 flex items-center gap-1.5">
                  Email Direct <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-emerald-400" />
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1 truncate">schevula26@gmail.com</p>
                <p className="text-xs text-slate-500 mt-2">Send direct project feedback or opportunity inquiry.</p>
              </div>
            </a>
          </div>

          {/* Architecture Callout Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="text-left space-y-1">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-400" />
                Interested in the architecture?
              </h4>
              <p className="text-sm text-slate-400">
                Explore the complete microservices codebase, API docs, and Docker orchestration on GitHub.
              </p>
            </div>
            <a
              href="https://github.com/SaikiranC08"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-6 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30"
              >
                Explore on GitHub <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};
