import type { Board, Settings } from '../types';

const BOARD_KEY = 'freello.board.v1';
const SETTINGS_KEY = 'freello.settings.v1';

export function loadBoard(): Board | null {
  try {
    const raw = localStorage.getItem(BOARD_KEY);
    return raw ? (JSON.parse(raw) as Board) : null;
  } catch {
    return null;
  }
}

export function saveBoard(board: Board): void {
  localStorage.setItem(BOARD_KEY, JSON.stringify(board));
}

export function clearBoard(): void {
  localStorage.removeItem(BOARD_KEY);
}

export function loadSettings(): Settings {
  const defaults = defaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function defaultSettings(): Settings {
  const env = import.meta.env;
  return {
    openRouterKey: env.VITE_OPENROUTER_KEY ?? '',
    openRouterModel: env.VITE_OPENROUTER_MODEL ?? 'openai/gpt-4o-mini',
    giphyKey: env.VITE_GIPHY_KEY ?? '',
  };
}
