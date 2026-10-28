import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplets,
  Edit,
  Eye,
  FileCheck,
  FilePlus,
  FileText,
  Filter,
  Microscope,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { VerificationBadge } from '../../../components/ui/Badge';
import { Input, Select } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Pagination } from '../../../components/ui/Pagination';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { dashboardService } from '../../../services/dashboardService';
import { waterSourceService } from '../../../services/waterSourceService';
import { waterTestService } from '../../../services/waterTestService';
import {
  LabDashboard,
  VerificationStatus,
  WaterSource,
  WaterTest,
} from '../../../types';
import { SRI_LANKAN_DISTRICTS } from '../../../utils/constants';

export const LabDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Metrics
  const [dashboard, setDashboard] = useState<LabDashboard | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Table State
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | ''>('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Water Sources
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);

  // Create Water Test Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [sampleDate, setSampleDate] = useState(new Date().toISOString().split('T')[0]);
  const [phValue, setPhValue] = useState<string>('7.00');
  const [turbidityNtu, setTurbidityNtu] = useState<string>('1.20');
  const [tdsPpm, setTdsPpm] = useState<string>('180.00');
  const [conductivityUsCm, setConductivityUsCm] = useState<string>('280.00');
  const [nitrateMgL, setNitrateMgL] = useState<string>('12.00');
  const [eColiPresence, setEColiPresence] = useState<boolean>(false);
  const [labRef, setLabRef] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Water Test Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<WaterTest | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View Details Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<WaterTest | null>(null);

  // Success Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setMetricsLoading(true);
      const data = await dashboardService.getLabDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load lab dashboard:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  const loadTests = async () => {
    try {
      setTableLoading(true);
      const res = await waterTestService.getWaterTests({
        status: statusFilter || undefined,
        district: districtFilter || undefined,
        page,
        size: 8,
      });
      setTests(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load water tests:', err);
    } finally {
      setTableLoading(false);
    }
  };

  const loadSources = async () => {
    try {
      const s = await waterSourceService.getAllWaterSources();
      setWaterSources(s);
      if (s.length > 0 && !selectedSourceId) {
        setSelectedSourceId(String(s[0].id));
      }
    } catch (err) {
      console.error('Failed to load sources:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadSources();
  }, []);

  useEffect(() => {
    loadTests();
  }, [page, statusFilter, districtFilter]);

  // Open Create Modal with auto-generated reference
  const handleOpenCreate = () => {
    setFormError(null);
    const rand = Math.floor(100 + Math.random() * 900);
    const prefix = user?.district ? user.district.substring(0, 3).toUpperCase() : 'COL';
    setLabRef(`LAB-${prefix}-${new Date().getFullYear()}-${rand}`);
    setPhValue('7.10');
    setTurbidityNtu('1.30');
    setTdsPpm('160.00');
    setConductivityUsCm('240.00');
    setNitrateMgL('8.50');
    setEColiPresence(false);
    setCreateModalOpen(true);
  };

  // Submit Create Test
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const ph = parseFloat(phValue);
    const turb = parseFloat(turbidityNtu);

    if (isNaN(ph) || ph < 0 || ph > 14) {
      setFormError('pH value must be a valid numeric measurement between 0.00 and 14.00.');
      return;
    }

    if (isNaN(turb) || turb < 0) {
      setFormError('Turbidity must be a non-negative number in NTU.');
      return;
    }

    if (!selectedSourceId) {
      setFormError('Please select the tested water source.');
      return;
    }

    setCreateLoading(true);
    try {
      const created = await waterTestService.createWaterTest({
        waterSourceId: Number(selectedSourceId),
        sampleDate,
        phValue: ph,
        turbidityNtu: turb,
        tdsPpm: tdsPpm ? parseFloat(tdsPpm) : null,
        conductivityUsCm: conductivityUsCm ? parseFloat(conductivityUsCm) : null,
        nitrateMgL: nitrateMgL ? parseFloat(nitrateMgL) : null,
        eColiPresence,
        laboratoryReference: labRef.trim(),
      });

      setCreateModalOpen(false);
      setSuccessBanner(
        `Water test record created successfully (Ref: ${created.laboratoryReference}). Status: ${created.verificationStatus}.`
      );
      loadTests();
      loadDashboardData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(
        axiosErr.response?.data?.message || 'Failed to record water test result. Please check inputs.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (test: WaterTest) => {
    setEditingTest(test);
    setSelectedSourceId(String(test.waterSourceId));
    setSampleDate(test.sampleDate);
    setPhValue(String(test.phValue));
    setTurbidityNtu(String(test.turbidityNtu));
    setTdsPpm(test.tdsPpm ? String(test.tdsPpm) : '');
    setConductivityUsCm(test.conductivityUsCm ? String(test.conductivityUsCm) : '');
    setNitrateMgL(test.nitrateMgL ? String(test.nitrateMgL) : '');
    setEColiPresence(!!test.eColiPresence);
    setLabRef(test.laboratoryReference);
    setFormError(null);
    setEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;
    setFormError(null);

    const ph = parseFloat(phValue);
    const turb = parseFloat(turbidityNtu);

    setEditLoading(true);
    try {
      await waterTestService.updateWaterTest(editingTest.id, {
        waterSourceId: Number(selectedSourceId),
        sampleDate,
        phValue: ph,
        turbidityNtu: turb,
        tdsPpm: tdsPpm ? parseFloat(tdsPpm) : null,
        conductivityUsCm: conductivityUsCm ? parseFloat(conductivityUsCm) : null,
        nitrateMgL: nitrateMgL ? parseFloat(nitrateMgL) : null,
        eColiPresence,
        laboratoryReference: labRef.trim(),
      });

      setEditModalOpen(false);
      setSuccessBanner('Water test record updated successfully.');
      loadTests();
      loadDashboardData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(
        axiosErr.response?.data?.message ||
          'Failed to update record. Only DRAFT tests can be modified.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Open Delete
  const handleOpenDelete = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await waterTestService.deleteWaterTest(deletingId);
      setDeleteDialogOpen(false);
      setSuccessBanner('Draft water test record deleted.');
      loadTests();
      loadDashboardData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(
        axiosErr.response?.data?.message ||
          'Failed to delete record. Only DRAFT or unverified records can be deleted.'
      );
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  // View Details
  const handleViewDetails = (test: WaterTest) => {
    setSelectedTest(test);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Laboratory Testing Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-slate-700">{user?.fullName}</span>.
            Record, evaluate, and submit chemical &amp; physical drinking water analyses.
          </p>
        </div>

        <Button
          variant="teal"
          size="md"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          Add Water Sample Test
        </Button>
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

      {/* 1. METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Samples"
          value={metricsLoading ? '—' : dashboard?.totalSamples ?? 0}
          subtitle="Processed by laboratory"
          icon={<Microscope className="w-6 h-6" />}
          iconColor="blue"
        />
        <StatCard
          title="Pending Verification"
          value={metricsLoading ? '—' : dashboard?.pendingTests ?? 0}
          subtitle="Awaiting officer sign-off"
          icon={<Clock className="w-6 h-6" />}
          iconColor="amber"
        />
        <StatCard
          title="SLS Verified"
          value={metricsLoading ? '—' : dashboard?.verifiedTests ?? 0}
          subtitle="Approved for public feed"
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconColor="emerald"
        />
        <StatCard
          title="Rejected / Retest"
          value={metricsLoading ? '—' : dashboard?.rejectedTests ?? 0}
          subtitle="Out of tolerance or invalid"
          icon={<AlertTriangle className="w-6 h-6" />}
          iconColor="rose"
        />
      </div>

      {/* 2. SLS 614 REFERENCE SUMMARY CARD */}
      <Card className="p-5 border-teal-100 bg-gradient-to-r from-teal-50/40 via-white to-sky-50/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Sri Lanka Standard SLS 614:2013 Potability Reference
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Thresholds evaluated automatically upon record submission.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1 rounded-lg bg-white border border-teal-200 font-semibold text-teal-800">
              pH: 6.50 – 8.50
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-sky-200 font-semibold text-sky-800">
              Turbidity: &le; 2.00 NTU
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700">
              TDS: &le; 500 ppm
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700">
              Nitrate: &le; 50 mg/L
            </span>
          </div>
        </div>
      </Card>

      {/* 3. TEST RECORDS TABLE */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Laboratory Water Test Records</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Review analytical readings, verification states, and source associations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as VerificationStatus);
                setPage(0);
              }}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700"
            >
              <option value="">All Verification States</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700"
            >
              <option value="">All Districts</option>
              {SRI_LANKAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setDistrictFilter('');
                setPage(0);
                loadTests();
              }}
              title="Refresh table"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {tableLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : tests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Microscope className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No water test records found</p>
              <p className="text-xs text-slate-500">
                Click &quot;Add Water Sample Test&quot; above to log physical &amp; chemical readings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Lab Ref</th>
                    <th className="py-3 px-4">Water Source &amp; District</th>
                    <th className="py-3 px-4">Sample Date</th>
                    <th className="py-3 px-4">pH Value</th>
                    <th className="py-3 px-4">Turbidity (NTU)</th>
                    <th className="py-3 px-4">SLS 614</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">
                        {t.laboratoryReference}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{t.waterSourceName}</p>
                        <p className="text-[11px] text-slate-500">{t.district} District</p>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500">{t.sampleDate}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {t.phValue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {t.turbidityNtu.toFixed(2)} NTU
                      </td>
                      <td className="py-3 px-4">
                        {t.withinStandard ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Compliant
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" /> Non-Compliant
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <VerificationBadge status={t.verificationStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(t)}
                          title="View complete analysis parameters"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>

                        {/* Edit and Delete available for DRAFT */}
                        {t.verificationStatus === 'DRAFT' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(t)}
                              title="Edit test readings"
                            >
                              <Edit className="w-4 h-4 text-teal-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(t.id)}
                              title="Delete draft record"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </Button>
                          </>
                        )}
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

      {/* CREATE WATER TEST MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Water Sample Test Result"
        description="Enter chemical and physical parameters according to laboratory measurements."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Tested Water Source"
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              required
            >
              {waterSources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sourceName} ({s.district})
                </option>
              ))}
            </Select>

            <Input
              label="Laboratory Reference Number"
              value={labRef}
              onChange={(e) => setLabRef(e.target.value)}
              placeholder="e.g. LAB-COL-2026-055"
              required
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Sample Date"
              type="date"
              value={sampleDate}
              onChange={(e) => setSampleDate(e.target.value)}
              required
            />

            <Input
              label="Acidity (pH)"
              type="number"
              step="0.01"
              min="0"
              max="14"
              value={phValue}
              onChange={(e) => setPhValue(e.target.value)}
              helperText="SLS 614: 6.50 – 8.50"
              required
            />

            <Input
              label="Turbidity (NTU)"
              type="number"
              step="0.01"
              min="0"
              value={turbidityNtu}
              onChange={(e) => setTurbidityNtu(e.target.value)}
              helperText="SLS 614: &le; 2.00 NTU"
              required
            />
          </div>

          {/* Optional advanced parameters */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-3">
              Optional Secondary Parameters:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="TDS (ppm)"
                type="number"
                step="0.1"
                value={tdsPpm}
                onChange={(e) => setTdsPpm(e.target.value)}
                placeholder="e.g. 150.0"
                helperText="SLS max: 500 ppm"
              />

              <Input
                label="Conductivity (&mu;S/cm)"
                type="number"
                step="0.1"
                value={conductivityUsCm}
                onChange={(e) => setConductivityUsCm(e.target.value)}
                placeholder="e.g. 250.0"
              />

              <Input
                label="Nitrate (mg/L)"
                type="number"
                step="0.01"
                value={nitrateMgL}
                onChange={(e) => setNitrateMgL(e.target.value)}
                placeholder="e.g. 10.0"
                helperText="SLS max: 50 mg/L"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={eColiPresence}
                onChange={(e) => setEColiPresence(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="font-semibold text-rose-700">
                E. coli / Coliform detected in microbial culture
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={createLoading}>
              Save Test Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Water Test Record"
        description="Update readings for draft record."
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Tested Water Source"
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              required
            >
              {waterSources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sourceName} ({s.district})
                </option>
              ))}
            </Select>

            <Input
              label="Lab Reference"
              value={labRef}
              onChange={(e) => setLabRef(e.target.value)}
              required
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Sample Date"
              type="date"
              value={sampleDate}
              onChange={(e) => setSampleDate(e.target.value)}
              required
            />
            <Input
              label="pH"
              type="number"
              step="0.01"
              value={phValue}
              onChange={(e) => setPhValue(e.target.value)}
              required
            />
            <Input
              label="Turbidity"
              type="number"
              step="0.01"
              value={turbidityNtu}
              onChange={(e) => setTurbidityNtu(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={editLoading}>
              Update Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Test Record"
        message="Are you sure you want to delete this water test record? This action cannot be undone."
        confirmText="Delete Record"
        variant="danger"
        isLoading={deleteLoading}
      />

      {/* VIEW DETAILS MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Water Test Analytical Certificate"
        description={selectedTest?.laboratoryReference}
        maxWidth="md"
      >
        {selectedTest && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedTest.waterSourceName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedTest.district} District &bull; Sampled on {selectedTest.sampleDate}
                  </p>
                </div>
                <VerificationBadge status={selectedTest.verificationStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Hydrogen Ion (pH)
                </span>
                <p className="text-xl font-extrabold text-teal-800">
                  {selectedTest.phValue.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500">SLS 614: 6.50 – 8.50</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Turbidity (NTU)
                </span>
                <p className="text-xl font-extrabold text-teal-800">
                  {selectedTest.turbidityNtu.toFixed(2)} NTU
                </p>
                <p className="text-[10px] text-slate-500">SLS max: 2.00 NTU</p>
              </div>

              {selectedTest.tdsPpm && (
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Total Dissolved Solids
                  </span>
                  <p className="text-lg font-bold text-slate-800">{selectedTest.tdsPpm} ppm</p>
                  <p className="text-[10px] text-slate-500">SLS max: 500 ppm</p>
                </div>
              )}

              {selectedTest.nitrateMgL && (
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Nitrate (NO3)
                  </span>
                  <p className="text-lg font-bold text-slate-800">{selectedTest.nitrateMgL} mg/L</p>
                  <p className="text-[10px] text-slate-500">SLS max: 50 mg/L</p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p>
                Tested by: <strong>{selectedTest.laboratoryTechnicianName}</strong>
              </p>
              {selectedTest.verifiedByName && (
                <p>
                  Verified by: <strong>{selectedTest.verifiedByName}</strong> on{' '}
                  {selectedTest.verifiedAt
                    ? new Date(selectedTest.verifiedAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
