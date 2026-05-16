import { useState } from 'react';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Settings>(settings);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Settings</h2>

        <Field
          label="OpenRouter API key"
          type="password"
          value={draft.openRouterKey}
          onChange={(v) => setDraft({ ...draft, openRouterKey: v })}
        />
        <Field
          label="OpenRouter model"
          value={draft.openRouterModel}
          onChange={(v) => setDraft({ ...draft, openRouterModel: v })}
        />
        <Field
          label="Giphy API key"
          type="password"
          value={draft.giphyKey}
          onChange={(v) => setDraft({ ...draft, giphyKey: v })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-300 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:border-slate-500 font-mono"
        autoComplete="off"
        spellCheck={false}
      />
    </label>
  );
}
