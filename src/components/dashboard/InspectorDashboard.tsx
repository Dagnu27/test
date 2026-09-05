import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  Building2,
  PlusCircle,
  Clock,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Wifi,
  WifiOff,
  UserCheck,
  Eye,
  Edit3,
} from 'lucide-react';
import { Inspection } from '../../types';

export const InspectorDashboard: React.FC = () => {
  const {
    currentUser,
    facilities,
    facilityTypes,
    inspections,
    isOnline,
    setActiveView,
    setCurrentInspection,
    setViewingInspectionId,
  } = useApp();

  // Filter inspector's own inspections
  const myInspections = inspections.filter((i) => i.inspectorId === currentUser.id);
  const myDrafts = myInspections.filter(
    (i) => i.status === 'DRAFT' || i.status === 'UNDER_CORRECTION'
  );
  const followUpsNeeded = inspections.filter(
    (i) => i.status === 'FOLLOW_UP_REQUIRED' || i.findings.some((f) => f.status === 'OPEN')
  );
  const mySubmitted = myInspections.filter((i) => i.status === 'SUBMITTED');

  const handleStartNewInspection = (facilityId?: string) => {
    if (facilityId) {
      localStorage.setItem('dhris_selected_facility_id', facilityId);
    }
    setCurrentInspection(null);
    setActiveView('new_inspection');
  };

  const handleResumeInspection = (insp: Inspection) => {
    setCurrentInspection(insp);
    setActiveView('new_inspection');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Inspector Welcome Banner */}
      <div className="bg-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-wrap items-center justify-between gap-6 border border-indigo-900">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 text-indigo-200 text-xs font-semibold border border-indigo-600/40">
            <UserCheck className="w-4 h-4 text-indigo-300" />
            Active Field Inspector Session
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {currentUser.fullName}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200">
            Jurisdiction: <strong>{currentUser.assignedRegion || 'National Regulatory Directorate'}</strong> • Assigned SOP: ETH-PH-AUD-24
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Offline/Online Badge */}
          <div className="bg-indigo-900/70 border border-indigo-700/60 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 text-indigo-200">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Online & Cloud Synced</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span>Offline Mode (Local Storage)</span>
              </>
            )}
          </div>

          <button
            onClick={() => handleStartNewInspection()}
            className="bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer border border-indigo-200"
          >
            <PlusCircle className="w-4 h-4 text-indigo-700" />
            Start Field Audit
          </button>
        </div>
      </div>

      {/* Actionable Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drafts to Resume */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In-Progress Drafts
            </span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-200">
              {myDrafts.length}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {myDrafts.length > 0
              ? `${myDrafts.length} audit form(s) saved locally awaiting submission.`
              : 'No pending drafts. All audits are up-to-date.'}
          </p>
          {myDrafts.length > 0 ? (
            <button
              onClick={() => handleResumeInspection(myDrafts[0])}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-100"
            >
              Resume Draft ({myDrafts[0].inspectionNumber})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Clear backlog
            </div>
          )}
        </div>

        {/* Follow-Ups Pending */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Follow-Ups
            </span>
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-200">
              {followUpsNeeded.length}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Facilities requiring regulatory re-audit or verification of corrective actions.
          </p>
          <button
            onClick={() => setActiveView('inspections_list')}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-100"
          >
            Review Follow-Up Queue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Completed Audits */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Submissions
            </span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-200">
              {mySubmitted.length}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Audits officially submitted, digitally signed, and archived with regulatory authority.
          </p>
          <button
            onClick={() => setActiveView('inspections_list')}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-100"
          >
            Browse My Audits
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Facilities Quick Access List */}
      <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Healthcare Facilities in Your Jurisdiction
            </h3>
            <p className="text-xs text-slate-500">
              Select any registered facility to start or review an inspection
            </p>
          </div>
          <button
            onClick={() => setActiveView('facilities')}
            className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
          >
            View All ({facilities.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {facilities.slice(0, 6).map((fac) => {
            const type = facilityTypes.find((t) => t.id === fac.facilityTypeId);
            return (
              <div
                key={fac.id}
                className="p-4 rounded-xl border border-slate-300 hover:border-indigo-400 transition-all flex flex-col justify-between space-y-2 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      {type?.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{fac.facilityCode}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{fac.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    TM: {fac.technicalManager} • {fac.woreda}, {fac.region}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
                  <button
                    onClick={() => handleStartNewInspection(fac.id)}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    Conduct Audit
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
