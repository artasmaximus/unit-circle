// Turns dist/index.html into dist/artifact.html for publishing as a claude.ai artifact:
// the artifact host adds its own doctype, <html>, <head> and <body>, so those tags come out.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const head = html
  .match(/<head>([\s\S]*)<\/head>/)[1]
  .replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '');
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
writeFileSync('dist/artifact.html', head.trim() + '\n' + body.trim() + '\n');
console.log(`dist/artifact.html: ${(Buffer.byteLength(head + body) / 1024).toFixed(0)} KB`);
