# CSS cleanup — Assignment 3

Bootstrap 5.3.3 now builds the layout, the navigation, the buttons and the
responsive behaviour. Everything below is a rule that used to live in
`css/base.css` or `css/student.css` for Assignment 2 and has been **deleted**
because a Bootstrap class now does the same job. Nothing in this list still
exists in the stylesheets — it is kept here only as the record the
assignment asks for.

## css/base.css — removed

| Removed rule (Assignment 2) | Replaced by |
|---|---|
| `*, *::before, *::after { box-sizing: border-box; }` | Bootstrap's Reboot already sets `box-sizing: border-box` globally |
| `body` font-size / font-weight / line-height / letter-spacing / margin | Bootstrap's base typography, plus `display-*`, `lead`, `fw-*` used per element |
| `h1, h2, h3, h4` font-weight / line-height / letter-spacing / margin | Bootstrap's heading defaults and spacing utilities (`mb-*`) |
| `main section p { max-width: 65ch; }` | Bootstrap grid columns (`col-lg-8`, `col-lg-9`) now control the reading width |
| `header::before` decorative bar (`position: absolute`) | dropped — the plum `bg-primary` header band already reads as a brand element on its own |
| `nav#primary-nav` hand-written `display: flex`, `justify-content`, `align-items`, `flex-wrap`, `gap` | Bootstrap's `navbar navbar-expand-lg` component |
| `nav#primary-nav > ul` flex/list-style reset | `navbar-nav` |
| `nav#primary-nav a` color/underline + `:hover`/`:focus` | `nav-link`, coloured automatically by `navbar-dark` reading the `--bs-primary`/`--bs-link-*` variables we remapped |
| `input:focus, textarea:focus, select:focus` outline | Bootstrap's built-in `form-control`/`form-select` focus ring |
| `main { max-width: 960px; margin: 0 auto; }` | `container` |
| `aside { border; border-radius; padding; background; }` | `border`, `rounded-3`, `p-4`, `bg-white` utilities |
| `footer#site-footer` background/color/padding/text-align | `bg-primary text-white text-center py-4` |
| `a[target="_blank"]` dotted underline | dropped — Bootstrap's default link style plus `rel="noopener"` was enough; not worth a global rule |
| `.btn` (custom button look) | Bootstrap's `btn`, `btn-primary`, `btn-warning`, `btn-outline-secondary`, `btn-outline-primary`, `btn-lg` |
| `.auth-nav .nav-link::after` decorative arrow | dropped — the collapsed mobile menu made the arrow feel out of place; `active`/`aria-current` now marks the current page instead |
| `.floating-contact` position/shadow (kept colour + size only) | `position-fixed`, `rounded-circle`, `d-flex`, `align-items-center`, `justify-content-center` in the HTML; only the brand colour and exact size stayed in CSS |
| `.floating-contact:hover` pulse-ring `@keyframes` animation | dropped — extra Assignment-2 polish, not required, cut to keep this file a correction layer |
| `.form-card` (custom card box + max-width) | Bootstrap `card` + grid columns (`col-lg-6`, `col-lg-9`) for width |
| `.avatar-circle` (kept size + dashed border only) | `rounded-circle`, `bg-light`, `d-flex`, `align-items-center`, `justify-content-center`, `mx-auto` in the HTML |
| `nav#primary-nav { position: sticky; top:0; z-index:100; }` | Bootstrap's `sticky-top` utility class |
| `position: static` explainer comment | dropped, Assignment-2-specific |

## css/student.css — removed

| Removed rule (Assignment 2) | Replaced by |
|---|---|
| `.auth-nav a` / `.auth-nav .profile-link` specificity experiment | `nav-link active aria-current="page"`, set per page |
| `.badge { ... !important; }` + `.badge-wrap { position: relative; }` | Bootstrap's **Badge** component (`badge rounded-pill bg-danger`), with `--bs-danger` remapped to `tomato` in base.css — no `!important` needed |
| `.home-main` CSS Grid (`grid-template-columns`, `repeat`, `minmax`, spanning children) | Bootstrap `row` / `col-lg-8` / `col-lg-4`, with a nested `row row-cols-2` for the stat boxes |
| `.service-row`, `.service-row li`, `.service-row li:first-child` (flex list) | Bootstrap card grid: `row row-cols-1 row-cols-sm-2 row-cols-lg-4` of `card` elements |
| `.float-img`, `.float-img img`, `.float-img figcaption`, `.clear-after-float` | Bootstrap's `float-md-start` + `clearfix` utilities, `img-fluid` |
| `h1 + section { margin-top: 0.5rem; }` | spacing utilities (`mt-*`) applied directly where needed |
| `aside.center-grid` (CSS Grid `place-items: center`) | `d-flex flex-column align-items-center text-center` |
| `.price-highlight td, .price-highlight th` | Bootstrap's `table-warning` contextual row class |
| `.spec-group`, `.spec-group:hover` | Bootstrap `card` component (each specialty fieldset is now a `card p-3`) |
| `.spec-hint` italic/colour | `fst-italic text-muted` utilities |
| `#visit-date, #preferred-time` custom input styling | `form-control` / `form-select` |
| `.upcoming td, .upcoming th` | Bootstrap's `table-success` contextual row class |

## What is left

`css/base.css` now only holds the `--bs-*` variable remap (our brand colours
and palette, applied through Bootstrap's own theming system), the two font
families, and the two small widgets Bootstrap has no ready class for (the
floating WhatsApp button, the avatar placeholder circle).
`css/student.css` holds one brand-colour correction (`.profile-highlight`)
and one fixed image width (`.specialist-figure`) that has no matching
Bootstrap width utility. Both files together are well under the "under a
hundred lines" guideline in the assignment.
