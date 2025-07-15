import React from 'react';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';

export const Loader: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <Header />
    <main className="flex-grow flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin-delayed"></div>
          </div>
        </div>
        <div className="loader-pulse">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Portfolio Balancer
          </h2>
          <p className="text-lg text-gray-600 mb-1">Setting up your dashboard...</p>
          <p className="text-sm text-gray-500">Connecting to EODHD API</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
