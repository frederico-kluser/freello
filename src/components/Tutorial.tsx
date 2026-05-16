import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface TourStep {
  target?: string;
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to Freello',
    body: 'A 60-second tour. Use Next to advance — or leave any time with "Skip tour" or Esc.',
  },
  {
    target: '[data-tour="columns"]',
    title: 'Four columns',
    body: 'Backlog holds ideas. To Do is ready to start. Doing is in progress. Done is finished.',
  },
  {
    target: '[data-tour="add-card-backlog"]',
    title: 'Add a card',
    body: 'Click "+ Add card" in any column. Tap a card to edit its title, description, and Giphy URL.',
  },
  {
    target: '[data-tour="settings"]',
    title: 'Add keys later',
    body: 'Paste an OpenRouter key in Settings to let Freello draft your Kanban from a prompt. Add a Giphy key for GIFs on cards.',
  },
  {
    target: '[data-tour="reset"]',
    title: 'Start over',
    body: 'Reset clears the board and brings the setup wizard back.',
  },
  {
    title: "You're set",
    body: "That's the whole tour. Have fun.",
  },
];

const PAD = 8;
const TOOLTIP_W = 340;
const TOOLTIP_H_APPROX = 200;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Tutorial({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1024,
    h: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    const target = STEPS[step]?.target;
    if (!target) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(target);
    if (!el) {
      if (step < STEPS.length - 1) {
        const t = window.setTimeout(() => setStep((s) => s + 1), 0);
        return () => window.clearTimeout(t);
      }
      setRect(null);
      return;
    }
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const stepData = STEPS[step];
  const total = STEPS.length;
  const isFirst = step === 0;
  const isLast = step === total - 1;

  let tooltipLeft: number;
  let tooltipTop: number;
  if (rect) {
    const spaceBelow = viewport.h - (rect.bottom + PAD);
    const spaceAbove = rect.top - PAD;
    const placeBelow = spaceBelow >= TOOLTIP_H_APPROX + 16 || spaceBelow >= spaceAbove;
    tooltipTop = placeBelow
      ? Math.min(viewport.h - TOOLTIP_H_APPROX - 16, rect.bottom + PAD + 12)
      : Math.max(16, rect.top - PAD - TOOLTIP_H_APPROX - 12);
    tooltipLeft = Math.max(
      16,
      Math.min(viewport.w - TOOLTIP_W - 16, rect.left + rect.width / 2 - TOOLTIP_W / 2),
    );
  } else {
    tooltipLeft = viewport.w / 2 - TOOLTIP_W / 2;
    tooltipTop = viewport.h / 2 - TOOLTIP_H_APPROX / 2;
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <svg
        className="absolute inset-0"
        width={viewport.w}
        height={viewport.h}
        style={{ pointerEvents: 'auto' }}
      >
        <defs>
          <mask id="freello-spotlight">
            <rect x={0} y={0} width={viewport.w} height={viewport.h} fill="white" />
            {rect && (
              <rect
                x={Math.max(0, rect.left - PAD)}
                y={Math.max(0, rect.top - PAD)}
                width={rect.width + PAD * 2}
                height={rect.height + PAD * 2}
                rx={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x={0}
          y={0}
          width={viewport.w}
          height={viewport.h}
          fill="black"
          fillOpacity={0.72}
          mask="url(#freello-spotlight)"
        />
      </svg>

      {rect && (
        <div
          className="absolute pointer-events-none rounded-[10px] ring-2 ring-emerald-400"
          style={{
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}

      <div
        className="absolute bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5 space-y-3"
        style={{
          left: tooltipLeft,
          top: tooltipTop,
          width: TOOLTIP_W,
          pointerEvents: 'auto',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            Step {step + 1} / {total}
          </span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Skip tour
          </button>
        </div>
        <h3 className="text-base font-semibold text-slate-100">{stepData.title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{stepData.body}</p>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={isFirst}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
            className="px-4 py-1.5 text-sm rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium"
          >
            {isLast ? 'Done' : 'Next →'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
