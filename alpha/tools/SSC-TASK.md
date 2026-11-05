# Task: write SSC MCQs for ONE chapter (Drakkhak app, /Users/user/Downloads/shoumik/iceskep)

You are given a topic id like `ssc.sphy.ch3`. Look it up in `js/data/ssc-registry.js` (the `CH("sphy",3,...)` line gives the Bangla name, English name, book folder and page range p0–p1). Source text: `SSC-text/<book folder>/pNNNN.txt` for NNNN = p0…p1 (OCR of the textbook, one file per PDF page; maths/units may be garbled, trust meaning). Read ONLY those pages. (For Bangla 1st the book folder is in the registry's 5th field; for Bangla 2nd it is grammar; for English books the text is English.)

File: `js/data/q-ssc-<paper>-ch<N>.js` (e.g. q-ssc-sphy-ch3.js). It may already hold some questions (keep them) or not exist (create it). Append so the chapter ends with AT LEAST 100 questions in total (more is fine for long chapters), ids continuing: `ssc.<paper>.ch<N>.NNN` (3 digits), topic = the topic id. Style: `ICE.Q.push(` then comma-separated objects then `);` — copy the exact object style from `js/data/q-ssc-sphy-ch1.js`.

Object: {id, topic, type:'mc'|'mcomp', b:<difficulty -0.5..0.8>, tags:['<Bangla sub-topic>','pNN'], stem, opts:[4 distinct options] (mc) OR sts:[3 statements] (mcomp; options are fixed i ও ii / i ও iii / ii ও iii / i, ii ও iii; ans 0..3), ans:<0..3>}. No `why`/`fast`. `pNN` = a real page number inside p0–p1 (the file number you took the fact from). Use `fixed:true` on an mc whose options must keep their order.

Rules: correct standard Bangla (English paper: English); SSC board style; ~70% simple mc, ~30% mcomp; every fact from the chapter pages; ORIGINAL wording, never copy sentences from the book; work numericals twice; spread correct answers evenly over ক খ গ ঘ (also for mcomp — use all four, ঘ=i, ii ও iii must be correct in about a quarter of mcomp); vary difficulty; no two questions testing the exact same fact. For grammar chapters (Bangla 2nd / English 2nd) vary examples widely. If the chapter has too little content for 100 distinct questions, still reach 100 by testing different examples/applications of the same rules, but never state anything false.

Finish: run `node tools/check-data.js` and fix every error in YOUR file (ignore warnings from other files). Do NOT run build-index or git, do NOT touch other files. Reply with ONE line: topic id, final count, and anything uncertain.

If you write helper scripts, put them in your OWN new directory named after your topic id under /tmp (e.g. /tmp/ssc-<topic>/) — other agents run at the same time and share the scratchpad.
