<?php
/* The link in the parent's email: confirm the nightly report, or stop it.
   It needs no account: the long random token in the link is the key.
   Opening the link only asks; the button does it, so a mail scanner that
   opens every link cannot say yes (or no) for the parent. */
require __DIR__ . '/boot.php';
$t = isset($_REQUEST['t']) ? preg_replace('/[^a-f0-9]/', '', (string) $_REQUEST['t']) : '';
$do = isset($_REQUEST['do']) && $_REQUEST['do'] === 'stop' ? 'stop' : 'ok';
$post = $_SERVER['REQUEST_METHOD'] === 'POST';
$msg = 'This link is not valid any more.'; $form = '';
if (strlen($t) === 32) {
    dk_install();
    $p = dk_one("SELECT user_id, parent_ok FROM dk_profile WHERE parent_token = ?", 's', $t);
    if ($p) {
        $u = dk_user($p['user_id']);
        $name = htmlspecialchars($u ? $u['name'] : 'the student');
        if (!$post) {
            $msg = $do === 'ok'
                ? "{$name} asked for a short email each night with their active study time and the number of questions they answered. Nothing else is shared."
                : "Stop the nightly study report for {$name}?";
            $form = '<form method="post"><input type="hidden" name="t" value="' . $t . '"><input type="hidden" name="do" value="' . $do . '">' .
                    '<button type="submit">' . ($do === 'ok' ? 'Yes, send me the report' : 'Stop the reports') . '</button></form>';
        } elseif ($do === 'ok') {
            dk_q("UPDATE dk_profile SET parent_ok = 1 WHERE user_id = ?", 'i', (int) $p['user_id']);
            $msg = "Thank you. You will get a short report of {$name}'s study time each night at about 9:30 pm.";
        } else {
            dk_q("UPDATE dk_profile SET parent_ok = 0, parent_email = '', parent_token = '' WHERE user_id = ?", 'i', (int) $p['user_id']);
            $msg = "Done. No more reports will be sent.";
        }
    }
}
$site = htmlspecialchars($wo['config']['siteName']);
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex');
echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' . $site . '</title>' .
     '<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F5F4ED;color:#141413;font:17px/1.6 system-ui,sans-serif}' .
     'main{max-width:480px;margin:24px;padding:28px;border:1px solid #E0DDD2;border-radius:16px;background:#FAF9F5}a{color:#C6613F}' .
     'button{font:600 16px system-ui,sans-serif;padding:12px 20px;border:0;border-radius:12px;background:#D97757;color:#FFF8F2;cursor:pointer}</style></head><body><main>' .
     '<p>' . $msg . '</p>' . $form . '<p><a href="' . htmlspecialchars($wo['config']['site_url']) . '">' . $site . '</a></p></main></body></html>';
