# Shindal Assignment 4–5

This is a single-student continuation of the original Shindal Midterm website. The supplied original ZIP is the source baseline. Open `index.html`; no build step, database or backend is required. All frontend code is plain JavaScript. The Bootstrap 5.3.3 CDN links already present at Midterm are retained.

## Submission status

The technical rebuild preserves the original HTML/CSS source freeze and adds working DOM interactions. It is **not yet an unconditional assignment-compliant submission**:

- The brief forbids AI-generated code. This version contains AI-assisted code, disclosed in `AI-log.md`. An AI log does not override that prohibition. The student must follow the instructor's policy; this condition is not marked passed.
- The branch staff names/mappings are fictional examples, retained at the student's request. Verify and replace them with real authorized project data before claiming the realistic-data requirement is satisfied. Original service names, descriptions, durations, prices, addresses and telephone numbers are used.
- The supplied ZIP contains no `.git` history. The supplied GitHub repository was audited on 2026-10-24: its main history has 36 older commits, latest 2026-10-05, and no tags. The midterm/assignment tags and six meaningful Assignment 4–5 commits are not satisfied by that audit. See GIT_AUDIT.md; no history or tags were manufactured.
- Automated model, source-freeze and DOM-interaction checks passed. Actual browser screenshots, 375/768/desktop visual checks, keyboard testing in a browser and HTML/CSS validator results still need to be collected. Do not describe the DOM tests as visual browser tests.

See `SUBMISSION_TODO.md`, `CHECKLIST.md` and `EVIDENCE.md` for the exact boundaries.

## Source freeze

All 10 original HTML files and both original CSS files match the supplied Midterm archive byte-for-byte after the added local `<script defer src="...">` lines are removed. No interface block was edited directly in HTML. No CSS rule/file was added, removed or rewritten.

Every page loads `js/data.js`, `js/main.js`, `js/site.js` and its own page script with `defer`. DOM methods create, move, update and remove interface elements. Existing Midterm classes and classes from the Bootstrap version already linked at Midterm provide the layout. `classList` controls hidden, selected, active, error and success states. There is no generated stylesheet, `style` element or `element.style` assignment.

No essential source-file correction has been applied to Midterm HTML/CSS. Runtime corrections are listed below; they are not claimed as original Midterm work.

## Preserved booking behavior

The prior working booking calendar rules are preserved:

1. Choose a required branch, then a service and a specialist from that branch/service roster.
2. Choose a Single visit or One-month plan.
3. Single visit: choose a date, Morning/Afternoon and one exact session.
4. Monthly: exactly four lessons total, one per consecutive calendar week. Week 1 offers only the chosen start date through Saturday. The next week begins on Monday; lessons 3 and 4 continue in the following weeks. Each day shows its date.
5. Every lesson independently selects its day, period and exact start. The top-level service/specialist applies to all lessons.
6. Morning starts: 08:00, 09:00, 10:00, 11:00, 12:00. Afternoon starts: 14:00, 15:00, 16:00, 17:00, 18:00. Every session lasts 40 minutes. Saturday is morning only; Sunday is closed.
7. Reject past/invalid dates, dates outside the appropriate week, wrong branch/service staff and exact child/specialist time conflicts with saved demo requests.
8. Calculate the total and show a live text summary of service, branch, specialist, dates, times, count and price. On success save individual demo lessons in this tab and give a clearly marked demonstration reference.

The calendar engine in `ShindalWeekly` was compared with the prior working engine before formatting; it was unchanged. The rebuild adds a required live text summary and demonstration confirmation wording, not a different scheduling algorithm. There is no automatic renewal, real reservation, live availability service, payment or server transmission.

## Separate Login and Register screens

These remain separate pages. JavaScript removes the surrounding navigation, CTA, footer and contact widget from the live auth-page DOM, centers the form using prepared Bootstrap classes and adds a back-arrow link. Back uses browser history when available and falls back to Home. Login and Register link to each other.

The exact recent custom CSS design is intentionally not reproduced: adding its styles would violate the freeze. The centered sequence, separate-page behavior, eye buttons, password checklist and validation are retained using prepared classes. Passwords are never saved, logged or included in profile objects, confirmations or URLs. There is no claimed authentication or real account creation.

## Functionality Plan

Responsible student for every row: **individual student** (single-person submission; no invented team attribution).

| Page | Visitor goal | Functions | Expected result | Responsible |
|---|---|---|---|---|
| Home | Find a suitable service and useful contact | Render the common service catalogue; present statistics and navigation | Consistent service links; entry to catalogue/booking | Individual student |
| Services | Compare services and estimate a plan | Connected search/category/sort; add/increase/decrease/remove/clear estimate | Result count, no-results/reset, subtotals, count, total and demo checkout summary | Individual student |
| Specialists | Find staff for a branch | Branch and name/service search; catalogue-driven price table | Matching count, empty/reset, next action to Booking | Individual student |
| Booking | Prepare a visit or four-week schedule | Dependent branch/service/staff choices; independent weekly date/time selection; pricing and validation | Live summary, valid demo request, clear field errors and duplicate prevention | Individual student |
| Reviews | Read source reviews and add local feedback | One renderer for both source/new cards; local form and character counter; filter/remove | New timestamped local card, no-results state and local-only confirmation | Individual student |
| Help | Find relevant information and prepare a question | Search/reset FAQ; branch tabs; question validation/character counter | Matching FAQ count, correct branch contacts, safe question preview | Individual student |
| Register | Validate and retain non-password profile details | Name/email/phone/branch/photo rules; exact password confirmation; live checklist/eye controls | Specific errors, first-invalid focus or explicit demo summary; no password storage | Individual student |
| Login | Check input and access demo profile page | Email/password validation, live checklist, eye toggle | Validation-only message; no authentication claim | Individual student |
| Profile | Manage local details and scheduled lessons | Edit/cancel/save profile; remove individual demo requests; clear local data | Updated details, recalculated visible history/empty state and feedback | Individual student |
| About | Choose the next visitor journey | Goal selector and meaningful destination | Relevant explanation and link to catalogue/staff/contact | Individual student |
| Shared | Contact the correct center from any normal page | Choose branch in contact panel; update address/call/WhatsApp; keyboard/click/hover support | Correct branch-specific call or message link; auth pages stay standalone | Individual student |

The catalogue/estimate, booking planner, registration flow, profile editing/history, reviews and help/question flow are substantial visitor tasks. Cosmetic changes, console output and isolated random numbers are not counted as substantial features.

## Runtime consistency corrections

- Contact/footer/help/specialist schedules use the preserved booking hours, including Saturday morning and Sunday closure.
- The common eight-service catalogue supplies Home, Services and the dynamic Specialists price table. An old static LFK entry is not presented as a bookable service when it is absent from the common catalogue.
- Original sample profile/history rows are replaced with real local demo state and a useful empty state.
- Review video source is corrected through DOM from the missing MP4 reference to the original supplied MOV file. Browser playback compatibility still needs visual/manual checking.
- Original forms' claims of administrator submission/authentication are replaced in the live DOM with local-demo explanations.
- Original service data and prices are retained. Branch staff names are explicitly marked fictional pending verification.
- The bottom CTA remains on Home. The original Services CTA section is reused through DOM as the estimate container; no new HTML container is directly authored. On other normal pages the bottom CTA is removed through DOM.

## Data and storage

Service objects contain id, name, description, price, duration, image, category and original role data. The branch contact array contains authentic details from the original website. `ShindalBooking` supplies the retained demonstration branch/service roster. `ShindalWeekly` supplies the retained four-lesson calendar rules.

`sessionStorage` stores non-password profile details, demo bookings, local reviews, estimate quantities and a contact-branch preference. Storage is optional: unavailable storage produces useful feedback and does not prevent initialization. Data is per browser tab; there is no cross-device availability checking. Review text is rendered with `textContent`.

## Checks

With Node.js installed, run from this folder:

```sh
node tests/freeze.cjs
node tests/source-audit.cjs
node tests/logic.cjs
```

Optional development-only DOM tests use `linkedom` (not shipped or loaded by the website). To run them in a separate environment, install `linkedom@0.18.14` as a dev dependency and run `node tests/dom-integration.cjs`. This is DOM simulation, not a browser or CSS renderer.

Read `EVIDENCE.md` for actual results and remaining manual checks. Do not claim unperformed screenshots or validation runs.

## Git and defense

Continue the actual Assignments 1–3/Midterm repository. Do not replace or move its `midterm` tag. Preserve existing history. Do not fabricate commit dates or author identities. An individual submission requires at least six meaningful commits; use real work over real days (plan three days to cover the brief's multi-day expectation).

`assignment-4` belongs on the real working data/logic milestone, and `assignment-5` on the completed interaction milestone. This archive does not invent either historical milestone. See `SUBMISSION_TODO.md` before tagging. At defense, explain any page's input-to-result flow and make a live change yourself.

## Verified original repository

Repository: https://github.com/Orinbassar-Nuradil/WEB-Technologies-1-Front-End-_Shyndal

Read-only audit details and asset-path discrepancies are in GIT_AUDIT.md. The URL is now known; the missing tags and new-assignment history remain unresolved.

## 2026-10-25 profile and layout update

Specialists now display the supplied neutral avatar and a persistent sample biography. Ages are 25–40; experience is at least two years and no more than age minus 23. Fictional institution names and sample certificate titles are labelled as examples on the page and cards, not actual verified clinician credentials. These are still pending real-data verification. Search, branch and service filters work together. The table is restyled through prepared classes only. The About next-step section now follows the entire introduction row so it no longer separates the text and image columns. No source HTML/CSS or booking.js logic changed.
