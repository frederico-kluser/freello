import type { ColumnId } from '../types';

export interface GeneratedTask {
  title: string;
  description: string;
  column: ColumnId;
  giphyQuery: string;
}

const COLUMNS: ColumnId[] = ['backlog', 'todo', 'doing', 'done'];

const SYSTEM_PROMPT =
  "You are a productivity assistant that turns a user's stated objective into an actionable Kanban board. " +
  'You ALWAYS reply with a single JSON object and never any prose, code fences, or commentary.';

export async function generateKanbanTasks(opts: {
  apiKey: string;
  model: string;
  objective: string;
  context: string;
}): Promise<GeneratedTask[]> {
  if (!opts.apiKey) {
    throw new Error('Missing OpenRouter API key. Open Settings to add one.');
  }

  const userPrompt = `Draft a Kanban board for the following goal. Generate 6–10 tasks distributed across the columns:
- "backlog": broader / longer-horizon work (about half of the tasks)
- "todo": concrete next steps the user can pick up now (about a third)
- "doing": at most 1 task that looks like a natural starting point
- "done": 0 tasks (the user is just starting)

For each task, also provide a 1–3 word "giphyQuery" that captures the *vibe* of the task (used to fetch a fun GIF from Giphy — keep it safe-for-work and visual, e.g. "coffee typing", "rocket launch", "team huddle").

USER OBJECTIVE:
${opts.objective}

ADDITIONAL CONTEXT:
${opts.context.trim() ? opts.context : '(none provided)'}

Respond with JSON in exactly this shape (and nothing else):
{
  "tasks": [
    {
      "title": "Short, actionable title (under 60 chars)",
      "description": "1–2 sentence explanation of the task",
      "column": "backlog" | "todo" | "doing" | "done",
      "giphyQuery": "1–3 word search term"
    }
  ]
}`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
      'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'https://freello.local',
      'X-Title': 'Freello',
    },
    body: JSON.stringify({
      model: opts.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter responded ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '{}';

  const parsed = safeParseJson(content);
  const rawTasks: unknown[] = Array.isArray(parsed?.tasks) ? parsed.tasks : [];

  return rawTasks
    .map((t) => normalizeTask(t))
    .filter((t): t is GeneratedTask => t !== null);
}

function safeParseJson(text: string): { tasks?: unknown } {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}

function normalizeTask(raw: unknown): GeneratedTask | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, unknown>;
  const title = typeof t.title === 'string' ? t.title.trim() : '';
  if (!title) return null;
  const column = COLUMNS.includes(t.column as ColumnId) ? (t.column as ColumnId) : 'backlog';
  return {
    title: title.slice(0, 120),
    description: typeof t.description === 'string' ? t.description.trim() : '',
    column,
    giphyQuery:
      typeof t.giphyQuery === 'string' && t.giphyQuery.trim()
        ? t.giphyQuery.trim().slice(0, 80)
        : title.slice(0, 40),
  };
}
