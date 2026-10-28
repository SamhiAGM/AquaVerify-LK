import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Droplets,
  FileCheck,
  FileText,
  Filter,
  Layers,
  MapPin,
  Menu,
  Microscope,
  PhoneCall,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge, VerificationBadge } from '../../components/ui/Badge';
import { dashboardService } from '../../services/dashboardService';
import { waterTestService } from '../../services/waterTestService';
import { PublicStats, WaterTest } from '../../types';
import { SRI_LANKAN_DISTRICTS } from '../../utils/constants';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<PublicStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [verifiedTests, setVerifiedTests] = useState<WaterTest[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch real statistics from PostgreSQL backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await dashboardService.getPublicStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load public stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadData();
  }, []);

  // Fetch verified water quality records for public transparency feed
  useEffect(() => {
    const loadTests = async () => {
      try {
        const tests = await waterTestService.getVerifiedWaterTests(selectedDistrict || undefined);
        setVerifiedTests(tests.slice(0, 6)); // Display latest 6 verified tests
      } catch (err) {
        console.error('Failed to load verified tests:', err);
      }
    };
    loadTests();
  }, [selectedDistrict]);

  const handleReportClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard/citizen');
    } else {
      navigate('/login?redirect=report');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard/citizen';
    switch (user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'OFFICER':
        return '/dashboard/officer';
      case 'LAB_TECHNICIAN':
        return '/dashboard/laboratory';
      case 'CITIZEN':
      default:
        return '/dashboard/citizen';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="md" variant="full" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-teal-700 transition-colors">
              How It Works
            </a>
            <a href="#public-data" className="hover:text-teal-700 transition-colors">
              Water Quality Reports
            </a>
            <a href="#standards" className="hover:text-teal-700 transition-colors">
              SLS Standards
            </a>
            <a href="#faq" className="hover:text-teal-700 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <Button
                variant="teal"
                size="sm"
                onClick={() => navigate(getDashboardPath())}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="teal" size="sm">
                    Citizen Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-700"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-700"
            >
              How It Works
            </a>
            <a
              href="#public-data"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-700"
            >
              Water Quality Reports
            </a>
            <a
              href="#standards"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-700"
            >
              SLS Standards
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-700"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              {isAuthenticated ? (
                <Button variant="teal" onClick={() => navigate(getDashboardPath())}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button variant="teal" className="w-full">
                      Citizen Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-slate-900 to-slate-900 text-white py-20 lg:py-28">
        {/* Subtle decorative environmental background waves */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none" preserveAspectRatio="none">
            <path
              d="M0,192L48,208C96,224,192,256,288,240C384,224,480,160,576,149.3C672,139,768,181,864,213.3C960,245,1056,267,1152,245.3C1248,224,1344,160,1392,128L1440,96L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"
              fill="#159B86"
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Empowering Sri Lankan Communities
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Clean Water.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                  Informed Communities.
                </span>{' '}
                A Healthier Sri Lanka.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                AquaVerify LK helps communities report drinking-water concerns, follow complaint
                progress, and access verified water-quality testing records through one connected platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  variant="teal"
                  onClick={handleReportClick}
                  leftIcon={<Droplets className="w-5 h-5 text-teal-100" />}
                  className="w-full sm:w-auto font-semibold px-8 py-3.5 shadow-teal-900/40"
                >
                  Report a Water Issue
                </Button>

                <a href="#public-data" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-slate-500 text-slate-200 hover:bg-slate-800/80 hover:text-white"
                  >
                    Explore Water Quality Reports
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Standard</p>
                  <p className="text-sm font-bold text-white mt-0.5">SLS 614:2013</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Transparency</p>
                  <p className="text-sm font-bold text-teal-400 mt-0.5">100% Audit Logged</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Coverage</p>
                  <p className="text-sm font-bold text-white mt-0.5">25 Districts</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Verification Showcase Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                      Live Verification Pipeline
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">PostgreSQL Powered</span>
                </div>

                {/* Sample Verified Card */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-white">Kelani River Intake Plant #2</span>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-teal-400" /> Colombo District
                      </p>
                    </div>
                    <Badge variant="success" size="sm">
                      SLS 614 Compliant
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <p className="text-[10px] text-slate-400 uppercase">Acidity Level</p>
                      <p className="text-lg font-bold text-emerald-400">7.20 pH</p>
                      <span className="text-[9px] text-slate-500">Optimum (6.5 - 8.5)</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <p className="text-[10px] text-slate-400 uppercase">Turbidity</p>
                      <p className="text-lg font-bold text-emerald-400">1.45 NTU</p>
                      <span className="text-[9px] text-slate-500">Max limit 2.0 NTU</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Lab Ref: LAB-COL-2026-049</span>
                    <span className="text-teal-400 font-medium">Verified by Officer</span>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <p className="text-xs text-slate-400">
                    Need water quality assistance?{' '}
                    <Link to="/login" className="text-teal-400 font-semibold hover:underline">
                      Log in to access your dashboard
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM STATISTICS (Actual PostgreSQL Data) */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Live Database Telemetry
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Transparent National Water Accountability
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Complaints
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {statsLoading ? '—' : stats?.totalComplaints ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Reported by citizens</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resolved Complaints
              </p>
              <p className="text-3xl font-extrabold text-teal-700 mt-1">
                {statsLoading ? '—' : stats?.resolvedComplaints ?? 0}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {statsLoading
                  ? 'Calculating...'
                  : `${stats?.resolutionRate ?? 0}% resolution rate`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Water Tests Recorded
              </p>
              <p className="text-3xl font-extrabold text-cyan-800 mt-1">
                {statsLoading ? '—' : stats?.waterTestsRecorded ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Chemical & physical analyses</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Monitored Water Sources
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {statsLoading ? '—' : stats?.monitoredWaterSources ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Across 25 administrative districts</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              An Integrated Platform for Drinking Water Safety
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Connecting Sri Lankan residents directly with certified water quality officers,
              laboratories, and municipal administrators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card hover className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Water Quality Complaints</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log water concerns including unusual color, metallic odor, high turbidity, or
                pipe corrosion with GPS-tagged locations.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReportClick}
                className="text-teal-700 p-0 hover:bg-transparent"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Lodge Concern
              </Button>
            </Card>

            {/* Feature 2 */}
            <Card hover className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verified Laboratory Reports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Technicians submit water sample metrics (pH, turbidity, TDS, nitrates) verified
                against Sri Lankan SLS 614 standard specifications.
              </p>
              <a href="#public-data">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sky-700 p-0 hover:bg-transparent"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View Records
                </Button>
              </a>
            </Card>

            {/* Feature 3 */}
            <Card hover className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Full Lifecycle Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow your complaint through assigned investigation, field sample testing, and
                verified resolution with full audit timeline history.
              </p>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-700 p-0 hover:bg-transparent"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Track Reference
                </Button>
              </Link>
            </Card>

            {/* Feature 4 */}
            <Card hover className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Regional Insights</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empower municipal officials with district-level aggregations and incident frequency
                trends to deploy rapid field intervention.
              </p>
              <a href="#standards">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 p-0 hover:bg-transparent"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Limits
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS 3-STEP PROCESS */}
      <section id="how-it-works" className="py-20 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From Citizen Report to Verified Resolution
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Clear accountability and rapid investigation ensure drinking water issues are
              addressed methodically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Submit a Water Concern</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log in and describe the water abnormality (odor, color, sediment), link your water
                source, and immediately receive a unique reference code (e.g., AQV-2026-00101).
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Track Review and Testing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                An authorized Water Quality Officer investigates the site, logs inspection notes,
                and dispatches a laboratory technician to sample the affected source.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">View Updates and Verified Results</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review verified laboratory measurements against Sri Lankan SLS 614 thresholds and
                receive comprehensive resolution updates directly on your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED WATER QUALITY REPORTS TRANSPARENCY SECTION */}
      <section id="public-data" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
                Public Transparency
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Verified Water Quality Test Records
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Published laboratory reports authenticated by municipal water quality officers.
              </p>
            </div>

            {/* District Filter Dropdown */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="text-xs font-medium rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="">All Districts ({SRI_LANKAN_DISTRICTS.length})</option>
                {SRI_LANKAN_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Test Records Cards / Table */}
          {verifiedTests.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              <FileCheck className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No verified test records found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try selecting a different district or view all records.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedTests.map((test) => (
                <Card key={test.id} hover className="p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          {test.waterSourceName}
                        </span>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-teal-600" /> {test.district} District
                        </p>
                      </div>
                      <VerificationBadge status={test.verificationStatus} size="sm" />
                    </div>

                    {/* Measured Values */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-center">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Acidity (pH)
                        </span>
                        <p className="text-base font-bold text-teal-800">{test.phValue.toFixed(2)}</p>
                        <span className="text-[9px] text-slate-500">SLS 614: 6.5 - 8.5</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Turbidity (NTU)
                        </span>
                        <p className="text-base font-bold text-teal-800">
                          {test.turbidityNtu.toFixed(2)} NTU
                        </p>
                        <span className="text-[9px] text-slate-500">SLS max: 2.0 NTU</span>
                      </div>
                    </div>

                    {/* Additional measured parameters if available */}
                    {(test.tdsPpm || test.conductivityUsCm || test.nitrateMgL) && (
                      <div className="text-[11px] text-slate-600 bg-teal-50/50 p-2 rounded border border-teal-100/60 flex justify-between">
                        {test.tdsPpm && <span>TDS: {test.tdsPpm} ppm</span>}
                        {test.nitrateMgL && <span>Nitrate: {test.nitrateMgL} mg/L</span>}
                        {test.eColiPresence !== undefined && (
                          <span className={test.eColiPresence ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                            {test.eColiPresence ? 'E. coli Detected' : 'E. coli Negative'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Sample: {test.sampleDate}</span>
                    <span>Ref: {test.laboratoryReference}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <Link to="/login">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Log In for Complete Water Testing History & GIS Maps
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. SLS 614 STANDARDS & HEALTH INFORMATION SECTION */}
      <section id="standards" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Standard Specifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Sri Lanka Standard SLS 614:2013 Reference
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              AquaVerify LK benchmarks chemical and physical measurements against the national potable
              drinking water quality criteria.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 border-teal-100 bg-teal-50/30">
              <h3 className="text-base font-bold text-teal-900">Hydrogen Ion Exponent (pH)</h3>
              <p className="text-2xl font-extrabold text-teal-700">6.50 – 8.50</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Water below 6.5 is corrosive to piping systems and may leach heavy metals. Water
                above 8.5 tastes alkali and causes mineral encrustation in supply systems.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-sky-100 bg-sky-50/30">
              <h3 className="text-base font-bold text-sky-900">Turbidity Threshold</h3>
              <p className="text-2xl font-extrabold text-sky-700">&le; 2.00 NTU</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nephelometric Turbidity Units measure suspended colloidal particles. Excessive
                turbidity shields microbiological pathogens from disinfection agents.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-slate-200 bg-slate-50/40">
              <h3 className="text-base font-bold text-slate-900">Academic Disclaimer</h3>
              <p className="text-xs font-semibold text-amber-700 uppercase">Demonstration Platform</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Measurements of pH and turbidity alone do not constitute absolute bacteriological
                potability. This platform is an academic demonstration and not an officially accredited
                certification authority.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Answers & Assistance
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h4 className="text-sm font-bold text-slate-900">
                Who can register for an account on AquaVerify LK?
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Any resident in Sri Lanka can create a Citizen account with an email address and
                contact phone number. Privileged accounts (Water Quality Officers, Lab Technicians,
                and Administrators) are provisioned directly by system administrators.
              </p>
            </Card>

            <Card className="p-5">
              <h4 className="text-sm font-bold text-slate-900">
                How quickly are reported water issues investigated?
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Once submitted, complaints receive an automated tracking reference and appear in the
                assigned District Water Quality Officer dashboard for status progression and field
                inspection scheduling.
              </p>
            </Card>

            <Card className="p-5">
              <h4 className="text-sm font-bold text-slate-900">
                Can I edit or delete a complaint I previously submitted?
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Yes. Citizens can update or withdraw complaints while they remain in the
                &quot;PENDING&quot; status before formal investigation has commenced.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <Logo size="md" variant="full" theme="dark" />
            <div className="flex flex-wrap gap-6 text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#public-data" className="hover:text-white transition-colors">
                Water Quality Data
              </a>
              <Link to="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} AquaVerify LK. Designed and engineered for academic
              evaluation (EC4307). All rights reserved.
            </p>
            <p className="text-[11px]">
              Reference Standard: Sri Lanka Standard SLS 614:2013 | PostgreSQL 18 &amp; Spring Boot 3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
