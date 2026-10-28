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
  FilePlus,
  FileText,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { CategoryBadge, StatusBadge, VerificationBadge } from '../../../components/ui/Badge';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Pagination } from '../../../components/ui/Pagination';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { complaintService } from '../../../services/complaintService';
import { dashboardService } from '../../../services/dashboardService';
import { waterSourceService } from '../../../services/waterSourceService';
import {
  CitizenDashboard,
  Complaint,
  ComplaintCategory,
  ComplaintDetail,
  ComplaintStatus,
  WaterSource,
} from '../../../types';
import { COMPLAINT_CATEGORIES } from '../../../utils/constants';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Metrics
  const [dashboard, setDashboard] = useState<CitizenDashboard | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Complaints table state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Water Sources for dropdown
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);

  // Create Complaint Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ComplaintCategory>('COLOR_DISCOLORATION');
  const [newWaterSourceId, setNewWaterSourceId] = useState<string>('');
  const [createLoading, setCreateLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Complaint Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<ComplaintCategory>('COLOR_DISCOLORATION');
  const [editWaterSourceId, setEditWaterSourceId] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete Confirm State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ComplaintDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Success Notification banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Load Dashboard Stats
  const loadDashboardData = async () => {
    try {
      setMetricsLoading(true);
      const data = await dashboardService.getCitizenDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load citizen dashboard telemetry:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Load Complaints with search & filters
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
      console.error('Failed to load citizen complaints:', err);
    } finally {
      setTableLoading(false);
    }
  };

  // Load Water Sources for forms
  const loadWaterSources = async () => {
    try {
      const sources = await waterSourceService.getAllWaterSources();
      setWaterSources(sources);
    } catch (err) {
      console.error('Failed to load water sources:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadWaterSources();
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    if (location.pathname.endsWith('/submit')) {
      setFormError(null);
      setCreateModalOpen(true);
    }
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadComplaints();
  };

  // CREATE COMPLAINT SUBMISSION
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTitle.trim() || newTitle.trim().length < 5) {
      setFormError('Complaint title must be at least 5 characters.');
      return;
    }
    if (!newDescription.trim() || newDescription.trim().length < 10) {
      setFormError('Detailed description must be at least 10 characters.');
      return;
    }

    setCreateLoading(true);
    try {
      const created = await complaintService.createComplaint({
        title: newTitle.trim(),
        description: newDescription.trim(),
        complaintCategory: newCategory,
        waterSourceId: newWaterSourceId ? Number(newWaterSourceId) : null,
      });

      setCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewCategory('COLOR_DISCOLORATION');
      setNewWaterSourceId('');
      setSuccessBanner(
        `Complaint lodged successfully with reference ${created.complaintReference}!`
      );

      // Refresh list & metrics
      loadComplaints();
      loadDashboardData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(
        axiosErr.response?.data?.message || 'Failed to submit complaint. Please try again.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // OPEN EDIT MODAL
  const handleOpenEdit = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setEditTitle(complaint.title);
    setEditDescription(complaint.description);
    setEditCategory(complaint.complaintCategory);
    setEditWaterSourceId(complaint.waterSource ? String(complaint.waterSource.id) : '');
    setFormError(null);
    setEditModalOpen(true);
  };

  // SUBMIT EDIT
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setFormError(null);

    setEditLoading(true);
    try {
      await complaintService.updateComplaint(editingComplaint.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        complaintCategory: editCategory,
        waterSourceId: editWaterSourceId ? Number(editWaterSourceId) : null,
      });

      setEditModalOpen(false);
      setSuccessBanner('Complaint details updated successfully.');
      loadComplaints();
      loadDashboardData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(
        axiosErr.response?.data?.message || 'Failed to update complaint. You can only edit PENDING records.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  // OPEN DELETE CONFIRM
  const handleOpenDelete = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  // EXECUTE DELETE
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await complaintService.deleteComplaint(deletingId);
      setDeleteDialogOpen(false);
      setSuccessBanner('Complaint withdrawn and deleted from records.');
      loadComplaints();
      loadDashboardData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(
        axiosErr.response?.data?.message ||
          'Failed to delete complaint. Only PENDING complaints can be deleted.'
      );
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  // VIEW COMPLAINT DETAILS WITH TIMELINE
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

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Citizen Water Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700">{user?.fullName}</span>.
            Report and monitor drinking water concerns in{' '}
            <span className="font-semibold text-teal-700">{user?.district} District</span>.
          </p>
        </div>

        <Button
          variant="teal"
          size="md"
          onClick={() => {
            setFormError(null);
            setCreateModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          Submit Water Complaint
        </Button>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={metricsLoading ? '—' : dashboard?.totalComplaints ?? 0}
          subtitle="Submitted under your account"
          icon={<FileText className="w-6 h-6" />}
          iconColor="blue"
        />
        <StatCard
          title="Pending Review"
          value={metricsLoading ? '—' : dashboard?.pendingComplaints ?? 0}
          subtitle="Awaiting officer assignment"
          icon={<Clock className="w-6 h-6" />}
          iconColor="amber"
        />
        <StatCard
          title="In Progress"
          value={metricsLoading ? '—' : dashboard?.inProgressComplaints ?? 0}
          subtitle="Under investigation or testing"
          icon={<Activity className="w-6 h-6" />}
          iconColor="purple"
        />
        <StatCard
          title="Resolved"
          value={metricsLoading ? '—' : dashboard?.resolvedComplaints ?? 0}
          subtitle="Action taken & verified"
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconColor="emerald"
        />
      </div>

      {/* 2. COMPLAINT LIST & SEARCH/FILTER SECTION */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>My Lodged Complaints</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              View investigation status, assigned officers, and inspection findings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ref or title..."
                className="text-xs rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 focus:border-teal-600 focus:outline-none w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ComplaintStatus);
                setPage(0);
              }}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:border-teal-600"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="TESTING_REQUESTED">Testing Requested</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as ComplaintCategory);
                setPage(0);
              }}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:border-teal-600"
            >
              <option value="">All Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
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
              title="Refresh and clear filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {tableLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No complaints found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search || statusFilter || categoryFilter
                  ? 'No records match your search criteria. Try clearing active filters.'
                  : 'You have not submitted any water quality complaints yet. Use the button above to lodge an issue.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Title &amp; Water Source</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">
                        {c.complaintReference}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.waterSource
                            ? `${c.waterSource.sourceName} (${c.waterSource.district})`
                            : 'Unspecified Public Supply'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category={c.complaintCategory} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        {c.assignedOfficer ? (
                          <div className="text-[11px]">
                            <p className="font-semibold text-slate-800">{c.assignedOfficer.fullName}</p>
                            <p className="text-slate-400">{c.assignedOfficer.phone}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(c.id)}
                            title="View complete details and timeline"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>

                          {/* Edit enabled only for PENDING */}
                          {c.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(c)}
                                title="Edit complaint information"
                              >
                                <Edit className="w-4 h-4 text-teal-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDelete(c.id)}
                                title="Withdraw complaint"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination bar */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={8}
            onPageChange={(p) => setPage(p)}
          />
        </CardContent>
      </Card>

      {/* 3. NEARBY VERIFIED WATER TESTS BANNER */}
      {dashboard?.nearbyPublishedTests && dashboard.nearbyPublishedTests.length > 0 && (
        <Card className="p-5 border-teal-100 bg-teal-50/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Verified Water Quality Tests in Your District ({user?.district})
              </h3>
            </div>
            <span className="text-[11px] text-teal-700 font-semibold">SLS 614 Validated</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dashboard.nearbyPublishedTests.map((t) => (
              <div
                key={t.id}
                className="bg-white p-3.5 rounded-xl border border-teal-100/80 shadow-xs space-y-1.5 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{t.waterSourceName}</span>
                  <VerificationBadge status={t.verificationStatus} size="sm" />
                </div>
                <div className="flex gap-4 text-[11px] text-slate-600 pt-1">
                  <span>
                    pH: <strong className="text-teal-800">{t.phValue.toFixed(2)}</strong>
                  </span>
                  <span>
                    Turbidity:{' '}
                    <strong className="text-teal-800">{t.turbidityNtu.toFixed(2)} NTU</strong>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Sample Date: {t.sampleDate}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* CREATE COMPLAINT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Report Drinking Water Concern"
        description="Provide accurate observations to help officers investigate the water abnormality."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <Input
            label="Complaint Title / Summary"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Discolored reddish water flowing from household tap line"
            required
            helperText="Brief summary of the issue (min 5 characters)"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Observation Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ComplaintCategory)}
              required
            >
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>

            <Select
              label="Affected Water Source"
              value={newWaterSourceId}
              onChange={(e) => setNewWaterSourceId(e.target.value)}
            >
              <option value="">General Public Supply / Unlisted Source</option>
              {waterSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.sourceName} ({source.district})
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Detailed Description & Evidence"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Describe when the issue started, odor characteristics, any sedimentation settling in glasses, and neighborhood impact..."
            rows={4}
            required
            helperText="Include observations such as color, smell, taste, duration, and approximate street address."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={createLoading}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT COMPLAINT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Lodged Complaint"
        description="You can update observations while the case is in PENDING status."
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <Input
            label="Complaint Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as ComplaintCategory)}
              required
            >
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>

            <Select
              label="Affected Water Source"
              value={editWaterSourceId}
              onChange={(e) => setEditWaterSourceId(e.target.value)}
            >
              <option value="">General Public Supply / Unlisted</option>
              {waterSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.sourceName} ({source.district})
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Detailed Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={4}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={editLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Withdraw Complaint"
        message="Are you sure you want to withdraw this complaint? It will be soft-deleted and removed from officer queues."
        confirmText="Withdraw Complaint"
        variant="danger"
        isLoading={deleteLoading}
      />

      {/* VIEW DETAILS & TIMELINE MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Complaint Details & Timeline`}
        description={selectedDetail?.complaint.complaintReference}
        maxWidth="xl"
      >
        {detailLoading || !selectedDetail ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading investigation timeline...
          </div>
        ) : (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Top metadata cards */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedDetail.complaint.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Category:{' '}
                    <span className="font-semibold text-slate-700">
                      {selectedDetail.complaint.complaintCategory}
                    </span>
                  </p>
                </div>
                <StatusBadge status={selectedDetail.complaint.status} />
              </div>

              <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                {selectedDetail.complaint.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] text-slate-500">
                <div>
                  <span className="block font-semibold text-slate-700">Water Source:</span>
                  {selectedDetail.complaint.waterSource
                    ? `${selectedDetail.complaint.waterSource.sourceName} (${selectedDetail.complaint.waterSource.district})`
                    : 'Unspecified Public Supply'}
                </div>
                <div>
                  <span className="block font-semibold text-slate-700">Assigned Officer:</span>
                  {selectedDetail.complaint.assignedOfficer
                    ? `${selectedDetail.complaint.assignedOfficer.fullName} (${selectedDetail.complaint.assignedOfficer.phone})`
                    : 'Pending Assignment'}
                </div>
              </div>
            </div>

            {/* Audit Updates Timeline */}
            <div>
              <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" /> Investigation &amp; Resolution Timeline
              </h5>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {selectedDetail.timeline.map((update, idx) => (
                  <div key={update.id} className="relative flex items-start space-x-3 ml-1">
                    <div className="w-4 h-4 rounded-full bg-teal-600 ring-4 ring-white shrink-0 mt-0.5" />
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex-1 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700">
                          {update.updatedBy.fullName} ({update.updatedBy.role})
                        </span>
                        <span>{new Date(update.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium">{update.note}</p>
                      <div className="text-[10px] text-slate-500">
                        Status Transition:{' '}
                        <span className="font-mono text-slate-600">{update.previousStatus}</span> &rarr;{' '}
                        <span className="font-mono text-teal-700 font-bold">
                          {update.newStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Water Tests if any */}
            {selectedDetail.relatedTests.length > 0 && (
              <div className="pt-2">
                <h5 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Related Laboratory Water Tests
                </h5>
                <div className="space-y-2">
                  {selectedDetail.relatedTests.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">
                          Ref: {t.laboratoryReference}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          pH: <strong>{t.phValue.toFixed(2)}</strong> | Turbidity:{' '}
                          <strong>{t.turbidityNtu.toFixed(2)} NTU</strong>
                        </p>
                      </div>
                      <VerificationBadge status={t.verificationStatus} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
