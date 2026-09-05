import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Facility,
  FacilityType,
  ChecklistTemplate,
  ChecklistVersion,
  ChecklistQuestion,
  Inspection,
  AuditLog,
  ScoreConfig,
  InspectionAnswer,
  Finding,
  CorrectiveAction,
} from '../types';
import {
  SEED_USERS,
  SEED_FACILITY_TYPES,
  SEED_FACILITIES,
  SEED_CHECKLIST_TEMPLATES,
  SEED_INSPECTIONS,
  SEED_AUDIT_LOGS,
} from '../data/seedData';

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  facilityTypes: FacilityType[];
  facilities: Facility[];
  addFacility: (facilityData: Partial<Facility>) => Facility;
  updateFacility: (facility: Facility) => void;
  checklists: ChecklistTemplate[];
  inspections: Inspection[];
  currentInspection: Inspection | null;
  setCurrentInspection: (insp: Inspection | null) => void;
  saveInspection: (inspection: Inspection, isDraft?: boolean) => void;
  submitInspection: (inspectionId: string) => boolean;
  unlockForCorrection: (inspectionId: string, reason: string) => boolean;
  createFollowUpInspection: (originalInspectionId: string) => Inspection;
  updateFindingStatus: (
    inspectionId: string,
    findingId: string,
    caId: string,
    status: CorrectiveAction['status'],
    verificationComment?: string
  ) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entity: string, entityId: string, details: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  viewingInspectionId: string | null;
  setViewingInspectionId: (id: string | null) => void;
  isOnline: boolean;
  updateChecklistVersion: (checklistId: string, updatedVersion: ChecklistVersion) => void;
  calculateScore: (
    checklistVersion: ChecklistVersion,
    answers: Record<string, InspectionAnswer>
  ) => {
    obtainedScore: number;
    totalApplicableScore: number;
    scorePercentage: number;
    complianceGrade: 'GREEN' | 'YELLOW' | 'RED';
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  USERS: 'dhris_users_v1',
  CURRENT_USER_ID: 'dhris_current_user_id_v1',
  FACILITY_TYPES: 'dhris_facility_types_v1',
  FACILITIES: 'dhris_facilities_v1',
  CHECKLISTS: 'dhris_checklists_v1',
  INSPECTIONS: 'dhris_inspections_v1',
  AUDIT_LOGS: 'dhris_audit_logs_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID);
    const found = allUsers.find((u) => u.id === savedUserId);
    return found || allUsers[0];
  });

  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.FACILITY_TYPES);
    return saved ? JSON.parse(saved) : SEED_FACILITY_TYPES;
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.FACILITIES);
    return saved ? JSON.parse(saved) : SEED_FACILITIES;
  });

  const [checklists, setChecklists] = useState<ChecklistTemplate[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CHECKLISTS);
    return saved ? JSON.parse(saved) : SEED_CHECKLIST_TEMPLATES;
  });

  const [inspections, setInspections] = useState<Inspection[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INSPECTIONS);
    return saved ? JSON.parse(saved) : SEED_INSPECTIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [viewingInspectionId, setViewingInspectionId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
  }, [checklists]);

  const addAuditLog = (action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID, user.id);
      addAuditLog('USER_SWITCH', 'User', user.id, `Switched session to ${user.fullName} (${user.role})`);
    }
  };

  const switchRole = (role: UserRole) => {
    const targetUser = allUsers.find((u) => u.role === role);
    if (targetUser) {
      switchUser(targetUser.id);
    }
  };

  const addFacility = (facilityData: Partial<Facility>): Facility => {
    const count = facilities.length + 1;
    const typeCode = facilityData.facilityTypeId === 'pharmacy' ? 'CP' : facilityData.facilityTypeId === 'medium_clinic' ? 'MC' : 'MDC';
    const regCode = (facilityData.region || 'GEN').substring(0, 2).toUpperCase();
    const facilityCode = `${typeCode}-${regCode}-${String(count).padStart(3, '0')}`;

    const newFacility: Facility = {
      id: `fac-${Date.now()}`,
      facilityCode,
      name: facilityData.name || 'Unnamed Health Facility',
      facilityTypeId: facilityData.facilityTypeId || 'pharmacy',
      region: facilityData.region || 'Addis Ababa',
      zone: facilityData.zone || '',
      woreda: facilityData.woreda || '',
      town: facilityData.town || '',
      kebele: facilityData.kebele || '',
      houseNo: facilityData.houseNo || '',
      phone: facilityData.phone || '',
      ownerName: facilityData.ownerName || '',
      technicalManager: facilityData.technicalManager || '',
      professionalLevelTM: facilityData.professionalLevelTM || '',
      licenseNo: facilityData.licenseNo || `LIC-${Date.now()}`,
      licenseStatus: facilityData.licenseStatus || 'VALID',
      licenseIssueDate: facilityData.licenseIssueDate || new Date().toISOString().split('T')[0],
      hasTradeLicense: facilityData.hasTradeLicense ?? true,
      latitude: facilityData.latitude || 9.01,
      longitude: facilityData.longitude || 38.75,
      status: 'ACTIVE',
      dateRegistered: new Date().toISOString().split('T')[0],
    };

    setFacilities((prev) => [newFacility, ...prev]);
    addAuditLog('FACILITY_REGISTERED', 'Facility', newFacility.id, `Registered facility ${newFacility.name} (${newFacility.facilityCode})`);
    return newFacility;
  };

  const updateFacility = (updated: Facility) => {
    setFacilities((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    addAuditLog('FACILITY_UPDATED', 'Facility', updated.id, `Updated details for facility ${updated.name}`);
  };

  const calculateScore = (
    checklistVersion: ChecklistVersion,
    answers: Record<string, InspectionAnswer>
  ) => {
    let obtainedScore = 0;
    let totalApplicableScore = 0;

    for (const section of checklistVersion.sections) {
      for (const question of section.questions) {
        // If question has a conditional rule and condition is not met, skip
        if (question.conditionalRule) {
          const parentAnswer = answers[question.conditionalRule.dependsOnQuestionId];
          if (parentAnswer?.answerValue !== question.conditionalRule.expectedValue) {
            continue; // Not applicable
          }
        }

        const ans = answers[question.id];
        const maxScore = question.maxScore || 1;

        if (ans) {
          if (ans.complianceStatus === 'NA') {
            continue; // Exclude from denominator
          }
          totalApplicableScore += maxScore;
          obtainedScore += ans.score ?? 0;
        } else {
          // If not answered yet, count toward total applicable unless optional
          if (!question.isOptional) {
            totalApplicableScore += maxScore;
          }
        }
      }
    }

    const scorePercentage =
      totalApplicableScore > 0
        ? Math.round((obtainedScore / totalApplicableScore) * 1000) / 10
        : 0;

    const { greenThreshold, yellowThreshold } = checklistVersion.scoringConfig;
    let complianceGrade: 'GREEN' | 'YELLOW' | 'RED' = 'RED';
    if (scorePercentage >= greenThreshold) {
      complianceGrade = 'GREEN';
    } else if (scorePercentage >= yellowThreshold) {
      complianceGrade = 'YELLOW';
    }

    return { obtainedScore, totalApplicableScore, scorePercentage, complianceGrade };
  };

  const saveInspection = (inspection: Inspection, isDraft = true) => {
    const updatedInspection: Inspection = {
      ...inspection,
      status: isDraft ? 'DRAFT' : inspection.status,
      updatedAt: new Date().toISOString(),
    };

    setInspections((prev) => {
      const exists = prev.some((i) => i.id === updatedInspection.id);
      if (exists) {
        return prev.map((i) => (i.id === updatedInspection.id ? updatedInspection : i));
      } else {
        return [updatedInspection, ...prev];
      }
    });

    setCurrentInspection(updatedInspection);
    addAuditLog(
      isDraft ? 'INSPECTION_DRAFT_SAVED' : 'INSPECTION_UPDATED',
      'Inspection',
      updatedInspection.id,
      `Saved ${isDraft ? 'draft' : 'progress'} for inspection ${updatedInspection.inspectionNumber}`
    );
  };

  const submitInspection = (inspectionId: string): boolean => {
    const inspection = inspections.find((i) => i.id === inspectionId);
    if (!inspection) return false;

    // Determine final status
    const hasOpenCritical = inspection.findings.some(
      (f) => f.severity === 'CRITICAL' && f.status !== 'CLOSED' && f.status !== 'VERIFIED'
    );
    const finalStatus =
      hasOpenCritical || inspection.complianceGrade === 'RED'
        ? 'FOLLOW_UP_REQUIRED'
        : 'SUBMITTED';

    const finalized: Inspection = {
      ...inspection,
      status: finalStatus,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInspections((prev) => prev.map((i) => (i.id === inspectionId ? finalized : i)));
    setCurrentInspection(finalized);
    addAuditLog(
      'INSPECTION_SUBMITTED',
      'Inspection',
      inspectionId,
      `Inspection ${inspection.inspectionNumber} officially submitted with status ${finalStatus}. Score: ${inspection.scorePercentage}% (${inspection.complianceGrade})`
    );
    return true;
  };

  const unlockForCorrection = (inspectionId: string, reason: string): boolean => {
    if (currentUser.role !== 'ADMIN') return false;

    const inspection = inspections.find((i) => i.id === inspectionId);
    if (!inspection) return false;

    const unlocked: Inspection = {
      ...inspection,
      status: 'UNDER_CORRECTION',
      adminUnlockedForCorrection: true,
      correctionReason: reason,
      correctionAuthorizedBy: currentUser.fullName,
      updatedAt: new Date().toISOString(),
    };

    setInspections((prev) => prev.map((i) => (i.id === inspectionId ? unlocked : i)));
    setCurrentInspection(unlocked);
    addAuditLog(
      'ADMIN_CONTROLLED_CORRECTION_AUTHORIZED',
      'Inspection',
      inspectionId,
      `Administrator ${currentUser.fullName} unlocked inspection ${inspection.inspectionNumber} for controlled correction. Reason: "${reason}"`
    );
    return true;
  };

  const createFollowUpInspection = (originalInspectionId: string): Inspection => {
    const original = inspections.find((i) => i.id === originalInspectionId);
    if (!original) throw new Error('Original inspection not found');

    const facility = facilities.find((f) => f.id === original.facilityId);
    const template = checklists.find((c) => c.id === original.checklistId);
    const activeVersion =
      template?.versions.find((v) => v.id === original.checklistVersionId) ||
      template?.versions[0];

    const count = inspections.length + 1;
    const inspectionNumber = `FU-${original.inspectionNumber.replace('INSP-', '')}-${count}`;

    // Inherit unverified/open findings and corrective actions
    const openFindings = original.findings.filter((f) => f.status !== 'CLOSED');
    const openCAs = original.correctiveActions.filter((ca) => ca.status !== 'CLOSED');

    const followUp: Inspection = {
      id: `insp-fu-${Date.now()}`,
      inspectionNumber,
      facilityId: original.facilityId,
      facilityTypeId: original.facilityTypeId,
      checklistId: original.checklistId,
      checklistVersionId: original.checklistVersionId,
      checklistVersionNumber: original.checklistVersionNumber,
      inspectorId: currentUser.id,
      inspectorName: currentUser.fullName,
      inspectionDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toTimeString().slice(0, 5),
      status: 'IN_PROGRESS',
      answers: { ...original.answers }, // Preload previous answers for re-evaluation
      obtainedScore: original.obtainedScore,
      totalApplicableScore: original.totalApplicableScore,
      scorePercentage: original.scorePercentage,
      complianceGrade: original.complianceGrade,
      strengths: `Follow-up evaluation on previous audit gaps from ${original.inspectionDate}.`,
      gaps: '',
      signatures: [],
      findings: openFindings.map((f) => ({ ...f, id: `find-fu-${Date.now()}-${Math.random().toString(36).substring(7)}` })),
      correctiveActions: openCAs.map((ca) => ({ ...ca, id: `ca-fu-${Date.now()}-${Math.random().toString(36).substring(7)}` })),
      evidence: [],
      isFollowUp: true,
      originalInspectionId: original.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInspections((prev) => [followUp, ...prev]);
    setCurrentInspection(followUp);
    addAuditLog(
      'FOLLOW_UP_INSPECTION_CREATED',
      'Inspection',
      followUp.id,
      `Created follow-up inspection ${followUp.inspectionNumber} linked to parent inspection ${original.inspectionNumber}`
    );
    return followUp;
  };

  const updateFindingStatus = (
    inspectionId: string,
    findingId: string,
    caId: string,
    status: CorrectiveAction['status'],
    verificationComment?: string
  ) => {
    setInspections((prev) =>
      prev.map((insp) => {
        if (insp.id !== inspectionId) return insp;

        const updatedFindings = insp.findings.map((f) =>
          f.id === findingId ? { ...f, status } : f
        );

        const updatedCAs = insp.correctiveActions.map((ca) =>
          ca.id === caId
            ? {
                ...ca,
                status,
                verificationComment: verificationComment || ca.verificationComment,
                closureDate: status === 'CLOSED' || status === 'VERIFIED' ? new Date().toISOString().split('T')[0] : undefined,
                closedBy: status === 'CLOSED' || status === 'VERIFIED' ? currentUser.fullName : undefined,
              }
            : ca
        );

        return {
          ...insp,
          findings: updatedFindings,
          correctiveActions: updatedCAs,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    addAuditLog(
      'CORRECTIVE_ACTION_VERIFIED',
      'CorrectiveAction',
      caId,
      `Inspector ${currentUser.fullName} set corrective action status to ${status}. Verification: "${verificationComment || 'None'}"`
    );
  };

  const updateChecklistVersion = (checklistId: string, updatedVersion: ChecklistVersion) => {
    setChecklists((prev) =>
      prev.map((template) => {
        if (template.id !== checklistId) return template;
        return {
          ...template,
          versions: template.versions.map((v) =>
            v.id === updatedVersion.id ? updatedVersion : v
          ),
        };
      })
    );
    addAuditLog(
      'CHECKLIST_VERSION_UPDATED',
      'ChecklistVersion',
      updatedVersion.id,
      `Administrator ${currentUser.fullName} updated configuration for checklist version ${updatedVersion.versionNumber}`
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        switchRole,
        facilityTypes,
        facilities,
        addFacility,
        updateFacility,
        checklists,
        inspections,
        currentInspection,
        setCurrentInspection,
        saveInspection,
        submitInspection,
        unlockForCorrection,
        createFollowUpInspection,
        updateFindingStatus,
        auditLogs,
        addAuditLog,
        activeView,
        setActiveView,
        viewingInspectionId,
        setViewingInspectionId,
        isOnline,
        updateChecklistVersion,
        calculateScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
