<?php
/* ===========================================================
   DRAKKHAK — the one-website layer on top of WoWonder.

   Learn (the MCQ app at /learn/) and the community (WoWonder) share one
   account: a WoWonder account. This file holds everything the two halves
   share on the server. It only ADDS tables (all named dk_*) and never
   changes the structure of a WoWonder table. It writes WoWonder data only
   through WoWonder's own functions (a post, a notification, the user's own
   name and school after sign-up).

   Loaded by xhr/drakkhak.php (requests.php?f=drakkhak), by the theme
   templates (profile card, name badges, group goal) and by the small pages
   in this folder (parent links, college list, the nightly job).
   =========================================================== */
if (!defined('DK_LIB')) {
define('DK_LIB', 1);
define('DK_TZ', 'Asia/Dhaka');          /* the day everything is counted in */
define('DK_MIN_COLLEGE', 5);            /* students a college needs before it is ranked */
define('DK_MIN_ANSWERS', 50);           /* answers before a student's score counts for a college */
define('DK_RECORD_MAX', 8 * 1024 * 1024);

function dk_db() { global $sqlConnect; return $sqlConnect; }

/* a prepared query: dk_q("SELECT ... WHERE a = ? AND b = ?", 'is', 5, 'x') */
function dk_q($sql, $types = '', ...$args) {
    $db = dk_db();
    /* PHP 8.1+ makes mysqli throw; a failed query here is a false, never a blank page */
    try {
        $st = $db->prepare($sql);
        if (!$st) return false;
        if ($types !== '') $st->bind_param($types, ...$args);
        if (!$st->execute()) { $st->close(); return false; }
        $res = $st->get_result();
        if ($res === false) { $n = $st->affected_rows; $id = $st->insert_id; $st->close(); return array('affected' => $n, 'id' => $id); }
        $rows = array();
        while ($r = $res->fetch_assoc()) $rows[] = $r;
        $st->close();
        return $rows;
    } catch (Throwable $e) {
        error_log('drakkhak: ' . $e->getMessage());
        return false;
    }
}
function dk_one($sql, $types = '', ...$args) { $r = dk_q($sql, $types, ...$args); return is_array($r) && isset($r[0]) ? $r[0] : null; }

/* ---------- the tables: created the first time they are needed ---------- */
function dk_install() {
    static $done = false;
    if ($done) return;
    $done = true;
    $flag = dirname(__FILE__) . '/.installed-v1';
    if (is_file($flag)) return;
    $sql = (string) file_get_contents(dirname(__FILE__) . '/setup.sql');
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);          /* comments may hold a ';' */
    $ok = true;
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $stmt) {
        if (stripos($stmt, 'CREATE TABLE') !== 0 && stripos($stmt, 'UPDATE') !== 0) continue;
        try { if (!mysqli_query(dk_db(), $stmt) && stripos($stmt, 'CREATE') === 0) $ok = false; }
        catch (Throwable $e) { error_log('drakkhak setup: ' . $e->getMessage()); if (stripos($stmt, 'CREATE') === 0) $ok = false; }
    }
    if ($ok) @file_put_contents($flag, date('c'));
}

/* ---------- days and weeks, in Bangladesh time ---------- */
function dk_now() { return new DateTime('now', new DateTimeZone(DK_TZ)); }
function dk_today() { return dk_now()->format('Y-m-d'); }
function dk_day_ok($d) { return is_string($d) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d); }
function dk_week_start($day = null) {
    $d = $day ? new DateTime($day, new DateTimeZone(DK_TZ)) : dk_now();
    $dow = (int) $d->format('N');                 /* 1 = Monday */
    $d->modify('-' . ($dow - 1) . ' days');
    return $d->format('Y-m-d');
}
function dk_week_key() { return dk_now()->format('o-\WW'); }

/* ---------- a person, as both halves show them ---------- */
function dk_user($user_id) {
    static $cache = array();
    $user_id = (int) $user_id;
    if (!$user_id) return null;
    if (array_key_exists($user_id, $cache)) return $cache[$user_id];
    $u = function_exists('Wo_UserData') ? Wo_UserData($user_id) : null;
    $cache[$user_id] = (is_array($u) && !empty($u['user_id'])) ? array(
        'id' => (int) $u['user_id'], 'username' => $u['username'], 'name' => $u['name'],
        'avatar' => $u['avatar'], 'url' => $u['url'], 'verified' => !empty($u['verified'])) : null;
    return $cache[$user_id];
}
function dk_study($user_id) {
    dk_install();
    return dk_one("SELECT * FROM dk_study WHERE user_id = ?", 'i', (int) $user_id);
}
function dk_profile($user_id) {
    dk_install();
    $p = dk_one("SELECT p.*, c.name AS college FROM dk_profile p LEFT JOIN dk_colleges c ON c.id = p.college_id WHERE p.user_id = ?", 'i', (int) $user_id);
    return $p ? $p : array('user_id' => (int) $user_id, 'college_id' => 0, 'college' => '', 'parent_email' => '', 'parent_phone' => '', 'parent_ok' => 0, 'parent_consent' => 0);
}

/* ---------- colleges: one spelling each, so students of one college count together ---------- */
function dk_norm_college($name) {
    $n = function_exists('mb_strtolower') ? mb_strtolower($name, 'UTF-8') : strtolower($name);
    $n = preg_replace('/[\.,\'"()\-]+/u', ' ', $n);
    $n = preg_replace('/\b(govt|gov)\b/u', 'government', $n);
    $n = preg_replace('/\s+/u', ' ', trim($n));
    return $n;
}
function dk_set_college($user_id, $name) {
    dk_install();
    $name = trim(preg_replace('/\s+/u', ' ', strip_tags((string) $name)));
    if (function_exists('mb_substr')) $name = mb_substr($name, 0, 120, 'UTF-8'); else $name = substr($name, 0, 120);
    $cid = 0;
    if ($name !== '') {
        $norm = dk_norm_college($name);
        $row = dk_one("SELECT id, name FROM dk_colleges WHERE norm = ?", 's', $norm);
        if ($row) $cid = (int) $row['id'];
        else { $r = dk_q("INSERT INTO dk_colleges (name, norm) VALUES (?, ?)", 'ss', $name, $norm); $cid = is_array($r) ? (int) $r['id'] : 0; }
    }
    dk_q("INSERT INTO dk_profile (user_id, college_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE college_id = VALUES(college_id)", 'ii', (int) $user_id, $cid);
    /* the profile's own "school" field shows it on the WoWonder profile too, if it is empty */
    if ($name !== '' && function_exists('Wo_UpdateUserData')) {
        $u = Wo_UserData((int) $user_id);
        if (is_array($u) && empty($u['school'])) Wo_UpdateUserData((int) $user_id, array('school' => Wo_Secure($name)));
    }
    return $cid;
}
function dk_colleges_like($q, $limit = 12) {
    dk_install();
    $q = '%' . dk_norm_college($q) . '%';
    return dk_q("SELECT c.name, COUNT(p.user_id) AS n FROM dk_colleges c LEFT JOIN dk_profile p ON p.college_id = c.id WHERE c.norm LIKE ? GROUP BY c.id ORDER BY n DESC, c.name LIMIT " . (int) $limit, 's', $q);
}

/* ---------- what Learn sends: a summary, and the minutes of recent days ---------- */
function dk_sync($user_id, $sum, $days) {
    dk_install();
    $u = (int) $user_id;
    $i = function ($k, $max = 4294967295) use ($sum) { return isset($sum[$k]) && is_numeric($sum[$k]) ? max(0, min($max, (int) $sum[$k])) : 0; };
    $s = function ($k, $len) use ($sum) { return isset($sum[$k]) ? substr(preg_replace('/[^a-z0-9_\- ]/i', '', (string) $sum[$k]), 0, $len) : ''; };
    $ed = isset($sum['edition']) && $sum['edition'] === 'ssc' ? 'ssc' : 'hsc';
    dk_q("INSERT INTO dk_study (user_id, xp, level, coins, streak, best, answered, correct, score, minutes, days, badges, frame, title, flair, edition, updated)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE xp=VALUES(xp), level=VALUES(level), coins=VALUES(coins), streak=VALUES(streak), best=VALUES(best),
            answered=VALUES(answered), correct=VALUES(correct), score=VALUES(score), minutes=VALUES(minutes), days=VALUES(days),
            badges=VALUES(badges), frame=VALUES(frame), title=VALUES(title), flair=VALUES(flair), edition=VALUES(edition), updated=VALUES(updated)",
        'iiiiiiiiiiiissssi', $u, $i('xp'), $i('level', 65535), $i('coins'), $i('streak', 65535), $i('best', 65535), $i('answered'), $i('correct'),
        $i('score', 100), $i('minutes'), $i('days', 65535), $i('badges', 65535), $s('frame', 16), $s('title', 40), $s('flair', 16), $ed, time());
    if (is_array($days)) {
        $n = 0;
        $earliest = (new DateTime('now', new DateTimeZone(DK_TZ)))->modify('-21 days')->format('Y-m-d');
        $tomorrow = (new DateTime('now', new DateTimeZone(DK_TZ)))->modify('+1 day')->format('Y-m-d');
        foreach ($days as $day => $d) {
            if (!dk_day_ok($day) || $day < $earliest || $day > $tomorrow || ++$n > 30) continue;
            $m = isset($d['m']) ? max(0, min(1440, (int) $d['m'])) : 0;
            $a = isset($d['a']) ? max(0, min(65535, (int) $d['a'])) : 0;
            $c = isset($d['c']) ? max(0, min(65535, (int) $d['c'])) : 0;
            dk_q("INSERT INTO dk_days (user_id, day, minutes, answered, correct) VALUES (?,?,?,?,?)
                  ON DUPLICATE KEY UPDATE minutes=VALUES(minutes), answered=VALUES(answered), correct=VALUES(correct)", 'isiii', $u, $day, $m, $a, $c);
        }
    }
    return true;
}

/* ---------- the record itself, so progress follows the account to any device ---------- */
function dk_save_record($user_id, $data, $answered) {
    dk_install();
    if (!is_string($data) || strlen($data) > DK_RECORD_MAX) return false;
    if (json_decode($data) === null) return false;
    $r = dk_q("INSERT INTO dk_record (user_id, data, answered, updated) VALUES (?,?,?,?)
               ON DUPLICATE KEY UPDATE data=VALUES(data), answered=VALUES(answered), updated=VALUES(updated)", 'isii', (int) $user_id, $data, max(0, (int) $answered), time());
    return $r !== false;
}
function dk_load_record($user_id) {
    dk_install();
    return dk_one("SELECT data, answered, updated FROM dk_record WHERE user_id = ?", 'i', (int) $user_id);
}

/* ---------- the profile card: days studied and average time ---------- */
function dk_stats($user_id) {
    dk_install();
    $u = (int) $user_id;
    $st = dk_study($u);
    $d = dk_one("SELECT COUNT(*) AS days, COALESCE(SUM(minutes),0) AS mins FROM dk_days WHERE user_id = ? AND minutes > 0", 'i', $u);
    $w = dk_one("SELECT COALESCE(SUM(minutes),0) AS mins FROM dk_days WHERE user_id = ? AND day >= ?", 'is', $u, dk_week_start());
    $days = max((int) ($st ? $st['days'] : 0), (int) $d['days']);
    $mins = max((int) ($st ? $st['minutes'] : 0), (int) $d['mins']);
    $p = dk_profile($u);
    return array(
        'has' => $st || $days > 0,
        'days' => $days,
        'avg_min' => $days ? round($mins / $days) : 0,
        'week_min' => (int) $w['mins'],
        'level' => $st ? (int) $st['level'] : 1,
        'streak' => $st ? (int) $st['streak'] : 0,
        'best' => $st ? (int) $st['best'] : 0,
        'badges' => $st ? (int) $st['badges'] : 0,
        'answered' => $st ? (int) $st['answered'] : 0,
        'score' => $st ? (int) $st['score'] : 0,
        'frame' => $st ? $st['frame'] : '',
        'title' => $st ? $st['title'] : '',
        'college' => $p['college'],
    );
}
function dk_hours($min) {
    $min = (int) $min;
    if ($min < 60) return $min . ' min';
    $h = floor($min / 60); $m = $min % 60;
    return $h . ' hr' . ($m ? ' ' . $m . ' min' : '');
}

/* ---------- rankings ---------- */
/* effort: active study minutes this week, the only thing that moves it */
function dk_board_students($me = 0, $limit = 50, $contest = false) {
    dk_install();
    $week = dk_week_start();
    $join = $contest ? " JOIN dk_contest k ON k.user_id = d.user_id AND k.week = '" . dk_week_key() . "'" : '';
    $rows = dk_q("SELECT d.user_id, SUM(d.minutes) AS mins, s.level, s.streak, s.spotlight_until, s.shield_until, s.shield_rank, s.frame
                  FROM dk_days d LEFT JOIN dk_study s ON s.user_id = d.user_id {$join}
                  WHERE d.day >= ? GROUP BY d.user_id HAVING mins > 0 ORDER BY mins DESC, d.user_id ASC LIMIT 500", 's', $week);
    if (!is_array($rows)) $rows = array();
    $now = time();
    /* a rank shield holds a place for a day: others may pass, the holder does not fall below it */
    $held = array(); $free = array();
    foreach ($rows as $i => $r) {
        $r['rank'] = $i + 1;
        if ((int) $r['shield_until'] > $now && (int) $r['shield_rank'] > 0 && $r['rank'] > (int) $r['shield_rank']) $held[] = $r; else $free[] = $r;
    }
    usort($held, function ($a, $b) { return $a['shield_rank'] - $b['shield_rank']; });
    foreach ($held as $h) array_splice($free, min(count($free), (int) $h['shield_rank'] - 1), 0, array($h));
    $out = array(); $mine = null;
    foreach ($free as $i => $r) {
        $row = array('rank' => $i + 1, 'mins' => (int) $r['mins'], 'level' => (int) $r['level'], 'streak' => (int) $r['streak'],
            'spot' => (int) $r['spotlight_until'] > $now, 'shield' => (int) $r['shield_until'] > $now, 'frame' => (string) $r['frame'], 'me' => (int) $r['user_id'] === (int) $me);
        if ($i < $limit || $row['me']) {
            $u = dk_user($r['user_id']);
            if (!$u) continue;
            $row['user'] = $u;
            if ($i < $limit) $out[] = $row;
            if ($row['me']) $mine = $row;
        }
    }
    return array('week' => $week, 'rows' => $out, 'me' => $mine, 'total' => count($free));
}
/* colleges: the average score of their students, once enough of them study */
function dk_board_colleges($me = 0, $limit = 50) {
    dk_install();
    $rows = dk_q("SELECT c.id, c.name, COUNT(*) AS n, ROUND(AVG(s.score)) AS avg, COALESCE(SUM(w.mins),0) AS mins
                  FROM dk_profile p JOIN dk_colleges c ON c.id = p.college_id JOIN dk_study s ON s.user_id = p.user_id
                  LEFT JOIN (SELECT user_id, SUM(minutes) AS mins FROM dk_days WHERE day >= ? GROUP BY user_id) w ON w.user_id = p.user_id
                  WHERE s.answered >= ? GROUP BY c.id ORDER BY avg DESC, n DESC", 'si', dk_week_start(), DK_MIN_COLLEGE > 0 ? DK_MIN_ANSWERS : 0);
    if (!is_array($rows)) $rows = array();
    $ranked = array(); $mine = null;
    $myc = $me ? (int) dk_profile($me)['college_id'] : 0;
    foreach ($rows as $r) {
        $ok = (int) $r['n'] >= DK_MIN_COLLEGE;
        $row = array('id' => (int) $r['id'], 'name' => $r['name'], 'students' => (int) $r['n'], 'avg' => (int) $r['avg'], 'week_min' => (int) $r['mins'], 'ranked' => $ok);
        if ($ok) { $row['rank'] = count($ranked) + 1; $ranked[] = $row; }
        if ($row['id'] === $myc) $mine = $row;
    }
    if ($myc && !$mine) {
        $c = dk_one("SELECT c.id, c.name, COUNT(p.user_id) AS n FROM dk_colleges c LEFT JOIN dk_profile p ON p.college_id = c.id WHERE c.id = ? GROUP BY c.id", 'i', $myc);
        if ($c) $mine = array('id' => (int) $c['id'], 'name' => $c['name'], 'students' => 0, 'avg' => 0, 'week_min' => 0, 'ranked' => false);
    }
    return array('rows' => array_slice($ranked, 0, $limit), 'me' => $mine, 'min' => DK_MIN_COLLEGE, 'min_answers' => DK_MIN_ANSWERS);
}

/* ---------- the daily duel: active minutes today, against someone like you ---------- */
function dk_avg_daily($user_id) {
    $from = (new DateTime('now', new DateTimeZone(DK_TZ)))->modify('-14 days')->format('Y-m-d');
    $r = dk_one("SELECT COALESCE(AVG(minutes),0) AS a FROM dk_days WHERE user_id = ? AND day >= ? AND day < ? AND minutes > 0", 'iss', (int) $user_id, $from, dk_today());
    return (int) round($r ? $r['a'] : 0);
}
function dk_duel_of($user_id, $day = null) {
    $day = $day ?: dk_today();
    $u = (int) $user_id;
    return dk_one("SELECT * FROM dk_duels WHERE day = ? AND status <> 'declined' AND (a1 = ? OR a2 = ? OR b1 = ? OR b2 = ?) ORDER BY id DESC LIMIT 1", 'siiii', $day, $u, $u, $u, $u);
}
function dk_join_duel($user_id, $size) {
    dk_install();
    $u = (int) $user_id; $size = $size == 2 ? 2 : 1; $day = dk_today();
    if (dk_duel_of($u)) return dk_duel_view($u);
    $avg = dk_avg_daily($u);
    dk_q("INSERT INTO dk_queue (user_id, day, size, avg, created) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE size=VALUES(size), avg=VALUES(avg)", 'isiii', $u, $day, $size, $avg, time());
    dk_match($day, $size);
    return dk_duel_view($u);
}
function dk_leave_queue($user_id) { dk_q("DELETE FROM dk_queue WHERE user_id = ? AND day = ?", 'is', (int) $user_id, dk_today()); }
/* pair the waiting: similar averages first; the longer someone waits, the wider the net */
function dk_match($day, $size) {
    $need = $size == 2 ? 4 : 2;
    $q = dk_q("SELECT user_id, avg, created FROM dk_queue WHERE day = ? AND size = ? ORDER BY created ASC", 'si', $day, $size);
    if (!is_array($q) || count($q) < $need) return;
    $now = time(); $used = array();
    foreach ($q as $a) {
        if (isset($used[$a['user_id']])) continue;
        $wait_h = ($now - (int) $a['created']) / 3600;
        $tol = max(10, (int) $a['avg'] * (0.35 + 0.25 * $wait_h));
        $group = array($a);
        foreach ($q as $b) {
            if ($b['user_id'] == $a['user_id'] || isset($used[$b['user_id']])) continue;
            if (abs((int) $b['avg'] - (int) $a['avg']) <= $tol || $wait_h >= 3) $group[] = $b;
            if (count($group) >= $need) break;
        }
        if (count($group) < $need) continue;
        foreach ($group as $g) $used[$g['user_id']] = 1;
        if ($need == 2) { $A = array($group[0]['user_id'], 0); $B = array($group[1]['user_id'], 0); }
        else {
            usort($group, function ($x, $y) { return $y['avg'] - $x['avg']; });
            $A = array($group[0]['user_id'], $group[3]['user_id']); $B = array($group[1]['user_id'], $group[2]['user_id']);
        }
        dk_q("INSERT INTO dk_duels (day, size, a1, a2, b1, b2, status, created) VALUES (?,?,?,?,?,?, 'open', ?)", 'siiiiii', $day, $size, $A[0], $A[1], $B[0], $B[1], $now);
        foreach ($group as $g) dk_q("DELETE FROM dk_queue WHERE user_id = ? AND day = ?", 'is', (int) $g['user_id'], $day);
        foreach ($group as $g) dk_notify_user((int) $g['user_id'], (int) $group[0]['user_id'] == (int) $g['user_id'] ? (int) $group[1]['user_id'] : (int) $group[0]['user_id'],
            $need == 2 ? 'is in your 2 v 2 study duel today. Most active minutes by midnight wins.' : 'is your study duel today. Most active minutes by midnight wins.', '/learn#/ranks/duel');
    }
}
/* a friend, by name: a duel bought in the shop */
function dk_challenge($from, $to) {
    dk_install();
    $from = (int) $from; $to = (int) $to;
    if (!$to || $to === $from || !dk_user($to)) return array('error' => 'Pick a friend.');
    if (dk_duel_of($from)) return array('error' => 'You already have a duel today.');
    if (dk_duel_of($to)) return array('error' => 'They already have a duel today.');
    dk_leave_queue($from);
    dk_q("INSERT INTO dk_duels (day, size, a1, b1, status, friend, created) VALUES (?, 1, ?, ?, 'invited', 1, ?)", 'siii', dk_today(), $from, $to, time());
    /* the bell puts the challenger's name in front of this */
    dk_notify_user($to, $from, 'challenged you to a study duel today. Most active minutes by midnight wins.', '/learn#/ranks/duel');
    return array('ok' => true);
}
function dk_answer_challenge($user_id, $yes) {
    $d = dk_duel_of($user_id);
    if (!$d || $d['status'] !== 'invited' || (int) $d['b1'] !== (int) $user_id) return array('error' => 'No challenge to answer.');
    dk_q("UPDATE dk_duels SET status = ? WHERE id = ?", 'si', $yes ? 'open' : 'declined', (int) $d['id']);
    dk_notify_user((int) $d['a1'], (int) $user_id, $yes ? 'accepted your study duel. Game on.' : 'cannot duel today.', '/learn#/ranks/duel');
    return array('ok' => true);
}
function dk_team_minutes($day, $ids) {
    $ids = array_values(array_filter(array_map('intval', $ids)));
    if (!$ids) return 0;
    $r = dk_one("SELECT COALESCE(SUM(minutes),0) AS m FROM dk_days WHERE day = ? AND user_id IN (" . implode(',', $ids) . ")", 's', $day);
    return (int) $r['m'];
}
function dk_duel_view($user_id) {
    dk_install();
    $u = (int) $user_id;
    dk_settle_duels();
    $d = dk_duel_of($u);
    if (!$d) {
        $q = dk_one("SELECT size FROM dk_queue WHERE user_id = ? AND day = ?", 'is', $u, dk_today());
        $last = dk_one("SELECT * FROM dk_duels WHERE status = 'done' AND (a1 = ? OR a2 = ? OR b1 = ? OR b2 = ?) ORDER BY day DESC, id DESC LIMIT 1", 'iiii', $u, $u, $u, $u);
        return array('state' => $q ? 'waiting' : 'none', 'size' => $q ? (int) $q['size'] : 0, 'avg' => dk_avg_daily($u), 'last' => $last ? dk_duel_summary($last, $u) : null);
    }
    return dk_duel_summary($d, $u);
}
function dk_duel_summary($d, $u) {
    $mine = in_array($u, array((int) $d['a1'], (int) $d['a2'])) ? 'a' : 'b';
    $side = function ($ids) use ($d) {
        $out = array();
        foreach ($ids as $id) if ($id) { $p = dk_user($id); $m = dk_team_minutes($d['day'], array($id)); if ($p) $out[] = array('user' => $p, 'mins' => $m); }
        return $out;
    };
    $A = $side(array((int) $d['a1'], (int) $d['a2'])); $B = $side(array((int) $d['b1'], (int) $d['b2']));
    $sum = function ($s) { $t = 0; foreach ($s as $p) $t += $p['mins']; return $t; };
    return array('state' => $d['status'], 'id' => (int) $d['id'], 'day' => $d['day'], 'size' => (int) $d['size'], 'friend' => (int) $d['friend'],
        'mine' => $mine, 'us' => $mine === 'a' ? $A : $B, 'them' => $mine === 'a' ? $B : $A,
        'us_min' => $mine === 'a' ? $sum($A) : $sum($B), 'them_min' => $mine === 'a' ? $sum($B) : $sum($A),
        'winner' => $d['winner'] === '' ? '' : ($d['winner'] === 't' ? 'tie' : ($d['winner'] === $mine ? 'us' : 'them')),
        'invited_me' => $d['status'] === 'invited' && (int) $d['b1'] === $u);
}
/* yesterday's duels are decided once the day is over */
function dk_settle_duels() {
    $today = dk_today();
    $open = dk_q("SELECT * FROM dk_duels WHERE day < ? AND status IN ('open','invited') LIMIT 200", 's', $today);
    if (!is_array($open)) return;
    foreach ($open as $d) {
        if ($d['status'] === 'invited') { dk_q("UPDATE dk_duels SET status = 'declined' WHERE id = ?", 'i', (int) $d['id']); continue; }
        $a = dk_team_minutes($d['day'], array($d['a1'], $d['a2'])); $b = dk_team_minutes($d['day'], array($d['b1'], $d['b2']));
        $w = $a > $b ? 'a' : ($b > $a ? 'b' : 't');
        dk_q("UPDATE dk_duels SET status = 'done', winner = ? WHERE id = ? AND status = 'open'", 'si', $w, (int) $d['id']);
        foreach (array('a1', 'a2', 'b1', 'b2') as $k) {
            if (!(int) $d[$k]) continue;
            $side = $k[0];
            $text = $w === 't' ? "Yesterday's study duel was a tie: {$a} min each side." : ($w === $side ? "You won yesterday's study duel, {$a} to {$b} minutes." : "Yesterday's study duel went to the other side, {$a} to {$b} minutes. Rematch today?");
            if ($side === 'b' && $w !== 't') $text = $w === 'b' ? "You won yesterday's study duel, {$b} to {$a} minutes." : "Yesterday's study duel went to the other side, {$b} to {$a} minutes. Rematch today?";
            dk_notify_self((int) $d[$k], $text, '/learn#/ranks/duel');
        }
    }
}

/* ---------- the one bell: Learn's moments become WoWonder notifications ---------- */
function dk_site_path($path) {
    global $wo;
    return rtrim($wo['config']['site_url'], '/') . $path;
}
/* from one person to another, through WoWonder's own function */
function dk_notify_user($to, $from, $text, $path) {
    global $wo;
    if (!$to || !$from || $to == $from || !function_exists('Wo_RegisterNotification')) return false;
    $keep = isset($wo['user']) ? $wo['user'] : null; $kept = isset($wo['loggedin']) ? $wo['loggedin'] : false;
    if (empty($wo['user']['user_id']) || (int) $wo['user']['user_id'] !== (int) $from) { $wo['user'] = Wo_UserData($from); $wo['loggedin'] = true; }
    $ok = Wo_RegisterNotification(array('recipient_id' => (int) $to, 'notifier_id' => (int) $from, 'type' => 'drakkhak',
        'text' => mb_substr(strip_tags((string) $text), 0, 240, 'UTF-8'), 'url' => 'index.php?link1=learn', 'full_link' => dk_site_path($path)));
    $wo['user'] = $keep; $wo['loggedin'] = $kept;
    return $ok;
}
/* to yourself (a badge, a level, a set): written straight to the bell, from the site */
function dk_notify_self($to, $text, $path) {
    if (!$to) return false;
    /* stored escaped, the way WoWonder stores its own notification text */
    $text = htmlspecialchars(mb_substr(strip_tags((string) $text), 0, 240, 'UTF-8'), ENT_QUOTES, 'UTF-8');
    $r = dk_q("INSERT INTO " . T_NOTIFICATION . " (notifier_id, recipient_id, type, text, url, full_link, seen, time) VALUES (?, ?, 'drakkhak', ?, 'index.php?link1=learn', ?, 0, ?)",
        'iissi', (int) $to, (int) $to, $text, dk_site_path($path), time());
    return $r !== false;
}

/* ---------- the parent's nightly report ---------- */
function dk_set_parent($user_id, $email, $phone, $consent) {
    dk_install();
    global $wo;
    $email = trim((string) $email); $phone = preg_replace('/[^0-9+ ]/', '', (string) $phone);
    if ($email === '' && $phone === '') {
        dk_q("INSERT INTO dk_profile (user_id) VALUES (?) ON DUPLICATE KEY UPDATE parent_email = '', parent_phone = '', parent_ok = 0, parent_token = '', parent_consent = 0", 'i', (int) $user_id);
        return array('ok' => true, 'removed' => true);
    }
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) return array('error' => 'That email address does not look right.');
    if (!$consent) return array('error' => 'Tick the box to agree that this parent may see your study time.');
    $token = bin2hex(random_bytes(16));
    dk_q("INSERT INTO dk_profile (user_id, parent_email, parent_phone, parent_ok, parent_token, parent_consent) VALUES (?,?,?,0,?,?)
          ON DUPLICATE KEY UPDATE parent_email=VALUES(parent_email), parent_phone=VALUES(parent_phone), parent_ok=0, parent_token=VALUES(parent_token), parent_consent=VALUES(parent_consent)",
        'isssi', (int) $user_id, $email, $phone, $token, time());
    $sent = false;
    if ($email !== '') {
        $u = dk_user($user_id);
        $link = dk_site_path('/drakkhak/parent.php?t=' . $token);
        $body = '<p>Hello,</p><p><b>' . htmlspecialchars($u ? $u['name'] : 'A student') . '</b> added you on ' . htmlspecialchars($wo['config']['siteName']) .
            ' to receive a short report each night of how long they studied that day. Only study time and questions answered are shared; never messages or posts.</p>' .
            '<p><a href="' . $link . '&do=ok">Yes, send me the nightly report</a></p><p>If you do not know this student, ignore this email and nothing will be sent.</p>';
        $sent = dk_mail($email, 'Confirm the nightly study report for ' . ($u ? $u['name'] : 'a student'), $body);
    }
    return array('ok' => true, 'sent' => $sent, 'pending' => $email !== '');
}
function dk_mail($to, $subject, $html) {
    global $wo;
    if (!function_exists('Wo_SendMessage')) return false;
    return (bool) Wo_SendMessage(array('from_email' => $wo['config']['siteEmail'], 'from_name' => $wo['config']['siteName'], 'to_email' => $to, 'to_name' => '',
        'subject' => $subject, 'charSet' => 'utf-8', 'message_body' => $html, 'is_html' => true));
}
function dk_parent_reports($force = false) {
    dk_install();
    global $wo;
    $today = dk_today(); $sent = 0;
    $rows = dk_q("SELECT p.user_id, p.parent_email FROM dk_profile p WHERE p.parent_ok = 1 AND p.parent_email <> '' AND (p.report_day IS NULL OR p.report_day < ?) LIMIT 2000", 's', $today);
    if (!is_array($rows)) return 0;
    foreach ($rows as $r) {
        $u = dk_user($r['user_id']); if (!$u) continue;
        $d = dk_one("SELECT minutes, answered, correct FROM dk_days WHERE user_id = ? AND day = ?", 'is', (int) $r['user_id'], $today);
        $w = dk_one("SELECT COALESCE(SUM(minutes),0) AS m FROM dk_days WHERE user_id = ? AND day >= ?", 'is', (int) $r['user_id'], dk_week_start());
        $m = $d ? (int) $d['minutes'] : 0; $a = $d ? (int) $d['answered'] : 0; $c = $d ? (int) $d['correct'] : 0;
        $tok = dk_one("SELECT parent_token FROM dk_profile WHERE user_id = ?", 'i', (int) $r['user_id']);
        $stop = dk_site_path('/drakkhak/parent.php?t=' . ($tok ? $tok['parent_token'] : '') . '&do=stop');
        $html = '<p>Tonight\'s study report for <b>' . htmlspecialchars($u['name']) . '</b> (' . htmlspecialchars($today) . '):</p>' .
            '<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">' .
            '<tr><td>Active study time today</td><td><b>' . dk_hours($m) . '</b></td></tr>' .
            '<tr><td>Questions answered today</td><td><b>' . $a . '</b>' . ($a ? ' (' . round(100 * $c / max(1, $a)) . '% right)' : '') . '</td></tr>' .
            '<tr><td>This week so far</td><td><b>' . dk_hours((int) $w['m']) . '</b></td></tr></table>' .
            '<p style="color:#777;font-size:12px">Active time counts only the minutes the app was really in use. <a href="' . $stop . '">Stop these emails</a>.</p>';
        if (dk_mail($r['parent_email'], 'Study report: ' . $u['name'] . ', ' . dk_hours($m) . ' today', $html)) $sent++;
        dk_q("UPDATE dk_profile SET report_day = ? WHERE user_id = ?", 'si', $today, (int) $r['user_id']);
    }
    return $sent;
}

/* ---------- shown beside a name in Community: level, streak, frame ---------- */
function dk_badges_for($ids) {
    static $cache = array();
    $ids = array_values(array_filter(array_map('intval', (array) $ids), function ($i) use ($cache) { return $i > 0 && !array_key_exists($i, $cache); }));
    if ($ids) {
        dk_install();
        foreach ($ids as $i) $cache[$i] = null;
        $rows = dk_q("SELECT user_id, level, streak, frame, title, spotlight_until FROM dk_study WHERE user_id IN (" . implode(',', $ids) . ")");
        if (is_array($rows)) foreach ($rows as $r) $cache[(int) $r['user_id']] = $r;
    }
    return $cache;
}
function dk_name_badge($user_id) {
    $user_id = (int) $user_id;
    if (!$user_id) return '';
    $all = dk_badges_for(array($user_id));
    $r = isset($all[$user_id]) ? $all[$user_id] : null;
    if (!$r || (int) $r['level'] < 1) return '';
    $tip = 'Learn: level ' . (int) $r['level'] . ((int) $r['streak'] > 1 ? ', ' . (int) $r['streak'] . '-day streak' : '');
    $frame = preg_replace('/[^a-z0-9]/', '', (string) $r['frame']);
    return ' <a class="dk-nb' . ($frame ? ' fr-' . $frame : '') . '" href="' . htmlspecialchars(dk_site_path('/learn')) . '" title="' . htmlspecialchars($tip) . '">' .
        '<i class="dk-nb-lv">' . (int) $r['level'] . '</i>' . ((int) $r['streak'] > 1 ? '<i class="dk-nb-st">' . (int) $r['streak'] . '</i>' : '') . '</a>';
}

/* ---------- study groups: a WoWonder group with a weekly goal ---------- */
function dk_group_goal($group_id, $viewer = 0) {
    dk_install();
    $g = (int) $group_id;
    $goal = dk_one("SELECT minutes FROM dk_group_goals WHERE group_id = ?", 'i', $g);
    $members = dk_q("SELECT user_id FROM " . T_GROUP_MEMBERS . " WHERE group_id = ? AND active = '1'", 'i', $g);
    $owner = dk_one("SELECT user_id FROM " . T_GROUPS . " WHERE id = ?", 'i', $g);
    $ids = array();
    if (is_array($members)) foreach ($members as $m) $ids[] = (int) $m['user_id'];
    if ($owner) $ids[] = (int) $owner['user_id'];
    $ids = array_values(array_unique($ids));
    $top = array(); $total = 0;
    if ($ids) {
        $rows = dk_q("SELECT user_id, SUM(minutes) AS m FROM dk_days WHERE day >= ? AND user_id IN (" . implode(',', $ids) . ") GROUP BY user_id ORDER BY m DESC", 's', dk_week_start());
        if (is_array($rows)) foreach ($rows as $r) { $total += (int) $r['m']; if (count($top) < 5 && ($u = dk_user($r['user_id']))) $top[] = array('user' => $u, 'mins' => (int) $r['m']); }
    }
    $can = $viewer && (($owner && (int) $owner['user_id'] === (int) $viewer) || (function_exists('Wo_IsGroupOnwer') && Wo_IsGroupOnwer($g, $viewer)));
    return array('on' => (bool) $goal, 'goal' => $goal ? (int) $goal['minutes'] : 0, 'total' => $total, 'members' => count($ids), 'top' => $top, 'can_edit' => (bool) $can, 'week' => dk_week_start());
}
function dk_set_group_goal($group_id, $viewer, $minutes) {
    $g = dk_group_goal($group_id, $viewer);
    if (!$g['can_edit']) return array('error' => 'Only the group\'s owner can set its goal.');
    $minutes = max(0, min(30000, (int) $minutes));
    if ($minutes === 0) dk_q("DELETE FROM dk_group_goals WHERE group_id = ?", 'i', (int) $group_id);
    else dk_q("INSERT INTO dk_group_goals (group_id, minutes, set_by, updated) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE minutes=VALUES(minutes), set_by=VALUES(set_by), updated=VALUES(updated)",
        'iiii', (int) $group_id, $minutes, (int) $viewer, time());
    return array('ok' => true);
}

/* ---------- share to the feed: a card from Learn becomes a WoWonder post ---------- */
function dk_share_post($user_id, $text, $png_data_url) {
    global $wo;
    if (!function_exists('Wo_RegisterPost')) return array('error' => 'Posting is not available.');
    $text = trim(strip_tags((string) $text));
    if (function_exists('mb_substr')) $text = mb_substr($text, 0, 600, 'UTF-8');
    $file = '';
    if (is_string($png_data_url) && strpos($png_data_url, 'data:image/png;base64,') === 0 && strlen($png_data_url) < 3 * 1024 * 1024) {
        $bin = base64_decode(substr($png_data_url, 22), true);
        if ($bin !== false && substr($bin, 0, 8) === "\x89PNG\r\n\x1a\n" && @imagecreatefromstring($bin)) {
            $dir = 'upload/photos/' . date('Y') . '/' . date('m');
            if (!is_dir($dir)) @mkdir($dir, 0777, true);
            $name = $dir . '/' . bin2hex(random_bytes(10)) . '_' . date('d') . '_drakkhak_image.png';
            if (@file_put_contents($name, $bin)) $file = $name;
        }
    }
    $data = array('user_id' => (int) $user_id, 'postText' => Wo_Secure($text), 'postPrivacy' => '0', 'time' => time(), 'multi_image' => '0');
    if ($file) { $data['postFile'] = $file; $data['postFileName'] = 'drakkhak.png'; }
    $id = Wo_RegisterPost($data);
    if (!$id) return array('error' => 'Could not post.');
    return array('ok' => true, 'id' => (int) $id, 'url' => Wo_SeoLink('index.php?link1=post&id=' . (int) $id));
}

/* ---------- the competitive shop items, bought with Learn coins ---------- */
function dk_use_item($user_id, $item) {
    dk_install();
    $u = (int) $user_id; $now = time();
    dk_q("INSERT IGNORE INTO dk_study (user_id, updated) VALUES (?, ?)", 'ii', $u, $now);
    $st = dk_study($u);
    /* never charge twice for what is already running */
    if ($item === 'spotlight' && (int) $st['spotlight_until'] > $now) return array('error' => 'Your spotlight is already on.');
    if ($item === 'shield' && (int) $st['shield_until'] > $now) return array('error' => 'Your rank shield is already up.');
    if ($item === 'contest' && dk_in_contest($u)) return array('error' => 'You are already in this week\'s contest.');
    if ($item === 'spotlight') { dk_q("UPDATE dk_study SET spotlight_until = ? WHERE user_id = ?", 'ii', $now + 86400, $u); return array('ok' => true, 'until' => $now + 86400); }
    if ($item === 'shield') {
        $b = dk_board_students($u, 0);
        $rank = $b['me'] ? (int) $b['me']['rank'] : 0;
        if (!$rank) return array('error' => 'Study a little this week first: a shield holds a place you already have.');
        dk_q("UPDATE dk_study SET shield_until = ?, shield_rank = ? WHERE user_id = ?", 'iii', $now + 86400, $rank, $u);
        return array('ok' => true, 'rank' => $rank);
    }
    if ($item === 'contest') {
        dk_q("INSERT IGNORE INTO dk_contest (week, user_id, joined) VALUES (?,?,?)", 'sii', dk_week_key(), $u, $now);
        return array('ok' => true, 'week' => dk_week_key());
    }
    return array('error' => 'Unknown item.');
}
function dk_in_contest($user_id) { return (bool) dk_one("SELECT 1 AS x FROM dk_contest WHERE week = ? AND user_id = ?", 'si', dk_week_key(), (int) $user_id); }

/* the people you follow, for a challenge */
function dk_friends($user_id, $limit = 40) {
    $rows = dk_q("SELECT following_id FROM " . T_FOLLOWERS . " WHERE follower_id = ? AND active = '1' LIMIT " . (int) $limit, 'i', (int) $user_id);
    $out = array();
    if (is_array($rows)) foreach ($rows as $r) if ($u = dk_user($r['following_id'])) $out[] = $u;
    return $out;
}
}
