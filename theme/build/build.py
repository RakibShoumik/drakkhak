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
    with open(p, encoding='utf-8', errors='surrogateescape') as f:
        return f.read()


def write(p, s):
    with open(p, 'w', encoding='utf-8', errors='surrogateescape') as f:
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
    print('Drakkhak theme written to', out)


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


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    build(sys.argv[1], sys.argv[2])
