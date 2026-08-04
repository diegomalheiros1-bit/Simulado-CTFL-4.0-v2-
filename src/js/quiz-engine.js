'use strict';

// Regras de negocio do simulado (sem manipulacao de DOM).
window.quizEngine = {
 isMultiMode(corr) {
 return Array.isArray(corr);
 },

 hasCompleteSelection(selected, corr) {
 if (!Array.isArray(corr)) return selected !== null && selected !== undefined;
 return Array.isArray(selected) && selected.length === corr.length;
 },

 evaluateSelection(selected, corr) {
 if (!Array.isArray(corr)) {
 return {
 allCorrect: selected === corr,
 correctSet: new Set([corr]),
 selectedSet: new Set([selected]),
 };
 }

 const selectedSet = new Set(Array.isArray(selected) ? selected : []);
 const corrSet = new Set(corr);
 const allCorrect =
 selectedSet.size === corrSet.size &&
 [...selectedSet].every((value) => corrSet.has(value));

 return { allCorrect, correctSet: corrSet, selectedSet };
 },

 isCorrectAttempt(attempt) {
 if (!attempt) return false;
 const { corr, sel } = attempt;

 if (!Array.isArray(corr)) return sel === corr;
 if (!Array.isArray(sel) || sel.length !== corr.length) return false;

 const selectedSet = new Set(sel);
 const corrSet = new Set(corr);
 if (selectedSet.size !== corrSet.size) return false;
 return [...selectedSet].every((value) => corrSet.has(value));
 },

 getUnansweredCount(totalQuestions, attempts) {
 const answeredCount = (attempts || []).filter(Boolean).length;
 return Math.max(0, Number(totalQuestions || 0) - answeredCount);
 },
};
