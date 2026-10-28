import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Droplets,
  FileCheck,
  FilePlus,
  FileText,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Microscope,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { RoleBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine navigation items by user role
  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    switch (user.role) {
      case 'CITIZEN':
        return [
          {
            label: 'Overview',
            path: '/dashboard/citizen',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            label: 'Submit Complaint',
            path: '/dashboard/citizen/submit',
            icon: <FilePlus className="w-4 h-4" />,
          },
          {
            label: 'My Complaints',
            path: '/dashboard/citizen/complaints',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            label: 'Water Quality Reports',
            path: '/dashboard/citizen/reports',
            icon: <FileCheck className="w-4 h-4" />,
          },
          {
            label: 'Water Sources',
            path: '/dashboard/citizen/sources',
            icon: <Droplets className="w-4 h-4" />,
          },
          {
            label: 'My Profile',
            path: '/dashboard/profile',
            icon: <UserIcon className="w-4 h-4" />,
          },
        ];

      case 'OFFICER':
        return [
          {
            label: 'Officer Overview',
            path: '/dashboard/officer',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            label: 'Assigned Complaints',
            path: '/dashboard/officer/complaints',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            label: 'Water Sources',
            path: '/dashboard/officer/sources',
            icon: <Droplets className="w-4 h-4" />,
          },
          {
            label: 'Lab Verifications',
            path: '/dashboard/officer/reports',
            icon: <FileCheck className="w-4 h-4" />,
          },
          {
            label: 'My Profile',
            path: '/dashboard/profile',
            icon: <UserIcon className="w-4 h-4" />,
          },
        ];

      case 'LAB_TECHNICIAN':
        return [
          {
            label: 'Lab Dashboard',
            path: '/dashboard/laboratory',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            label: 'Water Tests',
            path: '/dashboard/laboratory/tests',
            icon: <Microscope className="w-4 h-4" />,
          },
          {
            label: 'Add Test Result',
            path: '/dashboard/laboratory/new',
            icon: <FilePlus className="w-4 h-4" />,
          },
          {
            label: 'Water Sources',
            path: '/dashboard/laboratory/sources',
            icon: <Droplets className="w-4 h-4" />,
          },
          {
            label: 'My Profile',
            path: '/dashboard/profile',
            icon: <UserIcon className="w-4 h-4" />,
          },
        ];

      case 'ADMIN':
      default:
        return [
          {
            label: 'Executive Overview',
            path: '/dashboard/admin',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            label: 'User Management',
            path: '/dashboard/admin/users',
            icon: <Users className="w-4 h-4" />,
          },
          {
            label: 'Complaints',
            path: '/dashboard/admin/complaints',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            label: 'Water Sources',
            path: '/dashboard/admin/sources',
            icon: <Droplets className="w-4 h-4" />,
          },
          {
            label: 'Water Tests',
            path: '/dashboard/admin/tests',
            icon: <Microscope className="w-4 h-4" />,
          },
          {
            label: 'Audit Logs',
            path: '/dashboard/admin/audit-logs',
            icon: <History className="w-4 h-4" />,
          },
          {
            label: 'My Profile',
            path: '/dashboard/profile',
            icon: <UserIcon className="w-4 h-4" />,
          },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-100/70 flex font-sans text-slate-800">
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out shrink-0 border-r border-slate-800 relative z-20 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <Link to="/" className="overflow-hidden">
            <Logo
              size="md"
              variant={sidebarCollapsed ? 'icon' : 'full'}
              theme="dark"
            />
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Role Card inside sidebar */}
        {!sidebarCollapsed && user && (
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
            <div className="mt-2 flex items-center justify-between">
              <RoleBadge role={user.role} size="sm" />
              <span className="text-[10px] text-teal-400 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {user.district}
              </span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-slate-900 text-slate-300 flex flex-col p-4 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <Logo size="md" variant="full" theme="dark" />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {user && (
              <div className="my-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-xs font-semibold text-white">{user.fullName}</p>
                <p className="text-[11px] text-slate-400">{user.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <RoleBadge role={user.role} size="sm" />
                  <span className="text-[10px] text-teal-400">{user.district} District</span>
                </div>
              </div>
            )}

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                      isActive
                        ? 'bg-teal-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Link to="/" className="hover:text-teal-700 font-medium">
                AquaVerify
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold capitalize">
                {user?.role.toLowerCase().replace('_', ' ')} Portal
              </span>
            </div>
          </div>

          {/* Right Header: District Badge + Quick Public View + Profile Menu */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                View Public Site &rarr;
              </Button>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>{user?.district || 'Western'}</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.fullName.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize leading-tight">
                    {user?.role.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in-50 zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>My Profile &amp; Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
