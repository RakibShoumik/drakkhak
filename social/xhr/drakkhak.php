<?php
/* Drakkhak: what Learn asks the community side for.
   requests.php?f=drakkhak&s=<action>. WoWonder has already loaded the
   signed-in user ($wo['user']) and refused anyone who is not signed in, so
   every action here belongs to the person making the request. */
require_once dirname(__DIR__) . '/drakkhak/lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function dk_out($a, $code = 200) { http_response_code($code); echo json_encode($a); exit(); }
if (empty($wo['loggedin']) || empty($wo['user']['user_id'])) dk_out(array('loggedin' => false), 401);

$me = (int) $wo['user']['user_id'];
$in = json_decode((string) file_get_contents('php://input', false, null, 0, DK_RECORD_MAX + 65536), true);
if (!is_array($in)) $in = array();
$post = $_SERVER['REQUEST_METHOD'] === 'POST';
if ($post) {
    /* a write must come from this site's own pages */
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST) : null;
    $host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST']) : '';
    if ($origin && $origin !== $host) dk_out(array('error' => 'origin'), 403);
}
$v = function ($k, $d = '') use ($in) { return isset($in[$k]) ? $in[$k] : (isset($_GET[$k]) ? $_GET[$k] : $d); };
dk_install();

switch ($s) {
case 'me':
    $u = dk_user($me); $p = dk_profile($me);
    dk_out(array('loggedin' => true, 'user' => $u, 'first_name' => $wo['user']['first_name'],
        'profile' => array('college' => $p['college'], 'parent_email' => $p['parent_email'], 'parent_phone' => $p['parent_phone'], 'parent_ok' => (int) $p['parent_ok']),
        'contest' => dk_in_contest($me), 'today' => dk_today(), 'week' => dk_week_start(),
        'messages_url' => Wo_SeoLink('index.php?link1=messages'), 'logout_url' => Wo_SeoLink('index.php?link1=logout')));

case 'sync':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_sync($me, (array) $v('sum', array()), (array) $v('days', array()));
    dk_out(array('ok' => true));

case 'save':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    $data = $v('data');
    if (!dk_save_record($me, is_string($data) ? $data : json_encode($data), (int) $v('answered', 0))) dk_out(array('error' => 'Could not save the record.'), 400);
    dk_out(array('ok' => true, 'updated' => time()));

case 'load':
    $r = dk_load_record($me);
    dk_out($r ? array('ok' => true, 'data' => $r['data'], 'answered' => (int) $r['answered'], 'updated' => (int) $r['updated']) : array('ok' => true, 'data' => null));

case 'college':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_set_college($me, (string) $v('name'));
    $p = dk_profile($me);
    dk_out(array('ok' => true, 'college' => $p['college']));

case 'colleges':
    dk_out(array('ok' => true, 'list' => dk_colleges_like((string) $v('q'))));

/* right after sign-up: the full name (WoWonder only keeps it with auto username on) and the college */
case 'after_signup':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    $first = trim(strip_tags((string) $v('first'))); $last = trim(strip_tags((string) $v('last')));
    $upd = array();
    if ($first !== '' && empty($wo['user']['first_name'])) $upd['first_name'] = Wo_Secure(mb_substr($first, 0, 60, 'UTF-8'), 1);
    if ($last !== '' && empty($wo['user']['last_name'])) $upd['last_name'] = Wo_Secure(mb_substr($last, 0, 60, 'UTF-8'), 1);
    if ($upd) Wo_UpdateUserData($me, $upd);
    if (trim((string) $v('college')) !== '') dk_set_college($me, (string) $v('college'));
    dk_out(array('ok' => true));

case 'board':
    $t = (string) $v('type', 'students');
    if ($t === 'colleges') dk_out(array('ok' => true) + dk_board_colleges($me));
    dk_out(array('ok' => true, 'contest' => $t === 'contest', 'in_contest' => dk_in_contest($me)) + dk_board_students($me, 50, $t === 'contest'));

case 'duel':
    dk_out(array('ok' => true) + dk_duel_view($me));

case 'duel_join':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_out(array('ok' => true) + dk_join_duel($me, (int) $v('size', 1)));

case 'duel_leave':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_leave_queue($me);
    dk_out(array('ok' => true) + dk_duel_view($me));

case 'duel_answer':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_out(dk_answer_challenge($me, (bool) $v('yes')) + dk_duel_view($me));

case 'challenge':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_out(dk_challenge($me, (int) $v('to')));

case 'friends':
    dk_out(array('ok' => true, 'list' => dk_friends($me)));

case 'parent':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_out(dk_set_parent($me, (string) $v('email'), (string) $v('phone'), (bool) $v('consent')));

case 'notify':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    $kind = (string) $v('kind');
    if (!in_array($kind, array('badge', 'level', 'set', 'star'), true)) dk_out(array('error' => 'kind'), 400);
    /* a handful a day at most: the bell is for moments, not for every answer */
    $key = 'dk_notify_' . $me . '_' . dk_today();
    $n = isset($_SESSION[$key]) ? (int) $_SESSION[$key] : 0;
    if ($n >= 8) dk_out(array('ok' => false, 'quiet' => true));
    $_SESSION[$key] = $n + 1;
    $path = (string) $v('path', '/learn');
    if (!preg_match('#^/learn(\#/[a-z]+(/[A-Za-z0-9._-]+)?)?$#', $path)) $path = '/learn';
    dk_out(array('ok' => dk_notify_self($me, (string) $v('text'), $path)));

case 'share':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_out(dk_share_post($me, (string) $v('text'), (string) $v('image')));

case 'item':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_out(dk_use_item($me, (string) $v('item')));

case 'group_goal':
    dk_out(array('ok' => true) + dk_group_goal((int) $v('id'), $me));

case 'group_goal_set':
    if (!$post) dk_out(array('error' => 'POST'), 405);
    dk_out(dk_set_group_goal((int) $v('id'), $me, (int) $v('minutes')) + dk_group_goal((int) $v('id'), $me));
}
dk_out(array('error' => 'Unknown action'), 404);
