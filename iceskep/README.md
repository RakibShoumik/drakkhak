# Drakkhak — HSC

*(formerly IceSkep. The storage key is still `iceskep.hsc.v1`, so nobody's record is lost.)*

Question-first MCQ practice for the **HSC** (Bangladesh, Bangla medium): eleven papers,
one hundred and twenty-two chapters, written from the NCTB textbooks a chapter at a time.

Open `index.html`. That is the whole install. No account, no server, no build step, no
network call — everything lives in your browser's local storage and the app works with
the wifi off, Bangla type included.

---

## What it is

The written half of the exam is deliberately ignored. This app does one thing: the
বহুনির্বাচনি half, which is decided by two things — whether the fact is actually in your
head, and whether you can find it inside a minute. So the app is built around exactly
those two things.

**Answer first, and nothing moves until you say so.** The options appear in a fresh random
order every time, so no letter is more likely than another. Right is a green wash and a
chime; wrong is a red wash and a low tone, with the right option marked. Then exactly two
buttons: **পরের প্রশ্ন** and **ব্যাখ্যা**. Click anywhere, press space, or press the
button to go on. The explanation — why your choice was tempting, why the right one is
right, and what to remember — only opens if you ask.

**Every question has the paper's own clock.** One minute, because the board sets
twenty-five questions in twenty-five minutes. That figure is a blueprint value, editable
in Settings, and it is the only place the clock comes from. When it runs out an alarm
rings until you stop it (the button or Esc). Both the timer and the alarm can be switched
off in Settings.

**Four options, ক খ গ ঘ**, as on the real paper, and **no negative marking** — so on the
real sheet there is never a reason to leave one blank. The keyboard still answers `A`–`D`
or `1`–`4`, because nobody changes keyboard layout in the middle of a question.

**Three question types, the three the board sets:**

- **simple** — a stem and four options;
- **multiple completion** — statements i, ii, iii, then নিচের কোনটি সঠিক? with
  ক. i ও ii · খ. i ও iii · গ. ii ও iii · ঘ. i, ii ও iii, always in that order;
- **উদ্দীপক** — a short scenario shared by two questions, which stays on screen beside
  both of them so you never read the same scenario twice.

**The interface is English by default; every question is Bangla** (the English paper stays
English). Bangla menus are one switch away in Settings → Language. The three switches in the
top bar — **Sound, Timer, Night** — always read in English, in either language. The Bangla
faces (Noto Serif Bengali for reading, Hind Siliguri for the interface) are served from
`fonts/`, not a CDN, so the questions read correctly offline. A first visit always opens in
day mode; Night turns on the warm dark theme.

---

## The eleven papers

| paper | book | chapters | MCQ |
|-------|------|----------|-----|
| বাংলা ১ম পত্র | Bangla 1st + সহপাঠ | 26 | 30 |
| ইংরেজি ১ম পত্র | English 1st | 15 | 25 |
| তথ্য ও যোগাযোগ প্রযুক্তি | ICT | 6 | 25 |
| পদার্থবিজ্ঞান ১ম ও ২য় পত্র | Physics 1st, 2nd | 10 + 11 | 25 each |
| রসায়ন ১ম ও ২য় পত্র | Chemistry 1st, 2nd | 5 + 5 | 25 each |
| জীববিজ্ঞান ১ম ও ২য় পত্র | Biology 1st, 2nd | 12 + 12 | 25 each |
| উচ্চতর গণিত ১ম ও ২য় পত্র | Higher Math 1st, 2nd | 10 + 10 | 25 each |

Sohopath is the supplementary reader for **Bangla 1st paper**, so its novel and its play
are chapters 25 and 26 of that paper rather than a paper of their own. The English paper
stays in English; every other paper is in Bangla.

**The study path is chapter order.** Inside a paper you never jump about. The papers are
woven together in one round-robin pass, so a day's work spans several subjects and the
first chapter of every paper is reached in the first week rather than eleven papers later.

---

## Five places, a map, and a research page

| | |
|---|---|
| **Start** | The main place. Days of study left for the whole syllabus, a plain count ("0 of 6,689 questions done · 6,689 left"), the exam countdown, the streak, whether you finish in time, one nudge, and the next chapter with a **Start** button and a **Learn this chapter first** button. |
| **Map** | Every one of the 122 chapters as stops on one winding road, climbing from Bangla at the bottom to Higher Math 2nd paper at the top. Each paper begins with a milestone showing its days left for all its chapters together. Each stop shows its three stars and its time left; tap it to open the chapter. The star rules sit on the right the whole time (on a phone, behind the ★ Star rules chip). |
| **Practice** | Continue the plan, four ways in (weak chapters, against the clock, a full paper, the mistake bank), every paper with its score, and more modes under **More**. |
| **Progress** | Days left (all seven subjects added together, with the per-subject breakdown), questions a day, score, done; the days-left line; the cautious prediction; the mistake bank; and under **More** the map, the whole plan, statistics, the prediction line by line, this week and your record. |
| **Settings** | Study time per day (hours and minutes, **1 hr 59 min** by default), exam date, the switches, language, and **More settings**. |
| **Research** | At the foot of the sidebar: a caution about what the app cannot do, then thirteen sections — one per method the app uses — each with the published evidence and a vintage technical drawing. |

**The sidebar** also carries the **seven subjects** (first and second papers joined), each with
a small ring for how much is done and its days left. Tap one to jump to it on the map.

**A chapter is Learn, then Drill.** *Learn* is a revision sheet built from the chapter's own
questions: the one-line "fast route" of every question, grouped by sub-topic in the book's page
order (about nine sections a chapter), each with one worked example. Mark a section **Got it**.
*Drill* runs sets from that chapter until every question is done.

**Stars** measure completion only: a third of a chapter's questions done is one star, two
thirds two, all of them three. Nothing else — not speed, lifelines or coins — moves a star.

**A set takes the window, but the top bar stays**, so Sound, Timer and Night are always in
reach and the rewards have somewhere to land: on a right answer, coins and an XP token burst
out of the answer and fly up into the gold coin box and the XP box, which count up as they
land. Sets are **16 questions**, and while you still have unseen questions **at least 13 of
the 16 are new**. When a set ends the results wait: the next set never starts by itself.

The top bar: today's minutes, the XP box (level and progress; tap for Progress), the coin box
(tap for the shop), days left for the whole syllabus (tap for the map), and **Sound, Timer,
Night**. On a phone the five places move to a tab bar at the bottom. Keyboard: `A`–`D` answer,
`space` next (or start a set), `E` explanation, `S` skip, `Esc` stop the alarm or close a
window, `T` timer, `N` night, `M` sound, `R` your record, `?` the list.

---

## The game layer, and what it refuses to do

Points, coins, stars, badges, chests and levels all come out of questions answered
correctly, and the clock behind them still only counts minutes you were actually there
for. Three rules hold the whole thing together:

- **A reward is never worth more than the work behind it.** A দানব question pays four
  times a সহজ one; a fast answer pays more than a slow one; a wrong answer costs nothing
  unless you said you were sure.
- **Nothing is taken away for being human.** Streaks can be frozen, repaired and kept;
  there is no energy meter, nothing expires, and nothing stops you practising.
- **Nothing can be bought.** Coins come from answering. There is no money in this app, no
  loot box you pay for, and no cosmetic that makes a question easier.

Deliberately absent, because they would work against the exam: paid anything,
pay-to-win, energy timers, punishing streak loss, guilt notifications, public
leaderboards, fake opponents, strangers in chat, endless autoplay, and points for minutes
rather than for answers.

What is in: XP and levels (quick at first), a rank ladder from পাস to বোর্ড স্ট্যান্ড,
three stars per chapter, a chest with a pity counter, a badge wall with secret entries,
formula cards unlocked by *using* them, chapter cards for finishing a chapter, a season track, daily and weekly quests, the question of
the day with a fourteen-day grid, duels by code, share cards, a printable certificate and
progress report, an error bounty, and modes that unlock as you go.

---

## Score, completion, and days left

**The score (0–100) has to be earned with volume.** It is right answers divided by
(answers + a handful of imaginary misses every record starts with). Five out of five is a
20; 450 out of 500 is an 87. A right answer on a warm-up question counts 0.7. Every score
starts at zero. The **pass line is 70** and the **goal line is 85** — roughly 90 % on
board-level questions with the volume behind it — and both can be moved.

**A question is done** when you answer it right inside the paper's minute. If you ever
missed it, it only counts once you get it right again on a later day.

**Days left** is shown in the top bar, the sidebar, and on every overview: each unfinished
question's minute plus a quarter-minute to read the result, times the attempts your own
hit-rate says it will take, plus half a minute for every unread Learn point and a minute and a
half for every unread formula card, divided by your study time per day (**1 hr 59 min** unless
you change it). **The whole syllabus counts from day one:** a chapter whose questions are not
written yet is costed from its page count (about 1.5 questions a page, 40–80 a chapter — the
same rule the question writers follow) and shows as *soon* on the map.

**Continue the plan** draws its new questions from the first unfinished chapters on the path
(more than three quarters of every set while any are unseen), brings back anything due, and
revisits finished chapters now and then.

## The prediction is built to be beaten

Most practice apps print the middle of their guess, so half the time the real exam comes
in below it, and the one day it matters you are short.

This one prints the **tenth percentile**, as a mark out of that paper's MCQ. It starts
from the ability your answers imply, then charges you for every reason that estimate might
be flattering:

- how thin the evidence is (the standard error of the estimate)
- how much of the chapter list, by weight, you have never been asked about
- how many recent answers you gave with the timer switched off
- whether your median pace would actually reach the last question — an unreached question
  is the only kind that scores zero, because a wrong answer costs nothing
- a flat charge for the exam hall itself

Every charge is shown as a line item with its reason, so the number is arguable rather
than magic. A paper's figure appears only once it has twenty answers behind it. Sit the
real thing and you should come in **above** it, roughly nine times in ten.

Turn *Hard prediction* off in Settings to see the ordinary middle-of-the-guess figure, and
watch it jump. Leave it on.

---

## Layout

```
index.html            script tags — regenerate with node tools/build-index.js
sw.js                 offline cache, network first
DATA-SCHEMA.md        the content contract
css/app.css           parchment by day, warm dark by night
fonts/                Noto Serif Bengali and Hind Siliguri, so Bangla works offline
source/               the OCR text of the NCTB books, and chapters.json per book.
                      Study material for writing questions. Never uploaded.
tools/check-data.js   audits every bank and re-verifies every generated answer
tools/build-index.js  rewrites the script tags and the offline cache list
js/
  data/registry.js    the eleven papers, the 122 chapters, the blueprint, the path
  data/q-hsc-*.js     authored question banks, one file per chapter
  gen/core.js         the generator engine: seeded draws, four-option assembly
  gen/spare/          the IBA/GRE maths families, kept to be adapted. Not loaded.
  store.js            local storage, dates, formatting, L('English','বাংলা'), the ক খ গ ঘ letters
  fx.js               sounds, the green/red animations, the time-up alarm
  ability.js          ability, the 0–100 score, done-tracking, shuffling, selection (13-of-16 new)
  learn.js            each chapter's Learn sheet, built from its questions' fast lines and tags
  plan.js             the study path, completion, days left (with unwritten chapters), subjects, the next set
  clock.js            measured study time
  predict.js          the cautious predicted MCQ mark, per paper
  charts.js / runner.js / stats.js / boot.js
  game.js             XP, levels, coins, ranks, stars (completion), badges, chests, cosmetics
  quests.js           daily and weekly quests, the streak and its repair, events, wrapped
  modes.js            blitz, survival, boss, ghost, duels, board MCQ, the skip test
  share.js            share cards, the printable certificate and report, flags, notes
  i18n.js             a safety net that translates any stray Bangla chrome when English is on
  ui.js               the shell: Start, Map, Practice, Progress, Settings; top bar; sidebar subjects
  ui-pages.js         everything one tap in: the chapter (Learn/Drill), plan, prediction, record, shop …
  map.js              the map of all 122 chapters, with the star rules
  research.js         the research page and its thirteen plates
img/                  the logo (logo.svg) and app icons cut from the owner's দ্র card
```

## Adding content

1. Read `DATA-SCHEMA.md`.
2. One file per chapter: `js/data/q-hsc-<paper>-ch<N>.js`. Generators in `js/gen/`.
3. `node tools/check-data.js` — it fails on a bad chapter id, a duplicate id, a key out of
   range, an item without exactly four options, a page tag outside the chapter's own pages,
   or **any generated question whose answer its own `verify()` cannot reproduce**.
4. `node tools/build-index.js` — adds the new file to `index.html` and bumps the cache.

Every fact must come from that chapter's pages, and the page number goes in the question's
tags. Questions are **written**, never copied out of the book.

## What is measured, and what is not

The clock counts a minute only when the tab is in front of you **and** you have touched
something in the last ninety seconds. Leaving the page open earns nothing. No figure on
the Statistics page can be typed in or edited, which is the only reason it is worth
looking at.

A streak day is banked at five questions or five minutes — opening the page is not
studying. Two freezes a month cover a single missed day, one more freeze is earned every
seventh day of a live streak, and a lost day can be repaired once a week with coins. Your
best streak stays on the record whatever happens to the current one.

XP, coins and chests follow the same rule as the clock: they come from answers, never from
time spent on the page. A formula card counts as read when it has actually been on your
screen for a couple of seconds — rendering a list of eighty of them is not reading them,
and the badges depend on that difference.

Everything is in this browser and nowhere else, under its own storage key
(`iceskep.hsc.v1`), so nothing from another edition of this app can mix with it. Settings
has an export; take a copy now and then, because clearing site data deletes the lot.

---

## Honest limits

- The **blueprint** — MCQ per paper, seconds per question — is the commonly reported board
  pattern, not scraped from a live circular. It sets the clock on every question and the
  weight of every paper in the prediction, so check it against the current official notice
  and edit it in Settings if it has moved. A stale blueprint quietly corrupts the number.
- The prediction covers the **MCQ half only**. The written half decides the grade with it,
  and this app does not measure the written half — so there is no grade promised anywhere,
  only a mark out of the MCQ.
- **English 1st paper** has no separate MCQ section on the real paper. It is practised here
  as MCQ anyway, on original passages and vocabulary from each unit's theme, because that
  is the useful way to drill it — but do not read its predicted mark as a board figure.
- Chapter weights come from each chapter's share of the book's pages. That is a reasonable
  proxy for how much a board paper asks of it, not a published weighting.
- All questions, উদ্দীপক, cards and passages are original, written for this app from the
  NCTB textbooks. No sentence is copied out of a book.
