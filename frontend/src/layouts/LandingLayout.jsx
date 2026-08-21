import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { ArrowRight, Github, Linkedin, Mail, ExternalLink, Menu, X } from 'lucide-react';
import { BackendStatusBanner } from '@/components/BackendStatusBanner';
import { useBackendWake } from '@/hooks/useBackendWake';

import logoImg from '@/assets/logo.png';

export const LandingLayout = ({ children }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isStarting } = useBackendWake();

  return (
    <div className="min-h-screen flex flex-col bg-stitch-surface text-stitch-text font-sans antialiased overflow-x-hidden">
      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
            <img src={logoImg} alt="InventoryHub Logo" className="h-9 sm:h-10 w-9 sm:w-10 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
                Inventory<span className="text-stitch-primary">Hub</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">
                Project Demo
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#solutions" className="hover:text-stitch-primary transition-colors">
              Solutions
            </a>
            <a href="#about" className="hover:text-stitch-primary transition-colors">
              About & Stack
            </a>
            <a href="#contact" className="hover:text-stitch-primary transition-colors">
              Contact
            </a>
            <a
              href="https://github.com/SaikiranC08"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 transition-colors font-semibold"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </nav>

          {/* Desktop Action Buttons & Backend Status & Mobile Hamburger Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <BackendStatusBanner className="hidden lg:flex" />

            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => navigate(ROUTES.LOGIN)}
                disabled={isStarting}
                className="text-slate-700 hover:text-stitch-primary hover:bg-slate-100/60 font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login
              </Button>
              <Button
                variant="stitch"
                onClick={() => navigate(ROUTES.REGISTER)}
                disabled={isStarting}
                className="shadow-sm text-xs sm:text-sm px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Banner on smaller screens inside header bar */}
        <div className="lg:hidden px-4 pb-2">
          <BackendStatusBanner />
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Solutions
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                About & Stack
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Contact
              </a>
              <a
                href="https://github.com/SaikiranC08"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 py-2 px-3 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Explore on GitHub</span>
                <ExternalLink className="h-3 w-3 text-blue-400" />
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="stitch"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(ROUTES.REGISTER);
                }}
                className="w-full justify-center"
              >
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(ROUTES.LOGIN);
                }}
                className="w-full justify-center text-slate-700 border-slate-200"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Modern Portfolio Footer */}
      <footer className="border-t border-slate-200 bg-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <img src={logoImg} alt="InventoryHub Logo" className="h-9 w-9 object-contain rounded-lg shadow-sm" />
                <span className="font-bold text-lg text-slate-900">InventoryHub</span>
              </div>
              <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
                Multi-business inventory management platform engineered with Spring Boot microservices, Kong API Gateway, PostgreSQL, and WebSockets.
              </p>
              <div className="flex items-center space-x-4 pt-2">
                <a
                  href="https://github.com/SaikiranC08"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="GitHub Repository"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/saikiran-chevula"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="mailto:schevula26@gmail.com"
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Direct Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Architecture</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-mono">
                <li><a href="#solutions" className="hover:text-stitch-primary">Inventory Management</a></li>
                <li><a href="#solutions" className="hover:text-stitch-primary">Multi-Business Sync</a></li>
                <li><a href="#solutions" className="hover:text-stitch-primary">Stock Transfers</a></li>
                <li><a href="#solutions" className="hover:text-stitch-primary">WebSocket Events</a></li>
                <li><a href="#solutions" className="hover:text-stitch-primary">Kong Gateway</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Built With</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li>React & Tailwind CSS</li>
                <li>Java & Spring Boot</li>
                <li>PostgreSQL DB</li>
                <li>Docker Containerization</li>
                <li>Kong API Gateway</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-mono">
            <p>© {new Date().getFullYear()} InventoryHub • Developed by Saikiran Chevula</p>
            <p className="mt-2 sm:mt-0">Open Source Portfolio Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

