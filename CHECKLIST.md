# JavaScript requirement checklist

All locations below are exact one-based source line numbers in this delivered version. PASS describes source/model/DOM verification, not visual browser QA.

| Requirement | Exact source | Implementation/evidence |
|---|---|---|
| Deferred page scripts | `index.html:13` | All 10 pages use data/main/site plus page-specific deferred scripts. |
| Eight service objects with 4+ meaningful properties | `js/data.js:2` | Original organization service descriptions, prices, 40-minute durations and images. |
| const/let and strict mode | `js/main.js:1` | No var, loose equality, inline events, eval, document.write or unsafe innerHTML; source-audit.cjs verifies this. |
| Reusable functions with parameters and return values | `js/main.js:16` | el, findService, total, reference, phone, email, read and others; total calls findService. |
| Arrays, traversal, transformation, totals | `js/services.js:22` | filter, sort, map, find, reduce and shared rendering. |
| Arithmetic/conditions/logical operators/strict equality | `js/data.js:191` | Preserved calendar rules combine branch, date, period, slot and service checks. |
| Meaningful Math.random | `js/main.js:22` | Temporary DEMO reference; not a real reservation promise. |
| DOM creation and safe text | `js/main.js:9` | createElement and textContent; user text is never inserted as markup. |
| One reusable repeated-list renderer | `js/main.js:76` | Shared across Home, catalogue, estimates, price rows, reviews and checklists. |
| DOM removal/replacement | `js/auth.js:7` | Separate auth pages through DOM, with original source unchanged. |
| Hidden/selected/active/error/success states | `js/site.js:7` | classList with prepared Midterm/Bootstrap states; errors also have text and ARIA. |
| Search/category/sort together | `js/services.js:9` | Matching count, no-results text and reset; cards lead to Booking or estimate. |
| Meaningful calculation | `js/services.js:99` | Line subtotals, total quantity and final price update after each change. |
| Click/input/change events | `js/services.js:70` | Real buttons; select changes and text input trigger update. |
| Submit event | `js/main.js:117` | Prevent default submission, check fields, focus first invalid field, or confirm. |
| Required trimmed text/email/phone/numeric/rule combination | `js/booking.js:363` | Child/parent names, phone/email, age, required branch and cross-field planner validation. |
| Field-specific errors/focus/clearing | `js/main.js:92` | Errors beside inputs, aria-invalid/describedby and first-invalid focus; stale errors clear. |
| Realistic demo confirmation and summary | `js/booking.js:91` | Service, branch, specialist, counts, dates/times and estimate; no server/real booking claim. |
| Live booking summary | `js/booking.js:206` | Text summary; no extra schedule table is reintroduced. |
| Four-week lesson engine preserved | `js/data.js:155` | Exactly four lessons total, one in each consecutive calendar week; first week starts at chosen date. |
| Saturday/Sunday and time restrictions | `js/data.js:181` | Saturday morning only, Sunday closed; five hourly starts per period, each 40 minutes. |
| Wrong-week/invalid/future-date checks | `js/data.js:207` | Reject invalid dates and dates outside the lesson week; reject past times. |
| Duplicate child/specialist prevention | `js/booking.js:165` | Check existing local requests before saving individual lessons. |
| Cart equivalent prepared container | `js/services.js:72` | Reuse the original Midterm Services section as an inline estimate container through DOM; no new HTML block. |
| Cart add/increase/decrease/remove/clear and empty checkout | `js/services.js:134` | Empty state, count/price recalculation and disabled checkout when empty. |
| Same renderer for existing/new reviews | `js/reviews.js:27` | Source photo reviews retain original evidence; new local reviews have automatic date/time. |
| Review validation and counter | `js/reviews.js:90` | Trimmed 20–1000 characters, name and branch; character counter and remove/reset/filter feedback. |
| Auth remains separate with back arrow | `js/auth.js:32` | Standalone Login/Register, centered form, original page navigation and back/Home fallback. |
| Password regex and live checklist | `js/main.js:89` | 8+ characters, uppercase, lowercase, digit, symbol; live textual checklist. |
| Accessible eye control | `js/main.js:172` | Real button, eye SVG, aria-controls, aria-label and aria-pressed. |
| Exact confirmation and no password persistence | `js/auth.js:161` | Passwords removed from name attributes, never saved or output, cleared and concealed after success. |
| FAQ search and local question flow | `js/help.js:22` | Empty/count/reset, question validation/counter, local-only preview. |
| Profile edit and local request management | `js/profile.js:14` | Save/cancel details, remove individual lessons and clear data; empty history. |
| Shared branch-aware contact feature | `js/site.js:35` | Choose branch; correct address, call and WhatsApp action; click/hover/keyboard closure. |
| Freeze verification | `tests/freeze.cjs:7` | PASS for all 10 original HTML + 2 CSS files; only deferred script links excluded. |
| No extra frontend libraries/CSS | `tests/source-audit.cjs:40` | Plain JS; original Bootstrap only. Test dependencies are not loaded by the site. |

## Not certified as passed

| Requirement | Status |
|---|---|
| No AI-generated code | NOT MET by this AI-assisted version; see AI-log.md and instructor policy. |
| All project data real | PENDING: branch staff names/mappings are fictional, as confirmed by the student. |
| Same original Git repository and unchanged midterm tag | AUDITED: repository URL provided; main has 36 older commits and no tags. No midterm tag exists. See GIT_AUDIT.md. |
| Assignment 4 and Assignment 5 historical milestone tags | MISSING in the audited repository: assignment-4 and assignment-5 tags do not exist. |
| At least six meaningful individual commits / real work over days | NOT VERIFIED for this assignment: 36 older commits exist, latest 2026-10-05; no new Assignment 4–5 work is in the audited tree. |
| 375 px, 768 px and desktop screenshots / no overflow | PENDING actual browser visual QA. Prepared responsive classes are used; no screenshots are fabricated. |
| Keyboard and browser console / video / external components | PENDING actual browser testing; DOM interaction simulation passed. |
| HTML/CSS validator reports | PENDING actual validator runs; freeze/source audit is not a W3C validation report. |
| Student defense and live code change | PENDING student work; cannot be certified by an assistant. |

## 2026-10-25 staff and About changes

- `js/data.js:278`: 24 stable, explicitly fictional biographies, ages 25–40 and experience constrained by age.
- `js/specialists.js:54`: shared card renderer with neutral avatar, role, branch, age, education, sample certificate and experience.
- `js/specialists.js:30`: connected name/education search, branch and service filters; reset/count/empty state preserved.
- `js/specialists.js:143`: price table uses only prepared Bootstrap/Midterm classes; source HTML/CSS remains frozen.
- `js/about.js:6`: next-step section inserted after the whole introduction row, keeping text and image side by side on large screens.
- All four automated suites passed again; booking.js remains byte-for-byte unchanged. Visual browser QA and the disclosed AI/fictional-data/Git limitations still apply.
