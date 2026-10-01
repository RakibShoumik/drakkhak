# IceSkep HSC — data schema

Every content file is a plain ES5 script that pushes objects onto arrays declared in
`js/data/registry.js`. No modules, no build step, no JSON parsing at runtime.
Load order is fixed in `index.html`: `registry.js` first, then `js/gen/core.js`, then any
content file, in any order.

To add content, drop in a new `js/data/q-hsc-<paper>-ch<N>.js` and run
`node tools/build-index.js`. Nothing else needs to change.

---

## 0. What the app is made of

**Eleven papers**, each a *section*. The keys never change:

| key | paper | MCQ on the paper | source book |
|-----|-------|------------------|-------------|
| `hsc/bangla1` | বাংলা ১ম পত্র | 30 | Bangla 1st + Bangla 1st(Sohopath) |
| `hsc/english1` | ইংরেজি ১ম পত্র | 25 | English 1st |
| `hsc/ict` | তথ্য ও যোগাযোগ প্রযুক্তি | 25 | ICT |
| `hsc/phy1` | পদার্থবিজ্ঞান ১ম পত্র | 25 | Physics 1st |
| `hsc/phy2` | পদার্থবিজ্ঞান ২য় পত্র | 25 | Physics 2nd |
| `hsc/chem1` | রসায়ন ১ম পত্র | 25 | Chemistry 1st |
| `hsc/chem2` | রসায়ন ২য় পত্র | 25 | Chemistry 2nd |
| `hsc/bio1` | জীববিজ্ঞান ১ম পত্র | 25 | Biology 1st |
| `hsc/bio2` | জীববিজ্ঞান ২য় পত্র | 25 | Biology 2nd |
| `hsc/hmath1` | উচ্চতর গণিত ১ম পত্র | 25 | Higher Math 1st |
| `hsc/hmath2` | উচ্চতর গণিত ২য় পত্র | 25 | Higher Math 2nd |

**One hundred and twenty-two chapters**, each a *topic*, one per chapter of the book.
A topic id is `<paper>.ch<N>`, where `N` counts chapters of the paper in study order —
so `phy1.ch3`, `ict.ch1`, `bangla1.ch12`. The two Sohopath chapters are `bangla1.ch25`
and `bangla1.ch26`, because Sohopath is the supplementary reader for Bangla 1st paper.

Every topic carries where it came from, and the checker uses it:

```js
ICE.topics['phy1.ch3']
// { id:'phy1.ch3', sec:'hsc/phy1', n:3, name:'গতিবিদ্যা', w:0.119,
//   note:'Dynamics', book:'Physics 1st', ch:3, p0:136, p1:224 }
```

`p0`–`p1` are **PDF page numbers** in `~/Desktop/HSC/<book>.pdf`. A question may only be
written from pages inside that range, and its `tags` must say which page.

**The clock.** `spq` on a section is the seconds the paper allows one MCQ — 60, because
the board sets 25 questions in 25 minutes. It is set in `js/config.js` (the owner's file), and `ICE.pace(secKey)`
is the only thing that should ever be asked for a question's time.

---

## 1. Questions — `ICE.Q.push({...})`

A board MCQ has **four options**, printed **ক খ গ ঘ**, one mark each, and **no negative
marking**. There are two types, and nothing else.

### `mc` — a simple MCQ

```js
ICE.Q.push({
  id:    'ict.ch3.014',        // unique, stable, never reused. <topic>.<nnn>
  topic: 'ict.ch3',            // MUST be a key of ICE.topics
  type:  'mc',
  b:     0.4,                  // difficulty in z-units, see the table below
  stem:  'দুই বাইটে কতটি বিট থাকে?',
  opts:  ['৮', '১৬', '৩২', '৬৪'],
  ans:   1,                    // index into opts
  why:   ['এক বাইটের হিসাব, দুই বাইটের নয়।',   // one line per option,
          'ঠিক — ১ বাইট = ৮ বিট, তাই ২ বাইট = ১৬ বিট।', //  in option order
          'চার বাইটের হিসাব।',
          'আট বাইটের হিসাব।'],
  fast:  'বাইটকে ৮ দিয়ে গুণ করুন, ব্যস।',
  trick: 'ict.ch3.byte',       // optional; id of a card in ICE.T
  tags:  ['p95','সংখ্যা পদ্ধতি']   // MUST include the PDF page, e.g. p95
});
```

### `mcomp` — multiple completion

Three statements numbered i, ii, iii, then **নিচের কোনটি সঠিক?** The four options are
fixed by the board and printed in this order, so they are **not** in the file and are
**never shuffled**:

| index | option |
|-------|--------|
| 0 | ক. i ও ii |
| 1 | খ. i ও iii |
| 2 | গ. ii ও iii |
| 3 | ঘ. i, ii ও iii |

```js
ICE.Q.push({
  id:'phy1.ch3.021', topic:'phy1.ch3', type:'mcomp', b:0.55,
  stem:'সমত্বরণে চলা একটি বস্তু সম্পর্কে নিচের উক্তিগুলো লক্ষ করো',
  sts:['বেগ-সময় লেখচিত্র একটি সরলরেখা',
       'ত্বরণ-সময় লেখচিত্র সময় অক্ষের সমান্তরাল',
       'সরণ-সময় লেখচিত্রও একটি সরলরেখা'],
  ans:0,                      // ক: i ও ii
  why:['ঠিক — প্রথম দুটি সমত্বরণের সরাসরি ফল।',
       'iii ভুল, তাই এই জোড়টি হয় না।',
       'i বাদ দেওয়া যায় না; সেটিই সমত্বরণের প্রধান লক্ষণ।',
       'iii ভুল: সরণ-সময় লেখচিত্র প্যারাবোলা, সরলরেখা নয়।'],
  fast:'সমত্বরণ মানে বেগ রৈখিক, সরণ প্যারাবোলিক।',
  tags:['p150']
});
```

`ans` is the index of the **combination**, not of a statement. Write `why` for all four
combinations: a wrong line must say *which statement* makes that combination wrong.

### উদ্দীপক — a scenario shared by two questions

Not a type. Push the scenario to `ICE.P` and point two questions at it with `passage:`.
The runner keeps them together and shows the scenario beside both.

```js
ICE.P.push({
  id:'ict.ch3.u01',
  topic:'ict.ch3',                 // the same chapter as its questions
  text:'<p>একটি ডিজিটাল ঘড়ি ঘণ্টার ঘরে ১০১১ ও মিনিটের ঘরে ১১০০১০ দেখাচ্ছে।</p>',
  note:'সংখ্যা রূপান্তর'             // optional, shown beside the label
});
```

Exactly **two** questions per উদ্দীপক. One wastes the scenario; three is not the board's
habit, and the checker warns about both.

### Fields

| field | required | meaning |
|-------|----------|---------|
| `id` | yes | unique across the whole app, starts with the topic id |
| `topic` | yes | a key of `ICE.topics` |
| `type` | yes | `mc` or `mcomp` |
| `b` | yes | difficulty in z-units, see the table |
| `stem` | yes | HTML allowed: `<b> <i> <sup> <sub> <br> <table class="qtbl">`, and `<span class="ov">x</span>` for a Boolean complement (x̄) |
| `opts` | for `mc` | exactly four strings |
| `sts` | for `mcomp` | exactly three statements |
| `ans` | yes | index 0–3 |
| `why` | yes | four lines, in option order |
| `fast` | yes | the quick route, or what to remember. One or two sentences |
| `trick` | no | links the question to a card in `ICE.T` |
| `passage` | no | id of an উদ্দীপক in `ICE.P` |
| `tags` | yes in practice | free strings; **must include the PDF page** as `p<N>` |
| `tsec` | no | override the seconds for this one item |
| `fixed` | no | `true` stops the options being shuffled |

### Difficulty `b`, in z-units

`b` is the ability, in standard deviations above the average candidate, at which you have
an even chance on that item. It is the single number the predicted mark rests on.

| `b` | who gets it |
|-----|-------------|
| −1.5 | almost everyone; a definition read once |
| −0.8 | a warm-up |
| −0.3 | routine board level |
| 0.0 | the average candidate's coin flip |
| +0.5 | solid; two steps, or a fact from a corner of the chapter |
| +1.0 | good; a distractor that is nearly right |
| +1.5 | strong; what separates A+ from Golden A+ |
| +2.0 | the hardest thing a board paper sets |

Aim for a spread: roughly 20 % below −0.5, 45 % between −0.5 and +0.7, 35 % above +0.7.
An easy-only bank inflates the predicted mark, which is the one thing this app must
never do.

### Option order

`mc` options are **shuffled every time a question is shown**, so the key is never
predictable by position. Two things keep their printed order: `mcomp` (its four
combinations are fixed by the board) and anything whose options only make sense in order
— `উপরের সবগুলো`, `কোনোটিই নয়`, or options that themselves start `i`/`ii`/`iii`.
`ICE.shuffleable()` spots those; mark anything else that must not move with `fixed:true`.

### Rules that are not negotiable

1. **The key must be right.** Solve it twice, by two routes. Numericals twice, on paper.
2. **Every fact must be on the pages `p0`–`p1` of that chapter**, and `tags` must name the
   page. The checker fails a page outside the chapter.
3. **Write original questions.** Never copy a sentence or a paragraph out of the book into
   a stem, an option or a `why`. Use the book's *terms*, not its sentences.
4. `why` must name *each wrong option's specific error*, not repeat the correct reasoning.
   A distractor exists because of a particular mistake — say which.
5. Keep `why` lines to one or two sentences. This app never shows a lecture after a miss.
6. Correct standard Bangla, and the same terms the book uses. English only in the English
   1st paper — the checker warns about a Bangla stem full of Latin words.
7. Numbers in the stem must be self-consistent and the answer must be among the options.
8. HTML entities rather than raw Unicode maths symbols: `&times; &divide; &minus; &radic;
   &pi; &le; &ge; &ne; &deg;`. Superscripts as `<sup>2</sup>`, subscripts as `<sub>2</sub>`.
9. No apostrophe-breaking: the file is JavaScript. Use `'...'` and escape inner
   apostrophes as `\'`, or use double quotes for such strings.

---

## 2. Formula and memory cards — `ICE.T.push({...})`

> The redesigned app has no screen for cards yet. The schema stays so they can come back when
> cards exist; nothing in the bank needs to change.

One card is one thing worth carrying into the exam hall: a formula, a unit, a date, a
definition the board keeps asking for. They are per chapter, and a card counts as read
only once it has actually been on screen for a couple of seconds.

```js
ICE.T.push({
  id:'phy1.ch3.eqm',
  topic:'phy1.ch3',                 // a key of ICE.topics
  also:['hmath2.ch9'],              // optional: other chapters it belongs to
  name:'গতির সমীকরণ তিনটি, একসাথে',
  one:'v = u + at, s = ut + ½at², v² = u² + 2as — সময়, সরণ, বেগ।',
  lines:[
    'যেটিতে খোঁজা রাশি আছে আর দেওয়া রাশিগুলোও আছে, সেই সমীকরণটিই নিন।',
    'সময় দেওয়া না থাকলে তৃতীয়টি (v² = u² + 2as) সবচেয়ে ছোট পথ।',
    'সবগুলোতেই ত্বরণ ধ্রুব — পরিবর্তনশীল ত্বরণে এগুলো চলে না।'
  ],
  ex:{ q:'স্থির অবস্থা থেকে ২ m/s² ত্বরণে ৫ সেকেন্ডে বেগ?', a:'v = 0 + 2×5 = 10 m/s' },
  saves:20,                         // seconds it typically saves, honest estimate
  drill:['phy1.ch3.014','phy1.ch3.021']   // optional: question ids that use it
});
```

`lines` should be 2–5 items, each recallable mid-question rather than a paragraph of
theory. `one` is required and is what the app shows as a lifeline.

---

## 3. Generators — `js/gen/*.js`

A generator is a question with its numbers left out. It draws parameters from a seeded
stream, **computes** the answer, and builds each wrong option from a named mistake. Read
`js/gen/core.js` for the API.

```js
GEN.add({
  id:'hmath1.ch9.chain',    // MUST start with the topic id. Variants become .00 .01 …
  topic:'hmath1.ch9',
  n:24,                     // variants shipped into the bank
  trick:'hmath1.ch9.chain', // a real card id
  make:function(r, k, n){
    var tier = r.tier(k, n);          // 'warm' ~10%, 'exam' ~45%, 'hard' ~45%
    ...
    return {
      type:'mc',                      // or 'mcomp'
      b: tier==='warm' ? -0.6 : tier==='exam' ? 0.2 : 0.9,
      stem:'…',
      correct:{t:'৬x²', why:'কেন এটিই ঠিক, সংখ্যাসহ'},
      wrong:[                          // list 5+; the first 3 distinct ones are used
        {t:'৩x²', why:'যে নির্দিষ্ট ভুল এই মানটি দেয়'},
        …
      ],
      fast:'এই সংখ্যাগুলো দিয়ে দ্রুততম পথ',
      p:{ …parameters verify() needs… }
    };
  },
  verify:function(q){ /* recompute the key a different way; return true/false */ }
});
```

**`r` — the seeded stream:** `int(lo,hi)`, `intNot(lo,hi,[excluded])`, `pick(arr)`,
`chance(p)`, `sign()`, `shuffle(arr)`, `sample(arr,k)`, `tier(k,n)`.

**`GEN.F` — formatting:** `n(x,dp)`, `money(x,'Tk',dp)`, `pct(x,dp)`, `frac(n,d)` reduced,
`root(x)` simplified radical, `pow(b,e)`, `gcd`, `lcm`, `list([..])`, `ordinal(n)`,
`plain(html)`. Also `GEN.NAMES`, `GEN.numOf(text)`, `GEN.same(a,b)`.

**Return shapes**

| type | return |
|------|--------|
| `mc` | `correct`, `wrong[]` — core picks 3 distinct wrong values and shuffles all four |
| `mcomp` | `sts[3]`, `ans` 0–3, `why[4]` |

**Rules**

1. The answer is computed, never typed. `verify()` recomputes it by a different route —
   brute force where possible — and `node tools/check-data.js` runs it on every variant.
   A template without `verify` is not finished.
2. Difficulty: about 10 % warm-up, 45 % at board level, 45 % **harder than** the board.
   Harder means more steps, uglier numbers, a subtler trap — not longer wording.
3. Vary the wording. A template whose twenty variants read identically is twenty copies of
   one question. Use two to four stem phrasings.
4. No diagrams exist. Describe every figure completely in words.
5. Keep `make` fast: the whole bank expands at start-up.
6. `GEN.alias(newId, topic, srcId, opts)` reuses another family's `make` and `verify` with
   its own seed, for a topic two papers share (vectors in Physics 1st and Higher Math 1st,
   trigonometry across both Higher Math papers).

### `js/gen/spare/`

The maths families written for the IBA/GRE edition live there. They are **not loaded** by
`index.html` and a template whose topic does not exist is *parked* rather than shipped, so
they cannot leak questions into the bank. They are kept to be adapted for Higher Math and
Physics numericals: copy one up into `js/gen/`, change its `id` and `topic` to a real
chapter, rewrite the stem in Bangla, and `verify()` will keep it honest.

---

## 4. The file for one chapter

```
js/data/q-hsc-<paper>-ch<N>.js
```

e.g. `q-hsc-phy1-ch3.js`, `q-hsc-ict-ch1.js`, `q-hsc-bangla1-ch25.js`.
About 50 questions — 40 for a short chapter, up to 80 for a long one. Mix: about 60 %
simple, 20 % multiple-completion, 20 % উদ্দীপক pairs.

Then:

```
node tools/check-data.js      # fails on a bad key, a duplicate id, a page outside the
                              # chapter, a wrong option count, a broken generator key
node tools/build-index.js     # adds the file to index.html and bumps the cache
```

The checker's warnings are worth reading even when they do not fail the run: a missing page
tag, a `why` line with nothing in it, an উদ্দীপক used once, a bank that is 30 % warm-ups.


## The Learn sheet (retired)

The redesigned app has no Learn sheets. `fast` is still shown after an answer ("Remember this"), so
write it so it stands alone (a fact worth remembering). The sub-topic tag (`tags[1]`) is no longer
used by the app; keeping it consistent costs nothing and keeps the option open.
