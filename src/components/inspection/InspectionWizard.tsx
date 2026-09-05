import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  Building2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  Compass,
  FileText,
  PenTool,
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Pill,
  Stethoscope,
  Info,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  Inspection,
  Facility,
  ChecklistTemplate,
  ChecklistVersion,
  InspectionAnswer,
  Finding,
  CorrectiveAction,
  Evidence,
  Signature,
  TracerMedicineItem,
  ComplianceStatus,
} from '../../types';
import { SignaturePad } from './SignaturePad';
import { PHARMACY_TRACER_MEDICINES } from '../../data/seedData';

export const InspectionWizard: React.FC = () => {
  const {
    currentUser,
    facilities,
    facilityTypes,
    checklists,
    currentInspection,
    saveInspection,
    submitInspection,
    setActiveView,
    setViewingInspectionId,
    calculateScore,
  } = useApp();

  // Selected Facility
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(() => {
    if (currentInspection) return currentInspection.facilityId;
    const stored = localStorage.getItem('dhris_selected_facility_id');
    return stored || facilities[0]?.id || '';
  });

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);

  // Find appropriate checklist template
  const template: ChecklistTemplate | undefined = checklists.find(
    (c) => c.facilityTypeId === selectedFacility?.facilityTypeId
  );
  const activeVersion: ChecklistVersion | undefined =
    template?.versions.find((v) => v.status === 'ACTIVE') || template?.versions[0];

  // Wizard Steps: 1: Facility Info, 2: Questionnaire, 3: Tracer / Equipment (if applicable), 4: Findings & Plan, 5: Signatures & Review
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  // Form State
  const [answers, setAnswers] = useState<Record<string, InspectionAnswer>>(() => {
    return currentInspection?.answers || {};
  });

  const [tracerMeds, setTracerMeds] = useState<TracerMedicineItem[]>(() => {
    return currentInspection?.tracerMedicines || PHARMACY_TRACER_MEDICINES;
  });

  const [strengths, setStrengths] = useState<string>(currentInspection?.strengths || '');
  const [gaps, setGaps] = useState<string>(currentInspection?.gaps || '');
  const [actionPlan, setActionPlan] = useState<string>(currentInspection?.actionPlan || '');
  const [inspectorComments, setInspectorComments] = useState<string>(
    currentInspection?.inspectorComments || ''
  );
  const [secretNotes, setSecretNotes] = useState<string>(
    currentInspection?.secretRegulatoryNotes || ''
  );

  const [findings, setFindings] = useState<Finding[]>(currentInspection?.findings || []);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>(
    currentInspection?.correctiveActions || []
  );

  const [evidenceList, setEvidenceList] = useState<Evidence[]>(currentInspection?.evidence || []);

  // Signatures
  const [inspectorSig, setInspectorSig] = useState<string>(() => {
    const s = currentInspection?.signatures?.find((s) => s.signerType === 'INSPECTOR');
    return s?.signatureData || '';
  });
  const [inspectorName, setInspectorName] = useState<string>(
    currentUser.fullName || 'Sr. Almaz Kebede'
  );
  const [inspectorTitle, setInspectorTitle] = useState<string>(
    currentUser.professionalTitle || 'Regulatory Inspector'
  );

  const [facilityHeadSig, setFacilityHeadSig] = useState<string>(() => {
    const s = currentInspection?.signatures?.find(
      (s) => s.signerType === 'FACILITY_HEAD' || s.signerType === 'RESPONSIBLE_OFFICIAL'
    );
    return s?.signatureData || '';
  });
  const [facilityHeadName, setFacilityHeadName] = useState<string>(
    selectedFacility?.technicalManager || ''
  );
  const [facilityHeadTitle, setFacilityHeadTitle] = useState<string>(
    selectedFacility?.professionalLevelTM || 'Technical Manager'
  );
  const [facilityStampConfirmed, setFacilityStampConfirmed] = useState<boolean>(true);

  // GPS State
  const [latitude, setLatitude] = useState<number>(
    currentInspection?.latitude || selectedFacility?.latitude || 9.01
  );
  const [longitude, setLongitude] = useState<number>(
    currentInspection?.longitude || selectedFacility?.longitude || 38.75
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(
    currentInspection?.gpsAccuracy
  );
  const [gpsLoading, setGpsLoading] = useState(false);

  // Is inspection submitted / locked?
  const isLocked =
    Boolean(currentInspection?.submittedAt) &&
    currentInspection?.status !== 'UNDER_CORRECTION' &&
    currentInspection?.status !== 'DRAFT';

  // Set default active section when activeVersion loads
  useEffect(() => {
    if (activeVersion && activeVersion.sections.length > 0 && !activeSectionId) {
      setActiveSectionId(activeVersion.sections[0].id);
    }
  }, [activeVersion, activeSectionId]);

  // Update facility head name when facility changes
  useEffect(() => {
    if (selectedFacility && !currentInspection) {
      setFacilityHeadName(selectedFacility.technicalManager);
      setFacilityHeadTitle(selectedFacility.professionalLevelTM || 'Technical Manager');
      setLatitude(selectedFacility.latitude);
      setLongitude(selectedFacility.longitude);
    }
  }, [selectedFacility, currentInspection]);

  // Calculate scores dynamically
  const scoreResult = activeVersion
    ? calculateScore(activeVersion, answers)
    : {
        obtainedScore: 0,
        totalApplicableScore: 0,
        scorePercentage: 0,
        complianceGrade: 'RED' as const,
      };

  const handleCaptureLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
      },
      (err) => {
        alert(`Failed to acquire GPS: ${err.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAnswerChange = (
    questionId: string,
    val: string,
    complianceStatus: ComplianceStatus,
    score: number
  ) => {
    if (isLocked) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answerValue: val,
        complianceStatus,
        score,
        remarks: prev[questionId]?.remarks || '',
        evidenceIds: prev[questionId]?.evidenceIds || [],
      },
    }));
  };

  const handleRemarksChange = (questionId: string, remarks: string) => {
    if (isLocked) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {
          questionId,
          answerValue: '',
          complianceStatus: 'NA',
          score: 0,
        }),
        remarks,
      },
    }));
  };

  // Add evidence / photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, questionId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newEv: Evidence = {
        id: `ev-${Date.now()}`,
        inspectionId: currentInspection?.id || 'new',
        questionId,
        fileName: file.name,
        fileUrl: reader.result as string,
        fileType: file.type,
        fileSize: file.size,
        latitude,
        longitude,
        uploadedBy: currentUser.fullName,
        uploadedAt: new Date().toISOString(),
        caption: `Evidence for ${questionId || 'general premises'}`,
      };

      setEvidenceList((prev) => [...prev, newEv]);

      if (questionId) {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: {
            ...(prev[questionId] || {
              questionId,
              answerValue: 'YES',
              complianceStatus: 'YES',
              score: 1,
            }),
            evidenceIds: [...(prev[questionId]?.evidenceIds || []), newEv.id],
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Build current inspection object for saving
  const buildInspectionObject = (isDraft = true): Inspection => {
    const inspId = currentInspection?.id || `insp-${Date.now()}`;
    const inspNumber =
      currentInspection?.inspectionNumber ||
      `INSP-${selectedFacility?.facilityCode || 'GEN'}-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 900) + 100
      )}`;

    const signatures: Signature[] = [];
    if (inspectorSig) {
      signatures.push({
        id: `sig-insp-${Date.now()}`,
        inspectionId: inspId,
        signerName: inspectorName,
        signerTitle: inspectorTitle,
        signerType: 'INSPECTOR',
        signatureData: inspectorSig,
        signedAt: new Date().toISOString(),
      });
    }

    if (facilityHeadSig) {
      signatures.push({
        id: `sig-head-${Date.now()}`,
        inspectionId: inspId,
        signerName: facilityHeadName,
        signerTitle: facilityHeadTitle,
        signerType: 'FACILITY_HEAD',
        signatureData: facilityHeadSig,
        signedAt: new Date().toISOString(),
        stampNote: facilityStampConfirmed ? 'Official Facility Stamp Verified' : undefined,
      });
    }

    return {
      id: inspId,
      inspectionNumber: inspNumber,
      facilityId: selectedFacilityId,
      facilityTypeId: selectedFacility?.facilityTypeId || 'pharmacy',
      checklistId: template?.id || 'chk-pharmacy',
      checklistVersionId: activeVersion?.id || 'ver-pharmacy-1',
      checklistVersionNumber: activeVersion?.versionNumber || '1.0',
      inspectorId: currentUser.id,
      inspectorName: currentUser.fullName,
      inspectionDate: currentInspection?.inspectionDate || new Date().toISOString().split('T')[0],
      startTime: currentInspection?.startTime || new Date().toTimeString().slice(0, 5),
      endTime: isDraft ? undefined : new Date().toTimeString().slice(0, 5),
      status: isDraft ? 'DRAFT' : 'SUBMITTED',
      answers,
      tracerMedicines: selectedFacility?.facilityTypeId === 'pharmacy' ? tracerMeds : undefined,
      obtainedScore: scoreResult.obtainedScore,
      totalApplicableScore: scoreResult.totalApplicableScore,
      scorePercentage: scoreResult.scorePercentage,
      complianceGrade: scoreResult.complianceGrade,
      strengths,
      gaps,
      actionPlan,
      inspectorComments,
      secretRegulatoryNotes: secretNotes,
      signatures,
      findings,
      correctiveActions,
      evidence: evidenceList,
      latitude,
      longitude,
      gpsAccuracy,
      gpsConfirmed: true,
      isFollowUp: currentInspection?.isFollowUp,
      originalInspectionId: currentInspection?.originalInspectionId,
      createdAt: currentInspection?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: isDraft ? undefined : new Date().toISOString(),
    };
  };

  const handleSaveDraft = () => {
    const insp = buildInspectionObject(true);
    saveInspection(insp, true);
    alert(`Draft inspection ${insp.inspectionNumber} saved successfully to offline/local storage.`);
  };

  const handleSubmitFinal = () => {
    if (!inspectorSig) {
      alert('Regulatory Inspector signature is required before final submission.');
      setCurrentStep(5);
      return;
    }

    if (!facilityHeadSig) {
      const proceed = confirm(
        'Warning: Facility Representative / Technical Manager signature is missing. Are you authorized to submit without facility counter-signature?'
      );
      if (!proceed) {
        setCurrentStep(5);
        return;
      }
    }

    const insp = buildInspectionObject(false);
    saveInspection(insp, false);
    submitInspection(insp.id);

    alert(
      `Inspection ${insp.inspectionNumber} submitted successfully!\nFinal Score: ${insp.scorePercentage}% (${insp.complianceGrade})\nStatus: ${insp.status}`
    );

    setViewingInspectionId(insp.id);
    setActiveView('view_report');
  };

  // Helper to add a non-compliance finding
  const handleAddFinding = () => {
    const newFId = `find-${Date.now()}`;
    const newCaId = `ca-${Date.now()}`;

    const newFinding: Finding = {
      id: newFId,
      inspectionId: currentInspection?.id || 'new',
      sectionName: activeVersion?.sections.find((s) => s.id === activeSectionId)?.sectionName || 'General',
      questionText: 'Regulatory Non-compliance identified',
      findingDescription: '',
      severity: 'MAJOR',
      status: 'OPEN',
    };

    const newCa: CorrectiveAction = {
      id: newCaId,
      findingId: newFId,
      actionDescription: '',
      responsiblePerson: selectedFacility?.technicalManager || 'Technical Manager',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'OPEN',
    };

    setFindings((prev) => [...prev, newFinding]);
    setCorrectiveActions((prev) => [...prev, newCa]);
  };

  const handleRemoveFinding = (findingId: string) => {
    setFindings((prev) => prev.filter((f) => f.id !== findingId));
    setCorrectiveActions((prev) => prev.filter((ca) => ca.findingId !== findingId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Context */}
      <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                {template?.formNo || 'FORM No.: 002'}
              </span>
              <span className="text-xs font-mono text-slate-500 uppercase">
                {template?.sopNo || 'SOP No: ETH-PH-AUD-24'}
              </span>
              {currentInspection?.isFollowUp && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                  Follow-Up Audit
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 uppercase">
              {template?.title || 'Community Pharmacy Post-Inspection Checklist'}
            </h2>
          </div>
        </div>

        {/* Live Score Widget & Audit Info */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-300">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">
              Calculated Score
            </span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-lg font-black text-indigo-950">
                {scoreResult.scorePercentage}%
              </span>
              <span className="text-xs text-slate-500">
                ({scoreResult.obtainedScore}/{scoreResult.totalApplicableScore} pts)
              </span>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider border shadow-2xs ${
              scoreResult.complianceGrade === 'GREEN'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : scoreResult.complianceGrade === 'YELLOW'
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {scoreResult.complianceGrade}
          </div>
        </div>
      </div>

      {/* Step Indicator Bar */}
      <div className="bg-white rounded-xl border border-slate-300 p-2 shadow-xs flex items-center justify-between overflow-x-auto text-xs font-semibold text-slate-600">
        {[
          { num: 1, label: 'Facility Details' },
          { num: 2, label: 'Inspection Checklist' },
          ...(selectedFacility?.facilityTypeId === 'pharmacy'
            ? [{ num: 3, label: 'Tracer Sampling' }]
            : []),
          { num: 4, label: 'Findings & Action Plan' },
          { num: 5, label: 'Signatures & Submit' },
        ].map((step) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          return (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isCompleted
                  ? 'text-indigo-700 hover:bg-indigo-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isActive
                    ? 'bg-white text-indigo-600'
                    : isCompleted
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isCompleted ? '✓' : step.num}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: Facility Details & GPS Confirmation */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                1. General Facility Information (Form 002 Sec 5)
              </h3>
              <p className="text-xs text-slate-500">
                Confirm healthcare facility identity, technical manager, and geographic coordinates
              </p>
            </div>

            {!currentInspection && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">Select Facility:</label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.facilityCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedFacility && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  5.1 - 5.2 Facility Identification
                </span>
                <p className="text-sm font-bold text-slate-900">{selectedFacility.name}</p>
                <p className="text-slate-600">
                  <strong>Level/Type:</strong>{' '}
                  {facilityTypes.find((t) => t.id === selectedFacility.facilityTypeId)?.name}
                </p>
                <p className="font-mono text-slate-500">
                  <strong>Facility Code:</strong> {selectedFacility.facilityCode}
                </p>
                <p className="text-slate-600">
                  <strong>Registered Owner:</strong> {selectedFacility.ownerName}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  5.3 - 5.4 Technical Management
                </span>
                <p className="text-sm font-bold text-slate-900">{selectedFacility.technicalManager}</p>
                <p className="text-slate-600">
                  <strong>Qualification Level:</strong> {selectedFacility.professionalLevelTM}
                </p>
                <p className="text-slate-600">
                  <strong>Regulatory License No:</strong>{' '}
                  <span className="font-mono font-semibold text-emerald-700">
                    {selectedFacility.licenseNo}
                  </span>
                </p>
                <p className="text-slate-600">
                  <strong>License Status:</strong>{' '}
                  <span className="font-bold text-emerald-700">{selectedFacility.licenseStatus}</span>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  5.6 Address & Location
                </span>
                <p className="text-slate-800">
                  <strong>Region / Zone:</strong> {selectedFacility.region} / {selectedFacility.zone}
                </p>
                <p className="text-slate-800">
                  <strong>Woreda / Town:</strong> {selectedFacility.woreda} / {selectedFacility.town}
                </p>
                <p className="text-slate-800">
                  <strong>Kebele / House No:</strong> {selectedFacility.kebele} / {selectedFacility.houseNo || 'N/A'}
                </p>
                <p className="text-slate-800">
                  <strong>Phone Number:</strong> {selectedFacility.phone}
                </p>
              </div>
            </div>
          )}

          {/* GPS Geolocation Verification Box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Auditor GPS Geolocation Tagging (Section 16)
                </h4>
                <p className="text-xs font-mono text-emerald-900">
                  Latitude: {latitude}° N | Longitude: {longitude}° E{' '}
                  {gpsAccuracy ? `(Accuracy ±${gpsAccuracy}m)` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCaptureLiveLocation}
              disabled={gpsLoading}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Compass className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              {gpsLoading ? 'Acquiring GPS...' : 'Acquire Current Device GPS'}
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              Proceed to Inspection Checklist
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Dynamic Checklist Questionnaire */}
      {currentStep === 2 && activeVersion && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-150">
          {/* Section Navigation Tabs (Left column) */}
          <div className="lg:col-span-1 space-y-1 bg-white p-3 rounded-xl border border-slate-300 shadow-xs h-fit max-h-[75vh] overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Checklist Sections ({activeVersion.sections.length})
            </div>

            {activeVersion.sections.map((sec) => {
              const isActive = sec.id === activeSectionId;
              const answeredCount = sec.questions.filter((q) => Boolean(answers[q.id])).length;
              const isSectionComplete = answeredCount === sec.questions.length;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">
                    {sec.sectionNumber}. {sec.sectionName}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : isSectionComplete
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {answeredCount}/{sec.questions.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Section Questions (Right column) */}
          <div className="lg:col-span-3 space-y-4">
            {(() => {
              const currentSection = activeVersion.sections.find((s) => s.id === activeSectionId);
              if (!currentSection) return null;

              return (
                <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        Section {currentSection.sectionNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {currentSection.sectionName}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {currentSection.questions.length} Audit Requirements
                    </span>
                  </div>

                  <div className="space-y-5">
                    {currentSection.questions.map((question) => {
                      // Check conditional logic
                      if (question.conditionalRule) {
                        const parentAnswer =
                          answers[question.conditionalRule.dependsOnQuestionId];
                        if (
                          parentAnswer?.answerValue !== question.conditionalRule.expectedValue
                        ) {
                          return null; // Skip conditionally hidden question
                        }
                      }

                      const ans = answers[question.id];

                      return (
                        <div
                          key={question.id}
                          className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {question.questionNumber}
                                </span>
                                {question.required && (
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    [Mandatory]
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-slate-500">
                                  Weight: {question.scoreWeight || 1} pt(s)
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                                {question.questionText}
                              </p>
                            </div>

                            {/* Compliance Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {question.questionType === 'met_partially_unmet' ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() =>
                                      handleAnswerChange(
                                        question.id,
                                        'MET',
                                        'MET',
                                        question.scoreWeight || 2
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      ans?.complianceStatus === 'MET'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Met
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() =>
                                      handleAnswerChange(
                                        question.id,
                                        'PARTIALLY_MET',
                                        'PARTIALLY_MET',
                                        Math.max(1, Math.floor((question.scoreWeight || 2) / 2))
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      ans?.complianceStatus === 'PARTIALLY_MET'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Partially Met
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() =>
                                      handleAnswerChange(
                                        question.id,
                                        'UNMET',
                                        'UNMET',
                                        0
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      ans?.complianceStatus === 'UNMET'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Unmet
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() =>
                                      handleAnswerChange(
                                        question.id,
                                        'YES',
                                        'YES',
                                        question.scoreWeight || 1
                                      )
                                    }
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      ans?.complianceStatus === 'YES'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() =>
                                      handleAnswerChange(question.id, 'NO', 'NO', 0)
                                    }
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      ans?.complianceStatus === 'NO'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    No
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() =>
                                  handleAnswerChange(question.id, 'NA', 'NA', 0)
                                }
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  ans?.complianceStatus === 'NA'
                                    ? 'bg-slate-700 text-white'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                                }`}
                                title="Not Applicable"
                              >
                                N/A
                              </button>
                            </div>
                          </div>

                          {/* Verification Guidance */}
                          {question.verificationGuidance && (
                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-900 whitespace-pre-line flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block text-[11px]">
                                  Verification / Assessment Protocol:
                                </span>
                                {question.verificationGuidance}
                              </div>
                            </div>
                          )}

                          {/* Inspector Remarks & Evidence */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <input
                              type="text"
                              disabled={isLocked}
                              placeholder="Audit finding remarks / specific observation..."
                              value={ans?.remarks || ''}
                              onChange={(e) => handleRemarksChange(question.id, e.target.value)}
                              className="flex-1 min-w-[200px] text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />

                            <label className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer">
                              <Camera className="w-3.5 h-3.5 text-slate-500" />
                              <span>Photo Evidence</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isLocked}
                                onChange={(e) => handlePhotoUpload(e, question.id)}
                              />
                            </label>

                            {ans?.evidenceIds && ans.evidenceIds.length > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                                {ans.evidenceIds.length} Photo Attached
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Section Bottom Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Progress
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const idx = activeVersion.sections.findIndex(
                            (s) => s.id === activeSectionId
                          );
                          if (idx < activeVersion.sections.length - 1) {
                            setActiveSectionId(activeVersion.sections[idx + 1].id);
                          } else {
                            setCurrentStep(
                              selectedFacility?.facilityTypeId === 'pharmacy' ? 3 : 4
                            );
                          }
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        Next Section
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* STEP 3: Tracer Medicines Sampling (for Community Pharmacy) */}
      {currentStep === 3 && selectedFacility?.facilityTypeId === 'pharmacy' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Regulatory Tracer Module
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Essential Tracer Medicines Physical Sampling (Form 002)
              </h3>
              <p className="text-xs text-slate-500">
                Audit availability, cold chain storage integrity, and batch compliance of tracer products
              </p>
            </div>
            <Pill className="w-6 h-6 text-emerald-600" />
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-8">#</th>
                  <th className="p-3 min-w-[220px]">Tracer Medicine Name</th>
                  <th className="p-3 text-center">Available?</th>
                  <th className="p-3">Sample Batch No</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3 text-center">Storage Condition OK?</th>
                  <th className="p-3">Audit Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tracerMeds.map((med, idx) => (
                  <tr key={med.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{med.name}</td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={med.isAvailable}
                        disabled={isLocked}
                        onChange={(e) => {
                          const updated = [...tracerMeds];
                          updated[idx] = { ...med, isAvailable: e.target.checked };
                          setTracerMeds(updated);
                        }}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="e.g. B-9941"
                        value={med.batchNumber || ''}
                        disabled={isLocked}
                        onChange={(e) => {
                          const updated = [...tracerMeds];
                          updated[idx] = { ...med, batchNumber: e.target.value };
                          setTracerMeds(updated);
                        }}
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={med.expiryDate || ''}
                        disabled={isLocked}
                        onChange={(e) => {
                          const updated = [...tracerMeds];
                          updated[idx] = { ...med, expiryDate: e.target.value };
                          setTracerMeds(updated);
                        }}
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={med.storageConditionOk ?? true}
                        disabled={isLocked}
                        onChange={(e) => {
                          const updated = [...tracerMeds];
                          updated[idx] = { ...med, storageConditionOk: e.target.checked };
                          setTracerMeds(updated);
                        }}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="Observations..."
                        value={med.remarks || ''}
                        disabled={isLocked}
                        onChange={(e) => {
                          const updated = [...tracerMeds];
                          updated[idx] = { ...med, remarks: e.target.value };
                          setTracerMeds(updated);
                        }}
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Back to Checklist
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              Proceed to Findings & Action Plan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Findings, Strengths, Gaps & Corrective Actions */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Section 16 & Audit Synthesis
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Audit Findings, Strengths, Gaps & Corrective Action Plan
            </h3>
            <p className="text-xs text-slate-500">
              Document strengths observed, regulatory deficiencies identified, and mandatory corrective actions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Identified Strengths of the Facility
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                placeholder="Highlight areas of exemplary compliance (e.g. good storage conditions, updated registers, professional counseling)..."
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Identified Gaps & Non-Compliances
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                placeholder="Summarize key deviations from national directives and health regulations..."
                value={gaps}
                onChange={(e) => setGaps(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Structured Non-Compliance Corrective Actions Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Action Plan for Identified Gaps (Formal Corrective Actions)
              </h4>
              <button
                type="button"
                disabled={isLocked}
                onClick={handleAddFinding}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Action Item
              </button>
            </div>

            {findings.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl text-center italic border border-slate-200">
                No major non-compliance gaps flagged yet. Click &quot;Add Action Item&quot; if any gap requires formal corrective action and follow-up.
              </p>
            ) : (
              <div className="space-y-3">
                {findings.map((f, idx) => {
                  const ca = correctiveActions.find((c) => c.findingId === f.id);

                  return (
                    <div
                      key={f.id}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Finding #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={f.severity}
                            disabled={isLocked}
                            onChange={(e) => {
                              const updated = [...findings];
                              updated[idx] = { ...f, severity: e.target.value as any };
                              setFindings(updated);
                            }}
                            className="text-xs bg-white border border-slate-300 rounded px-2 py-0.5 font-bold"
                          >
                            <option value="CRITICAL">Critical Severity</option>
                            <option value="MAJOR">Major Severity</option>
                            <option value="MINOR">Minor Severity</option>
                          </select>

                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFinding(f.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Specific Deficiency Description
                          </label>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="e.g. Broken plumbing at hand washing sink in examination room"
                            value={f.findingDescription}
                            onChange={(e) => {
                              const updated = [...findings];
                              updated[idx] = { ...f, findingDescription: e.target.value };
                              setFindings(updated);
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Required Corrective Action
                          </label>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="e.g. Repair drainage, provide running water and liquid soap dispenser"
                            value={ca?.actionDescription || ''}
                            onChange={(e) => {
                              const updated = [...correctiveActions];
                              const caIdx = updated.findIndex((c) => c.findingId === f.id);
                              if (caIdx !== -1) {
                                updated[caIdx] = {
                                  ...updated[caIdx],
                                  actionDescription: e.target.value,
                                };
                                setCorrectiveActions(updated);
                              }
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Responsible Person
                          </label>
                          <input
                            type="text"
                            disabled={isLocked}
                            value={ca?.responsiblePerson || ''}
                            onChange={(e) => {
                              const updated = [...correctiveActions];
                              const caIdx = updated.findIndex((c) => c.findingId === f.id);
                              if (caIdx !== -1) {
                                updated[caIdx] = {
                                  ...updated[caIdx],
                                  responsiblePerson: e.target.value,
                                };
                                setCorrectiveActions(updated);
                              }
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Target Due Date
                          </label>
                          <input
                            type="date"
                            disabled={isLocked}
                            value={ca?.dueDate || ''}
                            onChange={(e) => {
                              const updated = [...correctiveActions];
                              const caIdx = updated.findIndex((c) => c.findingId === f.id);
                              if (caIdx !== -1) {
                                updated[caIdx] = {
                                  ...updated[caIdx],
                                  dueDate: e.target.value,
                                };
                                setCorrectiveActions(updated);
                              }
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Audit Inspector&apos;s Concluding Comments (Shared with Facility)
              </label>
              <textarea
                rows={2}
                disabled={isLocked}
                placeholder="Concluding remarks presented to management..."
                value={inspectorComments}
                onChange={(e) => setInspectorComments(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-1">
              <label className="text-xs font-bold text-rose-900 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                Confidential Regulatory Directorate Notes (Filled Secretly / Internal Only)
              </label>
              <p className="text-[11px] text-rose-700">
                Under Form 002: &quot;Other steps to be investigated by the regulatory / should be filled secretly&quot;
              </p>
              <textarea
                rows={2}
                disabled={isLocked}
                placeholder="Document any suspicious wholesale supply lines, off-book narcotic suspicions, or surveillance flags..."
                value={secretNotes}
                onChange={(e) => setSecretNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-rose-200 bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              Proceed to Signatures & Review
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Digital Signatures & Final Submission */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Legal Attestation & Confirmation
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Digital Signatures & Final Submission
            </h3>
            <p className="text-xs text-slate-500">
              Both the Regulatory Inspector and Facility Technical Manager must provide verified digital signatures
            </p>
          </div>

          {/* Attestation Text */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <p className="italic font-medium">
              &quot;I confirm that the above filled information/data is true about the pharmacy/clinic service provision. The audit findings and corrective actions have been verbally communicated and delivered.&quot;
            </p>
            <p className="text-[11px] text-slate-500">
              At the conclusion of the audit, thank the management body and all staff of the facility who participated in the auditing process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inspector Signature */}
            <div className="space-y-2">
              <SignaturePad
                label="Regulatory Inspector Signature"
                signerName={inspectorName}
                signerTitle={inspectorTitle}
                onNameChange={setInspectorName}
                onTitleChange={setInspectorTitle}
                initialSignature={inspectorSig}
                onSave={setInspectorSig}
                isReadOnly={isLocked}
              />
            </div>

            {/* Facility Head Signature */}
            <div className="space-y-3">
              <SignaturePad
                label="Facility Technical Manager / Head Signature"
                signerName={facilityHeadName}
                signerTitle={facilityHeadTitle}
                onNameChange={setFacilityHeadName}
                onTitleChange={setFacilityHeadTitle}
                initialSignature={facilityHeadSig}
                onSave={setFacilityHeadSig}
                isReadOnly={isLocked}
              />

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stamp_confirm"
                  checked={facilityStampConfirmed}
                  disabled={isLocked}
                  onChange={(e) => setFacilityStampConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="stamp_confirm" className="text-xs text-slate-700 font-medium">
                  Official Facility Physical Round Stamp Affixed & Verified
                </label>
              </div>
            </div>
          </div>

          {/* Submission / Lock Warning */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Important Submission Policy (Section 2.1)</strong>
              Once submitted, this inspection is officially finalized in the regulatory archive. Regulatory Inspectors cannot modify finalized records. Subsequent changes require formal authorization from the System Administrator and are tracked in the audit trail.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>

              {!isLocked && (
                <button
                  type="button"
                  onClick={handleSubmitFinal}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Submit Official Inspection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
