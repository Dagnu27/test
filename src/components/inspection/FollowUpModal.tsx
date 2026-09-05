import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertOctagon,
  FileCheck,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Inspection, CorrectiveActionStatus } from '../../types';

interface FollowUpModalProps {
  inspection: Inspection;
  onClose: () => void;
  onFollowUpStarted: (newFollowUpInspection: Inspection) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  inspection,
  onClose,
  onFollowUpStarted,
}) => {
  const { createFollowUpInspection, updateFindingStatus, facilities } = useApp();
  const facility = facilities.find((f) => f.id === inspection.facilityId);

  const [comments, setComments] = useState<Record<string, string>>({});
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, CorrectiveActionStatus>>({});

  const handleStatusSelect = (caId: string, status: CorrectiveActionStatus) => {
    setSelectedStatuses((prev) => ({ ...prev, [caId]: status }));
  };

  const handleCommentChange = (caId: string, val: string) => {
    setComments((prev) => ({ ...prev, [caId]: val }));
  };

  const handleSaveVerifications = () => {
    inspection.correctiveActions.forEach((ca) => {
      const status = selectedStatuses[ca.id];
      const comment = comments[ca.id];
      if (status || comment) {
        updateFindingStatus(
          inspection.id,
          ca.findingId,
          ca.id,
          status || ca.status,
          comment
        );
      }
    });
  };

  const handleCreateFollowUpInspection = () => {
    handleSaveVerifications();
    const followUp = createFollowUpInspection(inspection.id);
    onFollowUpStarted(followUp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-950 px-6 py-4 text-white flex items-center justify-between border-b border-indigo-900">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-6 h-6 text-indigo-300" />
            <div>
              <h3 className="font-bold text-base">Follow-Up & Corrective Action Verification</h3>
              <p className="text-xs text-indigo-300 font-medium">
                Linked to {inspection.inspectionNumber} • {facility?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider block">
                Facility & Audit Record
              </span>
              <p className="text-sm font-bold text-slate-800">{facility?.name}</p>
              <p className="text-xs text-slate-500">
                Initial Inspection Date: {inspection.inspectionDate} | Score: {inspection.scorePercentage}% ({inspection.complianceGrade})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {inspection.findings.length} Finding(s) Identified
              </span>
            </div>
          </div>

          {/* Action Items List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Non-Compliance Findings & Assigned Corrective Actions
            </h4>

            {inspection.correctiveActions.length === 0 ? (
              <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                No corrective actions recorded for this inspection.
              </p>
            ) : (
              inspection.correctiveActions.map((ca, idx) => {
                const finding = inspection.findings.find((f) => f.id === ca.findingId);
                const currentStatus = selectedStatuses[ca.id] || ca.status;

                return (
                  <div
                    key={ca.id}
                    className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            Gap #{idx + 1}: {finding?.sectionName}
                          </span>
                          {finding?.severity === 'CRITICAL' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              CRITICAL GAP
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 font-medium">{finding?.findingDescription}</p>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          currentStatus === 'VERIFIED' || currentStatus === 'CLOSED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : currentStatus === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                      <p className="text-slate-900 font-medium">
                        <strong className="text-slate-600">Action Plan:</strong> {ca.actionDescription}
                      </p>
                      <div className="flex flex-wrap gap-4 text-slate-500 pt-1 text-[11px]">
                        <span>
                          <strong>Responsible:</strong> {ca.responsiblePerson}
                        </span>
                        <span>
                          <strong>Target Due Date:</strong> {ca.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Verification Status Selector */}
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Inspector Verification Finding
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['VERIFIED', 'IN_PROGRESS', 'OVERDUE', 'CLOSED'] as CorrectiveActionStatus[]).map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusSelect(ca.id, status)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                currentStatus === status
                                  ? status === 'VERIFIED' || status === 'CLOSED'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : status === 'OVERDUE'
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                              {status === 'IN_PROGRESS' && <Clock className="w-3.5 h-3.5 inline mr-1" />}
                              {status === 'OVERDUE' && <AlertOctagon className="w-3.5 h-3.5 inline mr-1" />}
                              {status}
                            </button>
                          )
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Add verification notes (e.g. 'Inspected physical wheelchair ramp installed and tested')..."
                        value={comments[ca.id] ?? ca.verificationComment ?? ''}
                        onChange={(e) => handleCommentChange(ca.id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveVerifications}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Update Findings Only
            </button>
            <button
              type="button"
              onClick={handleCreateFollowUpInspection}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Launch Comprehensive Follow-Up Inspection
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
