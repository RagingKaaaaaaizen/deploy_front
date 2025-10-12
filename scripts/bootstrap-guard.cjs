#!/usr/bin/env node
/* Simple guard: warn on new Bootstrap-like classes added in staged diffs. */
const { execSync } = require('child_process');
try {
  const diff = execSync('git diff --cached -U0', { encoding: 'utf8' });
  const regex = /\b(btn|badge|card|table|row|col-(sm|md|lg|xl)?-\d{1,2})\b/;
  const lines = diff.split('\n').filter(l => l.startsWith('+'));
  const offenders = lines.filter(l => regex.test(l));
  if (offenders.length) {
    console.warn('\n[bootstrap-guard] Potential Bootstrap classes detected in staged changes:');
    offenders.slice(0, 20).forEach(l => console.warn(' ', l.slice(0, 200)));
    console.warn('\nConsider using Tailwind utilities or the tw-bridge equivalents.');
  }
  process.exit(0);
} catch (e) {
  console.warn('[bootstrap-guard] Failed to analyze diff:', e.message);
  process.exit(0);
}


