<?php
/* The login page, or the panel once signed in. The panel itself is admin.js. */
require dirname(__FILE__) . '/_auth.php';
drk_security_headers();
header('Content-Type: text/html; charset=utf-8');
$in = drk_data() && drk_signed_in();
$v = (string) max(filemtime(dirname(__FILE__) . '/admin.js'), filemtime(dirname(__FILE__) . '/admin.css'), filemtime(dirname(__FILE__) . '/login.js'));
?><!DOCTYPE html>
<html lang="en" data-theme="day">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Drakkhak Control</title>
<link rel="icon" href="../img/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<link rel="stylesheet" href="admin.css?v=<?php echo $v; ?>">
</head>
<body class="<?php echo $in ? 'in' : 'out'; ?>" data-token="<?php echo $in ? htmlspecialchars(drk_token(), ENT_QUOTES) : ''; ?>">
<?php if (!drk_data()) { ?>
<main class="login"><div class="lcard"><h1>Drakkhak Control</h1><p class="lerr">The server would not let this site create its data folder. Check folder permissions in cPanel, then reload.</p></div></main>
<?php } elseif (!$in) { ?>
<main class="login">
  <form class="lcard" id="loginForm" autocomplete="on">
    <img src="../img/logo.svg" alt="" width="52" height="52">
    <span class="kick">Owner's room</span>
    <h1>Drakkhak Control</h1>
    <label>Username<input id="lu" name="username" autocomplete="username" required autofocus></label>
    <label>Password<input id="lp" name="password" type="password" autocomplete="current-password" required></label>
    <p class="lerr" id="lerr" role="alert" hidden></p>
    <button class="btn pri big" type="submit" id="lgo">Sign in</button>
  </form>
</main>
<script src="login.js?v=<?php echo $v; ?>"></script>
<?php } else { ?>
<div id="root"></div>
<script src="../js/data/registry.js?v=<?php echo $v; ?>"></script>
<script src="../js/data/ssc-registry.js?v=<?php echo $v; ?>"></script>
<script src="admin.js?v=<?php echo $v; ?>"></script>
<?php } ?>
</body>
</html>
