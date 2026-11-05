/* ===========================================================
   DRAKKHAK HSC — REGISTRY
   The contract every other file obeys.

   One track: HSC (Bangladesh, Bangla medium). Each of the eleven
   papers is a section; each chapter of that paper's NCTB textbook
   is a topic. A topic id is the unit of everything downstream —
   questions carry it, the clock bills minutes to it, ability is
   estimated per topic, and the predicted MCQ mark weights it by its
   share of the paper.

   Board MCQ are four options, ক খ গ ঘ, one mark each, and there is
   no negative marking. The paper allows one minute a question; that
   figure lives in the blueprint below and is editable in Settings,
   because a blueprint that quietly goes stale is worse than none.
   =========================================================== */
var ICE = {
  meta:{ name:'Drakkhak', edition:'HSC', version:'3.0' },
  Q:[],        /* questions            */
  P:[],        /* উদ্দীপক stimuli      */
  T:[]         /* formula / memory cards */
};

/* ---------- the one track ---------- */
ICE.tracks = {
  hsc:{
    id:'hsc', name:'এইচএসসি', full:'উচ্চ মাধ্যমিক সার্টিফিকেট পরীক্ষা — বহুনির্বাচনি',
    mark:'HSC', blurb:'প্রতি পত্রে ২৫টি বহুনির্বাচনি, ২৫ মিনিট, চারটি অপশন, ঋণাত্মক নম্বর নেই।',
    scoring:{ kind:'mcq' }
  }
};

/* ---------- sections: the eleven papers ----------
   n   : MCQ on the real paper
   spq : seconds the paper allows per MCQ (one minute, by the board's
         own arithmetic: 25 questions in 25 minutes)
   book: the folder under source/ the questions are written from      */
ICE.sections = {
  'hsc/bangla1'   : {track:'hsc', id:'bangla1',   name:'বাংলা ১ম পত্র', en:'Bangla 1st Paper', subj:'bangla', n:30, spq:60, order:1, book:'Bangla 1st'},
  'hsc/english1'  : {track:'hsc', id:'english1',  name:'ইংরেজি ১ম পত্র', en:'English 1st Paper', subj:'english', n:25, spq:60, order:2, book:'English 1st'},
  'hsc/ict'       : {track:'hsc', id:'ict',       name:'তথ্য ও যোগাযোগ প্রযুক্তি', en:'ICT', subj:'ict', n:25, spq:60, order:3, book:'ICT'},
  'hsc/phy1'      : {track:'hsc', id:'phy1',      name:'পদার্থবিজ্ঞান ১ম পত্র', en:'Physics 1st Paper', subj:'phy', n:25, spq:60, order:4, book:'Physics 1st'},
  'hsc/phy2'      : {track:'hsc', id:'phy2',      name:'পদার্থবিজ্ঞান ২য় পত্র', en:'Physics 2nd Paper', subj:'phy', n:25, spq:60, order:5, book:'Physics 2nd'},
  'hsc/chem1'     : {track:'hsc', id:'chem1',     name:'রসায়ন ১ম পত্র', en:'Chemistry 1st Paper', subj:'chem', n:25, spq:60, order:6, book:'Chemistry 1st'},
  'hsc/chem2'     : {track:'hsc', id:'chem2',     name:'রসায়ন ২য় পত্র', en:'Chemistry 2nd Paper', subj:'chem', n:25, spq:60, order:7, book:'Chemistry 2nd'},
  'hsc/bio1'      : {track:'hsc', id:'bio1',      name:'জীববিজ্ঞান ১ম পত্র', en:'Biology 1st Paper', subj:'bio', n:25, spq:60, order:8, book:'Biology 1st'},
  'hsc/bio2'      : {track:'hsc', id:'bio2',      name:'জীববিজ্ঞান ২য় পত্র', en:'Biology 2nd Paper', subj:'bio', n:25, spq:60, order:9, book:'Biology 2nd'},
  'hsc/hmath1'    : {track:'hsc', id:'hmath1',    name:'উচ্চতর গণিত ১ম পত্র', en:'Higher Math 1st Paper', subj:'hmath', n:25, spq:60, order:10, book:'Higher Math 1st'},
  'hsc/hmath2'    : {track:'hsc', id:'hmath2',    name:'উচ্চতর গণিত ২য় পত্র', en:'Higher Math 2nd Paper', subj:'hmath', n:25, spq:60, order:11, book:'Higher Math 2nd'}
};

/* ---------- topics: one per chapter ----------
   w  : share of that paper's MCQ (normalised inside the paper; taken
        from the chapter's share of the book's pages)
   ch : the chapter number in its own book
   p0/p1 : the PDF page range, so a question-writing session knows
        exactly which pages it may use                                */
ICE.topics = {};
function CH(id, sec, n, name, w, en, book, ch, p0, p1){
  ICE.topics[id] = {id:id, sec:sec, track:'hsc', n:n, name:name, w:w,
                    note:en, book:book, ch:ch, p0:p0, p1:p1};
}

/* ---- বাংলা ১ম পত্র  (Bangla 1st + Bangla 1st(Sohopath)) ---- */
CH('bangla1.ch1', 'hsc/bangla1', 1,   'বাঙ্গালার নব্য লেখকদিগের প্রতি নিবেদন', 0.013,  'An Appeal to Bengal\'s New Writers (Bankim Chandra)', 'Bangla 1st', 1, 4, 7);
CH('bangla1.ch2', 'hsc/bangla1', 2,   'অপরিচিতা', 0.045,  'The Unknown Woman (Tagore)', 'Bangla 1st', 2, 8, 21);
CH('bangla1.ch3', 'hsc/bangla1', 3,   'সাহিত্যে খেলা', 0.023,  'Play in Literature (Pramatha Chowdhury)', 'Bangla 1st', 3, 22, 28);
CH('bangla1.ch4', 'hsc/bangla1', 4,   'বিলাসী', 0.045,  'Bilashi (Sarat Chandra)', 'Bangla 1st', 4, 29, 42);
CH('bangla1.ch5', 'hsc/bangla1', 5,   'অর্ধাঙ্গী', 0.029,  'The Better Half (Rokeya Sakhawat Hossain)', 'Bangla 1st', 5, 43, 51);
CH('bangla1.ch6', 'hsc/bangla1', 6,   'যৌবনের গান', 0.023,  'Song of Youth (Kazi Nazrul Islam)', 'Bangla 1st', 6, 52, 58);
CH('bangla1.ch7', 'hsc/bangla1', 7,   'জীবন ও বৃক্ষ', 0.013,  'Life and the Tree (Motahar Hossain Chowdhury)', 'Bangla 1st', 7, 59, 62);
CH('bangla1.ch8', 'hsc/bangla1', 8,   'গন্তব্য কাবুল', 0.032,  'Destination Kabul (Syed Mujtaba Ali)', 'Bangla 1st', 8, 63, 72);
CH('bangla1.ch9', 'hsc/bangla1', 9,   'মাসি-পিসি', 0.026,  'Masi-Pisi (Manik Bandyopadhyay)', 'Bangla 1st', 9, 73, 80);
CH('bangla1.ch10', 'hsc/bangla1', 10,  'কপিলদাস মুর্মুর শেষ কাজ', 0.032,  'Kapildas Murmu\'s Last Work (Shawkat Ali)', 'Bangla 1st', 10, 81, 90);
CH('bangla1.ch11', 'hsc/bangla1', 11,  'নেকলেস', 0.029,  'The Necklace (Guy de Maupassant)', 'Bangla 1st', 11, 91, 99);
CH('bangla1.ch12', 'hsc/bangla1', 12,  'রেইনকোট', 0.032,  'Raincoat (Akhtaruzzaman Elias)', 'Bangla 1st', 12, 100, 109);
CH('bangla1.ch13', 'hsc/bangla1', 13,  'ঋতু বর্ণন', 0.013,  'Description of the Seasons (Alaol)', 'Bangla 1st', 13, 110, 113);
CH('bangla1.ch14', 'hsc/bangla1', 14,  'বিভীষণের প্রতি মেঘনাদ', 0.023,  'Meghnad to Bibhishan (Michael Madhusudan Dutt)', 'Bangla 1st', 14, 114, 120);
CH('bangla1.ch15', 'hsc/bangla1', 15,  'সোনার তরী', 0.016,  'The Golden Boat (Tagore)', 'Bangla 1st', 15, 121, 125);
CH('bangla1.ch16', 'hsc/bangla1', 16,  'বিদ্রোহী', 0.019,  'The Rebel (Kazi Nazrul Islam)', 'Bangla 1st', 16, 126, 131);
CH('bangla1.ch17', 'hsc/bangla1', 17,  'সুচেতনা', 0.013,  'Suchetana (Jibanananda Das)', 'Bangla 1st', 17, 132, 135);
CH('bangla1.ch18', 'hsc/bangla1', 18,  'প্রতিদান', 0.01,   'The Reward (Jasimuddin)', 'Bangla 1st', 18, 136, 138);
CH('bangla1.ch19', 'hsc/bangla1', 19,  'তাহারেই পড়ে মনে', 0.016,  'I Remember Her (Sufia Kamal)', 'Bangla 1st', 19, 139, 143);
CH('bangla1.ch20', 'hsc/bangla1', 20,  'পদ্মা', 0.01,   'The Padma (Farrukh Ahmad)', 'Bangla 1st', 20, 144, 146);
CH('bangla1.ch21', 'hsc/bangla1', 21,  'আঠারো বছর বয়স', 0.013,  'At Eighteen Years of Age (Sukanta Bhattacharya)', 'Bangla 1st', 21, 147, 150);
CH('bangla1.ch22', 'hsc/bangla1', 22,  'ফেব্রুয়ারি ১৯৬৯', 0.013,  'February 1969 (Shamsur Rahman)', 'Bangla 1st', 22, 151, 154);
CH('bangla1.ch23', 'hsc/bangla1', 23,  'আমি কিংবদন্তির কথা বলছি', 0.019,  'I Speak of Legend (Abu Jafar Obaidullah)', 'Bangla 1st', 23, 155, 160);
CH('bangla1.ch24', 'hsc/bangla1', 24,  'প্রত্যাবর্তনের লজ্জা', 0.013,  'The Shame of Return (Al Mahmud)', 'Bangla 1st', 24, 161, 164);
CH('bangla1.ch25', 'hsc/bangla1', 25,  'সহপাঠ — উপন্যাস: লালসালু (সৈয়দ ওয়ালীউল্লাহ্‌)', 0.278,  'Novel: Lalsalu (Syed Waliullah)', 'Bangla 1st(Sohopath)', 1, 6, 91);
CH('bangla1.ch26', 'hsc/bangla1', 26,  'সহপাঠ — নাটক: সিরাজউদ্দৌলা (সিকান্দার আবু জাফর)', 0.201,  'Play: Sirajuddaula (Sikandar Abu Jafar)', 'Bangla 1st(Sohopath)', 2, 92, 153);

/* ---- ইংরেজি ১ম পত্র  (English 1st) ---- */
CH('english1.ch1', 'hsc/english1', 1,  'Unit One: Education and Life', 0.105, 'শিক্ষা ও জীবন', 'English 1st', 1, 7, 35);
CH('english1.ch2', 'hsc/english1', 2,  'Unit Two: Art and Craft', 0.047, 'শিল্প ও কারুশিল্প', 'English 1st', 2, 36, 48);
CH('english1.ch3', 'hsc/english1', 3,  'Unit Three: Myths and Literature', 0.051, 'পুরাণ ও সাহিত্য', 'English 1st', 3, 49, 62);
CH('english1.ch4', 'hsc/english1', 4,  'Unit Four: History', 0.087, 'ইতিহাস', 'English 1st', 4, 63, 86);
CH('english1.ch5', 'hsc/english1', 5,  'Unit Five: Human Rights', 0.054, 'মানবাধিকার', 'English 1st', 5, 87, 101);
CH('english1.ch6', 'hsc/english1', 6,  'Unit Six: Dreams', 0.036, 'স্বপ্ন', 'English 1st', 6, 102, 111);
CH('english1.ch7', 'hsc/english1', 7,  'Unit Seven: Youthful Achievers', 0.043, 'তরুণ কৃতী ব্যক্তিত্ব', 'English 1st', 7, 112, 123);
CH('english1.ch8', 'hsc/english1', 8,  'Unit Eight: Relationships', 0.076, 'সম্পর্ক', 'English 1st', 8, 124, 144);
CH('english1.ch9', 'hsc/english1', 9,  'Unit Nine: Adolescence', 0.087, 'কৈশোর', 'English 1st', 9, 145, 168);
CH('english1.ch10', 'hsc/english1', 10, 'Unit Ten: Lifestyle', 0.079, 'জীবনধারা', 'English 1st', 10, 169, 190);
CH('english1.ch11', 'hsc/english1', 11, 'Unit Eleven: Peace and Conflict', 0.09,  'শান্তি ও সংঘাত', 'English 1st', 11, 191, 215);
CH('english1.ch12', 'hsc/english1', 12, 'Unit Twelve: Environment and Nature', 0.079, 'পরিবেশ ও প্রকৃতি', 'English 1st', 12, 216, 237);
CH('english1.ch13', 'hsc/english1', 13, 'Reading for Pleasure: Short Stories', 0.094, 'আনন্দ পাঠ: ছোটগল্প', 'English 1st', 13, 239, 264);
CH('english1.ch14', 'hsc/english1', 14, 'Reading for Pleasure: Poems', 0.022, 'আনন্দ পাঠ: কবিতা', 'English 1st', 14, 265, 270);
CH('english1.ch15', 'hsc/english1', 15, 'Reading for Pleasure: Drama', 0.051, 'আনন্দ পাঠ: নাটক', 'English 1st', 15, 271, 284);

/* ---- তথ্য ও যোগাযোগ প্রযুক্তি  (ICT) ---- */
CH('ict.ch1', 'hsc/ict', 1,   'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত', 0.186,  'ICT: World and Bangladesh Perspective', 'ICT', 1, 6, 46);
CH('ict.ch2', 'hsc/ict', 2,   'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং', 0.164,  'Communication Systems and Networking', 'ICT', 2, 47, 82);
CH('ict.ch3', 'hsc/ict', 3,   'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', 0.164,  'Number Systems and Digital Devices', 'ICT', 3, 83, 118);
CH('ict.ch4', 'hsc/ict', 4,   'ওয়েব ডিজাইন পরিচিতি এবং HTML', 0.155,  'Introduction to Web Design and HTML', 'ICT', 4, 119, 152);
CH('ict.ch5', 'hsc/ict', 5,   'প্রোগ্রামিং ভাষা', 0.214,  'Programming Language', 'ICT', 5, 153, 199);
CH('ict.ch6', 'hsc/ict', 6,   'ডেটাবেজ ম্যানেজমেন্ট সিস্টেম', 0.118,  'Database Management System', 'ICT', 6, 200, 225);

/* ---- পদার্থবিজ্ঞান ১ম পত্র  (Physics 1st) ---- */
CH('phy1.ch1', 'hsc/phy1', 1,   'ভৌতজগৎ ও পরিমাপ', 0.061,  'Physical World and Measurement', 'Physics 1st', 1, 9, 53);
CH('phy1.ch2', 'hsc/phy1', 2,   'ভেক্টর', 0.111,  'Vector', 'Physics 1st', 2, 54, 135);
CH('phy1.ch3', 'hsc/phy1', 3,   'গতিবিদ্যা', 0.12,   'Dynamics', 'Physics 1st', 3, 136, 224);
CH('phy1.ch4', 'hsc/phy1', 4,   'নিউটনীয় বলবিদ্যা', 0.136,  'Newtonian Mechanics', 'Physics 1st', 4, 225, 325);
CH('phy1.ch5', 'hsc/phy1', 5,   'কাজ, শক্তি ও ক্ষমতা', 0.092,  'Work, Energy and Power', 'Physics 1st', 5, 326, 393);
CH('phy1.ch6', 'hsc/phy1', 6,   'মহাকর্ষ ও অভিকর্ষ', 0.085,  'Gravitation and Gravity', 'Physics 1st', 6, 394, 456);
CH('phy1.ch7', 'hsc/phy1', 7,   'পদার্থের গাঠনিক ধর্ম', 0.104,  'Structural Properties of Matter', 'Physics 1st', 7, 457, 533);
CH('phy1.ch8', 'hsc/phy1', 8,   'পর্যায়বৃত্তিক গতি', 0.085,  'Periodic Motion', 'Physics 1st', 8, 534, 596);
CH('phy1.ch9', 'hsc/phy1', 9,   'তরঙ্গ', 0.111,  'Waves', 'Physics 1st', 9, 597, 678);
CH('phy1.ch10', 'hsc/phy1', 10,  'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', 0.097,  'Ideal Gas and Kinetic Theory of Gases', 'Physics 1st', 10, 679, 750);

/* ---- পদার্থবিজ্ঞান ২য় পত্র  (Physics 2nd) ---- */
CH('phy2.ch1', 'hsc/phy2', 1,   'তাপগতিবিদ্যা', 0.091,  'Thermodynamics', 'Physics 2nd', 1, 11, 43);
CH('phy2.ch2', 'hsc/phy2', 2,   'স্থির তড়িৎ', 0.116,  'Static Electricity', 'Physics 2nd', 2, 44, 85);
CH('phy2.ch3', 'hsc/phy2', 3,   'চল তড়িৎ', 0.107,  'Current Electricity', 'Physics 2nd', 3, 86, 124);
CH('phy2.ch4', 'hsc/phy2', 4,   'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব', 0.105,  'Magnetic Effect of Current & Magnetism', 'Physics 2nd', 4, 125, 162);
CH('phy2.ch5', 'hsc/phy2', 5,   'তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ', 0.066,  'Electromagnetic Induction & Alternating Current', 'Physics 2nd', 5, 163, 186);
CH('phy2.ch6', 'hsc/phy2', 6,   'জ্যামিতিক আলোকবিজ্ঞান', 0.091,  'Geometrical Optics', 'Physics 2nd', 6, 187, 219);
CH('phy2.ch7', 'hsc/phy2', 7,   'ভৌত আলোকবিজ্ঞান', 0.061,  'Physical Optics', 'Physics 2nd', 7, 220, 241);
CH('phy2.ch8', 'hsc/phy2', 8,   'আধুনিক পদার্থবিজ্ঞানের সূচনা', 0.118,  'Beginning of Modern Physics (Relativity)', 'Physics 2nd', 8, 242, 284);
CH('phy2.ch9', 'hsc/phy2', 9,   'পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান', 0.077,  'Atomic Model & Nuclear Physics', 'Physics 2nd', 9, 285, 312);
CH('phy2.ch10', 'hsc/phy2', 10,  'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স', 0.127,  'Semiconductor & Electronics', 'Physics 2nd', 10, 313, 358);
CH('phy2.ch11', 'hsc/phy2', 11,  'জ্যোতির্বিজ্ঞান', 0.041,  'Astronomy', 'Physics 2nd', 11, 359, 373);

/* ---- রসায়ন ১ম পত্র  (Chemistry 1st) ---- */
CH('chem1.ch1', 'hsc/chem1', 1,   'ল্যাবরেটরির নিরাপদ ব্যবহার', 0.109,  'Safe Use of Laboratory', 'Chemistry 1st', 1, 3, 74);
CH('chem1.ch2', 'hsc/chem1', 2,   'গুণগত রসায়ন', 0.263,  'Qualitative Chemistry', 'Chemistry 1st', 2, 75, 248);
CH('chem1.ch3', 'hsc/chem1', 3,   'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', 0.266,  'Periodic Properties of Elements and Chemical Bonding', 'Chemistry 1st', 3, 249, 424);
CH('chem1.ch4', 'hsc/chem1', 4,   'রাসায়নিক পরিবর্তন', 0.245,  'Chemical Change', 'Chemistry 1st', 4, 425, 586);
CH('chem1.ch5', 'hsc/chem1', 5,   'কর্মমুখী রসায়ন', 0.118,  'Application Oriented Chemistry', 'Chemistry 1st', 5, 587, 664);

/* ---- রসায়ন ২য় পত্র  (Chemistry 2nd) ---- */
CH('chem2.ch1', 'hsc/chem2', 1,   'পরিবেশ রসায়ন', 0.238,  'Environmental Chemistry', 'Chemistry 2nd', 1, 1, 170);
CH('chem2.ch2', 'hsc/chem2', 2,   'জৈব রসায়ন', 0.322,  'Organic Chemistry', 'Chemistry 2nd', 2, 171, 400);
CH('chem2.ch3', 'hsc/chem2', 3,   'রাসায়নিক গণনা', 0.157,  'Quantitative Chemistry (Chemical Calculations)', 'Chemistry 2nd', 3, 401, 512);
CH('chem2.ch4', 'hsc/chem2', 4,   'তড়িৎ রসায়ন', 0.168,  'Electrochemistry', 'Chemistry 2nd', 4, 513, 632);
CH('chem2.ch5', 'hsc/chem2', 5,   'অর্থনৈতিক রসায়ন', 0.115,  'Economic Chemistry', 'Chemistry 2nd', 5, 633, 714);

/* ---- জীববিজ্ঞান ১ম পত্র  (Biology 1st) ---- */
CH('bio1.ch1', 'hsc/bio1', 1,   'কোষ ও এর গঠন', 0.164,  'Cell and its structure', 'Biology 1st', 1, 31, 100);
CH('bio1.ch2', 'hsc/bio1', 2,   'কোষ বিভাজন', 0.054,  'Cell division', 'Biology 1st', 2, 101, 123);
CH('bio1.ch3', 'hsc/bio1', 3,   'কোষ রসায়ন', 0.093,  'Cell chemistry', 'Biology 1st', 3, 124, 163);
CH('bio1.ch4', 'hsc/bio1', 4,   'অণুজীব', 0.105,  'Micro-organisms', 'Biology 1st', 4, 164, 208);
CH('bio1.ch5', 'hsc/bio1', 5,   'শৈবাল ও ছত্রাক', 0.072,  'Algae and fungi', 'Biology 1st', 5, 209, 239);
CH('bio1.ch6', 'hsc/bio1', 6,   'ব্রায়োফাইটা ও টেরিডোফাইটা', 0.03,   'Bryophyta and Pteridophyta', 'Biology 1st', 6, 240, 252);
CH('bio1.ch7', 'hsc/bio1', 7,   'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ', 0.07,   'Gymnosperms and angiosperms', 'Biology 1st', 7, 253, 282);
CH('bio1.ch8', 'hsc/bio1', 8,   'টিস্যু ও টিস্যুতন্ত্র', 0.047,  'Tissue and tissue system', 'Biology 1st', 8, 283, 302);
CH('bio1.ch9', 'hsc/bio1', 9,   'উদ্ভিদ শারীরতত্ত্ব', 0.124,  'Plant physiology', 'Biology 1st', 9, 303, 355);
CH('bio1.ch10', 'hsc/bio1', 10,  'উদ্ভিদ প্রজনন', 0.044,  'Plant reproduction', 'Biology 1st', 10, 356, 374);
CH('bio1.ch11', 'hsc/bio1', 11,  'জীবপ্রযুক্তি', 0.079,  'Biotechnology', 'Biology 1st', 11, 375, 408);
CH('bio1.ch12', 'hsc/bio1', 12,  'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ', 0.117,  'Environment, distribution and conservation of organisms', 'Biology 1st', 12, 409, 458);

/* ---- জীববিজ্ঞান ২য় পত্র  (Biology 2nd) ---- */
CH('bio2.ch1', 'hsc/bio2', 1,   'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', 0.122,  'Animal Diversity & Classification', 'Biology 2nd', 1, 3, 48);
CH('bio2.ch2', 'hsc/bio2', 2,   'প্রাণীর পরিচিতি', 0.16,   'Introduction to Animals', 'Biology 2nd', 2, 49, 108);
CH('bio2.ch3', 'hsc/bio2', 3,   'মানব শারীরতত্ত্ব: পরিপাক ও শোষণ', 0.074,  'Human Physiology: Digestion & Absorption', 'Biology 2nd', 3, 109, 136);
CH('bio2.ch4', 'hsc/bio2', 4,   'মানব শারীরতত্ত্ব: রক্ত ও সংবহন', 0.08,   'Human Physiology: Blood & Circulation', 'Biology 2nd', 4, 137, 166);
CH('bio2.ch5', 'hsc/bio2', 5,   'মানব শারীরতন্ত্র: শ্বসন ও শ্বাসক্রিয়া', 0.048,  'Human Physiology: Respiration & Breathing', 'Biology 2nd', 5, 167, 184);
CH('bio2.ch6', 'hsc/bio2', 6,   'মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন', 0.043,  'Human Physiology: Waste & Excretion', 'Biology 2nd', 6, 185, 200);
CH('bio2.ch7', 'hsc/bio2', 7,   'মানব শারীরতন্ত্র: চলন ও অঙ্গচালনা', 0.082,  'Human Physiology: Locomotion & Organ Movement', 'Biology 2nd', 7, 201, 231);
CH('bio2.ch8', 'hsc/bio2', 8,   'মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ', 0.082,  'Human Physiology: Coordination & Control', 'Biology 2nd', 8, 232, 262);
CH('bio2.ch9', 'hsc/bio2', 9,   'মানব জীবনের ধারাবাহিকতা', 0.09,   'Continuity of Human Life', 'Biology 2nd', 9, 263, 296);
CH('bio2.ch10', 'hsc/bio2', 10,  'মানবদেহের প্রতিরক্ষা (ইমিউনিটি)', 0.053,  'Immunity of Human Body', 'Biology 2nd', 10, 297, 316);
CH('bio2.ch11', 'hsc/bio2', 11,  'জিনতত্ত্ব ও বিবর্তন', 0.109,  'Genetics & Evolution', 'Biology 2nd', 11, 317, 357);
CH('bio2.ch12', 'hsc/bio2', 12,  'প্রাণীর আচরণ', 0.056,  'Animal Behaviour', 'Biology 2nd', 12, 358, 378);

/* ---- উচ্চতর গণিত ১ম পত্র  (Higher Math 1st) ---- */
CH('hmath1.ch1', 'hsc/hmath1', 1,   'ম্যাট্রিক্স ও নির্ণায়ক', 0.071,  'Matrices and Determinants', 'Higher Math 1st', 1, 10, 31);
CH('hmath1.ch2', 'hsc/hmath1', 2,   'ভেক্টর', 0.084,  'Vector', 'Higher Math 1st', 2, 32, 57);
CH('hmath1.ch3', 'hsc/hmath1', 3,   'সরলরেখা', 0.182,  'Straight Line', 'Higher Math 1st', 3, 58, 113);
CH('hmath1.ch4', 'hsc/hmath1', 4,   'বৃত্ত', 0.071,  'Circle', 'Higher Math 1st', 4, 114, 135);
CH('hmath1.ch5', 'hsc/hmath1', 5,   'বিন্যাস ও সমাবেশ', 0.052,  'Permutation and Combination', 'Higher Math 1st', 5, 136, 151);
CH('hmath1.ch6', 'hsc/hmath1', 6,   'ত্রিকোণমিতিক অনুপাত', 0.068,  'Trigonometric Ratios', 'Higher Math 1st', 6, 152, 172);
CH('hmath1.ch7', 'hsc/hmath1', 7,   'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত', 0.12,   'Trigonometric Ratios of Compound (Associated) Angles', 'Higher Math 1st', 7, 173, 209);
CH('hmath1.ch8', 'hsc/hmath1', 8,   'ফাংশন ও ফাংশনের লেখচিত্র', 0.084,  'Functions and Graphs of Functions', 'Higher Math 1st', 8, 210, 235);
CH('hmath1.ch9', 'hsc/hmath1', 9,   'অন্তরীকরণ', 0.146,  'Differentiation', 'Higher Math 1st', 9, 236, 280);
CH('hmath1.ch10', 'hsc/hmath1', 10,  'যোগজীকরণ', 0.12,   'Integration', 'Higher Math 1st', 10, 281, 317);

/* ---- উচ্চতর গণিত ২য় পত্র  (Higher Math 2nd) ---- */
CH('hmath2.ch1', 'hsc/hmath2', 1,   'বাস্তব সংখ্যা ও অসমতা', 0.071,  'Real Numbers and Inequalities', 'Higher Math 2nd', 1, 16, 48);
CH('hmath2.ch2', 'hsc/hmath2', 2,   'যোগাশ্রয়ী প্রোগ্রাম', 0.058,  'Linear Programming', 'Higher Math 2nd', 2, 49, 75);
CH('hmath2.ch3', 'hsc/hmath2', 3,   'জটিল সংখ্যা', 0.065,  'Complex Numbers', 'Higher Math 2nd', 3, 76, 105);
CH('hmath2.ch4', 'hsc/hmath2', 4,   'বহুপদী ও বহুপদী সমীকরণ', 0.088,  'Polynomials and Polynomial Equations', 'Higher Math 2nd', 4, 106, 146);
CH('hmath2.ch5', 'hsc/hmath2', 5,   'দ্বিপদী বিস্তৃতি', 0.078,  'Binomial Expansions', 'Higher Math 2nd', 5, 147, 182);
CH('hmath2.ch6', 'hsc/hmath2', 6,   'কণিক', 0.172,  'Conics', 'Higher Math 2nd', 6, 183, 262);
CH('hmath2.ch7', 'hsc/hmath2', 7,   'বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ', 0.084,  'Inverse Trigonometric Functions and Trigonometric Equations', 'Higher Math 2nd', 7, 263, 301);
CH('hmath2.ch8', 'hsc/hmath2', 8,   'স্থিতিবিদ্যা', 0.123,  'Statics', 'Higher Math 2nd', 8, 302, 358);
CH('hmath2.ch9', 'hsc/hmath2', 9,   'সমতলে বস্তুকণার গতি', 0.14,   'Motion of Particles in a Plane', 'Higher Math 2nd', 9, 359, 423);
CH('hmath2.ch10', 'hsc/hmath2', 10,  'বিস্তার পরিমাপ ও সম্ভাবনা', 0.121,  'Measures of Dispersions and Probability', 'Higher Math 2nd', 10, 424, 479);

/* ---------- the seven subjects ----------
   A subject is what a student names when asked what they study:
   first and second papers are one subject. The sidebar and the map
   group by these; everything else still works paper by paper. */
ICE.subjects = [
  {id:'bangla',  en:'Bangla',      bn:'বাংলা',          secs:['hsc/bangla1']},
  {id:'english', en:'English',     bn:'ইংরেজি',         secs:['hsc/english1']},
  {id:'ict',     en:'ICT',         bn:'আইসিটি',         secs:['hsc/ict']},
  {id:'phy',     en:'Physics',     bn:'পদার্থবিজ্ঞান',   secs:['hsc/phy1','hsc/phy2']},
  {id:'chem',    en:'Chemistry',   bn:'রসায়ন',          secs:['hsc/chem1','hsc/chem2']},
  {id:'bio',     en:'Biology',     bn:'জীববিজ্ঞান',      secs:['hsc/bio1','hsc/bio2']},
  {id:'hmath',   en:'Higher Math', bn:'উচ্চতর গণিত',    secs:['hsc/hmath1','hsc/hmath2']}
];
ICE.subject = function(id){ for(var i=0;i<ICE.subjects.length;i++) if(ICE.subjects[i].id===id) return ICE.subjects[i]; return null; };

/* names in the interface language. The English paper's units are named
   in English in the book, so they stay English either way. */
ICE.sname = function(sec){ if(typeof sec==='string') sec=ICE.sections[sec]; return sec ? L(sec.en||sec.name, sec.name) : ''; };
ICE.tname = function(tp){
  if(typeof tp==='string') tp=ICE.topics[tp];
  if(!tp) return '';
  if(tp.sec==='hsc/english1') return tp.name;
  return L(tp.note||tp.name, tp.name);
};
ICE.subjname = function(sj){ if(typeof sj==='string') sj=ICE.subject(sj); return sj ? L(sj.en, sj.bn) : ''; };

/* ---------- helpers ---------- */
ICE.sectionsOf = function(track){
  var out=[]; for(var k in ICE.sections) if(!track || ICE.sections[k].track===track) out.push(ICE.sections[k]);
  return out.sort(function(a,b){ return a.order-b.order; });
};
ICE.topicsOf = function(secKey){
  var out=[]; for(var k in ICE.topics) if(ICE.topics[k].sec===secKey) out.push(ICE.topics[k]);
  return out.sort(function(a,b){ return a.n-b.n; });
};
ICE.secKey = function(t){ return ICE.topics[t] ? ICE.topics[t].sec : null; };
ICE.topic  = function(id){ return ICE.topics[id]; };
ICE.paperOf = function(id){ var t=ICE.topics[id]; return t ? ICE.sections[t.sec] : null; };

/* seconds a question gets: the blueprint's own figure for its paper */
ICE.pace = function(secKey){
  var s=ICE.sections[secKey];
  return s ? (s.spq || Math.round(s.min*60/s.n) || 60) : 60;
};
/* minutes the whole MCQ paper takes, derived rather than stored twice */
ICE.paperMinutes = function(secKey){
  var s=ICE.sections[secKey];
  return s ? Math.round(s.n*ICE.pace(secKey)/60) : 0;
};

/* ---------- the four options, as the board prints them ---------- */
ICE.KEYS = ['ক','খ','গ','ঘ'];
ICE.OPTS = 4;

/* multiple-completion: three statements, then নিচের কোনটি সঠিক?
   The four options are fixed and never shuffled, because the board
   always prints them in this order. */
ICE.FIXED = {
  mcomp:['i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii']
};
ICE.MCOMP_SETS = [[0,1],[0,2],[1,2],[0,1,2]];
ICE.MCOMP_ASK = 'নিচের কোনটি সঠিক?';

/* option order may be shuffled unless the options only make sense in
   the printed order, or the item says so */
ICE.shuffleable = function(q){
  if(q.fixed) return false;
  if(q.type==='mcomp') return false;
  var o=q.opts||[], i, t;
  for(i=0;i<o.length;i++){
    t=String(o[i]).replace(/<[^>]+>/g,'').trim();
    if(/^(উপরের সবগুলো|কোনোটিই নয়|সবগুলো)$/.test(t)) return false;
    if(/\b(all|none) of the above\b/i.test(t)) return false;
    if(/^(i|ii|iii)(\s|,|$)/.test(t)) return false;
  }
  return true;
};

/* ===========================================================
   DIFFICULTY LINES
   b is in standard deviations. "Board level" is the easiest item a
   real board paper routinely sets; anything below it is a warm-up.
   The practice engine lets warm-ups through only while you are new
   to a chapter, and a mock paper never uses them at all.
   =========================================================== */
ICE.EXAM_B = -0.3;
ICE.HARD_B = 0.6;

/* ===========================================================
   THE STUDY PATH
   Chapter order inside a paper, always. The papers are woven
   together in one round-robin pass so a day's work never sits in
   one paper for long, and so that the first chapter of every paper
   is reached early rather than eleven papers later.
   =========================================================== */
ICE.path = {
  hsc:[
    'bangla1.ch1','english1.ch1','ict.ch1','phy1.ch1','phy2.ch1','chem1.ch1','chem2.ch1',
    'bio1.ch1','bio2.ch1','hmath1.ch1','hmath2.ch1','bangla1.ch2','english1.ch2','ict.ch2',
    'phy1.ch2','phy2.ch2','chem1.ch2','chem2.ch2','bio1.ch2','bio2.ch2','hmath1.ch2',
    'hmath2.ch2','bangla1.ch3','english1.ch3','ict.ch3','phy1.ch3','phy2.ch3','chem1.ch3',
    'chem2.ch3','bio1.ch3','bio2.ch3','hmath1.ch3','hmath2.ch3','bangla1.ch4','english1.ch4',
    'ict.ch4','phy1.ch4','phy2.ch4','chem1.ch4','chem2.ch4','bio1.ch4','bio2.ch4',
    'hmath1.ch4','hmath2.ch4','bangla1.ch5','english1.ch5','ict.ch5','phy1.ch5','phy2.ch5',
    'chem1.ch5','chem2.ch5','bio1.ch5','bio2.ch5','hmath1.ch5','hmath2.ch5','bangla1.ch6',
    'english1.ch6','ict.ch6','phy1.ch6','phy2.ch6','bio1.ch6','bio2.ch6','hmath1.ch6',
    'hmath2.ch6','bangla1.ch7','english1.ch7','phy1.ch7','phy2.ch7','bio1.ch7','bio2.ch7',
    'hmath1.ch7','hmath2.ch7','bangla1.ch8','english1.ch8','phy1.ch8','phy2.ch8','bio1.ch8',
    'bio2.ch8','hmath1.ch8','hmath2.ch8','bangla1.ch9','english1.ch9','phy1.ch9','phy2.ch9',
    'bio1.ch9','bio2.ch9','hmath1.ch9','hmath2.ch9','bangla1.ch10','english1.ch10','phy1.ch10',
    'phy2.ch10','bio1.ch10','bio2.ch10','hmath1.ch10','hmath2.ch10','bangla1.ch11','english1.ch11',
    'phy2.ch11','bio1.ch11','bio2.ch11','bangla1.ch12','english1.ch12','bio1.ch12','bio2.ch12',
    'bangla1.ch13','english1.ch13','bangla1.ch14','english1.ch14','bangla1.ch15','english1.ch15','bangla1.ch16',
    'bangla1.ch17','bangla1.ch18','bangla1.ch19','bangla1.ch20','bangla1.ch21','bangla1.ch22','bangla1.ch23',
    'bangla1.ch24','bangla1.ch25','bangla1.ch26'
  ]
};

/* ===========================================================
   CONTENT HOOKS
   Generators register here and are expanded once at start-up by
   ICE.finalize() — before the ability index is built. The maths
   generators kept in js/gen/spare/ are not loaded by index.html;
   they are there to be adapted for Higher Math and Physics
   numericals, and a template whose topic does not exist is parked
   rather than shipped.
   =========================================================== */
ICE.G = [];          /* question generators */
