# Drakkhak redesign — plan

Goal: one job — practise board-level MCQs from the NCTB books and win back mistakes.
Every screen answers "what do I do next?" in three seconds. When in doubt, remove.

## What stays, what goes

**Untouched:** `js/data/q-*.js`, the question schema, `tools/`, the fonts, the service worker
(same network-first design), the warm palette, day/night themes, serif headings, the localStorage
key `iceskep.hsc.v1`.

**Engine kept (trimmed):** ability estimate, done-tracking, the mistake schedule, the study path,
the cautious prediction, the sound effects.

**Deleted, code and all:** placement test, XP and levels, avatars, frames, packs, chests, pets, the
collection, quests, question of the day, duels, blitz/survival/boss/ghost modes, the skip test,
formula/memory cards UI, Learn sheets, "how sure am I", the card lifeline, freezes and repairs,
certificate, progress report, share cards, this week, season, statistics page, days-left charts and
rings, the whole-plan page, hard-prediction switch, daily goal, set difficulty, reminder, name, dream,
pass/goal lines, MCQ target, blueprint editor, exam-date setting, the study clock (minutes are no
longer measured), the Timer/Sound/Night top-bar switches, the old 13-plate research page.

## Files

`tools/build-index.js` hard-codes the engine file list and I may not change it, so every name in that
list must exist. Mapping:

| file | now holds |
|------|-----------|
| `config.js` (new, loaded before the list) | **owner-only**: pass line, goal line, MCQ target, exam blueprint, HSC exam date |
| `store.js` | record, migration, streak, `U` helpers, `L(en,bn)` |
| `i18n.js` | Bangla digits `N()`, language |
| `fx.js` | sounds, verdict flash, confetti, coin flight (all off in calm mode) |
| `ability.js` | question index, ability, done-tracking, mistake bank, marking |
| `plan.js` | completion, questions left, stars, path, next set, pace line |
| `clock.js` | the countdown timer used by questions, the paper and the 60-second challenge |
| `predict.js` | the cautious mark (always 10th percentile) |
| `game.js` | coins, wallet log, power-ups, shop |
| `stats.js` | badges |
| `modes.js` | set builders: continue, scope, mistakes, weak chapters, full paper, 60 s |
| `share.js` | export, restore, erase |
| `charts.js` | logos, bars, small SVG pieces |
| `runner.js` | the question screen and results |
| `ui.js` | shell: routing, tab bar, sidebar, top bar, sheets, toasts |
| `ui-pages.js` | Start, First visit, Practice, Progress, Settings, Wallet |
| `map.js` | the road |
| `research.js` | how it works + honesty note |
| `learn.js`, `quests.js` | **empty placeholders** — features removed, filenames kept only because the tool lists them |

## Saved progress (mig 3)

Kept as they are: answers, per-question items, ability, mistake schedule, log, streak, coins,
theme, sound. Quietly migrated: old 50:50 lifelines → new 50:50 stock; `game.fixed` → mistakes won
back; `game.answered/correct` → lifetime counts; study time per day → nearest of 1/2/3/4 hr (the old
1 hr 59 default becomes 3 hr); interface language → Bangla once (old default was English; English is one
switch away); mock results → best full-paper score; effects/haptics off → calm mode. Dropped:
XP, level, chests, pets, cosmetics, cards, records, quests, duels, season, freezes, time ledger,
predictions history, name, dream, goal, exam date, blueprint edits, timer switch.

## Decisions where the brief was open

- **Mistake bank** = questions whose latest answer was wrong. Answering one right takes it out
  (+2 coins extra) and it returns later as a "যাচাই" (spaced 1/4/12/30 days).
- **Tags:** নতুন never answered · আবার দেখা was wrong last time · যাচাই was right last time.
- **Sets:** 16 questions, unique inside a set; while unseen questions exist ≥13 are new (kept from
  before). Removed the auto-inserted "easier question" after a miss and the set-ending lift question.
- **Timer:** every practice question has the paper's one minute; at zero an alarm beeps once and the
  answer counts as late (right but not "done"). +৩০ সেকেন্ড adds 30 s. No timer switch.
- **Power-ups:** 50:50 removes two wrong options. দ্বিতীয় সুযোগ is armed before answering; it is spent
  only if you miss, then you answer again (the miss is still recorded). +৩০ সেকেন্ড. Not in the full
  paper or the 60-second challenge. New students start with one of each.
- **Coins:** 1 per right, +2 more for winning back a mistake, +5 for finishing a set. Full paper pays
  at the end. Second-chance right pays 1.
- **Full paper:** one paper, n questions, board time (n × seconds-per-question), no marking until the
  end, time-up ends it.
- **Pace line:** days of study left at the chosen daily hours vs days to the exam. No exam date in
  `config.js` → only "finishes in N days at this pace".
- **Prediction:** shown once 20 answers exist; cautious mark out of the whole MCQ half.
- **Logo:** `img/` icons regenerated from the ticked bubble; the old দ্র cards logo is an in-app choice.
- **Badges:** first set, first 100 correct, 500 correct, chapter with 3 stars, a paper finished (every
  question done), full paper finished, full paper ≥ 80 %, 7-day streak, 30-day streak, 50 mistakes won back.

## Build order (one commit per area)

1. plan, zip removed → 2. core (store, config, i18n, ability, plan, predict, game, stats, clock, fx, share)
→ 3. shell (index.html, css, logos, ui.js) → 4. Start, First visit, Settings, Wallet → 5. Practice,
modes, question screen → 6. Map → 7. Progress, research → 8. icons, service worker, README, checks.
