<?php
/* Drakkhak: is a username free? The sign-up form asks while you type your
   name, and gets back the name itself or the first free one with a number
   added (rakib, rakib1, rakib2, ...). It only reads; it never creates an
   account. Usernames, pages and groups share one address space in WoWonder,
   so all three are checked. */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$u = isset($_GET['u']) ? strtolower((string) $_GET['u']) : '';
$u = preg_replace('/[^a-z0-9_]/', '', $u);
$u = substr($u, 0, 26);
if (strlen($u) < 5) { echo json_encode(array('ok' => false)); exit; }

/* themes/<this theme>/dk/username.php -> the site root */
$root = dirname(dirname(dirname(dirname(__FILE__))));
if (!is_file($root . '/assets/init.php')) { echo json_encode(array('ok' => false)); exit; }
chdir($root);
ob_start();
require_once $root . '/assets/init.php';
ob_end_clean();
header('Content-Type: application/json; charset=utf-8');

if (empty($sqlConnect) || !($sqlConnect instanceof mysqli)) { echo json_encode(array('ok' => false)); exit; }

function dk_taken($db, $name) {
  $checks = array(
    array(defined('T_USERS') ? T_USERS : 'Wo_Users', 'username'),
    array(defined('T_PAGES') ? T_PAGES : 'Wo_Pages', 'page_name'),
    array(defined('T_GROUPS') ? T_GROUPS : 'Wo_Groups', 'group_name'),
  );
  foreach ($checks as $c) {
    $st = @$db->prepare('SELECT 1 FROM `' . $c[0] . '` WHERE `' . $c[1] . '` = ? LIMIT 1');
    if (!$st) continue;
    $st->bind_param('s', $name);
    $st->execute();
    $st->store_result();
    $hit = $st->num_rows > 0;
    $st->close();
    if ($hit) return true;
  }
  return false;
}

$name = $u;
for ($i = 1; $i <= 60 && dk_taken($sqlConnect, $name); $i++) {
  $name = $u . ($i < 50 ? $i : mt_rand(100, 9999));
}
if (dk_taken($sqlConnect, $name)) { echo json_encode(array('ok' => false)); exit; }
echo json_encode(array('ok' => true, 'name' => $name, 'taken' => $name !== $u));
