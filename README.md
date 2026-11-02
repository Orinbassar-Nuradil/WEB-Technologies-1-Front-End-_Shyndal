# Shindal jQuery Assignment 6

This is the existing Shindal website from the supplied Desktop/shindal.zip, continued for the jQuery assignment. No new project theme or repository was created. Extract the ZIP and open index.html, or use your usual local static server. Keep the entire folder together. Internet is needed for the official jQuery, Bootstrap and font CDNs and external maps.

The assignment filename says Assignment 6; its internal heading says Assignment 4. This implementation follows the jQuery instructions in that document.

## Three rewritten features

| Feature | Current implementation | Preserved plain JavaScript |
|---|---|---|
| Main Booking form validation, field errors and success | js/main.js validate helper plus js/booking.js rules and summary | Original main.js and booking.js sections in js/old-js-version.js |
| Service catalogue built from an array with filters and estimate | js/services.js | Original services.js section in js/old-js-version.js |
| Show/Hide Password | js/main.js passwords helper, used by register.js and login.js | Original register.js section in js/old-js-version.js |

Comments directly above the rewritten functions explain the methods replaced and whether jQuery makes them clearer. old-js-version.js contains the original source verbatim and is deliberately NOT linked to any page. It is comparison material, not executable site code.

All remaining interactive page scripts have also been converted to jQuery so one feature is never controlled by both jQuery and native DOM handlers. Pure arrays, arithmetic, regular expressions, date parsing, sessionStorage and URL handling remain standard JavaScript; these are not competing DOM approaches.

## Connection and initialization

Every page loads the full jQuery 3.7.1 build from https://code.jquery.com/jquery-3.7.1.min.js before data.js, main.js and the page script. All links use defer, retaining execution order. Every DOM application file wraps its code in $(function () { ... }); main.js documents the version, full-build requirement and ready behavior. data.js only declares the service data and does not manipulate DOM. Bootstrap is the original midterm dependency. No jQuery plugins, ready-made sliders, galleries, templates or extra site frameworks were added.

## What visitors can do

- All ten pages: service search in the footer and navigation fallback when Bootstrap is unavailable.
- Services: text search plus category, sort, count, reset, no-result state, generated cards, contextual booking links, filter collapse, estimate add/increase/decrease/remove/clear, quantities/totals and demonstration reference. Two speech sessions and one neurology consultation total 24000 KZT.
- Booking: select service and matching specialist, age 1–18, valid contact, future Kazakhstan date/time, Sunday closure, Saturday-by-appointment notice, 1–20 individual sessions and consent. Email is optional but validated when provided. Local conflicting requests are rejected. Successful valid submission preserves the full summary and then resets the form. No appointment availability or actual booking is promised.
- Register and Login: live password checklist, accessible Show/Hide Password, exact registration confirmation, field-level errors, valid email/phone, full reset and explicit front-end-only result. Optional avatar preview is limited to JPG/PNG/WebP up to 2 MB. No account creation or authentication is claimed; passwords never enter storage, URLs or logs.
- Reviews: original photo evidence and local submitted reviews use one card renderer; length checks, character counter, automatic time, branch filter, count, empty state and delegated animated removal. User input is always text, never HTML.
- Help: searchable FAQ, counts and reset, sliding answers, map tab fallback and validated local question preview that resets after success.
- Profile: edit local demo details, view/remove demo requests, clear local demo state, show truthful empty states.
- Specialists: search names/roles, result count/reset/empty state and contextual service links.

## Required methods and defense examples

See CHECKLIST.md for exact file/line references. Selectors include #booking-form (id), .accordion-button (class), input (element), [data-cart-action] (attribute), :checked and :selected. Traversal includes .find(), .closest(), .parent(), .siblings(), .each(). Several handlers use $(this). Two chains of at least three calls appear in the message helper and profile editing, with a chain explanation comment in main.js.

.text() inserts literal text; .html() parses markup. The only application .html() call inserts a fixed trusted estimate explanation. Names/reviews/questions use .text(). .val() reads/writes form values. .attr() handles declared attributes such as aria-controls; .prop('checked') reads the current checkbox state, while .attr('checked') refers to the original HTML declaration. .prop('disabled') disables checkout when the estimate is empty.

All event binding uses .on(); events include click, submit, input, change, reset and keydown. Catalogue clicks delegate to the existing #main parent; estimate lines, reviews, history and password controls also delegate. Comments explain why directly binding to existing buttons would miss cards built later. preventDefault comments explain unwanted navigation/GET submission.

Useful effects: .fadeIn(180) reveals confirmation and focuses it in the completion callback; .fadeOut(120) dismisses outdated success after input changes; .fadeOut(160) removes a review after the animation; .slideToggle(180) collapses the service filter panel; .slideUp(180)/.slideDown(180) close/open FAQ answers and restore button availability in callbacks. Bootstrap's FAQ toggle hook is removed at runtime so there is only one owner of FAQ transitions.

## HTML and CSS freeze

Both original CSS files are byte-identical. Every original HTML file differs only by one deferred jQuery CDN script link. Existing script filenames were retained, so no HTML blocks had to change. All new controls/cards/errors are created in jQuery. Appearance changes use existing custom/Bootstrap classes through addClass/removeClass/toggleClass/hasClass. No .css(), element.style or generated stylesheet rules were added. jQuery effects manage their own temporary animation properties, as required by the assignment.

Baseline media correction: the original HTML refers to otziv 1.mp4, but the input ZIP only supplied otziv 1.mov. A real MP4 derivative was created locally using AVFoundation passthrough export, then re-encoded with FFmpeg H.264/AAC for web delivery (47.4 MB reduced to 5.35 MB). The full roughly 50-second video, audio and 652×1028 frame size are retained; encoding quality changes. This is not an extension rename or generated footage. The output contains the MP4 at the exact original HTML path and a direct video link; the source MOV is still preserved in the input ZIP. No HTML/CSS correction was needed. Playback on the target browser still needs a visual check.

## Verification

EVIDENCE.md records the executed checks and their limitations. All ten pages initialized successfully with real jQuery 3.7.1 in jsdom. Nineteen grouped DOM scenarios passed, including regenerated-card delegation, cart arithmetic, live validation, success reset, safe literal user text and local profile flows. These checks do not replace a visual browser test.

Quick data test: node tests/logic.cjs from this folder. For full DOM tests, install the DEVELOPMENT-ONLY dependency in tests (`npm install --prefix tests`), then run `node tests/jquery-dom.cjs`. The official core jQuery fixture in tests/fixtures is test data only; production pages always use the required CDN. No node_modules is included or needed to open the site.

A real browser run is still required to confirm responsive layout, animation appearance, external CDN/maps/video loading and the browser console. Automated Chrome launch and localhost server binding were denied by this execution environment. No screenshots or visual/console pass have been fabricated.

## Repository and individual contribution

The supplied ZIP contains no .git metadata, so this deliverable cannot preserve or inspect the original repository's history. Copy its changed files into the SAME original Git repository. Do not create a replacement repository or overwrite the midterm tag. Every actual team member must make at least four meaningful commits across three different days from their own account; an individual student requires six. Those actions and personal contributions cannot be fabricated by a generated ZIP.

No written report or video recording is required by this assignment; demonstrate the website live. README/checklist/testing notes are project documentation. At defense, show delegation, effects and validation; explain each jQuery line and its plain-JavaScript equivalent; be ready to change an effect, validation field, chain or list. Official docs and W3Schools are permitted there, but AI/another person is not.

AI preparation assistance is recorded honestly in AI-log.md. Historic assistance entries are retained; this assignment's defense must be completed independently.

## Official references used

- https://api.jquery.com/on/
- https://api.jquery.com/slideToggle/
- https://api.jquery.com/text/
- https://api.jquery.com/html/
- https://api.jquery.com/prop/
