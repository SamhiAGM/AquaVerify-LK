import React, { useEffect, useState } from 'react';
import {
  Droplets,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input, Select } from '../../../components/ui/Input';
import { Pagination } from '../../../components/ui/Pagination';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { waterSourceService } from '../../../services/waterSourceService';
import { WaterSource, WaterSourceType } from '../../../types';
import { SRI_LANKAN_DISTRICTS, WATER_SOURCE_TYPES } from '../../../utils/constants';

export const WaterSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<WaterSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<WaterSourceType | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const loadSources = async () => {
    try {
      setLoading(true);
      const res = await waterSourceService.getWaterSources({
        district: districtFilter || undefined,
        type: typeFilter || undefined,
        search: search.trim() || undefined,
        page,
        size: 9,
      });
      setSources(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load water sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, [page, districtFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadSources();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Monitored Drinking Water Sources
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic directory of community tanks, treatment intakes, deep tube wells, and distribution lines.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Water Distribution Network</CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search source name..."
                className="text-xs rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 focus:border-teal-600 focus:outline-none w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

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

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as WaterSourceType);
                setPage(0);
              }}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700"
            >
              <option value="">All Source Types</option>
              {WATER_SOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setDistrictFilter('');
                setTypeFilter('');
                setPage(0);
                loadSources();
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <TableSkeleton rows={4} cols={3} />
          ) : sources.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Droplets className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No water sources match query</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map((s) => (
                <Card key={s.id} hover className="p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{s.sourceName}</h4>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {s.district}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded">
                      Type: {s.sourceType}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {s.locationDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    {s.latitude && s.longitude ? (
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                      </span>
                    ) : (
                      <span>Coordinates pending</span>
                    )}
                    <span className="font-semibold text-slate-700">
                      {s.activeComplaintsCount ?? 0} active cases
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={9}
            onPageChange={(p) => setPage(p)}
          />
        </CardContent>
      </Card>
    </div>
  );
};
