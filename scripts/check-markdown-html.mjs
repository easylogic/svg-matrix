#!/usr/bin/env node
/**
 * VuePress compiles lesson markdown as Vue SFC. Unescaped tags like <circle>
 * break the build. This script flags likely-problematic lines outside fences.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const guideDir = join(process.cwd(), "packages/site/docs/guide");
const problems = [];

for (const file of readdirSync(guideDir).filter((name) => name.endsWith(".md"))) {
  const lines = readFileSync(join(guideDir, file), "utf8").split("\n");
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence || line.includes("<LessonDemo")) continue;
    if (/<[A-Za-z][^>]*>/.test(line) && !line.includes("`")) {
      problems.push(`${file}:${i + 1}: ${line.trim()}`);
    }
  }
}

if (problems.length) {
  console.error("Markdown lines with raw HTML-like tags (wrap in backticks or code fences):\n");
  problems.forEach((p) => console.error(p));
  process.exit(1);
}

console.log("check-markdown-html: OK");
