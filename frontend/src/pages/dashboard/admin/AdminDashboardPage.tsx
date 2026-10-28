import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Droplets,
  Edit,
  Eye,
  FileCheck,
  FileText,
  Filter,
  History,
  Lock,
  Mail,
  MapPin,
  Microscope,
  Phone,
  Plus,
  Power,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { CategoryBadge, RoleBadge, StatusBadge, VerificationBadge } from '../../../components/ui/Badge';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Pagination } from '../../../components/ui/Pagination';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { complaintService } from '../../../services/complaintService';
import { dashboardService } from '../../../services/dashboardService';
import { userService } from '../../../services/userService';
import { waterSourceService } from '../../../services/waterSourceService';
import { waterTestService } from '../../../services/waterTestService';
import {
  AdminDashboard,
  AuditLog,
  Complaint,
  Role,
  User,
  WaterSource,
  WaterSourceType,
  WaterTest,
} from '../../../types';
import { SRI_LANKAN_DISTRICTS, WATER_SOURCE_TYPES } from '../../../utils/constants';

const PIE_COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'];
const BAR_COLORS = ['#087E83', '#176B91', '#159B86', '#D98368', '#4F46E5', '#065F46'];

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Active Tab: 'overview' | 'users' | 'complaints' | 'sources' | 'tests' | 'audit'
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'complaints' | 'sources' | 'tests' | 'audit'>('overview');

  // Executive Dashboard Telemetry
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // USERS TAB STATE
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<Role | ''>('');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalElements, setUserTotalElements] = useState(0);

  // Provision Staff Modal State
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffFullName, setStaffFullName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDistrict, setStaffDistrict] = useState('Colombo');
  const [staffRole, setStaffRole] = useState<Role>('OFFICER');
  const [staffPassword, setStaffPassword] = useState('Staff@123');
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // WATER SOURCES TAB STATE
  const [sources, setSources] = useState<WaterSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<WaterSource | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState<WaterSourceType>('COMMUNITY_TANK');
  const [sourceDistrict, setSourceDistrict] = useState('Colombo');
  const [sourceLocationDesc, setSourceLocationDesc] = useState('');
  const [sourceLat, setSourceLat] = useState('');
  const [sourceLng, setSourceLng] = useState('');
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);

  // COMPLAINT ASSIGNMENT STATE
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [availableOfficers, setAvailableOfficers] = useState<User[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [assignNote, setAssignNote] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // WATER TESTS VERIFICATION STATE
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  // AUDIT LOGS STATE
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Feedback Notification Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Load Executive Overview
  const loadExecutiveDashboard = async () => {
    try {
      setMetricsLoading(true);
      const data = await dashboardService.getAdminDashboard();
      setDashboard(data);
      setAuditLogs(data.recentAuditLogs || []);
    } catch (err) {
      console.error('Failed to load executive metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Load Users
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await userService.getUsers({
        role: userRoleFilter || undefined,
        search: userSearch.trim() || undefined,
        page: userPage,
        size: 10,
      });
      setUsers(res.content);
      setUserTotalPages(res.totalPages);
      setUserTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Water Sources
  const loadWaterSources = async () => {
    try {
      setSourcesLoading(true);
      const res = await waterSourceService.getWaterSources({ size: 20 });
      setSources(res.content);
    } catch (err) {
      console.error('Failed to load water sources:', err);
    } finally {
      setSourcesLoading(false);
    }
  };

  // Load Complaints for Admin
  const loadComplaints = async () => {
    try {
      const res = await complaintService.getComplaints({ size: 15 });
      setComplaints(res.content);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  };

  // Load Water Tests for Admin Verification
  const loadWaterTests = async () => {
    try {
      setTestsLoading(true);
      const res = await waterTestService.getWaterTests({ size: 15 });
      setTests(res.content);
    } catch (err) {
      console.error('Failed to load water tests:', err);
    } finally {
      setTestsLoading(false);
    }
  };

  // Load Officers for Assignment Dropdown
  const loadOfficers = async () => {
    try {
      const res = await userService.getUsers({ role: 'OFFICER', size: 50 });
      setAvailableOfficers(res.content);
      if (res.content.length > 0) {
        setSelectedOfficerId(String(res.content[0].id));
      }
    } catch (err) {
      console.error('Failed to load officers:', err);
    }
  };

  useEffect(() => {
    loadExecutiveDashboard();
    loadOfficers();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'sources') loadWaterSources();
    if (activeTab === 'complaints') loadComplaints();
    if (activeTab === 'tests') loadWaterTests();
  }, [activeTab, userPage, userRoleFilter]);

  // PROVISION STAFF ACCOUNT
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);

    if (!staffFullName.trim() || !staffEmail.trim() || !staffPhone.trim()) {
      setStaffError('All fields are required.');
      return;
    }

    setStaffLoading(true);
    try {
      const newUser = await userService.createStaffUser({
        fullName: staffFullName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim(),
        district: staffDistrict,
        role: staffRole,
        password: staffPassword,
      });

      setStaffModalOpen(false);
      setSuccessBanner(
        `Staff account for ${newUser.fullName} (${newUser.role}) provisioned successfully.`
      );
      setStaffFullName('');
      setStaffEmail('');
      setStaffPhone('');
      loadUsers();
      loadExecutiveDashboard();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setStaffError(
        axiosErr.response?.data?.message || 'Failed to provision staff account. Please verify data.'
      );
    } finally {
      setStaffLoading(false);
    }
  };

  // TOGGLE USER ENABLED STATUS
  const handleToggleUserStatus = async (targetUser: User) => {
    try {
      const updated = await userService.toggleUserStatus(targetUser.id);
      setSuccessBanner(
        `User ${updated.fullName} account status changed to ${updated.enabled ? 'ACTIVE' : 'DISABLED'}.`
      );
      loadUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Cannot toggle own status.');
    }
  };

  // OPEN SOURCE CREATE / EDIT MODAL
  const handleOpenSourceModal = (source?: WaterSource) => {
    setSourceError(null);
    if (source) {
      setEditingSource(source);
      setSourceName(source.sourceName);
      setSourceType(source.sourceType);
      setSourceDistrict(source.district);
      setSourceLocationDesc(source.locationDescription);
      setSourceLat(source.latitude ? String(source.latitude) : '');
      setSourceLng(source.longitude ? String(source.longitude) : '');
    } else {
      setEditingSource(null);
      setSourceName('');
      setSourceType('COMMUNITY_TANK');
      setSourceDistrict('Colombo');
      setSourceLocationDesc('');
      setSourceLat('');
      setSourceLng('');
    }
    setSourceModalOpen(true);
  };

  // SUBMIT SOURCE CREATE / UPDATE
  const handleSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSourceError(null);

    if (!sourceName.trim() || !sourceLocationDesc.trim()) {
      setSourceError('Source name and location description are required.');
      return;
    }

    setSourceLoading(true);
    try {
      const payload = {
        sourceName: sourceName.trim(),
        sourceType,
        district: sourceDistrict,
        locationDescription: sourceLocationDesc.trim(),
        latitude: sourceLat ? parseFloat(sourceLat) : null,
        longitude: sourceLng ? parseFloat(sourceLng) : null,
      };

      if (editingSource) {
        await waterSourceService.updateWaterSource(editingSource.id, payload);
        setSuccessBanner(`Water source ${sourceName} updated.`);
      } else {
        await waterSourceService.createWaterSource(payload);
        setSuccessBanner(`New water source ${sourceName} registered.`);
      }

      setSourceModalOpen(false);
      loadWaterSources();
      loadExecutiveDashboard();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setSourceError(axiosErr.response?.data?.message || 'Failed to save water source.');
    } finally {
      setSourceLoading(false);
    }
  };

  // DELETE WATER SOURCE
  const handleDeleteSource = async (id: number) => {
    if (!confirm('Are you sure you want to delete this registered water source?')) return;
    try {
      await waterSourceService.deleteWaterSource(id);
      setSuccessBanner('Water source removed.');
      loadWaterSources();
      loadExecutiveDashboard();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Cannot delete water source with active tests.');
    }
  };

  // OPEN ASSIGN COMPLAINT MODAL
  const handleOpenAssignModal = (complaint: Complaint) => {
    setAssigningComplaint(complaint);
    setAssignNote('Assigned for prompt district inspection and water sampling.');
    setAssignModalOpen(true);
  };

  // SUBMIT ASSIGNMENT
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningComplaint || !selectedOfficerId) return;

    setAssignLoading(true);
    try {
      await complaintService.assignOfficer(
        assigningComplaint.id,
        Number(selectedOfficerId),
        assignNote.trim()
      );
      setAssignModalOpen(false);
      setSuccessBanner(
        `Complaint ${assigningComplaint.complaintReference} assigned to officer successfully.`
      );
      loadComplaints();
      loadExecutiveDashboard();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setAssignLoading(false);
    }
  };

  // VERIFY WATER TEST RECORD (Approve for public feed)
  const handleVerifyTest = async (testId: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await waterTestService.verifyWaterTest(testId, status);
      setSuccessBanner(`Water test status marked as ${status}. Public visibility updated.`);
      loadWaterTests();
      loadExecutiveDashboard();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to update verification status.');
    }
  };

  // Prepare District Analytics Bar Chart Data
  const districtChartData = dashboard?.complaintsByDistrict
    ? Object.entries(dashboard.complaintsByDistrict).map(([district, count]) => ({
        district,
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Executive oversight, user provisioning, case assignment, and public transparency governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            onClick={() => setStaffModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Provision Staff Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenSourceModal()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Register Source
          </Button>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. EXECUTIVE KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Users"
          value={metricsLoading ? '—' : dashboard?.registeredUsers ?? 0}
          icon={<Users className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Total Cases"
          value={metricsLoading ? '—' : dashboard?.totalComplaints ?? 0}
          icon={<FileText className="w-5 h-5" />}
          iconColor="amber"
        />
        <StatCard
          title="Active"
          value={metricsLoading ? '—' : dashboard?.activeComplaints ?? 0}
          icon={<Activity className="w-5 h-5" />}
          iconColor="purple"
        />
        <StatCard
          title="Resolved"
          value={metricsLoading ? '—' : dashboard?.resolvedComplaints ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="emerald"
        />
        <StatCard
          title="Sources"
          value={metricsLoading ? '—' : dashboard?.totalWaterSources ?? 0}
          icon={<Droplets className="w-5 h-5" />}
          iconColor="teal"
        />
        <StatCard
          title="Lab Tests"
          value={metricsLoading ? '—' : dashboard?.totalTestsRecorded ?? 0}
          icon={<Microscope className="w-5 h-5" />}
          iconColor="blue"
        />
      </div>

      {/* 2. TAB NAVIGATION BAR */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-4 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white border-t-2 border-teal-600 text-teal-800 border-x border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview &amp; District Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-white border-t-2 border-teal-600 text-teal-800 border-x border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          User Management ({dashboard?.registeredUsers ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`py-2.5 px-4 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'complaints'
              ? 'bg-white border-t-2 border-teal-600 text-teal-800 border-x border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Complaint Assignments
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`py-2.5 px-4 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'sources'
              ? 'bg-white border-t-2 border-teal-600 text-teal-800 border-x border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Water Sources ({dashboard?.totalWaterSources ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`py-2.5 px-4 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'tests'
              ? 'bg-white border-t-2 border-teal-600 text-teal-800 border-x border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Lab Test Verifications
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2.5 px-4 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-white border-t-2 border-teal-600 text-teal-800 border-x border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8">
              <CardHeader>
                <CardTitle>Regional Complaint Distribution by Sri Lankan District</CardTitle>
                <p className="text-xs text-slate-500">
                  Real-time geographic incidents queried from PostgreSQL
                </p>
              </CardHeader>
              <CardContent>
                {districtChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                    No geographic complaint telemetry recorded yet
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={districtChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderRadius: '8px',
                            border: 'none',
                            color: '#FFF',
                            fontSize: '11px',
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {districtChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">System Health &amp; Architecture</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex justify-between">
                  <span>Backend Engine:</span>
                  <strong className="text-slate-800">Spring Boot 3.3.5 (Java 21)</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex justify-between">
                  <span>Primary Database:</span>
                  <strong className="text-slate-800">PostgreSQL 18 (Flyway V2)</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex justify-between">
                  <span>Security Layer:</span>
                  <strong className="text-slate-800">Stateless JWT + BCrypt</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex justify-between">
                  <span>Reference Standard:</span>
                  <strong className="text-teal-700">SLS 614:2013 Potability</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Registered Accounts Directory</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage roles, provision quality officers &amp; laboratory technicians, and toggle account access.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value as Role);
                  setUserPage(0);
                }}
                className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="OFFICER">Quality Officer</option>
                <option value="LAB_TECHNICIAN">Lab Technician</option>
                <option value="CITIZEN">Citizen</option>
              </select>

              <Button variant="teal" size="sm" onClick={() => setStaffModalOpen(true)}>
                + Provision Staff
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {usersLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <RoleBadge role={u.role} size="sm" />
                        </td>
                        <td className="py-3 px-4">{u.district}</td>
                        <td className="py-3 px-4 text-slate-500">{u.phone}</td>
                        <td className="py-3 px-4">
                          {u.enabled ? (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={u.enabled ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleToggleUserStatus(u)}
                            disabled={u.id === user?.id}
                            title={u.id === user?.id ? 'Cannot disable own account' : 'Toggle account access'}
                          >
                            <Power className="w-3.5 h-3.5 mr-1" />
                            {u.enabled ? 'Disable' : 'Enable'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={userPage}
              totalPages={userTotalPages}
              totalElements={userTotalElements}
              pageSize={10}
              onPageChange={(p) => setUserPage(p)}
            />
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMPLAINT ASSIGNMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'complaints' && (
        <Card>
          <CardHeader>
            <CardTitle>National Complaint Triage &amp; Officer Assignment</CardTitle>
            <p className="text-xs text-slate-500">
              Assign reported cases to district quality officers for on-site inspection.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Citizen</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">
                        {c.complaintReference}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{c.citizen.fullName}</p>
                        <p className="text-[11px] text-slate-400">{c.citizen.district}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs font-semibold text-slate-800 truncate">
                        {c.title}
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category={c.complaintCategory} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        {c.assignedOfficer ? (
                          <span className="font-semibold text-slate-800">
                            {c.assignedOfficer.fullName}
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                            Awaiting Officer
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssignModal(c)}
                        >
                          {c.assignedOfficer ? 'Reassign' : 'Assign Officer'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WATER SOURCE CRUD */}
      {/* ========================================================================= */}
      {activeTab === 'sources' && (
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Registered Drinking Water Sources</CardTitle>
              <p className="text-xs text-slate-500">
                Piped tap lines, gravity tanks, deep wells, and catchment reservoirs.
              </p>
            </div>
            <Button
              variant="teal"
              size="sm"
              onClick={() => handleOpenSourceModal()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New Source
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {sourcesLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Source Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Location Description</th>
                      <th className="py-3 px-4">Active Cases</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sources.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.sourceName}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-teal-800">
                          {s.sourceType}
                        </td>
                        <td className="py-3 px-4">{s.district}</td>
                        <td className="py-3 px-4 max-w-sm text-slate-500 truncate">
                          {s.locationDescription}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {s.activeComplaintsCount ?? 0}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenSourceModal(s)}
                            title="Edit water source"
                          >
                            <Edit className="w-4 h-4 text-teal-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSource(s.id)}
                            title="Delete water source"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: WATER TESTS VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'tests' && (
        <Card>
          <CardHeader>
            <CardTitle>Laboratory Verification &amp; Public Transparency Release</CardTitle>
            <p className="text-xs text-slate-500">
              Only verified records are published on the public transparency feed.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {testsLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Lab Ref</th>
                      <th className="py-3 px-4">Water Source</th>
                      <th className="py-3 px-4">pH</th>
                      <th className="py-3 px-4">Turbidity</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4 text-right">Publication Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tests.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-teal-800">
                          {t.laboratoryReference}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {t.waterSourceName} ({t.district})
                        </td>
                        <td className="py-3 px-4">{t.phValue.toFixed(2)}</td>
                        <td className="py-3 px-4">{t.turbidityNtu.toFixed(2)} NTU</td>
                        <td className="py-3 px-4">
                          <VerificationBadge status={t.verificationStatus} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          {t.verificationStatus !== 'VERIFIED' && (
                            <Button
                              variant="teal"
                              size="sm"
                              onClick={() => handleVerifyTest(t.id, 'VERIFIED')}
                            >
                              Verify &amp; Publish
                            </Button>
                          )}
                          {t.verificationStatus !== 'REJECTED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleVerifyTest(t.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Chronological Audit History</CardTitle>
            <p className="text-xs text-slate-500">
              System actions, verification events, status changes, and administrative actions.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No audit events recorded.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {log.entityType} #{log.entityId}
                        </span>
                      </div>
                      <p className="text-slate-600">{log.details}</p>
                      <p className="text-[10px] text-slate-400">
                        Actor:{' '}
                        <strong>
                          {log.actor ? `${log.actor.fullName} (${log.actor.role})` : 'System'}
                        </strong>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* PROVISION STAFF MODAL */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title="Provision Privileged Staff Account"
        description="Create authorized Quality Officer or Lab Technician credentials."
      >
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          {staffError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {staffError}
            </div>
          )}

          <Input
            label="Full Name"
            value={staffFullName}
            onChange={(e) => setStaffFullName(e.target.value)}
            placeholder="e.g. Dr. Rohan Gunaratne"
            required
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Staff Email"
              type="email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder="officer@aquaverify.lk"
              required
            />
            <Input
              label="Contact Phone"
              value={staffPhone}
              onChange={(e) => setStaffPhone(e.target.value)}
              placeholder="+94712345678"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Assigned Role"
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as Role)}
              required
            >
              <option value="OFFICER">Water Quality Officer</option>
              <option value="LAB_TECHNICIAN">Laboratory Technician</option>
              <option value="ADMIN">System Administrator</option>
            </Select>

            <Select
              label="Jurisdiction District"
              value={staffDistrict}
              onChange={(e) => setStaffDistrict(e.target.value)}
              required
            >
              {SRI_LANKAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Initial Password"
            value={staffPassword}
            onChange={(e) => setStaffPassword(e.target.value)}
            required
            helperText="Staff must satisfy password policy (min 8 chars with uppercase, digit, symbol)."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStaffModalOpen(false)}
              disabled={staffLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={staffLoading}>
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* WATER SOURCE MODAL */}
      <Modal
        isOpen={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        title={editingSource ? 'Edit Water Source' : 'Register Water Source'}
        description="Manage monitored public supply points."
      >
        <form onSubmit={handleSourceSubmit} className="space-y-4">
          {sourceError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {sourceError}
            </div>
          )}

          <Input
            label="Source Name"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="e.g. Ambatale Intake Basin #3"
            required
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Source Category"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as WaterSourceType)}
              required
            >
              {WATER_SOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>

            <Select
              label="District"
              value={sourceDistrict}
              onChange={(e) => setSourceDistrict(e.target.value)}
              required
            >
              {SRI_LANKAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Location Description"
            value={sourceLocationDesc}
            onChange={(e) => setSourceLocationDesc(e.target.value)}
            placeholder="Nearby municipal landmarks, pumping station corridor, GPS markers..."
            rows={3}
            required
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Latitude (optional)"
              type="number"
              step="any"
              value={sourceLat}
              onChange={(e) => setSourceLat(e.target.value)}
              placeholder="6.9271"
            />
            <Input
              label="Longitude (optional)"
              type="number"
              step="any"
              value={sourceLng}
              onChange={(e) => setSourceLng(e.target.value)}
              placeholder="79.8612"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSourceModalOpen(false)}
              disabled={sourceLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={sourceLoading}>
              {editingSource ? 'Update Source' : 'Register Source'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN OFFICER MODAL */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Complaint to Officer"
        description={`Case Ref: ${assigningComplaint?.complaintReference}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <Select
            label="Select Quality Officer"
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
            required
          >
            {availableOfficers.map((off) => (
              <option key={off.id} value={off.id}>
                {off.fullName} — {off.district} District ({off.email})
              </option>
            ))}
          </Select>

          <Textarea
            label="Assignment Instructions / Triage Priority"
            value={assignNote}
            onChange={(e) => setAssignNote(e.target.value)}
            rows={3}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAssignModalOpen(false)}
              disabled={assignLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={assignLoading}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
