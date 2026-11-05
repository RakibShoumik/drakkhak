<?php
/* Drakkhak: /learn, Learn inside the site's own frame.
   Signed in: the site's header, bell, messages and chat, with Learn below.
   Not signed in: Learn on its own (no account needed to practise). */
if ($wo['loggedin'] == false) {
    header('Location: ' . rtrim($wo['config']['site_url'], '/') . '/learn-app/');
    exit();
}
$wo['description'] = 'MCQ practice for every HSC and SSC paper, a map of the whole syllabus, rankings and daily study duels.';
$wo['keywords']    = 'HSC, SSC, MCQ, practice, Drakkhak';
$wo['page']        = 'learn';
$wo['title']       = 'Learn | ' . $wo['config']['siteTitle'];
$wo['content']     = Wo_LoadPage('learn/content');
