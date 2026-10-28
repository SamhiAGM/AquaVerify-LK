import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Droplets,
  Edit,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Microscope,
  Phone,
  RefreshCw,
  Search,
  Shield,
  User,
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
import { CategoryBadge, StatusBadge } from '../../../components/ui/Badge';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Pagination } from '../../../components/ui/Pagination';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { complaintService } from '../../../services/complaintService';
import { dashboardService } from '../../../services/dashboardService';
import {
  Complaint,
  ComplaintCategory,
  ComplaintDetail,
  ComplaintStatus,
  OfficerDashboard,
} from '../../../types';
import { COMPLAINT_CATEGORIES } from '../../../utils/constants';

const COLORS = ['#087E83', '#176B91', '#159B86', '#D98368', '#6366F1', '#EC4899', '#8B5CF6'];

export const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Metrics
  const [dashboard, setDashboard] = useState<OfficerDashboard | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Status Progression Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('UNDER_INVESTIGATION');
  const [inspectionNote, setInspectionNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ComplaintDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Success Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setMetricsLoading(true);
      const data = await dashboardService.getOfficerDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load officer dashboard:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      setTableLoading(true);
      const res = await complaintService.getComplaints({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page,
        size: 8,
      });
      setComplaints(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load officer complaints:', err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [page, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadComplaints();
  };

  const handleOpenStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(
      complaint.status === 'PENDING'
        ? 'UNDER_INVESTIGATION'
        : complaint.status === 'UNDER_INVESTIGATION'
        ? 'TESTING_REQUESTED'
        : 'RESOLVED'
    );
    setInspectionNote('');
    setStatusError(null);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setStatusError(null);

    if (!inspectionNote.trim() || inspectionNote.trim().length < 5) {
      setStatusError('Inspection note / progress justification must be at least 5 characters.');
      return;
    }

    setStatusLoading(true);
    try {
      await complaintService.updateStatus(selectedComplaint.id, newStatus, inspectionNote.trim());
      setStatusModalOpen(false);
      setSuccessBanner(
        `Complaint ${selectedComplaint.complaintReference} progressed to ${newStatus}. Note logged in timeline.`
      );
      loadComplaints();
      loadDashboardData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setStatusError(
        axiosErr.response?.data?.message || 'Failed to update complaint status. Please try again.'
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const handleViewDetails = async (id: number) => {
    setDetailLoading(true);
    setDetailsModalOpen(true);
    try {
      const detail = await complaintService.getComplaintById(id);
      setSelectedDetail(detail);
    } catch (err) {
      console.error('Failed to load complaint details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Prepare chart data from PostgreSQL telemetry
  const chartData = dashboard?.complaintsByCategory
    ? Object.entries(dashboard.complaintsByCategory).map(([category, count]) => ({
        name: category
          .split('_')
          .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
          .join(' '),
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Water Quality Officer Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-slate-700">{user?.fullName}</span>.
            Overseeing complaints and field investigations in{' '}
            <span className="font-semibold text-teal-700">{user?.district} District</span>.
          </p>
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

      {/* 1. METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Cases"
          value={metricsLoading ? '—' : dashboard?.assignedComplaints ?? 0}
          subtitle="Cases assigned to your office"
          icon={<FileText className="w-6 h-6" />}
          iconColor="blue"
        />
        <StatCard
          title="Pending Reviews"
          value={metricsLoading ? '—' : dashboard?.pendingReviews ?? 0}
          subtitle="Initial triage required"
          icon={<Clock className="w-6 h-6" />}
          iconColor="amber"
        />
        <StatCard
          title="Under Investigation"
          value={metricsLoading ? '—' : dashboard?.underInvestigation ?? 0}
          subtitle="Active field sampling"
          icon={<Activity className="w-6 h-6" />}
          iconColor="purple"
        />
        <StatCard
          title="Resolved Cases"
          value={metricsLoading ? '—' : dashboard?.resolvedCases ?? 0}
          subtitle="Completed interventions"
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconColor="emerald"
        />
      </div>

      {/* 2. ANALYTICS CHART & OVERVIEW */}
      <div className="grid lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Complaint Frequency by Water Concern Category</CardTitle>
            <p className="text-xs text-slate-500">
              Live breakdown of reported anomalies across monitored sources
            </p>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No complaint telemetry data available yet
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 10, fill: '#64748B' }}
                    />
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
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Inspection Guide */}
        <Card className="lg:col-span-5 p-6 space-y-4 bg-gradient-to-br from-white to-teal-50/30">
          <h3 className="text-base font-bold text-slate-900">Officer Investigation Protocol</h3>
          <ul className="text-xs text-slate-600 space-y-3">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong>Acknowledge &amp; Triage:</strong> Review citizen observations and change
                status to <em>UNDER_INVESTIGATION</em> within 24 hours.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong>Field Sampling:</strong> Conduct on-site pH / turbidity check and transition
                to <em>TESTING_REQUESTED</em> for laboratory confirmation.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong>Remediation:</strong> Once lab metrics confirm SLS 614 conformity, log final
                resolution notes to notify the citizen.
              </span>
            </li>
          </ul>
        </Card>
      </div>

      {/* 3. ASSIGNED COMPLAINTS TABLE */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Assigned Complaint Queue</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage status transitions, record field investigation findings, and log timeline notes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference or title..."
                className="text-xs rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 focus:border-teal-600 focus:outline-none w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ComplaintStatus);
                setPage(0);
              }}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="TESTING_REQUESTED">Testing Requested</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCategoryFilter('');
                setPage(0);
                loadComplaints();
              }}
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {tableLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No complaints in queue</p>
              <p className="text-xs text-slate-500">
                No active complaints match the selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Citizen &amp; Contact</th>
                    <th className="py-3 px-4">Issue Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reported</th>
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
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {c.citizen.phone}
                        </p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {c.waterSource?.sourceName || 'General Supply'} &bull; {c.complaintCategory}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(c.id)}
                          title="View timeline & test details"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusModal(c)}
                          leftIcon={<Edit className="w-3.5 h-3.5" />}
                        >
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={8}
            onPageChange={(p) => setPage(p)}
          />
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* UPDATE STATUS & INSPECTION NOTE MODAL */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Investigation Status"
        description={`Record notes for complaint: ${selectedComplaint?.complaintReference}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          {statusError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {statusError}
            </div>
          )}

          <Select
            label="New Investigation Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
            required
          >
            <option value="UNDER_INVESTIGATION">Under Investigation (Site Inspection)</option>
            <option value="TESTING_REQUESTED">Testing Requested (Lab Sampling Scheduled)</option>
            <option value="RESOLVED">Resolved (Issue Rectified &amp; Safe)</option>
            <option value="REJECTED">Rejected (Non-actionable / False Report)</option>
          </Select>

          <Textarea
            label="Officer Inspection Note / Findings"
            value={inspectionNote}
            onChange={(e) => setInspectionNote(e.target.value)}
            placeholder="Document site findings, treatment plant adjustments, laboratory sample IDs dispatched, or chlorine residual measurements..."
            rows={4}
            required
            helperText="This note is permanently recorded in the complaint audit timeline."
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStatusModalOpen(false)}
              disabled={statusLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={statusLoading}>
              Save Status &amp; Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Complaint Investigation Details"
        description={selectedDetail?.complaint.complaintReference}
        maxWidth="xl"
      >
        {detailLoading || !selectedDetail ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading details...</div>
        ) : (
          <div className="space-y-6 text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedDetail.complaint.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Citizen: <strong>{selectedDetail.complaint.citizen.fullName}</strong> (
                    {selectedDetail.complaint.citizen.phone})
                  </p>
                </div>
                <StatusBadge status={selectedDetail.complaint.status} />
              </div>
              <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 mt-2">
                {selectedDetail.complaint.description}
              </p>
            </div>

            {/* Timeline */}
            <div>
              <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" /> Timeline &amp; Review History
              </h5>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {selectedDetail.timeline.map((u) => (
                  <div key={u.id} className="relative flex items-start space-x-3 ml-1">
                    <div className="w-4 h-4 rounded-full bg-teal-600 ring-4 ring-white shrink-0 mt-0.5" />
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-800">
                          {u.updatedBy.fullName} ({u.updatedBy.role})
                        </span>
                        <span>{new Date(u.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium mt-1">{u.note}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Transition: <span className="font-mono">{u.previousStatus}</span> &rarr;{' '}
                        <span className="font-mono font-bold text-teal-700">{u.newStatus}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
