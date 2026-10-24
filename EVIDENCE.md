# Evidence and verification boundaries

Date: 2026-10-24 (Asia/Almaty). The source baseline is the original user-supplied Midterm ZIP.

## Actual automated results

- Source freeze: PASS. All 10 original HTML files and both CSS files have the same SHA-256 hashes after removing only the newly inserted deferred script links. Baseline hashes are in tests/freeze-manifest.json.
- Source audit: PASS. Frontend syntax, strict mode, local deferred scripts, no var/loose equality/inline events/eval/document.write/unsafe innerHTML/style assignments, and only the original two CSS files.
- Booking model: PASS. Exactly four monthly lessons, one per week; partial first week, subsequent Mondays, branch/service staff, 40-minute hourly starts, Saturday/Sunday restrictions, invalid/out-of-week dates, totals, short months and leap-year boundaries.
- DOM initialization: PASS on all 10 actual Midterm HTML pages; generated IDs remain unique.
- DOM interaction simulation: PASS for valid/invalid booking, four saved lessons and totals, duplicate prevention, branch dependency reset, single booking/Sunday/Saturday, standalone register/login/back links, first-invalid focus, exact password confirmation, eye ARIA state, password clearing/non-storage, catalogue connected search/category filters and empty state, cart add/increase/decrease/remove/clear/maximum/checkout, safe review text, question validation and FAQ search, profile history removal, branch contact links and storage-denied initialization.

Full actual output: tests/results.txt. Tests use Node.js and development-only linkedom 0.18.14. linkedom is not included in the website or loaded by any HTML page. These are simulated DOM tests, not a browser rendering engine.

## Booking preservation evidence

Before formatting, the ShindalWeekly calendar engine was compared byte-for-byte with the prior working site and matched. Formatting changed whitespace only. The final booking regression tests exercise the retained four-week behavior. UI additions are limited to a required live text summary and explicit demo confirmation; the top-level selection and weekly scheduling model is unchanged.

## Not performed or not available

No actual browser rendering/screenshots, 375/768/desktop overflow measurements, live keyboard/browser-console checks, external map/Bootstrap CDN checks, review-video playback verification, W3C validator reports, student defense is claimed. A read-only GitHub repository/commit/tag audit was subsequently completed and is documented separately in GIT_AUDIT.md. Browser/computer access was unavailable in this session.

The original ZIP does not include .git history. The real Midterm tag was not moved; no repository, historical milestone tags or commits were fabricated. The student has confirmed this is an individual submission.

Fictional branch staff remain at the student's request and must be verified against real organization data. The AI-code prohibition is not satisfied by this AI-assisted implementation; see AI-log.md.

## Manual evidence to collect

Capture Home, Services, Specialists, Booking, Reviews, Help, About, Profile, Login and Register at 375 px, 768 px and desktop. Test every button/link/form, error clearing, keyboard order, mobile navigation, password eyes, back arrow, preview image, actual video and contact destinations. Save screenshots without sensitive real user data, record console/validator results and add the genuine Git log/tag output from the original repository.

## Subsequent GitHub audit

On 2026-10-24 the student supplied the repository URL. The audited main history contains 36 commits, latest 2026-10-05, and no tags. The remote tree lacks the css/images folders referenced by its HTML. See GIT_AUDIT.md and tests/repository-audit.json. No remote mutation occurred.

## 2026-10-25 follow-up verification

All four suites passed again (tests/results.txt). New DOM assertions verify 24 sample biographies, 25–40 age bounds, plausible experience ranges, persistent values across reloads, 24 neutral avatars, branch+service filtering, eight price rows, and the About image/text as two sibling columns with the next-step section outside that row. booking.js was compared byte-for-byte with the prior working file and was unchanged. No visual browser render or commit is claimed.
