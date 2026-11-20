# Resume — Daniel Barja Centeno

Web & Print-Ready Interactive Resume — **Full-Stack Web Developer & Application Analyst**

<!-- resume-meta:start -->
**Version:** `v1.1.0` · **Last Updated:** `2026-11` · **PDF Release Tag:** `v2026_11`
<!-- resume-meta:end -->

## Live & Direct PDF Downloads

- **Live Web CV (English — Default):** https://barjad-cloud.github.io/resume/
- **Live Web CV (Español):** https://barjad-cloud.github.io/resume/?lang=es
- **PDF (English — ATS Vector + Clickable Links):** [Daniel_Barja_Centeno_Resume_EN.pdf](./assets/pdf/Daniel_Barja_Centeno_Resume_EN.pdf)
- **PDF (Español — ATS Vector + Clickable Links):** [Daniel_Barja_Centeno_CV_ES.pdf](./assets/pdf/Daniel_Barja_Centeno_CV_ES.pdf)

## Highlights

- **Zero-Build Static Architecture:** Pure HTML5, Modular CSS3 (8 domain-specific modules loaded in parallel with master `@import` fallback), and Vanilla JavaScript (zero runtime dependencies, instant LCP, compatible with GitHub Pages and direct `file://` preview).
- **3-Tier Responsive Shell:**
  - **Desktop (`>= 1024px` & Wide `>= 1360px`):** Locked `100dvh` App-Shell with auto-shrinking header, reading progress bar, 3-zone collapsible left drawer, and a borderless transparent right editorial rail (`>= 1360px`).
  - **Tablet (`641px–1023px`) & Mobile (`<= 640px`):** Accessible *off-canvas* drawer (`inert` + `Escape`) and device-tailored header layouts.
- **Bilingual (`EN` / `ES`):** Instant language switching synced with `?lang=`, `localStorage`, canonical share URLs, and versioned PDF downloads (`_vYYYY_MM`).
- **4 Themes & Lossless Density:** `Auto`, `Light`, `Dark`, and `Favorito Daniel` (Obsidian Charcoal + Emerald), plus `Full` / `Compact` visual density with zero hidden information.
- **Recruiter & Print-First Tools:** 1-click PDF download, scaled multi-page A4 Print Preview (`@media print` parity), Stack Highlighter with live count badges, WhatsApp/Email quick actions, and Apple/Google/Outlook-compatible vCard 3.0 (`.vcf`).
- **Modern 2025–2026 Features (Zero-Dependency):**
  - **Command Palette & Adaptive Shortcut (`⌘K` / `Ctrl+K`):** Native `<dialog>` palette with fuzzy accent-free search across sections, stack technologies, color themes, languages, and export shortcuts. Detects user operating system dynamically (`⌘K` on macOS/iOS, `Ctrl+K` on Windows/Linux/Android) with prominent `btn-outline-primary` styling and `<kbd>` badge.
  - **Journey Avatar & Interactive Storytelling ("El Viaje de Daniel"):** Modular vector SVG character advancing along the reading progress bar at 60/120 fps in GPU (`transform: translateX`), equipping contextual accessories across 7 curriculum sections, micro-story speech bubbles, and an interactive celebration banner ("Contact Me!") at 100% completion with pure CSS confetti and lateral drawer integration.
  - **Dynamic KPI Highlighting Engine:** Scans and highlights key quantitative metrics across the entire curriculum, displaying a detected count badge and enabling sequential click-through cycling.
  - **Sanitized Stack Filtering & Interactive Pills:** Surgical filtering across technologies (`angular`, `typescript`, `javascript`, `node`, `php`, `sql`, `git`, `leadership`) with 1-click interactive technology badges inside the CV.
  - **Unified Direct Contact Modal:** Instant 1-tap contact via native SMS (`sms:` with OS-specific parameter formatting), phone call (`tel:`), pre-filled WhatsApp and Email, downloadable vCard 3.0, and LinkedIn QR code without layout clutter.
  - **Mathematical Zero Layout Shift (CLS = 0.000):** Synchronized header height (178px initial = 118px compact + 60px shelf) ensuring zero vertical jump during scroll.
  - **Dual-Master Export (JSON Resume + Markdown ATS):** 1-click download of standardized JSON Resume v1.0 and instant clipboard copy of ATS-tailored Markdown resume.
  - **Dynamic Typography Scaling:** `A- / A / A+` (0.94x – 1.08x) with `localStorage` persistence, strictly isolated to on-screen text (`scale = 1` preserved in print/PDF).
  - **Resilient Offline Architecture (DORA Compliant):** Self-contained inline SVG sprite preventing CORS restrictions when opened directly via `file:///` on disk, paired with `daniel_avatar_journey.svg` as design SSOT, high-priority WebP portrait (< 14 KB, -85% LCP byte weight), and PWA Web Manifest.

## Local Audit & Quality Assurance

A comprehensive local audit script validates JS syntax, i18n parity, dead CSS/HTML code, WebP payload, and PDF health in a single command:

```bash
./scripts/audit-cv.sh
```

## Local PDF Generation & Automatic Pre-Commit Sync

Both bilingual PDFs are generated locally with zero external dependencies using the installed Chromium/Chrome browser in headless mode, automatically syncing `FECHA_ACTUALIZACION` in `assets/js/app.js` and the version banner in `README.md`:

```bash
# Regenerate EN & ES PDFs and sync update date (YYYY-MM)
./scripts/generate-pdfs.sh

# Optional: bump semantic version while regenerating PDFs
./scripts/generate-pdfs.sh --version v1.2.0
```

To regenerate PDFs automatically whenever CV source files are committed locally:

```bash
git config core.hooksPath .githooks
```
