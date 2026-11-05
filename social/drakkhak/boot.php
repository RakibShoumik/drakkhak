<?php
/* Load WoWonder from this folder (the site root is one level up). */
chdir(dirname(__DIR__));
ob_start();
require_once dirname(__DIR__) . '/assets/init.php';
ob_end_clean();
require_once __DIR__ . '/lib.php';
