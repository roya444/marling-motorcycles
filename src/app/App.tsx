import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Shop } from './components/Shop';
import { BikeDetail } from './components/BikeDetail';
import { Admin } from './components/Admin';
import { AdminLogin } from './components/AdminLogin';
import { Workshop } from './components/Workshop';
import { type Motorcycle } from '@/utils/supabase/motorcycles';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'shop' | 'workshop' | 'bike-detail' | 'admin'>('home');
  const [selectedBike, setSelectedBike] = useState<Motorcycle | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check for admin authentication on mount
  useEffect(() => {
    const isAuth = localStorage.getItem('marling_admin_auth') === 'true';
    setIsAdminAuthenticated(isAuth);
  }, []);

  // Check URL for admin route
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    if (path.includes('/admin') || hash === '#admin') {
      setCurrentPage('admin');
    }
  }, []);

  const handleNavigate = (page: 'home' | 'about' | 'shop' | 'workshop' | 'admin') => {
    setCurrentPage(page);
    setSelectedBike(null);
    
    // Update URL hash for admin
    if (page === 'admin') {
      window.location.hash = 'admin';
    } else {
      window.location.hash = '';
    }
  };

  const handleViewBike = (bike: Motorcycle) => {
    setSelectedBike(bike);
    setCurrentPage('bike-detail');
  };

  const handleBackToShop = () => {
    setCurrentPage('shop');
    setSelectedBike(null);
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('marling_admin_auth');
    setIsAdminAuthenticated(false);
    setCurrentPage('home');
  };

  // Show admin panel if on admin page
  if (currentPage === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLogin onLogin={handleAdminLogin} onBackToSite={() => handleNavigate('home')} />;
    }
    return <Admin onLogout={handleAdminLogout} />;
  }

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section with Navigation - Always visible */}
      <Hero onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Page Content */}
      {currentPage === 'about' && <About />}
      {currentPage === 'workshop' && <Workshop />}
      {currentPage === 'shop' && <Shop onViewBike={handleViewBike} onNavigateAdmin={() => handleNavigate('admin')} />}
      {currentPage === 'bike-detail' && selectedBike && (
        <BikeDetail bike={selectedBike} onBack={handleBackToShop} />
      )}
    </div>
  );
}