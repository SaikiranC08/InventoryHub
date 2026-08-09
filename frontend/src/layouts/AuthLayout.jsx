import React from 'react';
import { Link } from 'react-router-dom';
import { Box, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

import logoImg from '@/assets/logo.png';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-stitch-surface font-sans text-stitch-text">
      {/* Form Left Container */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 xl:p-16">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
            <img src={logoImg} alt="InventoryHub Logo" className="h-11 w-11 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Inventory<span className="text-stitch-primary">Hub</span>
            </span>
          </Link>
          <Link
            to={ROUTES.HOME}
            className="text-xs font-semibold text-slate-500 hover:text-stitch-primary transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="my-auto py-8 max-w-md w-full mx-auto">{children}</div>

        <div className="text-xs text-slate-400 text-center sm:text-left">
          Protected by enterprise grade encryption • © {new Date().getFullYear()} InventoryHub
        </div>
      </div>

      {/* Right Brand Showcase Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Glow Spheres */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>Next-Gen Inventory Platform</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Connected Inventory. <br />
            <span className="text-blue-400">Smarter Business.</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm leading-relaxed">
            Manage inventory seamlessly across multiple business entities with real-time stock transfer, instant requests, and enterprise auditing.
          </p>
        </div>

        <div className="relative z-10 space-y-4 my-8">
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Multi-Business Network</h4>
              <p className="text-xs text-slate-400">Manage multiple businesses from one central workspace.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <ShieldCheck className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Real-Time Stock Auditing</h4>
              <p className="text-xs text-slate-400">Instant inventory updates across warehouses and retail points.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Linear-inspired UI design</span>
          <span className="font-mono text-blue-300">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
