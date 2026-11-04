# Accessibility checklist (web, mobile + desktop)

Generic and project-agnostic. Run it on any page or screen; target is **WCAG 2.2 AA**.
Each item: what to do, then `Test:` a quick way to check it. Tick `[x]` as you go, write `N/A` with a reason if it truly does not apply.

Fast pass first (5 min), full pass before release.

This project's own short list is `docs/design/DESIGN.md` section 10 (the "floor"). This file is the full version behind it.

## 0. Five-minute fast pass

- [ ] Unplug the mouse: reach and use every control with Tab / Shift+Tab / Enter / Space / Esc.
- [ ] Pinch-zoom on a phone and browser-zoom to 200%: nothing is cut off or locked.
- [ ] Turn on dark mode and light mode: text is readable in both.
- [ ] Run Lighthouse (Accessibility) in Chrome DevTools: score 90+ and no red items.
- [ ] Squint test (or grayscale): can you still tell what is a button, what is an error, what is selected?

## 1. Page structure and semantics

- [ ] `<html lang="en">` (or the real language) is set. Test: view source.
- [ ] Each page has a unique, descriptive `<title>`.
- [ ] One `<h1>`; headings go in order (h1, h2, h3), never skipped for looks. Test: browser extension "HeadingsMap" or the Accessibility tree.
- [ ] Landmarks used once each where relevant: `<header>`, `<nav>`, `<main>`, `<footer>`. Test: screen reader landmark list.
- [ ] Use the real element for the job: `<button>` for actions, `<a href>` for navigation, `<label>` for form fields. Never a clickable `<div>`.
- [ ] Lists are `<ul>/<ol>`, data is `<table>` with `<th scope>`, not styled divs.
- [ ] A "Skip to main content" link is the first focusable element on pages with a big header or nav.

## 2. Keyboard and focus

- [ ] Everything clickable or draggable also works with the keyboard. Test: Tab through the whole page.
- [ ] Tab order matches reading order (do not use `tabindex` above 0).
- [ ] Focus is always visible: use `:focus-visible` with a 2px+ outline and 3:1 contrast against its background. Never `outline: none` without a replacement.
- [ ] Focus is not hidden behind sticky headers or footers (WCAG 2.2: Focus Not Obscured). Test: Tab to the bottom items.
- [ ] Modals and sheets: focus moves in on open, is trapped inside, Esc closes, focus returns to the opener on close.
- [ ] No keyboard traps (you can always Tab out).
- [ ] Custom widgets (tabs, menus, radio tiles, sliders) follow the standard arrow-key patterns from the ARIA Authoring Practices.
- [ ] Any drag action has a non-drag alternative (buttons, tap-to-place).

## 3. Touch and pointer (mobile)

- [ ] Tap targets are at least 44x44 CSS px (24x24 is the absolute WCAG 2.2 minimum), with spacing between them. Test: tap with your thumb, not a mouse.
- [ ] No action needs a multi-finger, path-based or long-press gesture without a simple alternative.
- [ ] Actions fire on release (`click`/`pointerup`), so a mis-tap can be cancelled by sliding off.
- [ ] Hover-only content (tooltips, menus) is also reachable by tap and by keyboard focus.
- [ ] Respect notches and home bars: `padding: env(safe-area-inset-*)` with `viewport-fit=cover`.
- [ ] Works in portrait and landscape; do not lock orientation.
- [ ] Inputs use the right `type` / `inputmode` / `autocomplete` so the correct mobile keyboard appears.

## 4. Zoom, text size and layout

- [ ] **Never** block zoom: no `user-scalable=no`, no `maximum-scale=1`, no scripts cancelling pinch gestures. Viewport should be `width=device-width, initial-scale=1`.
- [ ] Body text is at least 16px (use `rem`, not fixed `px`, for text). Avoid text under 12px for anything people need to read.
- [ ] Page works at 200% browser zoom and 400% for reflow (a 320px-wide layout) with no horizontal scroll, except for true 2D content like maps and data tables.
- [ ] Layout survives the OS "large text" setting and users overriding line-height 1.5 / letter-spacing 0.12em / word-spacing 0.16em. Test: apply those with a text-spacing bookmarklet; nothing overlaps or is clipped.
- [ ] No fixed heights on text containers; let them grow.
- [ ] Line length 45-80 characters on desktop; left-aligned body text (not justified).
- [ ] Test at widths 320, 375, 768, 1024, 1440.

## 5. Colour and contrast

- [ ] Body text contrast at least 4.5:1; large text (24px, or 19px bold) at least 3:1.
- [ ] UI parts (input borders, icons, focus rings, chart lines) at least 3:1 against their background.
- [ ] Check **both** light and dark themes and every state: hover, placeholder, selected, disabled, error. Check text over images, gradients and frosted/glass backgrounds at the worst spot.
- [ ] Never use colour as the only signal. Pair it with text, an icon or a pattern (error = red **and** an icon **and** a message; chart series = colour **and** shape/label).
- [ ] Respect `prefers-color-scheme` as the default theme, and offer a manual override.
- [ ] Support high-contrast: `@media (forced-colors: active)` keeps borders and focus visible; `prefers-contrast: more` bumps contrast if you can.
- [ ] Test with a colour-blindness simulator (Chrome DevTools > Rendering > Emulate vision deficiencies).
- Tools: WebAIM Contrast Checker, Chrome DevTools colour picker contrast ratio.

## 6. Motion and time

- [ ] Wrap non-essential animation in `@media (prefers-reduced-motion: reduce)` and turn it off or swap for a fade.
- [ ] Nothing flashes more than 3 times per second.
- [ ] Auto-playing, scrolling or moving content (tickers, carousels, video) can be paused, stopped or hidden if it lasts over 5 seconds.
- [ ] Timeouts (session expiry, auto-advance) warn the user and can be extended.
- [ ] Parallax and big scroll-jacking effects are off under reduced motion.

## 7. Images, icons, audio and video

- [ ] Meaningful images have `alt` text that says what they convey. Decorative ones use `alt=""` (or a CSS background / `aria-hidden="true"`).
- [ ] Icon-only buttons have an accessible name: `aria-label` or visually hidden text.
- [ ] Charts have a text summary or a data table alternative, not only a picture.
- [ ] Do not put important text inside images.
- [ ] Video has captions; audio has a transcript; nothing autoplays with sound.
- [ ] Inline SVGs that carry meaning have `role="img"` and a `<title>` or `aria-label`; decorative SVGs have `aria-hidden="true"`.

## 8. Forms and errors

- [ ] Every input has a visible `<label for>` (not placeholder-only). Test: click the label, the field focuses.
- [ ] Required fields marked in text ("required"), not just a red asterisk or colour.
- [ ] Group related inputs with `<fieldset><legend>` (radio groups, address blocks).
- [ ] Errors: say which field, what is wrong and how to fix it, in text, next to the field; link with `aria-describedby`; set `aria-invalid="true"`.
- [ ] On submit failure, move focus to the first error or an error summary.
- [ ] Do not clear the form on error; do not block paste into any field.
- [ ] Use `autocomplete` tokens (`email`, `name`, `current-password`, ...) so browsers and password managers can fill them.
- [ ] Do not require re-entering information already given in the same flow.
- [ ] Destructive or paid actions have a confirm step or an undo.

## 9. Dynamic content and screen readers

- [ ] Status messages (toasts, "saved", loading done, timer finished, form errors) go in a live region: `role="status"` / `aria-live="polite"`; urgent ones `role="alert"`.
- [ ] Loading states are announced and use `aria-busy="true"` on the updating region.
- [ ] Route or view changes in single-page apps move focus to the new heading and update `document.title`.
- [ ] Native HTML first, ARIA only when no native element fits. Never `role="button"` on a div without keyboard handlers, and never an `aria-label` that contradicts the visible text (the accessible name must contain the visible label).
- [ ] State is exposed: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-current="page"`, `aria-disabled`.
- [ ] Hidden content really is hidden: `display:none` / `hidden` / `aria-hidden` and not focusable. `aria-hidden` never on a focusable element.
- [ ] Test with a real screen reader: NVDA or Narrator (Windows), VoiceOver (Mac: Cmd+F5, iPhone: triple-click side button), TalkBack (Android).

## 10. Content and cognitive load

- [ ] Plain language; define jargon. Aim for about a year-9 reading level for public-facing copy.
- [ ] Link text makes sense alone ("Read the privacy policy", not "click here").
- [ ] Buttons say what they do ("Pay £4.99", not "Submit").
- [ ] Consistent navigation and button placement across screens.
- [ ] One primary action per screen; show progress in multi-step flows.
- [ ] Do not hide important information (price, limits, bad news) behind a hover or a toggle.

## 11. Performance and device range

- [ ] Usable on a slow phone and weak connection: test with DevTools throttling (Slow 4G, 4x CPU).
- [ ] Core content and controls work without waiting for non-essential scripts or web fonts; use `font-display: swap` and a sensible fallback stack.
- [ ] Test on at least: one iPhone (Safari), one Android (Chrome), desktop Chrome, Firefox and Safari.
- [ ] Print and "reader mode" do not break; content is not locked behind JS-only rendering where avoidable.

## 12. Automated and manual testing

- [ ] Lighthouse accessibility audit (Chrome DevTools).
- [ ] axe DevTools or WAVE browser extension: zero critical or serious issues.
- [ ] Keyboard-only walkthrough of the main user journey (section 2).
- [ ] Screen-reader walkthrough of the main user journey (section 9).
- [ ] Zoom 200% / 400% and mobile-width check (section 4).
- [ ] Reduced-motion and high-contrast check (sections 5 and 6): DevTools > Rendering > Emulate CSS media features.

Automated tools catch roughly a third of issues. The manual passes above are the rest.

## 13. Copy-paste snippets

```html
<!-- Viewport: never disable zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<html lang="en">

<!-- Skip link -->
<a class="skip" href="#main">Skip to main content</a>
<main id="main" tabindex="-1">...</main>

<!-- Icon button -->
<button type="button" aria-label="Close"><svg aria-hidden="true">...</svg></button>

<!-- Field with error -->
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" required
       aria-invalid="true" aria-describedby="email-err">
<p id="email-err">Enter an email like name@example.com</p>

<!-- Polite status announcement -->
<div role="status" aria-live="polite" id="status"></div>
```

```css
/* Visible focus */
:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }

/* Visually hidden but readable by screen readers */
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden;
           clip: rect(0 0 0 0); white-space: nowrap; }

/* Minimum tap target */
button, a.btn, select,
input:not([type=checkbox]):not([type=radio]) { min-height: 44px; min-width: 44px; }
/* Checkboxes/radios: keep the box small, make the whole <label> the 44px target */

/* Safe areas */
body { padding: env(safe-area-inset-top) env(safe-area-inset-right)
                env(safe-area-inset-bottom) env(safe-area-inset-left); }

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
@media (prefers-color-scheme: dark) { :root { color-scheme: dark; } }
@media (forced-colors: active) { .card { border: 1px solid CanvasText; } }
```

## Sign-off

| Page / screen | Date | Tester | Lighthouse | axe issues | Keyboard | Screen reader | Zoom 200% | Notes |
|---------------|------|--------|-----------|-----------|----------|---------------|-----------|-------|
|               |      |        |           |           |          |               |           |       |
