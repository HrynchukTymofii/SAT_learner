import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetQuiz, saveQuestion, submitQuizAnswers, updateUserPoints } from './api/quiz';

const OFFLINE_QUEUE_KEY = 'offlineQueue';
const MAX_SERVER_ERROR_ATTEMPTS = 5;

type OfflineAction = { id: string; type: string; payload: any; attempts?: number };

// Every read-modify-write of the queue runs through this chain, so an enqueue
// can't overwrite a running process (or another enqueue)
let queueLock: Promise<unknown> = Promise.resolve();
function withQueueLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queueLock.then(fn, fn);
  queueLock = run.catch(() => {});
  return run;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readQueue(): Promise<OfflineAction[]> {
  const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  const queue: OfflineAction[] = queueJson ? JSON.parse(queueJson) : [];

  // Actions queued by older app versions have no id
  if (queue.some((a) => !a.id)) {
    queue.forEach((a) => { if (!a.id) a.id = newId(); });
    await writeQueue(queue);
  }
  return queue;
}

async function writeQueue(queue: OfflineAction[]) {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineAction(action: { type: string; payload: any }) {
  return withQueueLock(async () => {
    const queue = await readQueue();
    queue.push({ ...action, id: newId() });
    await writeQueue(queue);
  });
}

// On logout: the queued actions belong to that user and must not be sent with the next user's token
export function clearOfflineQueue() {
  return withQueueLock(() => AsyncStorage.removeItem(OFFLINE_QUEUE_KEY));
}

async function sendAction(token: string, action: OfflineAction) {
  switch (action.type) {
    case 'updatePoints':
      return updateUserPoints(token, action.payload.points);
    case 'submitQuiz':
      return submitQuizAnswers(token, action.payload.quizId, action.payload.answers, action.payload.method);
    case 'toggleSave':
      return saveQuestion(token, action.payload.questionId);
    case 'resetQuiz':
      return resetQuiz(token, action.payload.quizId);
  }
}

let processing: Promise<void> | null = null;

// A second call while one is running (app start + foreground) waits for the first
// instead of sending everything twice
export function processOfflineQueue(token: string) {
  if (!processing) {
    processing = runQueue(token).finally(() => { processing = null; });
  }
  return processing;
}

async function runQueue(token: string) {
  const queue = await withQueueLock(readQueue);

  // One at a time, in order: toggles and POST/PATCH submits depend on order
  for (const action of queue) {
    let outcome: 'done' | 'offline' | 'serverError' = 'done';
    try {
      await sendAction(token, action);   // 4xx comes back as a failed result → dropped
    } catch (err: any) {
      outcome = err?.response ? 'serverError' : 'offline';
    }

    await withQueueLock(async () => {
      const current = await readQueue();
      let updated: OfflineAction[];
      if (outcome === 'done') {
        updated = current.filter((a) => a.id !== action.id);
      } else if (outcome === 'serverError') {
        updated = current
          .map((a) => (a.id === action.id ? { ...a, attempts: (a.attempts ?? 0) + 1 } : a))
          .filter((a) => (a.attempts ?? 0) < MAX_SERVER_ERROR_ATTEMPTS);
      } else {
        updated = current;
      }
      await writeQueue(updated);
    });

    // Stop at the first failure so later actions don't overtake it
    if (outcome !== 'done') return;
  }
}
