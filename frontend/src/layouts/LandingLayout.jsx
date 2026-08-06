import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { Box, ArrowRight, Layers, Github, Twitter, Linkedin } from 'lucide-react';

import logoImg from '@/assets/logo.png';

export const LandingLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-stitch-surface text-stitch-text font-sans antialiased overflow-x-hidden">
      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
            <img src={logoImg} alt="InventoryHub Logo" className="h-9 w-9 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 leading-tight">
                Inventory<span className="text-stitch-primary">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">
                Enterprise
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-stitch-primary transition-colors">
              Features
            </a>
            <a href="#solutions" className="hover:text-stitch-primary transition-colors">
              Solutions
            </a>
            <a href="#about" className="hover:text-stitch-primary transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-stitch-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-slate-700 hover:text-stitch-primary hover:bg-slate-100/60 font-semibold"
            >
              Login
            </Button>
            <Button
              variant="stitch"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="shadow-sm"
            >
              Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Modern SaaS Footer */}
      <footer className="border-t border-slate-200 bg-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <img src={logoImg} alt="InventoryHub Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
                <span className="font-bold text-lg text-slate-900">InventoryHub</span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Connected Inventory. Smarter Business. Modern multi-business inventory platform engineered for speed, transparency, and seamless inter-business trade.
              </p>
              <div className="flex space-x-4 text-slate-400">
                <a href="#" className="hover:text-stitch-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="hover:text-stitch-primary transition-colors"><Github className="h-5 w-5" /></a>
                <a href="#" className="hover:text-stitch-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-stitch-primary">Features</a></li>
                <li><a href="#solutions" className="hover:text-stitch-primary">Multi-Business</a></li>
                <li><a href="#marketplace" className="hover:text-stitch-primary">Marketplace</a></li>
                <li><a href="#security" className="hover:text-stitch-primary">Enterprise Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Solutions</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a href="#" className="hover:text-stitch-primary">Retail Networks</a></li>
                <li><a href="#" className="hover:text-stitch-primary">Wholesale Hubs</a></li>
                <li><a href="#" className="hover:text-stitch-primary">Logistics Teams</a></li>
                <li><a href="#" className="hover:text-stitch-primary">Supply Chain</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a href="#" className="hover:text-stitch-primary">About Us</a></li>
                <li><a href="#" className="hover:text-stitch-primary">Careers</a></li>
                <li><a href="#" className="hover:text-stitch-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-stitch-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
            <p>© {new Date().getFullYear()} InventoryHub Inc. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Designed with Google Stitch & Linear aesthetics.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
