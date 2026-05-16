import { useMemo, useState } from 'react';
import type { Board, ColumnId, Settings } from '../types';
import { generateKanbanTasks } from '../lib/openrouter';
import { searchGiphyUrl } from '../lib/giphy';

type Step = 'keys' | 'objective' | 'context' | 'generating';

interface Props {
  initialSettings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onComplete: (board: Board) => void;
}

export function SetupWizard({ initialSettings, onSettingsChange, onComplete }: Props) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [step, setStep] = useState<Step>(initialSettings.openRouterKey ? 'objective' : 'keys');
  const [objective, setObjective] = useState('');
  const [context, setContext] = useState('');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const visibleSteps = useMemo<Step[]>(() => ['keys', 'objective', 'context'], []);

  function updateSettings(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    onSettingsChange(next);
  }

  async function generate(finalContext: string) {
    setStep('generating');
    setError(null);
    try {
      setProgress('Asking the AI to draft your Kanban…');
      const tasks = await generateKanbanTasks({
        apiKey: settings.openRouterKey,
        model: settings.openRouterModel,
        objective,
        context: finalContext,
      });

      if (tasks.length === 0) {
        throw new Error('The model returned no tasks. Try rephrasing your objective.');
      }

      setProgress(
        settings.giphyKey
          ? `Got ${tasks.length} tasks. Looking up GIFs on Giphy…`
          : `Got ${tasks.length} tasks. (Add a Giphy key in Settings to attach GIFs.)`,
      );

      const enriched = await Promise.all(
        tasks.map(async (t) => ({
          ...t,
          gifUrl: settings.giphyKey
            ? await searchGiphyUrl({ apiKey: settings.giphyKey, query: t.giphyQuery })
            : undefined,
        })),
      );

      const board: Board = {
        cards: {},
        columns: { backlog: [], todo: [], doing: [], done: [] },
        meta: { objective, context: finalContext, createdAt: Date.now() },
      };

      for (const t of enriched) {
        const id = uid();
        board.cards[id] = {
          id,
          title: t.title,
          description: t.description,
          giphyQuery: t.giphyQuery,
          gifUrl: t.gifUrl,
          createdAt: Date.now(),
        };
        const col: ColumnId = t.column;
        board.columns[col].push(id);
      }

      onComplete(board);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep('objective');
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-800">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-emerald-400">Free</span>llo
            </h1>
            <span className="text-xs text-slate-500">your Kanban, drafted by AI</span>
          </div>
          <div className="flex gap-1.5">
            {visibleSteps.map((s) => (
              <div
                key={s}
                className={`h-1.5 w-7 rounded-full transition ${
                  step === s
                    ? 'bg-emerald-400'
                    : visibleSteps.indexOf(s) < visibleSteps.indexOf(step as Step)
                      ? 'bg-emerald-700'
                      : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-7">
          {step === 'keys' && (
            <KeysStep
              settings={settings}
              onChange={updateSettings}
              onNext={() => setStep('objective')}
            />
          )}

          {step === 'objective' && (
            <ObjectiveStep
              value={objective}
              onChange={setObjective}
              onBack={() => setStep('keys')}
              onNext={() => setStep('context')}
              error={error}
            />
          )}

          {step === 'context' && (
            <ContextStep
              value={context}
              onChange={setContext}
              onBack={() => setStep('objective')}
              onSkip={() => generate('')}
              onGenerate={() => generate(context)}
            />
          )}

          {step === 'generating' && <GeneratingStep message={progress} />}
        </div>
      </div>
    </div>
  );
}

function KeysStep({
  settings,
  onChange,
  onNext,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Connect your APIs</h2>
        <p className="text-sm text-slate-400 mt-1">
          Freello uses <strong>OpenRouter</strong> to draft your Kanban and{' '}
          <strong>Giphy</strong> to embed fun GIFs on each card. Keys are stored locally in your
          browser only.
        </p>
      </header>

      <Field
        label="OpenRouter API key"
        hint={
          <>
            Get one at{' '}
            <a
              className="underline hover:text-slate-300"
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
            >
              openrouter.ai/keys
            </a>
          </>
        }
        type="password"
        value={settings.openRouterKey}
        onChange={(v) => onChange({ openRouterKey: v })}
        placeholder="sk-or-..."
      />

      <Field
        label="Model"
        hint="Any OpenRouter model id (e.g. openai/gpt-4o-mini, anthropic/claude-3.5-haiku)"
        value={settings.openRouterModel}
        onChange={(v) => onChange({ openRouterModel: v })}
        placeholder="openai/gpt-4o-mini"
      />

      <Field
        label="Giphy API key (optional)"
        hint={
          <>
            Skip if you don't want GIFs. Get one at{' '}
            <a
              className="underline hover:text-slate-300"
              href="https://developers.giphy.com"
              target="_blank"
              rel="noreferrer"
            >
              developers.giphy.com
            </a>
          </>
        }
        type="password"
        value={settings.giphyKey}
        onChange={(v) => onChange({ giphyKey: v })}
        placeholder="GIPHY_API_KEY"
      />

      <div className="flex justify-end pt-2">
        <button
          disabled={!settings.openRouterKey}
          onClick={onNext}
          className="px-4 py-2 text-sm rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 font-medium"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function ObjectiveStep({
  value,
  onChange,
  onBack,
  onNext,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">What's your goal?</h2>
        <p className="text-sm text-slate-400 mt-1">
          Describe what you want to accomplish. Be as specific as you like — your Kanban will
          reflect it.
        </p>
      </header>

      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="e.g., Launch a personal portfolio website by the end of the month, focused on showcasing my design work."
        className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm outline-none focus:border-slate-500 resize-none"
      />

      {error && (
        <p className="text-sm text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-md p-3">
          {error}
        </p>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
        >
          ← API keys
        </button>
        <button
          disabled={!value.trim()}
          onClick={onNext}
          className="px-4 py-2 text-sm rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function ContextStep({
  value,
  onChange,
  onBack,
  onSkip,
  onGenerate,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">
          Anything else to remember? <span className="text-xs font-normal text-slate-500">(optional)</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Add deadlines, constraints, preferences, resources — anything that should shape the plan.
          You can skip this.
        </p>
      </header>

      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="e.g., I have weekends free, budget is $200, prefer Next.js + Tailwind, can't ship before next Friday."
        className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm outline-none focus:border-slate-500 resize-none"
      />

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            Skip
          </button>
          <button
            onClick={onGenerate}
            className="px-4 py-2 text-sm rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium"
          >
            Generate Kanban
          </button>
        </div>
      </div>
    </div>
  );
}

function GeneratingStep({ message }: { message: string }) {
  return (
    <div className="text-center py-10 space-y-4">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-slate-700 border-t-emerald-400" />
      <p className="text-sm text-slate-300">{message || 'Working…'}</p>
      <p className="text-xs text-slate-500">This usually takes 10–20 seconds.</p>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  hint?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-300 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:border-slate-500 font-mono"
        autoComplete="off"
        spellCheck={false}
      />
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </label>
  );
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
