import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, SwitchCamera, AlertCircle, Sparkles, Check, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { VerifiedPassInfo } from '../Monetization/HostVerificationModal';
import { verifyExplorerPass } from '../../services/explorerPass';

interface HostQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassVerified: (info: VerifiedPassInfo) => void;
}

export const HostQrScannerModal: React.FC<HostQrScannerModalProps> = ({
  isOpen,
  onClose,
  onPassVerified,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [manualCode, setManualCode] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const verifyingRef = useRef(false);
  const openRef = useRef(isOpen);
  openRef.current = isOpen;
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const readerElementId = 'terroir-qr-reader-viewport';

  const parseAndVerify = async (rawText: string) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setIsVerifying(true);
    setVerificationError(null);
    try {
      const info = await verifyExplorerPass(rawText);
      if (!openRef.current) return;
      navigator.vibrate?.([40, 60, 40]);
      onPassVerified(info);
      onClose();
    } catch (e) {
      if (openRef.current) setVerificationError(e instanceof Error ? e.message : 'Unable to verify this pass.');
    } finally {
      verifyingRef.current = false;
      if (openRef.current) setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsStarting(true);
    setCameraError(null);

    const startScanner = async () => {
      try {
        // Stop any previous scanner instance
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
          } catch (e) {
            // Ignore stop errors during restart
          }
        }

        const html5QrCode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isMounted) return;
            // Stop scanner and trigger verification
            html5QrCode.stop().catch(console.error).finally(() => {
              parseAndVerify(decodedText);
            });
          },
          () => {
            // Frame scan without detection; quiet
          }
        );

        if (isMounted) {
          setIsStarting(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setIsStarting(false);
        console.warn('Camera scanner initialization failed:', err);
        if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
          setCameraError('Camera permission was denied. Please allow camera access in your browser settings, or enter the Pass ID manually below.');
        } else if (err?.name === 'NotFoundError' || err?.message?.includes('devices not found')) {
          setCameraError('No camera found on this device. You can verify passes by typing the Pass ID manually below.');
        } else {
          setCameraError('Unable to access device camera. Please type the Pass ID or verification link manually below.');
        }
      }
    };

    // Small delay to ensure the container element is rendered in DOM
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, [isOpen, facingMode]);

  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    parseAndVerify(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-stone-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-white text-sm">
                Scan Guest VIP Pass
              </h3>
              <p className="text-[11px] text-stone-400">
                Point camera at explorer's digital pass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleCamera}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer border border-white/5"
              title="Switch between front and rear camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer border border-white/5"
              aria-label="Close scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-black flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
          {/* HTML5 QR Code Mount Element */}
          <div 
            id={readerElementId} 
            className="w-full h-[290px] object-cover flex items-center justify-center overflow-hidden" 
          />

          {/* Glowing Animated Viewfinder Frame overlay (when camera active and no error) */}
          {!cameraError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-56 h-56 rounded-2xl border-2 border-dashed border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.25)] flex items-center justify-center">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />
                
                {/* Scanning Laser Animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#fbbf24] animate-pulse" />
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isStarting && !cameraError && (
            <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center gap-3 p-4 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <p className="text-xs text-stone-300 font-medium">Starting cellar door camera...</p>
            </div>
          )}

          {/* Camera Error / Fallback View */}
          {cameraError && (
            <div className="absolute inset-0 bg-stone-950 p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-stone-300 max-w-xs leading-relaxed">
                {cameraError}
              </p>
            </div>
          )}
        </div>

        {/* Manual Code Entry & Tips */}
        <div className="p-4 bg-stone-900/90 border-t border-white/10 space-y-3">
          {verificationError && <p role="alert" className="text-xs text-rose-300">{verificationError}</p>}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter pass ID or verification link"
              className="flex-1 bg-stone-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition"
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || isVerifying}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>{isVerifying ? 'Checking…' : 'Verify'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-time on-device verification</span>
            </span>
            <span className="text-stone-500 font-mono">0% Commission Host Tool</span>
          </div>
        </div>

      </div>
    </div>
  );
};
