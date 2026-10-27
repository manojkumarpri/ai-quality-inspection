import React from 'react';
import { PredictionResult } from '../types/api';
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

const DEFECT_TYPES = ['Scratch', 'Dent', 'Paint Issue', 'Missing Component', 'No Defect'];

interface PredictionReviewProps {
  prediction: PredictionResult | null;
  finalDefect: string;
  onDefectChange: (defect: string) => void;
  comments: string;
  onCommentsChange: (comments: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function PredictionReview({
  prediction,
  finalDefect,
  onDefectChange,
  comments,
  onCommentsChange,
  onSubmit,
  isSubmitting,
}: PredictionReviewProps) {
  if (!prediction) {
    return (
      <div className="h-80 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-slate-500 bg-slate-950/40">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-blue-400/80 shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-slate-300">Awaiting AI Vision Analysis</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Select a production batch, upload unit imagery, and run the Gemini AI analysis to review defect predictions and submit compliance audits.
        </p>
      </div>
    );
  }

  const isOverridden = finalDefect !== prediction.predictedDefectType;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* AI Output Card */}
      <div className="bg-slate-950/80 border border-slate-800/90 p-5 rounded-2xl grid grid-cols-2 gap-4 shadow-inner">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Predicted Defect</span>
          </p>
          <p className="text-xl font-extrabold text-blue-400 mt-1.5">{prediction.predictedDefectType}</p>
        </div>
        <div className="text-right border-l border-slate-800/80 pl-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Confidence Score</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1.5">
            {prediction.confidence !== null ? `${(prediction.confidence * 100).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Certified Final Defect Classification</span>
            <span className="text-[11px] text-blue-400 font-normal lowercase">override allowed for human-in-the-loop</span>
          </label>
          <select
            value={finalDefect}
            onChange={(e) => onDefectChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 text-slate-100 font-medium shadow-inner cursor-pointer"
          >
            {DEFECT_TYPES.map((dt) => (
              <option key={dt} value={dt} className="bg-slate-900">
                {dt}
              </option>
            ))}
          </select>
          {isOverridden && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl flex items-center space-x-2 text-xs animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Human Override Detected: You are correcting the AI model's baseline classification. This will be recorded for quality tuning.</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Inspector Notes & Observations (Optional)</span>
          </label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            placeholder="Add specific notes regarding surface blemishes, tolerance deviations, or rejection justification..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 resize-none text-slate-100 placeholder-slate-600 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/20 cursor-pointer disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="tracking-wide">{isSubmitting ? 'Committing Audit Record...' : 'Confirm & Commit Inspection'}</span>
        </button>
      </form>
    </div>
  );
}