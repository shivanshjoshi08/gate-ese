/**
 * Ensure every row in data/questions.json has `numerical: true|false`
 * and numerical MCQs use type `mcq` (not NAT range input).
 *
 * Usage: node scripts/patchQuestionsJsonNumerical.js
 */
const { apply } = require("./classifyNumericalMcq.js");
apply();
