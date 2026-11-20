#!/usr/bin/env bash
# =============================================================================
# Local Zero-Dependency Bilingual PDF Generator (EN & ES) + Metadata Sync
# Generates ATS-friendly vector PDFs with clickable links via Chrome Headless,
# syncs APP_VERSION & FECHA_ACTUALIZACION (YYYY-MM) in assets/js/app.js, and
# updates the release banner in README.md.
#
# Usage:
#   ./scripts/generate-pdfs.sh
#   ./scripts/generate-pdfs.sh --version v1.2.0
#   ./scripts/generate-pdfs.sh --date 2026-12
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_JS="${ROOT_DIR}/assets/js/app.js"
README_MD="${ROOT_DIR}/README.md"
PDF_DIR="${ROOT_DIR}/assets/pdf"
PDF_EN="${PDF_DIR}/Daniel_Barja_Centeno_Resume_EN.pdf"
PDF_ES="${PDF_DIR}/Daniel_Barja_Centeno_CV_ES.pdf"

mkdir -p "${PDF_DIR}"

NEW_VERSION=""
NEW_DATE="$(date +%Y-%m)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      NEW_VERSION="${2:-}"
      shift 2
      ;;
    --date)
      NEW_DATE="${2:-}"
      shift 2
      ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

if [[ ! "${NEW_DATE}" =~ ^[0-9]{4}-[0-9]{2}$ ]]; then
  echo "Error: --date must match YYYY-MM (got '${NEW_DATE}')" >&2
  exit 1
fi

find_chrome() {
  local candidates=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
    "google-chrome"
    "chromium"
    "chromium-browser"
  )
  for bin in "${candidates[@]}"; do
    if [[ -x "${bin}" ]]; then
      echo "${bin}"
      return 0
    elif command -v "${bin}" >/dev/null 2>&1; then
      command -v "${bin}"
      return 0
    fi
  done
  return 1
}

CHROME_BIN="$(find_chrome || true)"
if [[ -z "${CHROME_BIN}" ]]; then
  echo "Error: No Chrome/Chromium browser found to render PDFs." >&2
  exit 1
fi

# 1. Sync APP_VERSION & FECHA_ACTUALIZACION in assets/js/app.js and README.md
APP_VERSION="$(python3 - "${APP_JS}" "${README_MD}" "${NEW_VERSION}" "${NEW_DATE}" <<'PY'
import re
import sys
from pathlib import Path

app_path = Path(sys.argv[1])
readme_path = Path(sys.argv[2])
new_version = sys.argv[3].strip()
new_date = sys.argv[4].strip()

app_text = app_path.read_text(encoding="utf-8")

m_ver = re.search(r"const APP_VERSION = '([^']+)';", app_text)
if not m_ver:
    raise SystemExit("APP_VERSION constant not found in assets/js/app.js")
version = new_version if new_version else m_ver.group(1)

updated_app = re.sub(
    r"const APP_VERSION = '[^']+';",
    f"const APP_VERSION = '{version}';",
    app_text,
    count=1,
)
updated_app = re.sub(
    r"const FECHA_ACTUALIZACION = '[^']+';",
    f"const FECHA_ACTUALIZACION = '{new_date}';",
    updated_app,
    count=1,
)
if updated_app != app_text:
    app_path.write_text(updated_app, encoding="utf-8")

if readme_path.exists():
    readme_text = readme_path.read_text(encoding="utf-8")
    pdf_tag = f"v{new_date.replace('-', '_')}"
    meta_block = (
        "<!-- resume-meta:start -->\n"
        f"**Version:** `{version}` · **Last Updated:** `{new_date}` · **PDF Release Tag:** `{pdf_tag}`\n"
        "<!-- resume-meta:end -->"
    )
    updated_readme = re.sub(
        r"<!-- resume-meta:start -->.*?<!-- resume-meta:end -->",
        meta_block,
        readme_text,
        count=1,
        flags=re.DOTALL,
    )
    if updated_readme != readme_text:
        readme_path.write_text(updated_readme, encoding="utf-8")

print(version)
PY
)"

# 2. Pick a free ephemeral localhost port and start static preview server
PORT="$(python3 - <<'PY'
import socket
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind(("127.0.0.1", 0))
    print(s.getsockname()[1])
PY
)"

SERVER_PID=""
cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" >/dev/null 2>&1 &
SERVER_PID=$!

# Wait until server responds
for _ in $(seq 1 30); do
  if python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:${PORT}/', timeout=0.5)" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

render_pdf() {
  local lang="$1"
  local out_file="$2"
  local url="http://127.0.0.1:${PORT}/?lang=${lang}"
  "${CHROME_BIN}" \
    --headless=new \
    --disable-gpu \
    --no-first-run \
    --no-default-browser-check \
    --disable-extensions \
    --no-pdf-header-footer \
    --virtual-time-budget=4000 \
    --print-to-pdf="${out_file}" \
    "${url}" >/dev/null 2>&1
}

echo "Generating bilingual vector PDFs (${APP_VERSION} · ${NEW_DATE})..."
render_pdf "en" "${PDF_EN}"
render_pdf "es" "${PDF_ES}"

python3 - "${PDF_EN}" "${PDF_ES}" <<'PY'
import re
import sys
from pathlib import Path

for p_str in sys.argv[1:]:
    p = Path(p_str)
    data = p.read_bytes()
    pages = len(re.findall(rb"/Type\s*/Page\b", data))
    links = len(re.findall(rb"/Subtype\s*/Link\b", data))
    print(f"  ✓ {p.name}: {pages} pages, {links} clickable links, {len(data) // 1024} KB")
PY
