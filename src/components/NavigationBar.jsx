import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom'; 
import { useInstituteProfile } from '../Hook/useInstituteProfile'; // Adjust path as needed

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  // --- Institute Profile API Integration ---
  const { instituteProfiles, fetchAllInstituteProfiles } = useInstituteProfile();

  useEffect(() => {
    // Fetch profile data when the component mounts
    fetchAllInstituteProfiles();
  }, [fetchAllInstituteProfiles]);

  // Extract the current profile to get the dynamic logo
  const currentProfile = instituteProfiles && instituteProfiles.length > 0 ? instituteProfiles[0] : null;
  // Fallback to 'image' if 'logo' isn't the exact property name in your DB schema
  const logoUrl = currentProfile?.instituteLogo || currentProfile?.image; 

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Updated navItems with real paths
  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'ABOUT US', href: '/about' },
    { name: 'TEACHERS', href: '/teacher' },
    // { name: 'CLASSES', href: '/classes' },
    { name: 'NOTICE', href: '/notice' },
    { name: 'BLOG', href: '/blog' },
    { name: 'CONTACT', href: '/contact' },
  ];

  // Helper function to keep code clean for styles
  const getLinkStyles = (isActive) => 
    `px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
      isActive 
        ? 'text-orange-500 bg-orange-50' 
        : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
    }`;

  const getMobileLinkStyles = (isActive) =>
    `block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
      isActive
        ? 'text-orange-500 bg-orange-50'
        : 'text-purple-700 hover:bg-purple-50'
    }`;

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo - Dynamically Rendered */}
          <div className="flex-shrink-0 flex items-center">
            <NavLink to="/" className="flex items-center group">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={currentProfile?.instituteName || "Institute Logo"} 
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  onError={(e) => { e.target.style.display = 'none'; }} // Fallback if image fails to load
                />
              ) : (
                // Original fallback static logo if API hasn't loaded or no logo exists
                <span className="text-4xl font-black tracking-tighter transition-transform group-hover:scale-105">
                  <span className="text-purple-600">k</span>
                  <span className="text-purple-600">i</span>
                  <span className="text-cyan-500">t</span>
                  <span className="text-cyan-500">t</span>
                  <span className="text-orange-500">u</span>
                  <span className="text-orange-500">u</span>
                </span>
              )}
            </NavLink>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.href}
                className={({ isActive }) => getLinkStyles(isActive)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-purple-600 hover:bg-purple-50 focus:outline-none ring-2 ring-transparent focus:ring-purple-200 transition-all"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-7 w-7" />
              ) : (
                <Menu className="block h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Border Accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-purple-400 via-cyan-400 to-orange-400"></div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.href}
                className={({ isActive }) => getMobileLinkStyles(isActive)}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}