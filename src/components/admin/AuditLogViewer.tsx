import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Filter, ShieldAlert, FileText, UserCheck, Calendar } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const actionTypes = Array.from(new Set(auditLogs.map((l) => l.action)));

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-700" />
            Statutory Regulatory Audit Trail & Activity Logs
          </h2>
          <p className="text-xs text-slate-500">
            Immutable chronicle of all inspections submitted, administrative unlocks, corrective action verifications, and user role switches
          </p>
        </div>

        <div className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
          Total Recorded Events: {auditLogs.length}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, user, entity ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Event Types</option>
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Details & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log) => {
                const isAdminUnlock = log.action.includes('ADMIN_CONTROLLED') || log.action.includes('UNLOCK');
                const isSubmit = log.action.includes('SUBMITTED');

                return (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isAdminUnlock ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <span className="text-[10px] text-slate-500 font-medium">{log.userRole}</span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isAdminUnlock
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : isSubmit
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap font-mono text-slate-600">
                      {log.entity}
                    </td>

                    <td className="p-3.5 text-slate-700 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No activity records matching criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
