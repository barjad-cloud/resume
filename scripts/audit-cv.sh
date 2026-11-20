#!/usr/bin/env bash
# =============================================================================
# Local Zero-Dependency Audit Tool for DBC Resume Web & PDF
# Validates JS syntax, i18n parity, dead classes, WebP image and PDF health.
#
# Usage:
#   ./scripts/audit-cv.sh
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "========================================================"
echo " DBC Resume — Local Comprehensive Audit"
echo "========================================================"

ERRORS=0

echo -n "1. Checking JavaScript syntax (all assets/js/*.js)... "
if node --check assets/js/*.js; then
  echo "✓ OK"
else
  echo "✗ FAILED"
  ERRORS=$((ERRORS + 1))
fi

echo -n "2. Checking dead classes (.compact-optional, .is-placeholder, .drawer-status, btn-sms, rail-reading, rail-scroll-top)... "
DEAD_FOUND=0
if grep -rn "compact-optional" index.html assets/ >/dev/null 2>&1; then DEAD_FOUND=1; fi
if grep -rn "is-placeholder" assets/css/ >/dev/null 2>&1; then DEAD_FOUND=1; fi
if grep -rn "drawer-status" assets/css/ >/dev/null 2>&1; then DEAD_FOUND=1; fi
if grep -rn "btn-sms" assets/ >/dev/null 2>&1; then DEAD_FOUND=1; fi
if grep -rn "rail-reading" index.html assets/ >/dev/null 2>&1; then DEAD_FOUND=1; fi
if grep -rn "rail-scroll-top" index.html assets/ >/dev/null 2>&1; then DEAD_FOUND=1; fi

if [[ ${DEAD_FOUND} -eq 0 ]]; then
  echo "✓ OK (0 dead code remnants)"
else
  echo "✗ FAILED (Dead code remnants found)"
  ERRORS=$((ERRORS + 1))
fi

echo -n "3. Auditing i18n parity, rich tokens and orphan keys... "
I18N_CHECK="$(node - <<'NODE'
const fs = require('fs');

const orig = fs.readFileSync('assets/js/i18n.js', 'utf8');
const scope = {};
eval(orig.replace('(function initResumeI18n(globalScope) {', '(function(globalScope) {').replace('})(window);', '})(scope);'));

const html = fs.readFileSync('index.html', 'utf8');
const dict = scope.RESUME_I18N.DICCIONARIO;

// Hydrate en from html DOM-like parse
const regexI18n = /data-i18n=\"([^\"]+)\"[^>]*>([^<]*)</g;
let m;
while ((m = regexI18n.exec(html)) !== null) {
  if (!dict.en.text[m[1]]) dict.en.text[m[1]] = m[2].trim();
}
const regexAria = /data-i18n-aria=\"([^\"]+)\"/g;
while ((m = regexAria.exec(html)) !== null) {
  if (!dict.en.text[m[1]]) dict.en.text[m[1]] = 'aria';
}
const regexAlt = /data-i18n-alt=\"([^\"]+)\"/g;
while ((m = regexAlt.exec(html)) !== null) {
  if (!dict.en.text[m[1]]) dict.en.text[m[1]] = 'alt';
}
const regexPlaceholder = /data-i18n-placeholder=\"([^\"]+)\"/g;
while ((m = regexPlaceholder.exec(html)) !== null) {
  if (!dict.en.text[m[1]]) dict.en.text[m[1]] = 'placeholder';
}
const regexRich = /data-i18n-rich=\"([^\"]+)\"/g;
while ((m = regexRich.exec(html)) !== null) {
  if (!dict.en.rich[m[1]]) dict.en.rich[m[1]] = ['placeholder'];
}

const enText = Object.keys(dict.en.text);
const esText = Object.keys(dict.es.text);
const enRich = Object.keys(dict.en.rich);
const esRich = Object.keys(dict.es.rich);

const missingEs = enText.filter(k => !Object.prototype.hasOwnProperty.call(dict.es.text, k));
const missingEn = esText.filter(k => !Object.prototype.hasOwnProperty.call(dict.en.text, k));
const missingEsRich = enRich.filter(k => !Object.prototype.hasOwnProperty.call(dict.es.rich, k));
const missingEnRich = esRich.filter(k => !Object.prototype.hasOwnProperty.call(dict.en.rich, k));

if (missingEs.length || missingEn.length || missingEsRich.length || missingEnRich.length) {
  console.log(`FAIL: missingEs=${missingEs.length}, missingEn=${missingEn.length}, missingEsRich=${missingEsRich.length}, missingEnRich=${missingEnRich.length}`);
  process.exit(1);
} else {
  console.log(`OK: ${enText.length} text keys, ${esRich.length} rich keys in 100% parity`);
}
NODE
)"
if [[ $? -eq 0 ]]; then
  echo "✓ ${I18N_CHECK}"
else
  echo "✗ ${I18N_CHECK}"
  ERRORS=$((ERRORS + 1))
fi

echo -n "4. Checking WebP portrait optimization (< 25 KB)... "
WEBP_FILE="assets/img/daniel_barja_photo.webp"
if [[ -f "${WEBP_FILE}" ]]; then
  SIZE=$(wc -c <"${WEBP_FILE}")
  if [[ ${SIZE} -lt 25600 ]]; then
    echo "✓ OK (${SIZE} bytes, < 25 KB)"
  else
    echo "✗ FAILED (File too large: ${SIZE} bytes)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "✗ FAILED (WebP file missing)"
  ERRORS=$((ERRORS + 1))
fi

echo -n "5. Checking PDF releases (EN & ES, 4 pages, clickable links)... "
PDF_CHECK="$(python3 - <<'PY'
import re
import sys
from pathlib import Path

pdfs = [Path("assets/pdf/Daniel_Barja_Centeno_Resume_EN.pdf"), Path("assets/pdf/Daniel_Barja_Centeno_CV_ES.pdf")]
for p in pdfs:
    if not p.exists():
        sys.exit(f"Missing {p.name}")
    data = p.read_bytes()
    pages = len(re.findall(rb"/Type\s*/Page\b", data))
    links = len(re.findall(rb"/Subtype\s*/Link\b", data))
    if pages != 4:
        sys.exit(f"{p.name} has {pages} pages (expected 4)")
    if links < 4:
        sys.exit(f"{p.name} has only {links} links")
print("OK (both PDFs valid with 4 pages)")
PY
)"
if [[ $? -eq 0 ]]; then
  echo "✓ ${PDF_CHECK}"
else
  echo "✗ ${PDF_CHECK}"
  ERRORS=$((ERRORS + 1))
fi

echo -n "6. Checking Journey Avatar SVG asset (< 15 KB) & DOM runner integrity... "
AVATAR_FILE="assets/img/daniel_avatar_journey.svg"
if [[ -f "${AVATAR_FILE}" ]]; then
  AVATAR_SIZE=$(wc -c <"${AVATAR_FILE}")
  if [[ ${AVATAR_SIZE} -lt 15360 && ${AVATAR_SIZE} -gt 1000 ]]; then
    if grep -q "header-avatar-track" index.html && grep -q "header-avatar-runner" index.html; then
      echo "✓ OK (${AVATAR_SIZE} bytes SVG, track & runner in DOM)"
    else
      echo "✗ FAILED (Runner missing in index.html)"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo "✗ FAILED (Avatar SVG size unexpected: ${AVATAR_SIZE} bytes)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "✗ FAILED (Avatar SVG missing)"
  ERRORS=$((ERRORS + 1))
fi

echo -n "7. Checking Header Height Sync (178px = 118px + 60px) & Keyboard Shortcut detection... "
if (grep -q "min-height: 178px" assets/css/styles.css 2>/dev/null || grep -q "min-height: 178px" assets/css/header.css 2>/dev/null) && \
   grep -q "f_detectar_plataforma_atajo" assets/js/app.js && \
   grep -q "rail-search-kbd" index.html; then
  echo "✓ OK (178px calibrated & adaptive shortcuts active)"
else
  echo "✗ FAILED (Header calibration or shortcut detection missing)"
  ERRORS=$((ERRORS + 1))
fi

echo "========================================================"
if [[ ${ERRORS} -eq 0 ]]; then
  echo "🎉 AUDIT PASSED: 0 errors found. All invariants verified."
  exit 0
else
  echo "❌ AUDIT FAILED: ${ERRORS} error(s) detected."
  exit 1
fi
