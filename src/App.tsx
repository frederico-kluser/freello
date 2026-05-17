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

function createEmptyBoard(): Board {
  return {
    cards: {},
    columns: { backlog: [], todo: [], doing: [], done: [] },
    meta: { objective: '', context: '', createdAt: Date.now() },
  };
}

export default function App() {
  const [board, setBoard] = useState<Board | null>(() => loadBoard());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

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
    setTutorialOpen(false);
  }

  function startEmpty(withTour: boolean) {
    const b = createEmptyBoard();
    saveBoard(b);
    setBoard(b);
    setTutorialOpen(withTour);
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
          onSkip={() => startEmpty(false)}
          onSkipAndTour={() => startEmpty(true)}
        />
      ) : (
        <KanbanBoard
          board={board}
          settings={settings}
          onChange={setBoard}
          onOpenSettings={() => setShowSettings(true)}
          onReset={resetBoard}
          tutorialOpen={tutorialOpen}
          onOpenTutorial={() => setTutorialOpen(true)}
          onCloseTutorial={() => setTutorialOpen(false)}
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
