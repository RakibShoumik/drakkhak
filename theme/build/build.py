#!/usr/bin/env python3
"""
Build the Drakkhak WoWonder theme from WoWonder's stock "Sunshine" theme.

    python3 theme/build/build.py path/to/themes/sunshine theme/drakkhak

Sunshine carries every template WoWonder needs (hundreds of .phtml files),
so Drakkhak does not rewrite them. It takes a clean copy and changes the
look, the same way every time:

  1. every colour in the stylesheets is moved onto the Drakkhak palette:
     greys become the warm parchment and ink greys, blues/purples become
     terracotta, greens the verdict green, reds the verdict red, oranges
     the gold. dark.css is moved onto Drakkhak's lamp-lit night palette;
  2. every text font becomes Hind Siliguri (sans, Bangla-ready), and
     stylesheet/drakkhak.css puts headings in Noto Serif Bengali;
  3. layout/style.phtml fixes the button and header colours to the
     palette, whatever the admin colour settings say (one switch at the
     top of that file turns this off);
  4. layout/container.phtml loads drakkhak.css (and drakkhak-night.css in
     night mode), drops the Google Fonts request, and gives the welcome
     page a parchment background;
  5. everything in theme/build/overlay/ is copied on top: the four-bubble
     logo, the favicon, the fonts, the two stylesheets and info.php.

Add --study to also put a Drakkhak practice-site button in the top bar
(the theme "drakkhak-study"):

    python3 theme/build/build.py path/to/sunshine theme/drakkhak-study --study

Two further patches run on every build (and can be re-applied to a built
theme on their own with --patch, no Sunshine folder needed):

  6. no permission prompts on arrival: Sunshine asked for notifications on
     every page load and for location on most pages. Now OneSignal never
     auto-prompts (its bell still works when tapped), the browser
     notification prompt is gone, and location is read only when the
     visitor has already allowed it;
  7. the sign-up form suggests a username from the full name (lowercase,
     one word, numbers added if taken; still editable) and says
     "Username must be one word (letters, numbers and underscore only)."

    python3 theme/build/build.py --patch theme/drakkhak

Run it on a fresh Sunshine folder; it is not meant to be run twice on the
same output (the out folder is wiped first).
"""
import colorsys
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OVERLAY = os.path.join(HERE, 'overlay')

# ---------------------------------------------------------------- palettes
def hx(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))

# (source lightness, target colour) — interpolated in between
DAY_NEUTRAL = [(0.00, '#141413'), (0.10, '#1C1B18'), (0.20, '#2E2D29'), (0.33, '#4A4945'),
               (0.45, '#5E5D59'), (0.60, '#87867F'), (0.72, '#A8A69C'), (0.80, '#CFCBBE'),
               (0.87, '#E0DDD2'), (0.91, '#E8E6DC'), (0.94, '#F0EEE6'), (0.965, '#F5F4ED'),
               (0.99, '#FAF9F5'), (1.00, '#FAF9F5')]
DAY_ACCENT = [(0.00, '#3A1A10'), (0.30, '#9E4A2F'), (0.42, '#C6613F'), (0.55, '#D97757'),
              (0.70, '#E6A088'), (0.85, '#F0CDBE'), (0.93, '#F6E6DE'), (1.00, '#FBF1EC')]
DAY_OK = [(0.00, '#1C2E1D'), (0.30, '#3A5E3C'), (0.45, '#4C7A4E'), (0.65, '#8FAE86'),
          (0.85, '#CFDDC7'), (0.93, '#E3EBDD'), (1.00, '#F1F5EE')]
DAY_NO = [(0.00, '#3A1611'), (0.35, '#8E3A2B'), (0.50, '#B04A38'), (0.68, '#D3A091'),
          (0.88, '#F0D6CE'), (0.94, '#F5E3DD'), (1.00, '#FAF0EC')]
DAY_GOLD = [(0.00, '#3A2808'), (0.35, '#7A5410'), (0.48, '#9A6B18'), (0.58, '#E2A12B'),
            (0.75, '#EFC874'), (0.90, '#F8E7C0'), (1.00, '#FCF5E4')]
DAY_TEAL = [(0.00, '#0F2A2C'), (0.35, '#2F7F86'), (0.60, '#6FB0B5'), (0.90, '#DCEDEE'), (1.00, '#F0F7F7')]

NIGHT_NEUTRAL = [(0.00, '#0F0E0A'), (0.08, '#131209'), (0.12, '#16150F'), (0.17, '#1D1C16'),
                 (0.21, '#2A2820'), (0.26, '#332F26'), (0.33, '#453F33'), (0.45, '#6A6457'),
                 (0.55, '#7C7668'), (0.70, '#A9A395'), (0.85, '#D6D1C3'), (1.00, '#EDE9DC')]
NIGHT_ACCENT = [(0.00, '#2F241D'), (0.25, '#5A3526'), (0.45, '#C9765A'), (0.60, '#E08B6B'),
                (0.75, '#EFA184'), (1.00, '#F8D9CB')]
NIGHT_OK = [(0.00, '#1E2A1B'), (0.35, '#4F6B49'), (0.60, '#8FBE86'), (1.00, '#D9EBD4')]
NIGHT_NO = [(0.00, '#2E1D18'), (0.35, '#6E4136'), (0.60, '#E08A76'), (1.00, '#F5D5CC')]
NIGHT_GOLD = [(0.00, '#2A200C'), (0.35, '#8F6B1E'), (0.60, '#E7BE74'), (1.00, '#F8E6BF')]
NIGHT_TEAL = [(0.00, '#12282A'), (0.40, '#3E8A90'), (0.65, '#6FB9BF'), (1.00, '#D6EEF0')]

DAY = dict(neutral=DAY_NEUTRAL, accent=DAY_ACCENT, ok=DAY_OK, no=DAY_NO, gold=DAY_GOLD, teal=DAY_TEAL,
           chroma=0.085, shadow=(20, 20, 19))
NIGHT = dict(neutral=NIGHT_NEUTRAL, accent=NIGHT_ACCENT, ok=NIGHT_OK, no=NIGHT_NO, gold=NIGHT_GOLD,
             teal=NIGHT_TEAL, chroma=0.19, shadow=(0, 0, 0))


def ramp(points, l):
    for i in range(len(points) - 1):
        l0, c0 = points[i]
        l1, c1 = points[i + 1]
        if l <= l1:
            t = 0 if l1 == l0 else (l - l0) / (l1 - l0)
            a, b = hx(c0), hx(c1)
            return tuple(round(a[k] + (b[k] - a[k]) * t) for k in range(3))
    return hx(points[-1][1])


def remap(rgb, pal):
    r, g, b = [x / 255 for x in rgb]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    chroma = max(r, g, b) - min(r, g, b)
    if chroma < pal['chroma']:
        return ramp(pal['neutral'], l)
    deg = h * 360
    # Sunshine's own brand red (#a84849 and kin) is the brand, not an error
    brandish = (deg >= 345 or deg < 12) and s < 0.6 and 0.3 < l < 0.6
    if brandish:
        fam = 'accent'
    elif deg < 15 or deg >= 340:
        fam = 'no'
    elif deg < 62:
        fam = 'gold'
    elif deg < 165:
        fam = 'ok'
    elif deg < 195:
        fam = 'teal'
    else:
        fam = 'accent'          # blues, indigos, purples, pinks: the terracotta
    return ramp(pal[fam], l)


def fmt(rgb, alpha=None):
    if alpha is None:
        return '#%02X%02X%02X' % rgb
    return 'rgba(%d, %d, %d, %s)' % (rgb[0], rgb[1], rgb[2], alpha)


HEX_RE = re.compile(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b')
RGB_RE = re.compile(r'rgba?\(\s*([^)]*)\)', re.I)


def parse_alpha(a):
    a = a.strip()
    if a.endswith('%'):
        return round(float(a[:-1]) / 100, 3)
    return float(a)


def recolor_text(text, pal):
    def hex_sub(m):
        v = m.group(1)
        if len(v) in (3, 4):
            rgb = tuple(int(c * 2, 16) for c in v[:3])
            alpha = None if len(v) == 3 else round(int(v[3] * 2, 16) / 255, 3)
        else:
            rgb = tuple(int(v[i:i + 2], 16) for i in (0, 2, 4))
            alpha = None if len(v) == 6 else round(int(v[6:8], 16) / 255, 3)
        return fmt(remap(rgb, pal), alpha)

    def rgb_sub(m):
        inner = m.group(1)
        if '$' in inner or 'var(' in inner:
            return m.group(0)
        parts = re.split(r'\s*/\s*|\s*,\s*|\s+', inner.strip())
        try:
            nums = [float(p[:-1]) * 2.55 if p.endswith('%') else float(p) for p in parts[:3]]
        except ValueError:
            return m.group(0)
        if len(nums) < 3:
            return m.group(0)
        rgb = tuple(max(0, min(255, round(x))) for x in nums)
        alpha = parse_alpha(parts[3]) if len(parts) > 3 else None
        if max(rgb) <= 8:                   # a black shadow stays a (warm) shadow
            new = pal['shadow']
        else:
            new = remap(rgb, pal)
        return fmt(new, alpha)

    text = RGB_RE.sub(rgb_sub, text)
    text = HEX_RE.sub(hex_sub, text)
    # the few named colours, where they paint a surface or text
    text = NAMED_BG_RE.sub(lambda m: m.group(1) + fmt(remap(NAMED[m.group(2).lower()], pal)), text)
    return text


NAMED = {'white': (255, 255, 255), 'black': (0, 0, 0)}
NAMED_BG_RE = re.compile(r'((?:background(?:-color)?|border(?:-[a-z]+)?-color|(?<![-\w])color)\s*:\s*)(white|black)\b', re.I)


# ---------------------------------------------------------------- fonts
UI_FONT = "'Hind Siliguri', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
KEEP_FONT = re.compile(r'awesome|glyph|icon|mono|consol|courier|menlo|emoji|material|inherit|flaticon|plyr|slick', re.I)
FONT_RE = re.compile(r'(font-family\s*:\s*)([^;}]*)')


FACE_RE = re.compile(r'@font-face\s*\{[^}]*\}', re.I)


def refont_text(text):
    """Every text font becomes the UI font; @font-face rules and icon fonts stay."""
    faces = [(m.start(), m.end()) for m in FACE_RE.finditer(text)]

    def in_face(pos):
        return any(a <= pos < b for a, b in faces)

    def sub(m):
        v = m.group(2)
        if in_face(m.start()) or KEEP_FONT.search(v):
            return m.group(0)
        important = ' !important' if '!important' in v else ''
        return m.group(1) + UI_FONT + important
    return FONT_RE.sub(sub, text)


# ---------------------------------------------------------------- build
DAY_CSS = ['stylesheet/style.css', 'stylesheet/style_rtl.css', 'stylesheet/welcome.css',
           'stylesheet/welcome_rtl.css', 'stylesheet/general-style-plugins.css',
           'stylesheet/messages-new.css', 'stylesheet/theme-style.css',
           'stylesheet/bootstrap-select.min.css', 'stylesheet/flatpickr.min.css',
           'stylesheet/bootstrap-toggle.min.css']
NIGHT_CSS = ['stylesheet/dark.css']


def read(p):
    with open(p, encoding='utf-8', errors='surrogateescape', newline='') as f:
        return f.read()


def write(p, s):
    with open(p, 'w', encoding='utf-8', errors='surrogateescape', newline='') as f:
        f.write(s)


def must_replace(s, old, new, what):
    if old not in s:
        sys.exit('build: could not find the %s in container.phtml; Sunshine has changed, update build.py' % what)
    return s.replace(old, new, 1)


PALETTE_PHP = """<?php
/* Drakkhak palette. The theme keeps its own colours whatever the admin
   colour settings say. Set $drakkhak_palette to false to hand the button
   and header colours back to Admin Panel > Design > Manage Colors. */
$drakkhak_palette = true;
if ($drakkhak_palette) {
    $wo['config']['btn_background_color']       = '#D97757';
    $wo['config']['btn_hover_background_color'] = '#C6613F';
    $wo['config']['btn_color']                  = '#FFF8F2';
    $wo['config']['btn_hover_color']            = '#FFF8F2';
    $wo['config']['header_background']          = '#F5F4ED';
    $wo['config']['header_color']               = '#141413';
    $wo['config']['header_hover_border']        = '#F6E6DE';
    $wo['config']['body_background']            = '#F5F4ED';
}
?>
"""


def build(src, out):
    if not os.path.isfile(os.path.join(src, 'layout', 'container.phtml')):
        sys.exit('build: %s does not look like the Sunshine theme' % src)
    if os.path.exists(out):
        shutil.rmtree(out)
    shutil.copytree(src, out, ignore=shutil.ignore_patterns('.DS_Store', '__MACOSX'))

    # 1–2. colours and fonts in the stylesheets
    for rel in DAY_CSS + [os.path.relpath(os.path.join(dp, f), out)
                          for sub in ('stylesheet/movies', 'stylesheet/website_mode')
                          for dp, _, fs in os.walk(os.path.join(out, sub)) for f in fs if f.endswith('.css')]:
        p = os.path.join(out, rel)
        if os.path.isfile(p):
            write(p, refont_text(recolor_text(read(p), DAY)))
    for rel in NIGHT_CSS:
        p = os.path.join(out, rel)
        if os.path.isfile(p):
            write(p, refont_text(recolor_text(read(p), NIGHT)))

    # 3. style.phtml: palette first, then its own literal colours
    p = os.path.join(out, 'layout', 'style.phtml')
    write(p, PALETTE_PHP + refont_text(recolor_text(read(p), DAY)))

    # templates: the brand red is hard-coded in a few, and many carry their
    # own <style> blocks, which get the same recolour as the stylesheets
    style_re = re.compile(r'(<style[^>]*>)(.*?)(</style>)', re.S | re.I)
    for dp, _, fs in os.walk(os.path.join(out, 'layout')):
        for f in fs:
            if f.endswith('.phtml') and f != 'style.phtml':
                q = os.path.join(dp, f)
                s = read(q)
                t = re.sub(r'#a84849', '#D97757', s, flags=re.I)
                t = style_re.sub(lambda m: m.group(1) + refont_text(recolor_text(m.group(2), DAY)) + m.group(3), t)
                if t != s:
                    write(q, t)

    # 4. container.phtml
    p = os.path.join(out, 'layout', 'container.phtml')
    s = read(p)
    s = re.sub(r'\s*<link rel="preconnect" href="https://fonts.googleapis.com">\s*'
               r'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\s*'
               r'<link href="https://fonts.googleapis.com/css2[^"]*" rel="stylesheet">', '\n', s)
    s = must_replace(s, "<?php echo Wo_LoadPage('style') ?>",
                     "<?php echo Wo_LoadPage('style') ?>\n"
                     "    <link rel=\"stylesheet\" href=\"<?php echo $wo['config']['theme_url'];?>/stylesheet/drakkhak.css<?php echo $wo['update_cache']; ?>?version=<?php echo $wo['config']['version']; ?>\">\n"
                     "    <meta name=\"theme-color\" content=\"<?php echo (isset($_COOKIE['mode']) && $_COOKIE['mode'] == 'night') ? '#16150F' : '#F5F4ED'; ?>\">",
                     'style include')
    s = must_replace(s, 'id="night-mode-css">',
                     'id="night-mode-css">\n'
                     "      <link rel=\"stylesheet\" href=\"<?php echo $wo['config']['theme_url'];?>/stylesheet/drakkhak-night.css<?php echo $wo['update_cache']; ?>?version=<?php echo $wo['config']['version']; ?>\" id=\"drakkhak-night-css\">",
                     'night-mode stylesheet')
    s = must_replace(s, "body{background: url('<?php echo $wo['config']['theme_url'];?>/img/welcome/background.png') !important;background-position: center !important;background-repeat: no-repeat !important;background-size: cover !important;}",
                     "body{background: var(--dk-page, #F5F4ED) !important;}",
                     'welcome background')
    s = must_replace(s, 'type="image/png" href="<?php echo $wo[\'config\'][\'theme_url\'];?>/img/icon.png"/>',
                     'type="image/png" href="<?php echo $wo[\'config\'][\'theme_url\'];?>/img/icon.png"/>\n'
                     '      <link rel="icon" type="image/svg+xml" href="<?php echo $wo[\'config\'][\'theme_url\'];?>/img/favicon.svg"/>',
                     'favicon')
    write(p, s)

    # the night switch loads dark.css at run time; load ours with it
    patch_night_toggle(out)

    # 5. the overlay
    for dp, _, fs in os.walk(OVERLAY):
        for f in fs:
            srcf = os.path.join(dp, f)
            dst = os.path.join(out, os.path.relpath(srcf, OVERLAY))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(srcf, dst)
    patch_prompts(out)
    patch_register(out)
    patch_pet(out)
    patch_search(out)
    patch_community(out)
    patch_learn_button(out)
    print('Drakkhak theme written to', out)


# ---------------------------------------------------------------- 6. no prompts on arrival
DKGEO = '''
      <script>
      /* Drakkhak: the site never asks for location on its own. Anything that
         wants it gets it only if the visitor has already allowed it. */
      function DkGeo(ok, err){
        if (!navigator.geolocation || !navigator.permissions || !navigator.permissions.query) return;
        navigator.permissions.query({name: 'geolocation'}).then(function (p) {
          if (p.state === 'granted') navigator.geolocation.getCurrentPosition(ok, err);
        }).catch(function () {});
      }
      </script>'''


def patch_prompts(out):
    p = os.path.join(out, 'layout', 'container.phtml')
    s = read(p)
    if 'function DkGeo' not in s:
        s = re.sub(r'<head>', '<head>' + DKGEO, s, count=1)
    s = s.replace('autoRegister: true, /* Set to true to automatically prompt visitors */',
                  'autoRegister: false, /* Drakkhak: never prompt on arrival; the bell asks only when tapped */')
    write(p, s)
    n = 0
    for dp, _, fs in os.walk(os.path.join(out, 'layout')):
        for f in fs:
            if not f.endswith('.phtml'):
                continue
            q = os.path.join(dp, f)
            t = read(q)
            u = re.sub(r'(?<!\.)\bnavigator\.geolocation\.getCurrentPosition\(', 'DkGeo(', t)
            u = u.replace('if (p.state === \'granted\') DkGeo(ok, err);', 'if (p.state === \'granted\') navigator.geolocation.getCurrentPosition(ok, err);')
            u = re.sub(r'\bgeo\.getCurrentPosition\(', 'DkGeo(', u)
            if u != t:
                write(q, u)
                n += 1
    js = os.path.join(out, 'javascript', 'script.js')
    if os.path.isfile(js):
        t = read(js)
        nl = '\r\n' if '\r\n' in t else '\n'
        def fix(old, new, text):
            return text.replace(old.replace('\n', nl), new.replace('\n', nl))
        u = fix('''// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
});''', '''// Drakkhak: no notification prompt on page load. Visitors switch
// notifications on themselves (the bell, or the browser's site settings).''', t)
        u = fix('''  if (!Notification) {
    return;
  }
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {''', '''  if (!window.Notification) {
    return;
  }
  if (Notification.permission !== "granted")
    return;   /* Drakkhak: never ask from here */
  else {''', u)
        if u != t:
            write(js, u)


# ---------------------------------------------------------------- 7. the username from the name
USERNAME_FIELDS = '''<div class="wow_form_fields">
							<label for="dk_fullname">Full name</label>
							<input id="dk_fullname" type="text" autocomplete="name" placeholder="Your full name" autofocus>
							<input id="dk_first" name="first_name" type="hidden"><input id="dk_last" name="last_name" type="hidden">
						</div>
						<div class="wow_form_fields">
							<label for="username"><?php echo $wo['lang']['username']?></label>
							<input id="username" name="username" type="text" autocomplete="off" placeholder="<?php echo $wo['lang']['username']?>">
							<small class="dk-uhint" id="dk_uhint">Made from your name. You can change it.</small>
						</div>'''

USERNAME_JS = r'''
<script>
/* Drakkhak: a username made from the full name. Lowercase, one word, letters,
   numbers and underscore only; numbers are added when the name is taken. It
   stays editable: once you type your own, it is left alone. */
var DK_USER_MSG = 'Username must be one word (letters, numbers and underscore only).';
function DkUserOk(){
  var u = $('#username');
  if (!u.length) return true;
  if (!/^[A-Za-z0-9_]+$/.test(u.val())) { $('#register .errors').html(DK_USER_MSG); return false; }
  return true;
}
function DkUserMsg(html){
  return String(html || '').replace(/invalid username characters?\.?/ig, DK_USER_MSG);
}
(function(){
  var BN = {'অ':'a','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','ঋ':'ri','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
    'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ৃ':'ri','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
    'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng','চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n','ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n',
    'ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n','প':'p','ফ':'f','ব':'b','ভ':'bh','ম':'m','য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
    '\u09DC':'r','\u09DD':'rh','\u09DF':'y','\u09BC':'','ৎ':'t','ং':'ng','ঃ':'h','ঁ':'','্':'','০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
  var KAR = 'ািীুূৃেৈোৌ্ংঃঁ';
  function isCons(c){ return /[\u0995-\u09B9\u09DC-\u09DF]/.test(c); }
  function latin(s){
    s = String(s || '').replace(/\u09A1\u09BC/g, '\u09DC').replace(/\u09A2\u09BC/g, '\u09DD').replace(/\u09AF\u09BC/g, '\u09DF');
    var out = '', i, c, nx;
    for (i = 0; i < s.length; i++) {
      c = s.charAt(i); nx = s.charAt(i + 1);
      if (BN[c] === undefined) { out += c; continue; }
      out += BN[c];
      /* a consonant carries an "a" unless a vowel sign, a hasanta or the end of the word follows */
      if (isCons(c) && nx && KAR.indexOf(nx) < 0 && /[\u0980-\u09FF]/.test(nx) && !/[\u0985-\u0994]/.test(nx)) out += 'a';
    }
    return out;
  }
  function slug(name){
    var s = latin(name).toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return s.replace(/[^a-z0-9_]/g, '').slice(0, 26);
  }
  var u = $('#username'), f = $('#dk_fullname'), hint = $('#dk_uhint'), mine = false, t = null, seq = 0;
  if (!u.length || !f.length) return;
  u.on('input', function(){ mine = u.val() !== ''; });
  f.on('input', function(){
    var parts = $.trim(f.val()).split(/\s+/);
    $('#dk_first').val(parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || '');
    $('#dk_last').val(parts.length > 1 ? parts[parts.length - 1] : '');
    if (mine) return;
    var base = slug(f.val());
    if (!base) { u.val(''); return; }
    while (base.length < 5) base += String(Math.floor(Math.random() * 10));
    u.val(base);
    clearTimeout(t);
    var my = ++seq;
    t = setTimeout(function(){
      $.getJSON('<?php echo $wo['config']['theme_url'];?>/dk/username.php', {u: base}).done(function(d){
        if (my !== seq || mine || !d || !d.ok) return;
        u.val(d.name);
        hint.text(d.name === base ? 'Made from your name. You can change it.' : base + ' is taken, so a number was added. You can change it.');
      });
    }, 350);
  });
})();
</script>
'''


def patch_register(out):
    p = os.path.join(out, 'layout', 'welcome', 'register.phtml')
    if not os.path.isfile(p):
        return
    s = read(p)
    if 'DkUserOk' in s:
        return
    old = re.search(r'<div class="wow_form_fields">\s*<label for="username"><\?php echo \$wo\[.lang.\]\[.username.\]\?></label>\s*'
                    r'<input id="username" name="username" type="text" autocomplete="off" placeholder="<\?php echo \$wo\[.lang.\]\[.username.\]\?>" autofocus>\s*</div>', s)
    if not old:
        sys.exit('build: could not find the username field in welcome/register.phtml; Sunshine has changed, update build.py')
    s = s[:old.start()] + USERNAME_FIELDS + s[old.end():]
    s, n = re.subn(r'(beforeSend:\s*function\(\)\s*\{)', r'\1\n    \tif (typeof DkUserOk === "function" && !DkUserOk()) return false;', s, count=1)
    if not n:
        sys.exit('build: could not find beforeSend in welcome/register.phtml')
    s = s.replace('$state.html(data.errors);', '$state.html(typeof DkUserMsg === "function" ? DkUserMsg(data.errors) : data.errors);')
    s += USERNAME_JS
    write(p, s)


# ---------------------------------------------------------------- 8. the pixel cat
PET_SRC = os.path.join(HERE, '..', '..', 'alpha', 'js', 'pet.js')
PET_TAG = ('    <!-- Drakkhak: the pixel cat. The same file as Learn\'s js/pet.js, so it is one cat on the whole site. -->\n'
           '    <script src="<?php echo $wo[\'config\'][\'theme_url\'];?>/javascript/drakkhak-pet.js?version=<?php echo $wo[\'config\'][\'version\']; ?>" defer></script>\n')


def patch_pet(out):
    """Copy Learn's pet.js into the theme and load it on every page."""
    src = os.path.normpath(PET_SRC)
    if os.path.isfile(src):
        shutil.copy2(src, os.path.join(out, 'javascript', 'drakkhak-pet.js'))
        shutil.copy2(src, os.path.join(OVERLAY, 'javascript', 'drakkhak-pet.js')) if os.path.isdir(os.path.join(OVERLAY, 'javascript')) else None
    p = os.path.join(out, 'layout', 'container.phtml')
    s = read(p)
    if 'drakkhak-pet.js' in s:
        return
    i = s.rfind('</body>')
    if i < 0:
        sys.exit('build: could not find </body> in container.phtml')
    s = s[:i] + PET_TAG + '   ' + s[i:]
    write(p, s)


# ---------------------------------------------------------------- 9. one search for the whole site
SEARCH_TAG = ('    <script>window.DK_LEARN_URL = <?php echo json_encode($wo[\'config\'][\'site_url\'] . \'/learn\'); ?>; '
              'window.DK_THEME_URL = <?php echo json_encode($wo[\'config\'][\'theme_url\']); ?>;</script>\n'
              '    <script src="<?php echo $wo[\'config\'][\'theme_url\'];?>/javascript/drakkhak-search.js?version=<?php echo $wo[\'config\'][\'version\']; ?>" defer></script>\n')
SEARCH_OLD = '''        if (data.status == 200) {
          if (data.html.length == 0) {
            SearchResult.html('<span class="center-text">' + " <?php echo $wo['lang']['no_result']; ?>" + '<span>');
          } else {
            SearchResult.html(data.html);
          }
        }'''
SEARCH_NEW = '''        if (data.status == 200) {
          /* Drakkhak: Learn's chapters on top of the people, pages and groups */
          var dkChapters = window.DkSearch ? DkSearch.html(query) : '';
          if (data.html.length == 0 && !dkChapters) {
            SearchResult.html('<span class="center-text">' + " <?php echo $wo['lang']['no_result']; ?>" + '<span>');
          } else {
            SearchResult.html(dkChapters + data.html);
          }
        }'''


def patch_search(out):
    p = os.path.join(out, 'layout', 'container.phtml')
    s = read(p)
    if 'drakkhak-search.js' not in s:
        i = s.rfind('</body>')
        s = s[:i] + SEARCH_TAG + '   ' + s[i:]
        write(p, s)
    p = os.path.join(out, 'layout', 'header', 'content.phtml')
    s = read(p)
    if 'DkSearch' in s:
        return
    at = s.find("{f: 'search', s: 'normal', query: query}")
    if at < 0:
        sys.exit('build: could not find the header search in header/content.phtml')
    nl = '\r\n' if '\r\n' in s else '\n'
    old, new = SEARCH_OLD.replace('\n', nl), SEARCH_NEW.replace('\n', nl)
    j = s.find(old, at)
    if j < 0:
        sys.exit('build: the header search results code has changed; update build.py')
    s = s[:j] + new + s[j + len(old):]
    write(p, s)


# ---------------------------------------------------------------- 10. one website: the community templates
NB = "<?php if (!function_exists('dk_name_badge')) { @include_once('drakkhak/lib.php'); } if (function_exists('dk_name_badge') && !empty(%s) && empty(%s)) echo dk_name_badge(%s); ?>"

NOTIF_BLOCK = '''    if ($wo['notification']['type'] == 'drakkhak') {
        /* Drakkhak: Learn's moments in the one bell (a duel, a badge, a level, a set) */
        $wo['notification']['type_text'] = $wo['notification']['text'];
        if (!empty($wo['notification']['full_link'])) { $wo['notification']['url'] = $wo['notification']['full_link']; }
        $wo['notification']['wo_url'] = 1;
        $wo['notification']['icon'] .= '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather active"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"></path></svg>';
        if (empty($wo['notification']['notifier']['user_id']) || $wo['notification']['notifier_id'] == $wo['notification']['recipient_id']) {
            $wo['notification']['notifier']['name']   = 'Drakkhak Learn';
            $wo['notification']['notifier']['avatar'] = $wo['config']['theme_url'] . "/img/icon.png";
        }
    }
'''

COLLEGE_FIELD = '''<div class="wow_form_fields">
							<label for="dk_college">College or school <small>(optional)</small></label>
							<input id="dk_college" type="text" autocomplete="off" list="dk_college_list" placeholder="e.g. Notre Dame College, Dhaka">
							<datalist id="dk_college_list"></datalist>
							<small class="dk-uhint">Your college joins the college rankings in Learn once five of its students study.</small>
						</div>
					'''

SIGNUP_JS = r'''
<script>
/* Drakkhak: after sign-up, keep the full name and the college (one account for Learn and Community) */
(function(){
  var c=document.getElementById('dk_college'), list=document.getElementById('dk_college_list'), t=null;
  if(c && list) c.addEventListener('input', function(){
    clearTimeout(t); var q=c.value.trim(); if(q.length<2) return;
    t=setTimeout(function(){ fetch('<?php echo $wo['config']['site_url'];?>/drakkhak/colleges.php?q='+encodeURIComponent(q)).then(function(r){ return r.json(); }).then(function(d){
      list.innerHTML=(d.list||[]).map(function(x){ var o=document.createElement('option'); o.value=x.name; return o.outerHTML; }).join('');
    }).catch(function(){}); }, 250);
  });
  window.DkAfterSignup=function(){
    var f=document.getElementById('dk_first'), l=document.getElementById('dk_last');
    try{ fetch(Wo_Ajax_Requests_File()+'?f=drakkhak&s=after_signup', {method:'POST', credentials:'same-origin', keepalive:true,
      headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
      body:JSON.stringify({first:f?f.value:'', last:l?l.value:'', college:c?c.value:''})}); }catch(e){}
  };
})();
</script>
'''


def patch_community(out):
    L = os.path.join(out, 'layout')
    # names in posts and comments: Learn level, streak and frame
    p = os.path.join(L, 'story', 'includes', 'header.phtml')
    s = read(p)
    if 'dk_name_badge' not in s:
        old = "<b><?php echo $wo['story']['publisher']['name']; ?></b></a>"
        if old not in s:
            sys.exit('build: the post name in story/includes/header.phtml has changed')
        s = s.replace(old, old + NB % ("$wo['story']['publisher']['user_id']", "$wo['story']['publisher']['page_id']", "$wo['story']['publisher']['user_id']"))
        write(p, s)
    p = os.path.join(L, 'comment', 'content.phtml')
    s = read(p)
    if 'dk_name_badge' not in s:
        m = re.search(r'(<h4 class="user">\s*<\?php echo \$wo\[\'comment\'\]\[\'publisher\'\]\[\'name\'\]\?>\s*</h4>\s*</a>\s*</span>)', s)
        if not m:
            sys.exit('build: the comment name in comment/content.phtml has changed')
        badge = NB % ("$wo['comment']['publisher']['user_id']", "$wo['comment']['publisher']['page_id']", "$wo['comment']['publisher']['user_id']")
        s = s[:m.end()] + badge + s[m.end():]
        write(p, s)
    # the profile: a study card above the albums
    p = os.path.join(L, 'timeline', 'content.phtml')
    s = read(p)
    if 'drakkhak-study' not in s:
        old = "echo Wo_LoadPage('timeline/albums-sidebar');"
        i = s.find(old)
        if i < 0:
            sys.exit('build: the profile sidebar in timeline/content.phtml has changed')
        j = s.rfind('<?php', 0, i)
        s = s[:j] + "<?php echo Wo_LoadPage('timeline/drakkhak-study'); ?>\n        " + s[j:]
        write(p, s)
    # a group: the weekly study goal at the top of its sidebar
    p = os.path.join(L, 'group', 'content.phtml')
    s = read(p)
    if 'drakkhak-goal' not in s:
        old = '<div class="col-md-4">'
        if old not in s:
            sys.exit('build: the group sidebar in group/content.phtml has changed')
        s = s.replace(old, old + "\n\t\t<?php echo Wo_LoadPage('group/drakkhak-goal'); ?>", 1)
        write(p, s)
    # the bell: a notification type for Learn
    p = os.path.join(L, 'header', 'notifecation.phtml')
    s = read(p)
    if "'drakkhak'" not in s:
        old = "    if ($wo['notification']['type'] == 'remaining') {"
        if old not in s:
            sys.exit('build: header/notifecation.phtml has changed')
        nl = '\r\n' if '\r\n' in s else '\n'
        s = s.replace(old, NOTIF_BLOCK.replace('\n', nl) + old, 1)
        write(p, s)
    # sign-up: the college, and the full name kept after sign-up
    p = os.path.join(L, 'welcome', 'register.phtml')
    s = read(p)
    if 'dk_college' not in s:
        old = '<div class="wow_form_fields">\n\t\t\t\t\t\t<label for="email">'
        k = s.find('<label for="email">')
        if k < 0:
            sys.exit('build: the email field in welcome/register.phtml has changed')
        j = s.rfind('<div class="wow_form_fields">', 0, k)
        s = s[:j] + COLLEGE_FIELD + s[j:]
        s = s.replace("if (data.status == 200) {", "if (data.status == 200) {\n        if (window.DkAfterSignup) DkAfterSignup();", 1)
        s += SIGNUP_JS
        write(p, s)


def patch_learn_button(out):
    """Learn is part of the site: the top-bar button in every Drakkhak theme, lit on /learn."""
    p = os.path.join(out, 'layout', 'header', 'content.phtml')
    s = read(p)
    if 'dk-study-li' not in s:
        add_study_button(out, rename=False)
        s = read(p)
    s = s.replace("$dk_study_url = $wo['config']['site_url'] . '/learn/';", "$dk_study_url = $wo['config']['site_url'] . '/learn';")
    s = s.replace("$dk_study_url = $wo['config']['site_url'] . '/study/';", "$dk_study_url = $wo['config']['site_url'] . '/learn';")
    s = s.replace('<li class="dk-study-li">', '<li class="dk-study-li<?php echo (isset($wo[\'page\']) && $wo[\'page\'] == \'learn\') ? \' active\' : \'\'; ?>">')
    write(p, s)


def patch_night_toggle(out):
    """WoWonder's night-mode switch appends dark.css with jQuery; wherever it
    does, add drakkhak-night.css right after it, and remove both together."""
    old_add = "dark.css<?php echo $wo['update_cache']; ?>\" id=\"night-mode-css\">');"
    new_add = ("dark.css<?php echo $wo['update_cache']; ?>\" id=\"night-mode-css\">"
               "<link rel=\"stylesheet\" href=\"<?php echo $wo['config']['theme_url'];?>/stylesheet/drakkhak-night.css"
               "<?php echo $wo['update_cache']; ?>\" id=\"drakkhak-night-css\">');")
    old_rm = "$('#night-mode-css').remove();"
    new_rm = "$('#night-mode-css').remove(); $('#drakkhak-night-css').remove();"
    for dp, _, fs in os.walk(os.path.join(out, 'layout')):
        for f in fs:
            if not f.endswith('.phtml'):
                continue
            q = os.path.join(dp, f)
            s = read(q)
            if 'night-mode-css' not in s:
                continue
            t = s.replace(old_add, new_add).replace(old_rm, new_rm)
            if t != s:
                write(q, t)


# ---------------------------------------------------------------- the study variant
STUDY_LI = '''
							<li class="dk-study-li">
								<?php
								/* Drakkhak Learn. Change this address if you put the
								   practice site somewhere other than /learn on this domain. */
								$dk_study_url = $wo['config']['site_url'] . '/learn';
								?>
								<a class="sixteen-font-size dk-study-btn" href="<?php echo $dk_study_url; ?>" title="Drakkhak Learn: MCQ practice">
									<svg viewBox="0 0 112 28" width="38" height="10" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2"><circle cx="14" cy="14" r="11"/><circle cx="42" cy="14" r="11"/><circle cx="98" cy="14" r="11"/></g><circle cx="70" cy="14" r="12.5" fill="currentColor"/><path d="m63.5 14.4 4.4 4.4 8.4-9.2" fill="none" stroke="var(--dk-card,#FAF9F5)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
									<span>Learn</span>
								</a>
							</li>'''


def add_study_button(out, rename=True):
    """Put a Drakkhak button beside Home in the top bar, in every website mode."""
    p = os.path.join(out, 'layout', 'header', 'content.phtml')
    s = read(p)
    marker = 'id="wo_home_btns">'
    pos, n = 0, 0
    while True:
        i = s.find('data-ajax="?index.php?link1=home" ' + marker, pos)
        if i < 0:
            break
        j = s.find('</li>', i)
        s = s[:j + 5] + STUDY_LI + s[j + 5:]
        pos = j + 5 + len(STUDY_LI)
        n += 1
    if not n:
        sys.exit('build: could not find the Home button in header/content.phtml')
    write(p, s)
    if not rename:
        return
    q = os.path.join(out, 'info.php')
    write(q, read(q).replace("$themeName = 'Drakkhak';", "$themeName = 'Drakkhak + Study';")
                    .replace("$themeFolder = 'drakkhak';", "$themeFolder = '%s';" % os.path.basename(os.path.normpath(out))))


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--patch' in sys.argv:
        for out in args:
            patch_prompts(out)
            patch_register(out)
            patch_pet(out)
            patch_search(out)
            patch_community(out)
            patch_learn_button(out)
            for name in ('javascript/drakkhak-search.js', 'javascript/drakkhak-learn.js', 'stylesheet/drakkhak.css', 'stylesheet/drakkhak-night.css',
                         'layout/learn/content.phtml', 'layout/timeline/drakkhak-study.phtml', 'layout/group/drakkhak-goal.phtml', 'img/icon.png', 'img/favicon.svg'):
                os.makedirs(os.path.dirname(os.path.join(out, name)), exist_ok=True)
                shutil.copy2(os.path.join(OVERLAY, name), os.path.join(out, name))
            for dp, _, fs in os.walk(os.path.join(OVERLAY, 'dk')):
                for f in fs:
                    dst = os.path.join(out, 'dk', f)
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    shutil.copy2(os.path.join(dp, f), dst)
            print('patched', out)
        sys.exit(0)
    if len(args) != 2:
        sys.exit(__doc__)
    build(args[0], args[1])
    if '--study' in sys.argv:
        add_study_button(args[1])
        print('with the Drakkhak study button in the top bar')
