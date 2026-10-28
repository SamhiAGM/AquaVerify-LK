import React, { useEffect, useState } from 'react';
import { FileCheck, Filter, Microscope, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { VerificationBadge } from '../../../components/ui/Badge';
import { waterTestService } from '../../../services/waterTestService';
import { WaterTest } from '../../../types';
import { SRI_LANKAN_DISTRICTS } from '../../../utils/constants';

export const WaterReportsPage: React.FC = () => {
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('');

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await waterTestService.getVerifiedWaterTests(districtFilter || undefined);
      setTests(data);
    } catch (err) {
      console.error('Failed to load verified tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [districtFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verified Drinking Water Quality Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Public laboratory test records authenticated against Sri Lanka Standard SLS 614:2013 specifications.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Accredited Water Test Records</CardTitle>

          <div className="flex items-center gap-2">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700"
            >
              <option value="">All Districts ({SRI_LANKAN_DISTRICTS.length})</option>
              {SRI_LANKAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <Button variant="secondary" size="sm" onClick={() => loadTests()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading verified reports...</div>
          ) : tests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Microscope className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No published records in this district</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((t) => (
                <Card key={t.id} hover className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{t.waterSourceName}</h4>
                      <p className="text-[11px] text-slate-500">{t.district} District</p>
                    </div>
                    <VerificationBadge status={t.verificationStatus} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">pH</span>
                      <p className="text-base font-bold text-teal-800">{t.phValue.toFixed(2)}</p>
                      <span className="text-[9px] text-slate-500">6.50 – 8.50</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Turbidity</span>
                      <p className="text-base font-bold text-teal-800">{t.turbidityNtu.toFixed(2)} NTU</p>
                      <span className="text-[9px] text-slate-500">&le; 2.00 NTU</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <p>Sample Date: {t.sampleDate}</p>
                    <p>Lab Ref: <span className="font-mono text-slate-700">{t.laboratoryReference}</span></p>
                    {t.verifiedByName && <p className="text-emerald-700 font-semibold">Verified by {t.verifiedByName}</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
