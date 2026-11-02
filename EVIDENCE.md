# jQuery verification evidence

Executed 2 November 2026 against the final output folder.

## Passed checks

- Node syntax checks for every JavaScript file, including the preserved comparison code.
- Ten HTML files equal the supplied ZIP byte-for-byte after removing the single added deferred jQuery CDN link. Every local HTML href/src target exists. Every page links jQuery before its own scripts and never links old-js-version.js.
- Both CSS files byte-identical to the originals. No CSS rules added. No inline HTML handlers added.
- Application DOM scripts use jQuery ready and .on; no native getElementById/querySelector/createElement/addEventListener, direct element.style, .css(), unsafe innerHTML, document.write or eval in runtime code.
- Original main.js, services.js, booking.js and register.js appear verbatim in old-js-version.js for comparing at least three rewritten features.
- Nineteen grouped DOM scenarios pass with actual official jQuery 3.7.1 and jsdom 26.1.0. See tests/jquery-dom.cjs. These include all ten initial page loads, service filters/sort/empty state, regenerated delegated buttons, 24000 KZT estimate, quantity/removal/clear/disabled checkout, field-specific booking errors/live correction/focus, useful success/reset, duplicate/past/Sunday rules, password show/hide and exact confirmation, no password persistence, demo-only login, literal HTML-looking review text, dated local review/removal/empty state, FAQ and map fallbacks, question reset, profile editing/removal/clear and specialists search.
- Most DOM scenarios disable animations to run deterministically; an additional effects-enabled scenario verifies actual timed callbacks restore FAQ control availability and focus visible feedback. This still does not verify visual animation appearance.
- Dependency-free tests/logic.cjs verifies original service data, prices and the 24000 KZT sample estimate.
- The missing MP4 path was repaired by AVFoundation passthrough MOV-to-MP4 export. For GitHub delivery it was then re-encoded as H.264/AAC with FFmpeg, reducing 47.4 MB to 5.35 MB while retaining the complete approximately 50-second duration and 652×1028 dimensions. The final MP4 has an isom/iso2/avc1/mp41 container; decoding with FFmpeg passed. Encoding quality changes; the file is not merely renamed. The original source remains in the input ZIP.

## Not claimed

A real browser run could not complete: installed Chrome aborted under the execution sandbox and the localhost server could not bind. No responsive/visual screenshot checks, cross-browser video playback, external CDN/map availability or zero-console-error browser pass are claimed. jsdom evaluates application code but does not load all external resources or calculate real layout. Run the browser checks below on the defense device.

No .git metadata was included in the supplied ZIP. No contribution history, personal commits across multiple days or live defense has been fabricated.

## Final manual browser checks

1. Open all ten pages with internet. Confirm jQuery/Bootstrap CDN loading, no console errors, all images/video/maps and navigation. Test widths around 375, 768 and desktop, keyboard focus and no horizontal overflow.
2. Services: combine search/category/sort; reset; generate no matches. Add two speech sessions plus one neurology consultation (24000 KZT), change quantities, remove, clear and verify checkout disables. Filter and add AGAIN to demonstrate delegation on rebuilt cards. Toggle the filter panel repeatedly.
3. Booking: submit empty; correct errors; test invalid email/phone/age/quantity/date/time/Sunday/consent and specialist dependency. Submit valid data, inspect the complete demo summary, reset fields and local profile request. Repeat the slot to test conflict handling.
4. Register/Login: password checklist, exact confirmation, accessible show/hide and form reset. Inspect sessionStorage: no passwords or false authentication state. Test avatar type/size and preview.
5. Reviews: original photos and video; local filter empty state; create a review, character counter/date/branch and animated delegated removal. Literal markup must stay literal text.
6. Help: FAQ search/reset, slide answers and map tabs, valid/invalid question preview/reset. Profile: valid/invalid edit, remove request, clear data and empty state. Specialists: search/reset and booking links.
7. Each student demonstrates and explains their actual work. Complete genuine personal commits in the original repository over the required three days.
