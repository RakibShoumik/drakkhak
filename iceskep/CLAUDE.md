# Drakkhak HSC: instructions for Claude Code

This folder is **Drakkhak** (formerly IceSkep), a static offline MCQ practice app (see README.md and
DATA-SCHEMA.md) for the **HSC (Bangladesh, Bangla medium)**. The folder is still called `iceskep`,
and the localStorage key stays `iceskep.hsc.v1` so records survive. The owner keeps a separate
IBA/GRE copy elsewhere, so in this folder IBA/GRE content is removed.

Since the redesign (see REDESIGN-PLAN.md): one job, practise board-level MCQs and win back mistakes.
The interface is **Bangla by default** (every UI string is `L('English','বাংলা')`, digits through `N()`),
questions stay in the book's language. Four tabs (শুরু, অনুশীলন, ম্যাপ, অগ্রগতি) plus a gear; top bar =
coins and streak only. One currency (coins: 1 per right, +2 for winning back a mistake, +5 per set),
three power-ups bought with coins, badges, a simple streak. Sets are 16 questions, never repeat a
question, and while unseen questions remain at least 13 are new. The owner's settings (pass and goal
lines, MCQ target, exam blueprint, exam date) live in `js/config.js`. `tools/build-index.js` hard-codes the
engine file list, so `learn.js` and `quests.js` exist only as empty placeholders.
Each question's `fast` line is shown after an answer ("Remember this"), so keep writing it carefully.

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
- Every `fast` line is shown after an answer, so it must stand alone as a fact worth revising. Keep the sub-topic tag (the first non-page tag) consistent within a chapter.
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

## Deploy (only when the owner asks)

Run `node tools/build-index.js` so the cache version updates. Then make `upload.zip` of the site, **excluding** `source/`, `scripts/`, `CLAUDE.md`, `.git` and `upload.zip` itself, so the owner can upload it to cPanel.
