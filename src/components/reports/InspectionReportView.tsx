import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Unlock,
  CalendarClock,
  Compass,
  FileCheck,
  Pill,
} from 'lucide-react';
import { AdminCorrectionModal } from '../inspection/AdminCorrectionModal';
import { FollowUpModal } from '../inspection/FollowUpModal';

export const InspectionReportView: React.FC = () => {
  const {
    viewingInspectionId,
    inspections,
    facilities,
    facilityTypes,
    checklists,
    currentUser,
    setActiveView,
    setCurrentInspection,
  } = useApp();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const inspection = inspections.find((i) => i.id === viewingInspectionId) || inspections[0];

  if (!inspection) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-slate-500">Inspection record not found.</p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const facility = facilities.find((f) => f.id === inspection.facilityId);
  const facilityType = facilityTypes.find((t) => t.id === inspection.facilityTypeId);
  const template = checklists.find((c) => c.id === inspection.checklistId);
  const activeVersion =
    template?.versions.find((v) => v.id === inspection.checklistVersionId) ||
    template?.versions[0];

  const inspectorSig = inspection.signatures?.find((s) => s.signerType === 'INSPECTOR');
  const facilityHeadSig = inspection.signatures?.find(
    (s) => s.signerType === 'FACILITY_HEAD' || s.signerType === 'RESPONSIBLE_OFFICIAL'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Controls Toolbar (Hidden when printing) */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('inspections_list')}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to inspections"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider">
              Regulatory Audit Report
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              {inspection.inspectionNumber} • {facility?.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Admin Unlock Action */}
          {currentUser.role === 'ADMIN' &&
            inspection.status !== 'DRAFT' &&
            inspection.status !== 'UNDER_CORRECTION' && (
              <button
                onClick={() => setShowUnlockModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                Administrative Unlock
              </button>
            )}

          {/* Follow-up Action */}
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CalendarClock className="w-3.5 h-3.5 text-indigo-600" />
            Launch Follow-Up
          </button>

          {/* Edit if in progress or under correction */}
          {(inspection.status === 'DRAFT' || inspection.status === 'UNDER_CORRECTION') && (
            <button
              onClick={() => {
                setCurrentInspection(inspection);
                setActiveView('new_inspection');
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Continue Editing
            </button>
          )}

          {/* Print / Export PDF */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-950 hover:bg-indigo-900 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer border border-indigo-900"
          >
            <Printer className="w-4 h-4 text-indigo-200" />
            Print / Export Official PDF
          </button>
        </div>
      </div>

      {/* Official Regulatory Printable Document */}
      <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0 space-y-8 text-slate-800 font-sans">
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
              🇪🇹
            </div>
          </div>
          <h2 className="text-xs font-bold tracking-widest text-slate-700 uppercase">
            Federal Democratic Republic of Ethiopia
          </h2>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
            Ethiopian Food and Drug Authority (EFDA) / Regional Health Bureau
          </h1>
          <p className="text-xs font-semibold text-slate-600">
            Health Facility Regulatory Inspection Directorate
          </p>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-3 border-t border-slate-200 mt-3 text-slate-700">
            <div className="text-left font-bold">FORM No.: {template?.formNo || '002'}</div>
            <div className="text-center font-semibold">SOP No.: {template?.sopNo || 'EFDA/INSP/002'}</div>
            <div className="text-right">Revision No.: {activeVersion?.versionNumber || '01'}</div>
          </div>
        </div>

        {/* Title & Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Title: {template?.title || 'Community Pharmacy Post Inspection Checklist'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Audit ID: {inspection.inspectionNumber} | Date of Inspection: {inspection.inspectionDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Compliance Score
              </span>
              <span className="text-lg font-black text-slate-900">
                {inspection.scorePercentage}%
              </span>
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider text-white ${
                inspection.complianceGrade === 'GREEN'
                  ? 'bg-emerald-600'
                  : inspection.complianceGrade === 'YELLOW'
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`}
            >
              GRADE: {inspection.complianceGrade}
            </div>
          </div>
        </div>

        {/* Section 5: General Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            5. General Facility Information & Address
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                5.1 Level / Type of Facility
              </span>
              <p className="font-bold text-slate-900">{facilityType?.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">Code: {facility?.facilityCode}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                5.2 Facility Legal Name
              </span>
              <p className="font-bold text-slate-900">{facility?.name}</p>
              <p className="text-slate-600">Owner: {facility?.ownerName || 'N/A'}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                5.3 - 5.4 Technical Manager
              </span>
              <p className="font-bold text-slate-900">{facility?.technicalManager}</p>
              <p className="text-slate-600 font-medium">Level: {facility?.professionalLevelTM}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                1.1 Licensing Status
              </span>
              <p className="font-bold text-emerald-700">
                {facility?.licenseStatus} (No. {facility?.licenseNo})
              </p>
              <p className="text-slate-500">Issue Date: {facility?.licenseIssueDate}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                5.6 Physical Address & Geo-Coordinates
              </span>
              <p className="font-medium text-slate-900">
                {facility?.region}, {facility?.zone}, Woreda {facility?.woreda}, {facility?.town} (Kebele {facility?.kebele}, House {facility?.houseNo || 'N/A'})
              </p>
              <p className="font-mono text-[11px] text-slate-500">
                Tel: {facility?.phone} | GPS: {inspection.latitude?.toFixed(4)}° N, {inspection.longitude?.toFixed(4)}° E
              </p>
            </div>
          </div>
        </div>

        {/* Section: Checklist Audit Requirements Breakdown */}
        {activeVersion && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              Audit Findings & Verification Assessment Table
            </h4>

            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5 w-12 text-center">No</th>
                    <th className="p-2.5 min-w-[280px]">Requirements for Audit</th>
                    <th className="p-2.5 text-center w-24">Finding</th>
                    <th className="p-2.5">Auditor Observations / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeVersion.sections.map((section) => (
                    <React.Fragment key={section.id}>
                      <tr className="bg-slate-50/80 font-bold text-slate-900">
                        <td colSpan={4} className="p-2.5 bg-slate-100/60 font-mono text-[11px] text-slate-800">
                          SECTION {section.sectionNumber}: {section.sectionName}
                        </td>
                      </tr>
                      {section.questions.map((q) => {
                        const ans = inspection.answers[q.id];
                        const isMet =
                          ans?.complianceStatus === 'YES' || ans?.complianceStatus === 'MET';
                        const isUnmet =
                          ans?.complianceStatus === 'NO' || ans?.complianceStatus === 'UNMET';

                        return (
                          <tr key={q.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 text-center font-mono text-slate-500 align-top">
                              {q.questionNumber}
                            </td>
                            <td className="p-2.5 align-top">
                              <p className="font-semibold text-slate-900">{q.questionText}</p>
                              {q.verificationGuidance && (
                                <p className="text-[10px] text-slate-500 whitespace-pre-line mt-0.5">
                                  {q.verificationGuidance}
                                </p>
                              )}
                            </td>
                            <td className="p-2.5 text-center align-top">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                  isMet
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isUnmet
                                    ? 'bg-rose-100 text-rose-800'
                                    : ans?.complianceStatus === 'PARTIALLY_MET'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {ans?.complianceStatus || 'UNANSWERED'}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-700 align-top">
                              {ans?.remarks || <span className="text-slate-300 italic">None</span>}
                              {ans?.evidenceIds && ans.evidenceIds.length > 0 && (
                                <span className="block text-[10px] text-emerald-700 font-medium mt-0.5">
                                  ✓ {ans.evidenceIds.length} photo attached
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tracer Medicines Sampling (for Pharmacy) */}
        {inspection.tracerMedicines && inspection.tracerMedicines.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-700" />
              Essential Tracer Medicines Physical Audit Sampling (Form 002 Sec 10)
            </h4>

            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 text-center w-8">#</th>
                    <th className="p-2">Tracer Medicine Item</th>
                    <th className="p-2 text-center">Available</th>
                    <th className="p-2">Sample Batch No</th>
                    <th className="p-2">Expiry Date</th>
                    <th className="p-2 text-center">Storage Condition</th>
                    <th className="p-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inspection.tracerMedicines.map((med, idx) => (
                    <tr key={med.id} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-semibold text-slate-900">{med.name}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            med.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {med.isAvailable ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-slate-600">{med.batchNumber || '-'}</td>
                      <td className="p-2 text-slate-600">{med.expiryDate || '-'}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            med.storageConditionOk ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {med.storageConditionOk ? 'Compliant' : 'Deficient'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-500 text-[11px]">{med.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section: Non-Compliance Findings & Corrective Action Plan */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            Section 16: Non-Compliance Findings & Action Plan
          </h4>

          {inspection.findings.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
              No formal non-compliance findings or corrective actions recorded.
            </p>
          ) : (
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 w-8">#</th>
                    <th className="p-2">Identified Regulatory Gap</th>
                    <th className="p-2">Severity</th>
                    <th className="p-2">Required Corrective Action</th>
                    <th className="p-2">Responsible</th>
                    <th className="p-2">Target Date</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inspection.findings.map((f, idx) => {
                    const ca = inspection.correctiveActions.find((c) => c.findingId === f.id);
                    return (
                      <tr key={f.id}>
                        <td className="p-2 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2 font-semibold text-slate-900">
                          {f.findingDescription || f.questionText}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              f.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : f.severity === 'MAJOR'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {f.severity}
                          </span>
                        </td>
                        <td className="p-2 text-slate-700">{ca?.actionDescription || '-'}</td>
                        <td className="p-2 text-slate-600">{ca?.responsiblePerson || '-'}</td>
                        <td className="p-2 text-slate-600">{ca?.dueDate || '-'}</td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ca?.status === 'VERIFIED' || ca?.status === 'CLOSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ca?.status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ca?.status || 'OPEN'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Strengths and Comments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="block text-slate-800 uppercase text-[10px]">
              Observed Facility Strengths:
            </strong>
            <p className="text-slate-700 whitespace-pre-line">
              {inspection.strengths || 'No specific strengths recorded.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="block text-slate-800 uppercase text-[10px]">
              Inspector Overall Remarks:
            </strong>
            <p className="text-slate-700 whitespace-pre-line">
              {inspection.inspectorComments || 'Standard post-inspection audit concluded.'}
            </p>
          </div>
        </div>

        {/* Controlled Administrative Unlock Audit Entry (if applicable) */}
        {inspection.adminUnlockedForCorrection && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <strong className="flex items-center gap-1 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Administrative Unlock / Correction Record:
            </strong>
            <p>
              Authorized By: <strong>{inspection.correctionAuthorizedBy}</strong>
            </p>
            <p className="italic">Justification: &quot;{inspection.correctionReason}&quot;</p>
          </div>
        )}

        {/* Attestation & Legal Signatures Section */}
        <div className="border-t-2 border-slate-900 pt-6 space-y-4">
          <p className="text-xs text-slate-600 italic">
            &quot;I confirm that the above filled information/data is true about the pharmacy/clinic service provision. The audit findings and corrective actions have been verbally communicated and delivered.&quot;
          </p>

          <div className="grid grid-cols-2 gap-8 pt-4">
            {/* Regulatory Inspector Signature */}
            <div className="border border-slate-300 rounded-xl p-4 space-y-2 bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Auditor / Regulatory Inspector
              </span>
              <p className="text-xs font-bold text-slate-900">{inspection.inspectorName}</p>
              <p className="text-[11px] text-slate-500">
                Health Regulatory Inspection Directorate
              </p>

              <div className="h-20 border border-slate-200 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                {inspectorSig ? (
                  <img
                    src={inspectorSig.signatureData}
                    alt="Inspector Signature"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400 italic">Digitally Signed on File</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-right">
                Signed: {inspectorSig?.signedAt ? new Date(inspectorSig.signedAt).toLocaleDateString() : inspection.inspectionDate}
              </p>
            </div>

            {/* Facility Technical Manager Signature */}
            <div className="border border-slate-300 rounded-xl p-4 space-y-2 bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Facility Technical Manager / Head
              </span>
              <p className="text-xs font-bold text-slate-900">
                {facilityHeadSig?.signerName || facility?.technicalManager}
              </p>
              <p className="text-[11px] text-slate-500">
                {facilityHeadSig?.signerTitle || facility?.professionalLevelTM || 'Technical Manager'}
              </p>

              <div className="h-20 border border-slate-200 rounded-lg bg-white flex items-center justify-center overflow-hidden relative">
                {facilityHeadSig ? (
                  <img
                    src={facilityHeadSig.signatureData}
                    alt="Facility Head Signature"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400 italic">Counter-Signed on File</span>
                )}

                {/* Round Stamp Watermark */}
                <div className="absolute right-2 bottom-2 w-14 h-14 rounded-full border-2 border-emerald-700/40 text-emerald-800 text-[8px] font-bold flex items-center justify-center text-center uppercase rotate-12 pointer-events-none">
                  Official Facility Stamp
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-right">
                Signed: {facilityHeadSig?.signedAt ? new Date(facilityHeadSig.signedAt).toLocaleDateString() : inspection.inspectionDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Unlock Modal */}
      {showUnlockModal && (
        <AdminCorrectionModal
          inspection={inspection}
          onClose={() => setShowUnlockModal(false)}
          onUnlocked={() => {
            setShowUnlockModal(false);
            setActiveView('new_inspection');
          }}
        />
      )}

      {/* Follow-up Inspection Modal */}
      {showFollowUpModal && (
        <FollowUpModal
          inspection={inspection}
          onClose={() => setShowFollowUpModal(false)}
          onFollowUpStarted={(newFollowUp) => {
            setShowFollowUpModal(false);
            setCurrentInspection(newFollowUp);
            setActiveView('new_inspection');
          }}
        />
      )}
    </div>
  );
};
