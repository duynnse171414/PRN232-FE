import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Cpu className="size-8 text-blue-500" />
              <span className="text-xl font-bold text-white">TechStore</span>
            </Link>
            <p className="text-sm">
              Your trusted source for computer components and custom-built PCs.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Instagram className="size-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Youtube className="size-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-blue-500 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=Complete%20PC" className="hover:text-blue-500 transition-colors">
                  Pre-Built PCs
                </Link>
              </li>
              <li>
                <Link to="/build-pc" className="hover:text-blue-500 transition-colors">
                  Build Your PC
                </Link>
              </li>
              <li>
                <Link to="/products?category=GPU" className="hover:text-blue-500 transition-colors">
                  Graphics Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Warranty
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2026 TechStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
