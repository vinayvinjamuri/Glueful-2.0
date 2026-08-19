const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const index = read('index.html');
const adobe = read('glueful-resume-studio-adobe.js');
const bridge = read('glueful-resume-studio-supabase-bridge.js');
const sw = read('sw.js');
const diagnostics = fs.existsSync(path.join(root, 'glueful-resume-render-diagnostics.js'))
  ? read('glueful-resume-render-diagnostics.js')
  : '';

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

function checkSyntax(file) {
  execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'inherit' });
}

console.log('GLUEFUL Resume Studio regression suite');

const bridgeMarker = '<script src="./glueful-resume-studio-supabase-bridge.js?v=20260819-1"></script>';
const adobeMarker = '<script src="./glueful-resume-studio-adobe.js?v=20260819-1"></script>';
const diagnosticsMarker = '<script src="./glueful-resume-render-diagnostics.js?v=20260819-1"></script>';
const bridgePos = index.indexOf(bridgeMarker);
const adobePos = index.indexOf(adobeMarker);
const diagnosticsPos = index.indexOf(diagnosticsMarker);

assert(bridgePos >= 0, 'index loads the Supabase bridge');
assert(adobePos > bridgePos, 'Supabase bridge loads before authoritative Adobe controller');
assert(diagnosticsPos > adobePos, 'diagnostics loads after authoritative controller');
assert((index.match(/glueful-resume-studio-adobe\.js\?v=/g) || []).length === 1, 'index has exactly one authoritative Adobe controller script');
assert(adobe.includes('function getSupabaseClient()'), 'controller resolves Supabase through a dedicated resolver');
assert(adobe.includes('window.gluefulResumeSupabaseClient?.auth'), 'controller supports bridged Supabase client');
assert(adobe.includes("typeof supabaseClient !== 'undefined'"), 'controller supports lexical top-level supabaseClient');
assert(adobe.includes('window.supabaseClient?.auth'), 'controller retains window compatibility');
assert(!adobe.includes('const client = window.supabaseClient;'), 'controller no longer relies only on window.supabaseClient');
assert(!adobe.includes('Mammoth'), 'Mammoth is absent from the authoritative controller');
assert(adobe.includes('glueful-pdf-to-docx'), 'PDF path calls glueful-pdf-to-docx');
assert(adobe.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'), 'PDF path validates DOCX response type');
assert(adobe.includes('docxPreview.renderAsync'), 'DOCX path uses docx-preview');
assert(bridge.includes('typeof supabaseClient !== \'undefined\''), 'bridge reads the existing lexical Supabase client');
assert(sw.includes('glueful-cache-v3-resume-adobe'), 'service worker uses the v3 resume cache namespace');
assert(sw.includes('cache: "no-store"'), 'service worker refreshes authoritative resume scripts without stale cache');
assert(diagnostics.includes('gluefulResumeRendererReport'), 'diagnostics hook is present when diagnostics file exists');

for (const file of [
  'glueful-resume-studio-adobe.js',
  'glueful-resume-studio-supabase-bridge.js',
  'glueful-resume-render-diagnostics.js',
  'glueful-resume-docx-forensics.js',
  'sw.js'
]) {
  if (fs.existsSync(path.join(root, file))) {
    console.log(`Syntax check: ${file}`);
    checkSyntax(file);
  }
}

// Extract inline <script> blocks from index.html and syntax-check them.
const inlineDir = path.join(root, '.resume-inline-checks');
fs.mkdirSync(inlineDir, { recursive: true });
const inlineBlocks = [];
const scriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(index)) !== null) inlineBlocks.push(match[1]);
inlineBlocks.forEach((code, i) => {
  const file = path.join(inlineDir, `inline-${i + 1}.js`);
  fs.writeFileSync(file, code, 'utf8');
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Inline index.html script ${i + 1} failed syntax check.`);
  }
});
console.log(`PASS: all ${inlineBlocks.length} inline index.html scripts pass Node syntax checks`);

console.log('ALL RESUME STUDIO REGRESSION TESTS PASSED');
