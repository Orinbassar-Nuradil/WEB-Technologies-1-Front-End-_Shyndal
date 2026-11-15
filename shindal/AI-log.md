# AI assistance log

| Date | Tool | Request and use |
|---|---|---|
| 2026-10-05 | Claude | The original supplied project log reports generated midterm pages were used. Historical entry; not independently verified. |
| 2026-10-19 | OpenAI Codex | Prior version of this chat added plain JavaScript, documentation and helper checks to Shindal. The supplied shindal.zip contains that native JavaScript version. |
| 2026-11-02 | OpenAI Codex | User requested implementing assignment6_jquery.docx in the supplied Shindal ZIP. Rewrote main-form validation, generated catalogue and password controls in jQuery; converted other interactive page files to avoid mixed DOM approaches; preserved original versions unlinked in old-js-version.js; added delegation, useful effects, comments, checklist and development-only tests. |

Verification performed: syntax/static freeze checks and real jQuery DOM tests in jsdom. No visual browser pass, responsive screenshots, successful media playback, personal contributions, multi-day commits or repository history were fabricated. Original files outside the output folder were not edited. The existing review video was locally remuxed from MOV to MP4 with AVFoundation passthrough export to repair the HTML’s pre-existing missing MP4 path; no footage was generated.

This log describes preparation assistance. The jQuery assignment requires an independent live defense: do not ask an AI or another person during that defense. Review, understand and verify all code yourself before submission. Prior assignment restrictions remain part of the historical course requirements; this log does not claim compliance with unaided-authoring rules for earlier assignments.

User-requested follow-up on 2026-11-02: removed the shared demonstration banner from the top of every page by deleting its insertion in js/main.js. Contextual form confirmations remain as implemented.

| 2026-11-09 | Claude | Endterm project (Weeks 6–10): split the code into plain JavaScript (`main.js`, `services.js`, `booking.js`, `register.js`, `login.js`, `forms.js`, `dom.js`, `account.js`) and jQuery (`jq-*.js`) in separate files, moved the data to `data.js`, added the opening-hours status, finished the account/login/profile flow, wrote README and DEFENSE_KK.md, and ran a scripted browser test. The endterm defense has to be done without any AI: read and understand every file yourself. |

| 2026-11-09 | Claude | Booking form update requested by the student: the specialist list shows only the specialists of the chosen service; time is only Morning (08:00–13:00) / Afternoon (13:00–19:00) and the lunch break was removed from the working hours; new plan choice — single session or monthly subscription (2 sessions a week for 4 weeks = 8 sessions, the student picks the day and time of every session); price = session price × number of sessions (e.g. 7 000 × 8 = 56 000 ₸). Changed `data.js`, `utils.js`, `booking.js`, `booking.html`, `main.js`, `jq-profile.js`, `help.html`, `specialists.html`. |
