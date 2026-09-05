export type UserRole = 'ADMIN' | 'INSPECTOR';

export interface User {
  id: string;
  username: string;
  fullName: string;
  professionalTitle: string;
  role: UserRole;
  organization: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  assignedFacilityIds?: string[];
}

export interface FacilityType {
  id: string; // 'pharmacy' | 'medium_clinic' | 'dental_clinic'
  name: string;
  code: string;
  description: string;
  defaultFormNo: string;
  defaultSopNo: string;
}

export type LicenseStatus = 'VALID' | 'EXPIRED' | 'PROVISIONAL' | 'SUSPENDED';

export interface Facility {
  id: string;
  facilityCode: string;
  name: string;
  facilityTypeId: string;
  region: string;
  zone: string;
  woreda: string;
  town: string;
  kebele: string;
  houseNo: string;
  phone: string;
  ownerName: string;
  technicalManager: string;
  professionalLevelTM: string;
  licenseNo: string;
  licenseStatus: LicenseStatus;
  licenseIssueDate: string;
  hasTradeLicense: boolean;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  dateRegistered: string;
}

export type QuestionType =
  | 'yes_no'
  | 'met_partially_unmet'
  | 'available_not_available'
  | 'text'
  | 'number'
  | 'select'
  | 'tracer_table';

export interface QuestionOption {
  label: string;
  value: string;
  score: number;
}

export interface ConditionalRule {
  dependsOnQuestionId: string;
  expectedValue: string;
  action: 'show' | 'hide';
}

export interface ChecklistQuestion {
  id: string;
  sectionId: string;
  questionNumber: string;
  questionText: string;
  verificationGuidance?: string;
  questionType: QuestionType;
  required: boolean;
  scoreWeight: number;
  maxScore: number;
  options?: QuestionOption[];
  conditionalRule?: ConditionalRule;
  isOptional?: boolean;
}

export interface ChecklistSection {
  id: string;
  checklistVersionId: string;
  sectionNumber: string;
  sectionName: string;
  description?: string;
  displayOrder: number;
  questions: ChecklistQuestion[];
}

export interface ChecklistVersion {
  id: string;
  checklistId: string;
  versionNumber: string; // e.g. "1.0", "2.0"
  effectiveDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  sections: ChecklistSection[];
  scoringConfig: ScoreConfig;
}

export interface ChecklistTemplate {
  id: string;
  facilityTypeId: string;
  formNo: string;
  sopNo: string;
  title: string;
  instruction: string;
  currentVersionId: string;
  versions: ChecklistVersion[];
}

export type ComplianceStatus =
  | 'YES'
  | 'NO'
  | 'MET'
  | 'PARTIALLY_MET'
  | 'UNMET'
  | 'AVAILABLE'
  | 'NOT_AVAILABLE'
  | 'NA';

export interface InspectionAnswer {
  questionId: string;
  answerValue: string;
  complianceStatus: ComplianceStatus;
  score: number;
  remarks?: string;
  evidenceIds?: string[];
}

export interface Evidence {
  id: string;
  inspectionId: string;
  questionId?: string;
  fileName: string;
  fileUrl: string; // base64 or object URL
  fileType: string;
  fileSize: number;
  latitude?: number;
  longitude?: number;
  uploadedBy: string;
  uploadedAt: string;
  caption?: string;
}

export type FindingSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type CorrectiveActionStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'OVERDUE';

export interface Finding {
  id: string;
  inspectionId: string;
  questionId?: string;
  sectionName: string;
  questionText: string;
  findingDescription: string;
  severity: FindingSeverity;
  status: CorrectiveActionStatus;
}

export interface CorrectiveAction {
  id: string;
  findingId: string;
  actionDescription: string;
  responsiblePerson: string;
  dueDate: string;
  status: CorrectiveActionStatus;
  verificationComment?: string;
  closureDate?: string;
  closedBy?: string;
}

export interface Signature {
  id: string;
  inspectionId: string;
  signerName: string;
  signerTitle: string;
  signerType: 'INSPECTOR' | 'FACILITY_HEAD' | 'RESPONSIBLE_OFFICIAL';
  signatureData: string; // base64 canvas data
  signedAt: string;
  stampNote?: string;
}

export type InspectionStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'READY_FOR_REVIEW'
  | 'SIGNED'
  | 'SUBMITTED'
  | 'UNDER_CORRECTION'
  | 'FINALIZED'
  | 'FOLLOW_UP_REQUIRED'
  | 'CLOSED';

export interface ScoreConfig {
  greenThreshold: number; // e.g. 80%
  yellowThreshold: number; // e.g. 60%
  autoCalculate?: boolean;
}

export type ComplianceGrade = 'GREEN' | 'YELLOW' | 'RED';

export interface TracerMedicineItem {
  id: string;
  name: string;
  category?: string;
  isAvailable: boolean;
  batchNumber?: string;
  expiryDate?: string;
  storageConditionOk?: boolean;
  remarks?: string;
}

export interface Inspection {
  id: string;
  inspectionNumber: string;
  facilityId: string;
  facilityTypeId: string;
  checklistId: string;
  checklistVersionId: string;
  checklistVersionNumber: string;
  inspectorId: string;
  inspectorName: string;
  inspectionDate: string;
  startTime?: string;
  endTime?: string;
  status: InspectionStatus;
  answers: Record<string, InspectionAnswer>;
  tracerMedicines?: TracerMedicineItem[];
  obtainedScore: number;
  totalApplicableScore: number;
  scorePercentage: number;
  complianceGrade: 'GREEN' | 'YELLOW' | 'RED';
  strengths?: string;
  gaps?: string;
  actionPlan?: string;
  inspectorComments?: string;
  secretRegulatoryNotes?: string;
  signatures: Signature[];
  findings: Finding[];
  correctiveActions: CorrectiveAction[];
  evidence: Evidence[];
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  gpsConfirmed?: boolean;
  isFollowUp?: boolean;
  originalInspectionId?: string;
  adminUnlockedForCorrection?: boolean;
  correctionReason?: string;
  correctionAuthorizedBy?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}
