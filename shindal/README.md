# Shindal — Endterm project (Weeks 6–10: JavaScript and jQuery)

The same project, same theme and same pages as in the earlier assignments: the Shindal Development Support Center
(Astana, Kosshy, Taraz). No new repository was started. Open `index.html` (or use any static server).
Internet is needed for the Bootstrap and jQuery CDNs and the external maps.

## Plain JavaScript and jQuery — kept apart

A feature is either plain JavaScript or jQuery, never both. Plain files never use `$`; jQuery files never use
`document.…`, `addEventListener` or `createElement`. Only pure helper functions that take a value and return a value
(`utils.js`) and the data (`data.js`) are shared by both parts.

| Feature | Type | Files | Page | Visitor question it answers | Added since it was last defended | Author |
|---|---|---|---|---|---|---|
| Opening status and service search in the footer | plain JS | `main.js`, `utils.js` | every page | "Are you open right now?", "Do you offer X?" | **New:** open / closed now / closed today / Saturday by appointment, computed from the `HOURS` object in Kazakhstan time; empty search is refused with a message | _fill in_ |
| Service catalogue and estimate | plain JS | `services.js`, `data.js` | services | "What fits my budget? How much will several sessions cost?" | Price filter built from the real prices, total minutes of the estimate, a "Book these sessions" link per line that carries the number of sessions into the booking form; cards are no longer in the HTML | _fill in_ |
| Booking form (main form) | plain JS | `booking.js`, `forms.js` | booking | "How do I ask for a visit?" | Sunday closed / Saturday by appointment, past time slots disabled, live price breakdown, check when a field is left, duplicate-request check, finished confirmation, options built from data | _fill in_ |
| Register | plain JS | `register.js`, `account.js`, `forms.js` | register | "Can I create an account?" | Account is saved (password only as a hash), visitor is logged in, photo shown as a cropped square | _fill in_ |
| Login | plain JS | `login.js`, `account.js`, `forms.js` | login | "Can I log in?" | E-mail and password are really compared with the saved account; error appears next to the wrong field; success opens the profile | _fill in_ |
| Reviews | jQuery | `jq-reviews.js`, `jq-common.js` | reviews | "What do other parents say? Can I add mine?" | Filter by kind and branch, order, "showing N of M", empty states, cards fade in and out | _fill in_ |
| Help: FAQ, map tabs, question form | jQuery | `jq-help.js`, `jq-common.js` | help | "Where is the answer? Where is the branch?" | Highlighted search matches, one answer open at a time (slide), map tab opens from `help.html#map-…` links, finished question form with branch phones | _fill in_ |
| Specialists and price table | jQuery | `jq-specialists.js`, `jq-common.js` | specialists | "Who works with my child's need? What is cheapest?" | Filter by service (from the data), booking link on every card, price table sorts by clicking a header | _fill in_ |
| Profile | jQuery | `jq-profile.js`, `jq-common.js` | profile | "Is my request saved? Can I fix my details?" | Real account details, edit form with checks, history table with upcoming/past labels and calculated totals, working log out | _fill in_ |

## Where each requirement is shown

**Plain JavaScript (weeks 6–8)** — data at the top of `data.js`: `SERVICES`, `BRANCHES`, `HOURS`, `SESSION_PERIODS`.
Loops build the catalogue (`services.js` → `renderList`), the booking selects (`booking.js`) and the checklist (`register.js`);
the markup for services exists nowhere in `services.html`. Own functions with parameters and a return value, each called from
several places: `formatMoney`, `findService`, `calcTotal`, `isPhone`, `isEmail`, `getOpenStatus`, `createEl`, `renderList`,
`readField`, `validateForm`. Conditions: "closed today", "Saturday by appointment", past slots,
Sunday rule, upcoming/past label. Calculated numbers: estimate total, sessions, minutes, booking price, request total.

**Events** — handlers are all attached in code, there is no `onclick` in any page. Types used: `click`, `input`, `change`,
`submit`, `reset`, `focusout`, `keydown`. Delegated handlers: `services.js` (grid and estimate list), `forms.js`
(form-level `input`/`change`/`focusout`), `account.js` (show/hide password), `jq-reviews.js`, `jq-help.js`,
`jq-profile.js`, `jq-specialists.js` (`$(…).on(event, selector, …)`). `event.preventDefault()` in every `submit`;
`event.target.closest(…)` finds which button was pressed.

**Validation** — the main form is the booking form (`booking.js` + `forms.js`): preventDefault, trim, every field
checked, the error is written next to the wrong field (and counted in the prepared `#booking-errors` box), it disappears
as soon as the value is fixed, the confirmation appears only when everything passes. E-mail and phone shapes are checked.
The same rules exist for register, login, reviews, the question form and the profile editor.

**jQuery (weeks 9–10)** — jQuery 3.7.1 from the CDN, every file wrapped in `$(function () { … })`. Selectors: id, class,
element, attribute (`[data-remove-review]`), `:not(.hidden)`, `.filter()` and `.not()`. Traversal instead of ids:
`.closest()`, `.find()`, `.siblings()`, `$(this)`, `.children()`, `.end()`. Chains of three or more methods:
`jqShow` (`jq-common.js`), the FAQ close chain (`jq-help.js`), the price-table sort. Effects tied to the visitor's
action: FAQ `slideUp/slideDown`, tab `fadeIn`, confirmation `fadeIn`, review `fadeOut` on removal, profile editor
`slideDown/slideUp`, price table `fadeIn`.

## Freeze (no new hand-written HTML or CSS)

`css/main.css` and `css/base.css` are byte-identical to the midterm. In the HTML pages only two things changed:
the `<script>` lines in `<head>`, and the **removal** of markup that code now builds from the data (the eight service cards in
`services.html`, the service and specialist `<option>`s in `booking.html`, the placeholder person and the two made-up
history rows in `profile.html`). Nothing was added by hand; appearance changes only by switching existing classes
(`hidden`, `selected`, `error`, `success`, `highlight`).

## Honest notes

- There is no server, so nothing is sent anywhere. Requests, reviews, questions and the account are kept in
  `sessionStorage` of the current browser tab and every confirmation says so. The password is never saved, only a
  non-cryptographic hash (a real site would hash on a server).
- I removed the old "Our Branches" button that an earlier version injected on the home page: it pointed to a page that does not exist.
- Checked in headless Chromium with a scripted run (all ten pages: no console errors, catalogue, estimate, booking,
  register → login → profile, reviews, FAQ, map tabs, specialists, price sort, no sideways overflow at 375 px).
  In that environment the Bootstrap CDN could not be loaded, so the visual look and the Bootstrap navbar still need a quick check
  in your own browser, together with the W3C validator.

## Before you submit

1. Copy these files into the same Git repository (do not create a new one, do not move the midterm tag).
2. Quality pass at least two days before the deadline: open each other's features (or the site on another device),
   submit every form empty and with wrong values, write down what breaks, fix it.
3. Commit from your own account (four commits on three different days, six if you work alone), then
   `git tag endterm`.
4. Fill in the "Author" column above.
