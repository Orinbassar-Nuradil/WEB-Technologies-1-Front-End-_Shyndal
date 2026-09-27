# CSS Checklist — Assignment 2

**Student:** _(replace with your full name — every item below was written by the same person, since this project is done solo)_
**Files:** `css/base.css` (shared), `css/student.css` (personal — rename before submitting)

| # | Requirement | File | Line | What it does |
|---|---|---|---|---|
| 1 | Type selector | css/base.css | 45 | `body { ... }` |
| 2 | Class selector | css/base.css | 208 | `.btn { ... }` |
| 3 | Id selector (1st id) | css/base.css | 124 | `nav#primary-nav { ... }` |
| 4 | Id selector (2nd id) | css/base.css | 186 | `footer#site-footer { ... }` |
| 5 | Descendant selector | css/base.css | 89 | `main section p { ... }` |
| 6 | Child combinator `>` | css/base.css | 138 | `nav#primary-nav > ul { ... }` |
| 7 | Adjacent sibling `+` | css/student.css | 146 | `h1 + section { ... }` |
| 8 | Grouping with commas | css/base.css | 57–60 | `h1, h2, h3, h4 { ... }` |
| 9 | Attribute selector | css/base.css | 199 | `a[target="_blank"] { ... }` |
| 10 | Universal selector `*` | css/base.css | 23–25 | `*, *::before, *::after { ... }` |
| 11 | `:hover` / `:focus` | css/base.css | 157–158, 164–166 | `nav#primary-nav a:hover/:focus`, `input:focus` etc. |
| 12 | `:first-child` | css/student.css | 109 | `.service-row li:first-child { ... }` |
| 13 | `::before` | css/base.css | 112 | `header::before { ... }` |
| 14 | `::after` | css/base.css | 229 | `.auth-nav .nav-link::after { ... }` |
| 15 | At least 8 classes (meaningful names) | css/base.css, css/student.css | — | `.btn`, `.nav-link`, `.profile-link`, `.floating-contact`, `.home-main`, `.service-row`, `.float-img`, `.clear-after-float`, `.badge`, `.badge-wrap`, `.center-grid`, `.price-highlight` |
| 16 | At least 2 ids | css/base.css | 124, 186 | `#primary-nav`, `#site-footer` |
| 17 | Color palette comment (≤5 colors, hex + rgb/rgba + 1 named) | css/base.css | 8–19 | palette list with reasons |
| 18 | Two font families + fallback stacks | css/base.css | 36–37 | `--font-heading`, `--font-body` |
| 19 | font-size / font-weight / line-height / letter-spacing set deliberately | css/base.css | 48–51, 62–66 | on `body`, headings |
| 20 | box-sizing / margin / padding / border used on purpose (+ comment) | css/base.css | 203–207 | comment above `.btn` |
| 21 | Margin-collapse comment | css/base.css | 81–85 | comment above `main section p` |
| 22 | text-align / layout alignment (no nbsp) | css/base.css | 190 | `text-align: center` on footer |
| 23 | Exactly one internal `<style>` block | reviews.html | 11–20 (HTML file) | overrides `aside` border-color |
| 24 | Exactly one inline `style=""` | booking.html | 267 (HTML file) | bolds the phone number |
| 25 | Exactly one `!important` (+ justification comment) | css/student.css | 35–43 | `.badge { ... !important; }` |
| 26 | Nav is a flex row: justify-content, align-items, gap | css/base.css | 124–133 | `nav#primary-nav { ... }` |
| 27 | Extra flex container: flex-wrap + grow/shrink | css/student.css | 85–105 | `.service-row`, `.service-row li` |
| 28 | flex-direction used explicitly | css/base.css | 128 | `flex-direction: row;` on nav |
| 29 | CSS Grid: fr units, repeat(), gap | css/student.css | 63–67 | `.home-main { ... }` |
| 30 | Grid item spanning >1 column/row | css/student.css | 72–75 | `.home-main > h1, .home-main > #branches` |
| 31 | `minmax()` | css/student.css | 65 | inside `.home-main` |
| 32 | Comment: why grid over flexbox | css/student.css | 77–80 | comment below `.home-main` |
| 33 | `position: static` explained in a comment | css/base.css | 251–254 | comment at end of file |
| 34 | `position: relative` as containing block | css/student.css | 55–58 | `.badge-wrap { position: relative; ... }` |
| 35 | `position: absolute` inside it (badge) | css/student.css | 42–53 | `.badge { position: absolute; ... }` |
| 36 | `position: fixed` (stays on screen) | css/base.css | 234–249 | `.floating-contact { ... }` |
| 37 | Floated image inside a paragraph of text | css/student.css | 118–133 | `.float-img { float: left; ... }` |
| 38 | `clear` + comment on what breaks without it | css/student.css | 135–141 | `.clear-after-float { clear: both; }` |
| 39 | Centering technique 1 — margin auto | css/base.css | 171–175 | `main { margin: 0 auto; }` |
| 40 | Centering technique 2 — flex | css/base.css | 243–245 | `.floating-contact { display:flex; justify-content:center; ... }` |
| 41 | Centering technique 3 — grid | css/student.css | 153–157 | `aside.center-grid { display:grid; place-items:center; }` |
| 42 | Specificity experiment (two conflicting rules + resolution) | css/student.css | 16–27 | `.auth-nav a` vs `.auth-nav .profile-link` |

## Notes for the defense

- Every rule above styles a real element that exists in the shared HTML (all pages link `css/base.css` then `css/student.css`).
- The specificity experiment is on the "My Profile" nav link (`class="nav-link profile-link"`).
- `css/student.css` must be renamed to your own name before submitting, and the `<link>` tag on every page updated to match.
- The palette (`css/base.css`, lines 8–19) was re-picked to match the ШыңдАл logo — plum `#7d3b78`, cream `#faf5ec`, gold `#eab04d`, `rgb(58, 27, 57)`, and `tomato`. All five checklist items above still hold; only the hex/rgb values changed, not the line numbers.
- Visual polish added after the checklist requirements (does not move any numbered line above): `css/base.css` lines 256–322 (floating-button pulse animation, `.form-card`, `.avatar-circle`) and `css/student.css` lines 168–210 (`.spec-group` cards, date/time input styling, `.upcoming` row highlight, `.profile-highlight`).
