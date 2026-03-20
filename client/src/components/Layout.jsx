import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../api';
import { Car, Menu, X, LogOut, LayoutDashboard, Users, BookOpen, Star, Package, MapPin, Building2 } from 'lucide-react';

export default function Layout() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const user = getUser();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Car className="w-7 h-7" />
            <span className="hidden sm:inline">DrivingSchool<span className="text-blue-300">.uk</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/schools" className="hover:text-blue-300 transition">Find a School</Link>
            <Link to="/theory" className="hover:text-blue-300 transition">Theory Practice</Link>
            {user ? (
              <>
                {isAdmin && <Link to="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link>}
                <span className="text-blue-300 text-xs">{user.name}</span>
                <button onClick={logout} className="hover:text-red-300 transition text-xs">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-300 transition">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">Get Started</Link>
              </>
            )}
          </nav>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-blue-800 px-4 py-4 space-y-3">
            <Link to="/schools" className="block hover:text-blue-300" onClick={() => setMenuOpen(false)}>Find a School</Link>
            <Link to="/theory" className="block hover:text-blue-300" onClick={() => setMenuOpen(false)}>Theory Practice</Link>
            {user ? (
              <>
                {isAdmin && <Link to="/dashboard" className="block hover:text-blue-300" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
                <button onClick={logout} className="block text-red-300">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-blue-300" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block hover:text-blue-300" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Admin sidebar for logged-in admins */}
      <div className="flex flex-1">
        {user && isAdmin && (
          <aside className="hidden lg:block w-56 bg-gray-900 text-gray-300 p-4 space-y-1 text-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Admin Panel</p>
            <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 hover:text-white"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
            {user.role === 'superadmin' && <Link to="/admin/tenants" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 hover:text-white"><Building2 className="w-4 h-4" /> Schools</Link>}
            <Link to="/admin/instructors" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 hover:text-white"><Users className="w-4 h-4" /> Instructors</Link>
            <Link to="/admin/bookings" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 hover:text-white"><BookOpen className="w-4 h-4" /> Bookings</Link>
            <Link to="/admin/reviews" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 hover:text-white"><Star className="w-4 h-4" /> Reviews</Link>
            <Link to="/admin/packages" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 hover:text-white"><Package className="w-4 h-4" /> Packages</Link>
            <Link to="/admin/areas" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 hover:text-white"><MapPin className="w-4 h-4" /> Areas</Link>
            <Link to="/admin/users" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 hover:text-white"><Users className="w-4 h-4" /> Users</Link>
          </aside>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Car className="w-5 h-5" /> DrivingSchool.uk</h3>
            <p>Multi-tenant driving school management platform. Find lessons, book instructors, and pass your test.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">For Learners</h4>
            <ul className="space-y-1">
              <li><Link to="/schools" className="hover:text-white">Find a School</Link></li>
              <li><Link to="/theory" className="hover:text-white">Theory Practice</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">For Schools</h4>
            <ul className="space-y-1">
              <li><Link to="/register" className="hover:text-white">Register Your School</Link></li>
              <li><Link to="/login" className="hover:text-white">School Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Resources</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-white">Highway Code</a></li>
              <li><a href="#" className="hover:text-white">Test Centres</a></li>
              <li><a href="#" className="hover:text-white">Pricing Guide</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-800 text-xs text-center">
          © 2026 DrivingSchool Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
