import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Youtube, Instagram, Send } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-white pt-16 pb-6 overflow-hidden">
      {/* Playful Grid Background Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', size: '20px 20px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Section 1: Logo & Contact */}
          <div className="space-y-6">
            <div className="text-4xl font-black tracking-tighter">
              <span className="text-purple-600">k</span>
              <span className="text-purple-600">i</span>
              <span className="text-cyan-500">t</span>
              <span className="text-cyan-500">t</span>
              <span className="text-orange-500">u</span>
              <span className="text-orange-500">u</span>
            </div>

            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <p className="text-sm">503 Old Buffalo Street<br />Northwest #205, New York-3087</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm">+3453-909-6565<br />+2390-875-2235</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                <p className="text-sm">infoname@gmail.com</p>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                <p className="text-sm">www.yourcompany.com</p>
              </div>
            </div>
          </div>

          {/* Section 2: Useful Links */}
          <div>
            <h3 className="text-xl font-bold text-purple-800 mb-6 relative inline-block">
              Useful Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-purple-600"></span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              {[
                { name: 'Home', path: '/' },
                { name: 'Login', path: '/login' },
                { name: 'About', path: '/about' },
                { name: 'Services', path: '/services' },
                { name: 'Class', path: '/class' },
                { name: 'Teacher', path: '/teacher' },
                { name: 'Event', path: '/event' },
                { name: 'Blog', path: '/blog' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <Link key={link.name} to={link.path} className="text-sm hover:text-purple-600 flex items-center gap-1 transition-colors">
                  <span className="text-purple-400">›</span> {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Section 3: Recent Posts */}
          <div>
            <h3 className="text-xl font-bold text-purple-800 mb-6 relative inline-block">
              Recent Posts
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-purple-600"></span>
            </h3>
            <div className="space-y-4">
              {[1, 2].map((post) => (
                <div key={post} className="flex gap-4 group cursor-pointer">
                  <div className="bg-purple-600 text-white p-2 rounded text-center min-w-[50px] h-fit">
                    <p className="text-xs font-bold">28</p>
                    <p className="text-[10px] uppercase">June</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-purple-900 group-hover:text-orange-500 transition-colors">Welcome to Responsive Retina Theme</h4>
                    <p className="text-xs text-gray-500">Design</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Newsletter */}
          <div className="relative">
            <h3 className="text-xl font-bold text-purple-800 mb-6 relative inline-block">
              Newsletter
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-purple-600"></span>
            </h3>
            <p className="text-sm text-gray-600 mb-6">Thank you for visiting us. Please subscribe to our newsletter today.</p>

            <div className="flex shadow-sm rounded-lg overflow-hidden mb-6">
              <input
                type="email"
                placeholder="Email Here"
                className="w-full px-4 py-2 text-sm border-none bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none"
              />
              <button className="bg-purple-600 text-white px-4 py-2 text-sm font-bold hover:bg-purple-700 transition-colors">
                Subscribe
              </button>
            </div>

            <div className="flex gap-2">
              {[Facebook, Twitter, Youtube, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-orange-500 transition-all hover:-translate-y-1">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>© {currentYear} <span className="text-purple-600 font-bold">RS Theme</span>. All Rights Reserved.</p>
        </div>
      </div>

      {/* Decorative Grass Image Placeholder (Bottom) */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-green-100 to-transparent opacity-40"></div>
    </footer>
  );
};

export default Footer;