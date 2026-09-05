import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  ShieldCheck,
  Building2,
  HelpCircle,
  GitBranch,
  Layers,
} from 'lucide-react';
import { ChecklistTemplate, ChecklistVersion, ChecklistSection, ChecklistQuestion } from '../../types';

export const ChecklistManager: React.FC = () => {
  const { checklists, facilityTypes, updateChecklistVersion, currentUser } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(checklists[0]?.id || '');
  const currentTemplate = checklists.find((c) => c.id === selectedTemplateId) || checklists[0];

  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    currentTemplate?.versions[0]?.id || ''
  );
  const currentVersion =
    currentTemplate?.versions.find((v) => v.id === selectedVersionId) ||
    currentTemplate?.versions[0];

  // Editable Scoring Config State
  const [greenThreshold, setGreenThreshold] = useState<number>(
    currentVersion?.scoringConfig.greenThreshold || 80
  );
  const [yellowThreshold, setYellowThreshold] = useState<number>(
    currentVersion?.scoringConfig.yellowThreshold || 60
  );
  const [autoCalculate, setAutoCalculate] = useState<boolean>(
    currentVersion?.scoringConfig.autoCalculate ?? true
  );

  // Active section for inspecting questions
  const [activeSectionId, setActiveSectionId] = useState<string>(
    currentVersion?.sections[0]?.id || ''
  );

  // New Question Modal State
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQNum, setNewQNum] = useState('');
  const [newQText, setNewQText] = useState('');
  const [newQGuidance, setNewQGuidance] = useState('');
  const [newQWeight, setNewQWeight] = useState(1);
  const [newQType, setNewQType] = useState<'yes_no' | 'met_partially_unmet'>('yes_no');

  const handleSaveScoringConfig = () => {
    if (!currentTemplate || !currentVersion) return;

    const updatedVersion: ChecklistVersion = {
      ...currentVersion,
      scoringConfig: {
        ...currentVersion.scoringConfig,
        greenThreshold,
        yellowThreshold,
        autoCalculate,
      },
    };

    updateChecklistVersion(currentTemplate.id, updatedVersion);
    alert(
      `Checklist scoring parameters updated for ${currentTemplate.title} (v${updatedVersion.versionNumber}):\nGreen Grade ≥ ${greenThreshold}%\nYellow Grade ≥ ${yellowThreshold}%`
    );
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate || !currentVersion || !activeSectionId) return;

    const targetSection = currentVersion.sections.find((s) => s.id === activeSectionId);
    if (!targetSection) return;

    const newQuestion: ChecklistQuestion = {
      id: `q-custom-${Date.now()}`,
      sectionId: activeSectionId,
      questionNumber: newQNum || `${targetSection.sectionNumber}.${targetSection.questions.length + 1}`,
      questionText: newQText,
      verificationGuidance: newQGuidance,
      scoreWeight: Number(newQWeight) || 1,
      maxScore: Number(newQWeight) || 1,
      questionType: newQType,
      required: true,
    };

    const updatedSections = currentVersion.sections.map((s) =>
      s.id === activeSectionId ? { ...s, questions: [...s.questions, newQuestion] } : s
    );

    const updatedVersion: ChecklistVersion = {
      ...currentVersion,
      sections: updatedSections,
    };

    updateChecklistVersion(currentTemplate.id, updatedVersion);
    setShowAddQuestionModal(false);
    setNewQNum('');
    setNewQText('');
    setNewQGuidance('');
    alert('New audit question added to section successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-700" />
            Checklist Template & Regulatory Scoring Engine
          </h2>
          <p className="text-xs text-slate-500">
            Configure audit requirements, threshold grading algorithms, and versioning for each health facility type
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Audit Form:</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value);
              const tmpl = checklists.find((c) => c.id === e.target.value);
              if (tmpl?.versions[0]) {
                setSelectedVersionId(tmpl.versions[0].id);
                setGreenThreshold(tmpl.versions[0].scoringConfig.greenThreshold);
                setYellowThreshold(tmpl.versions[0].scoringConfig.yellowThreshold);
                setActiveSectionId(tmpl.versions[0].sections[0]?.id || '');
              }
            }}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
          >
            {checklists.map((c) => (
              <option key={c.id} value={c.id}>
                {c.formNo || 'FORM'}: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentTemplate && currentVersion && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scoring Thresholds & Algorithm Settings (Left Column) */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-3">
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
                <span>Compliance Grading Thresholds</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Green Grade (Full Compliance)</span>
                    <span className="font-bold text-emerald-700 font-mono">≥ {greenThreshold}%</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={greenThreshold}
                    onChange={(e) => setGreenThreshold(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Facilities reaching this score pass audit with full operational compliance.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Yellow Grade (Conditional Compliance)</span>
                    <span className="font-bold text-amber-700 font-mono">≥ {yellowThreshold}%</span>
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="75"
                    step="5"
                    value={yellowThreshold}
                    onChange={(e) => setYellowThreshold(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Facilities in this band require mandatory corrective actions within 30-90 days.
                  </p>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-[11px]">
                  <strong>Red Grade (Unsatisfactory):</strong> Below {yellowThreshold}%. Triggers immediate regulatory re-inspection and potential license sanction.
                </div>

                <button
                  type="button"
                  onClick={handleSaveScoringConfig}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Grading Parameters
                </button>
              </div>
            </div>

            {/* Version Metadata Card */}
            <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-slate-500" />
                  Template Versioning
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold font-mono text-[10px]">
                  v{currentVersion.versionNumber} ACTIVE
                </span>
              </div>
              <p className="text-slate-600">
                <strong>Facility Target:</strong>{' '}
                {facilityTypes.find((t) => t.id === currentTemplate.facilityTypeId)?.name}
              </p>
              <p className="text-slate-600 font-mono">
                <strong>Form & SOP:</strong> {currentTemplate.formNo || '002'} / {currentTemplate.sopNo || 'ETH-PH-AUD-24'}
              </p>
              <p className="text-slate-600">
                <strong>Total Sections:</strong> {currentVersion.sections.length} sections
              </p>
              <p className="text-slate-600">
                <strong>Total Questions:</strong>{' '}
                {currentVersion.sections.reduce((acc, s) => acc + s.questions.length, 0)} criteria
              </p>
            </div>
          </div>

          {/* Section & Questions Tree (Right 2 columns) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Checklist Sections & Questions</h3>
                  <p className="text-xs text-slate-500">
                    Select a section to preview audit requirements or append new statutory criteria
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Audit Question
                </button>
              </div>

              {/* Sections Pills */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {currentVersion.sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeSectionId === sec.id
                        ? 'bg-indigo-950 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Sec {sec.sectionNumber}: {sec.sectionName}
                  </button>
                ))}
              </div>

              {/* Active Section Question List */}
              {(() => {
                const sec = currentVersion.sections.find((s) => s.id === activeSectionId);
                if (!sec) return null;

                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-indigo-700 block">
                          SECTION {sec.sectionNumber}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{sec.sectionName}</h4>
                      </div>
                      <span className="text-slate-500 font-medium">
                        {sec.questions.length} Questions
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                      {sec.questions.map((q) => (
                        <div
                          key={q.id}
                          className="border border-slate-200 rounded-xl p-3.5 bg-white text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-[11px]">
                                {q.questionNumber}
                              </span>
                              <span className="font-bold text-slate-900">{q.questionText}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              Weight: {q.scoreWeight || 1} pt(s)
                            </span>
                          </div>

                          {q.verificationGuidance && (
                            <p className="text-[11px] text-slate-500 whitespace-pre-line pl-6">
                              {q.verificationGuidance}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-950 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Audit Requirement</h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-indigo-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Question Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1.3 or 5.2.1"
                    value={newQNum}
                    onChange={(e) => setNewQNum(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Score Weight (Points)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newQWeight}
                    onChange={(e) => setNewQWeight(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Requirement Statement / Text <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory temperature logging sheet displayed inside vaccine refrigerator"
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Verification / Assessment Protocol (Bulleted Guidance)
                </label>
                <textarea
                  rows={2}
                  placeholder="• Check twice daily log records • Inspect calibrated thermometer probe"
                  value={newQGuidance}
                  onChange={(e) => setNewQGuidance(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Response Grading Type
                </label>
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                >
                  <option value="yes_no">Yes / No</option>
                  <option value="met_partially_unmet">Met / Partially Met / Unmet</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
