/* ===========================================================
   I18N — the interface's digits and its language.

   Every interface string is written L('English','বাংলা'). The one
   thing L cannot do is the digits inside a sentence, so every number
   the interface prints goes through N(). Questions never do: they
   keep the book's own digits.
   =========================================================== */
var BN_DIGITS='০১২৩৪৫৬৭৮৯';

/* N(12) -> '১২' in Bangla, '12' in English */
function N(v){
  var s=String(v);
  if(DB.state().settings.lang==='en') return s;
  return s.replace(/\d/g, function(d){ return BN_DIGITS.charAt(+d); });
}

var I18N = (function(){
function setLang(lang){
  var s=DB.state();
  s.settings.lang = lang==='en' ? 'en' : 'bn';
  DB.save();
  document.documentElement.setAttribute('lang', s.settings.lang==='en' ? 'en' : 'bn');
}
function apply(){
  document.documentElement.setAttribute('lang', LBN() ? 'bn' : 'en');
  document.title = L('Drakkhak — board-level MCQ practice', 'দ্রাক্ষাক — বোর্ড-মানের MCQ অনুশীলন');
}
return {setLang:setLang, apply:apply};
})();
