/* ===========================================================
   CONFIG — the owner's settings. Students never see or change these.

   Edit this file, nothing else, to move the lines and the exam.
   Loaded before everything else (see index.html).
   =========================================================== */
var CONFIG = {
  /* the two score lines drawn on the 0–100 score */
  passLine: 70,
  goalLine: 85,

  /* the share of the MCQ half (per cent) a student is aiming at */
  mcqTarget: 88,

  /* the HSC exam date, 'YYYY-MM-DD'. Empty = no countdown is shown. */
  examDate: '',

  /* the WoWonder community this site sits inside (the "Drakkhak + Study"
     theme links here from its top bar). A button back to it appears in
     this site's top bar.
       'auto' : shown only when the site is opened from a /study/ folder,
                linking to the site root (the community)
       ''     : no button
       a URL  : always shown, linking there                             */
  communityUrl: 'auto',

  /* the exam blueprint: MCQ on each real paper (n) and the seconds the
     board allows one question (spq: 25 questions in 25 minutes = 60).
     A full paper in the app runs on exactly these two numbers. */
  blueprint: {
    'hsc/bangla1' : {n:30, spq:60},
    'hsc/english1': {n:25, spq:60},
    'hsc/ict'     : {n:25, spq:60},
    'hsc/phy1'    : {n:25, spq:60},
    'hsc/phy2'    : {n:25, spq:60},
    'hsc/chem1'   : {n:25, spq:60},
    'hsc/chem2'   : {n:25, spq:60},
    'hsc/bio1'    : {n:25, spq:60},
    'hsc/bio2'    : {n:25, spq:60},
    'hsc/hmath1'  : {n:25, spq:60},
    'hsc/hmath2'  : {n:25, spq:60}
  }
};
