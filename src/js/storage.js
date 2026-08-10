'use strict';

(function createQuizStorage() {
 const STORAGE_KEY = 'ctfl-simulator-progress';
 const EXAM_B_STORAGE_KEY = 'ctfl_exame_b';
 const CURRENT_VERSION = 1;
 const MAX_ATTEMPTS = 50;

 function emptyState() {
 return {
 version: CURRENT_VERSION,
 attempts: []
 };
 }

 function isValidAttempt(attempt) {
 return attempt
 && typeof attempt === 'object'
 && typeof attempt.id === 'string'
 && typeof attempt.quizType === 'string'
 && typeof attempt.quizName === 'string'
 && Number.isFinite(attempt.score)
 && Number.isFinite(attempt.correct)
 && Number.isFinite(attempt.total)
 && typeof attempt.approved === 'boolean'
 && typeof attempt.completedAt === 'string';
 }

 function loadStateFromKey(key) {
 try {
 const raw = localStorage.getItem(key);
 if (!raw) return emptyState();

 const parsed = JSON.parse(raw);
 if (!parsed || parsed.version !== CURRENT_VERSION || !Array.isArray(parsed.attempts)) {
 return emptyState();
 }

 return {
 version: CURRENT_VERSION,
 attempts: parsed.attempts.filter(isValidAttempt).slice(0, MAX_ATTEMPTS)
 };
 } catch (_error) {
 return emptyState();
 }
 }

 function loadState() {
 const currentState = loadStateFromKey(STORAGE_KEY);
 const examBState = loadStateFromKey(EXAM_B_STORAGE_KEY);
 return {
 version: CURRENT_VERSION,
 attempts: [...currentState.attempts, ...examBState.attempts]
 .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
 };
 }

 function writeState(key, state) {
 try {
 localStorage.setItem(key, JSON.stringify(state));
 return true;
 } catch (_error) {
 return false;
 }
 }

 function createId() {
 if (window.crypto && typeof window.crypto.randomUUID === 'function') {
 return window.crypto.randomUUID();
 }
 return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
 }

 function saveAttempt(attempt) {
 const quizType = String(attempt.quizType);
 const storageKey = quizType === 'exameB' ? EXAM_B_STORAGE_KEY : STORAGE_KEY;
 const state = loadStateFromKey(storageKey);
 const record = {
 id: createId(),
 quizType,
 quizName: String(attempt.quizName),
 score: Number(attempt.score),
 correct: Number(attempt.correct),
 total: Number(attempt.total),
 approved: Boolean(attempt.approved),
 completedAt: attempt.completedAt || new Date().toISOString()
 };

 if (Number.isFinite(attempt.duration)) {
 record.duration = Math.max(0, Math.round(attempt.duration));
 }

 state.attempts = [record, ...state.attempts].slice(0, MAX_ATTEMPTS);
 writeState(storageKey, state);
 return record;
 }

 function clearHistory() {
 const currentCleared = writeState(STORAGE_KEY, emptyState());
 const examBCleared = writeState(EXAM_B_STORAGE_KEY, emptyState());
 return currentCleared && examBCleared;
 }

 window.quizStorage = {
 key: STORAGE_KEY,
 examBKey: EXAM_B_STORAGE_KEY,
 version: CURRENT_VERSION,
 maxAttempts: MAX_ATTEMPTS,
 loadState,
 saveAttempt,
 clearHistory
 };
})();
