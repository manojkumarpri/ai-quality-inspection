import React, { useState, useEffect } from 'react';
import { BarChart3, AlertOctagon,  } from 'lucide-react';
import { DashboardKPIs } from '../types/api';
import { getDashboardKPIs } from '../services/dashboard.api'; // or your dashboard service

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    getDashboardKPIs().then(setKpis).catch(console.error);
  }, []);

  if (!kpis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Aggregating executive quality metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Executive Quality & Performance Analytics</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Real-time aggregations tracking manufacturing defect rates, inspection throughput, and Gemini AI acceptance metrics.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Units Inspected</p>
          <div className="flex items-baseline space-x-2 mt-3">
            <span className="text-4xl font-extrabold text-slate-100">{kpis.totalInspected}</span>
            <span className="text-xs text-slate-500">specimens</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Defect Rate</p>
          <div className="flex items-baseline space-x-2 mt-3">
            <span className="text-4xl font-extrabold text-rose-400">{kpis.defectRate}%</span>
            <span className="text-xs text-slate-500">rejected</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Acceptance / Trust</p>
          <div className="flex items-baseline space-x-2 mt-3">
            <span className="text-4xl font-extrabold text-emerald-400">{kpis.aiAcceptanceRate}%</span>
            <span className="text-xs text-slate-500">agreement</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Passed vs Total</p>
          <div className="flex items-baseline space-x-2 mt-3">
            <span className="text-4xl font-extrabold text-blue-400">{kpis.passed}</span>
            <span className="text-sm text-slate-500">/ {kpis.totalInspected} passed</span>
          </div>
        </div>
      </div>

      {/* Defect Category Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-200">Defect Category Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of rejected units across validated defect taxonomy</p>
          </div>
          <AlertOctagon className="w-5 h-5 text-blue-400" />
        </div>

        <div className="space-y-5">
          {kpis.defectBreakdown.map((item) => {
            const percentage = kpis.totalInspected > 0 ? (item.count / kpis.totalInspected) * 100 : 0;
            return (
              <div key={item.defectType} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-200 font-semibold">{item.defectType}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-medium">{item.count} units</span>
                    <span className="text-xs text-blue-400 font-semibold bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-md">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80 p-0.5 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-sm" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}