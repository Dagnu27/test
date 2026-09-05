import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CalendarClock,
  ShieldCheck,
  Plus,
  Sliders,
  History,
  Eye,
  Unlock,
  Filter,
} from 'lucide-react';
import { AdminCorrectionModal } from '../inspection/AdminCorrectionModal';
import { FollowUpModal } from '../inspection/FollowUpModal';
import { Inspection } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    facilities,
    facilityTypes,
    inspections,
    auditLogs,
    setActiveView,
    setCurrentInspection,
    setViewingInspectionId,
  } = useApp();

  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [unlockTarget, setUnlockTarget] = useState<Inspection | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<Inspection | null>(null);

  // Analytics
  const totalFacilities = facilities.length;
  const pharmaciesCount = facilities.filter((f) => f.facilityTypeId === 'pharmacy').length;
  const clinicsCount = facilities.filter((f) => f.facilityTypeId === 'medium_clinic').length;
  const dentalCount = facilities.filter((f) => f.facilityTypeId === 'medium_dental_clinic').length;

  const totalInspections = inspections.length;
  const greenInspections = inspections.filter((i) => i.complianceGrade === 'GREEN').length;
  const yellowInspections = inspections.filter((i) => i.complianceGrade === 'YELLOW').length;
  const redInspections = inspections.filter((i) => i.complianceGrade === 'RED').length;

  // Corrective Actions statistics
  const allCorrectiveActions = inspections.flatMap((i) => i.correctiveActions);
  const openCAs = allCorrectiveActions.filter((ca) => ca.status === 'OPEN' || ca.status === 'IN_PROGRESS').length;
  const verifiedCAs = allCorrectiveActions.filter((ca) => ca.status === 'VERIFIED' || ca.status === 'CLOSED').length;
  const overdueCAs = allCorrectiveActions.filter((ca) => ca.status === 'OVERDUE').length;

  // Filtered Inspections for table
  const filteredInspections = inspections.filter((insp) => {
    const facility = facilities.find((f) => f.id === insp.facilityId);
    const matchesRegion = regionFilter === 'ALL' || facility?.region === regionFilter;
    const matchesType = typeFilter === 'ALL' || insp.facilityTypeId === typeFilter;
    return matchesRegion && matchesType;
  });

  const regions = Array.from(new Set(facilities.map((f) => f.region))).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Hero */}
      <div className="bg-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-wrap items-center justify-between gap-6 border border-indigo-900">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            National Regulatory Oversight Command
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Digital Health Regulatory Inspection System
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200">
            Real-time regulatory compliance analytics, standardized auditing (EFDA Form 002 / Clinic Standards), automated scoring, and corrective action lifecycle tracking across all regions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveView('facilities')}
            className="bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 text-xs font-semibold px-4 py-2.5 rounded-xl border border-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-indigo-300" />
            Manage Facilities
          </button>

          <button
            onClick={() => setActiveView('checklist_config')}
            className="bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 text-xs font-semibold px-4 py-2.5 rounded-xl border border-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-indigo-300" />
            Checklist Engine
          </button>

          <button
            onClick={() => {
              setCurrentInspection(null);
              setActiveView('new_inspection');
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer border border-indigo-400/30"
          >
            <Plus className="w-4 h-4" />
            Initiate Inspection
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facilities */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Health Facilities
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalFacilities}</div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>{pharmaciesCount} Pharmacies</span>
            <span>•</span>
            <span>{clinicsCount} Clinics</span>
            <span>•</span>
            <span>{dentalCount} Dental</span>
          </div>
        </div>

        {/* Total Audits */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audits Conducted
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalInspections}</div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>{inspections.filter((i) => i.status === 'SUBMITTED').length} Finalized</span>
            <span>•</span>
            <span>{inspections.filter((i) => i.isFollowUp).length} Follow-ups</span>
          </div>
        </div>

        {/* Compliance Distribution */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Compliance Grades
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              {greenInspections}
            </div>
            <div className="flex items-center gap-1 text-amber-700 font-extrabold text-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              {yellowInspections}
            </div>
            <div className="flex items-center gap-1 text-rose-700 font-extrabold text-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              {redInspections}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Green (≥80%), Yellow (60-79%), Red (&lt;60%)
          </div>
        </div>

        {/* Corrective Actions */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Corrective Action Plans
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{allCorrectiveActions.length}</div>
          <div className="flex items-center gap-2 text-[11px] pt-1 border-t border-slate-100">
            <span className="text-amber-700 font-semibold">{openCAs} Open</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{verifiedCAs} Verified</span>
            <span>•</span>
            <span className="text-rose-700 font-semibold">{overdueCAs} Overdue</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar for Table */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-indigo-600" />
          Recent Regulatory Inspections Archive
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Region:</span>
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700"
          >
            <option value="ALL">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700"
          >
            <option value="ALL">All Facility Types</option>
            {facilityTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 border-r border-slate-200">Audit ID</th>
                <th className="p-3.5 border-r border-slate-200">Facility Name</th>
                <th className="p-3.5 border-r border-slate-200">Date</th>
                <th className="p-3.5 border-r border-slate-200">Inspector</th>
                <th className="p-3.5 text-center border-r border-slate-200">Score %</th>
                <th className="p-3.5 text-center border-r border-slate-200">Grade</th>
                <th className="p-3.5 text-center border-r border-slate-200">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInspections.map((insp) => {
                const facility = facilities.find((f) => f.id === insp.facilityId);
                const type = facilityTypes.find((t) => t.id === insp.facilityTypeId);

                return (
                  <tr key={insp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      <div>{insp.inspectionNumber}</div>
                      {insp.isFollowUp && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          Follow-Up
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{facility?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {type?.name} • {facility?.region}, {facility?.woreda}
                      </p>
                    </td>

                    <td className="p-3.5 text-slate-600 font-medium whitespace-nowrap">
                      {insp.inspectionDate}
                    </td>

                    <td className="p-3.5 text-slate-700 whitespace-nowrap">
                      {insp.inspectorName}
                    </td>

                    <td className="p-3.5 text-center font-extrabold text-sm text-slate-900">
                      {insp.scorePercentage}%
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          insp.complianceGrade === 'GREEN'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : insp.complianceGrade === 'YELLOW'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {insp.complianceGrade}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          insp.status === 'SUBMITTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : insp.status === 'FOLLOW_UP_REQUIRED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : insp.status === 'UNDER_CORRECTION'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {insp.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setViewingInspectionId(insp.id);
                            setActiveView('view_report');
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Official Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setFollowUpTarget(insp)}
                          className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Follow-Up & Corrective Actions"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </button>

                        {insp.status !== 'DRAFT' && insp.status !== 'UNDER_CORRECTION' && (
                          <button
                            onClick={() => setUnlockTarget(insp)}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Controlled Administrative Unlock"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {unlockTarget && (
        <AdminCorrectionModal
          inspection={unlockTarget}
          onClose={() => setUnlockTarget(null)}
          onUnlocked={() => {
            setUnlockTarget(null);
            setCurrentInspection(unlockTarget);
            setActiveView('new_inspection');
          }}
        />
      )}

      {followUpTarget && (
        <FollowUpModal
          inspection={followUpTarget}
          onClose={() => setFollowUpTarget(null)}
          onFollowUpStarted={(newFollowUp) => {
            setFollowUpTarget(null);
            setCurrentInspection(newFollowUp);
            setActiveView('new_inspection');
          }}
        />
      )}
    </div>
  );
};
