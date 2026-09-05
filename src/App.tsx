import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { InspectorDashboard } from './components/dashboard/InspectorDashboard';
import { FacilityDirectory } from './components/facilities/FacilityDirectory';
import { InspectionsList } from './components/inspection/InspectionsList';
import { InspectionWizard } from './components/inspection/InspectionWizard';
import { InspectionReportView } from './components/reports/InspectionReportView';
import { ChecklistManager } from './components/admin/ChecklistManager';
import { AuditLogViewer } from './components/admin/AuditLogViewer';

const AppContent: React.FC = () => {
  const { activeView, currentUser } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      <Header />

      <main className="flex-1 pb-16">
        {activeView === 'dashboard' && (
          currentUser.role === 'ADMIN' ? <AdminDashboard /> : <InspectorDashboard />
        )}

        {activeView === 'facilities' && <FacilityDirectory />}

        {activeView === 'inspections_list' && <InspectionsList />}

        {activeView === 'new_inspection' && <InspectionWizard />}

        {activeView === 'view_report' && <InspectionReportView />}

        {activeView === 'checklist_config' && <ChecklistManager />}

        {activeView === 'audit_logs' && <AuditLogViewer />}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-indigo-950 text-indigo-300 text-xs py-6 border-t border-indigo-900 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-white font-semibold">
              Digital Health Regulatory Inspection System (DHRIS)
            </p>
            <p className="text-indigo-300 text-[11px]">
              Standardized inspection compliance according to EFDA Directive &amp; Regional Health Bureau Standards
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-indigo-300">
            <span className="font-mono bg-indigo-900/80 px-2 py-0.5 rounded border border-indigo-800">FORM No.: 002 (Rev 04)</span>
            <span>•</span>
            <span className="font-mono">SOP No. ETH-PH-AUD-24</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">System Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
