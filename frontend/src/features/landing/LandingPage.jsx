import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LandingLayout } from '@/layouts/LandingLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import {
  Building2,
  PackageCheck,
  Search,
  MessageSquare,
  SendHorizontal,
  BarChart3,
  ArrowRight,
  Sparkles,
  Warehouse,
  Truck,
  Box,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [truckReachedCenter, setTruckReachedCenter] = useState(false);

  // Logistics Animation Variants
  const truckVariants = {
    initial: { x: '-120%', opacity: 0 },
    animate: {
      x: ['-120%', '0%', '120%'],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 7,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 1,
      },
    },
  };

  const boxBounce = {
    animate: {
      y: [0, -6, 0, -4, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <LandingLayout>
      {/* HERO SECTION */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden px-4 pt-12 pb-20">
        {/* Animated Background Gradients */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-[500px] h-[300px] bg-blue-400/10 rounded-full blur-2xl" />
        </motion.div>

        {/* LOGISTICS ANIMATION CONTAINER */}
        <div className="w-full max-w-4xl mx-auto my-6 relative h-28 flex items-center justify-between border-b-2 border-slate-200/80 px-8">
          {/* Left Warehouse */}
          <div className="flex flex-col items-center text-slate-600 z-10">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
              <Warehouse className="h-7 w-7 text-stitch-primary" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Warehouse A
            </span>
          </div>

          {/* Road Line with Truck moving */}
          <div className="absolute inset-x-20 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 w-1/2 animate-pulse" />
          </div>

          {/* Animated Delivery Truck Carrying Cargo Boxes */}
          <motion.div
            variants={truckVariants}
            initial="initial"
            animate="animate"
            onUpdate={(latest) => {
              // Trigger center event when truck reaches middle
              if (latest.x && parseFloat(latest.x) > -20 && !truckReachedCenter) {
                setTruckReachedCenter(true);
              }
            }}
            className="absolute left-1/2 -ml-10 z-20 flex flex-col items-center"
          >
            {/* Cargo Boxes bouncing on truck bed */}
            <motion.div
              variants={boxBounce}
              animate="animate"
              className="flex space-x-1 mb-[-4px]"
            >
              <div className="h-4 w-4 bg-amber-500 rounded-sm border border-amber-600 shadow-sm flex items-center justify-center">
                <Box className="h-2.5 w-2.5 text-white" />
              </div>
              <div className="h-4 w-4 bg-blue-600 rounded-sm border border-blue-700 shadow-sm flex items-center justify-center">
                <Box className="h-2.5 w-2.5 text-white" />
              </div>
            </motion.div>

            {/* Truck Icon */}
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
              <Truck className="h-6 w-6 text-blue-400" />
            </div>
          </motion.div>

          {/* Right Warehouse */}
          <div className="flex flex-col items-center text-slate-600 z-10">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
              <Warehouse className="h-7 w-7 text-emerald-600" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Warehouse B
            </span>
          </div>
        </div>

        {/* HERO TEXT & BUTTONS */}
        <div className="max-w-4xl mx-auto text-center space-y-6 z-10 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="stitch" className="px-4 py-1.5 text-xs tracking-wide">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-stitch-primary" />
              Connected Inventory. Smarter Business.
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
          >
            Inventory management built for{' '}
            <span className="bg-gradient-to-r from-stitch-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              modern businesses.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Manage inventory across multiple businesses. Transfer inventory instantly. Request products from nearby businesses. Negotiate inventory in real time. Track every stock movement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              variant="stitch"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="w-full sm:w-auto h-13 px-8 text-base shadow-xl shadow-blue-500/20"
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full sm:w-auto h-13 px-8 text-base bg-white/80 border-slate-200 text-slate-800 hover:bg-slate-50 font-semibold"
            >
              Sign In to Account
            </Button>
          </motion.div>
        </div>

        {/* REALISTIC DASHBOARD PREVIEW MOCKUP */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="w-full max-w-6xl mx-auto mt-16 px-2"
        >
          <div className="glass-card p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-200/80 bg-white/90">
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 px-3">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-4 hidden sm:inline">
                  inventoryhub.app / dashboard / overview
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-slate-500">
                LIVE MARKET DEMO
              </Badge>
            </div>

            {/* Dashboard Mock Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              {/* Stat Card 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Managed SKUs
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  14,280
                </div>
                <div className="flex items-center text-xs text-emerald-600 font-medium mt-1">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" /> +12.4% this month
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Connected Businesses
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  28 Network Hubs
                </div>
                <div className="flex items-center text-xs text-blue-600 font-medium mt-1">
                  <Building2 className="h-3.5 w-3.5 mr-1" /> Active Inter-Trade
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stock Requests
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  34 Pending
                </div>
                <div className="flex items-center text-xs text-amber-600 font-medium mt-1">
                  <Zap className="h-3.5 w-3.5 mr-1" /> Real-time Negotiation
                </div>
              </div>

              {/* Stat Card 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Accuracy Score
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  99.98%
                </div>
                <div className="flex items-center text-xs text-emerald-600 font-medium mt-1">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Audit Verified
                </div>
              </div>
            </div>

            {/* Table Mockup */}
            <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 overflow-x-auto">
              <div className="flex justify-between items-center mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Recent Inventory Movement</span>
                <span className="text-stitch-primary cursor-pointer hover:underline">View All</span>
              </div>
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-2">SKU ID</th>
                    <th className="pb-2">ITEM NAME</th>
                    <th className="pb-2">FROM BUSINESS</th>
                    <th className="pb-2">TO BUSINESS</th>
                    <th className="pb-2 text-right">QTY</th>
                    <th className="pb-2 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">SKU-8890</td>
                    <td>Industrial Servo Motors x4</td>
                    <td>Apex Logistics Ltd</td>
                    <td>Metro Retail Hub</td>
                    <td className="text-right font-bold">120</td>
                    <td className="text-right">
                      <Badge variant="success" className="text-[10px]">Delivered</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">SKU-4412</td>
                    <td>Precision Alloy Valves</td>
                    <td>Apex Logistics Ltd</td>
                    <td>Vanguard Supply</td>
                    <td className="text-right font-bold">450</td>
                    <td className="text-right">
                      <Badge variant="stitch" className="text-[10px]">In Transit</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section id="features" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stitch-primary font-mono">
              Designed for Speed & Scale
            </h2>
            <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Everything you need to orchestrate connected inventory.
            </p>
            <p className="text-slate-600 text-base sm:text-lg">
              Engineered with linear precision to streamline multi-entity operations, inter-store requests, and stock auditing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200/80 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-stitch-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Multi Business</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed mt-2">
                  Seamlessly switch between multiple business entities, retail branches, or enterprise subsidiaries from one single account.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200/80 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PackageCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Inventory Tracking</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed mt-2">
                  Real-time stock auditing with sub-second accuracy across all connected warehouses, stores, and transport units.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200/80 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Marketplace Search</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed mt-2">
                  Search products and surplus stock across neighboring businesses in the connected InventoryHub marketplace.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200/80 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Business Messaging</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed mt-2">
                  Direct encrypted inter-business chat for negotiating prices, confirming batch arrivals, and solving stock discrepancies.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200/80 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <SendHorizontal className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Stock Requests</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed mt-2">
                  Instant stock transfer request workflows with approval chains, automated dispatching, and QR code tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200/80 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Dashboard Analytics</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed mt-2">
                  Deep analytics into inventory turnover rates, stockout warnings, valuation metrics, and demand forecasting.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to connect your business inventory?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Join thousands of businesses managing stock across connected enterprise networks.
          </p>
          <div className="pt-4">
            <Button
              size="lg"
              variant="stitch"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="h-13 px-8 text-base shadow-xl shadow-blue-500/30"
            >
              Create Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};
