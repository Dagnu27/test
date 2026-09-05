import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Lock, Unlock, AlertTriangle, X } from 'lucide-react';
import { Inspection } from '../../types';

interface AdminCorrectionModalProps {
  inspection: Inspection;
  onClose: () => void;
  onUnlocked: () => void;
}

export const AdminCorrectionModal: React.FC<AdminCorrectionModalProps> = ({
  inspection,
  onClose,
  onUnlocked,
}) => {
  const { unlockForCorrection, currentUser } = useApp();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A mandatory formal regulatory justification must be entered.');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Please provide a descriptive reason (minimum 10 characters).');
      return;
    }

    const success = unlockForCorrection(inspection.id, reason.trim());
    if (success) {
      onUnlocked();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-amber-500 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-100" />
            <div>
              <h3 className="font-bold text-base">Controlled Administrative Unlock</h3>
              <p className="text-xs text-amber-100 font-medium">
                Authorization for Submitted Record Revision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-100 hover:text-white hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Regulatory Protocol Notice</span>
              Inspection <strong className="font-mono">{inspection.inspectionNumber}</strong> is currently finalized and legally protected. Under Section 2.1 & 26 of the regulatory manual, Regulatory Inspectors cannot modify finalized records. Unlocking transitions this inspection to{' '}
              <strong>UNDER_CORRECTION</strong> and logs your credentials in the official audit trail.
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Authorized Administrator
            </label>
            <div className="text-sm font-medium text-slate-900 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
              {currentUser.fullName} ({currentUser.professionalTitle})
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Reason for Correction <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={3}
              placeholder="Document the legal or factual justification (e.g. 'Erroneous license expiry date verified against regional gazette archive')..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Authorize & Unlock Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
