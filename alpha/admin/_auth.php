<?php
/* The login: a hashed password, a session cookie scripts cannot read, a token
   on every change, and a lock after five wrong tries. */
require_once dirname(__FILE__) . '/../api/_lib.php';

define('DRK_IDLE_SECS', 28800);
define('DRK_MAX_TRIES', 5);
define('DRK_LOCK_SECS', 900);

function drk_base_path() {
  return rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/') . '/';
}
function drk_session() {
  if (session_status() === PHP_SESSION_ACTIVE) return;
  $data = drk_data();
  if ($data) session_save_path($data . '/sessions');
  ini_set('session.use_strict_mode', '1');
  ini_set('session.gc_maxlifetime', (string) DRK_IDLE_SECS);
  session_name('drakkhak_admin');
  $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
  $path = drk_base_path();
  if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params(array('lifetime' => 0, 'path' => $path, 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict'));
  } else {
    session_set_cookie_params(0, $path . '; samesite=Strict', '', $https, true);
  }
  session_start();
  if (!empty($_SESSION['user']) && time() - (int) $_SESSION['seen'] > DRK_IDLE_SECS) {
    $_SESSION = array();
    session_regenerate_id(true);
  }
  if (!empty($_SESSION['user'])) $_SESSION['seen'] = time();
}
function drk_signed_in() {
  drk_session();
  return !empty($_SESSION['user']);
}
function drk_token() {
  drk_session();
  if (empty($_SESSION['token'])) $_SESSION['token'] = bin2hex(random_bytes(24));
  return $_SESSION['token'];
}
function drk_token_ok($t) {
  drk_session();
  return !empty($_SESSION['token']) && is_string($t) && hash_equals($_SESSION['token'], $t);
}

function drk_auth_record() {
  $saved = drk_read_json(drk_data() . '/auth.json', null);
  if ($saved && !empty($saved['user']) && !empty($saved['hash'])) return $saved;
  return require dirname(__FILE__) . '/auth-default.php';
}
function drk_client_key() {
  $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'x';
  return drk_data() . '/throttle/' . sha1($ip) . '.json';
}
/* seconds left on a lock, or 0 */
function drk_locked() {
  $t = drk_read_json(drk_client_key(), array('n' => 0, 'until' => 0));
  return max(0, (int) $t['until'] - time());
}
function drk_login($user, $pass) {
  if (drk_locked()) return false;
  $rec = drk_auth_record();
  $ok = is_string($user) && is_string($pass)
    && hash_equals((string) $rec['user'], $user)
    && password_verify($pass, $rec['hash']);
  $f = drk_client_key();
  if (!$ok) {
    $t = drk_read_json($f, array('n' => 0, 'until' => 0));
    $t['n'] = (int) $t['n'] + 1;
    if ($t['n'] >= DRK_MAX_TRIES) {
      $t = array('n' => 0, 'until' => time() + DRK_LOCK_SECS);
      drk_log('login-locked');
    }
    drk_write_json($f, $t);
    drk_log('login-failed');
    usleep(600000);
    return false;
  }
  @unlink($f);
  drk_session();
  session_regenerate_id(true);
  $_SESSION['user'] = $rec['user'];
  $_SESSION['seen'] = time();
  $_SESSION['token'] = bin2hex(random_bytes(24));
  drk_log('login');
  return true;
}
function drk_logout() {
  drk_session();
  $_SESSION = array();
  session_destroy();
}
function drk_security_headers() {
  header('X-Frame-Options: DENY');
  header('X-Content-Type-Options: nosniff');
  header('Referrer-Policy: same-origin');
  header('X-Robots-Tag: noindex, nofollow');
  header('Cache-Control: no-store');
  header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
}
