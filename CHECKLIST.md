# jQuery requirement checklist

Line numbers refer to this exact delivered version. Runtime site files use jQuery throughout; the native code in old-js-version.js is intentionally not linked.

| Requirement | File and line |
|---|---|
| jQuery full version and ready explanation | `js/main.js:2` |
| Rewrite 1 comparison comment and generic validation | `js/main.js:76` |
| Main form jQuery rules and combined fields | `js/booking.js:36` |
| Reset only after useful success summary | `js/booking.js:68` |
| Rewrite 2 comparison comment and generated service cards | `js/services.js:4` |
| Rewrite 3 comparison and password implementation | `js/main.js:112` |
| Original native JS, unlinked comparison only | `js/old-js-version.js:1` |
| ID and class selectors, traversal and parent | `js/booking.js:4` |
| Attribute selector, $(this), closest and delegated clicks | `js/services.js:69` |
| Checked pseudo-selector and meaningful selection rule | `js/booking.js:57` |
| find, parent, siblings, each traversal | `js/main.js:58` |
| Chain of more than 3 methods with comment | `js/main.js:48` |
| Second chain with more than 3 methods | `js/profile.js:16` |
| Safe text/attr handling and useful fadeIn with callback | `js/main.js:47` |
| Fixed trusted html only, never user input | `js/services.js:44` |
| val for form input | `js/booking.js:5` |
| prop current checkbox vs attr original checkbox explanation | `js/booking.js:32` |
| prop disabled on empty estimate | `js/services.js:65` |
| Array cards through append; original cards replaced | `js/services.js:12` |
| click, input/change, submit/reset bindings | `js/main.js:82` |
| Delegation explanation for later-created buttons | `js/services.js:67` |
| preventDefault and GET consequence explained | `js/main.js:99` |
| Useful fadeOut and completion callback | `js/main.js:55` |
| Useful slideToggle with explicit duration and callback | `js/services.js:34` |
| FAQ slideUp/slideDown; no duplicate Bootstrap ownership | `js/help.js:21` |
| Whitespace trimming and email/phone checking | `js/booking.js:47` |
| Field-level errors and aria-describedby | `js/main.js:67` |
| Clear error only when fixed and recheck dependent fields | `js/main.js:88` |
| Required attributes retained; server checks explained | `js/main.js:80` |
| Explicit no-authentication result | `js/login.js:14` |
| No password storage; profile property whitelist | `js/register.js:40` |
| Exact password confirmation | `js/register.js:37` |
| Review literal text, date/time and delegated remove | `js/reviews.js:11` |

## Submission items outside code

- The original ZIP has no Git metadata. Update the same real repository rather than creating a new one.
- Four actual personal commits across three days per team member, or six if working alone, still require the student’s genuine work.
- Live defense, browser console, responsive layout and external media/CDNs must be checked on the defense device.
- README and AI-log.md are updated. No report or video recording is required.
