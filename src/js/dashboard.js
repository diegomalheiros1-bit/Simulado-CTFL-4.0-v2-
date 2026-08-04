'use strict';

(function createDashboard() {
 const THEME_KEY = 'ctfl-simulator-theme';
 const quizMeta = {
 oficial: {
 name: 'Prova Oficial',
 accent: 'indigo'
 },
 adicionais: {
 name: 'Questões Adicionais',
 accent: 'emerald'
 },
 k2k3: {
 name: 'Cálculos K2 & K3',
 accent: 'amber'
 }
 };

 const percent = (value) => `${Math.round(value)}%`;

 function readTheme() {
 try {
 const savedTheme = localStorage.getItem(THEME_KEY);
 return savedTheme === 'light' ? 'light' : 'dark';
 } catch (_error) {
 return 'dark';
 }
 }

 function syncThemeControls(theme) {
 document.querySelectorAll('[data-theme-option]').forEach(button => {
 const selected = button.dataset.themeOption === theme;
 button.classList.toggle('selected', selected);
 button.setAttribute('aria-checked', String(selected));
 });
 }

 function applyTheme(theme, persist = true) {
 const nextTheme = theme === 'light' ? 'light' : 'dark';
 document.documentElement.dataset.theme = nextTheme;
 document.documentElement.style.colorScheme = nextTheme;

 if (persist) {
 try {
 localStorage.setItem(THEME_KEY, nextTheme);
 } catch (_error) {
 // A interface continua funcionando quando o armazenamento estiver indisponível.
 }
 }

 syncThemeControls(nextTheme);
 return nextTheme;
 }

 function getAttempts() {
 return window.quizStorage.loadState().attempts;
 }

 function calculateSummary(attempts) {
 if (!attempts.length) {
 return {
 totalAttempts: 0,
 average: null,
 best: null,
 answered: 0,
 approvalRate: null
 };
 }

 const sumScores = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
 const approved = attempts.filter(attempt => attempt.approved).length;

 return {
 totalAttempts: attempts.length,
 average: sumScores / attempts.length,
 best: Math.max(...attempts.map(attempt => attempt.score)),
 answered: attempts.reduce((sum, attempt) => sum + attempt.total, 0),
 approvalRate: (approved / attempts.length) * 100
 };
 }

 function calculateQuizSummary(attempts, quizType) {
 const quizAttempts = attempts.filter(attempt => attempt.quizType === quizType);
 if (!quizAttempts.length) {
 return {
 attempts: 0,
 best: null,
 average: null,
 approved: false
 };
 }

 return {
 attempts: quizAttempts.length,
 best: Math.max(...quizAttempts.map(attempt => attempt.score)),
 average: quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length,
 approved: quizAttempts.some(attempt => attempt.approved)
 };
 }

 function setText(id, value) {
 const element = document.getElementById(id);
 if (element) element.textContent = value;
 }

 function renderHome() {
 const attempts = getAttempts();
 const summary = calculateSummary(attempts);

 setText('stat-total-attempts', summary.totalAttempts);
 setText('stat-average', summary.average === null ? '—' : percent(summary.average));
 setText('stat-best', summary.best === null ? '—' : percent(summary.best));
 setText('stat-answered', summary.answered);

 Object.keys(quizMeta).forEach(quizType => {
 const quizSummary = calculateQuizSummary(attempts, quizType);
 const status = document.getElementById(`quiz-status-${quizType}`);
 const action = document.getElementById(`quiz-action-${quizType}`);

 if (status) {
 status.textContent = quizSummary.attempts === 0
 ? 'Não realizado'
 : quizSummary.approved
 ? 'Aprovado'
 : 'Reprovado';
 status.className = `quiz-status status-${quizSummary.attempts === 0 ? 'empty' : quizSummary.approved ? 'approved' : 'failed'}`;
 }

 setText(`quiz-best-${quizType}`, quizSummary.best === null ? '—' : percent(quizSummary.best));
 setText(`quiz-attempts-${quizType}`, quizSummary.attempts);
 if (action) {
 action.textContent = quizSummary.attempts === 0 ? 'Iniciar simulado' : 'Refazer simulado';
 }
 });
 }

 function formatDate(value) {
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return '—';
 return new Intl.DateTimeFormat('pt-BR', {
 dateStyle: 'short',
 timeStyle: 'short'
 }).format(date);
 }

 function renderHistory() {
 const filter = document.getElementById('history-filter')?.value || 'all';
 const order = document.getElementById('history-order')?.value || 'recent';
 let attempts = getAttempts();

 if (filter !== 'all') {
 attempts = attempts.filter(attempt => attempt.quizType === filter);
 }

 attempts.sort((a, b) => {
 const first = new Date(a.completedAt).getTime();
 const second = new Date(b.completedAt).getTime();
 return order === 'oldest' ? first - second : second - first;
 });

 const body = document.getElementById('history-body');
 const empty = document.getElementById('history-empty');
 const table = document.getElementById('history-table-wrap');
 if (!body || !empty || !table) return;

 if (!attempts.length) {
 body.innerHTML = '';
 empty.classList.remove('hidden');
 table.classList.add('hidden');
 return;
 }

 empty.classList.add('hidden');
 table.classList.remove('hidden');
 body.innerHTML = attempts.map(attempt => `
 <tr class="border-b border-slate-700/60 last:border-0">
 <td class="px-4 py-4 whitespace-nowrap text-slate-400">${formatDate(attempt.completedAt)}</td>
 <td class="px-4 py-4 font-bold text-white">${attempt.quizName}</td>
 <td class="px-4 py-4 font-black text-indigo-300">${attempt.score}%</td>
 <td class="px-4 py-4 text-slate-300">${attempt.correct}</td>
 <td class="px-4 py-4 text-slate-300">${attempt.total}</td>
 <td class="px-4 py-4">
 <span class="quiz-status status-${attempt.approved ? 'approved' : 'failed'}">${attempt.approved ? 'Aprovado' : 'Reprovado'}</span>
 </td>
 </tr>
 `).join('');
 }

 function renderPerformance() {
 const attempts = getAttempts();
 const summary = calculateSummary(attempts);
 setText('performance-average', summary.average === null ? '—' : percent(summary.average));
 setText('performance-best', summary.best === null ? '—' : percent(summary.best));
 setText('performance-approval', summary.approvalRate === null ? '—' : percent(summary.approvalRate));
 setText('performance-total', summary.totalAttempts);

 Object.keys(quizMeta).forEach(quizType => {
 const quizSummary = calculateQuizSummary(attempts, quizType);
 const value = quizSummary.average === null ? 0 : Math.round(quizSummary.average);
 setText(`performance-${quizType}-value`, quizSummary.average === null ? '—' : `${value}%`);
 const bar = document.getElementById(`performance-${quizType}-bar`);
 if (bar) bar.style.width = `${value}%`;
 });
 }

 function setHistoryTab(tab) {
 const historyPanel = document.getElementById('history-panel');
 const performancePanel = document.getElementById('performance-panel');
 const historyTab = document.getElementById('tab-history');
 const performanceTab = document.getElementById('tab-performance');
 const performanceActive = tab === 'performance';

 historyPanel?.classList.toggle('hidden', performanceActive);
 performancePanel?.classList.toggle('hidden', !performanceActive);
 historyTab?.classList.toggle('active', !performanceActive);
 performanceTab?.classList.toggle('active', performanceActive);

 if (performanceActive) renderPerformance();
 else renderHistory();
 }

 function setActiveNavigation(view) {
 document.querySelectorAll('[data-nav]').forEach(button => {
 button.classList.toggle('active', button.dataset.nav === view);
 });
 }

 function showView(view) {
 const home = document.getElementById('menu');
 const history = document.getElementById('history-view');
 const settings = document.getElementById('settings-view');
 const quiz = document.getElementById('quiz');

 home?.classList.add('hidden');
 history?.classList.add('hidden');
 settings?.classList.add('hidden');
 quiz?.classList.add('hidden');

 if (view === 'history' || view === 'performance') {
 history?.classList.remove('hidden');
 setHistoryTab(view === 'performance' ? 'performance' : 'history');
 } else if (view === 'settings') {
 settings?.classList.remove('hidden');
 } else {
 home?.classList.remove('hidden');
 renderHome();
 view = 'home';
 }

 setActiveNavigation(view);
 window.scrollTo({ top: 0, behavior: 'smooth' });
 if (window.lucide) window.lucide.createIcons();
 }

 function confirmClear(message) {
 if (!window.confirm(message)) return;
 window.quizStorage.clearHistory();
 renderHome();
 renderHistory();
 renderPerformance();
 }

 function clearHistory() {
 confirmClear('Deseja realmente limpar todo o histórico de resultados? Esta ação não pode ser desfeita.');
 }

 function setQuizMode(active) {
 document.getElementById('primary-navigation')?.classList.toggle('hidden', active);
 }

 function initialize() {
 applyTheme(readTheme(), false);
 document.querySelectorAll('[data-nav]').forEach(button => {
 button.addEventListener('click', () => showView(button.dataset.nav));
 });
 document.getElementById('tab-history')?.addEventListener('click', () => {
 setHistoryTab('history');
 setActiveNavigation('history');
 });
 document.getElementById('tab-performance')?.addEventListener('click', () => {
 setHistoryTab('performance');
 setActiveNavigation('performance');
 });
 document.getElementById('history-filter')?.addEventListener('change', renderHistory);
 document.getElementById('history-order')?.addEventListener('change', renderHistory);
 document.querySelectorAll('[data-clear-history]').forEach(button => {
 button.addEventListener('click', clearHistory);
 });
 document.querySelectorAll('[data-theme-option]').forEach(button => {
 button.addEventListener('click', () => applyTheme(button.dataset.themeOption));
 });

 renderHome();
 renderHistory();
 renderPerformance();
 setActiveNavigation('home');
 if (window.lucide) window.lucide.createIcons();
 }

 window.quizDashboard = {
 showView,
 renderHome,
 renderHistory,
 renderPerformance,
 clearHistory,
 setQuizMode,
 applyTheme,
 readTheme
 };

 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', initialize);
 } else {
 initialize();
 }
})();
