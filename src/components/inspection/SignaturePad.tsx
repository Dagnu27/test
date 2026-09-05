import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  onSave: (signatureData: string) => void;
  initialSignature?: string;
  signerName: string;
  signerTitle: string;
  onNameChange?: (name: string) => void;
  onTitleChange?: (title: string) => void;
  isReadOnly?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  onSave,
  initialSignature,
  signerName,
  signerTitle,
  onNameChange,
  onTitleChange,
  isReadOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialSignature));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 400;
    canvas.height = 140;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialSignature) {
      const img = new Image();
      img.src = initialSignature;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [initialSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || isReadOnly) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSave('');
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-emerald-600" />
          {label}
        </label>
        {!isReadOnly && hasDrawn && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded bg-white border border-rose-200 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Full Name</label>
          <input
            type="text"
            value={signerName}
            disabled={isReadOnly}
            onChange={(e) => onNameChange && onNameChange(e.target.value)}
            placeholder="Enter signer's name"
            className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Title / Designation</label>
          <input
            type="text"
            value={signerTitle}
            disabled={isReadOnly}
            onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
            placeholder="e.g. Lead Regulatory Inspector / Pharmacy Head"
            className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
          />
        </div>
      </div>

      <div className="relative border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-32 touch-none block ${isReadOnly ? 'cursor-not-allowed bg-slate-50' : 'cursor-crosshair'}`}
        />
        {!hasDrawn && !isReadOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 font-medium">
            Sign here using mouse, finger, or stylus
          </div>
        )}
        <div className="absolute bottom-1 right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
          SECURE DIGITAL SIGNATURE
        </div>
      </div>
    </div>
  );
};
