<?php
/* College names for the sign-up form's suggestions. Read only, no account. */
require __DIR__ . '/boot.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
$q = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
echo json_encode(array('list' => strlen($q) >= 2 ? dk_colleges_like($q, 10) : array()));
