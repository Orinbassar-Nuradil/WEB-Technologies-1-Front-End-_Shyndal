# Shindal — Assignment 3 (Bootstrap)

Local, static, no build step. Open `index.html` (or any page) directly in a
browser — everything else loads from the Bootstrap 5.3.3 CDN.

## Pages
`index.html` · `specialists.html` · `booking.html` · `register.html` ·
`profile.html` · `reviews.html` · `help.html`

## What changed from Assignment 2
Every page keeps its Assignment-1/2 HTML content and structure — no page
was started over. On top of that:

- Bootstrap 5.3.3 CSS + JS bundle linked from a CDN on every page (version
  noted in a comment in each `<head>`).
- Every page sits in a `container`; the header and nav use `container-fluid`
  — see the comment above the nav on any page for why.
- The navigation is a real Bootstrap `navbar` that collapses into a working
  toggler below the `lg` breakpoint.
- Layout is built with `row`/`col-*` everywhere a layout choice used to be
  hand-written CSS: the homepage grid, the specialist cards, the booking
  form, the specialty picker, the profile page, the help page.
- One Bootstrap component, the **Badge**, replaces the old `!important`
  "NEW" badge (see the comment above it in `specialists.html`).
- `css/base.css` and `css/student.css` were cut down to a small brand
  correction layer — see `removed-css.md` for the full before/after list.

## Still to do before submitting
- [ ] Take the four required screenshots (one page at 375px / 768px /
      desktop width, plus the collapsed mobile nav) and add them here.
- [ ] Run the pages through the W3C validator and fix anything it flags.
- [ ] Fill in `AI-log.md` with the actual prompts used.
- [ ] Rename `css/student.css` to your own name and update the `<link>` on
      every page, per the note at the top of that file.
- [ ] Commit — at least four commits across three different days (six if
      working alone), from your own account.
