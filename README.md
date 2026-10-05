# Shindal — Midterm Project

Static site (HTML + Bootstrap 5.3.3 CDN + small `css/` correction layer). No JavaScript yet.
Open `index.html` in a browser. Put all photos and the video in `images/` (see list below).

## Pages (10)
`index.html` Home · `services.html` · `specialists.html` · `about.html` · `reviews.html` · `help.html` ·
`booking.html` · `register.html` · `login.html` · `profile.html`.
Every page has the same navbar (Home, Services, Specialists, About, Reviews, Help, Account menu, Book now), the same CTA band and footer.

## Three user journeys
1. **Find the address and opening hours of the Taraz branch.** Start: Home → *Help* in the navbar → tab *Taraz* shows address, phone, WhatsApp, Instagram and a map; working hours are in the Contacts card. End: visitor knows where and when to come.
2. **Compare services and book one.** Start: Home → *Services* → read the 8 services and prices → *Book this service* → fill in the booking form (price estimate area, specialist, date) → *Send request*. End: the confirmation area on the same page and the "What happens next?" list tell the visitor an administrator will call to confirm.
3. **Read reviews, then create an account and open the profile.** Start: *Reviews* → watch the video review and photo reviews → *Account → Register* → create account → *Log in* → *My Profile* with booking history and *Book a new session*. End: the visitor sees their details and appointments.

## JavaScript hooks (ids)
Forms: `booking-form`, `review-form`, `question-form`, `register-form`, `login-form`. Message areas: `booking-errors`, `booking-confirmation`, `review-error`, `review-confirmation`, `question-error`, `question-confirmation`, `register-errors`, `register-confirmation`, `login-errors`, `profile-message`. Lists/containers: `reviews-list`, `booking-history-body`, `booking-price`, `faq-list`, `map-tabs`. State classes in `css/main.css`: `.hidden`, `.selected`, `.active-item`, `.error`, `.success`, `.error-message`, `.disabled-item`, `.highlight`.

## Files expected in images/
Speech therapy.png · Special education (defectology).png · Psychology.png · Adaptive physical education (AFE).png · ABA therapy.png · Sensory integration.jpeg · Neuropsychology.png · Neurology consultations.png · Specialists.jpg · Shindal photo.jpeg · otziv 1.mp4 (video) · otziv 2.jpeg … otziv 12.jpeg

## Quality pass (to repeat on a second device)
Found and fixed: dead `action="#"` forms replaced with real targets; "coming soon" draft button removed; all internal links and anchors checked by script; no inline styles; no duplicate ids; navbar identical on all pages.

## Still to do by hand
Screenshots (phone and desktop) per page, W3C validator run, fill `AI-log.md`, commit on 4+ days and tag: `git tag midterm`.
