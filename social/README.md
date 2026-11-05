# Drakkhak: one website (WoWonder + Learn)

These are the files that join the community (WoWonder) and Learn (the MCQ practice app in
`../alpha`) into one site. Learn opens at **`/learn`**, inside the site's own header.

## What you get

- **`/learn` inside the site.** Same header as everywhere: bell, messages, your photo, night mode.
  The header search finds chapters on this page. Learn's level, coins, days left, Sound and Timer
  sit in the header. Not signed in, `/learn` opens Learn on its own: no account is needed to practise.
- **One sign-in.** Learn uses the community account. The first time a student signs in, their
  practice so far is kept on the account (the bigger record wins; the other is kept as a backup in
  the browser) and follows them to every device.
- **One night switch, one bell, one cat.** Badges, levels and strong sets reach the site's bell.
  Message buttons in Learn open the site's own chat box.
- **College at sign-up.** One spelling per college (case, commas and spaces ignored).
- **Ranks** (Learn's sidebar): students by active study minutes this week; colleges by the average
  score of their students, once 5 of them have 50 answers each; the **daily duel** (1 v 1 or 2 v 2,
  matched with people who study about as much; most active minutes by midnight wins); the weekly
  **contest**.
- **Shop, Competition shelf:** contest entry (300 coins), challenge a friend (120), leaderboard
  spotlight for 24 h (200), rank shield for 24 h (250). Coins are taken only when the site says yes.
- **Profiles:** a Study card (days studied, average a day, this week, level, streak, badges, college),
  and the level and frame beside names in posts and comments.
- **Groups:** an owner can set a weekly goal in hours; everyone's Learn time counts towards it.
- **Share to Community:** a set result or a streak, level or score card posts to your timeline.
- **A parent's nightly report (optional):** the student adds a parent's email in Learn → Settings and
  agrees; the parent confirms from an email; each night they get active study time and questions
  answered. Either side can stop it.

## Install (cPanel)

Back up the site and the database first.

1. **Upload these files** into the WoWonder root (the folder with `config.php`), replacing the old ones:
   - `index.php`, `.htaccess` (and `nginx.conf` if the server runs nginx)
   - `sources/learn.php`, `xhr/drakkhak.php`
   - the whole `drakkhak/` folder

   `config.php` is not touched and is not in this folder.
2. **Theme:** upload `../theme/drakkhak-study` as `themes/drakkhak-study` (or `../theme/drakkhak`
   as `themes/drakkhak`) and activate it in Admin Panel → Design → Themes.
3. **Learn:** upload everything in `../alpha` (except `source/`, `scripts/`, `CLAUDE.md` and `.git`)
   into a folder named **`learn-app`** in the WoWonder root.
   If an older copy sits in a folder called `learn`, **delete or rename that folder**: a real
   `learn` folder would hide the new `/learn` page.
4. **Auto username:** Admin Panel → Settings → *Auto username* **off**, so the sign-up form keeps
   the full name and the username made from it.
5. **The nightly job:** cPanel → Cron Jobs, once a day:
   `30 21 * * *  php /home/YOURUSER/public_html/drakkhak/cron.php`
   (that is 9:30 pm if the server clock is Bangladesh time; on a UTC server use `30 15 * * *`).
   It settles yesterday's duels and sends the parents' reports. Email goes through WoWonder's own
   mail settings (Admin Panel → Settings → E-mail), so set SMTP there.

The tables are created by themselves the first time `/learn` is used: nine new tables, all named
`dk_*` (`drakkhak/setup.sql`). No WoWonder table changes shape. Setup also sets one language
string: *Username must be one word (letters, numbers and underscore only).*
To create them by hand instead, import `drakkhak/setup.sql` in phpMyAdmin.

## Where things are

| file | what it does |
|---|---|
| `sources/learn.php`, `index.php` (one block) | the `/learn` page; guests go to `/learn-app/` |
| `.htaccess` (one line), `nginx.conf` | the `/learn` address |
| `xhr/drakkhak.php` | what Learn asks the site (`requests.php?f=drakkhak&s=...`), signed in only |
| `drakkhak/lib.php` | everything the site keeps: study summary, record, colleges, rankings, duels, items, bell, parents, groups |
| `drakkhak/setup.sql` | the `dk_*` tables |
| `drakkhak/parent.php` | the parent's confirm / stop link (a button, so mail scanners cannot click it) |
| `drakkhak/colleges.php` | college names for the sign-up form |
| `drakkhak/cron.php` | the nightly job |
| theme `layout/learn/content.phtml`, `javascript/drakkhak-learn.js` | the page around Learn and the glue between the two |
| Learn `js/account.js`, `js/ranks.js` | the account in Learn, and the Ranks page and competition items |

Only active minutes count, the ones Learn measures while a student is really working; Learn
sends a short summary about once a minute while it is open.

## Tested

On a local copy of this WoWonder (PHP 8, MariaDB) with five test students: sign-up with college
(three spellings became one college), `/learn` signed in and out, a set answered with the header
chips and the bell updating, sync and record saved, the four Ranks tabs, a matched duel and a friend
challenge accepted, the cron settling a duel, buying the competition items, header search, night
mode both ways, the parent confirm link, share to the timeline, the profile Study card and name
badges, a group goal, and the phone layout. Emails were not sent (no mail server locally).
