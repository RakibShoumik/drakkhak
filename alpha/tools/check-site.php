<?php
/* The defaults live twice: api/_lib.php for the server and js/site.js for a
   visitor who has never reached it. This fails if they drift.
       php tools/check-site.php */
require dirname(__FILE__) . '/../api/_lib.php';
$js = file_get_contents(dirname(__FILE__) . '/../js/site.js');
if (!preg_match('/var DEFAULTS=(\{.*?\n\});/s', $js, $m)) { echo "DEFAULTS not found in js/site.js\n"; exit(1); }
$src = preg_replace("/'((?:[^'\\\\]|\\\\.)*)'/", '"$1"', $m[1]);
$src = preg_replace('/,\s*\}/', '}', $src);
$site = json_decode($src, true);
if (!is_array($site)) { echo "Could not read DEFAULTS\n"; exit(1); }
$bad = 0;
foreach (drk_defaults() as $k => $v) {
  if (in_array($k, drk_private_keys(), true)) continue;
  if (!array_key_exists($k, $site)) { echo "missing in site.js: $k\n"; $bad++; }
  elseif ($site[$k] !== $v) { echo "differs: $k\n"; $bad++; }
}
foreach ($site as $k => $v) if (!array_key_exists($k, drk_defaults())) { echo "missing in _lib.php: $k\n"; $bad++; }
echo $bad ? "$bad problem(s)\n" : "Defaults match.\n";
exit($bad ? 1 : 0);
