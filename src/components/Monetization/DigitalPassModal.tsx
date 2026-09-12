import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, Crown, Sparkles, ShieldCheck, Download, Copy, Check, 
  Clock, Maximize2, Minimize2, Share2, Smartphone
} from 'lucide-react';
import { UserProfile } from '../../types/auth';

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenExplorerPass?: () => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenExplorerPass,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Display clock; validity is checked by the server when a host scans the QR.
  useEffect(() => {
    if (!isOpen) return;
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Determine pass tier, expiry, and unique ID
  const passId = user?.explorerPassId || '';

  const isVip = !!user?.hasExplorerPass && !!passId && Date.parse(user.explorerPassUntil || '') > Date.now();

  // Calculate validity period
  let expiryDateString = 'Active (14 Days)';
  const isAnnual = user?.explorerPassPlan === 'annual';
  if (user?.explorerPassUntil) {
    const expiryDate = new Date(user.explorerPassUntil);
    expiryDateString = expiryDate.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  const passWebUrl = import.meta.env.VITE_PUBLIC_APP_URL || 'https://terroir-trail.web.app/';
  const verificationUrl = `${passWebUrl.replace(/\/$/, '')}/?verify_pass=${encodeURIComponent(passId)}`;

  // Generate crisp QR code on mount / user change
  useEffect(() => {
    if (!isOpen || !isVip) { setQrDataUrl(''); return; }
    QRCode.toDataURL(verificationUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating pass QR code:', err));
  }, [isOpen, isVip, verificationUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TerroirTrail VIP Explorer Pass',
          text: `TerroirTrail VIP Pass for ${user?.name || 'Explorer'} (Pass ID: ${passId})`,
          url: verificationUrl,
        });
      } catch (e) {
        console.error('Error sharing pass:', e);
      }
    } else {
      handleCopyLink();
    }
  };

  // Download digital pass image to phone / photos
  const handleDownloadCard = () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 900, 1400);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#0c0a09');
      grad.addColorStop(1, '#1c1917');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, 900, 1400, 48);
      ctx.fill();

      // Gold Border
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(5, 5, 890, 1390, 44);
      ctx.stroke();

      // Header Banner
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.fillText('TERROIR TRAIL', 60, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = '28px sans-serif';
      ctx.fillText(isAnnual ? 'ANNUAL EXPLORER PASS' : '14-DAY HOLIDAY PASS', 60, 145);

      // Passholder Box
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.roundRect(60, 190, 780, 150, 24);
      ctx.fill();

      ctx.fillStyle = '#a8a29e';
      ctx.font = '22px sans-serif';
      ctx.fillText('PASSHOLDER', 90, 235);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText(user?.name || 'Terroir Explorer', 90, 290);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '20px monospace';
      ctx.fillText(`ID: ${passId}  ·  EXPIRES: ${expiryDateString}`, 90, 325);

      // Draw QR Code
      if (qrDataUrl) {
        const img = new Image();
        img.src = qrDataUrl;
        img.onload = () => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(230, 390, 440, 440, 28);
          ctx.fill();
          ctx.drawImage(img, 250, 410, 400, 400);

          // Perks list
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText('EXPLORER PASS PRIVILEGES', 60, 900);

          const perksText = [
            '✓ Server-verified digital pass QR',
            '✓ Account-linked pass entitlement',
            '✓ Cellar door check-in verification',
            '✓ Eligible for pilot partner benefits'
          ];
          ctx.font = '24px sans-serif';
          ctx.fillStyle = '#e7e5e4';
          perksText.forEach((p, i) => {
            ctx.fillText(p, 60, 960 + (i * 55));
          });

          // Security seal
          ctx.fillStyle = '#78716c';
          ctx.font = '20px monospace';
          ctx.fillText('AUTHENTIC CELLAR PASS  ·  HTTPS://TERROIR-TRAIL.WEB.APP', 60, 1260);

          // Trigger download
          const link = document.createElement('a');
          link.download = `TerroirTrail-Explorer-Pass-${user?.name?.replace(/\\s+/g, '_') || 'Explorer'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setIsDownloading(false);
        };
      } else {
        setIsDownloading(false);
      }
    } catch (e) {
      console.error('Error downloading card:', e);
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div 
        className={`relative w-full ${isFullscreen ? 'max-w-xl' : 'max-w-md'} bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[95vh] transition-all duration-300`}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-950/80 via-stone-900 to-stone-950 border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-title text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Digital Explorer Pass</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  {isAnnual ? '365 DAYS' : '14 DAYS'}
                </span>
              </h2>
              <p className="text-[10px] text-stone-400">
                TerroirTrail Digital Explorer Pass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Show Fullscreen to Host'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Pass Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          
          {/* Digital Wallet Pass Card */}
          <div 
            ref={cardRef}
            className="relative rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/60 border-2 border-amber-400/60 shadow-2xl p-5 sm:p-6 overflow-hidden text-left"
          >
            {/* Top Metallic Foil Shine Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />

            {/* Pass Brand & Tier */}
            <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="TerroirTrail" className="w-7 h-7 object-contain drop-shadow" />
                <div>
                  <div className="font-serif-title font-bold text-white text-sm tracking-wide">
                    Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase">
                    {isAnnual ? 'Annual Explorer Pass' : '14-Day Holiday Pass'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>ACTIVE PASS</span>
              </div>
            </div>

            {/* Passholder Details Box */}
            <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-white/10 mb-4 relative z-10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">
                  Passholder
                </span>
                <span className="font-bold text-white text-base block truncate">
                  {user?.name || 'Terroir Explorer'}
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono block">
                  {passId}
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">
                  Valid Until
                </span>
                <span className="font-bold text-amber-300 text-xs block">
                  {expiryDateString}
                </span>
                <span className="text-[9px] text-stone-400 block">
                  Where available during partner pilots
                </span>
              </div>
            </div>

            {/* Center: High-Resolution Scannable QR Code */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-stone-950 my-3 relative z-10 shadow-lg max-w-[240px] mx-auto">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Pass QR Code" 
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-stone-400 text-xs font-mono">
                  Generating Pass QR...
                </div>
              )}
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-600 mt-1">
                Scan to Verify Pass
              </span>
            </div>

            {/* Live Timestamp & Verification indicator */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400 relative z-10">
              <div className="flex items-center gap-1 text-emerald-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>TIME: {currentTime || 'ACTIVE'}</span>
              </div>
              <div className="flex items-center gap-1 text-stone-400">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Server-Verified Pass</span>
              </div>
            </div>

          </div>

          {/* Included Privileges Box */}
          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-white/10 space-y-2 text-left">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Passholder Capabilities & Pilot Benefits</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-xl bg-stone-850/80 border border-white/5 flex items-start gap-2">
                <span className="text-sm">🎫</span>
                <div>
                  <strong className="text-white block">Digital Pass Entitlement</strong>
                  <span className="text-stone-400 text-[10px]">{isAnnual ? '365-day annual pass' : '14-day holiday pass'}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-stone-850/80 border border-white/5 flex items-start gap-2">
                <span className="text-sm">🛡️</span>
                <div>
                  <strong className="text-white block">Server-Verified QR</strong>
                  <span className="text-stone-400 text-[10px]">Secure check-in at cellar doors</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-stone-850/80 border border-white/5 flex items-start gap-2">
                <span className="text-sm">📱</span>
                <div>
                  <strong className="text-white block">Cross-Device Sync</strong>
                  <span className="text-stone-400 text-[10px]">Linked to your verified account</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-stone-850/80 border border-white/5 flex items-start gap-2">
                <span className="text-sm">🍇</span>
                <div>
                  <strong className="text-white block">Pilot Partner Benefits</strong>
                  <span className="text-stone-400 text-[10px]">Where available during partner pilots</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Save to phone, Share, Copy Link) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{isDownloading ? 'Saving...' : 'Save to Photos'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Pass</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Access Tip */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-300 text-[10px] flex items-center gap-2 text-left">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Quick Access:</strong> Tap <em>Save to Photos</em> or add this page to your phone&apos;s Home Screen via your browser menu for quick access when visiting estates.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-900/90 border-t border-white/10 flex items-center justify-between text-xs shrink-0">
          <span className="text-stone-400 text-[10px]">
            Show this pass where available during partner pilots
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
