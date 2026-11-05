<?php
/* The nightly job: decide yesterday's duels and send the parents' reports.
   cPanel > Cron Jobs, once a day at 9:30 pm Bangladesh time, e.g.
     30 21 * * *  php /home/YOURUSER/public_html/drakkhak/cron.php
   (if the server clock is not Bangladesh time, 30 15 * * * is 9:30 pm in Dhaka).
   It can also be opened in a browser with ?key= followed by the key printed
   in the admin notes (see README.md). */
$cli = php_sapi_name() === 'cli';
require __DIR__ . '/boot.php';
if (!$cli) {
    $key = substr(hash('sha256', (isset($siteEncryptKey) ? $siteEncryptKey : '') . 'drakkhak-cron'), 0, 24);
    if (!isset($_GET['key']) || !hash_equals($key, (string) $_GET['key'])) { http_response_code(403); exit('key'); }
}
dk_install();
dk_settle_duels();
$sent = dk_parent_reports();
echo 'duels settled; reports sent: ' . $sent . "\n";
