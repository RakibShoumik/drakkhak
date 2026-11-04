# Drakkhak HSC: instructions for Claude Code

This folder is **Drakkhak** (formerly IceSkep), a static offline MCQ practice app (see README.md and
DATA-SCHEMA.md) for the **HSC (Bangladesh, Bangla medium)**. The folder is still called `iceskep`,
and the localStorage key stays `iceskep.hsc.v1` so records survive. The owner keeps a separate
IBA/GRE copy elsewhere, so in this folder IBA/GRE content is removed.

Since 2026-09-26 (owner's request): the **interface is English by default** (Bangla is a Settings
switch; every UI string is written `L('English','বাংলা')`), questions stay Bangla; the top-bar
Sound/Timer/Night switches are always English and always visible, even during a question; the app
opens in day mode; places are Start · Map · Practice · Progress · Settings, with a Research page
at the foot of the sidebar; days left counts the whole syllabus (unwritten chapters costed from
their pages) at 1 hr 59 min a day by default; stars are completion only (⅓, ⅔, all done); sets are
more than 75% new questions (13 of 16) while any are unseen; the study garden was removed.

Since 2026-11-04 (the merge with the WoWonder community into one site; Learn lives at /learn/):
the interface is **English only** (no language switch; L() always gives the English); the left
sidebar is the default layout and lists Start, Map, Practice, Mistakes, Badges, Shop, Progress,
Settings, the subjects and Research; stars are **½, ¾ and 9/10 done**; **every plan set mixes all
subjects** (PLAN.nextSet deals round the subjects; a subject on the map gives a subject-only set,
a chapter its own set); coins are **one per 8 XP** (GAME.coinsFor); the shop sells per-question
items (GAME.ITEMS) and many cosmetic kinds at the owner's request, but never chests, lifelines or
anything random, and a helped answer never pays or counts as done; the daily spin and lucky drops
are off by default; under every question is Comment · Share · Report (question thread is option 4
in api/social.php; reports go to drakkhak-data/question-reports.json and the admin panel); the
prediction is always labelled an estimate. The pixel cat is `js/pet.js` (standalone, no
dependencies; Learn tells it about answers with `dk:answer`, `dk:setdone`, `dk:level`, `dk:badge`
window events); the WoWonder theme carries a copy as `javascript/drakkhak-pet.js` (build.py
`patch_pet` copies it), so after changing pet.js run `python3 theme/build/build.py --patch theme/drakkhak theme/drakkhak-study`.
Each chapter's **Learn** sheet is built from its questions' `fast` lines and first non-page tag
(the sub-topic), so keep writing both carefully.

The owner prefers short replies. Keep summaries brief.

## Source books

- `source/<book>/p0001.txt, p0002.txt ...` is the OCR text of the NCTB HSC textbooks, one file per PDF page.
- Books: Bangla 1st, Bangla 1st(Sohopath), English 1st, ICT, Physics 1st, Physics 2nd, Chemistry 1st, Chemistry 2nd, Biology 1st, Biology 2nd, Higher Math 1st, Higher Math 2nd. Sohopath is the supplementary reader for **Bangla 1st paper**, so its chapters belong to that paper.
- English 1st is in English. All other books are in Bangla.
- OCR is about 98% correct. Section numbers and some conjuncts can be wrong, so trust the meaning, not every character.
- **Equations and formulas are garbled by OCR.** For any page with maths, chemistry or physics formulas, look at the real page:
  `pdftoppm -f N -l N -r 150 -png -singlefile "$HOME/Desktop/HSC/<book>.pdf" /tmp/page` and then view `/tmp/page.png`.
- The PDFs stay in `~/Desktop/HSC`. Never copy them into this folder.
- `source/` is study material only. It is never uploaded to the website.

## Part 1: chapter map (do once)

For every book, find the table of contents (সূচিপত্র) in its first pages. Write `source/<book>/chapters.json` as
`[{ "n": 1, "bn": "...", "en": "...", "start": 12, "end": 40 }]`.
Use **PDF page numbers, not printed page numbers**: confirm each start page by finding the chapter title in the text files.
Finish by showing one short table per book so the owner can check it.

## Part 2: restructure the app (do once; plan first, show the plan, then build)

1. Replace the IBA and GRE tracks with one **HSC** track. Each paper is a section (11 papers; Sohopath goes inside Bangla 1st). Each chapter from `chapters.json` is a topic, and the study path follows chapter order.
2. Board MCQs have **4 options (ক খ গ ঘ)**, not 5. Update the schema, `tools/check-data.js`, the runner, answer keys and keyboard shortcuts.
3. Support the three board MCQ types:
   - simple;
   - multiple-completion: statements i, ii, iii, then "নিচের কোনটি সঠিক?" with options ক. i ও ii, খ. i ও iii, গ. ii ও iii, ঘ. i, ii ও iii in fixed order;
   - উদ্দীপক: a short scenario shared by 2 questions (reuse the passage mechanism).
4. Questions are in Bangla; the English paper stays in English. Add a Bangla font that matches the current look (e.g. Noto Serif Bengali with Hind Siliguri for UI) and make it work offline. (Done. The interface default was later changed to English at the owner's request.)
5. Timer: 1 minute per MCQ, stored as a blueprint value the owner can change in Settings.
6. Prediction: replace GRE scaled scores and IBA marks with a cautious predicted MCQ mark per paper.
7. Remove GRE/IBA-only features (vocab, GRE calculator, percentiles). Turn trick cards into per-chapter formula/memory cards. Keep the maths generators in `js/gen/` for later use in Higher Math and Physics numericals.
8. Keep everything else unchanged: game layer, streaks, stats, plan, modes and the whole look.
9. Change the localStorage key prefix so old IBA/GRE progress never mixes with HSC data.
10. Delete the old IBA/GRE question files. Update README.md and DATA-SCHEMA.md for HSC.
11. Put the project under git if it isn't already. Don't write any HSC questions in this part.

## Part 3: write questions for one chapter (every chapter)

- Read only that chapter's pages (from `chapters.json`).
- File: `js/data/q-hsc-<paper>-ch<N>.js`, following DATA-SCHEMA.md exactly (fields, why lines, difficulty spread, tags).
- The chapter's Learn sheet is made from each question's `fast` line, grouped by its sub-topic tag in page order, so every `fast` must stand alone as a fact worth revising, and sub-topic tags should be consistent within a chapter.
- Write about 50 questions; use 40 for a short chapter and up to 80 for a long one.
- Mix: about 60% simple, 20% multiple-completion and 20% উদ্দীপক pairs.
- Every fact must come from these pages. Put the PDF page number in the tags (e.g. `p37`).
- **Write original questions.** Never copy the book's sentences or paragraphs into the app.
- Use correct standard Bangla and the same terms the book uses.
- For numericals, work out every answer twice. Where a topic suits it, write or adapt a generator in `js/gen/`.
- For English 1st, write original short passages on the unit's theme plus vocabulary and comprehension items. Don't reproduce the book's passages.
- Then run `node tools/check-data.js` and `node tools/build-index.js` and fix every error. Commit with a message like `ICT ch1: 50 questions`.
- End with 2 lines: how many questions were written, and anything the owner should check.

## Part 4: audit one chapter (always in a fresh session after Part 3)

For every question in that chapter's file, solve it from the source pages **without looking at the key**.
Fix every question where:
- your answer differs from the key;
- two options could be right;
- the fact isn't in the book;
- a sentence is copied from the book;
- the Bangla is wrong.

Rerun both tools, commit, and report in 2 lines what you fixed.

## Admin panel

`/admin/` (PHP 7.2+, no database) changes the live site and shows anonymous study statistics. `api/` holds settings and statistics, `js/site.js` applies them in the browser. Data goes in `drakkhak-data/` above the web root (falls back to `api/data/`), so an upload never overwrites it. A new switch goes in three places: `drk_opts()` in `api/_lib.php`, `DEFAULTS` in `js/site.js`, and `LABELS` in `admin/admin.js`; then run `php tools/check-site.php`. Never put the password in a file: `admin/auth-default.php` holds only a hash.

Love and comments per answer option (`js/social.js`, `api/social.php`) appear only after a question is answered, and their filters and moderation are there because students are often children: keep them. Captivating mode (`js/fun.js`, the `fun.*` switches) must keep the rules at the top of `js/game.js`: rewards only from answers, nothing taken away, and only real numbers. Chests and lifelines are never sold.

## Deploy (only when the owner asks)

Run `node tools/build-index.js` so the cache version updates. Then make `upload.zip` of the site, **excluding** `source/`, `scripts/`, `SSC-text/`, `SSC Test-text/`, `api/data/`, `CLAUDE.md`, `.git` and `upload.zip` itself, so the owner can upload it to cPanel. `admin/` and `api/` go in the zip.
