# Drakkhak — HSC

*(formerly IceSkep. The storage key is still `iceskep.hsc.v1`, so nobody's record is lost.)*

Board-level MCQ practice from the NCTB books, for **Bangla-medium HSC students**: eleven
papers, one hundred and twenty-two chapters, written a chapter at a time.

**One job: practise board-level MCQs and win back mistakes.** Every screen answers "what do I
do next?" within three seconds. Open `index.html`; that is the whole install. No account, no
server, no build step, no network call. Everything lives in the browser's local storage and the
app works offline (Bangla type included), on a cheap phone on slow data.

The interface is **Bangla by default**, with an English switch in Settings. Questions stay in
the book's language (the English paper stays English).

---

## The screens

Four tabs and a gear: **শুরু** (Start), **অনুশীলন** (Practice), **ম্যাপ** (Map), **অগ্রগতি**
(Progress), and **Settings**. A tab bar at the bottom on phones; on a desk a sidebar with the same
four, then the seven subjects, each with a thin "% done" bar (click one to practise it). The top
bar holds two numbers: **coins** (tap for the Wallet) and the **streak**.

- **First visit.** One screen: the logo, the tagline, the honesty note and one button,
  **শুরু করো**, which starts the first set. A small link, *আগে ব্যবহার করেছি*, opens Restore.
  There is no placement test.
- **Start.** The number of questions left (of the whole syllabus), one big **চালিয়ে যাও**
  button (16 questions, following the study path), the **ভুলের খাতা** (mistake bank) card,
  one quiet line about the exam and whether the chosen study hours are enough, and the honesty
  note until it is closed.
- **Practice.** Choose the scope (all subjects mixed, one subject, one chapter), then a big
  button for an ordinary set, four modes — **ভুলগুলো আবার** (mistake bank), **দুর্বল অধ্যায়**
  (weak chapters), **পুরো পরীক্ষা** (one paper on board time, checked at the end), **৬০ সেকেন্ড
  চ্যালেঞ্জ** — and the papers with score bars (the pass and goal lines are drawn on them).
- **Map.** Every chapter as a stop on one winding road, Bangla at the bottom, Higher Math 2nd
  paper at the top. Each paper is an island in its subject's colour that begins at a landmark;
  a road you have walked glows; a chapter earns a star at a third, two thirds and all of its
  questions done; "you are here" is where the map scrolls to. Tap a chapter to start its set.
- **Progress.** Done (%) and Score, the cautious mark to beat, one bar per subject, the badges.
- **Settings.** Study hours a day (1–4, default 3), language, sound, night mode, calm mode (no
  animations, no vibration), logo, your data (export, restore, erase), and a link to how it works.

---

## The question screen

**Answer first, and nothing moves until you say so.** The options appear in a fresh random
order every time. Right is a green wash and a chime; wrong is a red wash and a low tone with the
right option marked. Then two buttons: **পরের প্রশ্ন** and **ব্যাখ্যা**. The explanation only
opens if you ask. Keys: `A`–`D` or `1`–`4` answer, `space` next, `E` explanation, `S` skip (full
paper), `N` night, `M` sound, `?` the list.

Every question carries a small tag: **নতুন** (never answered), **আবার দেখা** (you missed it last
time) or **যাচাই** (you got it right last time and it is being checked).

**Sets are 16 questions, and a question never repeats inside a set.** While unseen questions
remain in scope, at least 13 of the 16 are new.

**One minute a question**, the board's own pace. At zero an alarm sounds once, and an answer that
comes late is marked right or wrong as usual but does not count the question as *done*.

**Four options, ক খ গ ঘ**, no negative marking. Three question types: simple,
multiple-completion (statements i, ii, iii), and উদ্দীপক (a scenario shared by two questions,
shown beside both).

### Power-ups (practice sets only, never in a full paper)

| power-up | what it does | price |
|---|---|---|
| **৫০:৫০** | removes two wrong options | 30 coins |
| **দ্বিতীয় সুযোগ** | arm it before answering; if you miss, answer the same question again. The miss still goes to the mistake bank. Spent only if you miss. | 20 coins |
| **+৩০ সেকেন্ড** | thirty more seconds on this question | 15 coins |

The number left of each is shown on its button. New students start with one of each.

### Rewards — one currency

**Coins:** 1 for every right answer, +2 more for winning back a mistake, +5 for finishing a set.
The Wallet (tap the coin) shows the balance, recent earnings and the shop, which sells only the
three power-ups. The **streak** is simply days in a row with five questions answered. **Badges**
(Progress): first 100 and 500 right, a chapter with three stars, a paper finished, a full paper
sat, a full paper at 80 % or more, 7- and 30-day streaks, 50 mistakes won back.

### The mistake bank

A question goes in when your latest answer is wrong and leaves when you answer it right (+2
coins). It comes back later as a **যাচাই** after 1, 4, 12, then 30 days.

---

## The numbers

**Done** — a question is done when you answer it right inside the paper's minute, and, if you
ever missed it, right again at least sixteen hours after the miss. Questions left and the map
count the whole syllabus from day one: a chapter whose questions are not written yet is costed
from its page count (about 1.5 questions a page, 40–80 a chapter) and shows as *soon*.

**Score (0–100)** — right answers divided by (answers + a handful of imaginary misses), so it
has to be earned with volume. The pass and goal lines come from `js/config.js`.

**The cautious mark** — the tenth percentile of the predicted MCQ mark, always (beaten about
nine times in ten). It starts from the ability your answers imply and charges for thin evidence,
chapters never asked about, a pace too slow to reach the last question, and the exam hall itself.
It appears once 20 answers exist. It covers the MCQ half only.

**The pace line on Start** — days of study left at the chosen hours a day, against the days to the
exam date in `js/config.js` (no date set: only "finishes in N days").

---

## The owner's settings: `js/config.js`

Students never see these. Edit the file, then run `node tools/build-index.js` so the offline
cache picks it up.

```js
passLine: 70, goalLine: 85,   // drawn on the 0–100 score
mcqTarget: 88,                // share of the MCQ half a student aims at (%)
examDate: '',                 // 'YYYY-MM-DD'; empty = no countdown
blueprint: { 'hsc/bio1': {n:25, spq:60}, ... }   // MCQ per paper, seconds per question
```

**Check the blueprint against the current board notice.** It sets the clock on every question,
the length of a full paper and the weight of every paper in the prediction; a stale blueprint
quietly corrupts the numbers.

---

## Saved progress

Everything is in this browser under `iceskep.hsc.v1`. Settings → Export downloads a copy;
Restore brings it back. Clearing site data deletes the lot. Records written by earlier versions
are migrated quietly on first load (old 50:50 lifelines become the new stock, coins and the
won-back count carry over, removed fields are dropped).

---

## Layout

```
index.html            script tags — regenerate with node tools/build-index.js
sw.js                 offline cache, network first
DATA-SCHEMA.md        the content contract
css/app.css           parchment by day, warm dark by night
fonts/                Noto Serif Bengali and Hind Siliguri, so Bangla works offline
img/                  the ticked-bubble favicon and app icons
source/               the OCR text of the NCTB books, and chapters.json per book
                      (study material for writing questions; never uploaded)
tools/check-data.js   audits every bank and re-verifies every generated answer
tools/build-index.js  rewrites the script tags and the offline cache list
js/
  config.js           the owner's settings
  data/registry.js    the eleven papers, the 122 chapters, the study path
  data/q-hsc-*.js     authored question banks, one file per chapter
  gen/core.js         the generator engine (gen/spare/ is kept, not loaded)
  store.js            local storage, migration, streak, L('English','বাংলা'), helpers
  i18n.js             Bangla digits and language
  fx.js               sounds, verdict flash, coin flight (off in calm mode)
  ability.js          question index, ability, done-tracking, the mistake bank, marking
  plan.js             completion, stars, the path, the next set, the pace line
  clock.js            the countdown timer
  predict.js          the cautious mark
  game.js             coins, wallet, power-ups, shop
  stats.js            badges
  modes.js            how each kind of set is built
  share.js            export, restore, erase
  charts.js           the two logos, bars, medals, icons
  runner.js           the question screen and the results
  ui.js               the shell: routing, tab bar, sidebar, top bar, sheets, toasts
  ui-pages.js         Start, First visit, Practice, Progress, Settings, Wallet
  map.js              the road
  research.js         how it works, and the honesty note
  learn.js, quests.js empty on purpose: tools/build-index.js still lists them
  boot.js
```

## Adding content

1. Read `DATA-SCHEMA.md`.
2. One file per chapter: `js/data/q-hsc-<paper>-ch<N>.js`. Generators in `js/gen/`.
3. `node tools/check-data.js` — it fails on a bad chapter id, a duplicate id, a key out of range,
   an item without exactly four options, a page tag outside the chapter's own pages, or any
   generated question whose answer its own `verify()` cannot reproduce.
4. `node tools/build-index.js` — adds the new file to `index.html` and bumps the cache.

Every fact must come from that chapter's pages, and the page number goes in the question's tags.
Questions are **written**, never copied out of a book.

## Honest limits

- The prediction covers the **MCQ half only**; the written half decides the grade with it and is
  not measured here, so no grade is promised anywhere.
- **English 1st paper** has no separate MCQ section on the real paper. It is practised here as MCQ
  because that is the useful way to drill it; do not read its mark as a board figure.
- Chapter weights come from each chapter's share of the book's pages, a proxy for how much a board
  paper asks of it, not a published weighting.
- **This website builds exam intuition, not knowledge.** There is no substitute for the NCTB
  textbooks.
- All questions, উদ্দীপক and passages are original, written for this app from the NCTB textbooks.
