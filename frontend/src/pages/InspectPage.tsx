import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, UploadCloud, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import BatchSelector from '../components/BatchSelector';
import PredictionReview from '../components/PredictionReview';
import { Batch, PredictionResult } from '../types/api';
import { getBatches } from '../services/batches.api';
import { predictDefect, submitInspection } from '../services/inspections.api';

interface InspectPageProps {
  isQualityEngineer: boolean;
}

export default function InspectPage({ isQualityEngineer }: InspectPageProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [finalDefect, setFinalDefect] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    getBatches()
      .then((data) => {
        setBatches(data);
        if (data.length > 0) setSelectedBatchId(data[0].id);
      })
      .catch(console.error);
  }, []);

  function handleFileSelect(file: File) {
    setSelectedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
    setSuccessMessage(null);
  }

  async function handleRunAI() {
    if (!selectedBatchId || !selectedFile) return;
    setIsAnalyzing(true);
    setPrediction(null);
    setSuccessMessage(null);

    try {
      const result = await predictDefect(selectedBatchId, selectedFile);
      setPrediction(result);
      setFinalDefect(result.predictedDefectType);
    } catch (err: any) {
      alert(`AI Analysis Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSubmitInspection(e: React.FormEvent) {
    e.preventDefault();
    if (!prediction || !selectedBatchId) return;

    setIsSubmitting(true);
    try {
      await submitInspection({
        batchId: selectedBatchId,
        predictionId: prediction.predictionId,
        finalDefectType: finalDefect,
        comments,
      });

      setSuccessMessage('Inspection successfully committed to production compliance audit log.');
      setPrediction(null);
      setSelectedFile(null);
      setImagePreviewUrl(null);
      setComments('');
    } catch (err: any) {
      alert(`Submission Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Active Quality Inspection Workbench</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Capture or upload manufacturing unit imagery for automated Gemini Vision AI defect classification and compliance validation.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-950/40 border border-blue-800/50 px-4 py-2 rounded-xl text-blue-300 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>Model: Gemini Vision AI (Taxonomy Enforced)</span>
        </div>
      </div>

      {!isQualityEngineer && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl flex items-start space-x-3 text-sm shadow-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-semibold">Supervisor Read-Only Mode Active</p>
            <p className="text-amber-400/80 text-xs mt-0.5">
              You are currently authenticated as a <b>Production Supervisor</b>. Submissions and AI analysis are restricted to Quality Engineers. Switch personas in the top header to perform inspections.
            </p>
          </div>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Batch & Image Upload (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Step 1: Batch & Specimen Input</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Production Batch</label>
            <div className="relative">
              <BatchSelector 
                batches={batches} 
                selectedBatchId={selectedBatchId} 
                onBatchChange={setSelectedBatchId} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit High-Resolution Photo</label>
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 transition-all group relative overflow-hidden">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {imagePreviewUrl ? (
                <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
                  <img src={imagePreviewUrl} alt="Inspection Unit Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-sm py-1.5 text-xs text-slate-300 font-medium">
                    Click or drop to replace image
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 py-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-inner">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">Click to browse or drag & drop unit photo</p>
                    <p className="text-xs text-slate-500 mt-1">Supports JPEG, PNG, WebP (Max 10MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleRunAI}
            disabled={!selectedFile || isAnalyzing || !isQualityEngineer}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2.5 shadow-lg shadow-blue-900/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Cpu className="w-5 h-5 animate-spin text-blue-300" />
                <span className="tracking-wide">Analyzing with Gemini Vision AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-blue-200" />
                <span className="tracking-wide">Run AI Defect Analysis</span>
              </>
            )}
          </button>

          {successMessage && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl flex items-center space-x-3 text-sm animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: AI Results & Inspector Review (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Step 2: AI Prediction & Compliance Review</h3>
          </div>

          <PredictionReview
            prediction={prediction}
            finalDefect={finalDefect}
            onDefectChange={setFinalDefect}
            comments={comments}
            onCommentsChange={setComments}
            onSubmit={handleSubmitInspection}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}