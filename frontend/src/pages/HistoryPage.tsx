import { useState, useEffect } from 'react';
import { Layers, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { InspectionRecord } from '../types/api';
import { getInspections, fetchInspectionImage } from '../services/inspections.api';

const DEFECT_TYPES = ['Scratch', 'Dent', 'Paint Issue', 'Missing Component', 'No Defect'];

export default function HistoryPage() {
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [filterDefect, setFilterDefect] = useState<string>('');
  const [previewImageMap, setPreviewImageMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const inspectionList = await getInspections({ defectType: filterDefect });
        if (!isMounted) return;
        setInspections(inspectionList);

        const imageMap: Record<string, string> = {};
        for (const insp of inspectionList) {
          try {
            const blobUrl = await fetchInspectionImage(insp.imageUrl);
            if (!isMounted) return;
            imageMap[insp.imageUrl] = blobUrl;
          } catch {
            console.error('Failed to load blob for image', insp.imageUrl);
          }
        }
        if (!isMounted) return;
        setPreviewImageMap(prev => ({ ...prev, ...imageMap }));
      } catch (err) {
        console.error('Failed to load history', err);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [filterDefect]);

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Inspection Audit Trail & Compliance Log</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Complete historical record of AI predictions, human overrides, inspector notes, and certified verdicts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-inner">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterDefect}
              onChange={(e) => setFilterDefect(e.target.value)}
              className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Defect Categories</option>
              {DEFECT_TYPES.map(dt => (
                <option key={dt} value={dt} className="bg-slate-900">{dt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Unit Specimen</th>
                <th className="py-4 px-6 font-semibold">Batch & Product</th>
                <th className="py-4 px-6 font-semibold">AI Prediction</th>
                <th className="py-4 px-6 font-semibold">Certified Verdict</th>
                <th className="py-4 px-6 font-semibold">Inspector</th>
                <th className="py-4 px-6 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {inspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    {previewImageMap[insp.imageUrl] ? (
                      <img src={previewImageMap[insp.imageUrl]} alt="Unit" className="w-14 h-14 object-cover rounded-xl border border-slate-700/80 shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-xs text-slate-500 animate-pulse">
                        Loading
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-200">{insp.batchCode}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{insp.productName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-blue-400 font-medium">{insp.aiPredictedDefectType}</div>
                    {insp.aiConfidence !== null && (
                      <div className="text-xs text-slate-500 mt-0.5">{(insp.aiConfidence * 100).toFixed(1)}% confidence</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-start space-y-1.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center space-x-1.5 ${
                        insp.finalDefectType === 'No Defect' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {insp.finalDefectType === 'No Defect' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{insp.finalDefectType}</span>
                      </span>
                      {insp.wasOverridden && (
                        <span className="text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Human Override</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-medium">{insp.inspector}</td>
                  <td className="py-4 px-6 text-xs text-slate-400">{new Date(insp.inspectedAt).toLocaleString()}</td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-medium text-slate-400">No inspection records found</p>
                      <p className="text-xs text-slate-500">Inspections logged by Quality Engineers will appear here in real time.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}