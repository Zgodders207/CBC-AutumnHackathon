# TODO.md

Prototype review fixes. Tick items as you finish them and push. Mention the item in your commit message.

## Highest priorities

- [x] Remove the debug text and the overflowing prototype bar.
- [x] Make the answers panels show real answers.
- [x] Fix the broken #plan section links.
- [x] Add real Skip, edit and validation behaviour.
- [x] Make the free-verdict explanations and the paid-plan value clearer.
- [x] Move the disclaimers up and remove the internal wording.

## Across the whole prototype

- [x] Prototype bar: remove the stray text "silent type: other (hidden from users)", which looks like leaked debug text. Stop it overflowing with a horizontal scrollbar and covering page content at the bottom of every screen.
- [x] Answers aren't carried between screens: the "Your answers so far" panels show "Not given" or "Next" everywhere, and "Idea" is blank even after the home screen. Link the home screen to the later screens.
- [x] Fictional example: "Example with fictional answers" appears on the home screen, but the real flow would never show that badge. That makes the final screens hard to judge.
- [x] Navigation: every "Back" link goes to a fixed screen rather than the previous one, and "Start again" has no confirmation. A user could lose their answers by mistake.

## 1. Home

- [x] Input: the idea box looks like it's already filled in. The grey placeholder reads like real text, and there's no visible label.
- [x] Empty or very short ideas: nothing is shown for these, and there are no examples or prompts for vague ideas.
- [x] Price note: the "£4.99… not advice" line is small and low-contrast on green, and so is the PDF link below it.
- [x] Trust: there's no explanation of how the check works or who built it. The tool asks for money and personal plans, so that matters.
- [x] Verdict preview: the example verdict exists in the page but isn't shown, so new visitors can't see what they'd get.

## 2. PDF upload ("Here's what we found")

- [x] Missing details: "Hours a week" and "How far along" say "Not in the PDF, we'll ask", but there's no way to fill them in on this screen.
- [x] Editing: the extracted details can't be edited here. The screen says "fix anything wrong", but no edit controls are visible.
- [x] File checks: handle file size, scanned PDFs, a wrong file type, and a password-protected PDF.
- [x] Data privacy: the privacy note is tucked into small text, and the "Why upload?" box sits to the side. Make both more prominent.
- [x] Wording: "Claude read your PDF" names the AI vendor and assumes success. A parsing failure has no message.

## 3. Round 1 (Question 1 of 5)

- [x] Progress bar: it has no text labels for the steps.
- [x] Layout: the answer cards are tall, so one question takes about two screens of scrolling. The Continue button sits below the fold.
- [x] Continue button: it isn't disabled or explained when nothing is selected, and there's no validation message.
- [x] Radio options: "You can add others later" conflicts with the single-select radio buttons.
- [x] Questions: question 1 says "Pick the group you'd most like as customers", which is slightly awkward.
- [x] Answers panel: "Answering now…" and "Next" are unclear. A plain "Not answered yet" would read better.

## 4. Follow-ups (Round 2 of up to 3)

- [x] Round count: "up to 3" is vague. Users can't tell how long this will take.
- [x] Text boxes: they have no placeholder, example answer or character guidance, and the empty boxes look unfinished.
- [ ] Chips: the "Several / One or two / None I know of / Not sure" options sit under the second question with the heading partly hidden. Not reproduced, so unchanged: chips and their question are now spaced out, check on a phone.
- [x] Skipping: the intro says "Skip any you can't answer", but there's no Skip button. The user has to leave a box blank.
- [x] Label: "Written by Claude from your answers so far" doesn't explain why these questions were chosen.

## 5. Generating

- [x] Progress: the five steps are timed, not real. The build needs real progress or an honest "this can take up to a minute".
- [x] Cancelling: there's no way to cancel or leave and come back.
- [x] Answers panel: it shows all "Not given". If real answers were missing, the check would be meaningless, and nothing warns the user.
- [x] Accessibility: a screen reader needs the status changes announced.

## 6. Verdict (free)

- [ ] Layout: the rating scale pills are small, and "Overall. A rough view, not a prediction." is easy to miss. The page is long. Partly done: pills and the caveat are bigger, but the page is still long.
- [x] Conflicting scores: two "Promising" ratings sit next to two "Needs work" ratings, but the overall verdict doesn't explain how they combine.
- [x] Reasons: each score has one sentence, which feels thin for the "honest check" the page promises.
- [x] Risks: the two risks aren't ranked or tied back to a score.
- [x] Paywall: the card appears right after the risks. The price is shown big, but the description of what the paid plan adds is cramped.
- [x] "Everything on the left stays free": wrong on mobile, where the layout stacks. (Fixed in PR #10: now "Your verdict and risks stay free".)
- [x] Disclaimers: "What it can't know" and "When to get proper advice" are small grey text at the bottom, so most people will miss them.
- [x] Edit answers: this link is tiny and sits in the header line.

## 7. Payment dialog

- [x] Test mode: the message reads like a placeholder, and it's easy to mistake for part of the real checkout.
- [x] Missing content: there's no list of what's included, no refund policy, no VAT note, and no mention of how receipts or payment data are handled.
- [x] Dismissing: there's no close button, and the "Not now" link is small.
- [x] Keyboard focus: the dialog needs to trap focus.

## 8. Writing plan

- [x] Placement: the "Writing your improved business plan…" banner sits below a large header and is mostly out of view. The nav bar covers it.
- [x] Download button: "Download as PDF (not built)" is visible and looks like a bug if shipped. "Export format still to be decided" is also visible.
- [x] Header scores: the scores are packed in one wrapped line, with "Skills" on its own line.

## 9. Full plan

- [x] Section links: all four plan section links go to the same #plan address, so they jump nowhere. They need their own anchors.
- [x] Improvements: each is a single short line, so it's too thin to justify £4.99.
- [x] Roadmap: the "Price it fairly" step has no cost. "Grow or stop" has no cost either, and the "8 weeks" step overlaps the earlier ones.
- [x] Improved business plan: it shows only three short sections, and it has no market, finance or risk sections.
- [x] Assumptions: these sit at the very bottom, but they matter (for example, "own most of your tools"). Show them next to the roadmap.
- [x] Advice placeholder: "Only local support our research lane has checked will appear here" is internal wording that shouldn't ship.
- [x] Save or print: there's no way to save, share or print.

## 10. Error

- [x] Cause: "Claude didn't reply in time" doesn't say whether it was a timeout, a network problem or the user's connection.
- [x] Try again: there's no limit or backoff, and it doesn't say what happens on repeated failure.
- [x] Fallback: "See an example plan" sends users to a fictional plan that could be mistaken for their own, which could mislead them.
- [x] Saved answers: the panel shows all "Not given" even though the text promises they're saved.
- [x] Missing cases: there's no error screen for payment failure, an upload error, or being offline.
