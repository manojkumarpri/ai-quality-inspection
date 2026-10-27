import React from 'react';
import { Batch } from '../types/api';

interface BatchSelectorProps {
  batches: Batch[];
  selectedBatchId: string;
  onBatchChange: (id: string) => void; // Make sure this matches!
  disabled?: boolean;
}

 const BatchSelector: React.FC<BatchSelectorProps> = ({ batches, selectedBatchId, onBatchChange, disabled }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Production Batch</label>
      <select
        value={selectedBatchId}
        onChange={(e) => onBatchChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
      >
        {batches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.batchCode} — {b.productName} ({b.productionLine})
          </option>
        ))}
      </select>
    </div>
  );
};
export default BatchSelector;