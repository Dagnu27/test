import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarClock,
  Unlock,
  Eye,
  Edit3,
} from 'lucide-react';
import { Inspection, InspectionStatus, ComplianceGrade } from '../../types';
import { AdminCorrectionModal } from './AdminCorrectionModal';
import { FollowUpModal } from './FollowUpModal';

export const InspectionsList: React.FC = () => {
  const {
    inspections,
    facilities,
    facilityTypes,
    currentUser,
    setActiveView,
    setCurrentInspection,
    setViewingInspectionId,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [unlockTarget, setUnlockTarget] = useState<Inspection | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<Inspection | null>(null);

  const filteredInspections = inspections.filter((insp) => {
    const facility = facilities.find((f) => f.id === insp.facilityId);
    const facName = facility?.name || '';
    const matchesSearch =
      insp.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || insp.status === statusFilter;
    const matchesGrade = gradeFilter === 'ALL' || insp.complianceGrade === gradeFilter;
    const matchesType = typeFilter === 'ALL' || insp.facilityTypeId === typeFilter;

    return matchesSearch && matchesStatus && matchesGrade && matchesType;
  });

  const handleOpenReport = (inspId: string) => {
    setViewingInspectionId(inspId);
    setActiveView('view_report');
  };

  const handleResume = (insp: Inspection) => {
    setCurrentInspection(insp);
    setActiveView('new_inspection');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-700" />
            Regulatory Inspection Registry
          </h2>
          <p className="text-xs text-slate-500">
            Centralized archive of health facility post-inspections, compliance evaluations, and corrective actions
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentInspection(null);
            setActiveView('new_inspection');
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Start New Inspection
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by inspection number, facility name, inspector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Facility Types</option>
            {facilityTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted / Finalized</option>
            <option value="FOLLOW_UP_REQUIRED">Follow-Up Required</option>
            <option value="UNDER_CORRECTION">Under Correction</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Compliance Grades</option>
            <option value="GREEN">Green (Compliant)</option>
            <option value="YELLOW">Yellow (Conditional)</option>
            <option value="RED">Red (Unsatisfactory)</option>
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Inspection ID</th>
                <th className="p-3.5">Facility Name</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Inspector</th>
                <th className="p-3.5 text-center">Score %</th>
                <th className="p-3.5 text-center">Grade</th>
                <th className="p-3.5 text-center">Status</th>
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
                      <p className="font-bold text-slate-900">{facility?.name || 'Unknown Facility'}</p>
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
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
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
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          insp.status === 'SUBMITTED'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
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
                          onClick={() => handleOpenReport(insp.id)}
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Official Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(insp.status === 'DRAFT' || insp.status === 'UNDER_CORRECTION') && (
                          <button
                            onClick={() => handleResume(insp)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit / Resume Inspection"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setFollowUpTarget(insp)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Follow-Up & Corrective Actions"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </button>

                        {currentUser.role === 'ADMIN' &&
                          insp.status !== 'DRAFT' &&
                          insp.status !== 'UNDER_CORRECTION' && (
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

        {filteredInspections.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No inspection records found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {unlockTarget && (
        <AdminCorrectionModal
          inspection={unlockTarget}
          onClose={() => setUnlockTarget(null)}
          onUnlocked={() => {
            setUnlockTarget(null);
            handleResume(unlockTarget);
          }}
        />
      )}

      {followUpTarget && (
        <FollowUpModal
          inspection={followUpTarget}
          onClose={() => setFollowUpTarget(null)}
          onFollowUpStarted={(newFollowUp) => {
            setFollowUpTarget(null);
            handleResume(newFollowUp);
          }}
        />
      )}
    </div>
  );
};
