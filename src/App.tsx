import { useEffect, useState } from 'react';
import type { Board, Settings } from './types';
import {
  clearBoard,
  loadBoard,
  loadSettings,
  saveBoard,
  saveSettings,
} from './lib/storage';
import { SetupWizard } from './components/SetupWizard';
import { KanbanBoard } from './components/KanbanBoard';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [board, setBoard] = useState<Board | null>(() => loadBoard());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (board) saveBoard(board);
  }, [board]);

  function updateSettings(next: Settings) {
    setSettings(next);
    saveSettings(next);
  }

  function resetBoard() {
    if (!confirm('Reset your Kanban and start over? This cannot be undone.')) return;
    clearBoard();
    setBoard(null);
  }

  return (
    <div className="h-full">
      {!board ? (
        <SetupWizard
          initialSettings={settings}
          onSettingsChange={updateSettings}
          onComplete={(b) => {
            saveBoard(b);
            setBoard(b);
          }}
        />
      ) : (
        <KanbanBoard
          board={board}
          settings={settings}
          onChange={setBoard}
          onOpenSettings={() => setShowSettings(true)}
          onReset={resetBoard}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
